import { chromium } from "@playwright/test";
import fs from "node:fs";
const b = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const records = [],
  errors = [];
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3001";
for (const route of ["/", "/explore?noise=0.03", "/study"]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.addInitScript(() => {
    window.__longTasks = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries())
        window.__longTasks.push({ start: e.startTime, duration: e.duration });
    }).observe({ type: "longtask", buffered: true });
  });
  p.on("console", (m) => {
    if (m.type() === "error") errors.push({ route, message: m.text() });
  });
  await p.goto(base + route);
  await p.waitForTimeout(1000);
  if (route.startsWith("/explore")) {
    await p.getByLabel("Saved test shot").selectOption("4");
    await p.getByLabel("Reveal history").focus();
    await p.keyboard.press("End");
    await p.getByRole("button", { name: "Reveal decoder outcome" }).click();
  }
  records.push({
    route,
    ...(await p.evaluate(async () => {
      const samples = [];
      let previous = performance.now();
      await new Promise((resolve) => {
        function frame(t) {
          samples.push(t - previous);
          previous = t;
          if (samples.length < 120) requestAnimationFrame(frame);
          else resolve();
        }
        requestAnimationFrame(frame);
      });
      const sorted = [...samples].sort((a, b) => a - b);
      return {
        longTasks: window.__longTasks,
        canvasCount: document.querySelectorAll("canvas").length,
        raf: {
          count: samples.length,
          medianMs: sorted[Math.floor(sorted.length / 2)],
          p95Ms: sorted[Math.floor(sorted.length * 0.95)],
          note: "Idle browser rAF scheduling sample on SVG path; not GPU throughput or proof of sustained 60fps",
        },
        resources: performance
          .getEntriesByType("resource")
          .map((r) => ({
            name: r.name.split("/").slice(3).join("/"),
            transferSize: r.transferSize,
            decodedBodySize: r.decodedBodySize,
            duration: r.duration,
          })),
      };
    })),
  });
  await p.close();
}
await b.close();
const evidence = {
  date: new Date().toISOString(),
  browser: "system Chromium headless",
  viewport: "1440x1000",
  network:
    "local production server, unthrottled; fresh browser context per route",
  cpu: "unthrottled shared cloud Intel Xeon 8573C",
  errors,
  records,
};
fs.writeFileSync(
  "docs/qa/browser-profile.json",
  JSON.stringify(evidence, null, 2),
);
console.log(
  JSON.stringify(
    {
      errors,
      records: records.map((r) => ({
        route: r.route,
        longTasks: r.longTasks,
        raf: r.raf,
        canvasCount: r.canvasCount,
        jsTransferBytes: r.resources
          .filter((x) => x.name.endsWith(".js"))
          .reduce((a, r) => a + r.transferSize, 0),
        jsDecodedBytes: r.resources
          .filter((x) => x.name.endsWith(".js"))
          .reduce((a, r) => a + r.decodedBodySize, 0),
      })),
    },
    null,
    2,
  ),
);
