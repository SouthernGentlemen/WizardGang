import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const docsRoot = resolve(root, "docs");

async function currentDocs() {
  const names = (await readdir(docsRoot)).filter((name) => name.endsWith(".md")).sort();
  return ["README.md", "SECURITY.md", ...names.map((name) => `docs/${name}`)];
}

async function source(path) {
  return readFile(resolve(root, path), "utf8");
}

test("current documentation corpus has one purpose per active document", async () => {
  assert.deepEqual(
    await currentDocs(),
    [
      "README.md",
      "SECURITY.md",
      "docs/ACCESSIBILITY.md",
      "docs/COMPLIANCE.md",
      "docs/INFORMATION-ARCHITECTURE.md",
      "docs/OWNERSHIP.md"
    ]
  );
  await assert.rejects(access(resolve(root, "docs/BOUNDARY-MIGRATION.md")), { code: "ENOENT" });
});

test("current docs do not restore migration-era frontend authorities or controlled-change planning", async () => {
  const forbidden = [
    "src/site.mjs",
    "src/projects.mjs",
    "src/professional.mjs",
    "src/professional-systems.mjs",
    "public/assets/site.js",
    "portfolio-cleanup.css",
    "Approved implementation sequence",
    "future-state information architecture"
  ];

  for (const path of await currentDocs()) {
    const text = await source(path);
    for (const value of forbidden) {
      assert.ok(!text.includes(value), `${path} contains retired current-state documentation reference: ${value}`);
    }
    assert.doesNotMatch(text, /\bWG-\d{3}\b/, `${path} must describe current state instead of controlled-change history`);
  }
});

test("README documents the current entry points and acceptance gate", async () => {
  const readme = await source("README.md");
  for (const value of [
    "company site for WizardGang",
    "npm ci",
    "npm run dev",
    "http://127.0.0.1:8790",
    "WIZARDGANG_PORT",
    "npm run build",
    "npm run check",
    "npm run test:accessibility",
    "npm run test:frontend-authority",
    "npm run test:docs",
    "src/app/pageRegistry.ts",
    "src/app/navigation.ts",
    "src/styles/tokens.css",
    "src/worker/index.ts",
    "public/_headers",
    "dist/_headers"
  ]) assert.ok(readme.includes(value), `README is missing current contract: ${value}`);

  // The canonical pages, and nothing a retired structure left behind.
  for (const route of [
    "/solutions/",
    "/projects/",
    "/projects/sharktank/",
    "/projects/hexframe/",
    "/projects/yarreader/",
    "/about/"
  ]) {
    assert.ok(readme.includes(route), `README must document the canonical route ${route}`);
  }
  for (const retired of ["/work/", "/services/", "/contact/", "/software/", "/solutions/websites/", "/glossary/"]) {
    assert.ok(!readme.includes(`\n${retired}`), `README must not present the retired route ${retired} as canonical`);
  }
});

test("information architecture documents current company ownership and static-first constraints", async () => {
  const ia = await source("docs/INFORMATION-ARCHITECTURE.md");
  for (const value of [
    "Status: current-state authority",
    "/solutions/",
    "/projects/sharktank/",
    "/about/",
    "demo.wizardgang.ai",
    "src/app/pageRegistry.ts",
    "src/app/navigation.ts",
    "src/styles/tokens.css",
    "There is no SPA router",
    "public/_headers",
    "npm run check"
  ]) assert.ok(ia.includes(value), `information architecture is missing current contract: ${value}`);

  // Compatibility redirects are retired; the doc has to say the paths are dead.
  assert.match(ia, /Compatibility redirects have been retired/, "the retirement decision must be documented");
  assert.match(ia, /fall through to the ordinary 404/, "dead paths must be documented as dead");
  assert.match(ia, /none of them were ever\npages on this site/, "the surviving redirects must be justified");
  assert.match(ia, /sitemap\.xml` is a projection of it/, "the sitemap must be documented as derived, not maintained");
  assert.match(ia, /only `:root` custom properties and `@font-face`/, "the token authority's limit must be documented");
  assert.match(ia, /menus that open on hover or keyboard focus/, "the navigation behavior must be documented");
  assert.match(ia, /at most one preview runs at a time/, "the preview motion contract must be documented");
  assert.match(ia, /employment rather than WizardGang client work/, "the attribution boundary must be documented where the evidence lives");
  assert.match(ia, /zero horizontal overflow/, "the 200% text contract must be documented");
});

test("relative Markdown documentation links resolve", async () => {
  for (const path of await currentDocs()) {
    const text = await source(path);
    for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const raw = match[1].trim();
      if (!raw || /^(?:https?:|mailto:|#)/i.test(raw)) continue;
      const target = decodeURIComponent(raw.split("#", 1)[0]);
      if (!target) continue;
      const absolute = resolve(root, dirname(path), target);
      await assert.doesNotReject(access(absolute), `${path} links to missing documentation target ${raw}`);
    }
  }
});


test("root governance contract retains the permanent queue and product boundaries", async () => {
  for (const path of ["AGENTS.md", "CONTRIBUTING.md", "implementation_plan.md", "LICENSE.md"]) {
    await assert.doesNotReject(access(resolve(root, path)), `${path} must exist`);
  }

  const agents = await source("AGENTS.md");
  const contributing = await source("CONTRIBUTING.md");
  const license = await source("LICENSE.md");
  const plan = await source("implementation_plan.md");
  const readme = await source("README.md");

  assert.match(agents, /implementation_plan\.md/, "automation contract must name the active queue");
  assert.match(agents, /first open task/i, "automation contract must define first-open-task selection");
  assert.match(agents, /npm run check/, "automation contract must identify canonical acceptance");
  assert.match(agents, /queue is empty/i, "automation contract must define empty-queue semantics");
  assert.match(agents, /squash/i, "automation contract must require squash delivery");

  assert.match(contributing, /\[AGENTS\.md\]\(AGENTS\.md\)/, "contributor guide must point to the automation contract");
  assert.match(contributing, /npm run check/, "contributor guide must identify canonical acceptance");
  assert.match(contributing, /SECURITY\.md/, "contributor guide must point security reports to the security policy");
  assert.match(contributing, /implementation_plan\.md/, "contributor guide must identify the permanent queue");

  assert.match(license, /No repository-wide open-source license is granted/i, "license boundary must not invent an open-source grant");
  assert.match(license, /SIL Open Font License 1\.1/, "license boundary must preserve the font license");
  assert.match(license, /third-party names and marks remain the property of their respective owners/i, "license boundary must preserve third-party mark ownership");

  assert.match(plan, /^# Implementation plan\n\n## Open tasks\n/);
  if (!/^### WG-\d{3} — /m.test(plan)) {
    assert.match(plan, /The queue is empty\. Select no implementation task\./);
  }
  for (const value of ["Cloudflare-only", "WG-NNN", "verify", "change-id"]) {
    assert.ok(readme.includes(value), `README must retain WizardGang-specific authority: ${value}`);
  }
});
