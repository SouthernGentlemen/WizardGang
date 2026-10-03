import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { projectPath, projects } from "../src/data/projects.ts";
import { professionalProjects, professionalRoles, professionalSkills } from "../src/data/professional.ts";
import { deployments, professionalIntegrationEvidence, professionalSystemEvidence } from "../src/data/professional-systems.ts";
import { CANONICAL_PAGES, readDist, startTags, tagBlocks, walk } from "./helpers.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const readRoot = (path) => readFile(resolve(root, path), "utf8");
const repoPath = (path) => relative(root, path).split("\\").join("/");

const retiredAuthorities = [
  "src/site.mjs",
  "src/projects.mjs",
  "src/professional.mjs",
  "src/professional-systems.mjs",
  "public/assets/site.js",
  "src/styles.css",
  "src/portfolio-cleanup.css",
  "src/app/foundation/main.tsx",
  "scripts/verify-frontend-foundation.mjs",
  "src/data/services.ts"
];

const sourceFiles = (await walk(resolve(root, "src"))).map(repoPath).sort();
const productionTypeScript = sourceFiles.filter((path) => /\.(?:ts|tsx)$/.test(path));
const pageSources = productionTypeScript.filter((path) => path.startsWith("src/pages/"));

async function assertMissing(path) {
  await assert.rejects(access(resolve(root, path)), { code: "ENOENT" }, `${path} is a retired frontend authority and must stay absent`);
}

function assertHttpsUrl(value, label) {
  const url = new URL(value);
  assert.equal(url.protocol, "https:", `${label} must use HTTPS`);
}

test("retired frontend authorities stay absent and src remains TypeScript-first", async () => {
  for (const path of retiredAuthorities) await assertMissing(path);

  const applicationMjs = sourceFiles.filter((path) => path.endsWith(".mjs"));
  assert.deepEqual(applicationMjs, [], `authored application .mjs files are not allowed under src/: ${applicationMjs.join(", ")}`);

  const checkedInHtml = sourceFiles.filter((path) => path.endsWith(".html"));
  assert.deepEqual(checkedInHtml, [], `canonical HTML must be generated, not authored under src/: ${checkedInHtml.join(", ")}`);

  for (const path of productionTypeScript) {
    const source = await readRoot(path);
    assert.doesNotMatch(source, /dangerouslySetInnerHTML/, `${path} must not restore raw legacy page rendering`);
    assert.doesNotMatch(source, /@ts-ignore\b/, `${path} must not bypass TypeScript with @ts-ignore`);
    assert.doesNotMatch(source, /@ts-nocheck\b/, `${path} must not bypass TypeScript with @ts-nocheck`);
    assert.doesNotMatch(source, /\bas\s+any\b/, `${path} must not add an unchecked 'as any' escape hatch`);
  }
});

test("TypeScript, build, Worker, and dependency authorities are explicit", async () => {
  const pkg = JSON.parse(await readRoot("package.json"));
  const tsconfig = JSON.parse(await readRoot("tsconfig.json"));
  const wrangler = await readRoot("wrangler.jsonc");
  const verify = await readRoot("scripts/verify.mjs");
  const build = await readRoot("scripts/build.mjs");

  assert.equal(tsconfig.compilerOptions.strict, true, "production TypeScript must remain strict");
  assert.equal(tsconfig.compilerOptions.allowJs, false, "production application source must not fall back to JavaScript");
  for (const include of ["src/**/*.ts", "src/**/*.tsx", "vite.config.ts"]) {
    assert.ok(tsconfig.include.includes(include), `tsconfig must include ${include}`);
  }

  assert.equal(pkg.scripts.build, "node scripts/build.mjs", "npm run build must remain the single production build entry");
  assert.match(pkg.scripts["check:frontend"], /npm run typecheck/);
  assert.match(pkg.scripts["check:frontend"], /npm run build/);
  assert.match(pkg.scripts.check, /node scripts\/verify\.mjs/);
  assert.equal(pkg.scripts["test:frontend-authority"], "node --test tests/frontend-authority.test.mjs");
  assert.match(verify, /endsWith\("\.test\.mjs"\)/, "npm run check must execute every focused acceptance test");
  assert.match(build, /from "vite"/);
  assert.match(build, /vite\.config\.ts/);

  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const forbidden of ["react-router-dom", "next", "@remix-run/react", "@remix-run/node"]) {
    assert.equal(dependencies[forbidden], undefined, `${forbidden} requires a separate intentional architecture change`);
  }

  assert.match(wrangler, /"main"\s*:\s*"src\/worker\/index\.ts"/, "Wrangler must use the TypeScript Worker authority");
  await access(resolve(root, "src/worker/index.ts"));
  assert.deepEqual(sourceFiles.filter((path) => path.startsWith("src/worker/") && path.endsWith(".mjs")), []);
  await access(resolve(root, "tests/worker-routing.test.mjs"));
  await access(resolve(root, "tests/dev-lifecycle.test.mjs"));
});

test("canonical page inventory remains owned by the typed React registry", async () => {
  const registry = await readRoot("src/app/pageRegistry.ts");
  const document = await readRoot("src/app/Document.tsx");
  const vite = await readRoot("vite.config.ts");

  for (const authority of [
    "HOME_PAGE",
    "SOLUTIONS_PAGE",
    "PROJECTS_PAGE",
    "createCaseStudyPageDefinitions",
    "ABOUT_PAGE",
    "NOT_FOUND_PAGE"
  ]) {
    assert.ok(registry.includes(authority), `typed page registry is missing ${authority}`);
  }
  assert.match(registry, /Duplicate generated route/, "typed registry must reject duplicate output locations");
  assert.doesNotMatch(registry, /pages\/(?:Work|Services|Contact|Glossary|CompanyNavigation)/, "retired page modules must not return to the registry");

  assert.match(document, /renderToStaticMarkup/, "canonical documents must be complete static React HTML");
  assert.match(document, /createStaticPageRegistry/, "Document must render from the typed page registry");
  assert.match(document, /renderStaticDocuments/, "Vite must consume the shared static-document renderer");
  assert.doesNotMatch(document, /react-dom\/client|hydrateRoot|createRoot/, "canonical documents must not depend on client React hydration");

  assert.match(vite, /ssr:\s*"src\/app\/Document\.tsx"/, "Vite must build the React static renderer");
  assert.match(vite, /renderer\.renderStaticDocuments\(/, "Vite must publish pages through the shared React renderer");
  assert.match(vite, /src\/browser\/index\.ts/, "Vite must own the TypeScript browser entry");
  assert.match(vite, /src\/styles\/globals\.css/, "Vite must watch the current stylesheet authority");
  assert.doesNotMatch(vite, /siteModule|legacyPages|renderDocument\(/, "legacy page-generation seams must stay retired");

  const expected = new Set([
    "index.html",
    "solutions/index.html",
    "projects/index.html",
    "projects/hexframe/index.html",
    "projects/yarreader/index.html",
    "about/index.html",
    "404.html"
  ]);
  assert.deepEqual(new Set(CANONICAL_PAGES.keys()), expected, "WG-037 behavioral coverage and current typed route authority have drifted");
  assert.equal(expected.size, 7, "six canonical pages plus the generated 404");

  for (const [file] of CANONICAL_PAGES) {
    const html = await readDist(file);
    assert.equal(tagBlocks(html, "main").length, 1, `${file} must contain complete static main content`);
    assert.equal(tagBlocks(html, "h1").length, 1, `${file} must contain its H1 before browser JavaScript runs`);
  }
});

test("shared shell, metadata, navigation, browser enhancement, and CSP-safe output have one authority", async () => {
  const document = await readRoot("src/app/Document.tsx");
  const chrome = await readRoot("src/components/SiteChrome.tsx");
  const navigation = await readRoot("src/app/navigation.ts");
  const browser = await readRoot("src/browser/index.ts");

  assert.match(document, /function Metadata\(/, "shared Document must own page metadata");
  assert.match(document, /<SiteHeader current=/);
  assert.match(document, /<SiteFooter build=/);
  assert.match(chrome, /import \{ NAVIGATION_ITEMS \} from "\.\.\/app\/navigation"/, "shared chrome must consume the typed navigation authority");
  assert.match(navigation, /export const NAVIGATION_ITEMS/, "navigation must have one typed source");
  assert.match(navigation, /navigationSectionForPath/, "current-section matching must remain centralized");
  for (const label of ["Solutions", "Projects", "About"]) {
    assert.ok(navigation.includes(`label: "${label}"`), `current navigation authority is missing ${label}`);
  }
  for (const retiredLabel of ["Work", "Services", "Contact", "Software", "Glossary", "GitHub"]) {
    assert.ok(!navigation.includes(`label: "${retiredLabel}"`), `retired top-level navigation item restored: ${retiredLabel}`);
  }
  assert.match(browser, /initializeBrowserBehavior/);

  for (const path of pageSources) {
    const source = await readRoot(path);
    assert.doesNotMatch(source, /<head\b|<title\b|<meta\b/i, `${path} must not define a parallel metadata/head authority`);
  }

  const browserAssets = new Set();
  for (const [file] of CANONICAL_PAGES) {
    const html = await readDist(file);
    assert.equal(startTags(html, "header").filter(({ attrs }) => (attrs.get("class") || "").split(/\s+/).includes("site-header")).length, 1, `${file} must use the shared Header`);
    assert.ok(tagBlocks(html, "nav").length >= 2, `${file} must contain shared desktop and mobile navigation`);
    assert.equal(tagBlocks(html, "footer").length, 1, `${file} must use the shared Footer`);
    assert.match(html, /class="skip-link"[^>]*href="#main"/, `${file} must preserve the skip link`);
    assert.match(html, /aria-label="Display and language preferences"/, `${file} must preserve the shared preferences control`);

    const scripts = startTags(html, "script");
    assert.equal(scripts.length, 1, `${file} must load exactly one browser module`);
    assert.equal(scripts[0].attrs.get("type"), "module");
    const src = scripts[0].attrs.get("src") || "";
    assert.match(src, /^\/assets\/browser-[A-Za-z0-9_-]+\.js$/, `${file} must load the Vite TypeScript browser entry`);
    browserAssets.add(src);

    assert.equal(startTags(html, "style").length, 0, `${file} must not contain inline style elements`);
    assert.doesNotMatch(html, /\sstyle\s*=/i, `${file} must not contain inline style attributes`);
    assert.doesNotMatch(html, /\son[a-z]+\s*=/i, `${file} must not contain inline event handlers`);
    assert.doesNotMatch(html, /(?:href|src)\s*=\s*["']javascript:/i, `${file} must not contain javascript: URLs`);
  }

  assert.equal(browserAssets.size, 1, "all canonical pages must share one generated browser-behavior asset");
  const browserAsset = [...browserAssets][0];
  const bundle = await readDist(browserAsset.slice(1));
  assert.doesNotMatch(bundle, /react-dom|hydrateRoot|createRoot/, "browser enhancement must not become whole-site React hydration");
});

test("typed data and styling authorities remain singular and internally valid", async () => {
  const slugs = projects.map((project) => project.slug);
  assert.equal(new Set(slugs).size, slugs.length, "project slugs must be unique");
  const projectPaths = projects.map((project) => projectPath(project.slug));
  assert.equal(new Set(projectPaths).size, projectPaths.length, "project paths must be unique");
  for (const path of projectPaths) assert.match(path, /^\/projects\/[a-z]+\/$/, "a project is a page under /projects/");
  for (const project of projects) {
    assertHttpsUrl(project.sourceUrl, `${project.slug} sourceUrl`);
    if (project.liveUrl) assertHttpsUrl(project.liveUrl, `${project.slug} liveUrl`);
    if (project.operationsUrl) assertHttpsUrl(project.operationsUrl, `${project.slug} operationsUrl`);
  }

  assert.ok(professionalRoles.length > 0);
  assert.ok(professionalProjects.length > 0);
  assert.ok(professionalSkills.length > 0);
  assert.equal(new Set(professionalIntegrationEvidence.map((group) => group.title)).size, professionalIntegrationEvidence.length, "integration group titles must be unique");
  assert.equal(new Set(professionalSystemEvidence.map((group) => group.title)).size, professionalSystemEvidence.length, "system group titles must be unique");
  for (const deployment of deployments) assertHttpsUrl(deployment.url, `deployment ${deployment.name}`);
  for (const group of professionalIntegrationEvidence) {
    for (const item of group.items) if (item.url) assertHttpsUrl(item.url, `${group.title}: ${item.name}`);
  }

  const cssFiles = sourceFiles.filter((path) => path.endsWith(".css"));
  assert.deepEqual(
    cssFiles,
    ["src/styles/globals.css", "src/styles/tokens.css"],
    "authored production CSS is exactly the token authority and the presentation authority"
  );

  // tokens.css owns the design system; it must not grow into a second place
  // where presentation is decided, so it may declare only custom properties
  // and the self-hosted faces.
  const tokens = await readRoot("src/styles/tokens.css");
  const tokenRules = tokens.replace(/@font-face\s*\{[^}]*\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const tokenSelectors = [...new Set([...tokenRules.matchAll(/([^{}]+)\{/g)].map((match) => match[1].trim()))];
  assert.deepEqual(tokenSelectors, [":root"], "tokens.css may only declare :root custom properties alongside @font-face");
  for (const declaration of tokenRules.matchAll(/([a-z-]+)\s*:/g)) {
    const property = declaration[1];
    if (property === "color-scheme") continue;
    assert.match(property, /^--/, `tokens.css must declare only custom properties, found ${property}`);
  }

  const globals = await readRoot("src/styles/globals.css");
  assert.match(globals, /@import "\.\/tokens\.css";/, "the presentation authority must consume the token authority");

  const document = await readRoot("src/app/Document.tsx");
  const vite = await readRoot("vite.config.ts");
  assert.match(document, /import "\.\.\/styles\/globals\.css"/);
  assert.match(vite, /tailwindcss\(\)/, "Tailwind must remain in the Vite styling pipeline");
  assert.match(vite, /assets\/styles\.css/, "Vite must publish the production stylesheet");
});

test("generated-output and production/local header boundaries stay protected", async () => {
  const ignore = await readRoot(".gitignore");
  assert.match(ignore, /^dist\/$/m, "dist must remain generated and ignored");
  assert.match(ignore, /^tmp\/$/m, "temporary frontend/dev output must remain generated and ignored");

  const headers = await readRoot("public/_headers");
  assert.match(headers, /Strict-Transport-Security:/i, "production headers must retain HSTS");
  assert.match(headers, /upgrade-insecure-requests/i, "production CSP must retain HTTPS upgrade behavior");
  assert.match(headers, /script-src 'self'/i, "production CSP must keep first-party script authority explicit");

  const styles = startTags(await readDist("index.html"), "link")
    .filter(({ attrs }) => (attrs.get("rel") || "").split(/\s+/).includes("stylesheet"));
  assert.equal(styles.length, 1, "production HTML must reference exactly one built stylesheet");
  assert.match(styles[0].attrs.get("href") || "", /^\/assets\/styles\.css\?v=/);
});
