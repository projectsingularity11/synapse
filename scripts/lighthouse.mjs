import lighthouse from "lighthouse";
import { chromium } from "@playwright/test";
import fs from "node:fs";
fs.mkdirSync("docs/qa", { recursive: true });
let results = [];
for (const route of ["/", "/study", "/study/diagnostics", "/study/training-control"])
  for (let run = 1; run <= 3; run++) {
    const chrome = await chromium.launch({
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox", "--remote-debugging-port=9222"],
    });
    try {
      const r = await lighthouse(
        (process.env.TEST_BASE_URL || "http://127.0.0.1:3001") + route,
        {
          port: 9222,
          output: "json",
          logLevel: "error",
          onlyCategories: [
            "performance",
            "accessibility",
            "best-practices",
            "seo",
          ],
        },
      );
      const l = r.lhr;
      const summary = {
        route,
        run,
        fetchTime: l.fetchTime,
        userAgent: l.userAgent,
        config: l.configSettings,
        version: l.lighthouseVersion,
        scores: Object.fromEntries(
          Object.entries(l.categories).map(([k, v]) => [k, v.score]),
        ),
        metrics: Object.fromEntries(
          [
            "largest-contentful-paint",
            "cumulative-layout-shift",
            "total-blocking-time",
            "speed-index",
            "first-contentful-paint",
            "interactive",
          ].map((k) => [
            k,
            {
              value: l.audits[k]?.numericValue,
              unit: l.audits[k]?.numericUnit,
            },
          ]),
        ),
        failedAudits: Object.entries(l.audits)
          .filter(([, v]) => v.score !== null && v.score < 1)
          .map(([id, v]) => ({
            id,
            title: v.title,
            score: v.score,
            details: v.details,
          })),
        runtimeError: l.runtimeError ?? null,
      };
      results.push(summary);
      console.log(
        JSON.stringify({
          route,
          run,
          scores: summary.scores,
          metrics: summary.metrics,
        }),
      );
      fs.writeFileSync(
        "docs/qa/lighthouse.json",
        JSON.stringify(results, null, 2),
      );
    } finally {
      await chrome.close();
    }
  }
