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

### WG-108 — [CONTENT] Correct the deployment record and order it by organization

- Dependency: WG-106 delivered; preserve the WG-103 presentation and the deployment wall's attribution contract (every entry keeps its solution and employer).
- Why: The owner corrected the professional record. Waytek Wire was an Order Fulfillment System delivered under Fastfetch Corporation, not a Warehouse Management System (CIMS) under Supply Chain Technologies. "Wanted" is not a real deployment. The record should also read by organization.
- Scope: In `src/data/professional-systems.ts`, change Waytek Wire to solution "Order Fulfillment System" and employer "Fastfetch Corporation", keeping its URL. Remove the "Wanted" entry. Reorder `deployments` by employer: Supply Chain Technologies (CIMS), then Spartan Technology Solutions, then Fastfetch Corporation. Within each, sort alphabetically by name, case-insensitive (`localeCompare(b, "en", { sensitivity: "base" })`). Add a focused acceptance assertion that locks both corrections and the order. Counts derived from `deployments.length` update themselves (34 to 33). Retire this task into the shared permanent empty queue.
- Non-goals: No other data, presentation, route, CSP, version, release or deployment change.
- Acceptance: Solutions lists 33 organizations in the required order; Waytek Wire reads Order Fulfillment System / Fastfetch Corporation; "Wanted" appears nowhere in source or generated HTML; About reads "33 organizations"; `npm run check` and exact-head CI pass; one WG-108 squash commit lands on main with green post-merge CI and branch cleanup.
- Validation: Pinned npm ci, the new assertion, generated-site and frontend-authority tests, canonical check, committed-range whitespace check, exact-head CI, post-merge CI, history and branch cleanup.
- Authorities: AGENTS.md, README.md, docs/INFORMATION-ARCHITECTURE.md, src/data/professional-systems.ts, src/pages/Solutions.tsx, src/pages/About.tsx, tests/.
