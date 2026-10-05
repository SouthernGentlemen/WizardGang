import assert from "node:assert/strict";
import test from "node:test";
import { createSiteWorker, ROBOTS } from "../src/worker/index.ts";

const SITE = "https://wizardgang.ai";
const RELEASE = { version: "1.3.0", commit: "0123456789abcdef0123456789abcdef01234567" };
const worker = createSiteWorker(RELEASE, { logSink: () => {} });

function assetEnv(calls = []) {
  return {
    WG_APP: "wizardgang",
    ASSETS: {
      fetch: async (request) => {
        calls.push(request);
        return new Response("asset", { status: 200, headers: { "x-asset-fallback": "1" } });
      }
    }
  };
}

async function fetchWorker(path, init = {}, env = assetEnv(), origin = SITE) {
  return worker.fetch(new Request(`${origin}${path}`, init), env, {});
}

const permanentRedirects = [
  ["/github", "https://github.com/Wizard-Gang"],
  ["/github/", "https://github.com/Wizard-Gang"],
  ["/compliance", "https://demo.wizardgang.ai/assurance"],
  ["/compliance/", "https://demo.wizardgang.ai/assurance"],
  ["/accessibility", "https://demo.wizardgang.ai/assurance"],
  ["/accessibility/", "https://demo.wizardgang.ai/assurance"],
  ["/security", "https://demo.wizardgang.ai/security"],
  ["/security/", "https://demo.wizardgang.ai/security"]
];

test("outward shortcut redirects exercise the Worker API with exact current destinations", async (t) => {
  for (const [path, destination] of permanentRedirects) {
    await t.test(path, async () => {
      const response = await fetchWorker(`${path}?source=wg116`);
      assert.equal(response.status, 308);
      assert.equal(response.headers.get("location"), destination);
    });
  }
});

test("retired and removed runtime routes fall through to ASSETS instead of redirecting or proxying", async (t) => {
  const retired = [
    "/work/", "/services/", "/contact/", "/glossary/", "/resume", "/professional",
    "/software/", "/software/projects/", "/software/sharktank/", "/software/integrations/",
    "/solutions/industries/", "/solutions/integrations/", "/solutions/deployments/",
    "/solutions/websites/", "/about/company/", "/about/team/", "/about/team/jacob/",
    "/arena", "/uno", "/x4", "/21", "/checkers", "/battleship",
    "/audit.json", "/audit.jsonl", "/audit/status.json",
    "/audit/game/abc", "/audit/replay/abc/2", "/api", "/api/widgets", "/room/room-7",
    "/php-room", "/php-api", "/php-api/widgets", "/docs/openapi.json", "/openapi.json",
    "/status.json", "/roadmap.json", "/incidents.json", "/spend.json", "/inquiry.json",
    "/logs.json", "/audit/manifest.json", "/policies.json", "/logs/game/match-17.txt",
    "/play", "/play/", "/ts", "/ts/", "/php", "/php/", "/docs", "/docs/",
    "/trust", "/trust/", "/status", "/status/", "/roadmap", "/roadmap/",
    "/incidents", "/incidents/", "/inquiry", "/inquiry/", "/spend", "/spend/",
    "/logs", "/logs/", "/audit", "/audit/", "/policies", "/policies/",
    "/policies/access-control", "/policies/ai/governance"
  ];
  for (const path of retired) {
    await t.test(path, async () => {
      const calls = [];
      const env = assetEnv(calls);
      const request = new Request(`${SITE}${path}?source=wg116`, {
        headers: { "x-fallback-proof": "removed-route" }
      });
      const response = await worker.fetch(request, env, {});
      assert.equal(response.status, 200, "a removed route falls through to the asset handler");
      assert.equal(calls.length, 1, "nothing may intercept it on the way");
      assert.strictEqual(calls[0], request, "asset fallback must receive the original Request object unchanged");
      assert.equal(response.headers.get("location"), null, `${path} must not redirect`);
    });
  }
});

test("ordinary canonical pages and static assets fall through untouched to ASSETS", async () => {
  for (const [url, method] of [[`${SITE}/about/?source=wg116`, "GET"], [`${SITE}/projects/`, "GET"], [`${SITE}/assets/styles.css?v=current`, "HEAD"]]) {
    const calls = [];
    const env = assetEnv(calls);
    const request = new Request(url, { method, headers: { "x-fallback-proof": "1" } });
    const response = await worker.fetch(request, env, {});
    assert.equal(response.status, 200);
    assert.equal(calls.length, 1);
    assert.strictEqual(calls[0], request, "asset fallback must receive the original Request object unchanged");
    assert.equal(calls[0].url, url);
    assert.equal(calls[0].method, method);
    assert.equal(calls[0].headers.get("x-fallback-proof"), "1");
  }
});

test("unknown non-intercepted routes fall through to ASSETS unchanged", async () => {
  const calls = [];
  const env = assetEnv(calls);
  const request = new Request(`${SITE}/not-a-worker-route?source=wg116`, {
    headers: { "x-fallback-proof": "unknown-route" }
  });
  const response = await worker.fetch(request, env, {});

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-asset-fallback"), "1");
  assert.equal(calls.length, 1);
  assert.strictEqual(calls[0], request);
  assert.equal(calls[0].url, request.url);
  assert.equal(calls[0].headers.get("x-fallback-proof"), "unknown-route");
});

test("the shell redirects www.wizardgang.ai to the apex with path and query", async () => {
  for (const path of ["/", "/about/?ref=www", "/github", "/version.json"]) {
    const calls = [];
    const response = await fetchWorker(path, {}, assetEnv(calls), "https://www.wizardgang.ai");
    assert.equal(response.status, 308);
    assert.equal(response.headers.get("location"), `${SITE}${path}`);
    assert.equal(calls.length, 0, "the alias never reaches the site's assets");
  }
});

test("the shell serves /version.json with the Worker identity and the built release", async () => {
  const calls = [];
  const response = await fetchWorker("/version.json", {}, assetEnv(calls));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { app: "wizardgang", ...RELEASE });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(calls.length, 0, "the identity never comes from a static asset");
});

test("the shell serves the site's robots policy", async () => {
  const response = await fetchWorker("/robots.txt");
  assert.equal(response.status, 200);
  assert.equal(await response.text(), ROBOTS);
  assert.match(ROBOTS, /^Sitemap: https:\/\/wizardgang\.ai\/sitemap\.xml$/m);
});

test("foreign hosts, plain-HTTP reads and unconfigured /admin are refused before the site", async () => {
  const calls = [];
  const env = assetEnv(calls);
  assert.equal((await fetchWorker("/", {}, env, "https://wizardgang-portfolio.example.workers.dev")).status, 421);
  const insecure = await fetchWorker("/about/", { headers: { "cf-visitor": '{"scheme":"http"}' } }, env);
  assert.equal(insecure.status, 308);
  assert.equal(insecure.headers.get("location"), `${SITE}/about/`);
  assert.equal((await fetchWorker("/admin", {}, env)).status, 503);
  assert.equal(calls.length, 0);
});

test("site responses carry the shell's security headers", async () => {
  const response = await fetchWorker("/github");
  assert.equal(response.headers.get("strict-transport-security"), "max-age=31536000; includeSubDomains");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
});
