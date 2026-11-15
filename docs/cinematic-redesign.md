# Cinematic research redesign

The homepage now leads with Space Grotesk and Instrument Serif, an original metallic torus-knot scene, a concise research question, a scroll-driven detector-history film, measured evidence, and direct entries into the paper, experiment, and biography. The previous gradient/glass presentation and click-through ordinary-bit homepage demos are replaced. The experiment viewer, numeric evidence, sources, and reproducibility records remain available.

The About page uses the owner's supplied background: sophomore, AP Calculus BC and AP Physics 1, two TSA state championships in biotechnology and web development, and interests/experience in mathematics, physics, web development, CAD, and robotics. Undergraduate mathematics/physics completion is explicitly a goal. The portfolio remains unlinked. The supplied contact email is linked.

The new `/study/paper` article contains an abstract, mathematical task, split and training design, baselines, error/calibration metrics, original results, frozen confirmation, equal-budget training control, confidence diagnostics, limitations, reproducibility, and references. Its numeric tables read the existing artifacts on the server. Experiment scripts, checkpoints, labels, run identities, and original figure bytes are unchanged.

## Motion implementation

- Removed the deliberate mobile 30fps cap and timing gate that skipped display frames.
- Hardware WebGL draws at requestAnimationFrame cadence and lowers resolution when sustained frame times exceed the budget. No interval-based render throttling.
- Software graphics receive a 49,904-byte WebP rendered from the same original sculpture shader. Rotation runs as a compositor animation; pointer parallax uses the independent translate property. The poster also renders without JavaScript.
- The water fallback uses twelve reusable compositor-animated ripple layers. It has no continuous Canvas 2D repaint loop.
- The 24-detector film draws on demand, smooths scroll changes, supports direct slider seeking and drag rotation, and stops when offscreen. Slider choices persist until the visitor intentionally scrolls again.
- Reduced motion pauses continuous motion and cancels ripples. Hidden documents and offscreen sculptures pause work. Canvas context loss preserves the reading and fallback experiences.
- Research charts retain exact numeric alternatives and have a higher-contrast palette on the light reading surfaces.

## Verification

Production build, TypeScript, lint, and the five artifact-integrity tests pass. The browser suite covers fifteen reading routes, axe WCAG AA checks, 320–1920px layout checks, all internal/download links, exact saved-shot replay, calibration, confirmation, diagnostics, training-control counts, no-JavaScript reading, storage failure, and spatial context loss. Forty non-motion checks passed in the full production run. The seven motion checks were rerun after correcting touch seeking and fallback scheduling. Current motion results are retained in the test output; screenshots live in `docs/qa/cinematic/`.

The isolated production timing sample uses system Chromium on an Intel Xeon Platinum 8573C with software graphics. For 180 rAF intervals during continuous pointer input, desktop width 1440 averages 60.004Hz (p95 16.7ms, no intervals over 25ms); width 390 averages 59.670Hz (p95 16.8ms, one interval over 25ms). The previous poster-rAF pass averaged 57.451Hz on the narrow viewport with three long intervals. The final sample is in `docs/qa/cinematic/frame-cadence.json`; reproduce with `TEST_BASE_URL=http://127.0.0.1:3001 node scripts/profile-motion.mjs` after starting the production server.

These samples measure browser scheduling under the software fallback, not physical presentation or accelerated-GPU throughput. They support a roughly 60fps lab result, not a guaranteed minimum on every device. The actual shader branch is exercised with real software GL drawing and forced context loss in the browser suite, separately from the timing profile. Physical-device and physical-GPU verification remain outstanding.

## Preview and references

The confirmed Vercel target is the existing `synapse` project in the `project-singularity` account, project ID `prj_TfuZ1u929MKgKPRANTlFRfsRFQRY`. A preview was created; production aliases were not changed. `docs/deployment.md` records the final preview.

The reference audit distinguishes successful HTTP retrieval from failed reference-browser capture. No pixel-for-pixel comparison is claimed. Typefaces come from the official Google Fonts repository with retained OFL notices and SHA256 provenance. The sculpture, shader, film, and chart treatment are original, using the existing open-source stack.
