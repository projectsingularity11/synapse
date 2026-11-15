# SYNDROME: bounded distance-3 protocol

## Question and scope

When measurement noise changes from the training distribution, how do logical-observable prediction error and probability calibration change for a compact classical neural decoder? This independent computational study uses simulated rotated surface-code Z memory only. It is neither a hardware experiment nor a reproduction of AlphaQubit. All numeric choices below are project choices, not findings borrowed from literature.

## Circuit and inputs

Stim `Circuit.generated("surface_code:rotated_memory_z", distance=3, rounds=3)` prepares nine data qubits and uses eight measurement ancillas. The generated circuit is saved in `experiments/manifests/training-circuit.stim`; the decomposed detector error model is saved beside it. The four circuit-level noise knobs are:

| API parameter | Probability | Meaning |
|---|---:|---|
| `after_clifford_depolarization` | 0.001 | Pauli depolarization after one- and two-qubit Clifford gates |
| `before_round_data_depolarization` | 0.001 | Data-qubit depolarization before each check round |
| `after_reset_flip_probability` | 0.001 | Basis-appropriate flip after reset |
| `before_measure_flip_probability` | Sweep 0.001, 0.005, 0.015, 0.03 | Basis-appropriate flip before **every measurement, including final data-qubit readout**, not ancilla-only measurement noise |

Training and validation use measurement-flip probability 0.005. The in-distribution test is 0.005; all other settings change only the measurement-flip knob. No distance-5 extension or mixed-noise training is included.

The decoder receives only 24 binary detection events in the order returned by the Stim detector sampler, cast to a 24-element float32 vector. No physical fault labels, logical labels, coordinates, or ground-truth recovery chains enter the model. Coordinates come from `get_detector_coordinates()`: four initial detectors at t=0, eight inter-round detectors at t=1, eight at t=2, and four terminal detectors at t=3. Time coordinates denote comparison layers, not four complete measurement rounds. Initial and final detector subsets depend on the chosen Z preparation/readout basis. Interior detection events compare repeated stabilizer measurements; terminal detectors combine final data measurements with the last ancilla results. These are parity changes, not direct observations of an unknown quantum state.

Observable 0 is final Z parity on qubits 1, 3, 5 relative to the noiseless reference. The target is its binary flip label. The model predicts this logical-observable flip, **not** a physical recovery chain. Circuit-derived qubit coordinates, check bases, record offsets, and detector ordering are exported; no time×lattice reshape is guessed. The v2 topology supplement obtains each check's data support from actual CX target pairs, not a spatial nearest-neighbor heuristic.

## Splits and bounded training

`experiments/configs/d3.json` is canonical. Train: 40,000 shots, Stim seed 41001. Validation: 8,000 shots, seed 42001. Test: 20,000 shots at each of four settings, seeds 43001–43004. These streams are disjoint by seed. All decoders and model seeds receive the **same test shots** at each condition. Results across model seeds are therefore dependent and are not pooled as 60,000 independent trials.

The compact scikit-learn MLP has dimensions 24→32→16→1, ReLU hidden activations and logistic output, totaling 1,345 trainable parameters. It uses unweighted binary cross entropy, Adam, learning rate 0.001, batch size 512, L2 alpha 0.0001, at most 40 epochs, validation-loss patience eight. The checkpoint with validation loss improvement of at least 1e-6 is retained. Decision threshold 0.5 is fixed before final test evaluation. Seeds 101, 202, 303 vary initialization and minibatch shuffling; seed 101 is the explicitly declared primary reported model. Other seeds show training variability, not independent dataset replication. The method is not optimized through a test-label hyperparameter search.

A 512-shot pilot with two training epochs and a 256-shot no-noise sanity check ran first. Total full-study execution was approximately 7.42 seconds on the recorded shared CPU instance using one numerical-library thread. The timing is evidence of this run's cost, not a guaranteed future budget. No GPU or paid computation was used.

## Baselines and fairness

PyMatching minimum-weight perfect matching is constructed from Stim's detector error model with `decompose_errors=True`. The fixed-prior graph uses the training configuration's probabilities at all evaluations. The matched-prior graph is rebuilt for each test setting and has **oracle knowledge of the evaluation noise parameters**. Both predict observable 0. Correlated matching is not enabled: correlations between decomposed graph edges are not fully modeled. No `approximate_disjoint_errors` option is enabled. This is a standard graphlike MWPM comparison, not a claim that matching models every physical correlation or is an ultimate optimal decoder.

## Metrics and interpretation

For each complete memory experiment, a failure is predicted observable flip ≠ simulated label. Report failures/20,000 and a two-sided 95% Wilson binomial interval (z=1.959963984540054). This is **per complete experiment**, not per-round error. Shots are independent draws under the simulator model; the interval does not include uncertainty in the noise model, training procedure, software, or hardware behavior. Zero observed failures still has a positive upper confidence bound.

The neural Brier score is mean `(P(observable=1)−label)^2`. Reliability bins have fixed edges 0,0.1,…,1: lower-inclusive/upper-exclusive except the last bin includes 1. Each bin records its count, mean probability of observable flip, and observed flip frequency. This is event-probability calibration, not confidence-in-correctness calibration. Empty bins have null values and must not be plotted as zero. Label imbalance means Brier/reliability must be interpreted alongside logical errors. Probability 0.5 is a decision boundary, not an assertion of maximal confidence.

The post-hoc v2 supplement adds Wilson intervals for each bin's observed flip frequency and 2×2 paired correctness counts for seed101 versus each baseline. The bin intervals are pointwise descriptive intervals, not simultaneous bands. Paired counts use the same shots: both correct, neural only correct, matching only correct, both wrong. No independence assumption between decoders is made, no significance p-value is claimed, and no test-driven checkpoint is selected.

## Replay selection and privileged information

The representative replay consists of the **first eight** final test shots at each condition, selected independently of decoder outcomes. A separate clearly labeled handpicked gallery selects the first neural error and the first neural/matched disagreement at each condition; the same shot may be included twice under different selection reasons. It is an explanatory failure gallery, not representative prevalence evidence. Ground-truth observable labels are privileged simulator information shown only in the outcome stage; they were never model inputs. Neither artifact contains fault-location labels or invented recovery paths.

## Provenance and reproduction

The original run manifest records source commit `1680f7aa1e373875a81448b3240e52b31fc73eb1`, source-script SHA256, raw configuration SHA256, actual packages, seeds, platform, CPU, sample counts, training histories, baseline settings and outputs. Working-tree dirty status is recorded honestly because other website files were being developed concurrently. The experiment source script's SHA256 is `03eb5215f8fae6cf9f1f46bb28a7737411af5a2cf65be8db52e4ec16060273df` and matches that committed source. Large generated datasets are not retained: regenerate with recorded seeds and pinned packages.

`scripts/supplement.py` independently reconstructs seed101 and requires exact equality of the original checkpoint epoch/loss, all test metrics, reliability bins, and representative-trace probabilities before writing supplementary outputs. It hashes its code and original inputs, preserves the v1 artifacts, and stores a small JSON research-only checkpoint outside public assets. The supplement is explicitly post-hoc.

```sh
python3 -m venv /workspace/syndrome-venv
/workspace/syndrome-venv/bin/python -m pip install -r research/experiments/requirements.txt
/workspace/syndrome-venv/bin/python research/experiments/scripts/run.py
/workspace/syndrome-venv/bin/python research/experiments/scripts/supplement.py
/workspace/syndrome-venv/bin/python -m unittest discover -s research/experiments/tests -v
```

Run from the repository root. `run.py` intentionally refreshes canonical `study.json`/`traces.json` and creates a timestamped manifest; preserve existing artifacts before deliberately starting a new study. The supplement requires the original compatible pipeline/config/packages and exact reproduction. Model prediction timing is warmed `predict_proba`, batch 1,024, 30 repetitions, one thread; it excludes sampling, I/O, browser replay, and physical hardware latency. Amortized time per shot is not single-shot latency.

## Limits

Only one small code distance, one basis, three rounds and one circuit family are studied. The training-data realization is fixed across seeds. There is no hardware drift, leakage, non-Markovian noise, measurement crosstalk, correlated-noise model selection, hyperparameter search, threshold optimization, temperature scaling, or larger-distance scaling claim. Three training seeds do not establish robustness across training datasets. Literature experiments differ in distance, hardware, shot count and noise; direct numerical comparisons would be misleading. The observed neural model performs worse than both matching baselines at every tested setting. That result bounds this implementation, not neural decoding as a field.
