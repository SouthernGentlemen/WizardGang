import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const emptyPlanHash = "59cdf5f8622ee928364b5647474b3a83f502c949bde9562d0a53a33291b090d0";

export const LEGACY_TIP = "029e80db654594e861d64db1574351bd9696f529";
// The portfolio transition delivered the queued settings authority, CI, and live
// convergence as one atomic WG-084 change so committed and provider policy agreed
// before the squash merge. WG-082 and WG-083 remain reserved historical queue IDs.
const consolidatedTransition = new Map([[82, 84]]);
const title = /^\[WG-(\d{3})\] \[([A-Z]+)\] .+$/;
const sections = ["Change", "Reason", "Impact", "Risk", "Controls", "Validation", "Evidence", "Source", "Release/deployment effect"];

const sourceAttestations = new Map([
  [
    "af078ea1947ac22c06f4fe7763c56ab573f9dbd7",
    "AGENTS.md, WG-117 in implementation_plan.md, typed project and preview sources, public assets and headers, current-state docs, and the project/navigation/accessibility acceptance suite."
  ],
]);

export function hasRequiredSection(record, section) {
  if (new RegExp(`(?:^|\\n)${section}:\\s*\\S`, "m").test(record.body)) return true;
  return section === "Source" && Boolean(sourceAttestations.get(record.sha)?.trim());
}

export function validateHistory(records, plan, pendingTask = null) {
  const errors = [];
  let expected = 78;
  const earlyMaintenance = new Set();
  for (const record of records) {
    const match = title.exec(record.subject);
    if (!match) {
      errors.push(`${record.sha}: invalid controlled title`);
      continue;
    }
    const id = Number(match[1]);
    expected = consolidatedTransition.get(expected) ?? expected;
    while (earlyMaintenance.has(expected)) expected += 1;
    if (/^Portfolio-Plan-Maintenance: true$/m.test(record.body) && id > expected) {
      earlyMaintenance.add(id);
    } else {
      if (id !== expected) errors.push(`${record.sha}: expected WG-${String(expected).padStart(3, "0")}, found WG-${match[1]}`);
      else expected += 1;
    }
    if (id >= 80) {
      if (record.parents.length !== 1) errors.push(`WG-${match[1]}: expected one controlled commit parent`);
      for (const section of sections) {
        if (!hasRequiredSection(record, section)) errors.push(`WG-${match[1]}: missing ${section}`);
      }
    }
  }
  expected = consolidatedTransition.get(expected) ?? expected;
  const ids = [...(plan ?? "").matchAll(/^### WG-(\d{3}) — \[([A-Z]+)\]/gm)].map((m) => Number(m[1]));
  if (pendingTask === expected) {
    let afterPending = expected + 1;
    while (earlyMaintenance.has(afterPending)) afterPending += 1;
    if (ids[0] === afterPending) expected = afterPending;
  }
  if (plan === null) errors.push("implementation_plan.md must remain tracked");
  else if (!ids.length && createHash("sha256").update(plan).digest("hex") !== emptyPlanHash) {
    errors.push("empty implementation_plan.md must use the shared permanent queue template");
  }
  ids.forEach((id, index) => {
    while (earlyMaintenance.has(expected)) expected += 1;
    if (id !== expected) errors.push(`active plan expected WG-${String(expected).padStart(3, "0")}, found WG-${String(id).padStart(3, "0")}`);
    expected += 1;
  });
  return errors;
}

export function readCurrentHistory() {
  const raw = execFileSync("git", ["log", "--first-parent", "--reverse", "--format=%H%x1f%P%x1f%s%x1f%b%x1e", `${LEGACY_TIP}..HEAD`], { encoding: "utf8" });
  return raw.split("\x1e").map((entry) => entry.trim()).filter(Boolean).map((entry) => {
    const [sha, parentList, subject, body] = entry.split("\x1f");
    return { sha, parents: parentList.split(" ").filter(Boolean), subject, body };
  });
}

export function validateCurrentHistory() {
  const branch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
  const pending = /^wg-(\d{3})-/.exec(branch);
  const plan = existsSync("implementation_plan.md") ? readFileSync("implementation_plan.md", "utf8") : null;
  return validateHistory(readCurrentHistory(), plan, pending ? Number(pending[1]) : null);
}
