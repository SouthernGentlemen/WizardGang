# Implementation plan

## Open tasks

### WG-132 — [RELEASE] Release the caller-proof deploy path and the advisory fix as v1.3.1

- Dependency: WG-131 merged with green post-merge CI (wrangler 4.149.0; `npm run audit:dependencies` reports 0 vulnerabilities).
- Why: v1.3.1 carries WG-129 (baseline BASE-039's caller reproduction proof) and WG-131 (advisory fix). Neither changes the site, so this is a patch release. It is also the first deploy through BASE-039's proof, with the CI `verify` job as the one reproduction job.
- Scope: Bump `package.json` and both `package-lock.json` version fields from 1.3.0 to 1.3.1. Nothing else.
- Release: After the squash merge, main CI creates the annotated `v1.3.1` tag on the merged commit, publishes the Release, and calls `deploy-worker.yml` at `1493de4ae8b1f43f23559b210d047a288b00fcf1`. Its `verify` job proves this run's reproduction from the Actions API, then the owner approves the `production` review.
- Acceptance: The deploy run succeeds with a `result` whose checks all pass. `https://wizardgang.ai/version.json` reports `wizardgang`, `1.3.1` and the merged commit. If the proof fails, it fails in `deploy-worker.yml`'s `verify` job before any credential is reachable, and production stays on v1.3.0.
- Validation: Pinned `npm ci`, canonical `npm run check`, `npm run audit:dependencies`, `npm run deploy:dry-run`, `git diff --check`, exact-head CI, then the release run and the `/version.json` evidence.
