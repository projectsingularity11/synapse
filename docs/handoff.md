# SYNDROME handoff

## Delivered

SYNDROME is a Next.js/TypeScript research website about a compact classical decoder for a simulated quantum surface-code memory. Its question is: when measurement noise differs from the training distribution, how do logical prediction error and confidence calibration change?

V1 established the original editorial identity, eight main routes, actual coordinate-driven replay and measured error/calibration figures. V2 adds a labeled failure/disagreement gallery, actual check-support inspector, exact circuit/DEM and glossary pages, three-seed and paired comparisons, pointwise calibration intervals, independent fresh-shot confirmation, optional lazy spatial history, downloadable scientific figures/CSV, printable reading styles and retained notices. Native disclosures keep exact tables available without overwhelming the narrative.

The public experience has twelve routes. It uses ordinary scrolling and links; no login, database, paid inference service, visitor training, audio autoplay or runtime agents exist. Three real specialist workers collaborated offline with separate file ownership; orchestration is not part of the delivered browser application.

## Separate milestones

| Milestone | Actual status |
|---|---|
| A: research foundation | Partial. Protocol, official software reading, literature synthesis, eight source records and sixteen linked claims exist. Required neural-decoder paper content remains inaccessible; paper-specific comparisons are not verified. |
| B: experiment | Complete within the documented bounded scope: real primary run, three model seeds, two MWPM priors, metrics/manifests, supplements and a separate frozen-model fresh-shot confirmation. |
| C: website | Implemented and locally tested: all required routes plus four technical/diagnostic routes, responsive controls, accessible alternatives, original figures, credits and downloads. Silent release; no unverified music asset included. |
| D: quality | Build, 29 Chromium browser tests, 11 scientific tests and five integrity tests pass. Six mobile Lighthouse runs and five viewport screenshot sets recorded. Physical-device, other-browser and full manual assistive-technology verification remain unrun. |
| E: deployment | Not deployed. No public URL. Exact authorized Vercel account/team/project and authenticated access are missing. |

## What actually ran

The primary distance-3 rotated Z-memory experiment uses three rounds, 24 detector bits and circuit-level Pauli channels. Train/validation: 40,000/8,000 shots at measurement-flip probability 0.005. Tests: 20,000 shots at each of 0.001,0.005,0.015,0.03. Three 24→32→16→1 MLPs were trained with disjoint data streams and validation-only selection; threshold 0.5 and primary reporting seed 101 were fixed. Fixed-prior and matched-prior PyMatching receive the same test shots. Matched matching knows the test noise model.

For seed 101, original neural failures were 31,78,261,732 per 20,000; matched matching failures 10,38,101,340. Neural Brier increased from 0.003374 at the training setting to 0.031022 at 0.03. Reliability diagrams and bin counts/intervals show probability behavior; Brier alone does not isolate miscalibration.

A separate protocol/source/config was committed before drawing 400,000 additional test shots. The frozen seed 101 model was not retrained or tuned. On 100,000 fresh shots per setting, neural failures were 153,390,1364,3796; matched matching failures 59,193,636,1826. This confirms the pattern at higher sampling precision conditional on the same fitted model. It is not independent training replication and original/fresh samples are not pooled.

The conclusion is narrow: this compact model deteriorates under the controlled noise increase and loses in observed logical error to matching at all tested settings. It does not establish that neural decoders generally lose, a threshold, quantum advantage, AlphaQubit replication or hardware-ready latency. The swept channel includes terminal data readout, not only ancilla measurements. Prediction uses the entire saved syndrome history even when the scrubber hides later slices.

## Verified performance and limits

Final Lighthouse mobile runs: home 93/96/98, study 97/97/96; accessibility 100 in all six. LCP 1.565–2.360s, CLS 0. Conditions: headless system Chromium, 412×823 mobile emulation,DPR 1.75,150 ms simulated RTT,1638.4 Kbit/s throughput,4× CPU slowdown, local production server on shared Intel Xeon Platinum 8573C. No field INP/Core Web Vitals are claimed.

Fresh reading-path JS transfer is approximately 149–153KB including framework code. Spatial activation adds approximately 260KB compressed. During scripted rotation on SwiftShader software WebGL, 179 browser rAF samples had median/p95 16.7ms and max 33.3ms, with no recorded long tasks in that run. This is not a physical desktop GPU 60 fps certification. The complete 2D path is the lighter default. See qa-report.md and raw records for scope and uncertainty.

Full manual screen-reader review, Safari/Firefox, physical phones/GPUs, hardware quantum validation, mixed-noise retraining and distance scaling are not claimed. Source-paper/reference-site requests returned proxy denials. No unverified paper performance, affiliation, publication, award or soundtrack is invented.

## Reproduce and run

Use this existing isolated checkout; no extra worktree is required.

```sh
cd /workspace/synapse
npm ci --cache /workspace/.npm-cache
npm run lint
npm run typecheck
npm run test:data
npm run build
npm start
```

Use a separate shell with TEST_BASE_URL set to the running production server to run npm test. For editing, npm run dev uses port 3000 by default. The default debug WebSocket cannot connect on this host; the supported reactDebugChannel=false setting keeps development hydration working. Manual refresh may be needed for hot reload. This is a local runtime limitation, not a production dependency.

For research, see research/protocol.md. The retained environment is /workspace/syndrome-venv. Install its pinned requirements in a virtual environment; run unittest discovery, then deliberately run run.py only when intending to create a new canonical primary run. It refreshes study.json/traces.json; preserve existing outputs first. supplement.py verifies reconstruction before diagnostics, confirmation.py uses the frozen checkpoint and separate seeds, and plot.py exports saved-data figures. Rebuild the site afterward; artifact hashes and identities gate publication copies. Raw training arrays are not committed.

## Provenance, licensing and deployment

The repository retains source/config/checkpoint hashes, exact package versions, seeds, machine/timing scope, counts and completion statuses. The browser receives saved small results, never the research-only checkpoint or raw training data.

Direct library/source/license evidence is in dependency-audit.md and asset-register.csv. Production npm notices for 84 packages are retained in public/THIRD-PARTY-NOTICES.txt. Standalone figure font permissions are retained beside exports. Website fonts are system fonts. No reference-site assets, paper figures, example scenes, downloaded web fonts or unverified audio are reused. The project owner has not assigned a blanket license to original work.

The repository is prepared for Vercel's Next.js path; no deployment occurred. When the owner returns, identify the exact account/team/project and authorize an authenticated preview before any state-changing deployment. Test the actual returned URL before production authorization. Do not alter DNS or replace an existing project. For the remaining literature work, permit primary-source access or supply readable paper copies. No cloud environment configuration was reapplied or published during implementation.
