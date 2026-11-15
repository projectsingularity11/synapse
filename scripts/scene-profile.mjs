import { chromium } from "@playwright/test";
import fs from "node:fs";
const b = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto(
  (process.env.TEST_BASE_URL ?? "http://127.0.0.1:3001") +
    "/explore/failures?noise=0.03",
);
await p.getByLabel("Reveal history").focus();
await p.keyboard.press("End");
await p.getByRole("button", { name: "Open spatial view" }).click();
await p.locator(".spatial-section").scrollIntoViewIfNeeded();
await p.locator("canvas[data-context-loss-ready=true]").waitFor();
await p.evaluate(() => {
  window.__sceneTimes = [];
  window.__sceneLongTasks = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__sceneLongTasks.push(e.duration);
  }).observe({ type: "longtask" });
  let previous = performance.now();
  function frame(t) {
    window.__sceneTimes.push(t - previous);
    previous = t;
    if (window.__sceneTimes.length < 180) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});
const box = await p.locator("canvas").boundingBox();
await p.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.5);
await p.mouse.down();
for (let i = 0; i < 70; i++) {
  await p.mouse.move(
    box.x + box.width * (0.45 + 0.2 * Math.sin(i / 12)),
    box.y + box.height * (0.5 + 0.12 * Math.cos(i / 12)),
  );
  await p.waitForTimeout(20);
}
await p.mouse.up();
await p.waitForFunction(() => window.__sceneTimes.length >= 180);
const result = await p.evaluate(() => {
  const times = window.__sceneTimes.slice(1).sort((a, b) => a - b);
  const canvas = document.querySelector("canvas"),
    gl = canvas.getContext("webgl2");
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return {
    samples: times.length,
    medianMs: times[Math.floor(times.length * 0.5)],
    p95Ms: times[Math.floor(times.length * 0.95)],
    maxMs: Math.max(...times),
    longTasks: window.__sceneLongTasks,
    renderer: ext
      ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
      : "unavailable",
    webglVersion: gl.getParameter(gl.VERSION),
  };
});
await p
  .locator(".spatial-section")
  .screenshot({ path: "docs/qa/scene-active.png" });
await b.close();
const evidence = {
  date: new Date().toISOString(),
  route: "/explore/failures?noise=0.03",
  viewport: "1440x1000",
  device:
    "shared cloud Intel Xeon 8573C; headless Chromium; SwiftShader software WebGL",
  network: "local unthrottled",
  cpuThrottle: "none",
  quality: "on-demand instanced24 nodes; DPRcap1.5; no shadows/postprocessing",
  scope:
    "Browser rAF intervals during scripted pointer rotation, including JS/API scheduling. Not GPU render durations or a physical desktop 60fps certification.",
  errors,
  result,
};
fs.writeFileSync(
  "docs/qa/scene-profile.json",
  JSON.stringify(evidence, null, 2),
);
console.log(JSON.stringify(evidence, null, 2));
