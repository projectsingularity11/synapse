import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
const root = process.cwd();
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "syndrome-data-"));
  fs.cpSync(path.join(root, "research"), path.join(dir, "research"), {
    recursive: true,
  });
  return dir;
}
function validate(dir) {
  return spawnSync(
    process.execPath,
    [path.join(root, "scripts/validate-data.mjs")],
    { cwd: dir, encoding: "utf8" },
  );
}
function alter(dir, file, fn) {
  const p = path.join(dir, file);
  const data = JSON.parse(fs.readFileSync(p));
  fn(data);
  fs.writeFileSync(p, JSON.stringify(data));
}
for (const [name, mutation] of [
  ["canonical artifacts pass", () => {}],
  [
    "cross-run supplement rejected",
    (d) =>
      alter(
        d,
        "research/results/aggregates/supplement.json",
        (s) => (s.parentRunId = "other-run"),
      ),
  ],
  [
    "changed source rejected",
    (d) =>
      fs.appendFileSync(
        path.join(d, "research/experiments/scripts/run.py"),
        "\n# changed\n",
      ),
  ],
  [
    "inconsistent sample counts rejected",
    (d) =>
      alter(
        d,
        "research/results/aggregates/study.json",
        (s) => (s.conditions[0].shots = 1),
      ),
  ],
  [
    "missing artifact rejected",
    (d) =>
      fs.unlinkSync(path.join(d, "research/results/aggregates/study.json")),
  ],
])
  test(name, () => {
    const dir = fixture();
    try {
      mutation(dir);
      const r = validate(dir);
      assert.equal(
        r.status === 0,
        name === "canonical artifacts pass",
        r.stderr,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
