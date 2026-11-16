import { test, expect } from "@playwright/test";

const routes = ["/", "/explore", "/demo", "/explore/failures", "/study", "/study/paper", "/study/confirmation", "/study/diagnostics", "/study/training-control", "/methods", "/methods/glossary", "/methods/circuit", "/sources", "/about", "/credits", "/accessibility"];
for (const [width, height] of [[320, 740], [390, 844], [600, 960], [768, 1024], [1024, 768], [1440, 1000], [2560, 1440], [844, 390]]) {
  test(`finished layouts fit ${width}×${height} without header overlap`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    for (const route of routes) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await page.locator(".experience-loader").waitFor({ state: "hidden" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${route}: document width`).toBeLessThanOrEqual(width);
      const header = await page.locator(".cinema-header").evaluate(el => {
        const rect = el.getBoundingClientRect();
        const children = [...el.children].filter(e => getComputedStyle(e).display !== "none").map(e => e.getBoundingClientRect()).filter(r => r.width && r.height && r.top < rect.bottom);
        return { left: rect.left, right: rect.right, overlaps: children.some((a, i) => children.slice(i + 1).some(b => Math.min(a.right,b.right)-Math.max(a.left,b.left)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)) };
      });
      expect(header.left, route).toBeGreaterThanOrEqual(0);
      expect(header.right, route).toBeLessThanOrEqual(width);
      expect(header.overlaps, `${route}: header controls overlap`).toBe(false);
      if (route === "/") {
        const title = await page.locator(".cinema-title").boundingBox();
        const art = await page.locator(".hero-stage").boundingBox();
        expect(title).toBeTruthy(); expect(art).toBeTruthy();
        if (width <= 1000) expect(art!.y, "stacked artwork starts after the introduction").toBeGreaterThanOrEqual(title!.y + title!.height);
      }
      if ([390, 768, 1440, 2560].includes(width) && ["/", "/demo", "/study/paper", "/about"].includes(route)) {
        await page.screenshot({ path: test.info().outputPath(`${route.replaceAll("/", "-") || "home"}-${width}.png`) });
      }
    }
    expect(errors).toEqual([]);
  });
}

test("compact pointer stays local, touch creates no trail, and reduced effects remove it", async ({ page }) => {
  await page.goto("/");
  const backdrop = page.locator(".water-backdrop");
  await expect(backdrop).toHaveAttribute("data-ready", "true");
  await page.mouse.move(640, 350);
  await page.mouse.move(750, 400, { steps: 8 });
  await expect(page.locator(".cursor-tracker")).toBeVisible();
  expect(await page.locator(".cursor-tracker").evaluate(e => e.getBoundingClientRect().width)).toBeLessThanOrEqual(10);
  const count = await backdrop.getAttribute("data-ripples");
  await page.dispatchEvent("body", "pointermove", { pointerType: "touch", clientX: 100, clientY: 200 });
  await expect(backdrop).toHaveAttribute("data-touch", "true");
  expect(await backdrop.getAttribute("data-ripples")).toBe(count);
  await expect(page.locator(".cursor-tracker")).toHaveCSS("opacity", "0");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(backdrop).toBeHidden();
});

test("landscape menus and sound settings remain scrollable and within the screen", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  const nav = page.getByRole("navigation", { name: "Main", exact: true });
  await expect(nav).toBeVisible();
  const bounds = await nav.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(390);
  await nav.getByRole("link", { name: "About me" }).click();
  await expect(page).toHaveURL(/about$/);
  await page.getByRole("button", { name: /Sound settings/ }).click();
  const panel = page.getByRole("region", { name: "Sound settings" });
  await expect(panel).toBeVisible();
  const box = await panel.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(844);
  expect(box!.y + box!.height).toBeLessThanOrEqual(390);
});
