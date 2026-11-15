"""Bounded, offline learned-decoder experiment. No test-driven model selection."""
from __future__ import annotations

import copy
import hashlib
import importlib.metadata
import json
import math
import os
import platform
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

# Bounded CPU work, set before importing numerical libraries.
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("MPLCONFIGDIR", "/tmp/syndrome-matplotlib")

import numpy as np
import pymatching
import stim
from sklearn.metrics import log_loss
from sklearn.neural_network import MLPClassifier
from threadpoolctl import threadpool_limits

ROOT = Path(__file__).resolve().parents[2]
EXP = ROOT / "experiments"
RESULTS = ROOT / "results"


def circuit(p: float, cfg: dict, no_noise: bool = False) -> stim.Circuit:
    q = 0 if no_noise else cfg["otherNoise"]
    return stim.Circuit.generated(
        "surface_code:rotated_memory_z", distance=cfg["distance"], rounds=cfg["rounds"],
        after_clifford_depolarization=q, before_round_data_depolarization=q,
        after_reset_flip_probability=q, before_measure_flip_probability=0 if no_noise else p,
    )


def sample(c: stim.Circuit, shots: int, seed: int) -> tuple[np.ndarray, np.ndarray]:
    x, y = c.compile_detector_sampler(seed=seed).sample(shots, separate_observables=True)
    assert x.shape == (shots, c.num_detectors) and y.shape == (shots, 1)
    assert x.dtype == y.dtype == np.bool_
    return x.astype(np.float32), y[:, 0].astype(np.uint8)


def matcher(c: stim.Circuit) -> pymatching.Matching:
    # Standard graphlike decomposition; correlations between decomposed edges
    # are not enabled in this baseline. No approximation flag is silently set.
    return pymatching.Matching.from_detector_error_model(c.detector_error_model(decompose_errors=True))


def decode(m: pymatching.Matching, x: np.ndarray) -> np.ndarray:
    result = m.decode_batch(x.astype(np.uint8))
    assert result.shape == (len(x), 1)
    return result[:, 0].astype(np.uint8)


def wilson(failures: int, shots: int) -> list[float]:
    z = 1.959963984540054
    p = failures / shots
    denom = 1 + z * z / shots
    center = (p + z * z / (2 * shots)) / denom
    half = z * math.sqrt(p * (1 - p) / shots + z * z / (4 * shots**2)) / denom
    return [max(0.0, center - half), min(1.0, center + half)]


def error_metrics(prediction: np.ndarray, labels: np.ndarray) -> dict:
    failures = int(np.count_nonzero(prediction != labels))
    return {"failures": failures, "shots": len(labels), "errorRate": failures / len(labels), "ci95": wilson(failures, len(labels))}


def probability_metrics(prob: np.ndarray, labels: np.ndarray, bins: int) -> dict:
    out = error_metrics((prob >= 0.5).astype(np.uint8), labels)
    out["brier"] = float(np.mean((prob - labels) ** 2))
    reliability = []
    for k in range(bins):
        low, high = k / bins, (k + 1) / bins
        mask = (prob >= low) & ((prob < high) if k < bins - 1 else (prob <= high))
        count = int(mask.sum())
        reliability.append({"lower": low, "upper": high, "count": count,
                            "meanPrediction": float(prob[mask].mean()) if count else None,
                            "observedFrequency": float(labels[mask].mean()) if count else None})
    out["reliability"] = reliability
    return out


def train(x: np.ndarray, y: np.ndarray, vx: np.ndarray, vy: np.ndarray, seed: int, cfg: dict):
    model = MLPClassifier(hidden_layer_sizes=tuple(cfg["hiddenLayers"]), activation="relu", solver="adam",
                          batch_size=cfg["batchSize"], learning_rate_init=cfg["learningRate"],
                          alpha=cfg["l2"], random_state=seed, shuffle=True)
    best, best_loss, best_epoch, stale = None, math.inf, 0, 0
    history = []
    started = time.perf_counter()
    for epoch in range(1, cfg["maxEpochs"] + 1):
        model.partial_fit(x, y, classes=np.array([0, 1]))
        loss = float(log_loss(vy, model.predict_proba(vx), labels=[0, 1]))
        history.append(loss)
        if loss < best_loss - 1e-6:
            best, best_loss, best_epoch, stale = copy.deepcopy(model), loss, epoch, 0
        else:
            stale += 1
        if stale >= cfg["patience"]:
            break
    assert best is not None
    return best, {"seed": seed, "epochsExecuted": len(history), "selectedEpoch": best_epoch,
                  "validationLogLoss": best_loss, "validationLogLossByEpoch": history,
                  "trainingSeconds": time.perf_counter() - started}


def semantics(c: stim.Circuit) -> dict:
    flat = c.flattened()
    data_ids, ancilla_ids, h_ids = set(), set(), set()
    for op in flat:
        ids = {t.value for t in op.targets_copy() if t.is_qubit_target}
        if op.name == "M":
            data_ids.update(ids)
        if op.name == "MR":
            ancilla_ids.update(ids)
        if op.name == "H":
            h_ids.update(ids)
    qubits = [{"id": q, "coordinates": xy, "role": "data" if q in data_ids else "measurement",
               "checkBasis": None if q in data_ids else ("X" if q in h_ids else "Z")}
              for q, xy in c.get_final_qubit_coordinates().items()]
    detector_ops = [op for op in flat if op.name == "DETECTOR"]
    detectors = [{"id": k, "coordinates": coords,
                  "boundary": "initial" if coords[2] == 0 else "final" if coords[2] == 3 else "interior",
                  "measurementRecordOffsets": [t.value for t in detector_ops[k].targets_copy()]}
                 for k, coords in c.get_detector_coordinates().items()]
    return {"qubits": qubits, "detectors": detectors,
            "observable": {"id": 0, "description": "Parity of final Z measurements on data qubits 1, 3, 5, relative to the noiseless reference"},
            "input": {"dtype": "float32 binary", "shape": [None, c.num_detectors], "ordering": "Stim detector index; no guessed lattice reshape"}}


def write_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, allow_nan=False) + "\n")


def run():
    cfg_path = EXP / "configs" / "d3.json"
    cfg = json.loads(cfg_path.read_text())
    started = time.perf_counter()
    run_id = "d3-memory-z-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    ctrain = circuit(cfg["trainMeasurementNoise"], cfg)
    metadata = semantics(ctrain)
    # Pilot: no-noise sanity, then a small nonzero-noise sample and both decoders.
    zx, zy = sample(circuit(0, cfg, no_noise=True), 256, 40001)
    assert not zx.any() and not zy.any()
    fixed = matcher(ctrain)
    assert not decode(fixed, zx).any()
    px, py = sample(ctrain, 512, 40002)
    pilot_start = time.perf_counter()
    pilot, pilot_info = train(px[:384], py[:384], px[384:], py[384:], 100, {**cfg, "maxEpochs": 2})
    assert pilot.predict_proba(px).shape == (512, 2)
    assert decode(fixed, px).shape == (512,)
    print(json.dumps({"pilot": "passed", "seconds": time.perf_counter() - pilot_start,
                      "detectors": ctrain.num_detectors, "observables": ctrain.num_observables}), flush=True)
    x, y = sample(ctrain, cfg["trainShots"], cfg["trainDataSeed"])
    vx, vy = sample(ctrain, cfg["validationShots"], cfg["validationDataSeed"])
    models, training = [], []
    for seed in cfg["modelSeeds"]:
        model, info = train(x, y, vx, vy, seed, cfg)
        models.append(model)
        training.append(info)
        print(json.dumps({"training": info}), flush=True)
    conditions, traces = [], []
    for idx, p in enumerate(cfg["measurementNoiseSweep"]):
        c = circuit(p, cfg)
        tx, ty = sample(c, cfg["testShots"], cfg["testDataSeeds"][idx])
        fixed_pred, matched_pred = decode(fixed, tx), decode(matcher(c), tx)
        probs = [m.predict_proba(tx)[:, 1] for m in models]
        seed_metrics = [{"seed": seed, **probability_metrics(pr, ty, cfg["calibrationBins"])}
                        for seed, pr in zip(cfg["modelSeeds"], probs)]
        neural = {**seed_metrics[0], "seeds": seed_metrics,
                  "meanErrorRateAcrossSeeds": float(np.mean([s["errorRate"] for s in seed_metrics])),
                  "sdErrorRateAcrossSeeds": float(np.std([s["errorRate"] for s in seed_metrics], ddof=1))}
        conditions.append({"measurementNoise": p, "testDataSeed": cfg["testDataSeeds"][idx], "shots": len(ty),
                           "neural": neural, "fixedMatching": error_metrics(fixed_pred, ty),
                           "matchedMatching": error_metrics(matched_pred, ty)})
        for j in range(cfg["representativeShotsPerCondition"]):
            traces.append({"id": f"p{p}-shot{j}", "measurementNoise": p, "shotIndex": j,
                           "detectionEvents": tx[j].astype(int).tolist(), "observable": int(ty[j]),
                           "neuralProbability": float(probs[0][j]), "neuralPrediction": int(probs[0][j] >= 0.5),
                           "fixedPrediction": int(fixed_pred[j]), "matchedPrediction": int(matched_pred[j])})
        print(json.dumps({"condition": p, "neuralError": neural["errorRate"], "fixed": conditions[-1]["fixedMatching"]["errorRate"], "matched": conditions[-1]["matchedMatching"]["errorRate"]}), flush=True)
    # CPU prediction timing only: warmed, batch 1024, 30 repeats, thread limit 1.
    batch = tx[:1024]
    models[0].predict_proba(batch)
    timings = []
    for _ in range(30):
        t = time.perf_counter()
        models[0].predict_proba(batch)
        timings.append(time.perf_counter() - t)
    timing = {"scope": "scikit-learn predict_proba only; excludes sampling, file I/O and browser replay", "batchSize": len(batch),
              "repeats": len(timings), "threads": 1, "medianBatchMs": 1000 * float(np.median(timings)),
              "medianMicrosecondsPerShotAmortized": 1e6 * float(np.median(timings)) / len(batch),
              "hardware": platform.platform(), "cpu": platform.processor() or "see manifest /proc/cpuinfo model", "warmup": "one call"}
    parameter_count = sum(a.size for a in models[0].coefs_) + sum(a.size for a in models[0].intercepts_)
    study = {"schemaVersion": 1, "runId": run_id, "status": "completed-bounded-study", "config": cfg,
             **metadata, "model": {"architecture": [ctrain.num_detectors, *cfg["hiddenLayers"], 1], "activation": "ReLU hidden; logistic output",
                                    "parameterCount": parameter_count, "seeds": cfg["modelSeeds"], "reportedSeed": cfg["modelSeeds"][0],
                                    "selection": "minimum validation log loss, patience 8, threshold fixed 0.5", "training": training},
             "conditions": conditions, "timing": timing, "manifestPath": f"research/experiments/manifests/{run_id}.json"}
    write_json(RESULTS / "aggregates" / "study.json", study)
    write_json(RESULTS / "representative-traces" / "traces.json", {"schemaVersion": 1, "runId": run_id,
                "selection": "First eight test shots at each condition; not selected by outcomes. Neural outcomes use seed 101.", "traces": traces})
    (EXP / "manifests" / "training-circuit.stim").write_text(str(ctrain) + "\n")
    (EXP / "manifests" / "training-model.dem").write_text(str(ctrain.detector_error_model(decompose_errors=True)) + "\n")
    versions = {p: importlib.metadata.version(p) for p in ["stim", "pymatching", "numpy", "scikit-learn", "scipy", "threadpoolctl"]}
    cpu = next((line.split(":", 1)[1].strip() for line in Path("/proc/cpuinfo").read_text().splitlines() if line.startswith("model name")), "unknown")
    source_hash = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    git = lambda *args: subprocess.check_output(["git", *args], cwd=ROOT.parent, text=True).strip()
    manifest = {"runId": run_id, "sourceCodeCommit": git("rev-parse", "HEAD"), "workingTreeDirty": bool(git("status", "--porcelain")),
                "sourceScriptSha256": source_hash, "configurationSha256": hashlib.sha256(cfg_path.read_bytes()).hexdigest(),
                "packageVersions": versions, "executionDateUTC": datetime.now(timezone.utc).isoformat(),
                "python": platform.python_version(), "hardware": {"platform": platform.platform(), "cpu": cpu, "threads": 1, "gpu": "none"},
                "randomSeeds": {"train": cfg["trainDataSeed"], "validation": cfg["validationDataSeed"], "test": cfg["testDataSeeds"], "models": cfg["modelSeeds"]},
                "datasetGeneration": "Stim circuit-level rotated_memory_z detector sampler; independent seeds per split and condition",
                "splitDefinitions": {"train": "40000 shared training shots at p_m=.005", "validation": "8000 disjoint validation shots at p_m=.005 used only for checkpoint selection", "test": "20000 disjoint final test shots at each p_m; same shots across decoders and model seeds"},
                "modelArchitecture": study["model"], "objective": "binary cross entropy/log loss, unweighted", "optimizer": {"name": "Adam", "learningRate": cfg["learningRate"], "batchSize": cfg["batchSize"], "l2": cfg["l2"], "threshold": 0.5},
                "baselineSettings": {"algorithm": "PyMatching MWPM", "fixedPrior": "training DEM p_m=.005", "matchedPrior": "each evaluation DEM; oracle knowledge of test noise parameters", "decomposeErrors": True, "correlationsEnabled": False, "approximateDisjointErrors": False},
                "sampleCounts": {"train": len(y), "validation": len(vy), "testPerCondition": cfg["testShots"], "conditions": len(conditions)},
                "outputFiles": ["research/results/aggregates/study.json", "research/results/representative-traces/traces.json", "research/experiments/manifests/training-circuit.stim", "research/experiments/manifests/training-model.dem"],
                "completionStatus": "completed", "wallSeconds": time.perf_counter() - started, "pilot": {"status": "passed", "shots": 512, "trainingEpochs": 2}}
    write_json(EXP / "manifests" / f"{run_id}.json", manifest)
    print(json.dumps({"completed": run_id, "seconds": manifest["wallSeconds"], "parameters": parameter_count}), flush=True)


if __name__ == "__main__":
    with threadpool_limits(limits=1):
        run()
