# SYNDROME research vault

Question: when measurement noise differs from the training distribution, how do logical prediction error and probabilistic reliability change for a compact decoder of a simulated surface-code memory?

This vault separates sources, project methods and original outputs. It is readable without the website. Begin with [question](question.md), [protocol](protocol.md), [literature review](literature-review.md) and [technical report](manuscripts/technical-report.md). The [claim ledger](claims/claims.csv) records the exact public claims; its JSON mirror is for rendering. [Sources](sources/sources.json) distinguish verified software documentation from inaccessible papers.

The executed study is a small classical simulation, not a hardware experiment. Aggregate results and a deterministic first-eight-shots replay subset are retained. Full training datasets are regenerated rather than checked in. See [results](results/README.md) and experiment manifests for exact counts, seeds and software.

**Research-foundation status:** software methods and project outputs verified; primary neural-decoder paper reading remains blocked by network access. The literature milestone is incomplete. Original experiment completion does not erase that limitation.

Reproduction: follow the experiment README/protocol, create a Python virtual environment, install the pinned research requirements, run unittest discovery and the experiment script. The root README gives exact current commands for website and research.
