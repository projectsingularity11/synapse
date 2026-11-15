# SYNDROME

An independent study of learned quantum error decoding under measurement-noise mismatch. A Next.js editorial website, real offline Stim/PyMatching/compact-MLP experiment, and a human-readable research vault.

## Run the website

Node 24.x (tested 24.22.1), npm 11.9.0. Existing cloud tasks are isolated: use this checkout; no extra worktree is required.

```sh
npm ci
npm run build
npm start
```

For editing: `npm run dev`. On this cloud machine the default npm cache home is not writable; use `npm ci --cache /workspace/.npm-cache`. `experimental.reactDebugChannel: false` keeps React's development debug stream in the normal payload because this environment's WebSocket handshake is blocked. Development controls work with that setting; hot reload may require a manual refresh. Production does not use that channel.

The app needs no secrets, database, account or paid inference service. Open the local server in your own supported browser workflow. No public deployment is claimed.

## Checks

```sh
npm run lint
npm run typecheck
npm run validate:data
npm run test:data
npm run build
# Start production server, then in another shell:
TEST_BASE_URL=http://127.0.0.1:3000 npm test
```

Browser tests use system Chromium at `/usr/bin/chromium`; adjust playwright.config.ts's executablePath for another machine. They include synthetic unsupported-WebGL/context-loss checks. SwiftShader is enabled only in the test launch flags; it is not a hardware-performance claim. See docs/qa-report.md for measured conditions and actual outcomes.

## Reproduce research

See [research/README.md](research/README.md), [protocol](research/protocol.md), and [results](research/results/README.md). Install the pinned Python requirements in a virtual environment, then run the scripts described there. Training and sampling are offline; only validated small aggregates, traces and figure exports are shipped to visitors. Running the pipeline generates a new run ID; it does not silently claim to reproduce timing bit-for-bit. Retained manifests and hashes identify the delivered run.

## Structure

- `app/`, `components/`: static editorial routes and interactive client islands.
- `research/`: canonical protocol, sources, claim ledger, experiments and actual results.
- `public/data/`, `public/figures/`: generated publication copies; refresh through the build script.
- `docs/`: design, accessibility, architecture, performance, QA, deployment and handoff.

Original work has not been assigned a blanket open-source license by the project owner. Third-party package licenses remain their own; see docs/dependency-audit.md and docs/asset-register.csv. No reference-site assets, paper figures, downloaded fonts or unverified music are reused.
