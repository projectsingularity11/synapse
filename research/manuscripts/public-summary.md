# Errors leave traces

A quantum memory does not hand a decoder a list of mistakes. It leaves partial clues: changes in repeated checks. A classical algorithm must interpret those clues well enough to predict whether encoded information has flipped.

SYNDROME asks what happens when those clues become noisier than a small neural decoder was trained to expect. We simulated a distance-3 rotated surface-code Z memory for three rounds. A compact 1,345-parameter model learned from 40,000 examples at measurement-flip probability 0.005. We evaluated four discrete noise settings, each on 20,000 new shots, and compared two minimum-weight matching baselines.

The preselected seed-101 neural model made 78 mistakes at the training noise setting (0.390%) and 732 at measurement noise 0.03 (3.660%). Its Brier score, which measures probability-prediction quality, rose from 0.003374 to 0.031022. Matched-prior matching made 38 and 340 mistakes at those settings. Thus this compact model did not beat matching in this bounded study.

| Measurement flip probability | Neural failures / 20,000 (seed 101) | Neural error, 95% Wilson CI | Fixed MWPM failures | Matched MWPM failures | Brier |
|---|---:|---|---:|---:|---:|
| 0.001 | 31 | 0.155% [0.109, 0.220] | 13 | 10 | 0.001264 |
| 0.005 | 78 | 0.390% [0.313, 0.486] | 38 | 38 | 0.003374 |
| 0.015 | 261 | 1.305% [1.157, 1.472] | 102 | 101 | 0.010843 |
| 0.030 | 732 | 3.660% [3.409, 3.929] | 352 | 340 | 0.031022 |

These are errors per complete three-round experiment, not per round. The other two model initializations gave 781 and 757 failures at the highest measurement noise, reinforcing that the exact neural outcome also depends on training. All models share the same training examples and evaluation shots, so those seeds are not independent experiments.

Probability quality worsened under the strongest shift, but Brier score alone does not isolate calibration. The reliability diagrams expose bin counts: many middle-probability bins contain few samples. Claims about confidence require reading those counts and the limitations alongside the curve.

Matched-prior matching knows the test noise model. The neural model and fixed-prior matching keep their training assumptions. This information difference is deliberate and visible, not hidden in an aggregate score.

The result is an original small classical simulation, not an AlphaQubit reproduction, a quantum neural network, hardware evidence, or quantum advantage. A beautiful replay is still a replay. The simulator's target label is evaluation information, not information available to the decoder.

Run: `d3-memory-z-20261115T004549Z`. The full methods, uncertainty, sources and reproducibility files are in this vault. Primary neural-decoder paper reading remains blocked by network access, so the literature-foundation milestone is not complete.

### Fresh-shot check

A separate confirmation kept the seed101 model frozen and evaluated 100,000 new shots at each of the same four settings. It made 390 mistakes at measurement noise 0.005 and 3,796 at 0.03. These fresh streams improve precision for this fitted model; they do not repeat its training or broaden the hardware claim. Original and confirmation samples remain separate. See the technical-report addendum and S08 for exact counts and intervals.
