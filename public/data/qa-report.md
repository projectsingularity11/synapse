# QA report

Evidence recorded 2026-11-15T01:42:17.224Z (UTC timestamps in raw files). Local production build; no deployment or field metrics claimed.

## Completed checks

- Frozen-lockfile npm ci succeeded; lint, TypeScript and production build passed. All twelve editorial/research routes statically prerendered.
- Playwright: **29/29 passed**, 0 failed, 0 skipped, 0 flaky. System Chromium, 1440×1000 desktop plus mobile widths and 320/430/768/1024/1440/1920px layout checks.
- Automated axe checks on all twelve routes: no applicable WCAG A/AA violations reported. These are automated checks, not WCAG conformance certification.
- Eleven Python scientific tests passed: no-noise and injected-fault sanity, detector semantics, feature/label separation, baseline shape, seeds, calibration metrics, topology, saved outputs, frozen checkpoint and confirmation provenance. pip check reports no broken requirements.
- Five integrity regression tests passed: good artifacts accepted; changed source, wrong parent run, inconsistent counts and missing data rejected. Build also verifies original, supplemental, figure and confirmation source/config/input/output SHA256 hashes.
- Native mobile menu, skip link, keyboard range/select controls, representative and selected gallery, deep links, invalid setting warning, complete-history disclosure, calibration updates, check inspector, source/claim anchors, every internal download/navigation link, 404 state, reduced motion/preferences, readable-but-unwritable storage, no-JavaScript reading, unsupported WebGL and synthetic context loss exercised.
- Sound is intentionally absent; autoplay/mute/unmute for a music asset are **not applicable**, not reported as passing audio tests.
- Screenshots captured at 360×800,430×932,768×1024,1440×1000,1920×1080 for home/replay/study; inspected for composition/readability. Tablet replay now stacks; tables disclose on demand and small-screen figures explicitly explain horizontal scrolling.

## Three-run mobile Lighthouse results

Lighthouse 13.0.3; actual browser user agent in raw JSON. Mobile emulation 412×823,DPR 1.75; simulated 150 ms RTT,1638.4 Kbit/s throughput,4× CPU slowdown; local production HTTP server on shared Intel Xeon Platinum 8573C. Fresh headless Chromium per run; no concurrent browser measurements. Quality tier: HTML/SVG reading path, WebGL inactive.

| Route | Run | Performance | Accessibility | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|
| / | 1 | 93 | 100 | 2.322 s | 0 | 247 ms |
| / | 2 | 96 | 100 | 2.220 s | 0 | 164 ms |
| / | 3 | 98 | 100 | 1.565 s | 0 | 139 ms |
| /study | 1 | 97 | 100 | 2.360 s | 0 | 142 ms |
| /study | 2 | 97 | 100 | 2.356 s | 0 | 148 ms |
| /study | 3 | 96 | 100 | 2.175 s | 0 | 195 ms |

All six runs meet the stated lab LCP≤2.5s,CLS≤0.1,performance≥90 and accessibility≥95 targets. Best-practices and SEO scores were 100 in these runs. TBT is not INP; no field INP or field Core Web Vitals are available. Shared-host variability and a local origin limit real-world generalization.

## Browser and scene profile

Fresh-context reading-path JavaScript transfers measured approximately 149–153KB (roughly 487–496KB decoded, including framework/shared code). The explicit spatial gesture adds 260451 transfer bytes / 979604 decoded bytes. No audio, textures, web fonts or ML checkpoint are downloaded. Scientific JSON/CSV/figures and the 253 KB notice file are small optional/static records, not training datasets.

Unthrottled 1440×1000 reading-path long-task durations: /: 74ms; /explore?noise=0.03: 76ms; /study: 91ms, 78ms. Idle rAF samples had medians near 16.7ms; these do not demonstrate rendering throughput.

During scripted active camera rotation, 179 rAF intervals had median16.7ms,p9516.7ms,max 33.3ms, with 0 recorded long tasks. This used headless Chromium with **SwiftShader software WebGL**, no CPU throttle, DPR cap 1.5,24 instanced nodes, on-demand rendering and no shadows/postprocessing. These are browser scheduling samples during pointer interaction, not GPU durations or a physical desktop 60 fps certification. The hardware-desktop target remains unverified.

No page exceptions in direct-route tests, and no console errors in the profiled production reading paths. Raw per-route console checks are in route-console.json.

## Review and remaining limits

Independent scientific and five-axis code reviews found and resolved: full-history-versus-scrubber explanation, pointwise calibration intervals/caption, Brier interpretation, source-ID anchors, source/config/supplement integrity gates, record-column accessibility wording, font/library notices, credits and storage-write fallback. Initial defects were corrected and affected checks rerun; earlier failures are not counted as final passes without reruns.

Not performed: physical phone/GPU testing, Firefox/Safari, comprehensive manual screen-reader review, field analytics/INP, public-URL smoke testing or quantum hardware experiments. Primary neural-decoder paper content and unseen.co remain network-blocked. Audio-track licensing is unverified and no asset was used. Deployment requires an exact authorized Vercel account/team/project and authenticated access.

## Evidence and reproduction

Raw evidence: qa/browser-tests.json,qa/lighthouse.json,qa/browser-profile.json,qa/scene-profile.json,qa/asset-budget.json,qa/route-console.json and qa/screenshots/. Run npm run lint, npm run typecheck, npm run validate:data, npm run test:data, npm run build, then a production server and TEST_BASE_URL pointing at that server for npm test. Research commands are in research/protocol.md and the confirmation protocol.
