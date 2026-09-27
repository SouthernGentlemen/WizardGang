# Implementation plan

## Open tasks

### WG-110 — [FIX] Prefer exact Spanish translations and retire the stale work-page limitation

- Dependency: WG-109 plan-only queue publication has merged; preserve the WG-106 translation scope and every canonical route, preference and translation contract.
- Why: After WG-108 the owner chose to fix the follow-ups found during WG-106 before releasing. `translateDynamic` tries its pattern rules before exact entries, so in Spanish mode the Play previews switch on every page reads "Jugar a previews" instead of its exact translation "Reproducir vistas previas", and the 404 page's "404 / Route not found" stays in English instead of "404 / Ruta no encontrada". `docs/ACCESSIBILITY.md` still lists a limitation for the retired work page.
- Scope: In `src/browser/translations.ts`, return an exact `SPANISH_TRANSLATIONS` match before trying the pattern rules. Add browser-behavior assertions for both corrected strings while "Play SharkTank" still reads "Jugar a SharkTank". Reword the work-page limitation in `docs/ACCESSIBILITY.md` to describe current content. Retire this task, leaving WG-111 next.
- Non-goals: No other translation, English text, presentation, route, CSP, dependency, version, release or deployment change.
- Acceptance: A before/after scan of every generated page in Spanish mode changes only those two strings; no current document mentions the work page; `npm run check` and exact-head CI pass; one WG-110 squash commit lands on main with green post-merge CI and branch cleanup.
- Validation: Pinned npm ci, focused browser-behavior, accessibility and documentation tests, the before/after Spanish scan, canonical check, committed-range whitespace check, exact-head CI, post-merge CI, history and branch cleanup.
- Authorities: AGENTS.md, README.md, src/browser/translations.ts, docs/ACCESSIBILITY.md, tests/.

### WG-111 — [RELEASE] Release the corrected record and cleanup as v1.2.1

- Dependency: WG-110 delivered; WG-106, WG-108 and WG-110 are on main with green post-merge CI.
- Why: The owner asked for a release once nothing is left to do. Production serves v1.2.0, and the WG-106 cleanup, the WG-108 deployment-record correction and the WG-110 Spanish fixes reach production only through an immutable release. None adds a feature, so the release is a patch.
- Scope: Bump `package.json` and both `package-lock.json` version fields from 1.2.0 to 1.2.1 and retire this task into the shared permanent empty queue. After the squash merge, canonical main CI creates the annotated v1.2.1 tag on the exact merged commit, reproduces and publishes the GitHub Release, deploys that exact state through the protected `production` environment, and verifies the served Worker Version ID and public `version.json`.
- Non-goals: No application, dependency, workflow, settings, DNS or secret change; no manual tag, Release or Wrangler publish; no bypass of the protected environment's required review.
- Acceptance: One WG-111 squash commit on main; annotated v1.2.1 points at it; GitHub Release v1.2.1 is published, not draft or prerelease; deploy-production succeeds after the environment's required review; `https://wizardgang.ai/version.json` reports release v1.2.1 and the exact commit.
- Validation: Pinned npm ci, the dependency advisory gate, `npm run deploy:production:dry-run`, focused release tests, canonical check, exact-head CI, post-merge release and deployment jobs, and a public identity readback.
- Authorities: AGENTS.md, README.md, package.json, package-lock.json, .github/workflows/ci.yml, scripts/release-tag.mjs, scripts/release-identity.mjs, scripts/production-deployment-identity.mjs.
