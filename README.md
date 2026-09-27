# WizardGang

[WizardGang.ai](https://wizardgang.ai) is the company site for WizardGang. The home page leads with the software — projects, then industries and integrations — and every project opens in place.

```text
/                        selected projects, industries and integrations
/solutions/              capabilities, then the professional record
/projects/               project index
/projects/sharktank/     case study
/projects/hexframe/      case study
/projects/yarreader/     case study
/about/                  the pitch, the person, the career record
```

Navigation is Solutions, Projects, About. Solutions and Projects link to their index pages and open their menus on hover or keyboard focus; contact is in the footer. These seven routes are the whole site: retired paths return the ordinary 404. The generated 404 is noindex and is not a sitemap entry.

The Worker keeps only what was never a page here — `/github`, `/compliance`, `/accessibility` and `/security` point outward — plus the SharkTank product boundary.

**[Live site](https://wizardgang.ai)** · **[Solutions](https://wizardgang.ai/solutions/)** · **[Projects](https://wizardgang.ai/projects/)**

## Architecture

WizardGang.ai is a static-first React and TypeScript application:

```text
React + TypeScript page composition
→ typed page registry
→ Vite static build
→ complete HTML + generated CSS/browser module
→ Cloudflare assets + TypeScript Worker
```

React renders complete static documents during the build. There is no client React hydration and no SPA router. Browser TypeScript progressively enhances language, display preferences, and mobile navigation.

The TypeScript Worker owns runtime routing that cannot be expressed as static assets alone, including compatibility redirects and product-boundary routing. Wrangler owns local runtime and Cloudflare deployment configuration.

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
6. starts `wrangler dev --local` at `http://127.0.0.1:8790`;
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

The build emits the static HTML pages, public assets, generated CSS/browser JavaScript, `sitemap.xml` and `version.json` into `dist/`. The sitemap is a projection of the page registry, never a second route list.

The authoritative repository acceptance gate is:

```bash
npm run check
```

It includes strict TypeScript checking, the production build, frontend-architecture authority, generated-page contracts, accessibility, browser behavior, project and solution ownership, Worker routing, local-development lifecycle, metadata, links, security/header boundaries, and bounded tracked-file and reachable-history credential scanning.

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
  worker/      Cloudflare runtime routing
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
- `src/worker/index.ts` — compatibility and runtime routing.
- `src/styles/tokens.css` — the design system.
- `vite.config.ts` — static build pipeline.
- `wrangler.jsonc` — local/staging/production Cloudflare configuration.

## Documentation

- [Current information and technical architecture](docs/INFORMATION-ARCHITECTURE.md)
- [Source and system ownership](docs/OWNERSHIP.md)
- [Accessibility](docs/ACCESSIBILITY.md)
- [Compliance management record](docs/COMPLIANCE.md)
- [Security policy](SECURITY.md)

## Deployment

Cloudflare environments are defined in `wrangler.jsonc`. Validate deploy packaging without publishing:

```bash
npm run deploy:staging:dry-run
npm run deploy:production:dry-run
```

Staging can still be published explicitly with `npm run deploy:staging`. Production has no checkout-owned deploy command. Canonical CI waits for the exact immutable GitHub Release, re-verifies that released tag, enters the protected `production` environment, and then deploys that exact state with Wrangler. A deliberate `main` workflow dispatch can recover an existing published release by supplying its tag and exact accepted commit; it cannot create a new Release. CI records Wrangler's structured Worker Version ID, verifies Cloudflare is serving that version at 100% of production traffic, and requires public `version.json` to report the same release and commit. Production deployments serialize rather than cancelling an in-progress deploy.

## GitHub auto-merge

The committed repository settings enable per-PR auto-merge. Enabling this repository capability does not enroll a PR: an authorized contributor chooses auto-merge for that PR. GitHub then waits for required reviews and exact-head checks and uses the repository's squash-only merge policy. Run `npm run verify:github-settings` for a read-only live check; `npm run apply:github-settings` applies the committed authority and independently verifies it.
