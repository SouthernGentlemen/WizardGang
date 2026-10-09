# Implementation plan

## Open tasks

### WG-131 — [SEC] Clear the high dependency advisories with wrangler 4.149.0 and source-map-js 1.2.2

- Why: `npm run audit:dependencies` fails on main with 4 high advisories. `sharp` <0.35.5 (GHSA-wq5f-xc86-pv6w, its librsvg dependency) reaches the tree through `wrangler` 4.147.0 → `miniflare`. `source-map-js` 1.2.1 (GHSA-68fv-2mgg-jv7q, event-loop denial of service) reaches it through `@tailwindcss/node` and `postcss`. Both are build and deploy tooling; neither ships in the Worker or the assets.
- Scope: Pin `wrangler` to 4.149.0, which brings `miniflare` 5.20261006.1-alpha, `sharp` 0.35.5, `workerd` 1.20261006.1 and `esbuild` 0.28.2. Raise the transitive `source-map-js` to 1.2.2 in the lockfile. Update `allowScripts` to `esbuild@0.28.2` and `workerd@1.20261006.1`, and `tests/toolchain-contract.test.mjs` with them. No version change.
- Acceptance: `npm run audit:dependencies` reports 0 vulnerabilities. `npm run check` and `npm run deploy:dry-run` pass with the new wrangler, and the `--experimental-provision=false --experimental-auto-create=false` flags baseline's deploy uses are still accepted.
- Validation: Pinned `npm ci`, focused toolchain test, canonical `npm run check`, `npm run audit:dependencies`, `npm run deploy:dry-run`, `git diff --check`, exact-head CI and post-merge CI.

### WG-132 — [RELEASE] Release the caller-proof deploy path and the advisory fix as v1.3.1

- Dependency: WG-131 merged with green post-merge CI.
- Why: v1.3.1 carries WG-129 (baseline BASE-039's caller reproduction proof) and WG-131 (advisory fix). Neither changes the site, so this is a patch release. It is also the first deploy through BASE-039's proof, with the CI `verify` job as the one reproduction job.
- Scope: Bump `package.json` and both `package-lock.json` version fields from 1.3.0 to 1.3.1. Nothing else.
- Release: After the squash merge, main CI creates the annotated `v1.3.1` tag on the merged commit, publishes the Release, and calls `deploy-worker.yml` at `1493de4ae8b1f43f23559b210d047a288b00fcf1`. Its `verify` job proves this run's reproduction from the Actions API, then the owner approves the `production` review.
- Acceptance: The deploy run succeeds with a `result` whose checks all pass. `https://wizardgang.ai/version.json` reports `wizardgang`, `1.3.1` and the merged commit. If the proof fails, it fails in `deploy-worker.yml`'s `verify` job before any credential is reachable, and production stays on v1.3.0.
- Validation: Pinned `npm ci`, canonical `npm run check`, `npm run audit:dependencies`, `npm run deploy:dry-run`, `git diff --check`, exact-head CI, then the release run and the `/version.json` evidence.
