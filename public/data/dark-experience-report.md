# Synapse dark glass experience

The current release uses an ink background, electric blue and hot pink, self-hosted Syne display type and Manrope reading type. Assirem Benseddik remains the creator. The front page teaches the research from bits and qubits through check histories, decoding errors, confidence and the training control. All fourteen evidence routes remain available.

## Motion repair and verification

The previous version had no horizontal foundations sequence or water cursor. Some choreography depended on CSS scroll timelines. Its motion UI could say full effects while the operating-system preference suppressed motion elsewhere. These were real implementation gaps; they are not proof of the exact cause on the owner's Mac. The owner uses Comet, a Chromium browser, so Chromium is the primary exercised engine.

One preference hook now resolves system, saved full and saved reduced choices consistently. The header shows **Motion: Full** or **Motion: Reduced**. An explicit Full choice can override the OS preference and persists after reload. Reduced motion still restores native scrolling, a vertical teaching flow and a static backdrop. Live OS preference changes are observed when following the system.

Lenis uses an explicit animation-frame loop. Scroll-to-chapter actions use that same instance. Guided desktop chapters map document scroll to horizontal transforms in JavaScript, with no CSS scroll-timeline requirement. Touch layouts retain native horizontal scrolling and previous/next buttons. Inactive desktop panels are inert. A narrow window with a fine pointer retains the cursor effect.

The background is an original analytic wave shader in WebGL1, with no float textures or SVG backdrop-filter dependency. Cursor movement and presses inject wave fronts. The pointer lens and local glass highlights respond directly to input. Shader resolution is bounded and adapts downward on slow frames; hidden documents stop drawing. Unsupported or lost contexts retain a real Canvas2D ripple renderer.

An isolated software-WebGL load measurement exposed excessive startup blocking. The final policy selects **Canvas2D ripples plus compositor-animated ambient ribbons for actual software renderer capability strings** (SwiftShader, llvmpipe, softpipe/software). Hardware-selected WebGL keeps the refracting shader. There is no user-agent, headless or benchmark detection. This fallback keeps visible effects rather than leaving an empty background. A separate regression test overrides only the capability-probe label to exercise actual GL drawing and context loss on the software host; that is branch coverage, not physical GPU validation.

## Beginner context and scientific truth

The guided introduction explains ordinary bits, qubit measurement probabilities, and why one encoded memory uses several physical qubits. Its probability example explicitly omits a full state description and is not a research shot. Marking a data-qubit location annotates a diagram; it does not simulate an error.

Later sections define readouts, comparisons, detection events, decoders, shots and measurement-noise percentages before asking visitors to interpret them. The detector replay uses actual saved bits; the prediction reads the whole history. Error totals, confidence subsets and the follow-up totals still come from the frozen records. No experiment, checkpoint, protocol or original scientific figure was altered. Decorative liquid motion is explicitly separated from evidence.

## GitHub reuse and rights

Frosted-glass fallback styling is adapted from React Bits GlassSurface at commit `cf2801031f07f53d4684e65b961bde7c2e2a6921`. Exact retrieved files and hashes are in `qa/dark-experience/github-glass-provenance.json`. The full MIT + Commons Clause license is retained in `public/licenses/react-bits-glass-surface.txt`, linked from Credits. Integrated website use is permitted; the component is not offered as a standalone library or template pack. Pointer glints and the water renderer are original code.

Syne and Manrope are self-hosted WOFF2 with complete glyph sets, original/distributed hashes and full OFL notices. No new production npm package was added. Immersive Garden's domains returned proxy CONNECT403, so its current background could not be inspected and no exact source or fidelity claim is made.

## Checks and limits

**46/46 Chromium browser tests pass**, with zero failed, skipped or flaky results. Seven motion-specific cases exercise intermediate wheel positions, horizontal movement with CSS-timeline support unavailable, actual changed canvas pixels, ripples and glints, touch navigation, motion preference restoration, and GL context loss. The full suite includes automated axe checks on all fourteen routes, exact-data controls, deep links, no-JavaScript reading and responsive widths from 320 to 1920px. Five integrity regression tests, lint, TypeScript and production build pass. Raw results are in `qa/dark-experience/browser-tests.json`; the earlier failing pass is retained and not counted as success.

Fresh visual review returned SHIP at its source/capture scope, including a separate review of the capability-based rendering policy. It did not measure hardware frame rate. The recorded interaction flow reaches the confidence evidence route with its heading inside the viewport after the transition.

The tests ran in headless Chromium on Linux. **No physical Mac or native Comet session was available, and no production URL was supplied or smoke-tested.** WebKit installation was attempted but all Playwright CDN mirrors returned 403; engine tests were not run or reported as passing. The WebKit configuration is ready for an environment where its browser can be installed. Automated accessibility checks are not a full assistive-technology certification.

Screenshots and videos under `qa/dark-experience/` distinguish the GPU effect path from the software fast path. The GPU-path clip uses real software GL drawing and is not a native-Mac or 60fps claim. Previous silver-release performance scores are historical. The current isolated mobile lab measurement is recorded below; earlier software-WebGL and overlapping-transcode measurements are retained separately with their limits.

## Run and reproduce

```sh
npm ci --cache /workspace/.npm-cache
npm run build
npm start -- --port 3000
# In a separate shell:
TEST_BASE_URL=http://127.0.0.1:3000 npm test
```

`CHROMIUM_EXECUTABLE_PATH` can select a local Chromium-family browser executable, including the actual Comet executable on a Mac. Without that override, Linux uses system Chromium and other platforms use Playwright's installed Chromium. Run only the motion suite with `npm test -- tests/motion.spec.ts`. Install WebKit before `npm run test:webkit`; this host's download denial remains recorded in `qa/dark-experience/webkit-status.json`.

Old task-owned preview processes were stopped so they cannot keep serving stale cached pages. The final review server uses the current production build on port 3000. No cloud environment configuration or DNS was published. GitHub main updates follow the owner's earlier commit/push instruction; no Vercel deployment outcome is inferred from a Git push.

### Current mobile load measurement

One isolated Lighthouse 13 mobile run of the actual software-graphics fast path scores **87 performance, 100 accessibility,100 best practices and 100 SEO**. LCP is **2.338s**, CLS **0.00162**, and total blocking time **407.5ms**. Settings are retained in `qa/dark-experience/lighthouse.json`: local production, mobile 412×823/DPR 1.75, simulated 150ms RTT/1638.4Kbit/s and 4× CPU slowdown, headless Chromium on this shared cloud machine. No other browser tests or video encoding ran during that final navigation.

Before the fast-path policy, an isolated software-WebGL run recorded 64 performance and 3339.5ms blocking time. These are separate single-run observations, not a controlled statistical benchmark. A further earlier run overlapped video encoding and is explicitly excluded from the final comparison. The previous 90-point performance goal is **not yet met**, while this run meets LCP≤2.5s and CLS≤0.1. Native GPU smoothness and field INP remain unmeasured. The hardware-selected refracting shader is functionally exercised by the regression suite but is not assigned this software-path performance score.
