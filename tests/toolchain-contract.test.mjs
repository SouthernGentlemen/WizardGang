import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function source(path) {
  return await readFile(resolve(root, path), "utf8");
}

test("shared Node and npm toolchain authority is explicit and strict", async () => {
  const nodeVersion = (await source(".node-version")).trim();
  const npmrc = await source(".npmrc");
  const pkg = JSON.parse(await source("package.json"));
  const lock = JSON.parse(await source("package-lock.json"));

  assert.equal(nodeVersion, "26.10.0");
  assert.equal(pkg.packageManager, "npm@12.1.0");
  assert.deepEqual(pkg.engines, { node: "26.x", npm: "12.x" });
  assert.deepEqual(lock.packages[""].engines, pkg.engines);

  assert.match(npmrc, /^engine-strict=true$/m);
  assert.match(npmrc, /^strict-allow-scripts=true$/m);
  assert.doesNotMatch(npmrc, /dangerously-allow-all-scripts\s*=\s*true/i);
  assert.doesNotMatch(npmrc, /^ignore-scripts\s*=\s*true$/mi);
});

test("every locked install script is explicitly reviewed at its locked version", async () => {
  const pkg = JSON.parse(await source("package.json"));
  const lock = JSON.parse(await source("package-lock.json"));

  const reviewed = Object.entries(pkg.allowScripts ?? {})
    .filter(([, allowed]) => allowed === true)
    .map(([identity]) => identity)
    .sort();

  const scripted = Object.entries(lock.packages ?? {})
    .filter(([path, metadata]) => path.startsWith("node_modules/") && metadata?.hasInstallScript === true)
    .map(([path, metadata]) => `${path.slice("node_modules/".length)}@${metadata.version}`)
    .sort();

  assert.deepEqual(reviewed, [
    "esbuild@0.28.2",
    "fsevents@2.3.3",
    "workerd@1.20261006.1"
  ]);
  assert.deepEqual(scripted, reviewed);
});

test("Node runtime typings align with the Node 26 toolchain", async () => {
  const pkg = JSON.parse(await source("package.json"));
  const lock = JSON.parse(await source("package-lock.json"));

  assert.equal(pkg.devDependencies["@types/node"], "26.6.3");
  assert.equal(lock.packages[""].devDependencies["@types/node"], "26.6.3");
  assert.equal(lock.packages["node_modules/@types/node"].version, "26.6.3");
  assert.equal(lock.packages["node_modules/undici-types"].version, "8.9.0");
});
