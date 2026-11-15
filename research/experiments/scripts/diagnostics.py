"""Post-hoc rare-label/calibration diagnostics on existing frozen-model shots.

No fresh randomness, fitting, thresholds chosen from performance, or retuning.
Fixed descriptive bins and thresholds are constants below before execution.
"""
import hashlib
import json
import platform
import signal
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

import confirmation
import run as original
import numpy as np
from threadpoolctl import threadpool_limits

CONFIDENCE_EDGES = [.5, .6, .7, .8, .9, 1.]
CONFIDENCE_THRESHOLDS = [.5, .6, .7, .8, .9, .95, .99]
MAXIMUM_RUNTIME_SECONDS = 60
# Float32 GEMM and differently sized inference batches can introduce small
# rounding differences. Counts/threshold decisions/bin membership must agree
# exactly; original Brier, event means and frequencies tolerate <=2e-7 absolute.
SUMMARY_ATOL = 2e-7


def confusion(prediction, truth):
    return {"trueNegative": int(np.count_nonzero((prediction == 0) & (truth == 0))),
            "falsePositive": int(np.count_nonzero((prediction == 1) & (truth == 0))),
            "falseNegative": int(np.count_nonzero((prediction == 0) & (truth == 1))),
            "truePositive": int(np.count_nonzero((prediction == 1) & (truth == 1)))}


def require_metrics(actual, stored, probabilistic=False):
    for k in ["failures", "shots", "errorRate", "ci95"]:
        assert actual[k] == stored[k], f"Stored metric mismatch: {k}"
    if not probabilistic:
        return
    assert abs(actual["brier"] - stored["brier"]) <= SUMMARY_ATOL
    assert len(actual["reliability"]) == len(stored["reliability"]) == 10
    for a, b in zip(actual["reliability"], stored["reliability"]):
        for k in ["lower", "upper", "count"]:
            assert a[k] == b[k], f"Stored calibration {k} mismatch"
        for k in ["meanPrediction", "observedFrequency"]:
            if a[k] is None or b[k] is None:
                assert a[k] is b[k]
            else:
                assert abs(a[k] - b[k]) <= SUMMARY_ATOL, f"Stored calibration {k} mismatch"
        if "observableOneCount" in b:
            assert b["observableOneCount"] == round(a["observedFrequency"] * a["count"]) if a["count"] else b["observableOneCount"] == 0
            expected = original.wilson(b["observableOneCount"], b["count"]) if b["count"] else None
            assert b["observedFrequencyCi95"] == expected


def conditioned_summary(mask, confidence, prediction, truth):
    count = int(mask.sum())
    failures = int(np.count_nonzero(prediction[mask] != truth[mask]))
    ci = original.wilson(failures, count) if count else None
    return {"count": count, "coverage": count / len(truth), "failures": failures,
            "errorRate": failures / count if count else None,
            "ci95": ci,
            "meanConfidence": float(confidence[mask].mean()) if count else None,
            "observedAccuracy": 1 - failures / count if count else None,
            "observedAccuracyCi95": [1-ci[1], 1-ci[0]] if ci else None}


def describe(probability, truth, fixed, matched, train_prevalence):
    prediction = (probability >= .5).astype(np.uint8)
    confidence = np.maximum(probability, 1 - probability)
    metrics = original.probability_metrics(probability, truth, 10)
    event_bins = []
    for b in metrics["reliability"]:
        gap = b["meanPrediction"] - b["observedFrequency"] if b["count"] else None
        event_bins.append({**b, "signedGap": gap, "absoluteGap": abs(gap) if gap is not None else None})
    bins = []
    for i, (low, high) in enumerate(zip(CONFIDENCE_EDGES[:-1], CONFIDENCE_EDGES[1:])):
        mask = (confidence >= low) & ((confidence < high) if i < len(CONFIDENCE_EDGES) - 2 else confidence <= high)
        bins.append({"lower": low, "upper": high, **conditioned_summary(mask, confidence, prediction, truth)})
    selective = [{"minimumConfidence": threshold, **conditioned_summary(confidence >= threshold, confidence, prediction, truth)}
                 for threshold in CONFIDENCE_THRESHOLDS]
    observable_ones = int(truth.sum())
    prevalence = observable_ones / len(truth)
    return {"observableOneCount": observable_ones, "prevalence": prevalence,
            "meanPredictedFlipProbability": float(probability.mean()),
            "eventProbabilityGap": float(probability.mean()) - prevalence,
            "baselines": {"alwaysNoFlip": {**original.error_metrics(np.zeros_like(truth), truth), "brier": prevalence},
                          "trainingPrevalenceConstant": {"probability": train_prevalence,
                              "brier": float(np.mean((train_prevalence - truth.astype(np.float64))**2))}},
            "confusion": {"neural": confusion(prediction, truth), "fixedMatching": confusion(fixed, truth), "matchedMatching": confusion(matched, truth)},
            "eventCalibration": event_bins, "confidenceBins": bins, "selectiveRisk": selective}


def main():
    started = time.perf_counter()
    primary_path = original.RESULTS / "aggregates/study.json"
    confirm_path = original.RESULTS / "aggregates/confirmation.json"
    primary, confirm = json.loads(primary_path.read_text()), json.loads(confirm_path.read_text())
    cfg = primary["config"]
    checkpoint_path = original.EXP / "manifests/seed101-checkpoint.json"
    checkpoint = json.loads(checkpoint_path.read_text())
    confirmation.verify_inputs(confirm["config"], primary, checkpoint)
    fixed = original.matcher(original.circuit(cfg["trainMeasurementNoise"], cfg))
    # Reuse ORIGINAL training stream solely for the constant-probability baseline.
    _, train_labels = original.sample(original.circuit(cfg["trainMeasurementNoise"], cfg), cfg["trainShots"], cfg["trainDataSeed"])
    training_prevalence = float(train_labels.mean())
    run_id = primary["runId"] + "-diagnostics-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    manifest_rel = f"research/experiments/manifests/{run_id}.json"
    datasets = []
    def timeout(signum, frame):
        raise TimeoutError("Diagnostics exceeded declared 60-second bound")
    signal.signal(signal.SIGALRM, timeout)
    signal.alarm(MAXIMUM_RUNTIME_SECONDS)
    try:
        for source, study in [("primary", primary), ("confirmation", confirm)]:
            conditions = []
            for old in study["conditions"]:
                c = original.circuit(old["measurementNoise"], cfg)
                x, truth = original.sample(c, old["shots"], old["testDataSeed"])
                probability = confirmation.frozen_probability(x, checkpoint)
                neural = original.probability_metrics(probability, truth, 10)
                fixed_pred = original.decode(fixed, x)
                matched_pred = original.decode(original.matcher(c), x)
                require_metrics(neural, old["neural"], probabilistic=True)
                require_metrics(original.error_metrics(fixed_pred, truth), old["fixedMatching"])
                require_metrics(original.error_metrics(matched_pred, truth), old["matchedMatching"])
                conditions.append({"measurementNoise": old["measurementNoise"], "testDataSeed": old["testDataSeed"], "shots": old["shots"],
                                   **describe(probability, truth, fixed_pred, matched_pred, training_prevalence)})
            datasets.append({"source": source, "parentRunId": study["runId"], "conditions": conditions})
    finally:
        signal.alarm(0)
    definition = {
        "analysisStatus": "Post-hoc descriptive; all bins/thresholds fixed in source before processing this analysis, after parent results were known. No fitting or threshold optimization.",
        "confidence": "max(P(observable flip), 1-P(observable flip)); confidence in the predicted binary class, distinct from event probability",
        "confidenceBinEdges": CONFIDENCE_EDGES, "confidenceBinMembership": "Lower-inclusive, upper-exclusive except final bin includes1",
        "selectiveThresholds": CONFIDENCE_THRESHOLDS, "coverage": "selected count / all shots at that condition",
        "selectiveRisk": "mistakes / selected count for confidence >= threshold; thresholds overlap and are not independent experiments",
        "emptyGroups": "count/failures0, coverage0, error/interval/confidence/accuracy null, never inferred as perfect accuracy",
        "eventGap": "mean predicted flip probability minus observed flip frequency; positive=overprediction of flips, not necessarily overconfidence",
        "constantBaseline": "Probability estimated ONLY from original training labels, held fixed on all original and confirmation test conditions",
        "alwaysNoFlip": "Predicts logical flip0 at threshold0.5; Brier equals observed flip prevalence",
        "intervals": "Pointwise95% Wilson intervals for conditioned error rates, conditional on frozen model and simulator; not simultaneous bands, no inferential significance claim",
        "brierDecomposition": "Not reported: fixed-bin coarsening changes the predictions and an exact original-score Murphy decomposition would require residual terms",
        "reproductionTolerance": "All failure counts, decisions, sample counts, bin counts and Wilson intervals exactly equal stored results; Brier/probability summaries absolute tolerance2e-7 to allow float32 GEMM rounding",
        "dataReuse": "Reuses all80,000 original test shots and400,000 confirmation shots plus40,000 original training labels; no new independent evidence or training replication"}
    definition["causalLimit"] = "The measurement-noise sweep changes task difficulty and training mismatch together. Without separately retrained matched-noise neural models it does not isolate the causal cost of mismatch alone."
    output = {"schemaVersion": 1, "runId": run_id, "parentRunIds": [primary["runId"], confirm["runId"]],
              "purpose": "Post-hoc rare-label and confidence diagnostics of the frozen seed101 model on existing shots; no tuning or retraining",
              "status": "completed-post-hoc-diagnostics", "trainingPrevalence": {"sourceSeed": cfg["trainDataSeed"], "shots": len(train_labels),
                    "observableOneCount": int(train_labels.sum()), "probability": training_prevalence},
              "definitions": definition, "datasets": datasets, "manifestPath": manifest_rel}
    git = lambda *args: subprocess.check_output(["git", *args], cwd=original.ROOT.parent, text=True).strip()
    sources = [Path(__file__), Path(original.__file__), Path(confirmation.__file__), primary_path, confirm_path, checkpoint_path, original.EXP / "configs/d3.json", original.EXP / "configs/confirmation.json"]
    manifest = {"runId": run_id, "parentRunIds": output["parentRunIds"], "sourceCodeCommit": git("rev-parse", "HEAD"),
                "workingTreeDirty": bool(git("status", "--porcelain")), "executionDateUTC": datetime.now(timezone.utc).isoformat(),
                "sourceAndInputHashes": {str(p.relative_to(original.ROOT.parent)): confirmation.sha256(p) for p in sources},
                "packageVersions": {p: original.importlib.metadata.version(p) for p in ["stim", "pymatching", "numpy", "scikit-learn", "scipy", "threadpoolctl"]},
                "hardware": {"platform": platform.platform(), "cpu": next((line.split(":", 1)[1].strip() for line in Path("/proc/cpuinfo").read_text().splitlines() if line.startswith("model name")), "unknown"), "threads": 1, "gpu": "none"},
                "dataReused": {"training": {"seed": cfg["trainDataSeed"], "shots": len(train_labels), "purpose": "constant baseline only"},
                               "test": [{"source": d["source"], "parentRunId": d["parentRunId"], "conditions": [{"measurementNoise": c["measurementNoise"], "seed": c["testDataSeed"], "shots": c["shots"]} for c in d["conditions"]]} for d in datasets]},
                "modelArchitecture": [24, 32, 16, 1], "optimizer": "None, frozen checkpoint", "baselineSettings": "Unchanged parent fixed/matched uncorrelated MWPM; plus always0 and original-training-prevalence Brier baselines",
                "sampleCounts": {"originalTest": 80000, "confirmationTest": 400000, "reusedTraining": len(train_labels), "newShots": 0},
                "reproduction": "All parent metrics verified before diagnostics emitted", "completionStatus": "completed", "wallSeconds": time.perf_counter()-started,
                "outputFiles": ["research/results/aggregates/diagnostics.json"]}
    original.write_json(original.RESULTS / "aggregates/diagnostics.json", output)
    manifest["outputHashes"] = {"research/results/aggregates/diagnostics.json": confirmation.sha256(original.RESULTS / "aggregates/diagnostics.json")}
    original.write_json(original.ROOT.parent / manifest_rel, manifest)
    print(json.dumps({"runId": run_id, "reproduction": "passed", "trainPrevalence": training_prevalence, "wallSeconds": manifest["wallSeconds"]}))


if __name__ == "__main__":
    with threadpool_limits(limits=1):
        main()
