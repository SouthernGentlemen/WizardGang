import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  DEVELOPMENT_VERSION,
  WORKER_ENTRY_RELATIVE,
  renderWorkerEntry,
  resolveWorkerRelease,
} from "../scripts/worker-release.mjs";

const root = new URL("..", import.meta.url);

async function repo(version = "1.3.0") {
  const cwd = await mkdtemp(join(tmpdir(), "wg-release-"));
  const git = (...args) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
  git("init", "-q");
  await writeFile(join(cwd, "package.json"), JSON.stringify({ version }));
  git("add", "package.json");
  git("-c", "user.name=t", "-c", "user.email=t@example.com", "commit", "-qm", "init");
  return { cwd, head: git("rev-parse", "HEAD"), cleanup: () => rm(cwd, { recursive: true, force: true }) };
}

test("a build without WG_VERSION and WG_COMMIT is a development release of the checked-out commit", async () => {
  const { cwd, head, cleanup } = await repo();
  try {
    assert.deepEqual(resolveWorkerRelease({ cwd, env: {} }), { version: DEVELOPMENT_VERSION, commit: head });
  } finally {
    await cleanup();
  }
});

test("deploy-worker's WG_VERSION and WG_COMMIT become the release when they match the checkout", async () => {
  const { cwd, head, cleanup } = await repo("1.3.0");
  try {
    assert.deepEqual(resolveWorkerRelease({ cwd, env: { WG_VERSION: "1.3.0", WG_COMMIT: head } }), { version: "1.3.0", commit: head });
    assert.throws(() => resolveWorkerRelease({ cwd, env: { WG_VERSION: "1.3.0" } }), /set together/);
    assert.throws(() => resolveWorkerRelease({ cwd, env: { WG_COMMIT: head } }), /set together/);
    assert.throws(() => resolveWorkerRelease({ cwd, env: { WG_VERSION: "v1.3.0", WG_COMMIT: head } }), /exact semantic version/);
    assert.throws(() => resolveWorkerRelease({ cwd, env: { WG_VERSION: "1.2.9", WG_COMMIT: head } }), /does not match package\.json/);
    assert.throws(() => resolveWorkerRelease({ cwd, env: { WG_VERSION: "1.3.0", WG_COMMIT: head.slice(0, 12) } }), /full 40-character/);
    assert.throws(() => resolveWorkerRelease({ cwd, env: { WG_VERSION: "1.3.0", WG_COMMIT: "f".repeat(40) } }), /checked-out commit/);
  } finally {
    await cleanup();
  }
});

test("the built Worker entry hands the resolved release to the shell", async () => {
  const entry = await readFile(new URL(WORKER_ENTRY_RELATIVE, root), "utf8");
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  assert.equal(entry, renderWorkerEntry(resolveWorkerRelease({ cwd: new URL(".", root).pathname, env: {} })));
  assert.match(entry, new RegExp(`createSiteWorker\\(\\{"version":"${DEVELOPMENT_VERSION.replaceAll(".", "\\.")}","commit":"${head}"\\}\\)`));
});

test("wrangler deploys the generated entry", async () => {
  const wrangler = await readFile(new URL("wrangler.jsonc", root), "utf8");
  assert.match(wrangler, new RegExp(`^  "main": "${WORKER_ENTRY_RELATIVE}",$`, "m"));
  assert.match(await readFile(new URL(".gitignore", root), "utf8"), /^build\/$/m);
});
