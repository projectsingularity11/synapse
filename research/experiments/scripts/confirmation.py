"""Fresh-shot confirmation of a frozen model; no fitting or model selection."""
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
from scipy.special import expit
from threadpoolctl import threadpool_limits


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def frozen_probability(features, checkpoint):
    assert features.ndim == 2 and features.shape[1] == 24
    a = np.asarray(features, dtype=np.float32)
    for layer, (weights, bias) in enumerate(zip(checkpoint["coefs"], checkpoint["intercepts"])):
        a = a @ np.asarray(weights, dtype=np.float32)
        a += np.asarray(bias, dtype=np.float32)
        if layer == len(checkpoint["coefs"]) - 1:
            expit(a, out=a)
        else:
            np.maximum(a, 0, out=a)
    assert a.shape == (len(features), 1) and np.isfinite(a).all()
    return a[:, 0]


def verify_inputs(cfg, study, checkpoint):
    assert cfg["parentRunId"] == study["runId"] == checkpoint["parentRunId"]
    assert sha256(original.ROOT.parent / cfg["checkpointPath"]) == cfg["checkpointSha256"]
    old_seeds = {study["config"]["trainDataSeed"], study["config"]["validationDataSeed"],
                 *study["config"]["testDataSeeds"], *study["config"]["modelSeeds"], 100, 40001, 40002}
    assert not old_seeds.intersection(cfg["testDataSeeds"])
    assert len(set(cfg["testDataSeeds"])) == len(cfg["measurementNoiseSweep"])
    assert cfg["threshold"] == study["config"]["threshold"] == .5
    assert checkpoint["seed"] == cfg["modelSeed"] == 101
    assert checkpoint["architecture"] == [24, 32, 16, 1]
    assert checkpoint["activation"] == "relu" and checkpoint["outputActivation"] == "logistic"
    assert sum(np.asarray(w).size for w in checkpoint["coefs"] + checkpoint["intercepts"]) == 1345
    for key in ["distance", "basis", "rounds", "otherNoise", "trainMeasurementNoise", "measurementNoiseSweep", "calibrationBins"]:
        assert cfg[key] == study["config"][key]
    parent_manifest = json.loads((original.ROOT.parent / study["manifestPath"]).read_text())
    assert sha256(Path(original.__file__)) == parent_manifest["sourceScriptSha256"]
    for package, version in parent_manifest["packageVersions"].items():
        assert original.importlib.metadata.version(package) == version
    traces = json.loads((original.RESULTS / "representative-traces" / "traces.json").read_text())["traces"]
    # Old, already observed data only. No fresh holdout generation here.
    features = np.array([t["detectionEvents"] for t in traces], dtype=np.float32)
    expected = np.array([t["neuralProbability"] for t in traces])
    observed = frozen_probability(features, checkpoint)
    # Small GEMM-vs-GEMV roundoff is possible at float32. This tolerance and
    # threshold are fixed before drawing fresh shots, not chosen from holdout.
    assert np.allclose(observed, expected, rtol=0, atol=2e-7), np.max(np.abs(observed-expected))
    assert ((observed >= .5).astype(int) == np.array([t["neuralPrediction"] for t in traces])).all()


def timeout(signum, frame):
    raise TimeoutError("Confirmation exceeded the predeclared 60-second bound")


def main():
    started = time.perf_counter()
    cfg_path = original.EXP / "configs" / "confirmation.json"
    protocol_path = original.EXP / "configs" / "confirmation-protocol.md"
    cfg = json.loads(cfg_path.read_text())
    study_path = original.RESULTS / "aggregates" / "study.json"
    study = json.loads(study_path.read_text())
    checkpoint_path = original.ROOT.parent / cfg["checkpointPath"]
    checkpoint = json.loads(checkpoint_path.read_text())
    verify_inputs(cfg, study, checkpoint)
    git = lambda *args: subprocess.check_output(["git", *args], cwd=original.ROOT.parent, text=True).strip()
    # Protocol, configuration and execution source must already be tracked and
    # match HEAD before fresh-label generation. Unrelated website work may exist.
    protected = [cfg_path, protocol_path, Path(__file__)]
    for p in protected:
        rel = str(p.relative_to(original.ROOT.parent))
        committed = subprocess.check_output(["git", "show", f"HEAD:{rel}"], cwd=original.ROOT.parent)
        assert hashlib.sha256(committed).hexdigest() == sha256(p), f"Uncommitted protocol/source: {rel}"
    source_commit = git("rev-parse", "HEAD")
    run_id = study["runId"] + "-confirmation-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    manifest_rel = f"research/experiments/manifests/{run_id}.json"
    manifest_path = original.ROOT.parent / manifest_rel
    fixed = original.matcher(original.circuit(cfg["trainMeasurementNoise"], cfg))
    conditions = []
    signal.signal(signal.SIGALRM, timeout)
    signal.alarm(cfg["maximumRuntimeSeconds"])
    status, failure = "completed", None
    try:
        for p, seed in zip(cfg["measurementNoiseSweep"], cfg["testDataSeeds"]):
            c = original.circuit(p, cfg)
            x, y = original.sample(c, cfg["testShots"], seed)
            probability = frozen_probability(x, checkpoint)
            neural = original.probability_metrics(probability, y, cfg["calibrationBins"])
            for b in neural["reliability"]:
                mask = (probability >= b["lower"]) & ((probability < b["upper"]) if b["upper"] < 1 else probability <= 1)
                b["observableOneCount"] = int(y[mask].sum())
                b["observedFrequencyCi95"] = original.wilson(b["observableOneCount"], b["count"]) if b["count"] else None
            conditions.append({"measurementNoise": p, "testDataSeed": seed, "shots": len(y), "neural": neural,
                               "fixedMatching": original.error_metrics(original.decode(fixed, x), y),
                               "matchedMatching": original.error_metrics(original.decode(original.matcher(c), x), y)})
            print(json.dumps({"condition": p, "shots": len(y), "neuralFailures": neural["failures"], "fixedFailures": conditions[-1]["fixedMatching"]["failures"], "matchedFailures": conditions[-1]["matchedMatching"]["failures"]}), flush=True)
    except Exception as e:
        status, failure = "incomplete", repr(e)
    finally:
        signal.alarm(0)
    manifest = {"runId": run_id, "parentRunId": study["runId"], "purpose": cfg["purpose"], "sourceCodeCommit": source_commit,
                "protocolCommittedBeforeFreshLabels": True, "workingTreeDirty": bool(git("status", "--porcelain")),
                "sourceScriptSha256": sha256(Path(__file__)), "configurationSha256": sha256(cfg_path), "protocolSha256": sha256(protocol_path),
                "parentPipelineSha256": sha256(Path(original.__file__)), "parentArtifactSha256": sha256(study_path),
                "frozenCheckpointPath": cfg["checkpointPath"], "frozenCheckpointSha256": sha256(checkpoint_path),
                "packageVersions": {p: original.importlib.metadata.version(p) for p in ["stim", "pymatching", "numpy", "scikit-learn", "scipy", "threadpoolctl"]},
                "executionDateUTC": datetime.now(timezone.utc).isoformat(), "python": platform.python_version(),
                "hardware": {"platform": platform.platform(), "cpu": next((line.split(":", 1)[1].strip() for line in Path("/proc/cpuinfo").read_text().splitlines() if line.startswith("model name")), "unknown"), "threads": cfg["threads"], "gpu": "none"},
                "randomSeeds": {"freshTest": cfg["testDataSeeds"], "frozenModel": 101},
                "datasetGeneration": "Stim rotated_memory_z circuit detector sampler; same channel placements as parent; all decoders share each condition's shots",
                "splitDefinitions": "Fresh final test only, seeds disjoint from parent train/validation/test/pilot; no training or checkpoint selection",
                "modelArchitecture": [24, 32, 16, 1], "optimizer": "None: frozen checkpoint; no fitting, retuning or recalibration",
                "baselineSettings": {"fixedPrior": "parent training DEM p_m=.005", "matchedPrior": "evaluation DEM with oracle noise knowledge", "decomposeErrors": True, "correlationsEnabled": False},
                "sampleCounts": {"testPerCondition": cfg["testShots"], "conditionsCompleted": len(conditions), "total": sum(c["shots"] for c in conditions)},
                "completionStatus": status, "failure": failure, "wallSeconds": time.perf_counter() - started,
                "outputFiles": ["research/results/aggregates/confirmation.json"] if status == "completed" else []}
    original.write_json(manifest_path, manifest)
    if status != "completed":
        raise RuntimeError(f"Confirmation incomplete; see {manifest_rel}: {failure}")
    confirmation = {"schemaVersion": 1, "runId": run_id, "parentRunId": study["runId"], "purpose": cfg["purpose"],
                    "status": "completed-frozen-model-confirmation", "config": cfg,
                    "model": {"architecture": [24, 32, 16, 1], "parameterCount": 1345, "seeds": [101], "reportedSeed": 101,
                              "frozenCheckpointSha256": cfg["checkpointSha256"], "selection": "Unchanged parent seed101 checkpoint epoch35; no fresh-shot model selection"},
                    "conditions": conditions, "manifestPath": manifest_rel}
    original.write_json(original.RESULTS / "aggregates" / "confirmation.json", confirmation)
    print(json.dumps({"runId": run_id, "completionStatus": status, "seconds": manifest["wallSeconds"], "totalShots": manifest["sampleCounts"]["total"]}), flush=True)


if __name__ == "__main__":
    with threadpool_limits(limits=1):
        main()
