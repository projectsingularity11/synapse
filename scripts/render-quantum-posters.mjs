// Generate original WebP fallbacks from the same geometry/materials as the accelerated scene.
// Requires the development dependencies and system Chromium. It does not alter scientific data.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { chromium } from "@playwright/test";
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "synapse-posters-"));
const bundle = path.join(temporary, "world.js");
execFileSync(
  "npm",
  [
    "exec",
    "--yes",
    "--package=esbuild@0.25.12",
    "--",
    "esbuild",
    "lib/quantum-world.ts",
    "--bundle",
    "--format=iife",
    "--global-name=Quantum",
    `--outfile=${bundle}`,
  ],
  { stdio: "inherit" },
);
const study = JSON.parse(
    fs.readFileSync("research/results/aggregates/study.json", "utf8"),
  ),
  traces = JSON.parse(
    fs.readFileSync(
      "research/results/representative-traces/traces.json",
      "utf8",
    ),
  );
const events = traces.traces.find(
  (t) => t.measurementNoise === 0.03 && t.shotIndex === 1,
).detectionEvents;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage();
  await page.setContent('<canvas width="1400" height="1100"></canvas>');
  await page.addScriptTag({ path: bundle });
  for (const name of ["hero", "0", "1", "2", "3"]) {
    const data = await page.evaluate(
      ({ name, detectors, events }) => {
        const canvas = document.querySelector("canvas"),
          world = Quantum.createQuantumWorld({
            canvas,
            mode: name === "hero" ? "hero" : "story",
            detectors,
            events,
          });
        world.resize(1400, 1100, 0.72);
        world.render({
          time: 0,
          progress: name === "hero" ? 0 : Number(name) / 4 + 0.01,
          pointerX: 0,
          pointerY: 0,
          rotation: 0,
          reduced: true,
          pressed: false,
        });
        const data = canvas.toDataURL("image/png");
        world.dispose();
        return data;
      },
      { name, detectors: study.detectors, events },
    );
    await sharp(Buffer.from(data.split(",")[1], "base64"))
      .removeAlpha()
      .webp({ quality: 87 })
      .toFile(`public/art/quantum-${name}.webp`);
    if (name !== "3")
      await page.setContent('<canvas width="1400" height="1100"></canvas>');
  }
} finally {
  await browser.close();
  fs.rmSync(temporary, { recursive: true, force: true });
}
