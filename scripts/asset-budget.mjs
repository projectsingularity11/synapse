import { chromium } from "@playwright/test";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(
  (process.env.TEST_BASE_URL ?? "http://127.0.0.1:3001") + "/explore",
);
await page.waitForFunction(
  () => document.documentElement.dataset.effects === "full",
);
const assets = () =>
  page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((r) => r.name.endsWith(".js"))
      .map((r) => ({
        file: r.name.split("/").at(-1),
        transferBytes: r.transferSize,
        decodedBytes: r.decodedBodySize,
      })),
  );
const initial = await assets();
await page.getByRole("button", { name: "Open spatial view" }).click();
await page.locator(".spatial-section").scrollIntoViewIfNeeded();
await page.locator("canvas[data-context-loss-ready=true]").waitFor();
const all = await assets();
const lazy = all.filter((r) => !initial.some((i) => i.file === r.file));
const sum = (arr) => ({
  transferBytes: arr.reduce((n, r) => n + r.transferBytes, 0),
  decodedBytes: arr.reduce((n, r) => n + r.decodedBytes, 0),
});
const evidence = {
  date: new Date().toISOString(),
  route: "/explore",
  conditions:
    "Fresh headless Chromium context, local production server, activation only by explicit Open spatial view gesture",
  initial: { ...sum(initial), files: initial },
  optionalSpatial: { ...sum(lazy), files: lazy },
};
fs.writeFileSync(
  "docs/qa/asset-budget.json",
  JSON.stringify(evidence, null, 2),
);
console.log(
  JSON.stringify(
    { initial: sum(initial), optionalSpatial: sum(lazy) },
    null,
    2,
  ),
);
await browser.close();
