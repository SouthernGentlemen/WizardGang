# Implementation plan

## Open tasks

### WG-111 — [RELEASE] Release the corrected record and cleanup as v1.2.1

- Dependency: WG-110 delivered; WG-106, WG-108 and WG-110 are on main with green post-merge CI.
- Why: The owner asked for a release once nothing is left to do. Production serves v1.2.0, and the WG-106 cleanup, the WG-108 deployment-record correction and the WG-110 Spanish fixes reach production only through an immutable release. None adds a feature, so the release is a patch.
- Scope: Bump `package.json` and both `package-lock.json` version fields from 1.2.0 to 1.2.1 and retire this task into the shared permanent empty queue. After the squash merge, canonical main CI creates the annotated v1.2.1 tag on the exact merged commit, reproduces and publishes the GitHub Release, deploys that exact state through the protected `production` environment, and verifies the served Worker Version ID and public `version.json`.
- Non-goals: No application, dependency, workflow, settings, DNS or secret change; no manual tag, Release or Wrangler publish; no bypass of the protected environment's required review.
- Acceptance: One WG-111 squash commit on main; annotated v1.2.1 points at it; GitHub Release v1.2.1 is published, not draft or prerelease; deploy-production succeeds after the environment's required review; `https://wizardgang.ai/version.json` reports release v1.2.1 and the exact commit.
- Validation: Pinned npm ci, the dependency advisory gate, `npm run deploy:production:dry-run`, focused release tests, canonical check, exact-head CI, post-merge release and deployment jobs, and a public identity readback.
- Authorities: AGENTS.md, README.md, package.json, package-lock.json, .github/workflows/ci.yml, scripts/release-tag.mjs, scripts/release-identity.mjs, scripts/production-deployment-identity.mjs.
