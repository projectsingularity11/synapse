"""Post-hoc paired diagnostics; preserves original aggregates and representative traces.

This is an explicitly post-hoc supplement, not a preregistered confirmatory test.
Regenerates original seed-101 model and requires aggregate/trace agreement.
"""
import hashlib
import json
import platform
import subprocess
from datetime import datetime, timezone
from pathlib import Path

import run as original
import numpy as np
from threadpoolctl import threadpool_limits


def topology(circuit):
    metadata = original.semantics(circuit)
    roles = {q["id"]: q for q in metadata["qubits"]}
    support = {q["id"]: set() for q in metadata["qubits"] if q["role"] == "measurement"}
    for op in circuit.flattened():
        if op.name != "CX":
            continue
        targets = [t.value for t in op.targets_copy()]
        for a, b in zip(targets[::2], targets[1::2]):
            if a in support and roles[b]["role"] == "data":
                support[a].add(b)
            elif b in support and roles[a]["role"] == "data":
                support[b].add(a)
            else:
                raise ValueError("Unexpected CX not connecting data and measurement qubits")
    assert len(support) == 8 and all(len(v) in [2, 4] for v in support.values())
    return [{"ancillaId": k, "basis": roles[k]["checkBasis"], "dataQubitIds": sorted(v)} for k, v in sorted(support.items())]


def paired(neural, matching, labels):
    nc, mc = neural == labels, matching == labels
    return {"bothCorrect": int(np.count_nonzero(nc & mc)),
            "neuralOnlyCorrect": int(np.count_nonzero(nc & ~mc)),
            "matchingOnlyCorrect": int(np.count_nonzero(~nc & mc)),
            "bothWrong": int(np.count_nonzero(~nc & ~mc))}


def main():
    study_path = original.RESULTS / "aggregates" / "study.json"
    traces_path = original.RESULTS / "representative-traces" / "traces.json"
    study = json.loads(study_path.read_text())
    original_traces = json.loads(traces_path.read_text())["traces"]
    cfg = study["config"]
    c = original.circuit(cfg["trainMeasurementNoise"], cfg)
    x, y = original.sample(c, cfg["trainShots"], cfg["trainDataSeed"])
    vx, vy = original.sample(c, cfg["validationShots"], cfg["validationDataSeed"])
    model, training = original.train(x, y, vx, vy, cfg["modelSeeds"][0], cfg)
    # No newly selected model: must reproduce the recorded validation checkpoint.
    assert training["selectedEpoch"] == study["model"]["training"][0]["selectedEpoch"]
    assert abs(training["validationLogLoss"] - study["model"]["training"][0]["validationLogLoss"]) < 1e-9
    fixed = original.matcher(c)
    conditions, gallery = [], []
    for old in study["conditions"]:
        p = old["measurementNoise"]
        test_c = original.circuit(p, cfg)
        tx, ty = original.sample(test_c, old["shots"], old["testDataSeed"])
        probability = model.predict_proba(tx)[:, 1]
        prediction = (probability >= .5).astype(np.uint8)
        fixed_pred = original.decode(fixed, tx)
        matched_pred = original.decode(original.matcher(test_c), tx)
        nn_metrics = original.probability_metrics(probability, ty, cfg["calibrationBins"])
        for key in ["failures", "shots", "errorRate", "ci95", "brier", "reliability"]:
            assert nn_metrics[key] == old["neural"][key], f"Original NN metric changed: {key}"
        assert original.error_metrics(fixed_pred, ty) == old["fixedMatching"]
        assert original.error_metrics(matched_pred, ty) == old["matchedMatching"]
        for trace in (t for t in original_traces if t["measurementNoise"] == p):
            j = trace["shotIndex"]
            assert tx[j].astype(int).tolist() == trace["detectionEvents"]
            assert int(ty[j]) == trace["observable"]
            assert float(probability[j]) == trace["neuralProbability"]
        bins = []
        for b in nn_metrics["reliability"]:
            mask = (probability >= b["lower"]) & ((probability < b["upper"]) if b["upper"] < 1 else probability <= 1)
            successes = int(ty[mask].sum())
            bins.append({**b, "observableOneCount": successes,
                         "observedFrequencyCi95": original.wilson(successes, b["count"]) if b["count"] else None})
        conditions.append({"measurementNoise": p, "shots": len(ty), "paired": [
            {"comparison": "neural-vs-fixed", **paired(prediction, fixed_pred, ty)},
            {"comparison": "neural-vs-matched", **paired(prediction, matched_pred, ty)}], "reliability": bins})
        for selection, mask in [("first-neural-error", prediction != ty), ("first-neural-matched-disagreement", prediction != matched_pred)]:
            indices = np.flatnonzero(mask)
            if not len(indices):
                continue
            j = int(indices[0])
            gallery.append({"id": f"handpicked-p{p}-shot{j}-{selection}", "measurementNoise": p, "shotIndex": j,
                            "specialSelection": selection, "detectionEvents": tx[j].astype(int).tolist(), "observable": int(ty[j]),
                            "neuralProbability": float(probability[j]), "neuralPrediction": int(prediction[j]),
                            "fixedPrediction": int(fixed_pred[j]), "matchedPrediction": int(matched_pred[j])})
    run_id = study["runId"] + "-supplement-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    manifest_rel = f"research/experiments/manifests/{run_id}.json"
    original.write_json(original.RESULTS / "aggregates" / "supplement.json", {
        "schemaVersion": 1, "parentRunId": study["runId"], "runId": run_id,
        "analysis": "Post-hoc descriptive diagnostics; seed 101 and original final test shots. No retraining choices changed.",
        "conditions": conditions, "manifestPath": manifest_rel})
    original.write_json(original.RESULTS / "representative-traces" / "handpicked.json", {
        "schemaVersion": 1, "parentRunId": study["runId"], "runId": run_id,
        "selection": "Labeled handpicked gallery: first neural error and first neural/matched disagreement per condition; the same shot can occur twice. Not representative sampling.",
        "traces": gallery})
    original.write_json(original.RESULTS / "aggregates" / "topology.json", {
        "schemaVersion": 1, "parentRunId": study["runId"], "runId": run_id,
        "procedure": "Union of actual data-ancilla CX pairs in the flattened generated circuit; basis from ancilla Hadamard participation. No nearest-neighbor inference.",
        "checks": topology(c)})
    # Small checkpoint retained for research only; never copied to browser assets.
    checkpoint = original.EXP / "manifests" / "seed101-checkpoint.json"
    original.write_json(checkpoint, {"parentRunId": study["runId"], "seed": 101,
        "architecture": study["model"]["architecture"], "activation": "relu", "outputActivation": "logistic",
        "coefs": [a.tolist() for a in model.coefs_], "intercepts": [a.tolist() for a in model.intercepts_],
        "selectedEpoch": training["selectedEpoch"], "purpose": "Offline research reproducibility only; not shipped as a browser inference model"})
    git = lambda *args: subprocess.check_output(["git", *args], cwd=original.ROOT.parent, text=True).strip()
    files = [study_path, traces_path, Path(original.__file__), Path(__file__), original.EXP / "configs" / "d3.json", checkpoint]
    original.write_json(original.ROOT.parent / manifest_rel, {
        "runId": run_id, "parentRunId": study["runId"], "sourceCodeCommit": git("rev-parse", "HEAD"),
        "workingTreeDirty": bool(git("status", "--porcelain")), "executionDateUTC": datetime.now(timezone.utc).isoformat(),
        "hardware": {"platform": platform.platform(), "threads": 1, "gpu": "none"},
        "packageVersions": {p: original.importlib.metadata.version(p) for p in ["stim", "pymatching", "numpy", "scikit-learn", "scipy", "threadpoolctl"]},
        "sourceAndInputHashes": {str(p.relative_to(original.ROOT.parent)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files},
        "reproductionChecks": "All four original NN metrics including reliability bins/Brier, fixed/matched metrics, validation checkpoint, and all representative trace probabilities exactly reproduced",
        "randomSeeds": {"train": cfg["trainDataSeed"], "validation": cfg["validationDataSeed"], "test": cfg["testDataSeeds"], "model": 101},
        "sampleCounts": {"train": len(y), "validation": len(vy), "testPerCondition": cfg["testShots"]},
        "modelArchitecture": study["model"]["architecture"], "optimizer": "Original Adam settings, unchanged; see parent manifest and config",
        "baselineSettings": "Original uncorrelated graphlike MWPM, fixed training prior and matched test prior",
        "outputFiles": ["research/results/aggregates/supplement.json", "research/results/aggregates/topology.json", "research/results/representative-traces/handpicked.json", "research/experiments/manifests/seed101-checkpoint.json"],
        "completionStatus": "completed"})
    print(json.dumps({"runId": run_id, "galleryTraces": len(gallery), "topologyChecks": len(topology(c)), "reproduction": "exact"}))


if __name__ == "__main__":
    with threadpool_limits(limits=1):
        main()
