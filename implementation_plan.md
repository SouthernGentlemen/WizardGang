# Implementation plan

## Open tasks

**Owner direction — remove SharkTank from wizardgang.ai**

SharkTank is becoming a lean game with no evidence pages, operations stack or ISO narrative (SharkTank ST-138). The owner directed that wizardgang.ai contain no SharkTank project content or routing.

The source removal must reach production before SharkTank `v2.1.0` deletes `/evidence/`. `sharktank.wizardgang.ai` stays owned by `Wizard-Gang/SharkTank`; wizardgang.ai no longer describes or routes to it.

### WG-118 — [RELEASE] Release the SharkTank removal as v1.2.2

- Dependency: WG-116, WG-117 and the WG-120 cleanup delivered with green post-merge CI.
- Why: The removal reaches production only through an immutable release, and it must be live before SharkTank `v2.1.0` deletes `/evidence/`. Nothing is added, so the release is a patch.
- Scope:
  - Bump `package.json` and both `package-lock.json` version fields from 1.2.1 to 1.2.2, and remove this task from the queue.
  - After the squash merge, canonical main CI creates the annotated v1.2.2 tag on the exact merged commit and publishes the GitHub Release.
  - It then deploys that exact state through the protected `production` environment and verifies the served Worker Version ID and public `version.json`.
- Non-goals: No application, dependency, workflow, settings, DNS or secret change; no manual tag, Release or Wrangler publish; no bypass of the protected environment's required review.
- Acceptance:
  - One WG-118 squash commit on main, with annotated v1.2.2 pointing at it.
  - GitHub Release v1.2.2 is published, not draft or prerelease.
  - deploy-production succeeds after the environment's required review.
  - `https://wizardgang.ai/version.json` reports release v1.2.2 and the exact commit.
- Validation: Pinned `npm ci`, the dependency advisory gate, `npm run deploy:production:dry-run`, focused release tests, canonical check, exact-head CI, post-merge release and deployment jobs, and a public identity readback.

### WG-121 — [CONTENT] Unlink professional-record organizations whose sites are gone

- Why: Two deployment links on Solutions are dead. `www.amware.net` has no DNS address record, and `www.buyseasons.com` does not answer on ports 80 or 443; its last archived page is from February 2023 (checked 2026-10-03).
- Scope:
  - Let a deployment's `url` be absent in `src/data/professional-systems.ts`, and have Solutions render an unlinked organization name with no outbound arrow when it is.
  - Clear the Amware and BuySeasons URLs, unless the owner supplies a current successor URL before the task starts. The deployments themselves, what was delivered and the employer stay in the record.
  - Update the professional-record tests and any current-state document that says every deployment links out.
- Non-goals: No other record, copy or layout change, and no release. The fix reaches production with the next release task.
- Acceptance: The built Solutions page has no link to `amware.net` or `buyseasons.com`, both organizations still appear with their solution and employer, and every remaining deployment keeps its link.
- Validation: Pinned `npm ci`, focused generated-site and professional-record tests, canonical check, `git diff --check` and exact-head CI.
