# Frozen-model holdout confirmation protocol

This protocol, its exact JSON configuration, and its execution source are committed **before** generating the new holdout shots or observing their labels. It is a prospective confirmation of sampling precision for the **already selected seed101 model**, not a preregistered original study, independent training replication, or hardware validation. The original four noise settings and the observed original results are already known.

The research question and simulator are unchanged: distance3 rotated Z memory, three rounds; circuit-level Clifford, pre-round data and post-reset noise fixed at0.001; before-measurement flip probabilities0.001,0.005,0.015,0.03, including terminal data readout. The same fixed-prior training DEM and matched-prior evaluation DEM are used; matched matching has oracle evaluation noise knowledge. No correlated matching is enabled. See `research/protocol.md` for physical and detector semantics.

At each setting draw **100,000 new final-test shots** with Stim seeds53001–53004, respectively. These differ from every original train, validation, pilot, no-noise, final-test and model seed. Disjoint random streams support fresh-shot replication under the same simulator, not independence from the simulator assumptions or the fitted model. All decoders receive exactly the same new shots within each setting. No original and new shots are pooled into a single primary figure.

Freeze the JSON model checkpoint at SHA256`7584092387b2ac5cf8c39027288b0b91a088dd4099b61a32d87a5cbf359cdd6e`: same24→32→16→1 ReLU/logistic model,1,345 parameters, selected epoch35, seed101, and fixed threshold0.5. Reconstruct forward prediction using float32 arrays and the original activation functions. Validate reproduction against previously saved representative probabilities before drawing new shots. There is **no training, checkpoint reselection, threshold tuning, calibration fitting or architecture change** in this confirmation. Any failure to verify the checkpoint or original outputs aborts execution rather than changing the model to fit the holdout.

For all decoders report exact failures/shots, per-complete-experiment logical error, and two-sided95% Wilson binomial intervals. Neural probability quality is reported as Brier score and the original ten fixed bins[0,0.1),…,[0.9,1]. For each occupied bin report mean prediction, observed flip frequency, count and pointwise95% Wilson interval for that frequency; empty bins remain null. These intervals are conditional on the frozen model and simulator and are not simultaneous bands. The existing class imbalance remains relevant. The outcome may agree or disagree with the earlier pattern; no conclusion is specified in advance.

Execution is CPU-only with one numerical-library thread and a60-second wall-time bound. A timeout is recorded as a failed/incomplete run rather than silently reducing shot counts. No GPU, paid service, browser inference, new replay gallery or training data is needed. Save only aggregate results and a detailed manifest; do not retain the400,000-shot dataset. Original study, supplement, representative traces and figure exports remain untouched. `research/results/aggregates/confirmation.json` is a separate confirmation artifact linking the parent run.

The manifest records the protocol/source commit, script/config/protocol/checkpoint hashes, parent artifacts, versions, UTC execution date, hardware, seeds, sample counts, model/baseline settings, completion status and outputs. A separate test checks seed non-overlap, checkpoint dimensions/hash, reproduction against old traces, and confirmation metric/manifest consistency. Reproduce from repository root with the pinned environment:

```sh
/workspace/syndrome-venv/bin/python research/experiments/scripts/confirmation.py
/workspace/syndrome-venv/bin/python -m unittest discover -s research/experiments/tests -v
```
