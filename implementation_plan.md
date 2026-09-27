# Implementation plan

## Open tasks

### WG-105 — [RELEASE] Release the mobile-first redesign as v1.2.0

- Dependency: WG-104 plan-only queue publication has merged; WG-103 is on main with green post-merge CI.
- Why: The owner asked for the WG-103 redesign to go live. Production serves release v1.1.0, and merged main reaches production only through an immutable release tag.
- Scope: Bump `package.json` and both `package-lock.json` version fields from 1.1.0 to 1.2.0 and retire this task from the queue. After the squash merge, canonical main CI creates the annotated v1.2.0 tag on the exact merged commit, reproduces and publishes the GitHub Release, deploys that exact state through the protected `production` environment, and verifies the served Worker Version ID and public `version.json`.
- Non-goals: No application, dependency, workflow, settings, DNS or secret change; no manual tag, Release or Wrangler publish; no bypass of the protected environment's required review.
- Acceptance: One WG-105 squash commit on main; annotated v1.2.0 points at it; GitHub Release v1.2.0 is published, not draft or prerelease; deploy-production succeeds after the environment's required review; `https://wizardgang.ai/version.json` reports release v1.2.0 and the exact commit.
- Validation: Pinned npm ci, the dependency advisory gate, `npm run deploy:production:dry-run`, focused release tests, canonical check, exact-head CI, post-merge release and deployment jobs, and a public identity readback.
- Authorities: AGENTS.md, README.md, package.json, package-lock.json, .github/workflows/ci.yml, scripts/release-tag.mjs, scripts/release-identity.mjs, scripts/production-deployment-identity.mjs.

### WG-106 — [REFACTOR] Remove dead integration component and stale copy

- Dependency: WG-105 delivered; preserve the WG-103 design system and every canonical route, preference and translation contract.
- Why: The WG-103 audit found leftovers outside its scope: `src/components/IntegrationSurfaces.tsx` exports an `IntegrationCatalog` that nothing imports and whose classes have no CSS; `vite.config.ts` watches files that no longer exist; `src/browser/translations.ts` carries Spanish entries for retired pages; `public/site.webmanifest` still names a portfolio rather than the company site; `docs/ACCESSIBILITY.md` still scopes a retired Glossary.
- Scope: Remove the dead component and stale watch entries, keeping `src/data/integrations.ts`, which acceptance still requires. Prune translation entries whose English strings appear in no generated page while keeping every string acceptance asserts. Align the manifest name with the WizardGang company identity and correct the accessibility scope. Retire this task into the shared permanent empty queue.
- Non-goals: No visual, route, CSP, dependency, version, release or deployment change. Do not change the Solutions meta description without owner direction; it still echoes the lede sentence the owner removed in WG-103.
- Acceptance: No source references the removed component; Spanish mode still translates every visible string it translated before; `npm run check` and exact-head CI pass; one WG-106 squash commit lands on main with green post-merge CI and branch cleanup.
- Validation: Pinned npm ci, focused browser-behavior, accessibility, frontend-authority and documentation tests, canonical check, a before/after scan of generated text in Spanish mode, committed-range whitespace check, exact-head CI, post-merge CI, history and branch cleanup.
- Authorities: AGENTS.md, README.md, src/components/IntegrationSurfaces.tsx, vite.config.ts, src/browser/translations.ts, public/site.webmanifest, docs/ACCESSIBILITY.md, tests/.
