# Question and estimand

**When measurement noise differs from the training distribution, how do logical prediction error and confidence calibration change for a compact neural decoder of a small simulated surface-code quantum memory?**

The unit is one complete three-round distance-3 memory experiment. The supervised task is to infer whether logical observable 0 flips relative to the noiseless circuit reference. Its target is not every physical error and not an arbitrary unknown quantum state.

We vary the probability of a pre-measurement flip in Stim's circuit-level Pauli model, holding the remaining configured noise probabilities fixed. The four evaluated probabilities are protocol choices: 0.001, 0.005, 0.015 and 0.03. Training and validation use 0.005. This is a controlled form of covariate/distribution shift, not a complete model of laboratory drift.

Primary error metric: fraction of complete experiments for which the thresholded observable prediction differs from the simulated target. Probabilistic metrics: Brier score and equal-width reliability bins with their sample counts. Wilson intervals quantify finite test-sampling uncertainty conditional on each trained model. Multiple model initializations describe some training variability, not independent replications of the entire dataset-generation process.

Hypothesis, not an assumed conclusion: increasing measurement noise beyond training may increase errors and alter reliability. Baselines are fixed-prior and matched-prior MWPM; matched prior is given the test noise distribution and must be described as such. This project does not seek a quantum-advantage or real-time-hardware claim.

## What this design identifies

The sweep describes performance of a fixed fitted model as the simulator's measurement-noise parameter changes. A higher-noise setting is intrinsically a different inference problem; its larger error is not automatically an isolated penalty for training-distribution mismatch. The original fixed-model study did not train a matched-noise neural control at every setting. A separate exploratory follow-up now compares equal-budget new fits within each evaluation setting; its scope and results are in the technical-report addendum. Thus neither the sweep nor the larger frozen-model confirmation can separate inherent noise difficulty from an additional neural mismatch cost. Matched-prior MWPM is informative but is a different decoder family, so it does not supply that missing counterfactual.
