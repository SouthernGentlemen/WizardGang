import assert from "node:assert/strict";
import test from "node:test";
import worker from "../src/worker/index.ts";

const SITE = "https://wizardgang.ai";

function assetEnv(calls = []) {
  return {
    ASSETS: {
      fetch: async (request) => {
        calls.push(request);
        return new Response("asset", { status: 200, headers: { "x-asset-fallback": "1" } });
      }
    }
  };
}

async function fetchWorker(path, init = {}, env = assetEnv()) {
  return worker.fetch(new Request(`${SITE}${path}`, init), env);
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
    "/admin", "/admin/users", "/audit.json", "/audit.jsonl", "/audit/status.json",
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
      const response = await worker.fetch(request, env);
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
    const response = await worker.fetch(request, env);
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
  const response = await worker.fetch(request, env);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-asset-fallback"), "1");
  assert.equal(calls.length, 1);
  assert.strictEqual(calls[0], request);
  assert.equal(calls[0].url, request.url);
  assert.equal(calls[0].headers.get("x-fallback-proof"), "unknown-route");
});
