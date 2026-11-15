# Follow-up publication figures

These are additional original figures from saved validated follow-up artifacts. They preserve every original figure and its manifest byte-for-byte. Generate with`python research/experiments/scripts/plot_followup.py` from repository root in the pinned research environment. No experiments, training, probability fitting or new independent evidence are generated. The new manifest hashes the source, input artifacts, all six exports, and preserved original files. Matplotlib's bundled DejaVu Sans is reused; no new third-party visual asset is introduced.

## Training-noise control

`training-noise-control.svg`, `.png`, `.pdf`: two panels show logical prediction error and Brier score for fixed-noise versus matched-noise neural training. Filled points/lines are the preselected seed101; smaller hollow points show seeds202 and303 as separate fitted-model observations, **not confidence intervals**. Only seed101 binary error has pointwise95% Wilson bars; no Brier or pooled-seed uncertainty is invented. All models use the same100,000 fresh test shots per condition. The training0.005 comparison uses identical model objects by construction. Lines connect the four discrete settings as visual guides, not measured intermediate points.

Fixed-training neural predictions use neutral`#55615b`, diamond markers and dashed lines; matched-training predictions use neural green`#326449`, circles and solid lines, with explicit legend labels. These are two learned training procedures, not matching decoder series. The figure reports one training-data realization per setting and three initialization/shuffling seeds; it does not isolate a universal causal mismatch penalty or show hardware performance.

## Confidence and retained coverage

`confidence-coverage.svg`, `.png`, `.pdf`: the fresh-confirmation dataset at measurement noise0.03, frozen original seed101 model,100,000 shots. Left: observed conditional errors (coral failure color`#bd493b`) and model-implied mean error (neural green) versus retained coverage for fixed **post-hoc descriptive** confidence cutoffs0.5,0.6,0.7,0.8,0.9,0.95,0.99. Threshold subsets overlap. The coverage axis is explicitly zoomed and never changes counts. Right: disjoint confidence bins versus observed accuracy, with exact counts printed and Wilson accuracy intervals. Confidence means`max(P(flip),1−P(flip))`, not the probability of a physical fault or direct quantum-state information. It differs from the original event-probability reliability plot.

Intervals are conditional pointwise95% Wilson intervals, not simultaneous bands or evidence of a chosen safe rejection threshold. No operating recommendation, significance test or recalibration claim is made. The diagnostics reuse existing confirmation shots and do not add new evidence. Both source/analysis run IDs are printed in the caption.

Use SVG or PDF for publication, PNG for presentations. Read the protocol/manifests and diagnostics/training-control notes before quoting the figures; error is per complete experiment, never per round.
