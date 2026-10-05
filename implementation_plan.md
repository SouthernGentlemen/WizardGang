# Implementation plan

## Open tasks

### WG-125 — [RELEASE] Release the wizardgang Worker cut-over as v1.3.0

- Dependency: WG-124 merged.
- Why: The first deploy through `deploy-worker.yml` creates the `wizardgang` Worker and moves both custom domains from `wizardgang-portfolio`.
- Scope: Cut annotated `v1.3.0` through the release process. CI's `deploy-production` job then calls `deploy-worker.yml` at the baseline commit pinned in `platform/vendor.lock.json`. Before the release, check how the locked wrangler (4.147.0) treats `wizardgang.ai`, which is still a custom domain on `wizardgang-portfolio`, and `www.wizardgang.ai`, which today is answered only by the zone redirect rule and may have a DNS record that blocks a custom domain. Also check that the production deploy token may bind the Secrets Store secrets. If wrangler refuses non-interactively, the owner detaches the domain or removes the conflicting record immediately before the deploy.
- Acceptance: The new version serves 100% of traffic. `https://wizardgang.ai/version.json` reports `wizardgang`, `1.3.0` and the tag commit, and `www.wizardgang.ai` answers with the shell's 308 to the apex. `npm run verify:cloudflare` in baseline lists no missing `Worker wizardgang` and no custom-domain drift for either host.
- Owner follow-up, from baseline's runbooks: retire `wizardgang-portfolio` (R3), retire the `www` zone rule (R4), and delete the `production` secret `CLOUDFLARE_ACCOUNT_ID`, which is now a variable.
- Validation: Release identity tests, exact-head CI and the deploy run's traffic and `/version.json` evidence.
