# Synapse immersive redesign

Synapse is now presented as Assirem Benseddik’s independent research project, with a visual scroll narrative as its front door. This replaces the previous paper-and-green editorial homepage. The fourteen evidence and technical routes remain available with replacement typography, palette, navigation and direct headings.

## What changed

- Actual font/first-frame readiness drives a loading screen and original wipe reveal. There is no fabricated percent counter. A bounded recovery and a no-JavaScript rule keep the reading surface accessible.
- A custom WebGL particle sculpture reacts to the pointer and scroll. It is explicitly a visual metaphor. GPU draws stop at idle, outside the viewport and while hidden; reduced motion freezes the uniforms and renders a fresh static frame after resizing or changing preferences. A geometric SVG remains when WebGL is unavailable or lost.
- The story progresses through a three-bit comparison analogy, actual saved detector history, noise-level comparisons, confidence filtering and a separate training control. Buttons, replay, shot selection, noise selection and confidence cutoff all work. Analogy and recorded data are distinguished.
- Lenis 1.3.27 supplies desktop scroll interpolation. Native touch/keyboard/anchors remain available; reduced effects bypass scroll inertia and route wipes. The route curtain is original code and preserves downloads, external links, modified clicks and same-page anchors.
- Self-hosted Manrope, silver/ink/cobalt/acid surfaces, oversized brand typography, sticky history choreography and distinct viewport compositions replace the old identity. Filler slogans and vague headings were removed across supporting routes.
- Confidence groups, detector bits, error counts and follow-up totals come from the frozen artifacts. Original experiments, protocols, figure exports and checkpoints are unchanged. This pass adds explanation and interaction, not new research samples.

## References and provenance

Lusion and Unseen were requested as experiential references. Both domains returned proxy CONNECT403 here, so their current screens/transitions could not be inspected. No proprietary source, assets, logos or exact design were copied. No claim of pixel fidelity or Awwwards recognition is made. Lenis’s official GitHub README/LICENSE were retrieved; installed version and license are retained. The original point-surface shaders and curtain are inspectable in `components/experience/`. Manrope was retrieved from Google Fonts’ official GitHub repository; the full OFL accompanies the font. Generated production notices now cover 85 packages.

## Verification

The production build and TypeScript pass, lint passes, all research provenance/hash gates pass, and five integrity tests pass. The complete expanded Chromium suite passed 39/39 with no failures/skips/flakes. Six targeted checks passed again after the last spacing and idle-render corrections: homepage accessibility, narrow-to-wide layout, saved-shot deep link, readout/noise controls, confidence-cutoff counts, and context-loss/navigation recovery. Raw confirmation statistics are in `qa/redesign/browser-tests.json`.

Desktop 1440×1000 and touch/mobile 390×844 captures cover the complete journey and individual demonstrations. A reduced-motion resized 900×900 capture confirms the static sculpture survives resizing. A fresh finish review scored both final spacing corrections resolved and returned SHIP; that is a review of the supplied captures, not a performance or accessibility certification. The design-skill launcher/detector is unavailable in this workspace; the review used source and browser captures directly.

The previous release’s 94–98 performance scores are historical and do not describe this new homepage. Current mobile lab measurements, including the initial continuous-rendering result, are retained separately in `qa/redesign/lighthouse*.json`. They use local production HTTP, headless Chromium with SwiftShader, mobile simulation and 4× CPU slowdown. They do not measure field INP or physical GPU throughput. See the current result below.

## Local review

Run `npm run build`, then `npm start -- --port 3002`. The retained review server is on port 3002. Open the homepage, disturb the sculpture, scroll through each experiment and follow a link to the full evidence. Use the Reduced effects control or the OS preference for a static reading experience.

Creator: Assirem Benseddik. Existing research identity/run IDs remain SYNDROME in immutable provenance records. No cloud environment configuration, DNS or Vercel project was published by this redesign.

### Current mobile lab result

Final measured homepage: performance **86**, accessibility/best-practices/SEO **100**; LCP **2.582s**, CLS **0.00454**, total blocking time **421ms**. The initial continuous-render version scored76 with912ms TBT; resting at idle reduced that work. These are single-run comparisons on a shared host, not a controlled benchmark or guaranteed field improvement. The previous performance≥90 and LCP≤2.5s goals are **not met by this run**. Hardware-device profiling and further startup optimization remain follow-up work; the result is not disguised as a passing performance gate. Full-glyph font compression saves111,020 downloaded bytes independently of timing variability.

The interface review’s SHIP disposition concerns visual composition and the resolved spacing corrections. It does not erase this measured performance limitation.
