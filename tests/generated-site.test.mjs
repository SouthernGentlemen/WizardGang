import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import test from "node:test";
import { deployments } from "../src/data/professional-systems.ts";
import { projects } from "../src/data/projects.ts";
import { sanitizeLocalHeadersText } from "../scripts/dev.mjs";
import { PERMANENT_REDIRECTS } from "../src/worker/index.ts";
import {
  CANONICAL_PAGES,
  PROJECT_LINKS,
  PROJECT_SLUGS,
  SITEMAP_ROUTES,
  anchors,
  dist,
  exists,
  findAnchor,
  internalTarget,
  linkByRel,
  metaContent,
  readDist,
  readRoot,
  relativeFromDist,
  root,
  startTags,
  tagBlocks,
  textContent,
  walk
} from "./helpers.mjs";

const ORIGIN = "https://wizardgang.ai";
const canonicalFiles = [...CANONICAL_PAGES.keys()];

function allIds(html) {
  const ids = new Set();
  for (const tag of html.matchAll(/<[^!][^>]*>/g)) {
    const match = tag[0].match(/\sid=(?:"([^"]+)"|'([^']+)')/i);
    if (match) ids.add(match[1] ?? match[2]);
  }
  return ids;
}

function requireText(html, phrases, label) {
  for (const phrase of phrases) assert.ok(html.includes(phrase), `${label} is missing substantive content: ${phrase}`);
}

function rejectText(html, phrases, label) {
  for (const phrase of phrases) assert.ok(!html.includes(phrase), `${label} still contains retired content: ${phrase}`);
}

function anchorWithHref(html, href) {
  return anchors(html).find((anchor) => anchor.href === href);
}

function browserModulePath(html) {
  const modules = startTags(html, "script").filter(({ attrs }) => attrs.get("type") === "module");
  assert.equal(modules.length, 1, "page must load exactly one TypeScript browser module");
  const source = modules[0].attrs.get("src") || "";
  assert.match(source, /^\/assets\/browser-[A-Za-z0-9_-]+\.js$/, "browser module must use the Vite hashed asset contract");
  return source.slice(1);
}

test("generated HTML inventory is the explicit canonical contract", async () => {
  const actual = (await walk(dist))
    .filter((path) => path.endsWith(".html"))
    .map(relativeFromDist)
    .sort();
  assert.deepEqual(actual, [...canonicalFiles].sort());
  assert.equal(actual.length, 6, "five canonical pages plus the generated 404");
});

test("all required public build artifacts and public records exist", async () => {
  const artifacts = [
    "_headers",
    "assets/styles.css",
    "favicon.svg",
    "site.webmanifest",
    "sitemap.xml",
    "robots.txt",
    "version.json",
    "og.jpg",
    "hexframe-project.jpg"
  ];
  for (const file of artifacts) assert.equal(await exists(resolve(dist, file)), true, `missing build artifact ${file}`);
  const topLevelJpgs = (await walk(dist)).map(relativeFromDist).filter((file) => !file.includes("/") && file.endsWith(".jpg")).sort();
  assert.deepEqual(topLevelJpgs, ["hexframe-project.jpg", "og.jpg"], "top-level project media must match the current site");
  assert.equal(await exists(resolve(dist, "sharktank-project.jpg")), false, "retired SharkTank image must not be emitted");
  assert.equal(await exists(resolve(dist, "projects/sharktank/index.html")), false, "retired SharkTank route must not be emitted");
  const browserAssets = (await walk(resolve(dist, "assets")))
    .map(relativeFromDist)
    .filter((file) => /^assets\/browser-[A-Za-z0-9_-]+\.js$/.test(file));
  assert.equal(browserAssets.length, 1, "build must emit exactly one hashed TypeScript browser entry");
  for (const file of ["README.md", "SECURITY.md", "docs/ACCESSIBILITY.md", "docs/COMPLIANCE.md"]) {
    assert.equal(await exists(resolve(root, file)), true, `missing public record ${file}`);
  }
});

test("every canonical page preserves document, metadata, link, and local-asset behavior", async (t) => {
  for (const [relative, route] of CANONICAL_PAGES) {
    await t.test(relative, async () => {
      const html = await readDist(relative);
      const h1 = tagBlocks(html, "h1");
      assert.equal(h1.length, 1, "expected exactly one h1");
      assert.ok(textContent(h1[0].inner).length >= 3, "h1 must have meaningful text");

      const title = tagBlocks(html, "title");
      assert.equal(title.length, 1, "expected one title");
      assert.ok(textContent(title[0].inner).length >= 12, "title must be descriptive");
      const description = metaContent(html, "name", "description");
      assert.ok(description && description.length >= 40, "meta description must be meaningful");

      assert.equal(metaContent(html, "property", "og:title"), textContent(title[0].inner));
      assert.equal(metaContent(html, "property", "og:description"), description);
      assert.equal(metaContent(html, "name", "twitter:title"), textContent(title[0].inner));
      assert.equal(metaContent(html, "name", "twitter:description"), description);

      if (relative === "404.html") {
        assert.match(metaContent(html, "name", "robots") || "", /(?:^|,)\s*noindex\b/i);
        assert.equal(linkByRel(html, "canonical"), null);
        assert.equal(metaContent(html, "property", "og:url"), null);
      } else {
        const expected = `${ORIGIN}${route}`;
        assert.equal(linkByRel(html, "canonical")?.attrs.get("href"), expected);
        assert.equal(metaContent(html, "property", "og:url"), expected);
      }

      assert.equal(linkByRel(html, "icon")?.attrs.get("href"), "/favicon.svg");
      assert.equal(linkByRel(html, "manifest")?.attrs.get("href"), "/site.webmanifest");
      const stylesheet = linkByRel(html, "stylesheet")?.attrs.get("href") || "";
      assert.match(stylesheet, /^\/assets\/styles\.css\?v=.+/);

      const scripts = tagBlocks(html, "script");
      assert.equal(scripts.length, 1, "must load exactly one first-party browser module");
      assert.equal(scripts[0].attrs.get("type"), "module");
      assert.equal(scripts[0].attrs.get("src"), `/${browserModulePath(html)}`);
      assert.equal(textContent(scripts[0].inner), "", "inline JavaScript is not allowed");
      assert.equal(startTags(html, "style").length, 0, "inline style elements are not allowed");
      assert.doesNotMatch(html, /\sstyle\s*=/i, "inline style attributes are not allowed");
      assert.doesNotMatch(html, /\starget\s*=\s*["']_blank["']/i, "links must not force a new tab");

      rejectText(html, [
        "ShadowMoney",
        "WizardGangLocal",
        "github.com/SouthernGentlemen/WizardGangLocal",
        "github.com/SouthernGentlemen/SharkTank",
        "github.com/SouthernGentlemen/Hexframe",
        "Evergreen Dr",
        "29631"
      ], relative);
      assert.doesNotMatch(html, /865[ -]?9031/i, `${relative} exposes private contact information`);
      assert.doesNotMatch(html, /sharktank/i, `${relative} still presents the retired SharkTank project`);
      assert.doesNotMatch(html, /href=["']\/resume/i, `${relative} links the retired resume route`);
      assert.doesNotMatch(html, />\s*Resume\s*</i, `${relative} exposes retired Resume content`);
      assert.doesNotMatch(html, /coming soon|disabled/i, `${relative} contains a disabled or coming-soon action`);

      const ids = allIds(html);
      for (const anchor of anchors(html)) {
        assert.ok(!anchor.href.startsWith("//"), `malformed protocol-relative URL ${anchor.href}`);
        const pathname = anchor.href.startsWith("/") ? new URL(anchor.href, ORIGIN).pathname : "";
        if (pathname && PERMANENT_REDIRECTS.has(pathname)) continue;
        const target = internalTarget(anchor.href, relative);
        if (!target) continue;
        assert.equal(await exists(resolve(dist, target.relative)), true, `broken internal link ${anchor.href}`);
        if (target.fragment) {
          const targetIds = target.relative === relative ? ids : allIds(await readDist(target.relative));
          assert.ok(targetIds.has(target.fragment), `broken fragment link ${anchor.href}`);
        }
      }

      for (const tagName of ["img", "script", "source", "link"]) {
        for (const tag of startTags(html, tagName)) {
          const reference = tag.attrs.get("src") || tag.attrs.get("href") || "";
          if (!reference.startsWith("/") || reference.startsWith("//")) continue;
          const target = internalTarget(reference, relative);
          if (!target || !extname(new URL(reference, ORIGIN).pathname)) continue;
          assert.equal(await exists(resolve(dist, target.relative)), true, `missing referenced local asset ${reference}`);
        }
      }
    });
  }
});

test("social preview behavior remains page-appropriate", async () => {
  const withSocialImage = canonicalFiles.filter((file) => file !== "404.html");
  for (const relative of withSocialImage) {
    const html = await readDist(relative);
    assert.equal(metaContent(html, "property", "og:image"), `${ORIGIN}/og.jpg`);
    assert.equal(metaContent(html, "property", "og:image:type"), "image/jpeg");
    assert.equal(metaContent(html, "property", "og:image:width"), "1200");
    assert.equal(metaContent(html, "property", "og:image:height"), "630");
    assert.match(metaContent(html, "property", "og:image:alt") || "", /WizardGang/i);
    assert.equal(metaContent(html, "name", "twitter:card"), "summary_large_image");
    assert.equal(metaContent(html, "name", "twitter:image"), `${ORIGIN}/og.jpg`);
  }

  for (const relative of canonicalFiles.filter((file) => !withSocialImage.includes(file))) {
    const html = await readDist(relative);
    assert.equal(metaContent(html, "name", "twitter:card"), "summary", `${relative}: Twitter card behavior changed`);
    assert.equal(metaContent(html, "property", "og:image"), null, `${relative}: unexpected social image behavior`);
  }
});

test("build/version evidence is present and internally consistent", async () => {
  const version = JSON.parse(await readDist("version.json"));
  const packageVersion = JSON.parse(await readRoot("package.json")).version;
  assert.equal(version.product, "WizardGang");
  assert.match(
    version.release,
    /^(?:0\.0\.0-dev|v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))(?:\+dirty)?$/,
    "version.json must distinguish development from semantic release identity"
  );
  assert.match(version.commit, /^(?:[0-9a-f]{40}|development)$/);
  assert.ok(Number.isFinite(Date.parse(version.builtAt)), "version.json must contain an ISO build timestamp");

  const releaseTag = version.release.replace(/\+dirty$/, "");
  if (releaseTag.startsWith("v")) {
    assert.equal(releaseTag, `v${packageVersion}`, "release identity must match package.json");
  }

  if (version.commit !== "development") {
    const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
    const epoch = Number(execFileSync("git", ["show", "-s", "--format=%ct", "HEAD"], { cwd: root, encoding: "utf8" }).trim());
    assert.equal(version.commit, head, "version.json must name the exact checked-out commit");
    assert.equal(version.builtAt, new Date(epoch * 1000).toISOString(), "build time must derive from immutable commit metadata");
  }

  const buildLabel = version.commit === "development" ? version.commit : version.commit.slice(0, 12);
  for (const relative of canonicalFiles) {
    const html = await readDist(relative);
    const buildLink = anchorWithHref(html, "/version.json");
    assert.ok(buildLink, `${relative}: missing version evidence link`);
    assert.equal(textContent(buildLink.inner), `Build ${buildLabel}`);
  }
});

test("favicon retains the current two-color WizardGang mark without freezing SVG serialization", async () => {
  const favicon = await readDist("favicon.svg");
  const rects = startTags(favicon, "rect");
  const fills = new Set(rects.map(({ attrs }) => attrs.get("fill")));
  assert.ok(rects.length >= 2);
  assert.ok(fills.has("#d9ff43"));
  assert.ok(fills.has("#a489ff"));
});

test("the homepage leads with the work and states its offer once", async () => {
  const home = await readDist("index.html");
  requireText(home, [
    "Software that Ships", "Industries", "Warehouse &amp; Fulfillment", "Logistics",
    "Justice &amp; Court Systems", "Public-Sector Workflows", "Enterprise &amp; AI Infrastructure",
    "Integrations", "ERP Integrations", "Commerce &amp; Fulfillment", "Warehouse Automation",
    "Carrier Integrations", "EDI &amp; B2B", "Warehouse Hardware", "Development &amp; Workflow",
    "Justice &amp; Legal", "Selected projects", "Hexframe",
    "Explore the Architecture"
  ], "homepage");

  // Earlier homepages stacked a kicker, a display headline and a paragraph in every
  // band, and carried the employer-attribution boundary in a section heading.
  rejectText(home, [
    "We build inspectable software.",
    "We build software that ships",
    "Build software.",
    "Working systems with source and evidence.",
    "Integration capability with clear attribution.",
    "employer and customer evidence remains attributed",
    "Software with clear ownership."
  ], "homepage");

  // Industries and integrations stay visible. The project preview is a disclosure
  // and remains closed so nothing animates on load.
  const panels = tagBlocks(home, "details");
  for (const panel of panels) assert.ok(!panel.attrs.has("open"), "a panel must start closed");

  // Professional categories are visible without extra clicks or summary rows.
  assert.equal(startTags(home, "ul").filter(({ attrs }) => (attrs.get("class") || "").includes("home-topic-grid")).length, 2);
  rejectText(home, ["All industries", "All integrations", "5 domains", "8 groups"], "homepage category grids");

  const named = panels.filter(({ attrs }) => attrs.get("name"));
  assert.deepEqual([...new Set(named.map(({ attrs }) => attrs.get("name")))], ["work-list"]);

  const projectRows = panels.filter(({ attrs }) => attrs.get("name") === "work-list");
  assert.equal(projectRows.length, 1, "one disclosure per project");
  assert.deepEqual([...new Set(projectRows.map(({ attrs }) => attrs.get("name")))], ["work-list"],
    "project rows share one exclusive group so only one preview can run");

  const headings = [...home.matchAll(/<h([1-3])\b/g)].map((match) => Number(match[1]));
  assert.equal(headings.filter((level) => level === 1).length, 1, "one h1 per page");
});

test("each project has a page with its preview and outbound relationships", async () => {
  const home = await readDist("index.html");
  assert.doesNotMatch(home, /SharkTank|sharktank/, "home must not present the retired SharkTank project");
  for (const label of ["Hexframe training mode"]) {
    assert.ok(startTags(home, "div").some(({ attrs }) => (attrs.get("aria-label") || "").includes(label)), `home missing semantic preview: ${label}`);
  }

  for (const [slug, relationships] of Object.entries(PROJECT_LINKS)) {
    assert.ok(anchorWithHref(home, `/projects/${slug}/`), `home must route to the ${slug} page`);
    const page = await readDist(`projects/${slug}/index.html`);
    assert.ok(anchorWithHref(page, relationships.source), `${slug} must expose its source repository`);
    if (relationships.live) assert.ok(anchorWithHref(page, relationships.live), `${slug} must expose its live application`);
    if (relationships.evidence) assert.ok(anchorWithHref(page, relationships.evidence), `${slug} must expose its operating evidence`);
    if (!relationships.live) {
      assert.ok(!anchors(page).some((anchor) => /^Open live demo\b/i.test(textContent(anchor.inner))), `${slug} must not invent a live URL`);
    }
  }
});

test("canonical project data retains the source/live/evidence contract", () => {
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  for (const [slug, relationships] of Object.entries(PROJECT_LINKS)) {
    const project = bySlug.get(slug);
    assert.ok(project, `missing project data for ${slug}`);
    assert.equal(project.sourceUrl, relationships.source);
    assert.equal(project.liveUrl, relationships.live);
    if (relationships.evidence) assert.equal(project.operationsUrl, relationships.evidence);
    else assert.equal(project.operationsUrl, undefined);
  }
});

test("project substance survived the move onto per-project pages", async () => {
  const hexframe = await readDist("projects/hexframe/index.html");

  requireText(hexframe, [
    "The match, training screen, computer player, replay, saved game",
    "A playable training stage with one fighter and one practice dummy",
    "Freeze automatically when a hit connects"
  ], "Hexframe");

  for (const page of [hexframe]) {
    for (const label of ["Problem", "Built", "Architecture", "Approach", "Result"]) {
      assert.ok(page.includes(`>${label}<`), `a project page must keep the ${label} section`);
    }
  }
});



test("About argues for the practice and keeps the career record", async () => {
  const about = await readDist("about/index.html");
  requireText(about, [
    "Jacob Yongue",
    "University of Georgia",
    "Background",
    "Skills",
    "The pitch",
    "black box"
  ], "about page");
  assert.ok(startTags(about, "section").some(({ attrs }) => attrs.get("id") === "jacob"), "about must anchor the person");

  // The compliance notice and the closing mail band are retired.
  rejectText(about, [
    "Attribution",
    "employer and customer work is not WizardGang client work",
    "Get in touch"
  ], "about page");
});

test("Solutions projects the professional evidence authorities", async () => {
  const solutions = await readDist("solutions/index.html");
  requireText(solutions, [
    "Industries", "Warehouse &amp; Fulfillment", "Case Management",
    "Integrations", "ERP Integrations", "NetSuite", "https://www.netsuite.com/",
    "Deployments", "SpartanNash", "https://www.spartannash.com/"
  ], "solutions");

  // The record is employment, and the page has to say so without a footnote.
  requireText(solutions, ["not under WizardGang", "Supply Chain Technologies", "Fastfetch Corporation", "Warehouse Management System (CIMS)"], "solutions attribution");

  for (const section of ["industries", "integrations", "deployments"]) {
    assert.ok(startTags(solutions, "section").some(({ attrs }) => attrs.get("id") === section), `solutions must anchor ${section}`);
  }
  const wall = tagBlocks(solutions, "li").filter(({ inner }) => inner.includes("href=\"https://"));
  assert.ok(wall.length >= 20, "the deployment wall must list every organization");
});

test("the deployment record carries the owner's corrections and reads by organization", async () => {
  // Waytek Wire was Fastfetch order fulfillment, not CIMS; "Wanted" was never a deployment.
  assert.deepEqual(deployments.find(({ name }) => name === "Waytek Wire"), {
    name: "Waytek Wire",
    url: "https://www.waytekwire.com/",
    solution: "Order Fulfillment System",
    employer: "Fastfetch Corporation"
  });
  assert.equal(deployments.some(({ name }) => /^wanted$/i.test(name)), false, "Wanted is not a deployment");

  // By employer, then alphabetically by name within each.
  const employers = ["Supply Chain Technologies", "Spartan Technology Solutions", "Fastfetch Corporation"];
  const byName = (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  const ordered = employers.flatMap((employer) => deployments.filter((deployment) => deployment.employer === employer).sort(byName));
  assert.deepEqual(deployments.map(({ name }) => name), ordered.map(({ name }) => name), "deployments must read by employer, then by name");

  const solutions = await readDist("solutions/index.html");
  const wall = tagBlocks(solutions, "ul").find(({ attrs }) => attrs.get("class") === "deployment-wall");
  assert.deepEqual(
    tagBlocks(wall.inner, "li").map(({ inner }) => textContent(inner)),
    deployments.map(({ name, url, solution, employer }) => `${name}${url ? " ↗" : ""} ${solution} ${employer}`),
    "Solutions must list every deployment, with its solution and employer, in record order"
  );

  const deploymentHrefs = new Set(anchors(wall.inner).map(({ href }) => href.replaceAll("&amp;", "&")));
  assert.equal(deploymentHrefs.has("https://www.amware.net/"), false, "Amware must not link to its dead site");
  assert.equal(deploymentHrefs.has("https://www.buyseasons.com/"), false, "BuySeasons must not link to its dead site");
  for (const deployment of deployments) {
    if (deployment.url) assert.ok(deploymentHrefs.has(deployment.url), `${deployment.name} must keep its deployment link`);
  }
});

test("Capabilities leads Solutions and links to every architecture demonstration", async () => {
  const solutions = await readDist("solutions/index.html");
  const sections = startTags(solutions, "section")
    .map(({ attrs }) => attrs.get("id"))
    .filter(Boolean);
  assert.deepEqual(sections.slice(0, 4), ["capabilities", "industries", "integrations", "deployments"]);

  const links = new Set(anchors(solutions).map(({ href }) => href));
  assert.ok(links.has("https://demo.wizardgang.ai/demos"), "Capabilities must link to the full demo workbench");
  for (const id of ["d1", "r2", "rest", "graphql", "webhooks", "identity", "mcp", "edge", "workers", "durable-objects", "accessibility", "i18n"]) {
    assert.ok(links.has(`https://demo.wizardgang.ai/demos#${id}`), `Capabilities must link to the ${id} demo`);
  }
  assert.ok(links.has("https://demo.wizardgang.ai/assurance"));
  assert.ok(links.has("https://demo.wizardgang.ai/security"));
});

test("the Projects index introduces each case study and its available live demo", async () => {
  const index = await readDist("projects/index.html");
  requireText(index, ["Projects", "Hexframe"], "projects index");
  for (const slug of PROJECT_SLUGS) {
    assert.ok(anchorWithHref(index, `/projects/${slug}/`), `Projects index must link to ${slug}`);
  }
  for (const { live } of Object.values(PROJECT_LINKS)) {
    if (live) assert.ok(anchorWithHref(index, live), `Projects index must link to live demo ${live}`);
  }
});


test("canonical pages never link through a redirect-only path", async () => {
  const redirectOnly = ["/resume", "/professional", "/software", "/services", "/work", "/contact", "/glossary", "/about/team", "/about/company"];
  for (const relative of canonicalFiles) {
    const html = await readDist(relative);
    for (const anchor of anchors(html)) {
      const path = anchor.href.split(/[?#]/)[0].replace(/\/$/, "");
      assert.ok(!redirectOnly.includes(path), `${relative} links to redirect-only route ${anchor.href}`);
    }
  }
});


test("canonical sitemap inventory is exact and excludes 404 and compatibility routes", async () => {
  const sitemap = await readDist("sitemap.xml");
  const routes = tagBlocks(sitemap, "loc").map(({ inner }) => {
    const url = new URL(textContent(inner));
    assert.equal(url.origin, ORIGIN);
    return url.pathname;
  });
  assert.deepEqual(routes, SITEMAP_ROUTES);
  assert.ok(!routes.includes("/404/"));
});

test("production security headers remain authoritative in public/_headers", async () => {
  const source = await readRoot("public/_headers");
  assert.match(source, /Strict-Transport-Security:\s*max-age=31536000; includeSubDomains/i);
  assert.match(source, /Content-Security-Policy:[^\n]*upgrade-insecure-requests/i);
  assert.match(source, /X-Content-Type-Options:\s*nosniff/i);
  assert.match(source, /X-Frame-Options:\s*DENY/i);
  assert.match(source, /Cache-Control:\s*public, max-age=0, must-revalidate, no-transform/i);
  assert.equal(await readDist("_headers"), source, "a production build must copy the production header authority unchanged");
});

test("local header sanitization removes only HTTPS-only directives from the production authority", async () => {
  const source = await readRoot("public/_headers");
  const sanitized = sanitizeLocalHeadersText(source);
  assert.doesNotMatch(sanitized, /Strict-Transport-Security/i);
  assert.doesNotMatch(sanitized, /upgrade-insecure-requests/i);
  for (const header of [
    "Content-Security-Policy: default-src 'none'",
    "X-Content-Type-Options: nosniff",
    "X-Frame-Options: DENY",
    "Referrer-Policy: strict-origin-when-cross-origin",
    "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy: same-origin",
    "Cache-Control: public, max-age=0, must-revalidate, no-transform"
  ]) assert.ok(sanitized.includes(header), `local sanitization removed security behavior: ${header}`);
  assert.equal(await readRoot("public/_headers"), source, "sanitization must never mutate public/_headers");
});

test("site boundary remains static and retired compliance application routes stay absent", async () => {
  assert.equal(await exists(resolve(dist, "compliance/index.html")), false);
  assert.equal(await exists(resolve(dist, "security/index.html")), false);
  const worker = await readRoot("src/worker/index.ts");
  assert.doesNotMatch(worker, /DurableObject|\bD1\b|\bR2\b|authentication|OPS_TOKEN/);
  assert.equal(await exists(resolve(root, "src/site.mjs")), false);
  const home = await readDist("index.html");
  assert.doesNotMatch(await readDist(browserModulePath(home)), /Compliance — WizardGang|class=["']compliance-/);
});

test("React frontend toolchain owns the shared production shell without becoming an SPA", async () => {
  const pkg = JSON.parse(await readRoot("package.json"));
  const dependencies = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  for (const name of ["typescript", "react", "react-dom", "vite", "@vitejs/plugin-react", "tailwindcss", "@tailwindcss/vite", "@types/react", "@types/react-dom"]) {
    assert.ok(dependencies[name], `frontend toolchain must retain ${name}`);
  }
  for (const name of ["react-router", "next", "remix", "@tanstack/react-start", "astro", "@cloudflare/vite-plugin"]) {
    assert.equal(dependencies[name], undefined, `WG-041 must not introduce ${name}`);
  }

  assert.equal(pkg.scripts.build, "node scripts/build.mjs");
  assert.equal(pkg.scripts.dev, "node scripts/dev.mjs");
  assert.equal(pkg.scripts["build:frontend"], undefined, "duplicate frontend build alias must stay retired");
  assert.match(pkg.scripts["check:frontend"] || "", /typecheck/);
  assert.match(pkg.scripts["check:frontend"] || "", /verify-react-shell/);
  assert.match(pkg.scripts.check || "", /check:frontend/);

  for (const file of ["tsconfig.json", "vite.config.ts", "src/app/Document.tsx", "src/app/contracts.ts", "src/components/SiteChrome.tsx", "src/styles/globals.css"]) {
    assert.equal(await exists(resolve(root, file)), true, `missing frontend authority ${file}`);
  }
  assert.equal(await exists(resolve(root, "src/app/foundation/main.tsx")), false, "WG-038 proof harness must be retired");

  const documentSource = await readRoot("src/app/Document.tsx");
  assert.match(documentSource, /renderToStaticMarkup/);
  assert.doesNotMatch(documentSource, /react-dom\/client|hydrateRoot|createRoot/);

  for (const path of [
    "src/site.mjs",
    "src/projects.mjs",
    "src/professional.mjs",
    "src/professional-systems.mjs",
    "public/assets/site.js",
    "src/styles.css",
    "src/portfolio-cleanup.css",
    "src/pages/Work.tsx",
    "src/pages/Services.tsx",
    "src/pages/Contact.tsx",
    "src/pages/Glossary.tsx",
    "src/pages/CompanyNavigation.tsx",
    "src/components/IntegrationSurfaces.tsx",
    "src/data/glossary.ts",
    "public/sitemap.xml"
  ]) {
    assert.equal(await exists(resolve(root, path)), false, `retired frontend source returned: ${path}`);
  }

  const stylesSource = await readRoot("src/styles/globals.css");
  assert.match(stylesSource, /tailwindcss\/theme\.css/);
  assert.match(stylesSource, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);

  const registrySource = await readRoot("src/app/pageRegistry.ts");
  assert.match(registrySource, /createStaticPageRegistry/);
  for (const authority of ["HOME_PAGE", "SOLUTIONS_PAGE", "createCaseStudyPageDefinitions", "ABOUT_PAGE", "NOT_FOUND_PAGE"]) {
    assert.ok(registrySource.includes(authority), `React page registry missing ${authority}`);
  }
  assert.doesNotMatch(registrySource, /pages\/(?:Work|Services|Contact|Glossary|CompanyNavigation)/, "retired page modules must stay out of the React registry");

  const vite = await readRoot("vite.config.ts");
  assert.match(vite, /ssr:\s*"src\/app\/Document\.tsx"/);
  assert.match(vite, /wizardgang-static-react-shell/);
  assert.match(vite, /tmp\/frontend-shell/);

  const wrangler = await readRoot("wrangler.jsonc");
  assert.match(wrangler, /"main":\s*"src\/worker\/index\.ts"/);
  assert.match(wrangler, /"directory":\s*"\.\/dist"/);
});
