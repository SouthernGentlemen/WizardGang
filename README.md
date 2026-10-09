# WizardGang

[WizardGang.ai](https://wizardgang.ai) is the company site for WizardGang. The home page leads with the software — projects, then industries and integrations — and every project opens in place.

```text
/                        selected projects, industries and integrations
/solutions/              capabilities, then the professional record
/projects/               project index
/projects/hexframe/      case study
/about/                  the pitch, the person, the career record
```

Navigation is Solutions, Projects, About. Solutions and Projects link to their index pages and open their menus on hover or keyboard focus; contact is in the footer. These five routes are the whole site: retired paths return the ordinary 404. The generated 404 is noindex and is not a sitemap entry.

The Worker keeps only what was never a page here — `/github`, `/compliance`, `/accessibility` and `/security` point outward. Everything else falls through to the site's assets and ordinary 404 behavior. `www.wizardgang.ai` redirects to the apex.

**[Live site](https://wizardgang.ai)** · **[Solutions](https://wizardgang.ai/solutions/)** · **[Projects](https://wizardgang.ai/projects/)**

## Architecture

WizardGang.ai is a static-first React and TypeScript application:

```text
React + TypeScript page composition
→ typed page registry
→ Vite static build
→ complete HTML + generated CSS/browser module
→ Cloudflare assets behind the wg-edge Worker shell
```

React renders complete static documents during the build. There is no client React hydration and no SPA router. Browser TypeScript progressively enhances language, display preferences, and mobile navigation.

The site runs as the `wizardgang` Worker on baseline's shared `wg-edge` shell, vendored verbatim under `platform/` and pinned by `platform/vendor.lock.json`. The shell runs before the assets on every request. It owns the host guard, the `www` → apex 308, TLS, `/version.json`, `/health.json`, `/robots.txt`, the `/admin` operator gate, security headers and errors. The TypeScript Worker adds the outward shortcuts and serves everything else from Cloudflare assets. Never edit `platform/`; re-vendor it from a merged baseline commit instead.

## Presentation

Two authored stylesheets, one job each:

- `src/styles/tokens.css` — the design system: one zinc palette with a single lime accent, one type scale, one spacing scale, one radius scale, and the self-hosted faces. It may declare only `:root` custom properties and `@font-face`, which the acceptance gate enforces. The light preference re-points the same token names.
- `src/styles/globals.css` — every rule, consuming those tokens. It is mobile first: rules outside a query are the phone layout, and `min-width` queries at 40, 48, 64 and 80rem add columns. Product previews are size containers, so each recreation adapts to its frame rather than the viewport.

Every heading resolves to one of four scale tokens, so a page cannot invent its own display size. Instrument Sans is the one interface face; JetBrains Mono is kept for machine values — the build identifier and the product recreations. Both ship from `public/fonts/` as latin-subset variable WOFF2 under the SIL Open Font License; the production policy is `default-src 'none'` with `font-src 'self'`, so a font from another origin would not load.

## Content ownership

- Home — the projects lead as expandable cards because each carries a preview; industry and integration categories follow in responsive grids. Project previews start closed and animate only while open.
- Solutions — Capabilities first: each working example links to its architecture demo, with a link to the full demo workbench. The professional record follows in three sections, projected from `src/data/professional-systems.ts`, with every deployment carrying what was delivered and the employer it was delivered under.
- Projects — an index of the work, then one case study per project: problem, what was built, architecture, approach, result.
- About — the argument for the practice, the person, and the career record.

Typed domain data lives under `src/data/`. Industries, integrations and deployments are Jacob Yongue's employment record, not WizardGang client work, and Solutions states that boundary before the professional record.

## Run locally

Install the locked dependencies and start the normal local environment:

```bash
npm ci
npm run dev
```

`npm run dev` is checkout-scoped. It:

1. stops stale Wrangler/Vite processes only when their saved process metadata proves they belong to this checkout;
2. resets generated `dist/`, `tmp/dev/`, and `tmp/frontend-shell/` state;
3. runs the production static build;
4. sanitizes only the generated local `dist/_headers` copy for plain HTTP;
5. starts Vite build watch;
6. starts `wrangler dev --local` at `http://127.0.0.1:8790`, presenting requests to the Worker as `https://wizardgang.ai` so the shell's host guard admits them;
7. waits for the Wrangler-served site to respond;
8. opens the local URL and remains attached to both required child processes.

Use another port when needed:

```bash
WIZARDGANG_PORT=9123 npm run dev
```

If a requested port belongs to an unrelated process, startup fails rather than terminating that process. Stop the environment with `Ctrl-C`.

Production security policy remains in `public/_headers`. Local development removes HSTS and `upgrade-insecure-requests` only from the generated `dist/_headers` copy; do not weaken `public/_headers` to make localhost work.

## WizardGang-specific controlled work

Use `WG-NNN` controlled IDs, branches named `wg-nnn-short-kebab-summary`, and `[WG-NNN] [TYPE] Imperative summary` for the commit and pull request. The required exact-head checks are `verify` and `change-id`. [Ownership](docs/OWNERSHIP.md), [information architecture](docs/INFORMATION-ARCHITECTURE.md), and the source authorities below govern site-specific changes. The first-parent history and committed queue checks run inside `npm run check`.

Normal merges do not create releases. Production is Cloudflare-only and is reached only from an accepted immutable release tag after GitHub Release publication and the protected `production` environment. The exact release and production identity path is documented below; ordinary process work does not publish or deploy.

## Build and verify

Build the complete static site:

```bash
npm run build
```

The build emits the static HTML pages, public assets, generated CSS/browser JavaScript and `sitemap.xml` into `dist/`. The sitemap is a projection of the page registry, never a second route list. It also writes the Worker entry `build/worker.mjs`, which hands the shell the release it serves at `/version.json`. A plain build is `0.0.0-dev` at the checked-out commit. Baseline's deploy workflow builds with `WG_VERSION` and `WG_COMMIT`, which must match `package.json` and the checkout.

The authoritative repository acceptance gate is:

```bash
npm run check
```

It includes the vendored `platform/` pin and `wrangler.jsonc` conformance checks (`npm run check:platform`), strict TypeScript checking, the production build, frontend-architecture authority, generated-page contracts, accessibility, browser behavior, project and solution ownership, Worker routing, local-development lifecycle, metadata, links, security/header boundaries, and bounded tracked-file and reachable-history credential scanning.

Useful focused checks include:

```bash
npm run test:accessibility
npm run test:frontend-authority
npm run test:navigation
npm run test:docs
```

## Source layout

```text
src/
  app/         document, contracts, navigation, canonical page registry
  browser/     progressive enhancement
  components/  shared presentation
  data/        typed content authorities
  pages/       canonical React page bodies
  styles/      design tokens and production CSS
  worker/      the site's handler inside the wg-edge shell
platform/      baseline's shared Worker shell, conformance and deploy checks (vendored, never edited)
scripts/       build, local development, verification, maintenance
tests/         repository acceptance
public/        deployable static assets, fonts, and production headers
docs/          current operating and architecture documentation
```

Key authorities:

- `src/app/pageRegistry.ts` — generated page inventory.
- `src/app/navigation.ts` — primary navigation and current-section model.
- `src/data/projects.ts` — project facts, routes, tags, actions, and the Projects menu.
- `src/data/capabilities.ts` — what WizardGang can demonstrate, and the demo fragment that proves each one.
- `src/data/solutions-menu.ts` — the Solutions page sections and menu.
- `src/data/professional-systems.ts` — the domains, systems and deployments Solutions projects.

- `src/data/team.ts`, `src/data/professional.ts`, `src/data/professional-systems.ts` — people, career history, and attributed evidence.
- `src/components/ProjectSurfaces.tsx` — shared project presentation contract.
- `src/app/Document.tsx` — static document, metadata, and sitemap composition.
- `src/worker/index.ts` — outward shortcuts, robots policy and asset fallback inside the shell.
- `src/styles/tokens.css` — the design system.
- `vite.config.ts` — static build pipeline.
- `wrangler.jsonc` — the one top-level `wizardgang` Worker config, checked against baseline's conformance rules.

## Documentation

- [Current information and technical architecture](docs/INFORMATION-ARCHITECTURE.md)
- [Source and system ownership](docs/OWNERSHIP.md)
- [Accessibility](docs/ACCESSIBILITY.md)
- [Compliance management record](docs/COMPLIANCE.md)
- [Security policy](SECURITY.md)

## Deployment

`wrangler.jsonc` declares the one `wizardgang` Worker: custom domains `wizardgang.ai` and `www.wizardgang.ai`, the assets and the shared `WG_OPS_TOKEN` and `WG_SESSION_KEY` from the Secrets Store. There is no staging Worker. Validate deploy packaging without publishing:

```bash
npm run deploy:dry-run
```

Production has no checkout-owned deploy command. Canonical CI waits for the exact immutable GitHub Release, then calls baseline's `deploy-worker.yml`, pinned to the same baseline commit as `platform/`, with the tag and its commit. The call passes `secrets: inherit`, because a called workflow sees only the secrets its caller passes; this repository keeps no repository-level secrets, so only the `production` environment's `CLOUDFLARE_API_TOKEN` reaches it. The call grants `actions: read` and `contents: read`, because that workflow does not run `npm run check` again: it re-verifies the tag, proves from the Actions API that this run's `verify` job ran `npm ci` and `npm run check` at the tag commit and that the Release is published, and runs the conformance checks. So the CI `verify` job is the one job before the call that reproduces the commit, and the run must be at the tag commit. The workflow then enters this repository's protected `production` environment and deploys with the locked Wrangler. It confirms that the new version serves 100% of traffic and that public `/version.json` reports `wizardgang`, the release version and the tag commit. A workflow dispatch at a release tag ref reruns that tag: it verifies, never creates, the existing Release and deploys it after the production review. Rollback is such a run at the previous tag, which works only for tags whose own `ci.yml` has this shape. No dispatch deploys a tag from another commit. Cloudflare tokens are minted, rotated and discovered with baseline's runbooks and tooling, not from this repository.

## GitHub auto-merge

The committed repository settings enable per-PR auto-merge. Enabling this repository capability does not enroll a PR: an authorized contributor chooses auto-merge for that PR. GitHub then waits for required reviews and exact-head checks and uses the repository's squash-only merge policy. Run `npm run verify:github-settings` for a read-only live check; `npm run apply:github-settings` applies the committed authority and independently verifies it.
