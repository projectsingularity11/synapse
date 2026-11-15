import fs from "node:fs";
const files = {
  "research/results/aggregates/diagnostics.json": "diagnostics.json",
  "research/results/aggregates/training-control.json": "training-control.json",
  "research/experiments/configs/training-control-protocol.md":
    "training-control-protocol.md",
  "research/results/training-control-note.md": "training-control-note.md",
  "research/results/diagnostics-note.md": "diagnostics-note.md",
  "research/glossary.md": "glossary.md",
  "research/experiments/manifests/training-circuit.stim":
    "training-circuit.stim",
  "research/experiments/manifests/training-model.dem": "training-model.dem",
  "research/results/aggregates/confirmation.json": "confirmation.json",
  "research/experiments/configs/confirmation-protocol.md":
    "confirmation-protocol.md",
  "research/results/aggregates/supplement.json": "supplement.json",
  "research/results/aggregates/topology.json": "topology.json",
  "research/results/representative-traces/handpicked.json": "handpicked.json",
  "research/results/aggregates/study.json": "study.json",
  "research/results/representative-traces/traces.json": "traces.json",
  "research/protocol.md": "protocol.md",
  "research/manuscripts/technical-report.md": "technical-report.md",
  "research/literature-review.md": "literature-review.md",
  "research/claims/claims.csv": "claims.csv",
  "research/sources/sources.json": "sources.json",
  "docs/dependency-audit.md": "dependency-audit.md",
  "docs/asset-register.csv": "asset-register.csv",
  "docs/qa-report.md": "qa-report.md",
  "docs/redesign-report.md": "redesign-report.md",
};
fs.mkdirSync("public/data", { recursive: true });
for (const [src, name] of Object.entries(files))
  if (fs.existsSync(src)) fs.copyFileSync(src, `public/data/${name}`);
const studyPath = "research/results/aggregates/study.json";
if (fs.existsSync(studyPath)) {
  const study = JSON.parse(fs.readFileSync(studyPath, "utf8"));
  const manifest = study.manifestPath;
  if (!manifest || !fs.existsSync(manifest))
    throw new Error("Run manifest missing");
  fs.copyFileSync(manifest, "public/data/manifest.json");
}
if (fs.existsSync(studyPath)) {
  const s = JSON.parse(fs.readFileSync(studyPath, "utf8"));
  const csv = (rows) =>
    rows
      .map((row) =>
        row
          .map((v) => '"' + String(v ?? "").replaceAll('"', '""') + '"')
          .join(","),
      )
      .join("\n") + "\n";
  const metricRows = [
    [
      "run_id",
      "measurement_flip_probability",
      "decoder",
      "seed",
      "shots",
      "failures",
      "logical_error_per_experiment",
      "wilson_95_lower",
      "wilson_95_upper",
      "brier",
    ],
  ];
  for (const c of s.conditions)
    for (const [key, label] of [
      ["neural", "neural"],
      ["fixedMatching", "fixed_matching"],
      ["matchedMatching", "matched_matching"],
    ]) {
      const m = c[key];
      metricRows.push([
        s.runId,
        c.measurementNoise,
        label,
        key === "neural" ? 101 : "",
        c.shots,
        m.failures,
        m.errorRate,
        ...m.ci95,
        m.brier ?? "",
      ]);
    }
  fs.writeFileSync("public/data/metrics.csv", csv(metricRows));
}
for (const name of ["logical-error-sweep", "calibration"])
  for (const ext of ["svg", "png", "pdf"]) {
    const p = `research/results/figures/${name}.${ext}`;
    if (fs.existsSync(p)) {
      fs.mkdirSync("public/figures", { recursive: true });
      fs.copyFileSync(p, `public/figures/${name}.${ext}`);
    }
  }

const confirmationPath = "research/results/aggregates/confirmation.json";
if (fs.existsSync(confirmationPath)) {
  const confirmation = JSON.parse(fs.readFileSync(confirmationPath, "utf8"));
  fs.copyFileSync(
    confirmation.manifestPath,
    "public/data/confirmation-manifest.json",
  );
}

fs.copyFileSync(
  "research/results/figures/LICENSE_DEJAVU.txt",
  "public/figures/LICENSE_DEJAVU.txt",
);

for (const name of ["diagnostics", "training-control"]) {
  const file = `research/results/aggregates/${name}.json`;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  fs.copyFileSync(data.manifestPath, `public/data/${name}-manifest.json`);
}
fs.cpSync("research/results/figures/follow-up", "public/figures/follow-up", {
  recursive: true,
});
fs.copyFileSync(
  "research/results/figures/LICENSE_DEJAVU.txt",
  "public/figures/follow-up/LICENSE_DEJAVU.txt",
);
