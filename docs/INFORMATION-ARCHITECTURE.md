# WizardGang.ai current architecture

Status: current-state authority for the public site structure, content ownership, canonical routes, and frontend/runtime boundaries.

Implementation authority remains the typed source and acceptance tests. This document explains those contracts for contributors without duplicating generated output.

## Public hierarchy

Five canonical pages. The primary navigation is Solutions, Projects and About. Solutions and Projects are links to their index pages, with menus that open on hover or keyboard focus. The Solutions menu points at its four sections; the Projects menu points at the case study. Home is reached through the wordmark, and contact lives in the footer.

```text
/
├── /solutions/            #capabilities, #industries, #integrations, #deployments
├── /projects/
├── /projects/hexframe/
└── /about/
```

The `/projects/` index introduces each project and links to its case study and live application where one exists.

The build also emits `404.html`. It is noindex, has no canonical URL, and is not a sitemap entry.

`src/app/pageRegistry.ts` is the generated-page inventory, and `sitemap.xml` is a projection of it rather than a second list. The menus are projections too: the Projects menu comes from `src/data/projects.ts` and the Solutions menu from `src/data/solutions-menu.ts`, so navigation and routes cannot drift apart.

## Content ownership

Each concept has one public owner:

| Concept | Authority | Typed source |
| --- | --- | --- |
| selected projects, industries and integrations, as scannable lists | `/` | `src/data/projects.ts`, `src/data/professional-systems.ts` |
| all projects, as an index | `/projects/` | `src/data/projects.ts` |
| one project's problem, build, architecture, approach, result | `/projects/<slug>/` | `src/data/projects.ts` |
| what WizardGang can demonstrate running | `/solutions/#capabilities` | `src/data/capabilities.ts` |
| the professional record | `/solutions/` | `src/data/professional-systems.ts` |
| the argument, the person, the career record | `/about/` | `src/data/team.ts`, `src/data/professional.ts` |
| detailed Demo Framework application and evidence | `demo.wizardgang.ai` | linked outward, not mirrored |

The home page carries each project's preview, a one-line tagline, its tags and a link. The case study owns the substance. A project's overview and its case study used to be separate routes that restated each other; they are one page now.

Solutions carries two different kinds of claim, and keeps them apart.

Capabilities leads, and is WizardGang's own work: each entry links to the corresponding area on `demo.wizardgang.ai`, and the section links to the full demo workbench. Assurance and security links lead to their supporting records and reporting guidance. Demo fragments match the demonstration IDs in the architecture application.

The three sections after it are Jacob Yongue's employment record — the domains worked in, the systems connected, and the organizations those systems ran for. Every deployment carries the solution delivered and the employer it was delivered under. The attribution note sits between the two halves rather than at the top of the page, because at the top it disclaimed WizardGang's own capabilities as employment rather than WizardGang client work.

### Motion

Projects lead the home page as expandable cards, because each carries a preview worth opening on its own; industry and integration categories follow in responsive grids. Nothing animated is open on load. A preview animates only while its panel is open, and the project rows share a `name`, so at most one preview runs at a time. `src/styles/globals.css` pauses `.project-visual *` unconditionally and resumes it only inside `details[open]` or a case study's `.case-visual`, with the preview toggle still respected.

## Typed authorities

- `src/app/navigation.ts` — primary navigation and current-section matching.
- `src/app/pageRegistry.ts` — generated page inventory.
- `src/data/projects.ts` — project records, `/projects/` routes, displayed tags, actions, previews, metadata, and the Projects menu.
- `src/data/capabilities.ts` — what WizardGang can demonstrate, and the demo fragment proving each one.
- `src/data/solutions-menu.ts` — the Solutions page sections and menu.
- `src/data/professional-systems.ts` — the domains, systems and organizations Solutions projects.
- `src/data/integrations.ts` — the company integration taxonomy.
- `src/data/team.ts`, `src/data/professional.ts`, `src/data/professional-systems.ts` — people, career history, attributed evidence.

Pages project these authorities. They do not create parallel catalogs.

## Presentation

Two authored stylesheets, with one job each:

- `src/styles/tokens.css` — the design system. One zinc palette with a four-step surface ladder, a three-level text ramp and a single accent, one type scale, one spacing scale, one radius scale, and the self-hosted faces. The light preference re-points the same names. It may declare only `:root` custom properties and `@font-face`, which `npm run check` enforces, so it cannot become a second place where presentation is decided.
- `src/styles/globals.css` — every rule, consuming those tokens.

The stylesheet is mobile first. Rules outside a query are the phone layout; `min-width` queries at 40, 48, 64 and 80rem add columns, and the inline navigation replaces the menu button from 48rem. Product previews are size containers, so a recreation inside a phone card and one leading a desktop case study each adapt to the width they are given.

Headings resolve to one of four scale tokens. A page that wants a different size changes the scale, not the page. One vocabulary serves every page: one card surface, one chip, one button, one text link.

At 200% text the root doubles, so every rem doubles with it: a 12rem label column becomes 24rem. Explicit multi-column layouts therefore collapse to one column, the primary navigation uses the compact menu at every width, the preferences panel spans the header instead of hanging off the gear, and a long word may break rather than push the page sideways. Every page must report zero horizontal overflow at that size.

Instrument Sans is the one interface face; JetBrains Mono is kept for machine values — the build identifier and the product recreations. Both ship from `public/fonts/` as latin-subset variable WOFF2 under the SIL Open Font License. The production policy is `default-src 'none'` with `font-src 'self'`, so a font served from another origin would not load at all.

## Route policy

Canonical identity is path-based.

- Canonical pages come from the typed page registry.
- First-party UI links directly to canonical paths and their fragments.
- Redirect-only paths do not enter the page registry or sitemap, and no canonical page links to one.
- Canonical metadata and Open Graph URLs use the current canonical path.
- Explicitly unsupported paths fall through to the normal 404 behavior.

Compatibility redirects have been retired. Routes this site used to serve —
`/work/`, `/services/`, `/contact/`, `/software/*`, the former
Solutions sub-pages, `/about/team/`, `/about/company/`, `/about/team/jacob/`,
`/resume`, `/professional`, `/glossary/` and the retired game paths — are dead.
They fall through to the ordinary 404 rather than forwarding somewhere, because
a path that no longer names anything should say so.

`src/worker/index.ts` keeps eight permanent redirects, and none of them were ever
pages on this site: `/github` to the WizardGang GitHub organization, and
`/compliance`, `/accessibility` and `/security` to the demo's assurance and
security surfaces. They are outward aliases, not compatibility.

## Technical architecture

WizardGang.ai is static-first:

```text
React + TypeScript
→ render complete documents
→ typed page registry
→ Vite build
→ static HTML + assets in dist/
→ wg-edge Worker shell (host guard, www redirect, built-ins, headers)
→ TypeScript site handler: outward shortcuts, then Cloudflare static assets
```

### React and TypeScript

`src/app/Document.tsx` uses React server rendering to produce complete HTML documents. Canonical page bodies are React/TypeScript definitions under `src/pages/`.

The browser does not hydrate a React application. There is no SPA router. Static content, navigation, links, metadata, and primary page meaning exist before browser JavaScript runs.

### Browser enhancement

`src/browser/` owns first-party progressive enhancement for mobile navigation, language, display and theme preferences, readable layout, text size, and project-preview motion. Failure or absence of browser JavaScript must not erase primary content or navigation.

### Build and styling

`npm run build` invokes Vite through `scripts/build.mjs`. Vite compiles the server-side renderer, processes the stylesheets, emits the browser module, copies public assets, renders the page registry, writes the generated `sitemap.xml`, then publishes the tree into `dist/`. Before Vite runs, `scripts/build.mjs` writes the Worker entry `build/worker.mjs` with the release from `WG_VERSION` and `WG_COMMIT` (`0.0.0-dev` at the checked-out commit when they are unset).

### Worker and Cloudflare

The site is the `wizardgang` Worker on baseline's `wg-edge` shell, vendored under `platform/` and pinned by `platform/vendor.lock.json`. The generated `build/worker.mjs` is the Wrangler entry. It calls `createSiteWorker` in `src/worker/index.ts`, which hands the shell the release and the site's robots policy, then redirects the outward shortcuts and serves everything else from the assets. Because `run_worker_first` is on, the shell answers first on every path. It owns the host guard, the `www.wizardgang.ai` → apex 308, TLS, `/version.json`, `/health.json`, `/robots.txt`, the `/admin` gate, security headers and errors. `wrangler.jsonc` is the one top-level production config: custom domains `wizardgang.ai` and `www.wizardgang.ai`, the assets and the shared Secrets Store bindings. `npm run check:platform` checks it, and the vendored pin, against baseline. Production deploys only through baseline's `deploy-worker.yml`, called from CI after the Release.

## Local development

```bash
npm ci
npm run dev
```

The orchestrator performs checkout-owned teardown, narrow generated-state reset, production build, local header preparation, Vite build watch, Wrangler startup, readiness verification, browser open, and attached supervision.

The default local origin is `http://127.0.0.1:8790`. Use `WIZARDGANG_PORT` to select another port. The process manager refuses to kill a port owner it cannot prove belongs to the same checkout.

Production headers are authored in `public/_headers`. Local development sanitizes only the generated `dist/_headers` copy so plain HTTP does not receive HSTS or `upgrade-insecure-requests`.

## Verification and guardrails

`npm run check` is the merge acceptance gate. It includes strict TypeScript checking, the production build, and every `tests/*.test.mjs`.

The enforced architecture includes:

- TypeScript-first application source;
- React static composition without client hydration;
- one canonical page registry, and a sitemap derived from it;
- one typed primary-navigation authority;
- one canonical route per concept, and one type scale for every heading;
- navigation menus that open with the keyboard and without JavaScript;
- direct internal canonical links, never through a redirect;
- company and personal attribution boundaries;
- accessibility and progressive-enhancement behavior;
- Worker outward-shortcut behavior and the shell's `www` redirect and `/version.json` identity;
- metadata correctness;
- safe checkout-scoped local development.

## External boundaries

- `wizardgang.ai` — the company site owned by this repository.
- `demo.wizardgang.ai` — the detailed architecture, assurance, and evidence application.
- `hexframe.wizardgang.ai` — product runtime.
- WizardGang GitHub repositories — source and releases.

Product runtime implementation, operational data, and product-specific evidence stay with their owning systems rather than being duplicated here.
