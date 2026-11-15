# S03 — Stim

Retrieved official README, Apache-2.0 license, circuit format and DEM format docs. Important verified points: stabilizer-circuit/Pauli-noise scope, detector error model generation, graphlike decomposition and documented simulation limitations. README cites Craig Gidney, *Stim: a fast stabilizer circuit simulator*, Quantum 5, 497 (2021), DOI 10.22331/q-2021-07-06-497. The external paper itself was not read here.

Implementation consequence: use Stim's detector sampler with separate observables; preserve actual detector coordinates and indices. A display lattice is data binding to exported coordinates, not guessed tensor structure. Software documentation may change; the evidence JSON records exact retrieved commit and hash.
