# Implementation plan

## Open tasks

### WG-113 — [SEC] Remediate the high-severity undici advisory

**Goal**

Restore a clean live dependency advisory result before the shared policy update.

**Scope**

- Update the pinned Wrangler toolchain and lockfile to a version that resolves the high-severity `undici` finding.
- Keep the site's runtime, release, and deployment boundaries unchanged.
- Validate the resulting dependency graph, canonical repository checks, and Wrangler build and dry-run contracts.

**Acceptance**

- `npm run audit:dependencies` reports no high or critical advisories.
- Required exact-head and post-merge CI pass; the completed branch is deleted.

### WG-114 — [DOCS] Clarify connected GitHub delivery guidance

**Goal**

Align the shared agent contract with the wording accepted in wizardgang-architecture-demo as DEMO-390.

**Scope**

- Update `AGENTS.md` to distinguish ordinary connected GitHub PR delivery from settings administration.
- Update the portfolio-contract hash for `AGENTS.md` in `scripts/check-portfolio-contract.mjs`.
- Preserve the controlled PR, exact-head CI, squash-merge, and post-merge verification requirements.

**Acceptance**

- The agent contract and hash match the accepted shared wording.
- Pinned local validation and the separate dependency advisory gate pass.
- The task retires through one controlled PR with required exact-head and post-merge CI green; the branch is deleted after merge.
