"""Prospective training-control constraints and emitted-evidence integrity."""
import json
import sys
import unittest
from pathlib import Path
import numpy as np

EXP = Path(__file__).parents[1]
ROOT = EXP.parents[1]
sys.path.insert(0, str(EXP / "scripts"))
import training_control


class TrainingControlUnits(unittest.TestCase):
    def test_protocol_budget_and_disjoint_seeds(self):
        cfg = json.loads((EXP / "configs/training-control.json").read_text())
        training_control.verify_config(cfg)
        self.assertEqual(cfg["trainDataSeeds"], [61001, 61002, 61003, 61004])
        self.assertEqual(cfg["validationDataSeeds"], [62001, 62002, 62003, 62004])
        self.assertEqual(cfg["testDataSeeds"], [63001, 63002, 63003, 63004])
        self.assertEqual(cfg["maximumRuntimeSeconds"], 120)
        self.assertEqual(cfg["threads"], 1)

    def test_paired_comparison_semantics(self):
        result = training_control.paired(np.array([0, 0, 1, 1]), np.array([0, 1, 0, 1]), np.array([0, 0, 0, 0]))
        self.assertEqual(result, {"bothCorrect": 1, "fixedOnlyCorrect": 1, "matchedOnlyCorrect": 1, "bothWrong": 1})


class TrainingControlResults(unittest.TestCase):
    def test_validation_frozen_before_tests_and_outputs(self):
        path = ROOT / "research/results/aggregates/training-control.json"
        result = json.loads(path.read_text())
        manifest = json.loads((ROOT / result["manifestPath"]).read_text())
        self.assertEqual(result["status"], "completed-exploratory-training-control")
        self.assertEqual(manifest["completionStatus"], "completed")
        self.assertTrue(manifest["protocolCommittedBeforeFreshLabels"])
        self.assertLessEqual(manifest["allCheckpointsFrozenAtUTC"], manifest["testGenerationStartedAtUTC"])
        self.assertLess(manifest["wallSeconds"], 120)
        for key in ["sourceAndInputHashes", "outputHashes"]:
            for file, expected in manifest[key].items():
                self.assertEqual(training_control.sha256(ROOT / file), expected, file)
        checkpoint_file = next(p for p in manifest["outputFiles"] if p.endswith("-checkpoints.json"))
        checkpoint = json.loads((ROOT / checkpoint_file).read_text())
        self.assertEqual(len(checkpoint["checkpoints"]), 12)
        self.assertEqual(len(result["trainingGroups"]), 4)
        lookup = {(p["trainingMeasurementNoise"], p["seed"]): training_control.payload_hash(p) for p in checkpoint["checkpoints"]}
        for group in result["trainingGroups"]:
            self.assertEqual(group["trainShots"], 40000)
            self.assertEqual(group["validationShots"], 8000)
            self.assertEqual(len(group["models"]), 3)
            for model in group["models"]:
                self.assertEqual(model["checkpointSha256"], lookup[(group["measurementNoise"], model["seed"])])
                self.assertLessEqual(model["selectedEpoch"], model["epochsExecuted"])
                self.assertLessEqual(model["epochsExecuted"], 40)
                self.assertEqual(len(model["validationLogLossByEpoch"]), model["epochsExecuted"])
        self.assertEqual(len(result["conditions"]), 4)
        for condition in result["conditions"]:
            self.assertEqual(condition["shots"], 100000)
            self.assertEqual(len(condition["seeds"]), 3)
            for row in condition["seeds"]:
                pair, fixed, matched = row["paired"], row["fixedTraining"], row["matchedTraining"]
                self.assertEqual(sum(pair.values()), condition["shots"])
                self.assertEqual(pair["matchedOnlyCorrect"] + pair["bothWrong"], fixed["failures"])
                self.assertEqual(pair["fixedOnlyCorrect"] + pair["bothWrong"], matched["failures"])
                self.assertEqual(row["errorDifferenceMatchedMinusFixed"], matched["errorRate"] - fixed["errorRate"])
                for metric in [fixed, matched]:
                    self.assertEqual(metric["errorRate"], metric["failures"] / condition["shots"])
                    self.assertEqual(metric["ci95"], training_control.original.wilson(metric["failures"], condition["shots"]))
                    self.assertTrue(0 <= metric["brier"] <= 1)
                    self.assertEqual(sum(b["count"] for b in metric["reliability"]), condition["shots"])
                if condition["measurementNoise"] == .005:
                    self.assertEqual(fixed, matched)
                    self.assertEqual(pair["fixedOnlyCorrect"], 0)
                    self.assertEqual(pair["matchedOnlyCorrect"], 0)
                    self.assertEqual(row["errorDifferenceMatchedMinusFixed"], 0)


if __name__ == "__main__":
    unittest.main()
