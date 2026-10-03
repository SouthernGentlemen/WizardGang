# Implementation plan

## Owner direction — remove SharkTank from wizardgang.ai

SharkTank is becoming a lean game with no evidence pages, operations stack or ISO narrative (SharkTank ST-138). On 2026-10-02 the owner directed that the SharkTank material on wizardgang.ai be deleted:

- the Worker proxy and legacy redirects into `sharktank.wizardgang.ai`;
- the case study and its `/evidence/` and ISO-aligned claims;
- the animated preview that still shows removed rockets and food dots.

This must reach production before SharkTank `v2.1.0` deletes `/evidence/`. `sharktank.wizardgang.ai` stays owned by `Wizard-Gang/SharkTank`; this site simply stops describing or routing to it.

## Open tasks

### WG-116 — [REFACTOR] Remove the SharkTank proxy and legacy redirects from the Worker

**Goal**

The Worker still forwards about fifteen machine paths and redirects about twenty-six legacy paths into `sharktank.wizardgang.ai`, most of which already return 404 there.

**Scope**

- Delete from `src/worker/index.ts`: `SHARK_ORIGIN`, the machine-path proxy (`MACHINE_PATHS`, `isMachineRoute`, `proxyToSharkTank`), the protected-legacy redirects, the human compatibility redirects (including `/play`) and the `/policies/*` redirect.
- The Worker keeps only the outward shortcuts (`/github`, `/compliance`, `/accessibility`, `/security`) and asset serving. Removed paths return the site's ordinary 404.
- Update `tests/worker-routing.test.mjs`, the README and `docs/INFORMATION-ARCHITECTURE.md`, which still describe the SharkTank compatibility and proxy boundary.

**Acceptance**

- No Worker code, test or document references the SharkTank proxy, compatibility routes or `sharktank.wizardgang.ai` routing.
- Pinned `npm ci`, canonical check and exact-head CI pass.

### WG-117 — [CONTENT] Remove SharkTank from the site

**Goal**

The SharkTank case study describes ISO-aligned operations and links an evidence page that SharkTank is deleting. Its animated preview shows a game that no longer exists.

**Scope**

- Remove `sharktank` from the project registry and data. This removes the case study page, the home and projects-index cards, the Projects navigation item and the sitemap entry.
- Delete `SharkTankPreview` and its `tank-*` styles, `public/sharktank-project.jpg` with its `_headers` rule, the SharkTank translation strings and the SharkTank comment in `SiteChrome.tsx`.
- Update the tests that enumerate projects, routes, previews and translations: `helpers.mjs`, `generated-site`, `navigation-authority`, `accessibility-contract`, `documentation-current-state`, `frontend-authority`, `react-shell` and `browser-behavior`.
- Update `docs/OWNERSHIP.md`, `docs/INFORMATION-ARCHITECTURE.md`, `docs/COMPLIANCE.md`, `LICENSE.md` and `SECURITY.md` so none of them presents SharkTank as a site project.

**Acceptance**

- The built site has no SharkTank page, card, preview, image or link, and `/projects/sharktank/` returns the ordinary 404.
- Pinned `npm ci`, canonical check and exact-head CI pass.

### WG-118 — [RELEASE] Release the SharkTank removal as v1.2.2

- Dependency: WG-116 and WG-117 delivered with green post-merge CI.
- Why: The removal reaches production only through an immutable release, and it must be live before SharkTank `v2.1.0` deletes `/evidence/`. Nothing is added, so the release is a patch.
- Scope:
  - Bump `package.json` and both `package-lock.json` version fields from 1.2.1 to 1.2.2, and retire this task into the shared permanent empty queue.
  - After the squash merge, canonical main CI creates the annotated v1.2.2 tag on the exact merged commit and publishes the GitHub Release.
  - It then deploys that exact state through the protected `production` environment and verifies the served Worker Version ID and public `version.json`.
- Non-goals: No application, dependency, workflow, settings, DNS or secret change; no manual tag, Release or Wrangler publish; no bypass of the protected environment's required review.
- Acceptance:
  - One WG-118 squash commit on main, with annotated v1.2.2 pointing at it.
  - GitHub Release v1.2.2 is published, not draft or prerelease.
  - deploy-production succeeds after the environment's required review.
  - `https://wizardgang.ai/version.json` reports release v1.2.2 and the exact commit.
- Validation: Pinned `npm ci`, the dependency advisory gate, `npm run deploy:production:dry-run`, focused release tests, canonical check, exact-head CI, post-merge release and deployment jobs, and a public identity readback.
