# Recorded demo release

The `/demo` workspace adapts the supplied reference's interaction layout to the saved quantum-memory study: a parameter/results sidebar, a large three-dimensional view, camera tools, and a bottom playback timeline. It is linked from the main navigation, homepage, and Explorer. The site retains its black, white, and flame orange-red palette.

## Recorded data and interpretation

- Four measured noise settings, eight saved shots per setting, and three saved decoders are selectable. Noise/shot changes reset playback; decoder changes update the saved prediction and measured evaluation statistics.
- A 24-second presentation covers logical encoding, parity checks, detector history, and the decoder result. This clock is an editorial presentation, not measured hardware execution time.
- Layout positions and detector time coordinates come from the retained experiment. Encoding/check presentation and time-layer height are schematic. The three-round experiment has four detector time coordinates, including boundary detectors.
- Revealed detector/event counts follow the selected shot and displayed time slice. Final predictions use the complete saved history, never a partial model rerun.
- Evaluation metrics are the existing 20,000-shot counts for the selected condition/decoder. They are independent of playback position. The first eight saved shots are not presented as a representative error-rate sample.
- No experiment scripts, model weights, run identities, saved predictions, or scientific figure bytes are changed.

## Interaction and rendering

Playback includes play/pause, restart, speed, loop, chapter seeking, a native scrubber, and shareable noise/shot/decoder/time links. Camera presets, drag rotation, zoom, time-layer visibility, and fullscreen are provided. The workspace has an independently scrolling sidebar on desktop and puts the visual player first on phones.

Accelerated adapters receive an instanced Three.js scene. Software or unavailable WebGL receives a coordinate-projected SVG scene with the same records and camera controls. The renderer draws on demand, caps DPR, lowers rendering resolution under sustained pressure, and recovers to the vector path on context loss. Hidden documents pause playback; offscreen scene drawing stops. Reduced motion disables camera drift, event pulsing, and cursor effects while the ambient background retains a gentle drift.

Ambient lights now choose independent random transform paths. Small pointer translations nudge the layers without controlling their paths. Randomness is decorative only and never enters the saved scientific data. Cursor effects stop under reduced motion; ambient animation becomes slower and smaller. Hidden tabs pause background work. Page-transition artwork uses the baked white and ember light textures, with no live blur or third-party assets.

## Music

Music now requests autoplay at 18% volume on arrival. Browser autoplay policy can block that request; in that case the header reports “Sound ready” and playback starts after an eligible pointer/keyboard interaction. The Sound panel can disable automatic playback before that gesture, pause music, adjust volume, or enable interface effects. A saved music-off preference is honored. Music pauses in hidden tabs. Existing CC BY 4.0 attribution and CC0 effect notices remain in place.

## Verification and delivery

The full 58-check browser suite passed, including sixteen route accessibility scans, exact saved-record comparisons, controls/URL restoration, desktop/tablet/phone layouts, optional WebGL/context-loss recovery, autoplay-permitted and autoplay-blocked scenarios, saved mute preferences, and reduced motion. All 10 focused checks passed again after the final icon/label refinements. Build and lint pass; the build verifies retained research hashes and counts.

QA records are retained under `docs/qa/recorded-demo/`. Timing samples measure software-browser scheduling during active playback and pointer movement; they do not prove physical-GPU throughput or a guaranteed minimum on every device.

The confirmed existing Vercel project deploys GitHub `projectsingularity11/synapse` branch `main` to production. This was verified from the READY production deployment for commit `808048b` before this release. Delivery uses that existing Git integration; no DNS or protection settings are changed.

The final isolated active-playback sample averages 59.67Hz at 1440px and 60.00Hz at 390px, with p95 intervals of 16.7–16.8ms and no recorded main-thread long tasks. One desktop interval exceeded 25ms; the phone sample had none. Both use the vector/software path; actual WebGL rendering and context-loss recovery were separately exercised, and physical-device performance remains unverified.
