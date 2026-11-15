# SYNDROME handoff

> This document records the earlier editorial release. The immersive Synapse redesign supersedes its visual design and performance claims. See [the current redesign report](redesign-report.md).

## Delivered

SYNDROME is a Next.js/TypeScript research website about a compact classical decoder for a simulated quantum surface-code memory. The visitor moves from an actual saved detection-event scene into shot replay, measured evidence, uncertainty, a stronger training control and a reproducible research vault. Start with [the proposed final product](proposed-final-product.md) for the editorial review path.

V1 established the editorial identity, coordinate-driven replay and original error/calibration figures. V2 adds a labeled failure gallery, actual check-support inspector, circuit/DEM and glossary, seed/paired comparisons, fresh-shot confirmation, optional spatial history, downloadable figures and readable numeric alternatives. The latest pass adds full-domain responsive plots, calibration-bin occupancy, a conceptual readout lesson, prevalence/confusion/conditional-confidence diagnostics and a new equal-budget matched-training control. Two standalone follow-up figures are exported as SVG, PNG and PDF.

Fourteen routes use ordinary scrolling and links. The browser uses saved small artifacts; no visitor training, database, login, paid inference, audio autoplay or runtime agents exist. Specialist workers collaborated offline with separate ownership. D3/Visx upstream references and licenses were researched; the small SVG plots require no new runtime dependency or copied demo assets.

## Separate milestones

| Milestone | Actual status |
|---|---|
| A: research foundation | Partial. Protocols, verified official software reading, literature synthesis, ten source records and twenty-two linked claims exist. Required neural-decoder paper content remains inaccessible; paper-specific comparisons are not verified. |
| B: experiment | Complete within the documented bounded scope: original run, three initializations, two MWPM priors, retained manifests, supplements, frozen-model fresh-shot confirmation, post-hoc diagnostics and a separate twelve-fit training control on fresh final shots. |
| C: website | Implemented and locally tested: fourteen routes, responsive figures/controls, accessible reading alternatives, purposeful optional 3D, original figures, credits and downloads. No unverified soundtrack. |
| D: quality | Lint, TypeScript, production build, 36 Chromium browser tests, 17 scientific tests and five integrity tests pass. Twelve mobile Lighthouse runs and twenty-five screenshots recorded. Physical-device, other-browser and full manual assistive-technology verification remain unrun. |
| E: deployment | Not deployed. No public URL. Exact authorized Vercel account/team/project and authenticated access are missing. |

## What actually ran

The primary distance-3 rotated Z-memory experiment uses three rounds, 24 detector features and circuit-level Pauli channels. Training/validation: 40,000/8,000 shots at measurement-flip probability 0.005, disjoint split seeds. Test: 20,000 shots at each of 0.001, 0.005, 0.015 and 0.03. Three 24→32→16→1 MLP initializations share the training/validation data; selection uses validation only. Threshold 0.5 and primary reporting seed 101 were fixed. Both PyMatching priors receive the same test shots; matched matching knows the test noise model.

Seed 101 original neural failures: 31, 78, 261, 732 per 20,000; matched matching: 10, 38, 101, 340. Neural Brier increases from 0.003374 at training noise to 0.031022 at 0.03. Reliability bins, counts and pointwise intervals reveal probability behavior; Brier alone does not isolate miscalibration. The original noise sweep changes task difficulty and mismatch together and does not isolate a causal mismatch penalty.

A separate pre-label protocol/source commit precedes 400,000 additional test shots. Without retraining the frozen seed 101 model, neural failures on 100,000 fresh shots per setting are 153, 390, 1364, 3796; matched matching: 59, 193, 636, 1826. This improves precision conditional on one fitted model, not independent training replication.

The new post-hoc diagnostics reuse those records and original training labels. At 3% noise, a class-confidence cutoff of 0.99 retains 83,087 confirmation shots and 1,178 errors. Mean confidence is 99.84%; observed accuracy is 98.58%. This is a descriptive conditional result, not a tuned cutoff or operating recommendation. Event probability and confidence in the predicted class are separately defined. The analysis generates no new independent evidence.

The new training control commits source/protocol before drawing fresh final labels and freezes all twelve fits before final testing. Four training-noise groups each have one 40,000/8,000 train/validation realization and three initializations. Fixed training reuses the 0.005 group; matched training uses the known evaluation noise. Each evaluation setting has 100,000 new test shots shared across all decoders/initializations. At 0.005 both neural comparisons use the identical model. At 0.03, seed 101 fixed/matched neural errors are 3,775/2,736; matched MWPM has 1,838. All three initializations improve at higher noise but have more classification errors under matched training at 0.001. This oracle comparator is not automatic adaptation; distinct training datasets and optimization outcomes remain part of the contrast.

There are 880,000 distinct held-out shots across the original, frozen confirmation and new control studies. Diagnostic reuse and repeated decoder/model evaluations do not add independent shots. Study results remain separate; seeds are not pooled into larger sample sizes.

The compact model loses to matching under this simulation protocol. The work establishes neither a neural-decoder ranking in general, a threshold, quantum advantage, AlphaQubit replication nor hardware-ready latency. The swept channel includes terminal data readout. Prediction uses the whole saved syndrome history even when the scrubber hides later slices.

## Verified performance and limits

Twelve mobile Lighthouse runs: performance 94–98, accessibility/best-practices/SEO 100 throughout, LCP 1.664–2.411s and CLS 0. Headless system Chromium, 412×823 mobile emulation, DPR 1.75, simulated 150ms RTT and 1638.4Kbit/s throughput, 4× CPU slowdown, local production server on shared Xeon Platinum 8573C. These meet the stated lab targets; no field INP/Core Web Vitals are claimed.

Before explicit spatial activation, the measured replay loads 150,014 transferred JS bytes. Scripts newly observed after activation total 270,606 bytes, including small shared chunks. A separate settled profile including prefetch records approximately 157–165KB across five reading routes. The full 2D path is the default and no training arrays/checkpoints are shipped. The unchanged optional scene's earlier SwiftShader scheduling sample is retained with its limited scope in [QA](qa-report.md); physical GPU throughput remains unverified.

Primary-source/reference-site requests still return proxy denials. Full manual screen-reader review, Safari/Firefox, physical phones/GPUs, hardware validation, mixed-noise training and distance scaling are not claimed. No unseen paper results, affiliation, publication, award or soundtrack is invented.

## Reproduce and run

Use the existing isolated checkout:

```sh
cd /workspace/synapse
npm ci --cache /workspace/.npm-cache
npm run lint
npm run typecheck
npm run validate:data
npm run test:data
npm run build
npm start
```

In a separate shell, set `TEST_BASE_URL` to the production server and run `npm test`. The retained local review server uses port 3001; the default `npm start`/development port is 3000. Development debug WebSockets cannot connect on this host; `reactDebugChannel=false` preserves hydration and manual refresh may be needed for hot reload.

The scientific environment is `/workspace/syndrome-venv`; requirements are pinned in `research/experiments/requirements.txt`. Run:

```sh
/workspace/syndrome-venv/bin/python -m unittest discover -s research/experiments/tests -v
```

Read `research/protocol.md`, the two follow-up protocols and result notes before intentionally rerunning a data-generating script. `run.py` refreshes the canonical primary study/traces; `supplement.py` verifies reconstruction; `confirmation.py` uses the original frozen checkpoint and new seeds; `diagnostics.py` reuses saved evidence; `training_control.py` fits separate models and creates a new control run. Do not overwrite the delivered evidence merely to preview the site. `plot.py` and `plot_followup.py` export saved-data figures. Build exports publication copies and verifies manifests/hashes.

## Provenance, licensing and deployment

Source/config/checkpoint hashes, package versions, seeds, hardware/timing, exact counts and completion status remain in the vault. Original figure files are preserved by the follow-up integrity gate. The browser receives only small saved outputs, never model weights or full training data.

Upstream source/license evidence is in `dependency-audit.md`, `asset-register.csv` and visualization reading notes. Notices for 84 production npm packages are retained in `public/THIRD-PARTY-NOTICES.txt`; standalone figure font permissions accompany exports. Website fonts are system fonts. No paper/reference-site assets, copied example scenes, downloaded fonts or unverified audio are reused. Original work has no owner-assigned blanket license.

No deployment occurred. When the owner returns, identify the exact Vercel account/team/project and authorized authenticated preview target. Verify the returned URL before any production step; do not alter DNS or replace an existing project. Remaining paper reading needs readable primary-source access. No cloud environment configuration was reapplied or published during implementation.
