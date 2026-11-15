---
name: Synapse
description: An immersive independent research experience by Assirem Benseddik.
colors:
  cobalt: "#244aff"
  acid: "#dafa79"
  silver: "#eceeeb"
  ink: "#17191b"
  muted: "#555c62"
  line: "#c7cbc9"
  prediction: "#a7b5ff"
  failure: "#aa3329"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "22vw"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(44px, 5.7vw, 90px)"
    fontWeight: 500
    lineHeight: 1.03
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "15px"
    lineHeight: 1.65
  navigation:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "12px"
rounded:
  notice: "6px"
  select: "20px"
  pill: "50px"
  circle: "50%"
spacing:
  action-gap: "24px"
  section-gutter: "5vw"
  mobile-gutter: "6vw"
  mobile-section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "16px 23px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.white}"
  button-replay:
    backgroundColor: "{colors.acid}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "16px 23px"
  noise-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.acid}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  saved-shot:
    backgroundColor: "transparent"
    textColor: "#f2f4ee"
    rounded: "{rounded.select}"
    padding: "8px 14px"
---

# Design System: Synapse

## Overview

Synapse uses an original silver, ink, cobalt and acid identity: oversized close-set lettering, large geometric demonstrations and full-viewport scenes. The homepage leads with an immersive experience, then opens into readable evidence and methods. The interface recedes around the research and its author, Assirem Benseddik.

The owner explicitly replaced the previous paper/green editorial identity. Lusion and Unseen are references for ambition, not sources of copied code or assets. The sculpture is original procedural artwork; research graphics remain grounded in saved simulation artifacts.

**Key Characteristics:**

- Self-hosted Manrope throughout.
- Oversized typography, irregular alignment and generous scene spacing.
- Flat color fields with selective geometric and particle depth.
- Pointer and scroll response with native touch and reduced-effects alternatives.
- Explicit separation between visual metaphor, teaching analogy and measured evidence.

## Colors

Cobalt and acid punctuate a silver-and-ink foundation; complete scenes can use a saturated background.

- **Cobalt:** actions, focus, selected readouts, result bars and transitions. The confidence scene has a nearby scene-specific blue (`#202cfa`).
- **Acid:** detected events, the history replay action, the noise scene and observed accuracy on blue.
- **Silver / Ink:** the primary light and dark surfaces and their contrasting text.
- **Muted / Line:** secondary copy and quiet dividers on light surfaces.
- **Prediction / Failure:** retained semantic tokens for research evidence views; do not substitute brand accents for a scientific meaning.

## Typography

Manrope is served locally from `/fonts/manrope.woff2`, with variable weights 200–800 and Arial/sans-serif fallbacks. The WOFF2 preserves the full glyph set and outlines; its OFL license and provenance remain alongside it. Both legacy `--serif` and `--sans` variables resolve to this same family.

The brand word fills the lower hero at the display size above; mobile uses `23vw`. Scene headlines use medium weight and tight tracking. Functional navigation is small but legible; short labels support the large demonstrations. Homepage body copy uses the frontmatter body role; document pages keep paragraphs around 65–70 characters wide. Do not replace the research reading typography with giant scene copy.

## Layout

The homepage is a sequence of viewport-scale compositions rather than a card grid: silver hero, cobalt question, silver bit analogy, sticky ink detector history, acid noise comparison, blue confidence, silver follow-up and ink ending. Most desktop scenes use asymmetrical two-column grids, 5vw gutters and 9–12vw vertical padding. The hero uses `100svh` with a minimum height; content is never forced into an unreadable single screen.

At 900px the grids and typography tighten. At 650px, demonstrations stack, gutters become 6vw, typical scene padding becomes 80px, navigation opens beneath the header and detector history stops sticking. Large screens receive a modest reading-size increase at 1600px. Preserve clearance between the hero question, sculpture, wordmark and baseline. The mobile question interlude keeps a 100px separation before its closing copy.

Lenis supplies smooth wheel scrolling and anchor handling with `lerp: 0.085`; touch scrolling remains native. Keep the native scrollbar, keyboard navigation and anchors. Operating-system reduced motion and the site’s reduced-effects setting bypass inertia and route wipes. Supported browsers add scroll-linked question/orbit and history assembly motion; the readable layout remains available without that support.

## Elevation & Depth

Large surfaces are flat. Depth belongs to the original particle sculpture, metallic spherical readout buttons and skewed detector-history planes. Readout shadows are `0 20px 30px -22px #303a42aa`; history planes use `0 18px 40px -20px #000`. These serve the demonstrations rather than generic content cards.

## Shapes

Use circles for readouts and arrow actions, long pills for actions and selection states, thin rules for boundaries, and rectangular planes for saved detector history. Notices have restrained rounded corners. Keep the spatial demonstrations large and avoid equal feature-card layouts or decorative dashboards.

## Components

- **Primary actions:** ink pills with white text; cobalt hover and a small upward shift. History replay uses acid on ink. Focus-visible controls have a cobalt 2px outline with 6px offset.
- **Navigation:** a small wordmark and understated links above the experience. Link underlines animate from their edge; the mobile menu becomes a silver panel below the header. The reduced-effects control remains accessible.
- **Readout analogy:** three ordinary-bit buttons show selected cobalt spheres, comparison labels and a live explanation. Label this as an analogy, not experimental quantum data.
- **Saved history:** selectable saved shots expose 24 detection bits across four time boundaries, replay them and display the saved prediction alongside the actual outcome. Preserve its exact seed/noise/shot provenance and link to the detector inspector.
- **Noise and confidence controls:** pressed-state noise pills compare actual saved counts; the confidence range selects descriptive frozen-model subsets. Keep values, denominators, caveats and links to exact evidence visible.
- **Hero sculpture:** an original WebGL point-surface shader responds to pointer movement and scroll. GPU draws stop at idle, offscreen or while the document is hidden; the animation frame callback still checks for changes. Reduced effects draw a still sculpture. Point counts drop on small screens and pixel ratio is capped. An SVG fallback survives unavailable or lost WebGL; touch devices hide the pointer instruction.
- **Loader and route wipe:** the loader waits for first-frame readiness and local font readiness, with bounded recovery rather than fabricated progress. A cobalt curtain transitions eligible internal route links. Reduced motion suppresses the wipe; downloads and external links retain their own behavior.

## Do's and Don'ts

### Do:

- Do preserve the original silver/ink/cobalt/acid world and self-hosted Manrope.
- Do keep demonstrations large, interactive and connected to the research question.
- Do distinguish sculpture metaphor, ordinary-bit analogy and saved experimental evidence.
- Do retain native navigation, touch scrolling, reduced effects, readable methods and exact research limitations.

### Don't:

- Don't restore the rejected paper/green editorial identity.
- Don't copy reference-site assets, shaders or code.
- Don't turn research scenes into decorative dashboards or equal feature cards.
- Don't imply quantum hardware, invented affiliations or results beyond the saved small simulation.
