import { test, expect } from "@playwright/test";
test("wheel input scrolls the complete narrative", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-scroll-engine",
    "lenis",
  );
  await page.mouse.move(350, 350);
  await page.mouse.wheel(0, 650);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
});
test("scroll changes the 3D explanation and keyboard seeking reaches every step", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".water-backdrop")).toHaveAttribute(
    "data-ready",
    "true",
  );
  const section = page.locator(".research-film");
  const bounds = await section.evaluate((el) => ({
    top: (el as HTMLElement).offsetTop,
    height: el.clientHeight,
  }));
  await page.evaluate(
    (b) => scrollTo(0, b.top + (b.height - innerHeight) * 0.66),
    bounds,
  );
  await expect(section).toHaveAttribute("data-chapter", "2");
  await expect(
    page.getByRole("heading", {
      name: "Why the decoder needs a history of measurements",
    }),
  ).toBeVisible();
  await expect(page.locator(".film-data")).toContainText(
    "2 EVENTS / 24 DETECTORS",
  );
  const slider = page.getByRole("slider", { name: "Scene progress" });
  await slider.focus();
  await page.keyboard.press("End");
  await expect(section).toHaveAttribute("data-chapter", "3");
  await expect(page.locator(".film-outcome")).toBeVisible();
  await page.keyboard.press("Home");
  await expect(section).toHaveAttribute("data-chapter", "0");
});
test("the water trail and mouse tracker remain present on the paper and about routes", async ({
  page,
}) => {
  for (const route of ["/", "/study/paper", "/about"]) {
    await page.goto(route);
    const water = page.locator(".water-backdrop");
    await expect(water).toHaveAttribute("data-ready", "true");
    const count = Number((await water.getAttribute("data-ripples")) || 0);
    await page.mouse.move(750, 350);
    await page.mouse.move(900, 450, { steps: 10 });
    await expect(water).toHaveAttribute("data-pointer", "true");
    await expect(page.locator(".cursor-tracker")).toBeVisible();
    await expect
      .poll(async () => Number(await water.getAttribute("data-ripples")))
      .toBeGreaterThan(count);
    expect(
      await water.evaluate((el) => getComputedStyle(el).pointerEvents),
    ).toBe("none");
  }
});
test("WebGL unavailable retains complete 3D posters, controls and research", async ({
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
        return kind === "webgl" || kind === "webgl2"
          ? null
          : Reflect.apply(original, this, [kind, ...args]);
      },
    });
  });
  await page.goto("/");
  await expect(page.locator(".hero-stage")).toHaveAttribute(
    "data-renderer",
    "poster",
  );
  await expect
    .poll(() =>
      page
        .locator(".hero-stage .quantum-poster")
        .evaluate((el) => (el as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Show step 4: Decode" }).click();
  await expect(page.locator(".story-stage .quantum-poster")).toHaveAttribute(
    "src",
    "/art/quantum-3.webp",
  );
  await expect(page.locator(".film-outcome")).toContainText("no logical flip");
});
test("reduced motion pauses the poster and tracker, and full motion can be restored", async ({
  page,
}) => {
  // WebKit may initialize actual WebGL twice here, including after the reload.
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-effects", "reduced");
  await expect(page.locator(".hero-stage")).toHaveAttribute(
    "data-renderer",
    /poster|webgl/,
  );
  await page.mouse.move(400, 300);
  await expect(page.locator(".cursor-tracker")).toBeHidden();
  await page.getByRole("button", { name: /Reduced effects/ }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-choice",
    "full",
  );
  await expect
    .poll(() =>
      page
        .locator(".hero-stage .quantum-poster")
        .evaluate((el) =>
          el.closest<HTMLElement>(".hero-stage")?.dataset.renderer === "webgl"
            ? !el.closest(".hero-stage")!.querySelector("canvas")!.hidden
            : el.getAnimations().some((a) => a.playState === "running"),
        ),
    )
    .toBe(true);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-effects", "full");
  await page.getByRole("button", { name: /Reduced effects/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-effects", "reduced");
});
test("a touch visitor can move between steps using the native slider", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:3000",
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-scroll-engine",
    "lenis",
  );
  const slider = page.getByRole("slider", { name: "Scene progress" });
  await slider.scrollIntoViewIfNeeded();
  const box = await slider.boundingBox();
  await page.touchscreen.tap(box!.x + box!.width - 2, box!.y + box!.height / 2);
  await expect(page.locator(".research-film")).toHaveAttribute(
    "data-chapter",
    "3",
  );
  await expect(
    page.getByRole("heading", {
      name: "How the neural network makes its final prediction",
    }),
  ).toBeVisible();
  await context.close();
});
test("real WebGL rendering and context loss exercise the accelerated scene branch", async ({
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
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 640, height: 640 });
  await page.goto("/");
  await expect(page.locator(".hero-stage")).toHaveAttribute(
    "data-renderer",
    "webgl",
    { timeout: 20000 },
  );
  const canvas = page.locator(".hero-stage canvas");
  expect((await canvas.screenshot()).byteLength).toBeGreaterThan(1000);
  await canvas.evaluate((c) =>
    c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
  );
  await expect(page.locator(".hero-stage")).toHaveAttribute(
    "data-renderer",
    "poster",
  );
  await expect(page.locator(".water-backdrop")).toHaveAttribute(
    "data-ready",
    "true",
  );
});
test("mobile chapter selection keeps the explanation in view with reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Show step 3: Remember" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Why the decoder needs a history of measurements",
    }),
  ).toBeInViewport({ ratio: 0.9 });
  await expect
    .poll(() =>
      page
        .locator(".story-stage .quantum-poster")
        .evaluate((el) => (el as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
});
