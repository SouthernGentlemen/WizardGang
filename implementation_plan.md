# Implementation plan

## Open tasks

### WG-121 — [CONTENT] Unlink professional-record organizations whose sites are gone

- Why: Two deployment links on Solutions are dead. `www.amware.net` has no DNS address record, and `www.buyseasons.com` does not answer on ports 80 or 443; its last archived page is from February 2023 (checked 2026-10-03).
- Scope:
  - Let a deployment's `url` be absent in `src/data/professional-systems.ts`, and have Solutions render an unlinked organization name with no outbound arrow when it is.
  - Clear the Amware and BuySeasons URLs, unless the owner supplies a current successor URL before the task starts. The deployments themselves, what was delivered and the employer stay in the record.
  - Update the professional-record tests and any current-state document that says every deployment links out.
- Non-goals: No other record, copy or layout change, and no release. The fix reaches production with the next release task.
- Acceptance: The built Solutions page has no link to `amware.net` or `buyseasons.com`, both organizations still appear with their solution and employer, and every remaining deployment keeps its link.
- Validation: Pinned `npm ci`, focused generated-site and professional-record tests, canonical check, `git diff --check` and exact-head CI.
