# Standalone figures

Run `python research/experiments/scripts/plot.py` from the repository root using the pinned research environment. It reads saved validated study/supplement artifacts; it does not train models or generate new data. All figures include the original run ID and scientific captions. `manifest.json` hashes the inputs, generator and exported outputs. The exports are original project figures, not copied paper figures; the typeface is Matplotlib's bundled DejaVu Sans.

- `logical-error-sweep.svg`, `.png`, `.pdf`: neural seed101, fixed-prior matching and matched-prior matching logical-observable errors over four discrete measurement-flip probabilities. 20,000 shared test shots each; Wilson 95% pointwise intervals. Connecting lines aid reading and do not indicate measurements at intermediate settings. The matched prior knows the test noise model. The sweep affects final data-qubit readout as well as ancilla measurements.
- `calibration.svg`, `.png`, `.pdf`: seed101 at the training noise 0.005 and shifted noise 0.03. Fixed-width probability bins, observed event fraction with pointwise Wilson intervals, ideal diagonal, and logarithmic bin counts. Empty bins omitted. The intervals are not simultaneous bands and do not incorporate training uncertainty.

Use SVG or PDF for publication and PNG for presentations. Values refer to this small simulated code only. They are not hardware timings, not per-round logical errors, and not a reproduction of a published neural decoder. See the protocol and manifests before quoting.
