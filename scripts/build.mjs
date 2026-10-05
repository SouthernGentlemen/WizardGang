import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { writeWorkerEntry } from "./worker-release.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

const release = await writeWorkerEntry({ cwd: root });
console.log(`Wrote the Worker entry for ${release.version} at ${release.commit}.`);

await build({
  configFile: resolve(root, "vite.config.ts")
});
