import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "/",
  "/explore",
  "/explore/failures",
  "/study",
  "/study/paper",
  "/study/confirmation",
  "/study/diagnostics",
  "/study/training-control",
  "/methods",
  "/methods/glossary",
  "/methods/circuit",
  "/sources",
  "/about",
  "/credits",
  "/accessibility",
];
for (const route of routes)
  test(`direct navigation and accessibility ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(route);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toBeVisible();
    expect(errors).toEqual([]);
    const a = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(a.violations).toEqual([]);
  });
test("replay discrete settings, URL, scrubber, withheld outcome and selection", async ({
  page,
}) => {
  await page.goto("/explore?noise=0.03");
  const noise = page.getByLabel("Measurement-flip probability");
  await expect(noise).toHaveValue("0.03");
  await expect(page.getByText("Simulator truth · observable flip")).toHaveCount(
    0,
  );
  await page.getByLabel("Saved test shot").selectOption("4");
  await page.getByLabel("Reveal history").focus();
  await page.keyboard.press("End");
  await expect(page.locator("output")).toHaveText("t = 3");
  await page.getByRole("button", { name: "Reveal decoder outcome" }).click();
  await expect(
    page.getByText("Simulator truth · observable flip"),
  ).toBeVisible();
  await noise.selectOption("0.005");
  await expect(page).toHaveURL(/noise=0.005/);
  await expect(page.getByText("Simulator truth · observable flip")).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Reset replay" }).click();
  await expect(page.locator("output")).toHaveText("t = 0");
});
test("calibration uses measured setting and actual bin counts", async ({
  page,
}) => {
  await page.goto("/study");
  await page.getByLabel("Evaluation measurement noise").selectOption("3");
  await expect(page.getByText("Brier score:")).toContainText("0.03102");
  await page
    .getByText("Inspect calibration bins, counts and uncertainty")
    .click();
  const rows = page
    .getByRole("table", { name: /Calibration bins at/ })
    .locator("tbody tr");
  expect(await rows.count()).toBe(10);
  expect(await rows.first().innerText()).toContain("17,638");
});
test("mobile menu, no horizontal document overflow, no WebGL dependency", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const route of routes) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await page
    .getByRole("navigation", { name: "Main", exact: true })
    .getByRole("link", { name: "Explore", exact: true })
    .click();
  await expect(page).toHaveURL(/explore/);
  await expect(page.locator(".spatial-section canvas")).toHaveCount(0);
});
test("system reduced motion is clear and full-motion override persists", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page
      .locator("audio")
      .evaluate((el) => (el as HTMLAudioElement).paused),
  ).toBe(true);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-effects", "reduced");
  await page.getByRole("button", { name: "Reduced effects" }).click();
  expect(await page.locator("html").getAttribute("data-effects")).toBe("full");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-effects", "full");
});
test("download links resolve to real data and public source records", async ({
  request,
}) => {
  for (const path of [
    "/data/study.json",
    "/data/traces.json",
    "/data/manifest.json",
    "/data/claims.csv",
    "/data/sources.json",
    "/data/technical-report.md",
  ]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
    expect((await res.body()).length).toBeGreaterThan(50);
  }
});
test("missing address has deliberate not-found state", async ({ page }) => {
  const r = await page.goto("/no-such-trace");
  expect(r?.status()).toBe(404);
  await expect(page.getByText("Trace not found.")).toBeVisible();
});

test("selected gallery labels its bias and deep-links exact trace", async ({
  page,
}) => {
  await page.goto("/explore/failures?noise=0.03");
  await expect(
    page.getByText("HANDPICKED / NOT REPRESENTATIVE.", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Saved test shot").selectOption("1");
  await expect(page).toHaveURL(/trace=handpicked/);
  await page.reload();
  await expect(page.getByLabel("Saved test shot")).toHaveValue("1");
  await page.getByRole("button", { name: "Reveal decoder outcome" }).click();
  await expect(
    page.getByText("Simulator truth · observable flip"),
  ).toBeVisible();
  await expect(
    page.getByText("Predictions use the complete saved 24-bit history", {
      exact: false,
    }),
  ).toBeVisible();
});
test("WebGL unavailable retains usable complete 2D replay", async ({
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
        return kind === "webgl2"
          ? null
          : Reflect.apply(original, this, [kind, ...args]);
      },
    });
  });
  await page.goto("/explore");
  await page.getByRole("button", { name: "Open spatial view" }).click();
  await expect(
    page.getByText("WebGL 2 is unavailable.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reveal decoder outcome" }).click();
  await expect(
    page.getByText("Simulator truth · observable flip"),
  ).toBeVisible();
});
test("spatial view mounts on gesture, camera buttons and context-loss fallback work", async ({
  page,
}) => {
  await page.goto("/explore/failures?noise=0.03");
  await expect(page.locator(".spatial-section canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Open spatial view" }).click();
  await page.locator(".spatial-section").scrollIntoViewIfNeeded();
  await expect(page.locator(".spatial-section canvas")).toBeVisible();
  await page.getByRole("button", { name: "Front camera" }).click();
  await expect(
    page.getByRole("button", { name: "Front camera" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".spatial-section canvas")).toHaveAttribute(
    "data-context-loss-ready",
    "true",
  );
  await page
    .locator(".spatial-section canvas")
    .evaluate((c) =>
      c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
    );
  await expect(
    page.getByText("WebGL context lost.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close spatial view" }).click();
  await expect(page.locator(".spatial-section canvas")).toHaveCount(0);
});
test("source claims resolve to source records", async ({ page }) => {
  await page.goto("/sources");
  await expect(
    page.getByRole("heading", { name: "Check each claim." }),
  ).toBeVisible();
  await page.locator('#C05 a[href="#S05"]').click();
  await expect(page).toHaveURL(/#S05/);
  await expect(page.locator("#S05")).toBeVisible();
});

test("fresh-shot confirmation remains separate from original results", async ({
  page,
  request,
}) => {
  await page.goto("/study/confirmation");
  await expect(
    page.getByText(
      "no retraining, recalibration, threshold tuning or checkpoint selection.",
      { exact: false },
    ),
  ).toBeVisible();
  const data = await (await request.get("/data/confirmation.json")).json();
  expect(
    data.conditions.map(
      (c: { neural: { failures: number } }) => c.neural.failures,
    ),
  ).toEqual([153, 390, 1364, 3796]);
  const table = page.getByRole("table", {
    name: /Original and fresh-shot results/,
  });
  await expect(table).toContainText("3,796 / 100,000");
  await expect(table).toContainText("732 / 20,000");
});

test("unmeasured URL setting is clearly identified", async ({ page }) => {
  await page.goto("/explore?noise=0.0123");
  await expect(
    page.getByRole("status").filter({ hasText: "The requested noise setting" }),
  ).toContainText("was not evaluated");
  await expect(page.getByLabel("Measurement-flip probability")).toHaveValue(
    "0.001",
  );
});

test("reduced effects still toggle when storage is readable but unwritable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Quota exhausted", "QuotaExceededError");
    };
  });
  await page.goto("/accessibility");
  await page
    .getByRole("button", { name: "Enable reduced effects", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-effects", "reduced");
  await expect(
    page.getByRole("button", { name: "Reduced effects enabled", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Reduced effects enabled", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-effects", "full");
});

test("stabilizer inspector exposes actual check support and boundaries", async ({
  page,
}) => {
  await page.goto("/explore");
  await page
    .getByText("Stabilizer checks and detector records")
    .click();
  await page.getByLabel("Inspect measurement ancilla").selectOption("9");
  await expect(page.locator(".check-summary")).toContainText("Q1, Q3, Q8, Q10");
  const t = page.getByRole("table", {
    name: /Detectors at this check coordinate/,
  });
  await expect(t).toContainText("initial");
  await expect(t).toContainText("final");
  await expect(t.locator("tbody tr")).toHaveCount(4);
});

test("all reading content works without JavaScript or WebGL", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: process.env.TEST_BASE_URL || "http://127.0.0.1:3000",
  });
  const page = await context.newPage();
  await page.goto("/study");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "What changed when the noise increased?",
  );
  await expect(
    page.getByText("Neural error · 732 / 20,000 shots"),
  ).toBeVisible();
  await page
    .getByText("Inspect exact failures, shot counts and intervals")
    .click();
  await expect(
    page.getByRole("table", { name: /Exact logical failures/ }),
  ).toBeVisible();
  await page.goto("/sources");
  await expect(page.locator("#C05")).toContainText("78/20,000");
  await context.close();
});
test("layout stays inside viewport across phone tablet desktop widths", async ({
  page,
}) => {
  for (const width of [320, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/explore",
      "/study",
      "/methods/circuit",
      "/sources",
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}px`,
      ).toBeTruthy();
    }
  }
});

test("every internal navigation and download link resolves", async ({
  page,
  request,
}) => {
  const links = new Set<string>();
  for (const route of routes) {
    await page.goto(route);
    for (const href of await page
      .locator("a[href]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href") || ""))) {
      if (href.startsWith("/") && !href.startsWith("//"))
        links.add(href.split("#")[0]);
    }
  }
  for (const href of links) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
  }
});

test("full noise range and calibration scale fit narrow screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/study");
  const plots = page.locator(".responsive-plot");
  await expect(plots).toHaveCount(2);
  for (const plot of await plots.all()) {
    await expect(plot.locator("svg")).toBeVisible();
    expect(
      await plot.evaluate((n) => n.scrollWidth <= n.clientWidth + 1),
    ).toBeTruthy();
  }
  await expect(
    plots.first().locator("text").filter({ hasText: "3.0%" }),
  ).toBeVisible();
  await expect(
    plots.last().locator("text").filter({ hasText: /^1$/ }),
  ).toHaveCount(2);
});
test("new diagnostics use actual base rates and conditional coverage", async ({
  page,
}) => {
  await page.goto("/study/diagnostics");
  await expect(
    page.getByText("89,811 of these 100,000 shots", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".confidence-facts")).toContainText(
    "83,087 / 100,000",
  );
  await expect(page.locator(".confidence-facts")).toContainText(
    "1,178 mistakes retained",
  );
  await page
    .getByLabel("Retain predictions with confidence at least")
    .selectOption("0.5");
  await expect(page.locator(".confidence-facts")).toContainText(
    "100,000 / 100,000",
  );
  await page
    .getByLabel("Decoder for outcome matrix")
    .selectOption("matchedMatching");
  expect(
    await page.locator(".matrix-cell strong").allTextContents(),
  ).toHaveLength(4);
  await page
    .getByLabel("Noise setting for diagnostic sample")
    .selectOption("1");
  await expect(
    page.getByText("96,620 of these 100,000 shots", { exact: false }),
  ).toBeVisible();
});
test("training-control model selector preserves exact independent study counts", async ({
  page,
}) => {
  await page.goto("/study/training-control");
  await expect(page.locator(".confidence-facts")).toContainText(
    "3,775 / 100,000",
  );
  await expect(page.locator(".confidence-facts")).toContainText(
    "2,736 / 100,000",
  );
  await page.getByLabel("Model initialization").selectOption("202");
  await expect(page.locator(".confidence-facts")).toContainText(
    "3,913 / 100,000",
  );
  await expect(page.locator(".confidence-facts")).toContainText(
    "2,490 / 100,000",
  );
});
test("conceptual readout comparison shows changes rather than raw values", async ({
  page,
}) => {
  await page.goto("/explore");
  await page.getByText("Why can one flipped readout leave two traces?").click();
  await expect(page.locator(".difference-pair")).toContainText(
    "Detection event",
  );
  await page.getByRole("button", { name: "Set all readouts to zero" }).click();
  await expect(page.locator(".difference-pair strong")).toHaveText([
    "□ 0",
    "□ 0",
  ]);
  await page
    .getByRole("button", { name: "Flip the middle readout only" })
    .click();
  await expect(page.locator(".difference-pair strong")).toHaveText([
    "■ 1",
    "■ 1",
  ]);
  await expect(
    page.getByText("CONCEPTUAL EXAMPLE / NOT A SAVED SHOT"),
  ).toBeVisible();
});
test("cinematic history links to its exact real saved shot", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Show step 3: Remember" }).click();
  await expect(page.locator(".film-data")).toContainText(
    "2 EVENTS / 24 DETECTORS",
  );
  await page.getByRole("button", { name: "Show step 4: Decode" }).click();
  await page.getByRole("link", { name: /Inspect the saved shots/ }).click();
  await expect(page).toHaveURL(/noise=0.03&shot=1/);
  await expect(page.getByLabel("Saved test shot")).toHaveValue("1");
});
test("homepage noise scrubber shows measured counts at both ends", async ({
  page,
}) => {
  await page.goto("/");
  const slider = page.getByRole("slider", {
    name: "Homepage evaluation measurement noise",
  });
  await expect(page.locator(".evidence-number>p")).toContainText(
    "732 errors / 20,000",
  );
  await slider.focus();
  await page.keyboard.press("Home");
  await expect(page.locator(".evidence-number>p")).toContainText(
    "31 errors / 20,000",
  );
  await expect(page.locator(".evidence-number>strong")).toHaveText("0.15%");
  await page.keyboard.press("End");
  await expect(page.locator(".evidence-number>strong")).toHaveText("3.66%");
});
test("persistent cursor survives navigation to the study", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".water-backdrop")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page.mouse.move(700, 300);
  await page.getByRole("link", { name: "The study", exact: true }).click();
  await expect(page).toHaveURL(/\/study$/);
  await expect(page.locator(".route-curtain")).not.toHaveClass(/cover/);
  await page.mouse.move(500, 450);
  await expect(page.locator(".water-backdrop")).toHaveAttribute(
    "data-pointer",
    "true",
  );
});
test("confidence cutoff changes retained evidence without inventing accuracy", async ({
  page,
}) => {
  await page.goto("/study/diagnostics");
  await expect(page.getByText(/83,087/).first()).toBeVisible();
  await expect(page.locator("main")).toContainText("1,178");
});
