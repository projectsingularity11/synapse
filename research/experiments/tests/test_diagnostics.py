"""Descriptive post-hoc diagnostics, not checkpoint selection or calibration fitting."""
import json
import sys
import unittest
from pathlib import Path

import numpy as np

EXP = Path(__file__).parents[1]
ROOT = EXP.parents[1]
sys.path.insert(0, str(EXP / "scripts"))
import diagnostics


class DiagnosticUnits(unittest.TestCase):
    def test_confusion_matrix_and_baselines(self):
        truth = np.array([0, 0, 1, 1])
        pred = np.array([0, 1, 0, 1])
        matrix = diagnostics.confusion(pred, truth)
        self.assertEqual(list(matrix.values()), [1, 1, 1, 1])
        probability = np.array([.1, .6, .2, .9], dtype=np.float32)
        d = diagnostics.describe(probability, truth, pred, pred, .25)
        self.assertEqual(d["baselines"]["alwaysNoFlip"]["failures"], 2)
        self.assertEqual(d["baselines"]["alwaysNoFlip"]["brier"], .5)
        self.assertAlmostEqual(d["baselines"]["trainingPrevalenceConstant"]["brier"], .3125)
        self.assertEqual(sum(b["count"] for b in d["confidenceBins"]), 4)
        self.assertEqual(d["selectiveRisk"][0]["coverage"], 1)

    def test_empty_conditioned_groups_and_accuracy_ci(self):
        confidence = np.array([.6, .8])
        pred, truth = np.array([0, 1]), np.array([0, 0])
        empty = diagnostics.conditioned_summary(np.array([False, False]), confidence, pred, truth)
        self.assertEqual(empty["count"], 0)
        for key in ["ci95", "errorRate", "meanConfidence", "observedAccuracy", "observedAccuracyCi95"]:
            self.assertIsNone(empty[key])
        both = diagnostics.conditioned_summary(np.array([True, True]), confidence, pred, truth)
        self.assertEqual(both["failures"], 1)
        self.assertEqual(both["observedAccuracyCi95"], [1-both["ci95"][1], 1-both["ci95"][0]])


class DiagnosticArtifacts(unittest.TestCase):
    def test_reused_artifacts_counts_and_provenance(self):
        path = ROOT / "research/results/aggregates/diagnostics.json"
        d = json.loads(path.read_text())
        m = json.loads((ROOT / d["manifestPath"]).read_text())
        self.assertEqual(d["status"], "completed-post-hoc-diagnostics")
        self.assertEqual(d["definitions"]["confidenceBinEdges"], [.5, .6, .7, .8, .9, 1])
        self.assertEqual(d["definitions"]["selectiveThresholds"], [.5, .6, .7, .8, .9, .95, .99])
        self.assertEqual(m["sampleCounts"]["newShots"], 0)
        for name, expected in m["sourceAndInputHashes"].items():
            self.assertEqual(diagnostics.confirmation.sha256(ROOT / name), expected, name)
        self.assertEqual(m["outputHashes"][str(path.relative_to(ROOT))], diagnostics.confirmation.sha256(path))
        self.assertEqual(len(d["datasets"]), 2)
        for data in d["datasets"]:
            parent_name = "study" if data["source"] == "primary" else "confirmation"
            parent = json.loads((ROOT / f"research/results/aggregates/{parent_name}.json").read_text())
            self.assertEqual(data["parentRunId"], parent["runId"])
            for c, p in zip(data["conditions"], parent["conditions"]):
                self.assertEqual(c["shots"], p["shots"])
                self.assertEqual(c["testDataSeed"], p["testDataSeed"])
                self.assertEqual(c["prevalence"], c["observableOneCount"] / c["shots"])
                self.assertEqual(c["baselines"]["alwaysNoFlip"]["failures"], c["observableOneCount"])
                self.assertEqual(c["baselines"]["alwaysNoFlip"]["brier"], c["prevalence"])
                for decoder, counts in c["confusion"].items():
                    self.assertEqual(sum(counts.values()), c["shots"])
                    self.assertEqual(counts["falsePositive"] + counts["falseNegative"], p[decoder]["failures"])
                    self.assertEqual(counts["truePositive"] + counts["falseNegative"], c["observableOneCount"])
                self.assertEqual(sum(b["count"] for b in c["confidenceBins"]), c["shots"])
                self.assertEqual(sum(b["failures"] for b in c["confidenceBins"]), p["neural"]["failures"])
                for b in c["eventCalibration"]:
                    if b["count"]:
                        self.assertEqual(b["signedGap"], b["meanPrediction"]-b["observedFrequency"])
                    else:
                        self.assertIsNone(b["signedGap"])
                for b in c["confidenceBins"] + c["selectiveRisk"]:
                    self.assertEqual(b["coverage"], b["count"] / c["shots"])
                    if b["count"]:
                        self.assertEqual(b["ci95"], diagnostics.original.wilson(b["failures"], b["count"]))
                        self.assertEqual(b["observedAccuracyCi95"], [1-b["ci95"][1], 1-b["ci95"][0]])


if __name__ == "__main__":
    unittest.main()
