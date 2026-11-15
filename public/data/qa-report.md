# QA report

Evidence recorded on 2026-11-15 UTC; the latest browser/performance records are timestamped 02:11–02:18 UTC in the raw files. Local production build; no deployment or field metrics claimed.

## Completed checks

- Frozen-lockfile installation, lint, TypeScript and production build passed. All fourteen editorial/research routes statically prerendered.
- Playwright: **36/36 passed**, 0 failed, 0 skipped, 0 flaky. System Chromium, desktop plus mobile and 320/430/768/1024/1440/1920px layout checks.
- Automated axe checks on all fourteen routes reported no applicable WCAG A/AA violations. This is automated evidence, not WCAG conformance certification.
- **17 scientific tests** passed: no-noise and injected-fault sanity, detector semantics, feature/label separation, seed separation, calibration metrics, topology, saved outputs, frozen checkpoint, confirmation provenance, diagnostic confusion/coverage arithmetic and training-control pairing/identity. The retained Python environment passed pip check.
- **Five integrity regression tests** passed: valid artifacts accepted; changed source, wrong parent run, inconsistent counts and missing data rejected. The production data gate verifies source/config/protocol/input/output SHA256 hashes, control checkpoints frozen before test generation, exact paired/confusion counts, and preservation of original figures.
- Native mobile menu, skip link, keyboard controls, deep links, failure gallery, invalid setting warning, complete-history disclosure, calibration updates, check inspector, source/claim anchors, every internal download/navigation link, 404 state, reduced effects, unwritable storage, no-JavaScript reading, unsupported WebGL and synthetic context loss exercised.
- New behavior checked against saved results: full chart domains at 320px, diagnostic base rates and retained-shot counts, all three training-control initializations, conceptual readout changes and the opening scene's exact saved-shot link. Independent browser checks also compared all four diagnostic settings and all twelve confusion matrices with their artifacts.
- Twenty-five screenshots cover home/replay/study/diagnostics/training-control at 360×800, 430×932, 768×1024, 1440×1000 and 1920×1080. Mobile and tablet compositions, chart labels and exact-table disclosures inspected. Plot coordinates fit the viewport; wide numeric tables retain labeled scrolling regions.
- Fourteen direct-route checks returned HTTP 200 with no page exceptions or console errors. Sound remains intentionally absent; audio tests are not applicable.

## Three-run mobile Lighthouse results

Lighthouse 13.0.3, system headless Chromium 156. Mobile emulation 412×823, DPR 1.75; simulated 150ms RTT, 1638.4Kbit/s throughput, 4× CPU slowdown; local production HTTP server on shared Intel Xeon Platinum 8573C. Fresh Chromium per run; no concurrent performance measurements. Quality tier: HTML/SVG reading path, WebGL inactive.

| Route | Run | Performance | Accessibility | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|
| / | 1 | 94 | 100 | 2.357s | 0 | 246ms |
| / | 2 | 96 | 100 | 2.261s | 0 | 185ms |
| / | 3 | 97 | 100 | 2.219s | 0 | 126ms |
| /study | 1 | 97 | 100 | 1.858s | 0 | 162ms |
| /study | 2 | 96 | 100 | 2.380s | 0 | 163ms |
| /study | 3 | 96 | 100 | 2.385s | 0 | 164ms |
| /study/diagnostics | 1 | 96 | 100 | 2.387s | 0 | 172ms |
| /study/diagnostics | 2 | 97 | 100 | 2.351s | 0 | 140ms |
| /study/diagnostics | 3 | 95 | 100 | 2.411s | 0 | 193ms |
| /study/training-control | 1 | 96 | 100 | 2.225s | 0 | 167ms |
| /study/training-control | 2 | 98 | 100 | 1.664s | 0 | 150ms |
| /study/training-control | 3 | 97 | 100 | 1.725s | 0 | 176ms |

All twelve runs meet the lab targets: LCP≤2.5s, CLS≤0.1, performance≥90 and accessibility≥95. Best-practices and SEO scores were 100 in every run. TBT is not INP. No field INP/Core Web Vitals are available; shared-host variability and a local origin limit generalization.

## Browser and scene profile

The explicit activation measurement records 150,014 transferred / 489,088 decoded JavaScript bytes before opening the spatial view. Scripts newly observed after activation total 270,606 transferred / 1,005,329 decoded bytes. This delta includes small shared chunks, not just the spatial renderer. A separate settled five-route profile includes navigation prefetch and records approximately 157–165KB JavaScript transfer. These are different observation windows, not interchangeable bundle totals. No audio, textures, web fonts or ML checkpoint are downloaded. Results and figure exports are optional static records; raw training datasets remain offline.

Unthrottled 1440×1000 reading-path long tasks: home 99ms; replay 55ms; study 98ms; diagnostics 118ms; training control 83ms. No canvas mounted on these paths. Idle rAF medians were approximately 16.7ms and p95 approximately 16.7–16.8ms; these are scheduling samples, not rendering throughput.

The unchanged optional spatial component retains a separate 01:40 UTC profile: scripted camera rotation, 179 rAF intervals, median/p95 16.7ms, maximum 33.3ms, zero recorded long tasks. It used SwiftShader software WebGL, no CPU throttle, DPR cap 1.5, 24 instanced nodes, on-demand rendering and no shadows/postprocessing. This does not certify physical desktop GPU performance. The full 2D reading/replay path remains the default.

## Review and remaining limits

Scientific and interface reviews corrected causal overstatement in the original sweep, descriptive-versus-prespecified cutoff wording, event probability versus class confidence, shared-data limitations, mobile chart clipping, bin occupancy readability, figure-label collisions, and contrast. Previous checks also resolved source anchors, storage fallback, full-history explanation and license notices. The follow-up protocol/source was committed before generating fresh final labels; its design remains exploratory because it followed the original result.

Not performed: physical phone/GPU testing, Firefox/Safari, comprehensive manual screen-reader review, field analytics/INP, public-URL smoke testing or quantum hardware experiments. Required primary neural-decoder paper content and unseen.co remain network-blocked. Individual audio-track licensing was not verified and no track was used. Deployment requires an exact authorized Vercel account/team/project and authenticated access.

## Evidence and reproduction

Raw evidence: `qa/browser-tests.json`, `qa/lighthouse.json`, `qa/browser-profile.json`, `qa/scene-profile.json`, `qa/asset-budget.json`, `qa/route-console.json` and `qa/screenshots/`. Run `npm run lint`, `npm run typecheck`, `npm run validate:data`, `npm run test:data`, `npm run build`, then a production server and `TEST_BASE_URL` pointing at it for `npm test`. Scientific commands and rerun boundaries are in `research/protocol.md`, the two follow-up protocols, and result notes. See `proposed-final-product.md` for the review path.
