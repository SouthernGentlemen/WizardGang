import { cp, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import type { BuildMetadata } from "./src/app/contracts";
import { createBuildIdentity } from "./scripts/build-identity.mjs";
import { sanitizeLocalHeadersText } from "./scripts/local-headers.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const dist = resolve(root, "dist");
const shellOut = resolve(root, "tmp/frontend-shell");
const publishOut = resolve(root, "tmp/frontend-publish");
const rendererFile = resolve(shellOut, "render.mjs");
const browserEntry = resolve(root, "src/browser/index.ts");

type TreeSnapshot = {
  files: Set<string>;
  directories: Set<string>;
};

async function snapshotTree(base: string): Promise<TreeSnapshot> {
  const files = new Set<string>();
  const directories = new Set<string>();

  async function visit(directory: string) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }

    for (const entry of entries) {
      const absolute = resolve(directory, entry.name);
      const rel = relative(base, absolute);
      if (entry.isDirectory()) {
        directories.add(rel);
        await visit(absolute);
      } else if (entry.isFile() || entry.isSymbolicLink()) {
        files.add(rel);
      } else {
        throw new Error(`Unsupported publish entry: ${absolute}`);
      }
    }
  }

  await visit(base);
  return { files, directories };
}

function pathDepth(value: string): number {
  return value.split(/[\\/]/).length;
}

async function publishStaticTree(sourceRoot: string, targetRoot: string): Promise<void> {
  await mkdir(targetRoot, { recursive: true });

  const source = await snapshotTree(sourceRoot);
  const previous = await snapshotTree(targetRoot);

  for (const directory of [...source.directories].sort((a, b) => pathDepth(a) - pathDepth(b))) {
    const target = resolve(targetRoot, directory);
    if (previous.files.has(directory)) await rm(target, { force: true });
    await mkdir(target, { recursive: true });
  }

  let sequence = 0;
  for (const file of [...source.files].sort()) {
    const sourceFile = resolve(sourceRoot, file);
    const targetFile = resolve(targetRoot, file);
    if (previous.directories.has(file)) await rm(targetFile, { recursive: true, force: true });
    await mkdir(dirname(targetFile), { recursive: true });

    const temporaryFile = resolve(
      dirname(targetFile),
      `.${file.split(/[\\/]/).at(-1)}.wizardgang-publish-${process.pid}-${sequence += 1}`
    );
    await rm(temporaryFile, { recursive: true, force: true });
    await cp(sourceFile, temporaryFile, { dereference: false });
    await rename(temporaryFile, targetFile);
  }

  for (const file of previous.files) {
    if (!source.files.has(file)) await rm(resolve(targetRoot, file), { force: true });
  }
  for (const directory of [...previous.directories].sort((a, b) => pathDepth(b) - pathDepth(a))) {
    if (!source.directories.has(directory)) {
      await rm(resolve(targetRoot, directory), { recursive: true, force: true });
    }
  }
}

function staticSitePlugin(): Plugin {
  let generation = 0;
  let browserReferenceId = "";
  const watched = [
    resolve(root, "src/app/pageRegistry.ts"),
    resolve(root, "src/data/site.ts"),
    resolve(root, "src/data/solutions.ts"),
    resolve(root, "src/data/projects.ts"),
    resolve(root, "src/components/ProjectPreviews.tsx"),
    resolve(root, "src/components/ProjectSurfaces.tsx"),
    resolve(root, "src/pages/Projects.tsx"),
    resolve(root, "src/data/professional.ts"),
    resolve(root, "src/data/professional-systems.ts"),
    resolve(root, "src/data/integrations.ts"),
    resolve(root, "src/data/team.ts"),
    resolve(root, "src/components/ProfessionalSurfaces.tsx"),
    resolve(root, "src/pages/Home.tsx"),
    resolve(root, "src/pages/About.tsx"),
    resolve(root, "src/pages/Solutions.tsx"),
    resolve(root, "src/pages/NotFound.tsx"),
    resolve(root, "src/styles/globals.css")
  ];

  return {
    name: "wizardgang-static-react-shell",
    buildStart() {
      browserReferenceId = this.emitFile({ type: "chunk", id: browserEntry, name: "browser" });
      for (const file of watched) this.addWatchFile(file);
    },
    async writeBundle(_options, bundle) {
      generation += 1;

      const browserFileName = this.getFileName(browserReferenceId);
      const browserChunk = bundle[browserFileName];
      if (!browserChunk || browserChunk.type !== "chunk") {
        throw new Error("Vite did not emit the TypeScript browser entry.");
      }
      if (browserChunk.imports.length > 0 || browserChunk.dynamicImports.length > 0) {
        throw new Error("Browser entry unexpectedly depends on additional chunks.");
      }

      const rendererUrl = `${pathToFileURL(rendererFile).href}?generation=${generation}`;
      const renderer = await import(rendererUrl) as {
        renderStaticDocuments(build: BuildMetadata, browserAssetPath: string): Map<string, string>;
        sitemapPaths(): readonly string[];
      };

      const build: BuildMetadata = createBuildIdentity({
        cwd: root,
        product: "WizardGang"
      });

      await rm(publishOut, { recursive: true, force: true });
      await mkdir(publishOut, { recursive: true });

      try {
        await cp(resolve(root, "public"), publishOut, { recursive: true });
        if (process.env.WIZARDGANG_LOCAL_DEV === "1") {
          const headersPath = resolve(publishOut, "_headers");
          const headers = await readFile(headersPath, "utf8");
          await writeFile(headersPath, sanitizeLocalHeadersText(headers));
        }

        for (const output of Object.values(bundle)) {
          if (!output.fileName.startsWith("assets/")) continue;
          const target = resolve(publishOut, output.fileName);
          await mkdir(dirname(target), { recursive: true });
          await cp(resolve(shellOut, output.fileName), target);
        }

        const browserAssetPath = `/${browserFileName}`;
        const pages = renderer.renderStaticDocuments(build, browserAssetPath);

        for (const [relativePath, html] of pages) {
          const target = resolve(publishOut, relativePath);
          await mkdir(dirname(target), { recursive: true });
          await writeFile(target, html);
        }

        // The sitemap is a projection of the page registry, never a second route list.
        const sitemap = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...renderer.sitemapPaths().map((path) => `  <url><loc>https://wizardgang.ai${path}</loc></url>`),
          "</urlset>",
          ""
        ].join("\n");
        await writeFile(resolve(publishOut, "sitemap.xml"), sitemap);

        // Keep Wrangler's configured asset root alive across watch rebuilds. The next
        // complete tree is staged first; files are then atomically replaced in-place
        // before stale files/directories are pruned.
        await publishStaticTree(publishOut, dist);
        console.log(`Built ${pages.size} React-shell HTML pages at ${build.commit} (${build.release}).`);
      } finally {
        await rm(publishOut, { recursive: true, force: true });
      }
    }
  };
}

export default defineConfig({
  appType: "custom",
  publicDir: false,
  plugins: [react(), tailwindcss(), staticSitePlugin()],
  build: {
    ssr: "src/app/Document.tsx",
    ssrEmitAssets: true,
    outDir: shellOut,
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        entryFileNames: (chunk) => chunk.name === "browser" ? "assets/browser-[hash].js" : "render.mjs",
        chunkFileNames: (chunk) => chunk.name === "browser" ? "assets/browser-[hash].js" : "assets/chunk-[name]-[hash].js",
        assetFileNames: (asset) => asset.name?.endsWith(".css") ? "assets/styles.css" : "assets/[name]-[hash][extname]"
      }
    }
  }
});
