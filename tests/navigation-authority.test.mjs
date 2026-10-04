import assert from "node:assert/strict";
import test from "node:test";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { NAVIGATION_ITEMS, navigationSectionForPath } from "../src/app/navigation.ts";
import { CANONICAL_PAGES, anchors, generatedHtmlFiles, linkByRel, readDist, readRoot, tagBlocks, textContent } from "./helpers.mjs";

const expectedNavigation = [
  {
    key: "solutions",
    label: "Solutions",
    href: "/solutions/",
    items: [
      { label: "Capabilities", href: "/solutions/#capabilities" },
      { label: "Industries", href: "/solutions/#industries" },
      { label: "Integrations", href: "/solutions/#integrations" },
      { label: "Deployments", href: "/solutions/#deployments" }
    ]
  },
  {
    key: "projects",
    label: "Projects",
    href: "/projects/",
    items: [
      { label: "Hexframe", href: "/projects/hexframe/" },
    ]
  },
  { key: "about", label: "About", href: "/about/" }
];

test("typed company navigation is exact and current-section matching is centralized", () => {
  assert.deepEqual(
    NAVIGATION_ITEMS.map((item) => ({
      key: item.key,
      label: item.label,
      href: item.href,
      ...("items" in item && item.items ? { items: item.items.map(({ label, href }) => ({ label, href })) } : {})
    })),
    expectedNavigation
  );

  const cases = new Map([
    ["/", ""],
    ["/solutions/", "solutions"],
    ["/projects/hexframe/", "projects"],
    ["/about/", "about"],
    ["/about/team/jacob/", "about"],
    ["/software/", ""],
    ["/work/", ""],
    ["/services/", ""],
    ["/contact/", ""],
    ["/glossary/", ""]
  ]);

  for (const [path, expected] of cases) {
    assert.equal(navigationSectionForPath(path), expected, `unexpected primary section for ${path}`);
  }
});

test("shared shell consumes company navigation without restoring portfolio-first items", async () => {
  const chrome = await readRoot("src/components/SiteChrome.tsx");
  const document = await readRoot("src/app/Document.tsx");
  const browserNavigation = await readRoot("src/browser/navigation.ts");

  assert.match(chrome, /import \{ NAVIGATION_ITEMS \} from "\.\.\/app\/navigation"/);
  assert.match(document, /navigationSectionForPath\(page\.metadata\.path\)/);
  assert.match(chrome, /type="button"/);
  assert.match(chrome, /aria-controls=\{MOBILE_NAVIGATION_ID\}/);
  assert.match(browserNavigation, /setAttribute\("aria-expanded"/);
  assert.match(browserNavigation, /toggle\.addEventListener\("click"/);
  assert.match(browserNavigation, /mobileNav\.hidden/);

  for (const retired of [
    '{ key: "projects", href: "/projects/", label: "Projects" }',
    '{ key: "work", href: "/work/", label: "Work" }',
    'label: "Contact"',
    'label: "GitHub"'
  ]) {
    assert.ok(!chrome.includes(retired), `shared Header restored retired nav contract: ${retired}`);
  }
});

test("every generated page exposes exact desktop/mobile company navigation and approved fallback access", async () => {
  for (const relative of await generatedHtmlFiles()) {
    const html = await readDist(relative);
    const primary = tagBlocks(html, "nav").find(({ attrs }) => attrs.get("aria-label") === "Primary");
    const mobile = tagBlocks(html, "nav").find(({ attrs }) => attrs.get("aria-label") === "Primary mobile");
    assert.ok(primary, `${relative} missing desktop primary navigation`);
    assert.ok(mobile, `${relative} missing mobile primary navigation`);

    // A menu contributes its children; a plain item contributes itself.
    // A menu contributes its own label link first, then its children.
    const expectedPairs = expectedNavigation.flatMap((item) =>
      item.items
        ? [[item.label, item.href], ...item.items.map(({ label, href }) => [label, href])]
        : [[item.label, item.href]]
    );
    for (const nav of [primary, mobile]) {
      assert.deepEqual(
        anchors(nav.inner).map((anchor) => [textContent(anchor.inner).replace(/\s+/g, " ").trim(), anchor.href]),
        expectedPairs,
        `${relative} navigation does not match the typed company contract`
      );
    }

    const canonical = linkByRel(html, "canonical")?.attrs.get("href") ?? "";
    const route = canonical ? new URL(canonical, "https://wizardgang.ai").pathname : "";
    const expectedCurrent = route ? navigationSectionForPath(route) : "";
    const currentMarks = [...primary.inner.matchAll(/aria-current="location"/g)].length;
    assert.equal(currentMarks, expectedCurrent ? 1 : 0, `${relative} has incorrect aria-current count`);

    const allAnchors = anchors(html);
    assert.ok(allAnchors.some((anchor) => anchor.href === "/" && anchor.attrs.get("aria-label") === "WizardGang home"), `${relative} missing WizardGang home link`);
    assert.ok(allAnchors.some((anchor) => anchor.href === "mailto:jacob@wizardgang.ai"), `${relative} missing contact access`);
    assert.ok(allAnchors.some((anchor) => anchor.href === "https://github.com/Wizard-Gang" && anchor.attrs.get("aria-label") === "Visit WizardGang on GitHub"), `${relative} missing organization GitHub access`);
  }
});

test("every primary navigation destination is a generated canonical page", async () => {
  for (const item of NAVIGATION_ITEMS) {
    const relative = `${item.href.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
    assert.ok(CANONICAL_PAGES.has(relative), `${item.href} is not in the generated canonical inventory`);
    await access(resolve("dist", relative));
  }
});
