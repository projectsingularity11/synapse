import { chromium } from "@playwright/test";
import fs from "node:fs";
fs.mkdirSync("docs/qa/screenshots", { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
for (const [name, width, height] of [
  ["narrow", 360, 800],
  ["phone", 430, 932],
  ["tablet", 768, 1024],
  ["desktop", 1440, 1000],
  ["wide", 1920, 1080],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  for (const [route, file] of [
    ["/", "home"],
    ["/explore?noise=0.03", "explore"],
    ["/study", "study"],
    ["/study/diagnostics", "diagnostics"],
    ["/study/training-control", "training-control"],
  ]) {
    await page.goto(
      (process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000") + route,
    );
    await page.screenshot({
      path: `docs/qa/screenshots/${name}-${file}.png`,
      fullPage: true,
    });
    console.log(
      name,
      file,
      await page.evaluate(() => ({
        width: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
      })),
    );
  }
  await page.close();
}
await browser.close();
