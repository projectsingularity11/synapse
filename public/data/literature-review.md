# Literature and method review

## Evidence boundary

The two requested neural-decoder papers are recorded as S01 and S02. Their titles and identifiers come from the brief. Direct publisher retrieval failed with network-proxy CONNECT 403. Legitimate alternatives were attempted through arXiv, Crossref, PubMed, PMC, EuropePMC and the Google DeepMind AlphaQubit post; they were also denied. We therefore have not independently read those papers here, cannot claim a complete literature review, and make no paper-specific numerical or architecture claims. Author lists and dates remain null/explicitly unverified rather than guessed.

S01 is the supplied AlphaQubit reference. S02 is a separate supplied near-term surface-code neural-decoder reference. Neither is an implementation specification for this small study, and neither is presented as reproduced. A future literature pass must read the full texts, identify the memory basis, code distances, noise models, training/test regimes, baseline assumptions and uncertainty before making direct comparisons. A title or publisher abstract alone would not support a detailed performance comparison.

## What is verified: the simulation substrate

S03 is Stim's official repository documentation, retrieved at a recorded commit. Stim supports stabilizer-circuit simulation and Pauli-noise channels in `stim.Circuit`; arbitrary non-Clifford gates and general channels such as amplitude decay are outside that object's stated scope. That distinction determines what the present study can mean. Fast samples under a chosen circuit model do not establish that the model captures every hardware failure mechanism.

Stim separates circuit measurements, detector declarations and logical observables. A detector encodes a parity expected to be deterministic in the noiseless reference. A detection event marks a departure from that expected parity. It is therefore inaccurate to depict each event as a directly observed physical fault. Propagation and repeated checks can cause a single fault to generate several events, while different physical fault combinations can be logically equivalent.

The circuit format and detector-error-model format are primary technical references for those declarations. Detector coordinates are annotations, not a guarantee that raw detector indices form a guessed rectangular time-by-lattice tensor. SYNDROME retains Stim detector indices and exports the actual coordinates; initial/final boundary detectors are treated according to circuit declarations. This protects the replay from a visually plausible but scientifically false ordering.

## What is verified: the matching baseline

S04 is PyMatching's official README and license, also retrieved at a recorded commit. Its standard MWPM formulation uses independent graphlike mechanisms: errors producing one or two detection events, with boundary support. The documented Stim integration constructs a detector error model with decomposition, builds a matching object and compares batch observable predictions to sampled observables.

There are two different issues often collapsed into the word 'exact.' Sparse blossom solves its matching problem, but an original circuit model may contain correlated mechanisms or hyperedges that require decomposition. Exactness of the graph optimizer is not a claim that every circuit correlation is faithfully modeled. PyMatching now documents optional correlated matching; the present study uses ordinary matching and records that approximation. We do not borrow the README's speed benchmarks as results for this machine.

Fixed-prior and matched-prior baselines answer different questions. A fixed graph asks how the trained noise assumptions survive drift. A graph rebuilt for each test setting asks what a decoder can do when given the changed noise distribution. Matched prior is an informative reference with additional information; it is not a blindly deployed decoder with the same knowledge as the neural model.

## Why this compact neural experiment

A flat detector vector allows a small fully connected classifier without asserting a spatial symmetry or temporal ordering not established by the data. The implemented 24→32→16→1 network has 1,345 parameters. Hidden ReLU activations and a logistic output make a single binary-observable probability. The network receives no fault locations and no target bit as input. This is classical machine learning assisting a quantum-error-correction task, not quantum ML executed on quantum hardware.

Forty thousand generated training shots and eight thousand validation shots are modest enough to bound CPU cost. Three initializations share the training set; this distinguishes optimization variability from the larger uncertainty that would require new training datasets. Checkpoints use validation log loss, while the 0.5 decision threshold is fixed before testing. These are project protocol choices, not prescriptions drawn from inaccessible neural-decoder papers.

## Reliability is more than accuracy

Error rate answers whether the thresholded bit is right. Brier score averages squared probability error and responds to both discrimination and calibration. The reliability diagram compares predicted probability with observed target frequency in ten equal-width probability bins, retaining counts so a bin with three observations cannot masquerade as a stable calibration estimate.

A larger Brier score under shift is evidence of worse probabilistic prediction, but does not by itself isolate miscalibration. Changing label frequency and discrimination can contribute. Reliability bins are descriptive; sparse bins and rare logical flips limit what can be inferred. This is why the site shows counts and avoids an unsupported claim that a single calibration statistic explains all degradation.

## What the project contributes and does not contribute

The contribution is a reproducible, original small simulation, an honest fixed/matched-prior comparison, probability diagnostics and a linked public explanation. It is not a claim of a new decoding algorithm, a replication of AlphaQubit, a threshold study, or evidence that neural decoding generally loses to matching. Conclusions must remain conditional on this distance, basis, duration, noise family, architecture and budget.

Primary neural-decoder paper verification is still required before the research-foundation milestone can be marked complete. See `sources/reading-notes/access-log.md` for the access record and `limitations.md` for how that affects public wording.
