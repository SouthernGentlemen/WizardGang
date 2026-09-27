# Implementation plan

## Open tasks

### WG-106 — [REFACTOR] Remove dead integration component and stale copy

- Dependency: WG-105 delivered; preserve the WG-103 design system and every canonical route, preference and translation contract.
- Why: The WG-103 audit found leftovers outside its scope: `src/components/IntegrationSurfaces.tsx` exports an `IntegrationCatalog` that nothing imports and whose classes have no CSS; `vite.config.ts` watches files that no longer exist; `src/browser/translations.ts` carries Spanish entries for retired pages; `public/site.webmanifest` still names a portfolio rather than the company site; `docs/ACCESSIBILITY.md` still scopes a retired Glossary.
- Scope: Remove the dead component and stale watch entries, keeping `src/data/integrations.ts`, which acceptance still requires. Prune translation entries whose English strings appear in no generated page while keeping every string acceptance asserts. Align the manifest name with the WizardGang company identity and correct the accessibility scope. Retire this task into the shared permanent empty queue.
- Non-goals: No visual, route, CSP, dependency, version, release or deployment change. Do not change the Solutions meta description without owner direction; it still echoes the lede sentence the owner removed in WG-103.
- Acceptance: No source references the removed component; Spanish mode still translates every visible string it translated before; `npm run check` and exact-head CI pass; one WG-106 squash commit lands on main with green post-merge CI and branch cleanup.
- Validation: Pinned npm ci, focused browser-behavior, accessibility, frontend-authority and documentation tests, canonical check, a before/after scan of generated text in Spanish mode, committed-range whitespace check, exact-head CI, post-merge CI, history and branch cleanup.
- Authorities: AGENTS.md, README.md, src/components/IntegrationSurfaces.tsx, vite.config.ts, src/browser/translations.ts, public/site.webmanifest, docs/ACCESSIBILITY.md, tests/.
