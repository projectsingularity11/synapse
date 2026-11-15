# Vivid image-based lighting

The existing original metallic sculpture render now supplies two cropped, blurred light fields: silver-white on one edge and warm orange-red on the other. Radial masks fade both into black. Their existing pointer translation and slow transform motion remain active. Image blur, saturation, and feathering are baked into two 512px WebP textures (under 80KB combined). Runtime motion changes transform/translation without blur, color filters, or masks on the ambient layers. The original live-filter implementation was rejected after profiling showed a large software-renderer slowdown; its diagnostic record is retained separately. No external photography or new asset license is introduced.

The hero image has feathered edges, and the question, evidence, resource links, and secondary-page headers use the brighter light palette. White remains the primary accent. Orange highlights strengthen borders, interactive links, and the small cursor glow. Cursor ring size, fluid splat radius, and trail lifetime remain compact. Long-form paper lighting stays quieter to preserve reading contrast.

Production build and lint pass. Six focused browser checks pass: home, Explorer, and paper accessibility; responsive layout; persistent cursor; and reduced/full motion. A separate cadence profile is retained in `qa/vivid/frame-cadence.json`; it measures browser requestAnimationFrame scheduling in the software fallback, not physical-device presentation.

The software renderer uses the hero poster against the matching black base, avoiding a per-frame poster mask. Accelerated rendering retains the feathered image edges. Both paths keep the image-based light fields.

Reproduce the final profile against a production server without parallel browser tests or builds:

```sh
TEST_BASE_URL=http://127.0.0.1:3004 PROFILE_OUTPUT_DIR=docs/qa/vivid node scripts/profile-motion.mjs
```

Regenerate the decorative textures with `node scripts/render-ambient-textures.mjs`. Source and output hashes are recorded in `public/art/ambient-provenance.json`.

Cursor position is written directly to the two decorative leaf elements, rather than inherited variables on the entire main content subtree. This isolates style work from the research figures and text. The software renderer uses smaller light surfaces at unchanged luminance; accelerated devices retain the larger fields.

Final six-scenario software-renderer averages: 57.15–59.67Hz; p95 frame interval 16.8ms in every scenario. Two 62–67ms main-thread tasks were recorded in the phone hero sample; other scenarios recorded none. These are lab scheduling measurements, not a proven hard minimum or physical-device validation. The focused production browser checks and the pointer/reduced-motion smoke check pass after the final rendering changes.

Screenshots are retained as development captures. This workspace’s emulated renderer can produce intermittent screenshot paint artifacts, as recorded in the earlier QA notes; no physical-device visual review is claimed.
