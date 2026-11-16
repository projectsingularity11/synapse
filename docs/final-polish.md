# Final responsive polish

This pass preserves the current black, soft-white, and flame orange-red direction. The older root PRODUCT.md and DESIGN.md describe an earlier blue/pink iteration; the owner's later requests and current rendered site are the visual authority for this refinement. No research content, measured values, or frozen experiment artifacts changed.

## Refinements

- Self-hosted Cormorant Garamond for editorial headings, Manrope for reading and controls, and El Messiri for the wordmark. Numerical interfaces use upright lining/tabular figures. A 1.4 KB directional-arrow subset of Space Grotesk avoids missing glyphs on devices without suitable system fonts. All OFL notices, source URLs and hashes are retained.
- The introduction stacks at tablet widths rather than trapping the title in a narrow column. Short screens and phones use a naturally scrolling chapter player with explicit chapter/slider control; wide desktop retains its scroll-driven narrative. Inactive chapters cannot leak text into the current explanation.
- Navigation, audio settings and dropdown menus fit short landscape viewports. Header controls retain usable hit areas, and tables scroll within their own containers rather than widening the page.
- Quantum fallback artwork has smooth transparent borders baked into the raster. Scene containers have no black backing; accelerated canvases fade at every edge. Both ambient textures also have fully transparent outer pixels. The ambient flame texture is remapped to red-orange instead of sepia yellow.
- Cursor radius reduced from .018 to .0035; fluid momentum is bounded and dissipates faster. Explicit RGB input accounts for the upstream solver's tenfold color multiplier, preventing white clipping. The software trail now expands to about 12 px rather than 36 px. Touch input creates no cursor trail. Reduced effects still removes the cursor completely and keeps gentle ambient drift.

## Verification

See `docs/qa/finish/` for final browser, image-edge, and frame-cadence evidence. Browser viewport emulation does not establish a physical-device test or a guaranteed minimum frame rate on every GPU. The accelerated regression branch exercises actual WebGL on the software-rendered test host; it does not establish physical-GPU performance.

The Chromium run covers 69 distinct checks: all 16 routes with accessibility scans, 128 route/viewport combinations (320, 390, 600, 768, 1024, 1440 and 2560 px, plus 844×390 landscape), and interaction, audio, data-link, reduced-motion, context-loss and fallback checks. The first parallel run passed 67 and hit two harness time limits (autoplay before scene readiness, and a thirty-navigation test with a 30-second total budget). Both passed in isolation. The harness now waits for readiness and assigns a 90-second budget to that navigation matrix; there were no overflow assertion failures.

WebKit independently checked the 320, 768 and 1440 px layouts across all 16 routes, short-landscape menus/audio settings, touch chapter seeking, and reduced/full motion restoration. All six distinct checks passed after correcting harness assumptions: WebKit legitimately selected the live WebGL renderer rather than the poster, and its two-initialization test needs the same 60-second total budget as other WebGL checks. A tablet trace teardown collision was rechecked with a separate output directory. The final motion assertion also passed again in Chromium.

The isolated cadence sample (after suites, lint and type checks stopped) measured approximately 58.4 Hz for desktop home, 60.0 Hz for phone home, 60.0 Hz for paper pointer input, and 58.1 Hz for phone demo playback; every scenario's 95th-percentile interval was about 16.8 ms. These are software-host scheduling measurements with a few outliers, not a universal 60 fps minimum. Build, lint, TypeScript, scientific-data validation, and transparent-edge checks passed.
