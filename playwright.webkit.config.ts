import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
// Run after `npx playwright install webkit`. This engine is not a physical Mac test.
export default defineConfig({
  ...base,
  testMatch: /(motion|finish)\.spec\.ts/,
  reporter: [["list"], ["json", { outputFile: "test-results/webkit.json" }]],
  use: { ...base.use, browserName: "webkit", launchOptions: {} },
  projects: [
    { name: "webkit", use: { viewport: { width: 1440, height: 1000 } } },
  ],
});
