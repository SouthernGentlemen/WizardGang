import assert from "node:assert/strict";
import test from "node:test";
import {
  CANONICAL_PAGES,
  anchors,
  readDist,
  readRoot,
  startTags,
  tagBlocks,
  textContent
} from "./helpers.mjs";

test("every canonical page is complete static HTML composed through the React shell", async (t) => {
  for (const relative of CANONICAL_PAGES.keys()) {
    await t.test(relative, async () => {
      const html = await readDist(relative);
      assert.match(html, /^<!doctype html>/i);
      assert.equal(startTags(html, "html").length, 1);
      assert.equal(tagBlocks(html, "head").length, 1);
      assert.equal(tagBlocks(html, "body").length, 1);
      assert.equal(startTags(html, "header").filter(({ attrs }) => attrs.get("class") === "site-header").length, 1);
      assert.equal(startTags(html, "footer").filter(({ attrs }) => attrs.get("class") === "site-footer").length, 1);
      assert.equal(startTags(html, "main").filter(({ attrs }) => attrs.get("id") === "main").length, 1);
      assert.doesNotMatch(html, /data-wizardgang-legacy-body/);
      assert.doesNotMatch(html, /id=["']root["']|react-dom\/client|hydrateRoot|createRoot/);
    });
  }
});

test("React owns shared chrome and every canonical page body", async () => {
  const documentSource = await readRoot("src/app/Document.tsx");
  const chromeSource = await readRoot("src/components/SiteChrome.tsx");
  const registrySource = await readRoot("src/app/pageRegistry.ts");

  assert.match(documentSource, /<html lang="en">/);
  assert.match(documentSource, /<Metadata /);
  assert.match(documentSource, /<SiteHeader /);
    assert.match(documentSource, /<SiteFooter /);
  assert.match(chromeSource, /<Preferences \/>/, "the preferences gear now lives in the site header");
  assert.match(documentSource, /renderToStaticMarkup/);
  assert.match(documentSource, /createStaticPageRegistry/);

  for (const signal of ["WizardGang home", "Primary mobile", "Preferences", "page-language", "theme-dark", "text-size-200", "play-previews", "WizardGang · Software, systems &amp; integrations", "/version.json"]) {
    assert.ok(chromeSource.includes(signal), `React shell is missing shared contract: ${signal}`);
  }

  for (const authority of ["HOME_PAGE", "SOLUTIONS_PAGE", "PROJECTS_PAGE", "createCaseStudyPageDefinitions", "ABOUT_PAGE", "NOT_FOUND_PAGE"]) {
    assert.ok(registrySource.includes(authority), `React page registry is missing ${authority}`);
  }

  assert.doesNotMatch(registrySource, /pages\/(?:Work|Services|Contact|Glossary|CompanyNavigation)/, "retired page modules must stay out of the React registry");

  for (const path of ["src/site.mjs", "src/styles.css", "src/portfolio-cleanup.css", "public/assets/site.js", "src/pages/Work.tsx", "src/pages/Services.tsx", "src/pages/Contact.tsx"]) {
    await assert.rejects(readRoot(path), { code: "ENOENT" });
  }
});

test("the static shell loads only the generated TypeScript browser module without client React", async () => {
  const html = await readDist("index.html");
  const scriptTags = startTags(html, "script");
  assert.equal(scriptTags.length, 1, "shared shell should load only the generated browser behavior module");
  const source = scriptTags[0].attrs.get("src") || "";
  assert.match(source, /^\/assets\/browser-[A-Za-z0-9_-]+\.js$/);
  assert.equal(scriptTags[0].attrs.get("type"), "module");
  const browserBundle = await readDist(source.slice(1));
  assert.doesNotMatch(browserBundle, /react-dom|hydrateRoot|createRoot/);

  for (const id of ["page-language", "theme-dark", "theme-light", "reading-layout", "text-size-200", "play-previews", "motion-setting-help"]) {
    assert.equal(startTags(html, "input").concat(startTags(html, "select"), startTags(html, "small")).some(({ attrs }) => attrs.get("id") === id), true, `missing browser-script control ${id}`);
  }

  const nav = tagBlocks(html, "nav").find(({ attrs }) => attrs.get("aria-label") === "Primary");
  assert.ok(nav);
  // Solutions and Projects link to their index pages and expose section links.
  assert.deepEqual(
    anchors(nav.inner).map((anchor) => textContent(anchor.inner).replace(/\s+/g, " ").trim()),
    ["Solutions", "Capabilities", "Industries", "Integrations", "Deployments",
     "Projects", "Hexframe", "YarReader", "About"]
  );
});

test("build metadata remains visible in the React footer and version record", async () => {
  const html = await readDist("index.html");
  const version = JSON.parse(await readDist("version.json"));
  const footer = tagBlocks(html, "footer")[0];
  assert.ok(footer);
  const buildLink = anchors(footer.inner).find((anchor) => anchor.href === "/version.json");
  assert.ok(buildLink);
  const buildLabel = version.commit === "development" ? version.commit : version.commit.slice(0, 12);
  assert.equal(textContent(buildLink.inner), `Build ${buildLabel}`);
});

test("the static React document has no legacy body injection seam", async () => {
  const documentSource = await readRoot("src/app/Document.tsx");
  const chromeSource = await readRoot("src/components/SiteChrome.tsx");
  const combined = `${documentSource}\n${chromeSource}`;

  assert.doesNotMatch(combined, /data-wizardgang-legacy-body|data-wizardgang-selected-projects|data-wizardgang-selected-work/);
  assert.doesNotMatch(combined, /dangerouslySetInnerHTML/);
  assert.match(documentSource, /createStaticPageRegistry/);
  assert.match(documentSource, /renderStaticDocuments/);
});

test("watch publication preserves the Wrangler asset root while replacing complete staged output", async () => {
  const viteSource = await readRoot("vite.config.ts");

  assert.match(viteSource, /const publishOut = resolve\(root, "tmp\/frontend-publish"\)/);
  assert.match(viteSource, /await publishStaticTree\(publishOut, dist\)/);
  assert.match(viteSource, /await rename\(temporaryFile, targetFile\)/);
  assert.match(viteSource, /if \(!source\.files\.has\(file\)\) await rm/);
  assert.doesNotMatch(
    viteSource,
    /await rm\(dist,\s*\{\s*recursive:\s*true,\s*force:\s*true\s*\}\)/,
    "watch rebuilds must never remove Wrangler's configured dist asset root"
  );
});
