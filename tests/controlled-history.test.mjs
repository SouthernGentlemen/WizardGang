import assert from "node:assert/strict";
import { test } from "node:test";
import { hasRequiredSection, validateHistory } from "../scripts/controlled-history.mjs";

const body = "Change: yes\nReason: yes\nImpact: yes\nRisk: Low\nControls: yes\nValidation: yes\nEvidence: yes\nSource: yes\nRelease/deployment effect: None.";
const records = [78, 79, 80].map((n) => ({ sha: `sha${n}`, parents: ["parent"], subject: `[WG-${String(n).padStart(3, "0")}] [BUILD] Deliver task`, body }));
const plan = "### WG-081 — [BUILD] Current\n### WG-082 — [TEST] Next\n";
const emptyPlan = `# Implementation plan

## Open tasks

The queue is empty. Select no implementation task.

The next instruction must fill this queue through a controlled, plan-only change before implementation begins. Fetch current \`main\`, inspect open pull requests and reservations, and use the repository's next valid unassigned controlled ID. Keep this file tracked; do not delete it when the queue is empty.
`;

test("sequential controlled records and active plan pass", () => {
  assert.deepEqual(validateHistory(records, plan), []);
});
test("the final task leaves the shared permanent empty queue", () => {
  assert.deepEqual(validateHistory(records, emptyPlan), []);
  assert.match(validateHistory(records, null).join(" "), /must remain tracked/);
  assert.match(validateHistory(records, "").join(" "), /shared permanent queue template/);
});
test("missing, duplicate, or out-of-sequence identities fail", () => {
  assert.match(validateHistory([records[0], records[2]], plan).join(" "), /expected WG-079/);
  assert.match(validateHistory([...records, records[2]], plan).join(" "), /expected WG-081/);
});
test("malformed controlled body or retained completed plan task fails", () => {
  assert.match(validateHistory([...records.slice(0, 2), { ...records[2], body: "" }], plan).join(" "), /missing Change/);
  assert.match(validateHistory(records, "### WG-080 — [BUILD] Done\n" ).join(" "), /expected WG-081/);
});

test("immutable WG-117 Source attestation is exact-SHA and Source-only", () => {
  const withoutSource = body.replace("\nSource: yes", "");
  const record = {
    sha: "af078ea1947ac22c06f4fe7763c56ab573f9dbd7",
    parents: ["parent"],
    subject: "[WG-117] [CONTENT] Remove SharkTank from the site",
    body: withoutSource,
  };
  assert.equal(hasRequiredSection(record, "Source"), true);
  assert.equal(hasRequiredSection({ ...record, sha: "different-sha" }, "Source"), false);
  assert.equal(hasRequiredSection({ ...record, body: withoutSource.replace("\nEvidence: yes", "") }, "Evidence"), false);
});

test("pending implementation task can precede an early plan-maintenance identity", () => {
  const prior = [
    ...records,
    ...[81, 84, 85, 86, 87, 88, 89, 90, 91].map((n) => ({ sha: `sha${n}`, parents: ["parent"], subject: `[WG-${String(n).padStart(3, "0")}] [OPS] Deliver task`, body })),
    { sha: "sha93", parents: ["parent"], subject: "[WG-093] [DOCS] Amend plan", body: `${body}\nPortfolio-Plan-Maintenance: true` },
  ];
  assert.deepEqual(validateHistory(prior, "### WG-094 — [OPS] Next\n", 92), []);
  assert.match(validateHistory(prior, "### WG-094 — [OPS] Next\n", 91).join(" "), /expected WG-092/);
});
