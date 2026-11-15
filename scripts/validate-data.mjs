import fs from "node:fs";
import assert from "node:assert/strict";
const s = JSON.parse(
  fs.readFileSync("research/results/aggregates/study.json", "utf8"),
);
const t = JSON.parse(
  fs.readFileSync("research/results/representative-traces/traces.json", "utf8"),
);
const m = JSON.parse(fs.readFileSync(s.manifestPath, "utf8"));
assert.equal(s.schemaVersion, 1);
assert.equal(t.runId, s.runId);
assert.equal(m.runId, s.runId);
assert.equal(s.status, "completed-bounded-study");
assert.equal(s.config.distance, 3);
assert.equal(s.detectors.length, 24);
assert.equal(new Set(s.detectors.map((d) => d.id)).size, 24);
assert.equal(s.qubits.filter((q) => q.role === "data").length, 9);
assert.equal(s.model.parameterCount, 1345);
assert.ok(m.sourceCodeCommit.match(/^[a-f0-9]{40}$/));
let rows = 0;
for (const c of s.conditions) {
  assert.equal(c.shots, s.config.testShots);
  assert.ok(s.config.measurementNoiseSweep.includes(c.measurementNoise));
  for (const key of ["neural", "fixedMatching", "matchedMatching"]) {
    let r = c[key];
    assert.ok(
      Number.isInteger(r.failures) && r.failures >= 0 && r.failures <= c.shots,
    );
    assert.equal(r.errorRate, r.failures / c.shots);
    assert.ok(
      r.ci95[0] >= 0 &&
        r.ci95[0] <= r.errorRate &&
        r.ci95[1] >= r.errorRate &&
        r.ci95[1] <= 1,
    );
    rows++;
  }
  assert.equal(c.neural.reliability.length, 10);
  assert.equal(
    c.neural.reliability.reduce((n, b) => n + b.count, 0),
    c.shots,
  );
  for (const b of c.neural.reliability) {
    assert.ok(Number.isInteger(b.count) && b.count >= 0);
    if (b.count) {
      assert.ok(b.meanPrediction >= b.lower && b.meanPrediction <= b.upper);
      assert.ok(b.observedFrequency >= 0 && b.observedFrequency <= 1);
    } else {
      assert.equal(b.meanPrediction, null);
      assert.equal(b.observedFrequency, null);
    }
  }
  assert.ok(c.neural.brier >= 0 && c.neural.brier <= 1);
}
for (const trace of t.traces) {
  assert.equal(trace.detectionEvents.length, s.detectors.length);
  assert.ok(trace.detectionEvents.every((v) => v === 0 || v === 1));
  assert.ok(
    s.conditions.some((c) => c.measurementNoise === trace.measurementNoise),
  );
  for (const k of [
    "observable",
    "neuralPrediction",
    "fixedPrediction",
    "matchedPrediction",
  ])
    assert.ok([0, 1].includes(trace[k]));
  assert.ok(trace.neuralProbability >= 0 && trace.neuralProbability <= 1);
  assert.equal(trace.neuralPrediction, Number(trace.neuralProbability >= 0.5));
}
const src = JSON.parse(
  fs.readFileSync("research/sources/sources.json", "utf8"),
);
assert.ok(src.length >= 4);
for (const source of src)
  for (const k of [
    "id",
    "title",
    "authors",
    "url",
    "accessDate",
    "type",
    "relevance",
  ])
    assert.ok(source[k], `Missing ${k}`);
console.log(
  `Validated ${s.conditions.length} conditions, ${rows} decoder rows, ${t.traces.length} real traces, manifest identity, calibration bin counts, and ${src.length} source records.`,
);
// Hash and cross-artifact gates keep a successful build tied to the actual research code and run.
const { createHash } = await import("node:crypto");
const digest = (file) =>
  createHash("sha256").update(fs.readFileSync(file)).digest("hex");
assert.equal(
  digest("research/experiments/scripts/run.py"),
  m.sourceScriptSha256,
  "Original experiment script hash",
);
assert.equal(
  digest("research/experiments/configs/d3.json"),
  m.configurationSha256,
  "Experiment config hash",
);
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const supplement = read("research/results/aggregates/supplement.json");
const topology = read("research/results/aggregates/topology.json");
const handpicked = read(
  "research/results/representative-traces/handpicked.json",
);
const sm = read(supplement.manifestPath);
for (const artifact of [supplement, topology, handpicked, sm])
  assert.equal(artifact.parentRunId, s.runId, "Supplement parent");
for (const artifact of [topology, handpicked, sm])
  assert.equal(artifact.runId, supplement.runId, "Supplement run");
for (const [file, hash] of Object.entries(sm.sourceAndInputHashes))
  assert.equal(digest(file), hash, `Supplement input hash ${file}`);
for (const sc of supplement.conditions) {
  const c = s.conditions.find(
    (c) => c.measurementNoise === sc.measurementNoise,
  );
  assert.ok(c);
  assert.equal(sc.shots, c.shots);
  for (const p of sc.paired) {
    assert.equal(
      p.bothCorrect + p.neuralOnlyCorrect + p.matchingOnlyCorrect + p.bothWrong,
      c.shots,
    );
    assert.equal(p.matchingOnlyCorrect + p.bothWrong, c.neural.failures);
    assert.equal(
      p.neuralOnlyCorrect + p.bothWrong,
      c[
        p.comparison === "neural-vs-fixed" ? "fixedMatching" : "matchedMatching"
      ].failures,
    );
  }
  assert.equal(
    sc.reliability.reduce((n, b) => n + b.count, 0),
    c.shots,
  );
  for (const [i, b] of sc.reliability.entries()) {
    assert.equal(b.count, c.neural.reliability[i].count);
    assert.equal(b.meanPrediction, c.neural.reliability[i].meanPrediction);
    assert.equal(
      b.observedFrequency,
      c.neural.reliability[i].observedFrequency,
    );
    if (b.count) {
      assert.equal(b.observedFrequency, b.observableOneCount / b.count);
      assert.ok(
        b.observedFrequencyCi95[0] <= b.observedFrequency &&
          b.observedFrequencyCi95[1] >= b.observedFrequency,
      );
    } else assert.equal(b.observedFrequencyCi95, null);
  }
}
assert.equal(topology.checks.length, 8);
for (const check of topology.checks) {
  assert.ok([2, 4].includes(check.dataQubitIds.length));
  assert.equal(new Set(check.dataQubitIds).size, check.dataQubitIds.length);
  assert.equal(
    s.qubits.find((q) => q.id === check.ancillaId)?.role,
    "measurement",
  );
  for (const id of check.dataQubitIds)
    assert.equal(s.qubits.find((q) => q.id === id)?.role, "data");
}
assert.ok(handpicked.selection.toLowerCase().includes("handpicked"));
for (const trace of handpicked.traces) {
  assert.equal(trace.detectionEvents.length, s.detectors.length);
  assert.ok(trace.detectionEvents.every((v) => [0, 1].includes(v)));
  assert.equal(trace.neuralPrediction, Number(trace.neuralProbability >= 0.5));
  assert.ok(trace.specialSelection);
}
const fm = read("research/results/figures/manifest.json");
assert.equal(fm.parentRunId, s.runId);
for (const [file, hash] of Object.entries(fm.inputs))
  assert.equal(digest(file), hash, `Figure input hash ${file}`);
assert.equal(digest(fm.generator), fm.scriptSha256);
for (const [file, details] of Object.entries(fm.outputs))
  assert.equal(digest(`research/results/figures/${file}`), details.sha256);
const claims = read("research/claims/claims.json");
assert.equal(new Set(claims.map((c) => c.id)).size, claims.length);
for (const claim of claims)
  for (const id of claim.sourceIds)
    assert.ok(
      src.some((s) => s.id === id),
      `Claim ${claim.id} source ${id}`,
    );
console.log(
  `Verified source/config SHA256, ${supplement.conditions.length} supplemental conditions, ${topology.checks.length} circuit supports, ${handpicked.traces.length} selected traces, figure hashes and ${claims.length} claim links.`,
);
const confirmation = read("research/results/aggregates/confirmation.json");
const cm = read(confirmation.manifestPath);
assert.equal(confirmation.parentRunId, s.runId);
assert.equal(cm.parentRunId, s.runId);
assert.equal(cm.runId, confirmation.runId);
assert.equal(confirmation.status, "completed-frozen-model-confirmation");
assert.equal(cm.protocolCommittedBeforeFreshLabels, true);
assert.equal(digest(cm.frozenCheckpointPath), cm.frozenCheckpointSha256);
assert.equal(
  digest("research/results/aggregates/study.json"),
  cm.parentArtifactSha256,
);
assert.equal(
  digest("research/experiments/scripts/confirmation.py"),
  cm.sourceScriptSha256,
);
assert.equal(
  digest("research/experiments/configs/confirmation.json"),
  cm.configurationSha256,
);
assert.equal(
  digest("research/experiments/configs/confirmation-protocol.md"),
  cm.protocolSha256,
);
const priorSeeds = new Set([
  s.config.trainDataSeed,
  s.config.validationDataSeed,
  ...s.config.testDataSeeds,
  40001,
  40002,
]);
for (const seed of confirmation.config.testDataSeeds)
  assert.ok(!priorSeeds.has(seed));
assert.equal(confirmation.conditions.length, 4);
for (const c of confirmation.conditions) {
  assert.equal(c.shots, 100000);
  for (const key of ["neural", "fixedMatching", "matchedMatching"]) {
    const metric = c[key];
    assert.equal(metric.errorRate, metric.failures / c.shots);
    assert.ok(
      metric.ci95[0] <= metric.errorRate && metric.ci95[1] >= metric.errorRate,
    );
  }
  assert.equal(
    c.neural.reliability.reduce((n, b) => n + b.count, 0),
    c.shots,
  );
}
console.log(
  "Verified frozen checkpoint, pre-label protocol/source/config hashes and all 400,000 fresh-shot confirmation counts.",
);
const diagnostics = read("research/results/aggregates/diagnostics.json");
const dm = read(diagnostics.manifestPath);
assert.deepEqual(diagnostics.parentRunIds, [s.runId, confirmation.runId]);
assert.equal(dm.runId, diagnostics.runId);
for (const [file, hash] of Object.entries(dm.sourceAndInputHashes))
  assert.equal(digest(file), hash, `Diagnostic input ${file}`);
for (const [file, hash] of Object.entries(dm.outputHashes ?? {}))
  assert.equal(digest(file), hash, `Diagnostic output ${file}`);
for (const dataset of diagnostics.datasets) {
  const parent = dataset.source === "primary" ? s : confirmation;
  assert.equal(dataset.parentRunId, parent.runId);
  for (const c of dataset.conditions) {
    const original = parent.conditions.find(
      (p) => p.measurementNoise === c.measurementNoise,
    );
    assert.equal(c.shots, original.shots);
    assert.equal(c.prevalence, c.observableOneCount / c.shots);
    for (const [key, matrix] of Object.entries(c.confusion)) {
      assert.equal(
        Object.values(matrix).reduce((n, v) => n + v, 0),
        c.shots,
      );
      assert.equal(
        matrix.falsePositive + matrix.falseNegative,
        original[key].failures,
      );
      assert.equal(
        matrix.truePositive + matrix.falseNegative,
        c.observableOneCount,
      );
    }
    for (const g of [...c.confidenceBins, ...c.selectiveRisk]) {
      assert.equal(g.coverage, g.count / c.shots);
      if (g.count) {
        assert.equal(g.errorRate, g.failures / g.count);
        assert.equal(g.observedAccuracy, 1 - g.errorRate);
        assert.deepEqual(g.observedAccuracyCi95, [
          1 - g.ci95[1],
          1 - g.ci95[0],
        ]);
      } else {
        assert.equal(g.errorRate, null);
        assert.equal(g.ci95, null);
      }
    }
    assert.equal(
      c.confidenceBins.reduce((n, g) => n + g.count, 0),
      c.shots,
    );
    assert.equal(c.selectiveRisk[0].count, c.shots);
  }
}
const tc = read("research/results/aggregates/training-control.json");
const tm = read(tc.manifestPath);
assert.equal(tc.parentRunId, s.runId);
assert.equal(tm.runId, tc.runId);
assert.equal(tm.protocolCommittedBeforeFreshLabels, true);
assert.ok(
  Date.parse(tm.allCheckpointsFrozenAtUTC) <
    Date.parse(tm.testGenerationStartedAtUTC),
);
for (const [file, hash] of Object.entries({
  ...tm.sourceAndInputHashes,
  ...tm.outputHashes,
}))
  assert.equal(digest(file), hash, `Training control ${file}`);
const allControlSeeds = [
  ...tc.config.trainDataSeeds,
  ...tc.config.validationDataSeeds,
  ...tc.config.testDataSeeds,
];
assert.equal(new Set(allControlSeeds).size, 12);
for (const seed of allControlSeeds) {
  assert.ok(!priorSeeds.has(seed));
  assert.ok(!confirmation.config.testDataSeeds.includes(seed));
}
for (const c of tc.conditions) {
  assert.equal(c.shots, 100000);
  for (const fit of c.seeds) {
    for (const metric of [fit.fixedTraining, fit.matchedTraining])
      assert.equal(metric.errorRate, metric.failures / c.shots);
    assert.equal(
      Object.values(fit.paired).reduce((n, v) => n + v, 0),
      c.shots,
    );
    assert.equal(
      fit.paired.matchedOnlyCorrect + fit.paired.bothWrong,
      fit.fixedTraining.failures,
    );
    assert.equal(
      fit.paired.fixedOnlyCorrect + fit.paired.bothWrong,
      fit.matchedTraining.failures,
    );
    if (c.measurementNoise === 0.005)
      assert.deepEqual(fit.fixedTraining, fit.matchedTraining);
  }
}
console.log(
  "Verified reused-data diagnostics, exact confusion/coverage counts and separately frozen equal-budget training control on 400,000 fresh test shots.",
);
const followup = read("research/results/figures/follow-up/manifest.json");
assert.equal(digest(followup.generator), followup.scriptSha256);
for (const [file, hash] of Object.entries({
  ...followup.inputs,
  ...followup.preservedOriginalFigureFiles,
}))
  assert.equal(digest(file), hash, `Follow-up figure input/original ${file}`);
for (const [file, record] of Object.entries(followup.outputs))
  assert.equal(
    digest(`research/results/figures/follow-up/${file}`),
    record.sha256,
  );
console.log(
  "Verified six follow-up figure exports, their source/inputs, and byte-preservation of all original figures.",
);
