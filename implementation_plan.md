# Implementation plan

## Open tasks

### WG-124 — [OPS] Adopt the shared wg-edge shell and the baseline deploy workflow

- Dependency: Wizard-Gang/baseline BASE-028 merged. The shared Cloudflare resources were provisioned on 2026-10-04 (Phase 3 of `docs/CLOUDFLARE-RUNBOOK.md`).
- Why: In Phase 4 of the Cloudflare consolidation, the site becomes the `wizardgang` Worker on baseline's shared shell, Worker config and deploy path. Baseline's `config/cloudflare.json` and `config/secrets.json` are the authority.
- Scope:
  - Vendor baseline `platform/` verbatim from a merged baseline commit. Commit the `platform/vendor.lock.json` that `npm run vendor:lock -- <commit>` prints in baseline.
  - Replace `wrangler.jsonc` with one conforming top-level Worker: name and `WG_APP` `wizardgang`; custom domains `wizardgang.ai` and `www.wizardgang.ai`; compatibility date 2026-08-31 with `nodejs_compat` only (dropping `assets_navigation_has_no_effect`); `workers_dev` and `preview_urls` false; observability on; `ASSETS`; and Secrets Store bindings for `WG_OPS_TOKEN` and `WG_SESSION_KEY`, using the store ID the owner recorded in runbook step 3.5. No `env` blocks, D1, R2 or KV. `node platform/conformance/cli.mjs wrangler --worker wizardgang` passes.
  - The Worker entry uses `createEdge`. The shell provides the host guard, the `www` → apex 308, `/version.json` from `WG_VERSION` and `WG_COMMIT`, security headers and errors. The app handler serves assets and keeps the eight permanent page redirects.
  - The release path calls `Wizard-Gang/baseline/.github/workflows/deploy-worker.yml` pinned to a merged baseline commit with `worker: wizardgang`, never `secrets: inherit`. The in-repo `deploy-production` job is removed, and nothing reads `secrets.CLOUDFLARE_ACCOUNT_ID`.
  - Delete `scripts/discover-cloudflare-api-token-targets.sh` and `scripts/rotate-cloudflare-api-token.sh`, which baseline now owns, along with their documentation.
- Non-goals: No deploy, and no change to the live `wizardgang-portfolio` Worker.
- Acceptance: `npm run check` runs the vendored `pin` and `wrangler` conformance checks. Tests prove the `www` 308, the `/version.json` identity, the redirects and the pinned workflow call.
- Validation: Pinned `npm ci`, focused tests, canonical check, `npm run audit:dependencies`, `git diff --check` and exact-head CI.

### WG-125 — [RELEASE] Release the wizardgang Worker cut-over as v1.3.0

- Dependency: WG-124 merged.
- Why: The first deploy through `deploy-worker.yml` creates the `wizardgang` Worker and moves both custom domains from `wizardgang-portfolio`.
- Scope: Cut annotated `v1.3.0` through the release process and deploy it through `deploy-worker.yml`. Before deploying, check how the locked wrangler treats custom domains still attached to `wizardgang-portfolio`. If it refuses non-interactively, the owner detaches them from the old Worker immediately before the deploy.
- Acceptance: The new version serves 100% of traffic. `https://wizardgang.ai/version.json` reports `wizardgang`, `1.3.0` and the tag commit, and `www.wizardgang.ai` answers with the shell's 308 to the apex. `npm run verify:cloudflare` in baseline lists no missing `Worker wizardgang` and no custom-domain drift for either host.
- Owner follow-up, from baseline's runbooks: retire `wizardgang-portfolio` (R3), retire the `www` zone rule (R4), and delete the `production` secret `CLOUDFLARE_ACCOUNT_ID`, which is now a variable.
- Validation: Release identity tests, exact-head CI and the deploy run's traffic and `/version.json` evidence.
