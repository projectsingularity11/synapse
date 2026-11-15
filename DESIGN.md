---
name: Synapse
description: An immersive independent research experience by Assirem Benseddik.
colors:
  background: "#050712"
  surface: "#080b16"
  text: "#f0f3ff"
  muted: "#b3bfd7"
  line: "#39435b"
  blue: "#5287ff"
  pink: "#ff57af"
  event: "#ff74bd"
  prediction: "#91b6ff"
  failure: "#ff9cb6"
typography:
  display:
    fontFamily: "Syne, Manrope, Arial, sans-serif"
    fontSize: "21vw"
    fontWeight: 650
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Syne, Manrope, Arial, sans-serif"
    fontSize: "clamp(44px, 5.6vw, 96px)"
    fontWeight: 550
    lineHeight: 1.03
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "15px"
    lineHeight: 1.7
  navigation:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "12px"
rounded:
  glass: "16px"
  select: "20px"
  pill: "50px"
  circle: "50%"
spacing:
  action-gap: "24px"
  section-gutter: "3.5vw"
  mobile-gutter: "5vw"
  mobile-section: "80px"
components:
  button-primary:
    backgroundColor: "#5790ff"
    textColor: "#070c1a"
    rounded: "{rounded.pill}"
    padding: "16px 23px"
  button-primary-hover:
    backgroundColor: "#ff7bc2"
    textColor: "#110915"
  glass-surface:
    backgroundColor: "#090e20a8"
    rounded: "{rounded.glass}"
  noise-selected:
    backgroundColor: "#5e94ff"
    textColor: "#080c18"
    rounded: "{rounded.pill}"
  saved-shot:
    backgroundColor: "#13213b99"
    textColor: "#c9d7f0"
    rounded: "{rounded.select}"
    padding: "8px 14px"
---

# Design System: Synapse

## Direction

Synapse is an ink-dark, immersive research site by Assirem Benseddik. Electric blue and hot pink light an original liquid background; large Syne headlines and translucent glass surfaces carry the interactive explanations. The owner requested this direction in place of the earlier paper/green and silver/acid identities. The experience introduces the science to a beginner, then leads into complete evidence, methods and saved experiment artifacts.

Lusion, Unseen and ImmersiveGarden are references for ambition and atmosphere. ImmersiveGarden could not be inspected, so no exact-fidelity claim is made. The water shader and pointer glints are original. The glass treatment adapts a specific React Bits CSS fallback, with its attribution and license retained.

## Color and typography

The base is near-black navy (`#050712`), with dark surfaces (`#080b16`), cool near-white text (`#f0f3ff`) and muted blue-gray copy (`#b3bfd7`). Electric blue (`#5287ff`) supports actions and predictions; hot pink (`#ff57af`) supplies light, interaction accents and selected events. Research graphics retain explicit labels, counts and semantic event/prediction/failure roles rather than relying on color alone. The application keeps legacy variable names: `--paper` now names a dark surface and `--ink` names light text.

Syne is self-hosted at `/fonts/syne.woff2` (weights 400–800) for headings, wordmarks and large numeric displays. Manrope is self-hosted at `/fonts/manrope.woff2` (weights 200–800) for body copy and controls. Both use `font-display: swap`; local license/provenance files accompany the fonts. The hero signature uses 21vw Syne on desktop, with breakpoint-specific sizing. Typical narrative body text is 15px with generous leading; compact layouts use 13–14px, and screens from 1800px increase teaching copy to 18px. Evidence pages preserve complete prose, tables and controls in the same dark visual world.

## Composition and teaching

The homepage moves from the research question through foundations, measurement noise, check comparisons, saved detector history, noise results, confidence, a training control and methods. Wide asymmetrical compositions and large demonstrations replace a uniform feature-card grid. Typical desktop gutters are 3.5vw and scene padding is 9vw; narrow layouts use 5vw gutters and 80px scene spacing. The hero uses `100svh` with content-preserving minimum heights.

The foundations define a bit, a qubit and an encoded memory before introducing a decoder. Later copy defines readouts, measurement noise, neural networks, shots, matching, confidence and accuracy. Keep the labels distinguishing a visual effect, a probability or ordinary-bit analogy, a diagram annotation and real saved simulation data. The qubit example omits phase and says so; marking a data qubit annotates the diagram rather than simulating an error.

With JavaScript and full effects at widths of at least 900px, vertical scroll guides a sticky three-panel foundations track horizontally. Previous/next controls move to the corresponding scroll position; inactive guided panels are inert. Below 900px, panels use native horizontal scrolling and snap points, with arrows as an alternative to swiping. Reduced effects use a vertical reading sequence. Without JavaScript, the desktop layout remains vertical and narrow layouts retain native horizontal panels.

## Glass, water and pointer response

`.glass-surface` adapts the GitHub React Bits GlassSurface fallback CSS at commit `cf2801031f07f53d4684e65b961bde7c2e2a6921`. It uses a dark translucent fill, prefixed and unprefixed backdrop blur, inset edge highlights and restrained shadows. It does not use SVG backdrop filters. Browsers without backdrop-filter support receive an opaque dark fill. Preserve the MIT + Commons Clause attribution at `/licenses/react-bits-glass-surface.txt` and the public credits. Original pointer glints update only the hovered glass surface.

`WaterBackdrop` draws an original analytic WebGL 1 wave field with blue/pink lighting and up to eight transient pointer ripples. It is decorative, marked `aria-hidden`, and identified in the hero as a visual effect rather than research data. It requires neither float textures nor external shader assets. Hardware WebGL keeps the original refracting shader. A renderer capability check reads `WEBGL_debug_renderer_info` when available: SwiftShader, llvmpipe, softpipe or a renderer string containing “software” selects Canvas2D ripple rings with compositor-only animated ambient ribbons. Unsupported WebGL, initialization/shader failure and context loss also select this 2D path. This policy addresses measured software-renderer startup stalls; it does not inspect the user agent or detect headless/benchmark sessions. The fallback is a simpler rendering, not a claim of identical output.

Rendering uses capped internal resolution, frame pacing and adaptive quality reduction. Hidden documents skip draws. Reduced effects draw a still field when needed and suppress pointer ripples, pointer-driven glints and the decorative cursor lens; the animation frame callback still checks state. Full effects on hover-capable devices provide an interpolated lens without replacing the native cursor. Touch input and devices without hover hide the lens and pointer instruction. These are implementation choices, not a frame-rate or physical-device performance guarantee.

## Navigation and motion preferences

The header is a floating dark glass pill with the creator credit, navigation and a visible `Motion: Full` / `Motion: Reduced` toggle. Mobile navigation opens in a dark glass panel. Focus-visible controls use a pink outline; keep native links, selects, ranges, scrollbar and keyboard access.

The motion preference supports `system`, `full` and `reduced`. Initially it follows the operating-system reduced-motion preference; selecting the toggle stores an explicit full/reduced override in `synapse-motion-v2` (with legacy storage compatibility). The current header toggle switches between full and reduced; it is not a three-option system chooser. Storage failures retain the selection in memory.

Full effects use Lenis wheel interpolation (`lerp: 0.085`, `autoRaf: false`) driven by a manual requestAnimationFrame loop. `syncTouch: false` keeps touch scrolling native. Reduced effects use native scrolling and bypass route wipes. The loader waits for scene readiness and font readiness, with an 1800ms scene recovery trigger; its bar is decorative rather than a measured progress percentage. Eligible unmodified internal route links trigger a dark glass curtain; downloads, external links and file destinations retain ordinary navigation. Avoid claiming that every animation stops or that all browsers render the same motion.

## Research and validation boundaries

Keep saved shot provenance, denominators, uncertainty, caveats and links to exact artifacts visible. This is classical computation on a small simulated quantum memory, not quantum hardware or a replication of large published decoders. Do not invent results, affiliations or scientific meaning for visual metaphors.

Browser checks performed for this iteration used Chromium. The owner's Comet browser is Chromium-based, but no physical Mac or Comet check occurred. A separate regression check overrides only the renderer capability-probe label to exercise actual WebGL drawing and context loss on the software-rendered test host; it is not physical-GPU validation. Treat physical device/browser paths as unverified, and preserve readable fallbacks rather than making universal motion or rendering guarantees.
