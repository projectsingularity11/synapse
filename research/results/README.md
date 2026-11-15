# Executed results and interpretation

The canonical bounded study is `d3-memory-z-20261115T004549Z`. It completed on 2026-11-15 UTC using Stim 1.16.0, PyMatching 2.4.0, scikit-learn 1.9.1 and NumPy 2.5.4. Full versions/hardware live in the run manifest; scientific choices and caveats live in `../protocol.md`.

Every row evaluates the same 20,000 independent test shots across all decoders. The neural column below is the declared primary model, seed101. Values are failures per complete experiment, not per-round error.

| Measurement-flip probability | Neural failures | Fixed-prior MWPM failures | Matched-prior MWPM failures |
|---:|---:|---:|---:|
| 0.001 | 31 | 13 | 10 |
| 0.005 (training distribution) | 78 | 38 | 38 |
| 0.015 | 261 | 102 | 101 |
| 0.03 | 732 | 352 | 340 |

The compact neural model's error increased as measurement noise increased; it lost to both matching baselines in every evaluated condition. Calibration and Brier values are saved, not inferred from error rates. The matched-prior baseline receives the correct evaluation noise model; the fixed-prior baseline does not. This does not show that learned decoding is generally inferior or superior. It demonstrates distribution sensitivity of this particular small model and training protocol.

## Artifacts

- `aggregates/study.json`: exact counts, 95% Wilson intervals, per-seed performance, Brier scores, fixed-bin reliability data/counts, qubit/detector metadata and warmed inference timing.
- `representative-traces/traces.json`: first eight test shots per condition, with actual detector events and observable predictions. These are saved replays, not live quantum computations.
- `aggregates/supplement.json`: explicitly post-hoc paired correctness tables and pointwise per-bin Wilson intervals. It links the original run without overwriting it.
- `representative-traces/handpicked.json`: separately labeled failure/disagreement gallery; selection is outcome-based and not representative.
- `aggregates/topology.json`: actual stabilizer support from CX pairs in the circuit, with measurement basis and data-qubit IDs.
- `../experiments/manifests/`: source/config hashes, versions, seeds, hardware, training history, generated Stim circuit and detector error model. The small seed101 JSON checkpoint is research-only and should not be included in browser bundles.

No enormous raw dataset is checked in. The pipeline regenerates shots from pinned packages/configuration/seeds. Stim seed reproducibility is scoped to compatible software/platform execution, not a promise across arbitrary versions or compiler choices. The v2 supplement verified exact reconstruction on this instance before emitting diagnostics.

## Test evidence

The pipeline suite checks no-noise syndrome/observable behavior (1,024 shots), baseline output shape, exact detector layer counts and data/ancilla counts, binary feature and label integrity, seed reproducibility, disjoint split seeds, Wilson upper bounds for zero failures, Brier and reliability-bin definitions, actual CX support, paired-count semantics, and saved artifact consistency. Known injected `X_ERROR(1)` tests before final readout distinguish a local fault on qubit1 (observable flip and one detector event) from the logical column on qubits1,8,15 (observable flip and no detector events). Using a noise instruction is necessary because deterministic circuit gates change Stim's noiseless reference; this test does not mistake reference changes for physical faults.

The original scientific suite passed **9 tests out of 9**; the expanded suite including fresh-shot confirmation passed **11 tests out of 11** (`python -m unittest discover -s research/experiments/tests -v`, 2026-11-15 UTC). Performance values here describe offline model prediction only, not Vercel, browser frame rate or hardware decoding latency. No physical recovery chain or fault-location probabilities are produced.

## Separate fresh-shot confirmation

`aggregates/confirmation.json` records run `d3-memory-z-20261115T004549Z-confirmation-20261115T011610Z`: 100,000 new test shots at each original setting, seeds 53001–53004, using the frozen seed101 checkpoint without any fitting. Its pre-label protocol and source were committed at `a8b624e`. Neural failures are 153,390,1364,3796; matched-prior failures 59,193,636,1826. These 400,000 fresh shots improve precision conditional on the same fitted model. They are neither independent training replication nor pooled with original shots. Full probability metrics and uncertainty remain in the separate artifact and technical-report addendum.
