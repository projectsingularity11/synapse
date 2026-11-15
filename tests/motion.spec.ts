import { test, expect } from "@playwright/test";

test("wheel input interpolates through multiple scroll positions", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-scroll-engine",
    "lenis",
  );
  await page.mouse.move(400, 300);
  const sampling = page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        window.addEventListener(
          "wheel",
          () => {
            const ys: number[] = [window.scrollY];
            let n = 0;
            const frame = () => {
              ys.push(window.scrollY);
              if (++n === 22) resolve(ys);
              else requestAnimationFrame(frame);
            };
            requestAnimationFrame(frame);
          },
          { once: true },
        );
        document.documentElement.dataset.wheelSampling = "ready";
      }),
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-wheel-sampling",
    "ready",
  );
  await page.mouse.wheel(0, 700);
  const positions = await sampling;
  expect(new Set(positions.map(Math.round)).size).toBeGreaterThan(4);
  expect(positions.at(-1)!).toBeGreaterThan(positions[0] + 100);
});

test("guided chapters move sideways without CSS scroll timelines", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = CSS.supports.bind(CSS);
    CSS.supports = ((...args: string[]) =>
      args.some((a) => a.includes("animation-timeline"))
        ? false
        : Reflect.apply(original, CSS, args)) as typeof CSS.supports;
  });
  await page.goto("/");
  const section = page.locator(".learning-chapters");
  await expect(section).toHaveAttribute("data-guided", "true");
  await page.evaluate(() =>
    window.scrollTo(
      0,
      document.querySelector<HTMLElement>(".learning-chapters")!.offsetTop,
    ),
  );
  await page.waitForTimeout(100);
  await page.getByRole("button", { name: "Next concept" }).click();
  await expect(page.locator(".learning-navigation>span")).toContainText(
    "2 / 3",
  );
  await page.waitForTimeout(1200);
  const location = await page.locator(".learning-slide").nth(1).boundingBox();
  expect(location!.x).toBeGreaterThan(-15);
  expect(location!.x).toBeLessThan(100);
  await page.getByRole("button", { name: "Previous concept" }).click();
  await expect(page.locator(".learning-navigation>span")).toContainText(
    "1 / 3",
  );
});

test("cursor produces rendered ripples and glass highlights", async ({
  page,
}) => {
  await page.goto("/");
  const water = page.locator(".water-backdrop");
  await expect(water).toHaveAttribute("data-ready", "true");
  const before = Number((await water.getAttribute("data-ripples")) ?? 0);
  const pixels = await page
    .locator(".water-backdrop canvas:visible")
    .screenshot();
  await page.mouse.move(900, 400);
  await page.mouse.move(1100, 600, { steps: 10 });
  await expect(page.locator(".cursor-lens")).toHaveAttribute(
    "data-visible",
    "true",
  );
  await expect
    .poll(async () => Number((await water.getAttribute("data-ripples")) ?? 0))
    .toBeGreaterThan(before);
  await page.waitForTimeout(120);
  const after = await page
    .locator(".water-backdrop canvas:visible")
    .screenshot();
  expect(after.equals(pixels)).toBe(false);
  await page.setViewportSize({ width: 768, height: 900 });
  await page.mouse.move(450, 400, { steps: 5 });
  await expect(page.locator(".cursor-lens")).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator(".hero-question .glass-surface").hover();
  await expect
    .poll(() =>
      page
        .locator(".hero-question .glass-surface")
        .evaluate((el) => el.style.getPropertyValue("--glint-x")),
    )
    .not.toBe("");
});

test("WebGL failure keeps a real 2D ripple renderer and all reading content", async ({
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
  await expect(page.locator(".water-backdrop")).toHaveAttribute(
    "data-renderer",
    "canvas2d",
  );
  await page.mouse.move(450, 350, { steps: 8 });
  await page.mouse.down();
  await page.mouse.up();
  await expect
    .poll(async () =>
      Number(
        (await page.locator(".water-backdrop").getAttribute("data-ripples")) ??
          0,
      ),
    )
    .toBeGreaterThan(0);
  await expect(page.locator(".water-fallback")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("system and saved reduced motion can explicitly restore full effects", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-effects", "reduced");
  await expect(
    page.getByRole("button", { name: "Reduced effects" }),
  ).toHaveText(/Reduced/);
  await page.getByRole("button", { name: "Reduced effects" }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-choice",
    "full",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-scroll-engine",
    "lenis",
  );
  await expect(page.locator(".learning-chapters")).toHaveAttribute(
    "data-guided",
    "true",
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-effects", "full");
  await page.getByRole("button", { name: "Reduced effects" }).click();
  await expect(page.locator(".learning-chapters")).toHaveAttribute(
    "data-guided",
    "false",
  );
  await page.mouse.move(400, 400);
  await expect(page.locator(".cursor-lens")).toBeHidden();
});

test("touch visitors can advance the foundations without wheel or cursor", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".learning-chapters")).toHaveAttribute(
    "data-guided",
    "false",
  );
  await page.getByRole("button", { name: "Next concept" }).click();
  await expect(page.locator(".learning-navigation>span")).toContainText(
    "2 / 3",
  );
  await expect
    .poll(() =>
      page.locator(".learning-window").evaluate((el) => el.scrollLeft),
    )
    .toBeGreaterThan(250);
  const next = page.getByRole("button", { name: "Next concept" });
  await next.click();
  await expect(page.locator(".learning-navigation>span")).toContainText(
    "3 / 3",
  );
  await expect(
    page.getByRole("button", { name: "Mark data qubit 1" }),
  ).toBeVisible();
});

test("hardware-selected WebGL path actually draws and recovers after context loss", async ({
  page,
}) => {
  // Exercise the hardware branch using real software GL drawing, not a physical-GPU claim.
  await page.addInitScript(() => {
    const original = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (
      parameter: number,
    ) {
      const value = Reflect.apply(original, this, [parameter]);
      return typeof value === "string" &&
        /swiftshader|llvmpipe|softpipe|software/i.test(value)
        ? "Test accelerated adapter"
        : value;
    };
  });
  await page.goto("/");
  await expect(page.locator(".water-backdrop")).toHaveAttribute(
    "data-renderer",
    "webgl",
  );
  await expect(page.locator(".water-backdrop")).toHaveAttribute(
    "data-ready",
    "true",
  );
  const canvas = page.locator(".water-backdrop canvas").first();
  const before = await canvas.screenshot();
  await page.mouse.move(900, 450, { steps: 10 });
  await page.waitForTimeout(150);
  expect((await canvas.screenshot()).equals(before)).toBe(false);
  await canvas.evaluate((c) =>
    c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
  );
  await expect(page.locator(".water-backdrop")).toHaveAttribute(
    "data-renderer",
    "canvas2d",
  );
  await expect(page.locator(".water-fallback")).toBeVisible();
});
