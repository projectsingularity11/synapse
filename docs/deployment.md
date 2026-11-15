# Vercel deployment status

Not deployed. No deployment URL exists. Build success is local evidence only.

This Next.js App Router project uses Vercel's standard Next.js deployment path. Set the project root to this repository, Node 24.x, install `npm ci`, build `npm run build`. Precomputed JSON/CSV and original figure exports live in public/; no Python simulation, credentials, database or inference API is needed in production. The build validates source/config hashes, artifact identities and counts before compiling static routes.

## Required before a state-changing deployment

The project owner must identify the exact Vercel account/team and project, confirm that a preview may be created there, and supply supported authenticated access. Current environment exposes no Vercel connector or CLI, no .vercel project binding, and no VERCEL-named environment-variable binding. Existing GitHub access is not Vercel authorization. Do not reveal credential values, deploy to an inferred account, replace production, change DNS or incur paid charges.

After the target is known and authorized, authenticate through Vercel's supported secure flow and link that exact project. Create a preview first, record only the actual URL returned by Vercel, then run the browser and route/data checks against it. Verify asset downloads, keyboard replay, reduced effects, optional WebGL fallback, console errors and mobile layout. Sound is intentionally unavailable pending verified licensing. Production requires separate authorization for the verified project. No production or preview command has been executed.

## Known external research access limitation

The primary neural-decoder papers and unseen.co reference were denied by the network proxy. See reference-audit.md and research/sources/reading-notes/access-log.md. To finish the literature milestone, permitted primary-paper access or owner-supplied papers are needed. Do not assume saving environment configuration would automatically grant runtime access. The published cloud environment was not changed or republished during website implementation.
