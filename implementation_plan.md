# Implementation plan

## Open tasks

### WG-127 — [FIX] Pass secrets to the baseline deploy workflow and recover the v1.3.0 deploy

- Dependency: Wizard-Gang/baseline BASE-030 merged.
- Why: The v1.3.0 deploy (CI run 37250078253, 2026-10-05) failed its credential guard before wrangler ran. `vars.CLOUDFLARE_ACCOUNT_ID` arrived, but `secrets.CLOUDFLARE_API_TOKEN` was empty, because a called workflow sees only the secrets its caller passes. Production still serves v1.2.1 from `wizardgang-portfolio`. BASE-030 makes `secrets: inherit` the baseline call shape, and the owner added Secrets Store Edit to `wg-cloudflare-deploy` on 2026-10-05.
- Scope: Re-vendor `platform/` and `platform/vendor.lock.json` from the merged BASE-030 commit with `npm run vendor:lock`, and pin CI's `deploy-production` call to the same commit. Add `secrets: inherit` to that call and fix its comment. `tests/deployment-boundary.test.mjs` requires `secrets: inherit` on that one call and keeps forbidding it anywhere else, along with `steps`, `runs-on` and `environment`. README Deployment says the call inherits secrets. No version change: the published v1.3.0 is recovered, not re-released.
- Recovery, after the merge and green post-merge CI: dispatch CI on `main` with `release_tag` `v1.3.0` and `expected_commit` `5a374086a7335f86d60061541f17989dc41755a5`, then the owner approves the `production` review. Before the deploy, `www.wizardgang.ai` and `wizardgang.ai` still belong to the old setup; wrangler 4.147.0 runs non-interactively in CI, so it moves the apex custom domain from `wizardgang-portfolio` and replaces a conflicting `www` record without a prompt.
- Acceptance: The new version serves 100% of traffic. `https://wizardgang.ai/version.json` reports `wizardgang`, `1.3.0` and `5a374086a7335f86d60061541f17989dc41755a5`. `www.wizardgang.ai` answers 308 to the apex. baseline `npm run verify:cloudflare` lists no missing `Worker wizardgang` and no custom-domain drift for either host.
- Owner follow-up, from baseline's runbooks: retire `wizardgang-portfolio` (R3), retire the `www` zone rule (R4), and delete the `production` secret `CLOUDFLARE_ACCOUNT_ID`, which is now a variable.
- Validation: Pinned `npm ci`, `npm run check:platform`, focused deployment-boundary and release tests, canonical `npm run check`, `npm run audit:dependencies`, `git diff --check`, exact-head CI, post-merge CI, then the recovery run's traffic and `/version.json` evidence.
