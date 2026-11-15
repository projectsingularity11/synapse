# A small parity explanation, not an experiment

A toy repeated check can make the distinction between readout and detection event concrete. Take three hypothetical noiseless readouts 0,0,0. Consecutive XOR comparisons are 0,0. Change only the middle readout to get 0,1,0; the consecutive XORs become 1,1. Thus one mistaken readout can create two detection events in this simple comparison history.

This is literal XOR arithmetic in a conceptual example, not a sample from the retained surface-code experiment. The real circuit has explicitly declared initial/final detector parities, ancillas and propagated gate faults; not every detector is simply one consecutive pair, and not every fault produces exactly two events. The toy example does not identify a physical fault from actual observed data. It explains why event bits are clues rather than a unique map of errors.

Suggested accessible figure: two rows of three labeled readout boxes (000 and 010), with two intervening XOR labels (00 and 11). Label both rows 'conceptual example, not measured data.' Follow with a link to the real first-eight-shot replay, where detector bits are actually sampled and simulator truth is explicitly withheld until outcome reveal. No animation is needed.
