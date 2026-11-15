# Exploratory training-noise control: executed evidence

Run`d3-memory-z-20261115T004549Z-training-control-20261115T015445Z` completed in26.031seconds on the recorded CPU with one numerical-library thread, no GPU. The protocol/configuration/source were committed at`9ca4590` before generating or observing the new final-test labels. All12 validation-selected model checkpoints were written and frozen at01:55:10.562105UTC; new test generation began at01:55:10.565626UTC on2026-11-15. Hashes, versions, hardware, seeds and histories are in the linked manifest.

This is a separate exploratory follow-up, not a replacement for the original fixed-model study or fresh-shot confirmation. It trains four equal-budget groups at measurement noise0.001,0.005,0.015,0.03, each with40,000 training shots,8,000 validation shots, the original24→32→16→1 architecture and the same optimizer/checkpoint rule. Each group has three initialization/shuffling seeds101,202,303. There is only **one training-data realization and one validation-data realization per condition**, shared by its three seeds. The fixed-training comparator is the new0.005 training group reused across all evaluations; it is not the original seed101 checkpoint.

Each condition uses100,000 fresh test shots common to the fixed-training neural models, matched-training neural models, and fixed/matched MWPM baselines. Fresh train seeds61001–61004, validation seeds62001–62004 and test seeds63001–63004 are disjoint from earlier data streams. No model is selected, retuned or recalibrated using test labels. The0.005 fixed/matched neural comparison uses exactly the same model objects and predictions by construction.

## Exact observed counts

Every table entry is fixed-training failures → matched-training failures per100,000 complete experiments, **not per-round error**. Rows compare the same test shots within each condition. Seeds are distinct fits on shared data, not independent test-shot replications.

| Measurement-flip probability | Seed101 | Seed202 | Seed303 |
|---:|---:|---:|---:|
| 0.001 |141→147|137→176|140→149|
| 0.005 |391→391|434→434|422→422|
| 0.015 |1390→1156|1461→1062|1498→1094|
| 0.03 |3775→2736|3913→2490|4023→2807|

At the two higher noise settings, matched training reduced logical prediction errors for all three initializations under this finite-budget procedure. At the lower noise setting it produced slightly more classification errors for all three seeds; do not generalize this as proof that mismatch is beneficial. For seed101 at0.001, matched training has fewer Brier losses despite more classification mistakes, illustrating that probability quality and binary error are distinct objectives.

For the preselected report seed101 at0.03, fixed-training error is3.775% with95% Wilson interval[3.659%,3.895%]; matched-training error is2.736% with interval[2.637%,2.839%]. The paired counts are95,726 both correct,499 fixed-only correct,1,538 matched-only correct,2,237 both wrong. This is a descriptive paired contrast; separate binomial intervals are not a paired-difference confidence interval or a significance test. Fixed/matched MWPM respectively make1,923/1,838 mistakes on these same shots, so the new matched neural model still loses to matching at that setting. Brier scores and all seed/condition counts/intervals are in`aggregates/training-control.json`.

## Interpretation boundaries

Within a fixed evaluation condition, comparing the two learned procedures controls physical task difficulty more directly than the original sweep. It remains a limited comparison of finite-budget training procedures. Matched training has privileged knowledge of the evaluation simulator noise; it is not online adaptation to unknown hardware drift. Different training datasets, limited optimization, model capacity, checkpoint variation and only three initializations all limit causal interpretation. This is not a universal causal decomposition of distribution mismatch, a guarantee of calibration, a distance-scaling result or hardware evidence. No300,000-shot pooled intervals or test-selected best-seed claims are reported.

The original fixed-model sweep's difficulty-versus-mismatch ambiguity remains true for that original experiment. This follow-up supplies an additional control, not retroactive preregistration. The protocol and code document all fixed choices and the exploratory chronology. Probability calibration is still event-probability calibration in the stored reliability bins; the separate frozen-model diagnostics distinguish confidence in the predicted class.

## Integrity checks

The full scientific suite passed **17 tests out of17** after this run. New checks validate prospective budget/seeds, checkpoint hashes, source/config/input/output hashes, all-checkpoints-frozen-before-tests timestamps, paired-count marginals, Wilson intervals, seed/condition counts, Brier ranges, calibration-bin counts, and exact0.005 identity. Original and later artifacts remain separate. The12 small checkpoint arrays are offline research provenance only and must not be included in browser assets.

Reproduce with the pinned environment from repository root:

```sh
/workspace/syndrome-venv/bin/python research/experiments/scripts/training_control.py
/workspace/syndrome-venv/bin/python -m unittest discover -s research/experiments/tests -v
```

The source checks that the protocol/config/execution script match committed Git contents before work. An intentional rerun writes a new timestamped manifest/checkpoints and refreshes only this follow-up's canonical aggregate. It does not retrain or overwrite the original study, confirmation, or frozen-model diagnostics.
