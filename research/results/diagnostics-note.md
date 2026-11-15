# Post-hoc diagnostics: rare labels and confidence

This analysis reuses the original80,000 test shots and the fresh-confirmation400,000 test shots for the same frozen seed101 model. It does not create new independent evidence. The original40,000 training labels are regenerated only to estimate a **fixed training-prevalence constant probability** baseline. No model fitting, threshold optimization, probability recalibration or checkpoint selection occurs.

`experiments/scripts/diagnostics.py` requires the original and confirmation error counts/intervals/bin memberships/counts to reproduce exactly before emitting any diagnostics. It permits absolute tolerance2e-7 for floating probability summaries/Brier because reconstructed float32 forward operations can differ slightly with matrix shapes. The checkpoint hash, parent source/configuration and package versions are checked. The output manifest hashes all source inputs and the output itself, and records exactly which streams were regenerated. Runtime is bounded at60seconds on one CPU numerical thread, with no GPU. Original study, confirmation, supplement, traces and figures are untouched.

## What is measured

- **Flip prevalence:** fraction of simulator observable labels equal to1. This is distinct from decoding error. A decoder can predict flip0 for most shots and appear accurate when flips are rare.
- **Always-no-flip baseline:** predicts flip0 and probability0. Its error and Brier score both equal flip prevalence. This reference does not use test labels to choose a predictor; observed prevalence merely evaluates the prespecified predictor.
- **Training-prevalence constant:** predicts the same probability on every test shot, estimated only from original training labels. Its Brier measures a no-syndrome probability reference held fixed under distribution shift. It is not a test-prevalence oracle baseline.
- **Confusion matrices:** exact true negatives, false positives, false negatives and true positives for neural/fixed/matched predictions. Counts distinguish missed flips from false alarms and must sum to the original condition's shots/failures.
- **Event calibration gaps:** mean predicted P(flip) minus observed flip frequency in each original fixed probability bin. Positive means overpredicting flips, which is not necessarily overconfidence in the predicted class. Empty bins remain null.
- **Confidence-conditioned errors:** binary-class confidence is`max(P(flip),1−P(flip))`. Nonoverlapping fixed bins[0.5,0.6),…,[0.9,1] summarize error and observed accuracy versus confidence. Cumulative thresholds0.5,0.6,0.7,0.8,0.9,0.95,0.99 describe retained coverage and mistakes conditional on retained shots. These thresholds are explicitly **post-hoc descriptive**, fixed in analysis source, and not selected as an operating point.

Every confidence group reports count, failures, coverage, error, mean confidence, observed accuracy and pointwise95% Wilson intervals. Accuracy bounds reverse/complement the error bounds: `[1−errorUpper,1−errorLower]`. Empty groups have null error/interval/accuracy, not a claim of perfect performance. Threshold groups overlap and are not independent replications; the intervals are neither simultaneous bands nor evidence of optimal rejection thresholds.

Brier score alone does not establish calibration. It includes probability quality affected by discrimination and class prevalence. A fixed-bin Murphy decomposition is intentionally omitted because coarsening the original probabilities changes their Brier score unless residual terms are handled; no exact decomposition is asserted.

## Interpretation limits

Use fresh-confirmation conditions as the primary presentation of these additional diagnostics, with the original test conditions as supporting analysis. Always identify the parent dataset and shot counts; do not pool them. These quantities characterize one fitted model and one circuit/noise simulator. They do not establish independent training robustness, hardware performance, or universal confidence calibration. A high-confidence error is possible and does not imply the model saw the physical fault or quantum state.

The measurement-noise sweep changes both physical task difficulty and mismatch with the training distribution. Without matched-noise neural retraining controls it **does not isolate the causal cost of distribution mismatch alone**. Both fixed and oracle-noise matching comparisons provide context but do not supply that missing neural control. Increasing physical noise can raise errors even for a decoder with a correct prior. The original experiment's descriptive question remains valid; causal attribution should stay narrower.

Reproduce from the repository root with the pinned research environment:

```sh
/workspace/syndrome-venv/bin/python research/experiments/scripts/diagnostics.py
/workspace/syndrome-venv/bin/python -m unittest discover -s research/experiments/tests -v
```

The canonical new artifact is`research/results/aggregates/diagnostics.json`, with its run-specific manifest linked inside. The script regenerates only the already-recorded training/test streams and writes a timestamped diagnostics manifest. It does not alter the sources of the original evidence.
