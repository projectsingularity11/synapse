"""Prospectively specified equal-budget training-noise follow-up; CPU bounded."""
import hashlib
import json
import platform
import signal
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

import run as original
import numpy as np
from threadpoolctl import threadpool_limits


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def checkpoint_payload(model, seed, training_noise):
    return {"seed": seed, "trainingMeasurementNoise": training_noise, "architecture": [24, 32, 16, 1],
            "activation": "relu", "outputActivation": "logistic", "dtype": "float32",
            "coefs": [a.tolist() for a in model.coefs_], "intercepts": [a.tolist() for a in model.intercepts_]}


def payload_hash(payload):
    return hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def paired(fixed, matched, truth):
    fc, mc = fixed == truth, matched == truth
    return {"bothCorrect": int(np.count_nonzero(fc & mc)),
            "fixedOnlyCorrect": int(np.count_nonzero(fc & ~mc)),
            "matchedOnlyCorrect": int(np.count_nonzero(~fc & mc)),
            "bothWrong": int(np.count_nonzero(~fc & ~mc))}


def verify_config(cfg):
    assert cfg["distance"] == 3 and cfg["basis"] == "Z" and cfg["rounds"] == 3
    assert cfg["trainMeasurementNoise"] == .005 and cfg["threshold"] == .5
    assert cfg["trainShots"] == 40000 and cfg["validationShots"] == 8000 and cfg["testShots"] == 100000
    seeds = cfg["trainDataSeeds"] + cfg["validationDataSeeds"] + cfg["testDataSeeds"]
    assert len(seeds) == len(set(seeds)) == 12
    prior = {41001, 42001, 43001, 43002, 43003, 43004, 53001, 53002, 53003, 53004, 40001, 40002}
    assert not prior.intersection(seeds)
    assert cfg["modelSeeds"] == [101, 202, 303]
    assert cfg["hiddenLayers"] == [32, 16] and cfg["maxEpochs"] == 40 and cfg["patience"] == 8


def main():
    started = time.perf_counter()
    cfg_path = original.EXP / "configs/training-control.json"
    protocol_path = original.EXP / "configs/training-control-protocol.md"
    cfg = json.loads(cfg_path.read_text())
    verify_config(cfg)
    parent_path = original.RESULTS / "aggregates/study.json"
    parent = json.loads(parent_path.read_text())
    assert parent["runId"] == cfg["parentRunId"]
    parent_manifest = json.loads((original.ROOT.parent / parent["manifestPath"]).read_text())
    assert sha256(Path(original.__file__)) == parent_manifest["sourceScriptSha256"]
    for package, version in parent_manifest["packageVersions"].items():
        assert original.importlib.metadata.version(package) == version
    git = lambda *args: subprocess.check_output(["git", *args], cwd=original.ROOT.parent, text=True).strip()
    source_commit = git("rev-parse", "HEAD")
    for p in [cfg_path, protocol_path, Path(__file__)]:
        rel = str(p.relative_to(original.ROOT.parent))
        committed = subprocess.check_output(["git", "show", f"{source_commit}:{rel}"], cwd=original.ROOT.parent)
        assert hashlib.sha256(committed).hexdigest() == sha256(p), f"Uncommitted source/protocol: {rel}"
    run_id = parent["runId"] + "-training-control-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    manifest_rel = f"research/experiments/manifests/{run_id}.json"
    checkpoint_rel = f"research/experiments/manifests/{run_id}-checkpoints.json"
    def timeout(signum, frame):
        raise TimeoutError("Training-control study exceeded prospective120-second bound")
    signal.signal(signal.SIGALRM, timeout)
    signal.alarm(cfg["maximumRuntimeSeconds"])
    groups, models, checkpoints, conditions = [], {}, [], []
    status, failure = "completed", None
    all_frozen_at, tests_started_at = None, None
    try:
        # No final-test samples are drawn anywhere in this loop.
        for p, train_seed, val_seed in zip(cfg["measurementNoiseSweep"], cfg["trainDataSeeds"], cfg["validationDataSeeds"]):
            c = original.circuit(p, cfg)
            x, y = original.sample(c, cfg["trainShots"], train_seed)
            vx, vy = original.sample(c, cfg["validationShots"], val_seed)
            infos, fitted = [], []
            for seed in cfg["modelSeeds"]:
                model, info = original.train(x, y, vx, vy, seed, cfg)
                assert sum(a.size for a in model.coefs_ + model.intercepts_) == 1345
                payload = checkpoint_payload(model, seed, p)
                infos.append({**info, "checkpointSha256": payload_hash(payload)})
                fitted.append(model)
                checkpoints.append(payload)
            models[p] = fitted
            groups.append({"measurementNoise": p, "trainDataSeed": train_seed, "validationDataSeed": val_seed,
                           "trainShots": len(y), "validationShots": len(vy), "models": infos})
            print(json.dumps({"trainedGroup": p, "selectedEpochs": [i["selectedEpoch"] for i in infos]}), flush=True)
        checkpoint_path = original.ROOT.parent / checkpoint_rel
        original.write_json(checkpoint_path, {"runId": run_id, "purpose": "Offline model provenance only; not for browser inference", "checkpoints": checkpoints})
        # Checkpoint file exists and its hash is frozen before any test sampling.
        checkpoint_file_hash = sha256(checkpoint_path)
        all_frozen_at = datetime.now(timezone.utc).isoformat()
        fixed_models = models[cfg["trainMeasurementNoise"]]
        fixed_matching = original.matcher(original.circuit(cfg["trainMeasurementNoise"], cfg))
        tests_started_at = datetime.now(timezone.utc).isoformat()
        for p, test_seed in zip(cfg["measurementNoiseSweep"], cfg["testDataSeeds"]):
            c = original.circuit(p, cfg)
            x, truth = original.sample(c, cfg["testShots"], test_seed)
            seed_results = []
            for seed, fixed_model, matched_model in zip(cfg["modelSeeds"], fixed_models, models[p]):
                fp = fixed_model.predict_proba(x)[:, 1]
                # In-distribution condition uses identical object/output by construction.
                mp = fp if fixed_model is matched_model else matched_model.predict_proba(x)[:, 1]
                fmetrics = original.probability_metrics(fp, truth, cfg["calibrationBins"])
                mmetrics = original.probability_metrics(mp, truth, cfg["calibrationBins"])
                pair = paired((fp >= .5).astype(np.uint8), (mp >= .5).astype(np.uint8), truth)
                if p == cfg["trainMeasurementNoise"]:
                    assert fixed_model is matched_model and fmetrics == mmetrics
                    assert pair["fixedOnlyCorrect"] == pair["matchedOnlyCorrect"] == 0
                seed_results.append({"seed": seed, "fixedTraining": fmetrics, "matchedTraining": mmetrics,
                                     "paired": pair, "errorDifferenceMatchedMinusFixed": mmetrics["errorRate"] - fmetrics["errorRate"]})
            conditions.append({"measurementNoise": p, "testDataSeed": test_seed, "shots": len(truth), "seeds": seed_results,
                               "fixedMatching": original.error_metrics(original.decode(fixed_matching, x), truth),
                               "matchedMatching": original.error_metrics(original.decode(original.matcher(c), x), truth)})
            print(json.dumps({"evaluatedNoise": p, "seedFailures": [{"seed": r["seed"], "fixed": r["fixedTraining"]["failures"], "matched": r["matchedTraining"]["failures"]} for r in seed_results]}), flush=True)
        assert sha256(checkpoint_path) == checkpoint_file_hash
    except Exception as e:
        status, failure = "incomplete", repr(e)
    finally:
        signal.alarm(0)
    output_rel = "research/results/aggregates/training-control.json"
    output_path = original.ROOT.parent / output_rel
    if status == "completed":
        original.write_json(output_path, {"schemaVersion": 1, "runId": run_id, "parentRunId": parent["runId"], "purpose": cfg["purpose"],
            "status": "completed-exploratory-training-control", "config": cfg,
            "model": {"architecture": [24, 32, 16, 1], "parameterCount": 1345, "seeds": cfg["modelSeeds"], "selection": "Each model minimum validation log loss only, same fixed rule and budgets"},
            "trainingGroups": groups, "conditions": conditions, "manifestPath": manifest_rel,
            "limitations": "One train/validation data realization per setting; three initialization/shuffling seeds, common test shots. Not300000 independent test shots per setting, not a universal causal mismatch decomposition."})
    sources = [Path(__file__), Path(original.__file__), cfg_path, protocol_path, parent_path]
    manifest = {"runId": run_id, "parentRunId": parent["runId"], "sourceCodeCommit": source_commit,
        "protocolCommittedBeforeFreshLabels": True, "workingTreeDirty": bool(git("status", "--porcelain")),
        "executionDateUTC": datetime.now(timezone.utc).isoformat(), "allCheckpointsFrozenAtUTC": all_frozen_at, "testGenerationStartedAtUTC": tests_started_at,
        "sourceAndInputHashes": {str(p.relative_to(original.ROOT.parent)): sha256(p) for p in sources},
        "packageVersions": {p: original.importlib.metadata.version(p) for p in ["stim", "pymatching", "numpy", "scikit-learn", "scipy", "threadpoolctl"]},
        "hardware": {"platform": platform.platform(), "cpu": next((line.split(":", 1)[1].strip() for line in Path("/proc/cpuinfo").read_text().splitlines() if line.startswith("model name")), "unknown"), "threads": 1, "gpu": "none"},
        "datasetGeneration": "Unchanged Stim rotated_memory_z generator; four train and validation noise groups, disjoint streams; common100k fresh test shots per eval noise across all compared models/baselines",
        "randomSeeds": {"train": cfg["trainDataSeeds"], "validation": cfg["validationDataSeeds"], "test": cfg["testDataSeeds"], "initializationAndShuffling": cfg["modelSeeds"]},
        "splitDefinitions": "40k train and8k validation each noise. All12 validation-selected models frozen before test generation. p=.005 fixed/matched share same models by construction.",
        "modelArchitecture": [24, 32, 16, 1], "optimizer": {"name": "Adam", "objective": "unweighted binary cross entropy", "learningRate": cfg["learningRate"], "batchSize": cfg["batchSize"], "l2": cfg["l2"], "maxEpochs": cfg["maxEpochs"], "patience": cfg["patience"], "threshold": cfg["threshold"]},
        "baselineSettings": "Fixed0.005 DEM and oracle eval-noise DEM, decompose_errors=True, uncorrelated MWPM; no changed baseline settings",
        "sampleCounts": {"trainPerGroup": cfg["trainShots"], "validationPerGroup": cfg["validationShots"], "trainingGroupsCompleted": len(groups), "testPerCondition": cfg["testShots"], "conditionsCompleted": len(conditions)},
        "completionStatus": status, "failure": failure, "wallSeconds": time.perf_counter() - started,
        "outputFiles": [output_rel, checkpoint_rel] if status == "completed" else [],
        "outputHashes": {output_rel: sha256(output_path), checkpoint_rel: sha256(original.ROOT.parent / checkpoint_rel)} if status == "completed" else {}}
    original.write_json(original.ROOT.parent / manifest_rel, manifest)
    if status != "completed":
        raise RuntimeError(f"Training control incomplete; see{manifest_rel}: {failure}")
    print(json.dumps({"runId": run_id, "status": status, "seconds": manifest["wallSeconds"]}), flush=True)


if __name__ == "__main__":
    with threadpool_limits(limits=1):
        main()
