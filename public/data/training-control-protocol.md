# Exploratory equal-budget training-noise control

This protocol, configuration, and execution source are committed before any new test labels are generated or observed. It is an exploratory follow-up designed after the original study and frozen-model confirmation, not a preregistration of those earlier studies. Earlier result patterns are known. No follow-up operating point or model is selected from these new test results.

## Why this control exists

The original fixed-model measurement-noise sweep changes both physical task difficulty and mismatch with its training distribution. It cannot by itself isolate a mismatch-specific penalty. Here compare two equal-budget learned-decoding procedures **within the same evaluation noise condition and on the same test shots**: one trained at the fixed noise0.005 and one trained at that evaluation condition's noise. This better controls physical task difficulty for each paired comparison. It still does not provide a universal causal decomposition: the training datasets differ between settings, only one train/validation realization exists per setting, three seeds vary initialization/shuffling rather than independent datasets, and every procedure is limited by finite optimization/capacity/budget.

## Fixed choices and data separation

Use the unchanged distance3, three-round rotated Z-memory simulator and noise channel placements from the original experiment. Clifford/pre-round-data/post-reset noise remains0.001. Sweep the before-measurement flip probability0.001,0.005,0.015,0.03, **including terminal data readout**. Use four training datasets,40,000 shots each, seeds61001–61004, and four validation datasets,8,000 shots each, seeds62001–62004. These streams are new relative to all earlier runs. Use fresh100,000-shot test streams63001–63004 at corresponding evaluation settings. Test streams are disjoint from train/validation, original, confirmation and pilot streams. Every compared decoder within a condition sees identical test samples.

For each training setting use the same24→32→16→1 compact MLP,1,345 parameters, ReLU hidden/logistic output, unweighted binary cross entropy, Adam learning rate0.001, batch512, L2alpha0.0001, maximum40epochs, validation-loss patience8 and improvement tolerance1e-6. Seeds101,202,303 set initialization/shuffling. All three models at a setting share that setting's training/validation dataset. Model capacity, shot budgets, optimizer and selection rules are identical across training settings. No architecture sweep, calibration fit, class weighting, threshold tuning or extra optimization is permitted. Threshold0.5 is fixed.

**Train all12 models and freeze every validation-selected checkpoint before drawing any new final test data.** For each seed, the fixed-training model is the already-trained0.005 group reused across all four evaluations. At evaluation0.005, the matched-training and fixed-training models are the **same objects/checkpoints**: their predictions, probabilities and metrics must be exactly identical by construction. At the other settings compare each fixed seed to the same seed in the matched group. Shared initialization seeds help pairing but do not make the different training datasets identical.

Standard uncorrelated graphlike PyMatching baselines may also be reported, using original fixed0.005 prior and the corresponding oracle matched evaluation prior. They use the same fresh shots. No correlation-aware matching or hyperparameter change is introduced.

## Reports and boundaries

For every setting and training seed report exact failures/100,000 complete experiments, logical prediction error and pointwise95% Wilson intervals, Brier score and standard fixed-bin reliability data. Report paired correctness counts: both correct, fixed-training only correct, matched-training only correct, both wrong. The signed descriptive contrast is matched error minus fixed error; negative favors matched training under this procedure. Do not pool three seed evaluations into300,000 independent shots. No statistical significance or universal mismatch-penalty estimate is asserted. Do not combine these new test counts with the original or confirmation evidence.

Export a separate`research/results/aggregates/training-control.json`, with model training histories/checkpoint hashes and a run-specific manifest. Preserve12 small model checkpoints for offline provenance only, outside public assets. Record the configuration/source/protocol commit and hashes, source imports, versions, seeds, hardware, exact counts and all completed outputs. Never alter original study, confirmation, diagnostics, supplementary traces or figures. CPU-only, one numerical-library thread, maximum120seconds; if the bound is exceeded record incomplete status rather than silently shrinking the sample/training budgets. Expected cost from earlier pilot training is roughly30seconds, not a paid compute commitment.

```sh
/workspace/syndrome-venv/bin/python research/experiments/scripts/training_control.py
/workspace/syndrome-venv/bin/python -m unittest discover -s research/experiments/tests -v
```

Use the pinned research environment, from repository root. Each intentional rerun writes a new timestamped manifest/checkpoint artifact and refreshes only the separate canonical training-control aggregate.
