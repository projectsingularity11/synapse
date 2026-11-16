import { test, expect, chromium } from "@playwright/test";
import { getStudy, getTraces } from "../lib/data";
const study = getStudy()!,
  traces = getTraces()!;
test("recorded demo uses actual detector bits, predictions and condition statistics", async ({
  page,
}) => {
  await page.goto("/demo?noise=0.03&shot=1&at=18");
  await expect(
    page.getByRole("heading", { name: "Recorded demo", exact: true }),
  ).toBeVisible();
  const trace = traces.traces.find(
    (t) => t.measurementNoise === 0.03 && t.shotIndex === 1,
  )!;
  await expect(page.locator(".demo-result")).toContainText(
    trace.neuralPrediction
      ? "Logical flip predicted"
      : "No logical flip predicted",
  );
  await expect(page.locator(".demo-shot-stats")).toContainText("24");
  expect(await page.locator(".demo-shot-stats dd").nth(1).textContent()).toBe(
    String(trace.detectionEvents.reduce((a, b) => a + b, 0)),
  );
  await expect(page.locator(".demo-evaluation")).toContainText("3.660");
  await page
    .getByLabel("Decoder", { exact: true })
    .selectOption("matchedMatching");
  await expect(page.locator(".demo-evaluation")).toContainText(
    (study.conditions[3].matchedMatching.errorRate * 100).toFixed(3),
  );
  await page
    .getByLabel("Measurement noise", { exact: true })
    .selectOption("0.005");
  await expect(
    page.getByRole("slider", { name: "Demo playback position" }),
  ).toHaveValue("0");
  await page.getByLabel("Saved shot", { exact: true }).selectOption("2");
  await page.getByRole("button", { name: /Decoder result/ }).click();
  await expect(page.locator(".demo-shot-stats dd").nth(1)).toHaveText("1");
  await expect(page.locator(".demo-result")).toContainText("prediction");
  await page.getByRole("button", { name: /Copy demo link/ }).click();
  await expect(page).toHaveURL(
    /noise=0.005&shot=2&decoder=matchedMatching&at=18/,
  );
  await page.reload();
  await expect(page.getByLabel("Saved shot", { exact: true })).toHaveValue("2");
  await expect(page.getByLabel("Decoder", { exact: true })).toHaveValue(
    "matchedMatching",
  );
  await expect(
    page.getByRole("slider", { name: "Demo playback position" }),
  ).toHaveValue("18");
});
test("playback, seeking, loop and camera controls work without WebGL", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: function (
        this: HTMLCanvasElement,
        kind: string,
        ...args: unknown[]
      ) {
        return /webgl/.test(kind)
          ? null
          : Reflect.apply(original, this, [kind, ...args]);
      },
    });
  });
  await page.goto("/demo");
  await expect(page.locator(".demo-scene")).toHaveAttribute(
    "data-renderer",
    "vector",
  );
  const slider = page.getByRole("slider", { name: "Demo playback position" });
  await page.getByRole("button", { name: "Play demo", exact: true }).click();
  await expect
    .poll(async () => Number(await slider.inputValue()))
    .toBeGreaterThan(0.4);
  await page.getByRole("button", { name: "Pause demo", exact: true }).click();
  const paused = Number(await slider.inputValue());
  await page.waitForTimeout(300);
  expect(Number(await slider.inputValue())).toBeCloseTo(paused, 1);
  await page.getByLabel("Playback speed").selectOption("2");
  await page.getByRole("button", { name: "Loop demo", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Loop demo", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await slider.fill("23.9");
  await page.getByRole("button", { name: "Play demo", exact: true }).click();
  await expect
    .poll(async () => Number(await slider.inputValue()))
    .toBeLessThan(5);
  await page.getByRole("button", { name: "Pause demo", exact: true }).click();
  await page.getByRole("button", { name: "Restart demo" }).click();
  await expect(slider).toHaveValue("0");
  const path = page.locator(".demo-scene svg>path").first();
  const before = await path.getAttribute("d");
  await page.getByRole("button", { name: "Top camera", exact: true }).click();
  await expect.poll(() => path.getAttribute("d")).not.toBe(before);
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "Zoom out", exact: true }).click();
  await page.getByLabel("Time layers").uncheck();
  await expect(page.getByLabel("Time layers")).not.toBeChecked();
});
test("demo fits phone, tablet and wide layouts with usable controls", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/demo");
    await expect(
      page.getByRole("button", { name: "Play demo", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      String(width),
    ).toBe(true);
  }
});
test("music attempts autoplay, falls back to a gesture and honors a saved pause", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    let calls = 0;
    HTMLMediaElement.prototype.play = function () {
      calls++;
      return calls === 1
        ? Promise.reject(
            new DOMException("Gesture required", "NotAllowedError"),
          )
        : original.call(this);
    };
  });
  await page.goto("/demo");
  await expect(
    page.getByRole("button", { name: /Sound settings. Music ready/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Play demo", exact: true }).click();
  await expect
    .poll(() =>
      page.locator("audio").evaluate((a) => !(a as HTMLAudioElement).paused),
    )
    .toBe(true);
  await page.getByRole("button", { name: /Sound settings/ }).click();
  await page.getByRole("button", { name: "Pause music", exact: true }).click();
  await page.getByRole("button", { name: "Close sound settings" }).click();
  await page.getByRole("button", { name: "Restart demo" }).click();
  expect(
    await page.locator("audio").evaluate((a) => (a as HTMLAudioElement).paused),
  ).toBe(true);
  await page.reload();
  expect(
    await page.locator("audio").evaluate((a) => (a as HTMLAudioElement).paused),
  ).toBe(true);
});
test("music starts on arrival when autoplay is permitted", async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(
      (process.env.TEST_BASE_URL || "http://127.0.0.1:3000") + "/demo",
    );
    await page.locator('.water-backdrop[data-ready="true"]').waitFor({ state: "attached" });
    await expect
      .poll(() =>
        page
          .locator("audio")
          .evaluate((a) => (a as HTMLAudioElement).currentTime),
      )
      .toBeGreaterThan(0.05);
    expect(
      await page
        .locator("audio")
        .evaluate((a) => (a as HTMLAudioElement).volume),
    ).toBeCloseTo(0.18, 2);
  } finally {
    await browser.close();
  }
});
test("reduced motion keeps gentle ambient drift and completely removes cursor effects", async ({
  page,
}) => {
  await page.goto("/demo");
  const light = page.locator(".ambient-light--silver");
  await expect
    .poll(() =>
      light.evaluate(
        (e) =>
          e.getAnimations().filter((a) => a.playState === "running").length,
      ),
    )
    .toBeGreaterThan(0);
  const before = await light.evaluate((e) => getComputedStyle(e).transform);
  await page.waitForTimeout(350);
  expect(await light.evaluate((e) => getComputedStyle(e).transform)).not.toBe(
    before,
  );
  await page.mouse.move(900, 400);
  await page.waitForTimeout(250);
  expect(
    Math.abs(
      await light.evaluate((e) =>
        parseFloat(e.style.getPropertyValue("--ambient-x")),
      ),
    ),
  ).toBeLessThan(40);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      light.evaluate((e) =>
        e.getAnimations().some((a) => a.playState === "running"),
      ),
    )
    .toBe(true);
  await expect(page.locator(".water-backdrop")).toBeHidden();
  await page.mouse.move(300, 250);
  await expect(page.locator(".cursor-tracker")).toBeHidden();
  await expect(page.locator(".cursor-point")).toBeHidden();
  expect(
    await light.evaluate(
      (e) => e.getAnimations()[0].effect?.getComputedTiming().duration,
    ),
  ).toBeGreaterThan(30000);
  await expect
    .poll(() => light.evaluate((e) => e.style.getPropertyValue("--ambient-x")))
    .toBe("");
});
test("accelerated scene renders actual WebGL and recovers from context loss", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.addInitScript(() => {
    for (const type of [WebGLRenderingContext, WebGL2RenderingContext]) {
      const original = type.prototype.getParameter;
      type.prototype.getParameter = function (parameter: number) {
        const value = Reflect.apply(original, this, [parameter]);
        return typeof value === "string" &&
          /swiftshader|llvmpipe|softpipe|software/i.test(value)
          ? "Test accelerated adapter"
          : value;
      };
    }
  });
  await page.setViewportSize({ width: 800, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demo?at=18");
  await expect(page.locator(".demo-scene")).toHaveAttribute(
    "data-renderer",
    "webgl",
    { timeout: 25000 },
  );
  const canvas = page.locator(".demo-scene canvas");
  expect((await canvas.screenshot()).byteLength).toBeGreaterThan(1000);
  await canvas.evaluate((c) =>
    c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
  );
  await expect(page.locator(".demo-scene")).toHaveAttribute(
    "data-renderer",
    "vector",
  );
  await expect(page.locator(".demo-scene svg")).toBeVisible();
});
