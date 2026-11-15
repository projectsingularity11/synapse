"""Frozen-model confirmation provenance and aggregate-integrity checks."""
import hashlib
import json
import sys
import unittest
from pathlib import Path

EXP = Path(__file__).parents[1]
ROOT = EXP.parents[1]
sys.path.insert(0, str(EXP / "scripts"))
import confirmation


class ConfirmationPreflight(unittest.TestCase):
    def test_disjoint_seeds_and_frozen_checkpoint(self):
        cfg = json.loads((EXP / "configs" / "confirmation.json").read_text())
        study = json.loads((ROOT / "research/results/aggregates/study.json").read_text())
        checkpoint = json.loads((ROOT / cfg["checkpointPath"]).read_text())
        confirmation.verify_inputs(cfg, study, checkpoint)
        self.assertEqual(cfg["testShots"], 100000)
        self.assertEqual(cfg["testDataSeeds"], [53001, 53002, 53003, 53004])
        self.assertEqual(cfg["maximumRuntimeSeconds"], 60)
        self.assertEqual(cfg["checkpointSha256"], "7584092387b2ac5cf8c39027288b0b91a088dd4099b61a32d87a5cbf359cdd6e")


class ConfirmationResults(unittest.TestCase):
    def test_saved_confirmation_and_provenance(self):
        result = json.loads((ROOT / "research/results/aggregates/confirmation.json").read_text())
        cfg_path = EXP / "configs" / "confirmation.json"
        cfg = json.loads(cfg_path.read_text())
        self.assertEqual(result["parentRunId"], cfg["parentRunId"])
        self.assertEqual(result["status"], "completed-frozen-model-confirmation")
        self.assertEqual(result["config"], cfg)
        self.assertEqual(len(result["conditions"]), 4)
        manifest = json.loads((ROOT / result["manifestPath"]).read_text())
        self.assertTrue(manifest["protocolCommittedBeforeFreshLabels"])
        self.assertEqual(manifest["completionStatus"], "completed")
        self.assertEqual(manifest["sampleCounts"]["total"], 400000)
        self.assertEqual(manifest["configurationSha256"], hashlib.sha256(cfg_path.read_bytes()).hexdigest())
        self.assertEqual(manifest["sourceScriptSha256"], hashlib.sha256((EXP / "scripts/confirmation.py").read_bytes()).hexdigest())
        self.assertEqual(manifest["frozenCheckpointSha256"], cfg["checkpointSha256"])
        self.assertLess(manifest["wallSeconds"], 60)
        for condition, seed, p in zip(result["conditions"], cfg["testDataSeeds"], cfg["measurementNoiseSweep"]):
            self.assertEqual(condition["testDataSeed"], seed)
            self.assertEqual(condition["measurementNoise"], p)
            self.assertEqual(condition["shots"], 100000)
            for key in ["neural", "fixedMatching", "matchedMatching"]:
                m = condition[key]
                self.assertEqual(m["shots"], condition["shots"])
                self.assertEqual(m["errorRate"], m["failures"] / m["shots"])
                self.assertEqual(m["ci95"], confirmation.original.wilson(m["failures"], m["shots"]))
            n = condition["neural"]
            self.assertTrue(0 <= n["brier"] <= 1)
            self.assertEqual(sum(b["count"] for b in n["reliability"]), 100000)
            for b in n["reliability"]:
                if b["count"]:
                    self.assertEqual(b["observedFrequency"], b["observableOneCount"] / b["count"])
                    self.assertEqual(b["observedFrequencyCi95"], confirmation.original.wilson(b["observableOneCount"], b["count"]))
                else:
                    self.assertIsNone(b["observedFrequencyCi95"])


if __name__ == "__main__":
    unittest.main()
