// Production interaction cadence. Run alone, without parallel browser tests or builds.
import fs from "node:fs";
import { chromium } from "@playwright/test";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3001";
const outputDir = process.env.PROFILE_OUTPUT_DIR || "docs/qa/ember";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-gpu", "--enable-unsafe-swiftshader"],
});
const results = [];
try {
  for (const scenario of [
    { name: "desktop-hero", width: 1440, route: "/", kind: "hero" },
    { name: "phone-hero", width: 390, route: "/", kind: "hero" },
    { name: "desktop-drag-history", width: 1440, route: "/", kind: "story" },
    { name: "phone-drag-history", width: 390, route: "/", kind: "story" },
    {
      name: "horizontal-explanation-scroll",
      width: 1440,
      route: "/",
      kind: "scroll",
    },
    {
      name: "paper-water-tracker",
      width: 1440,
      route: "/study/paper",
      kind: "paper",
    },
  ]) {
    const context = await browser.newContext({
      viewport: {
        width: scenario.width,
        height: scenario.width === 390 ? 844 : 1000,
      },
    });
    const page = await context.newPage();
    await page.goto(base + scenario.route);
    await page.locator(".water-backdrop[data-ready=true]").waitFor();
    await page.waitForTimeout(1400);
    if (scenario.kind === "story") {
      await page.getByRole("button", { name: "Show step 3: Remember" }).click();
      await page.waitForTimeout(900);
    }
    if (scenario.kind === "scroll") {
      await page
        .locator(".research-film")
        .evaluate((el) => scrollTo(0, el.offsetTop));
      await page.waitForTimeout(300);
    }
    const selector =
      scenario.kind === "story"
        ? ".story-stage"
        : scenario.kind === "hero"
          ? ".hero-stage"
          : "main";
    if (scenario.kind === "story") {
      const bounds = await page.locator(selector).boundingBox();
      await page.mouse.move(
        bounds.x + bounds.width * 0.5,
        bounds.y + bounds.height * 0.5,
      );
      await page.mouse.down();
    }
    const result = await page.evaluate(
      ({ selector, kind }) =>
        new Promise((resolve) => {
          const target = document.querySelector(selector),
            rect = target.getBoundingClientRect(),
            deltas = [],
            longTasks = [];
          let last = 0,
            index = 0;
          const observer = new PerformanceObserver((list) =>
            longTasks.push(
              ...list
                .getEntries()
                .map((e) => ({ start: e.startTime, duration: e.duration })),
            ),
          );
          observer.observe({ type: "longtask", buffered: false });
          const section = document.querySelector(".research-film"),
            storyTop = section?.offsetTop || 0,
            travel = (section?.offsetHeight || 0) - innerHeight;
          function sample(stamp) {
            if (last) deltas.push(stamp - last);
            last = stamp;
            const angle = index * 0.09;
            target.dispatchEvent(
              new PointerEvent("pointermove", {
                clientX: Math.max(
                  10,
                  Math.min(
                    innerWidth - 10,
                    rect.left + rect.width * 0.5 + Math.sin(angle) * 90,
                  ),
                ),
                clientY: Math.max(
                  120,
                  Math.min(
                    innerHeight - 30,
                    rect.top +
                      Math.min(rect.height, innerHeight) * 0.5 +
                      Math.cos(angle) * 55,
                  ),
                ),
                pointerId: 1,
                pointerType: "mouse",
                bubbles: true,
              }),
            );
            if (kind === "scroll")
              scrollTo(0, storyTop + travel * (index / 180));
            if (++index < 181) requestAnimationFrame(sample);
            else {
              observer.disconnect();
              const sorted = deltas.toSorted((a, b) => a - b);
              resolve({
                frames: deltas.length,
                fps: 1000 / (deltas.reduce((a, b) => a + b, 0) / deltas.length),
                medianMs: sorted[Math.floor(sorted.length * 0.5)],
                p95Ms: sorted[Math.floor(sorted.length * 0.95)],
                over25ms: deltas.filter((v) => v > 25).length,
                longTasks,
                sceneRenderer:
                  document.querySelector(
                    kind === "story" ? ".story-stage" : ".hero-stage",
                  )?.dataset.renderer || null,
                waterRenderer:
                  document.querySelector(".water-backdrop").dataset.renderer,
              });
            }
          }
          requestAnimationFrame(sample);
        }),
      { selector, kind: scenario.kind },
    );
    if (scenario.kind === "story") await page.mouse.up();
    results.push({ scenario: scenario.name, width: scenario.width, ...result });
    await context.close();
  }
  const report = {
    base,
    scope:
      "180 requestAnimationFrame intervals during continuous pointer input, held-pointer drag, or narrative scrolling per scenario. CPU-composited Chromium with software WebGL detection; this measures browser scheduling, not physical presentation or a guarantee for every device.",
    results,
  };
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    `${outputDir}/frame-cadence.json`,
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
