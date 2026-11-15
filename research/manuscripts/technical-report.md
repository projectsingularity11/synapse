# SYNDROME: a bounded measurement-noise shift study

## Abstract

We evaluate how a compact neural logical-observable classifier changes under measurement-noise mismatch in a simulated rotated surface-code memory. A distance-3 Z-basis circuit runs three rounds under specified circuit-level Pauli noise. A 24→32→16→1 multilayer perceptron is trained at measurement-flip probability 0.005 and tested at four probabilities, with ordinary fixed-prior and matched-prior minimum-weight perfect matching as baselines. Three neural initializations are evaluated on common disjoint test samples. For the preselected reporting seed 101, prediction error rises from 0.390% at the training setting to 3.660% at probability 0.03, while Brier score rises from 0.003374 to 0.031022. Matched-prior matching is better in observed error at all four settings. These findings concern this small simulation and budget only. Paper-content verification for the supplied neural-decoder literature remains incomplete because primary-source access was denied.

## Scientific task

Error correction extracts check information without directly measuring an arbitrary complete unknown encoded state. Changes in those checks define detection events. The target in this project is the flip of one logical observable relative to the noiseless reference. Multiple physical fault patterns may be equivalent for that target. An observable classifier need not identify a unique fault or produce a physical recovery chain.

The question is distribution shift: training and validation sample one configured measurement-noise probability while evaluation changes that probability. This tests a narrow failure mode rather than general robustness. There is no hardware, institutional affiliation, quantum computational advantage, or real-time decoder deployment in this work.

## Identification: a noise sweep is not a causal mismatch estimate

The design measures a fixed model on samples from changed noise configurations. Increasing measurement noise can make decoding intrinsically harder even for a decoder trained at that new probability. Consequently, the observed increase in neural error or Brier score cannot by itself be attributed entirely to training-distribution mismatch. The original experiment did not retrain a same-architecture network at each test noise setting under a comparable budget. A separate exploratory follow-up, reported below, now supplies that procedural comparison. The follow-up adds a within-setting learning-procedure comparison using disjoint validation and fresh final tests; differences in training samples and optimization still limit causal interpretation. The matched-prior MWPM comparison changes both model family and prior access, so it is not a substitute for this neural control. We report descriptive performance under shift, not an isolated causal effect of mismatch.

## Circuit and data representation

Stim generates `surface_code:rotated_memory_z`, distance 3 and rounds 3. Other configured noise probabilities remain at 0.001; measurement-flip probability sweeps over 0.001, 0.005, 0.015 and 0.03. The retained circuit and detector error model are the definitive channel placements. The measurement parameter includes final measurements according to the generated circuit, so it is not exclusively an ancilla-readout drift model.

The sampler returns detector bits and observable targets separately. A sample contains 24 detector bits; input dtype is float32 binary. No target or true fault location is included as a feature. Detector coordinates are read from the circuit and exported in detector-index order rather than guessed from a lattice. Initial and final checks include boundary treatment encoded in the detector declarations. Observable 0 is the parity of final Z measurements on data qubits 1, 3 and 5 relative to the noiseless reference.

## Splits, fitting and selection

The training sample contains 40,000 shots, seed 41001; validation contains 8,000 shots, seed 42001. Final tests contain 20,000 shots per condition, seeds 43001 through 43004. These streams are separate. Each test condition is shared across competing decoders and the three neural initializations, making descriptive comparisons paired on the same simulated shots.

The network uses ReLU hidden layers of widths 32 and 16 and a logistic output, totaling 1,345 parameters. It optimizes binary classification log loss with Adam, learning rate 0.001, batch size 512, L2 regularization 0.0001, up to 40 epochs and patience 8. Checkpoints minimize validation log loss. Seeds are 101, 202 and 303; seed 101 is the predefined public reporting seed, not the test winner. The threshold stays 0.5. No threshold calibration is fit on final tests.

## Baselines and information budget

PyMatching builds graphs from Stim detector error models using decomposition into graphlike components. Fixed-prior matching retains the p=0.005 training graph; matched-prior matching rebuilds a graph for each actual evaluation probability. The latter is given the evaluation noise model. Ordinary matching is used; correlation-aware matching is not enabled. Graph decomposition and independent-edge weighting can omit relationships in the original circuit mechanism. An exact matching solver does not imply an exact full circuit posterior.

## Metrics

For N shots and k incorrect logical predictions, error is k/N. It is error per complete experiment. The nominal 95% Wilson interval uses z=1.959963984540054 and denominator 1+z²/N; center (k/N+z²/(2N))/denominator and half-width z·sqrt((k/N)(1−k/N)/N+z²/(4N²))/denominator. This interval addresses test sampling conditional on the trained model, not model-training or physical-model uncertainty. A zero-failure sample still has an upper bound above zero.

Brier score is N⁻¹Σ(pᵢ−yᵢ)². Reliability uses ten equal-width bins [0,0.1), …, [0.9,1], comparing mean probability with observed target frequency and retaining counts. Empty bins are missing rather than zero evidence. Brier includes discrimination as well as calibration; an increase alone is not a pure calibration finding. Sparse intermediate bins limit reliability interpretation.

## Results

Run `d3-memory-z-20261115T004549Z` completed under the retained configuration.

| Measurement flip probability | Neural failures / 20,000 (seed 101) | Neural error, 95% Wilson CI | Fixed MWPM failures | Matched MWPM failures | Brier |
|---|---:|---|---:|---:|---:|
| 0.001 | 31 | 0.155% [0.109, 0.220] | 13 | 10 | 0.001264 |
| 0.005 | 78 | 0.390% [0.313, 0.486] | 38 | 38 | 0.003374 |
| 0.015 | 261 | 1.305% [1.157, 1.472] | 102 | 101 | 0.010843 |
| 0.030 | 732 | 3.660% [3.409, 3.929] | 352 | 340 | 0.031022 |

The neural seed range at the highest noise is 732–781 failures; at the training noise setting it is 78–79. These three models share a training set and tests. They illustrate initialization sensitivity and do not estimate all uncertainty sources. Matched and fixed matching coincide at the training setting because their noise models coincide. At probability 0.03, matched matching has 340 failures and fixed matching 352. No significance test for that difference is asserted.

The preselected model's high-noise logical error and Brier score are larger than in distribution. This supports a limited empirical statement about degradation in this setup. It does not show that neural decoders generally underperform matching, nor isolate a causal calibration mechanism across arbitrary noise drift.

## Post-hoc diagnostic supplement

Supplement `d3-memory-z-20261115T004549Z-supplement-20261115T010749Z` reconstructs the original reported model and test draws, requires equality with the original aggregate results, and adds paired correctness counts and bin-frequency intervals. It does not change the checkpoint, threshold or original study outputs. Each decoder pair has four mutually exclusive outcomes: both correct, neural only correct, matching only correct and both wrong. They sum to the original 20,000 shots; no independent-sample significance claim is made.

For calibration, Wilson intervals quantify pointwise uncertainty in each bin's observed logical-flip frequency. They do not quantify uncertainty in the network probability itself, and are not simultaneous confidence bands over all bins. Small-bin intervals can be very wide. This supplement is explicitly post-hoc, unlike the fixed original evaluation protocol. A separate handpicked gallery is labeled as such and must not be used to estimate failure prevalence.

## Timing scope

On an Intel Xeon Platinum 8573C CPU, one thread, the run measured median `predict_proba` batch time of 0.1762 ms at batch size 1,024 after one warmup over 30 repeats. The amortized value is 0.1720 microseconds per shot. This excludes sampling, file I/O and browser rendering. It is throughput in a local batched software call, not single-shot hardware decoder latency.

## Replay provenance

Representative traces are the first eight test shots per condition, selected without searching labels. Such a subset is reproducible, but can be visually quiet at low noise and is not a balanced showcase of failure types. The website labels it saved experimental replay. Simulator labels are privileged ground truth for evaluation and are revealed as such. Visual depth, lighting and line styling communicate coordinates; they are not measurements of a quantum wavefunction or a neural recovery path.

## Reproducibility and integrity

The manifest records source commit and script hash, configuration hash, package versions, seeds, split definitions, architecture, baselines, output paths and completion status. Its dirty-tree flag honestly records concurrent website work. The script hash identifies experiment code. Data are generated offline; no model training or quantum sampling occurs in visitor request handlers. Large generated training arrays are not committed. Retained aggregates, first-N traces and circuits permit auditing the website against the study.

## Limits and next study

Read `limitations.md` before extending conclusions. A useful next study would repeat entire train/validation/test datasets, use more test shots for rare events, compare correlation-aware matching, and examine longer memories or distance scaling under explicit budgets. Those are proposals, not completed findings. Read S01/S02 before making neural-decoder literature comparisons. The current result is neither a replication nor a hardware benchmark.

## References and claim traceability

S03 and S04 support the implemented simulation/matching methods. S05 is the project output; S06 is its protocol. S01/S02 are the required but unread primary neural-decoder references. Exact public claims and source IDs are in `../claims/claims.csv`; access status is explicit in `../sources/sources.json`.

## Fresh-shot precision confirmation addendum

Run `d3-memory-z-20261115T004549Z-confirmation-20261115T011610Z` is a separate confirmation on four fresh held-out samples of 100,000 complete experiments each, using seeds 53001–53004, disjoint from the original train/validation/test/pilot streams. The original seed101 epoch35 checkpoint is frozen. No retraining, checkpoint selection, threshold tuning or probability recalibration occurs. Configuration, execution source and protocol were committed before generating these new labels; the manifest records that commit and the checkpoint SHA256. This design was added after the original study, so it is not retroactively described as part of the original protocol.

| Measurement flip probability | Frozen neural failures / 100,000 | Neural error, 95% Wilson CI | Fixed MWPM failures | Matched MWPM failures | Brier |
|---|---:|---|---:|---:|---:|
| 0.001 | 153 | 0.153% [0.131, 0.179] | 61 | 59 | 0.001469 |
| 0.005 | 390 | 0.390% [0.353, 0.431] | 193 | 193 | 0.003435 |
| 0.015 | 1,364 | 1.364% [1.294, 1.438] | 648 | 636 | 0.011782 |
| 0.030 | 3,796 | 3.796% [3.679, 3.916] | 1,924 | 1,826 | 0.032650 |

This confirms precision conditional on the same fitted classifier and circuit-noise family, not independent model-training replication. Counts are not pooled with the original 20,000-shot results, and the original three-seed study remains visible. Matching uses the same fresh shots, with the same fixed versus test-noise-informed prior distinction. Intervals exclude training variability and noise-model error. The Brier score remains a composite probability-quality measure; no unique calibration mechanism or hardware generalization is established.

Manifest: `research/experiments/manifests/d3-memory-z-20261115T004549Z-confirmation-20261115T011610Z.json`. Source record S08 and claims C15–C16 link this addendum to the public evidence view.

The fresh-shot confirmation preserves this identification limit: narrower conditional sampling intervals do not distinguish inherent noise difficulty from neural mismatch cost.

## Post-hoc rare-label and confidence diagnostics

Run `d3-memory-z-20261115T004549Z-diagnostics-20261115T015124Z` reuses the 80,000 original and 400,000 frozen-model confirmation shots. It adds interpretation rather than new independent evidence. All predictions remain fixed. Training-label prevalence is 1,349/40,000 = 0.033725; that training-only value defines a constant-probability baseline without using final test labels for fitting. The always-no-flip classifier exposes label imbalance. Neither trivial baseline is a substitute for matching.

Event probability p=P(logical flip) differs from classification confidence max(p,1−p). A positive mean event-probability gap indicates overprediction of flips, not automatically overconfidence: confidence depends on which class was predicted. Diagnostics therefore retain both event-probability comparisons and class-confidence accuracy bins. Five class-confidence bins use edges 0.5,0.6,…,1; interval endpoints include 1 in the last bin. Empty conditioned groups retain null rates, never fabricated perfect accuracy.

Selective-risk thresholds are 0.5,0.6,0.7,0.8,0.9,0.95 and 0.99. Coverage is retained shots divided by all shots; selective risk is errors divided by retained shots. Threshold groups overlap and are not independent experiments. They were fixed for this descriptive analysis after the original results were known and are not a tuned deployment policy. Pointwise Wilson intervals concern the conditioned empirical error, not uncertainty in the model's probability.

In the confirmation data at measurement noise 0.03, confidence at least 0.99 retains 83,087/100,000 shots (83.087%) and contains 1,178 errors, approximately 1.418%. The figure does not mean that confident predictions are guaranteed correct. These reused labels, sparse bins and post-hoc choices must remain visible in the interpretation. We do not report an exact Brier-score decomposition: coarsening into fixed bins changes predictions, so omitting residual terms would not give an exact decomposition of the original score. Source S09 links to definitions, all counts and the diagnostic manifest.


## Exploratory equal-budget training-noise control

Run `d3-memory-z-20261115T004549Z-training-control-20261115T015445Z` adds a within-evaluation-setting comparison that the original sweep lacked. It was designed after seeing earlier results; its protocol, configuration and source were committed before any fresh test labels. It is an exploratory follow-up, not retroactive preregistration or a universal causal decomposition.

Four new training groups use measurement noise 0.001, 0.005, 0.015 and 0.03, with 40,000 training shots and 8,000 validation shots each (seeds 61001–61004 and 62001–62004). Each group fits seeds 101,202,303 using the same 1,345-parameter architecture, objective, optimizer, maximum epochs, patience, selection rule and 0.5 threshold. All twelve validation-selected models are frozen before any final-test sample is drawn. Fresh seeds 63001–63004 generate 100,000 test shots per evaluation setting, common to all compared models and matching baselines.

For each model seed, fixed training means the new 0.005 training group reused across evaluations; matched training means the group trained at the known evaluation probability. These are new models, not the original frozen seed101 weights. At evaluation 0.005 the two procedures are exactly the same models, so identical predictions and metrics provide a useful identity check.

| Evaluation measurement noise | Model seed | Fixed-training failures / 100,000 | Matched-training failures / 100,000 | Matched − fixed error (percentage points) | Fixed Brier | Matched Brier |
|---|---:|---:|---:|---:|---:|---:|
| 0.001 | 101 | 141 | 147 | +0.006 | 0.001577 | 0.001481 |
| 0.001 | 202 | 137 | 176 | +0.039 | 0.001237 | 0.001465 |
| 0.001 | 303 | 140 | 149 | +0.009 | 0.001261 | 0.001335 |
| 0.005 | 101 | 391 | 391 | +0.000 | 0.003638 | 0.003638 |
| 0.005 | 202 | 434 | 434 | +0.000 | 0.003706 | 0.003706 |
| 0.005 | 303 | 422 | 422 | +0.000 | 0.003600 | 0.003600 |
| 0.015 | 101 | 1,390 | 1,156 | -0.234 | 0.012276 | 0.009603 |
| 0.015 | 202 | 1,461 | 1,062 | -0.399 | 0.012492 | 0.009194 |
| 0.015 | 303 | 1,498 | 1,094 | -0.404 | 0.012684 | 0.009352 |
| 0.030 | 101 | 3,775 | 2,736 | -1.039 | 0.032841 | 0.022942 |
| 0.030 | 202 | 3,913 | 2,490 | -1.423 | 0.033326 | 0.021728 |
| 0.030 | 303 | 4,023 | 2,807 | -1.216 | 0.034267 | 0.023201 |

At the two higher-noise settings, matched training yields fewer logical errors and lower Brier scores for every initialization. At the lower-noise setting 0.001, it does not reduce logical errors for any initialization; Brier changes are mixed. Matching the training noise is therefore not an automatic improvement under this finite budget. At 0.03, seed101 changes from 3,775 errors with fixed training to 2,736 with matched training on the same 100,000 shots, a descriptive difference of −1.039 percentage points. Confidence intervals and paired correctness counts for all model pairs are retained in the artifact; no significance p-value is claimed.

This comparison holds evaluation noise constant within each pair and equalizes architecture and budgets. It therefore gives a more direct procedural contrast than comparing a fixed model across different noise levels. Nevertheless, training samples differ between noise groups, only one train/validation realization exists at each setting, optimization is finite, and the matched procedure is told the evaluation noise distribution. The three seeds vary initialization and shuffling, not independent training datasets. No rates are pooled into an artificial 300,000-shot independent sample. The experiment is not blind drift adaptation, a complete decomposition of mismatch cost, or evidence of hardware transfer. Original, confirmation and training-control results remain separate.

Source S10, claims C20–C22 and the artifact's manifest connect these results to the committed protocol and all checkpoint hashes.
