"""Scientific integrity tests independent of the website."""
import importlib.util
import json
import unittest
import sys
from pathlib import Path

import numpy as np
import stim

SPEC = importlib.util.spec_from_file_location("pipeline", Path(__file__).parents[1] / "scripts" / "run.py")
pipeline = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(pipeline)
CFG = json.loads((Path(__file__).parents[1] / "configs" / "d3.json").read_text())
sys.path.insert(0, str(Path(__file__).parents[1] / "scripts"))
import supplement


class PipelineTests(unittest.TestCase):
    def test_no_noise_and_matching(self):
        c = pipeline.circuit(0, CFG, no_noise=True)
        x, y = pipeline.sample(c, 1024, 991)
        self.assertEqual(x.shape, (1024, 24))
        self.assertFalse(x.any())
        self.assertFalse(y.any())
        self.assertFalse(pipeline.decode(pipeline.matcher(pipeline.circuit(.005, CFG)), x).any())

    def test_known_injected_faults(self):
        # Inject immediately before final data readout. A single X on qubit 1
        # flips observable 0 and excites a final boundary detector. A full
        # column X(1,8,15) is an undetectable logical operator in this Z memory.
        for qubits, events in [([1], 1), ([1, 8, 15], 0)]:
            original = pipeline.circuit(0, CFG, no_noise=True).flattened()
            injected = stim.Circuit()
            for op in original:
                if op.name == "M":
                    injected.append("X_ERROR", qubits, 1.0)
                injected.append(op)
            x, y = pipeline.sample(injected, 32, 992)
            self.assertTrue((y == 1).all())
            self.assertTrue((x.sum(axis=1) == events).all())

    def test_detector_semantics(self):
        m = pipeline.semantics(pipeline.circuit(.005, CFG))
        self.assertEqual([d["id"] for d in m["detectors"]], list(range(24)))
        self.assertEqual([sum(d["coordinates"][2] == t for d in m["detectors"]) for t in range(4)], [4, 8, 8, 4])
        self.assertEqual(sum(q["role"] == "data" for q in m["qubits"]), 9)
        self.assertEqual(sum(q["role"] == "measurement" for q in m["qubits"]), 8)

    def test_labels_not_inputs_and_reproducibility(self):
        c = pipeline.circuit(.005, CFG)
        x, y = pipeline.sample(c, 512, 993)
        xx, yy = pipeline.sample(c, 512, 993)
        self.assertEqual(x.dtype, np.float32)
        self.assertTrue(np.array_equal(x, xx) and np.array_equal(y, yy))
        self.assertEqual(x.shape[1], c.num_detectors)
        self.assertEqual(y.shape, (512,))
        self.assertTrue(set(np.unique(x)).issubset({0, 1}))
        self.assertEqual(pipeline.decode(pipeline.matcher(c), x).shape, (512,))

    def test_probability_metrics_and_empty_bins(self):
        metrics = pipeline.probability_metrics(np.array([0., .2, .9, 1.]), np.array([0, 1, 0, 1]), 10)
        self.assertEqual(metrics["failures"], 2)
        self.assertEqual(sum(b["count"] for b in metrics["reliability"]), 4)
        self.assertAlmostEqual(metrics["brier"], .3625)
        self.assertGreater(pipeline.wilson(0, 100)[1], 0)

    def test_split_seeds_distinct(self):
        values = [CFG["trainDataSeed"], CFG["validationDataSeed"], *CFG["testDataSeeds"]]
        self.assertEqual(len(values), len(set(values)))

    def test_topology_from_actual_cx(self):
        checks = supplement.topology(pipeline.circuit(.005, CFG))
        self.assertEqual(len(checks), 8)
        self.assertEqual(sorted(len(c["dataQubitIds"]) for c in checks), [2, 2, 2, 2, 4, 4, 4, 4])
        self.assertEqual(sum(c["basis"] == "X" for c in checks), 4)
        # Ancilla 9's actual four CX data partners; not nearest-distance guesses.
        self.assertEqual(next(c["dataQubitIds"] for c in checks if c["ancillaId"] == 9), [1, 3, 8, 10])

    def test_paired_counts_meaning(self):
        result = supplement.paired(np.array([0, 0, 1, 1]), np.array([0, 1, 0, 1]), np.array([0, 0, 0, 0]))
        self.assertEqual(result, {"bothCorrect": 1, "neuralOnlyCorrect": 1, "matchingOnlyCorrect": 1, "bothWrong": 1})

    def test_saved_artifacts_consistent(self):
        # This check intentionally fails if the required completed study is absent.
        r = Path(__file__).parents[2] / "results"
        study = json.loads((r / "aggregates" / "study.json").read_text())
        extra = json.loads((r / "aggregates" / "supplement.json").read_text())
        traces = json.loads((r / "representative-traces" / "traces.json").read_text())
        gallery = json.loads((r / "representative-traces" / "handpicked.json").read_text())
        self.assertEqual(extra["parentRunId"], study["runId"])
        self.assertEqual(gallery["parentRunId"], study["runId"])
        self.assertEqual(len(traces["traces"]), 32)
        for c, e in zip(study["conditions"], extra["conditions"]):
            self.assertEqual(c["measurementNoise"], e["measurementNoise"])
            self.assertEqual(sum(b["count"] for b in e["reliability"]), c["shots"])
            for pair, baseline in zip(e["paired"], ["fixedMatching", "matchedMatching"]):
                self.assertEqual(sum(pair[k] for k in ["bothCorrect", "neuralOnlyCorrect", "matchingOnlyCorrect", "bothWrong"]), c["shots"])
                self.assertEqual(pair["matchingOnlyCorrect"] + pair["bothWrong"], c["neural"]["failures"])
                self.assertEqual(pair["neuralOnlyCorrect"] + pair["bothWrong"], c[baseline]["failures"])
            for b in e["reliability"]:
                if b["count"]:
                    self.assertTrue(b["observedFrequencyCi95"][0] <= b["observedFrequency"] <= b["observedFrequencyCi95"][1])
        for t in traces["traces"] + gallery["traces"]:
            self.assertEqual(len(t["detectionEvents"]), 24)
            self.assertTrue(set(t["detectionEvents"]).issubset({0, 1}))
            self.assertEqual(t["neuralPrediction"], int(t["neuralProbability"] >= .5))
        for t in gallery["traces"]:
            if t["specialSelection"] == "first-neural-error":
                self.assertNotEqual(t["neuralPrediction"], t["observable"])
            else:
                self.assertNotEqual(t["neuralPrediction"], t["matchedPrediction"])


if __name__ == "__main__":
    unittest.main()
