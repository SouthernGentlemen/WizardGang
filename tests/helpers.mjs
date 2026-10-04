import { access, readFile, readdir } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const dist = resolve(root, "dist");

export const CANONICAL_PAGES = new Map([
  ["index.html", "/"],
  ["solutions/index.html", "/solutions/"],
  ["projects/index.html", "/projects/"],
  ["projects/hexframe/index.html", "/projects/hexframe/"],
  ["about/index.html", "/about/"],
  ["404.html", null]
]);

export const SITEMAP_ROUTES = [
  "/",
  "/solutions/",
  "/projects/",
  "/projects/hexframe/",
  "/about/"
];

export const PROJECT_SLUGS = ["hexframe"];

export const PROJECT_LINKS = {
  hexframe: {
    source: "https://github.com/Wizard-Gang/Hexframe",
    live: "https://hexframe.wizardgang.ai/play/"
  }
};

export async function walk(directory, { ignore = new Set() } = {}) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignore.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path, { ignore }));
    else files.push(path);
  }
  return files;
}

export async function generatedHtmlFiles() {
  return (await walk(dist))
    .filter((path) => extname(path).toLowerCase() === ".html")
    .map(relativeFromDist)
    .sort();
}

export const readDist = (path) => readFile(resolve(dist, path), "utf8");
export const readRoot = (path) => readFile(resolve(root, path), "utf8");

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/gi, "'");
}

export function attributes(source = "") {
  const result = new Map();
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    result.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

export function startTags(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>`, "gi");
  return [...html.matchAll(pattern)].map((match) => ({ raw: match[0], attrs: attributes(match[1]) }));
}

export function tagBlocks(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  return [...html.matchAll(pattern)].map((match) => ({ raw: match[0], attrs: attributes(match[1]), inner: match[2] }));
}

export function textContent(source) {
  return source
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function metaContent(html, attribute, value) {
  const tag = startTags(html, "meta").find(({ attrs }) => attrs.get(attribute) === value);
  const content = tag?.attrs.get("content");
  return content === undefined ? null : decodeHtmlEntities(content);
}

export function linkByRel(html, rel) {
  return startTags(html, "link").find(({ attrs }) => {
    const values = (attrs.get("rel") || "").split(/\s+/).filter(Boolean);
    return values.includes(rel);
  }) ?? null;
}

export function anchors(html) {
  return tagBlocks(html, "a").map((block) => ({
    ...block,
    href: block.attrs.get("href") || "",
    label: block.attrs.get("aria-label") || textContent(block.inner)
  }));
}

export function findAnchor(html, predicate) {
  return anchors(html).find(predicate);
}

export function internalTarget(href, currentRelative = "index.html") {
  if (!href || href.startsWith("//")) return null;
  if (href.startsWith("#")) {
    return { relative: currentRelative, fragment: decodeFragment(href.slice(1)) };
  }
  if (!href.startsWith("/")) return null;
  const url = new URL(href, "https://wizardgang.ai");
  const pathname = url.pathname;
  let target;
  if (pathname === "/") target = "index.html";
  else if (extname(pathname)) target = pathname.slice(1);
  else target = `${pathname.replace(/^\//, "").replace(/\/$/, "")}/index.html`;
  return { relative: target, fragment: decodeFragment(url.hash.slice(1)) };
}

function decodeFragment(fragment) {
  if (!fragment) return "";
  try { return decodeURIComponent(fragment); }
  catch { return fragment; }
}

export async function exists(path) {
  try { await access(path); return true; }
  catch { return false; }
}

export function relativeFromDist(path) {
  return relative(dist, path).split("\\").join("/");
}
