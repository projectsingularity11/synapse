# Ember QA artifacts

- `focused-browser-results.json`: all 12 final targeted checks passed. The preceding full run and two corrective reruns cover all 50 distinct browser checks.
- `frame-cadence.json`: final six-scenario timing sample, CPU-composited Chromium, 180 intervals each, 58.38–60.00Hz averages, p95 16.7–16.8ms, no recorded main-thread long tasks.
- `frame-cadence-gpu-emulation.json`: preceding sample in the emulated GPU compositor, 58.07–60.00Hz, with the same p95 interval range.
- Screenshots: production build at 1440×1000 and a fresh 390×844 touch context. Animations are frozen during screenshot capture. The emulated compositor intermittently corrupts screenshots, including after CPU-compositor capture; the raw mobile frame is retained as `mobile-emulator-paint-diagnostic.png`. This is not evidence of physical-device rendering. This does not measure physical GPU throughput.
- `variants.json`: intermediate compositor isolation experiment, not the final delivered performance result.

See `../../ember-redesign.md` for sources, checks, reproduction, and measurement limits. Local build, lint, and all five research-data integrity tests pass. Physical-device performance remains unverified.
