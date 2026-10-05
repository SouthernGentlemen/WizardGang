import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const workflow = readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
const lock = JSON.parse(readFileSync(new URL("../platform/vendor.lock.json", import.meta.url), "utf8"));
const BASELINE_DEPLOY = /^    uses: Wizard-Gang\/baseline\/\.github\/workflows\/deploy-worker\.yml@([0-9a-f]{40})$/m;

function jobBlock(jobName) {
  const start = new RegExp(`^  ${jobName}:\\s*$`, "m").exec(workflow);
  if (!start) return "";
  const after = workflow.slice(start.index + start[0].length);
  const next = /^  [A-Za-z0-9_-]+:\s*$/m.exec(after);
  return next ? after.slice(0, next.index) : after;
}

test("the checkout owns no production deploy command and no Cloudflare token tooling", () => {
  for (const name of Object.keys(packageJson.scripts)) {
    assert.doesNotMatch(name, /^deploy:(?:production|staging)|^secrets:cloudflare/, `${name} must not exist`);
  }
  for (const [name, command] of Object.entries(packageJson.scripts)) {
    if (/wrangler deploy/.test(command)) assert.match(command, /--dry-run/, `${name} may only dry-run a deploy`);
  }
  for (const file of ["discover-cloudflare-api-token-targets.sh", "rotate-cloudflare-api-token.sh", "production-deployment-identity.mjs"]) {
    assert.equal(existsSync(new URL(`../scripts/${file}`, import.meta.url)), false, `scripts/${file} belongs to baseline`);
  }
});

test("npm run check runs the vendored pin and wrangler conformance checks", () => {
  assert.equal(packageJson.scripts["check:platform"],
    "node platform/conformance/cli.mjs pin && node platform/conformance/cli.mjs wrangler --worker wizardgang");
  assert.match(packageJson.scripts.check, /(?:^|&& )npm run check:platform &&/);
});

test("production deploys only through baseline's pinned deploy-worker workflow after the Release", () => {
  const release = jobBlock("release");
  const deploy = jobBlock("deploy-production");
  assert.ok(release, "CI must define release publication");
  assert.ok(deploy, "CI must define the production deploy call");
  assert.match(deploy, /^    needs: \[verify, release-tag, release\]$/m);
  assert.match(deploy, /needs\.release\.result == 'success'/);
  assert.match(deploy, /needs\.release-tag\.outputs\.tag != ''/);
  assert.match(deploy, /github\.event_name == 'workflow_dispatch' && github\.ref == 'refs\/heads\/main'/);
  assert.match(deploy, /^    permissions:\n      contents: read$/m);

  const pinned = BASELINE_DEPLOY.exec(deploy);
  assert.ok(pinned, "the deploy job must call deploy-worker.yml pinned to a full baseline commit");
  assert.equal(pinned[1], lock.commit, "the workflow pin and the vendored platform/ come from the same baseline commit");
  assert.match(deploy, /^    with:\n      worker: wizardgang\n/m);
  assert.match(deploy, /^      tag: \$\{\{ github\.event_name == 'workflow_dispatch' && inputs\.release_tag \|\| needs\.release-tag\.outputs\.tag \}\}$/m);
  assert.match(deploy, /^      expected_sha: \$\{\{ github\.event_name == 'workflow_dispatch' && inputs\.expected_commit \|\| github\.sha \}\}$/m);
  assert.match(deploy, /^    secrets: inherit$/m, "a called workflow sees only the secrets its caller passes");
  assert.doesNotMatch(deploy, /^    (?:steps|runs-on|environment):/m, "the call runs nothing itself");
  assert.doesNotMatch(release, /wrangler|deploy-worker/);
});

test("only the deploy call inherits secrets, and no workflow runs wrangler deploy or reads Cloudflare credentials", () => {
  assert.equal((workflow.match(/secrets: inherit/g) || []).length, 1, "only the deploy-worker.yml call inherits secrets");
  assert.doesNotMatch(workflow, /wrangler (?:deploy|deployments)/);
  assert.doesNotMatch(workflow, /CLOUDFLARE_(?:API_TOKEN|ACCOUNT_ID)/);
  assert.equal((workflow.match(/deploy-worker\.yml@/g) || []).length, 1, "one production deploy path");
});
