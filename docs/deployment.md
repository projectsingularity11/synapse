# Vercel deployment status

The owner confirmed the current production URL as https://synapse-pied-xi.vercel.app/. The Vercel connector verified the existing project `synapse` (`prj_TfuZ1u929MKgKPRANTlFRfsRFQRY`) under account `team_zQJh0y9soqRrLxA9F2AChFKO`.

The previous cinematic preview is READY at https://synapse-ij4p69q45-project-singularity.vercel.app/. The ember redesign supersedes it; its final status is recorded below.

- Deployment: `dpl_3z16CP9yy9rnfDKGrNVnB545EUd5`
- Target: preview (`target: null`); no production aliases assigned.
- Source snapshot SHA256: `64c269fe0e9dab61f884355185269cc3bab6be7fa1d3aa934abb545df04319d2`.
- Authenticated remote verification: homepage, `/study/paper`, `/about`, `/data/study.json`, and `/art/synapse-knot.webp` all returned HTTP 200. Expected page/data content was verified.
- Production aliases, DNS, environment variables, and project protection settings were not changed.

The earlier preview `dpl_GdHRLPVqsV2aPKQSAn3DiSF2Bryf` also reached READY. The final preview adds the compositor-only fallback optimization and supersedes it. The final local QA report and deployment record were saved after the source snapshot; application source matches the final preview.

Deployments use source files through the authenticated Vercel connector, Next.js, Node 24.x, `npm ci`, and `npm run build`. The build exports and validates retained research artifacts before generating static routes. No secrets, database, training jobs, or inference service are required.

The preview is intended for owner review. Production replacement requires authorization for the verified project. Do not interpret the historical deployment notes elsewhere as a statement that no Vercel project exists now.

## Ember redesign preview

- URL: https://synapse-838egdaf9-project-singularity.vercel.app/
- Deployment: `dpl_8nZPPUmTGetpNoSkv6mGyaNbtkjH`
- Source snapshot SHA256: `a80a1d742ee4ce6971f15caccb239f96259eb56f5c01c35b5cb60f44f8afa144`
- Source payload: 254 files; the music file was uploaded separately and referenced by verified SHA1/size.
- Node 24.x, Next.js, `npm ci`, `npm run build`; target preview, no assigned production alias.
- The source snapshot precedes this final deployment record and final QA screenshots. Application source matches the deployed snapshot.

Status: **READY**. Authenticated remote fetches of `/`, `/study/paper`, `/about`, `/audio/provenance.json`, `/audio/ATTRIBUTION.txt`, and `/art/quantum-provenance.json` all returned HTTP 200 with expected content. Production remains at https://synapse-pied-xi.vercel.app/.
