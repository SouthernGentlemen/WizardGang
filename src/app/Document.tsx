import "../styles/globals.css";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { createStaticPageRegistry } from "./pageRegistry";
import { navigationSectionForPath } from "./navigation";
import type { BuildMetadata, PageMetadata, ReactPageDefinition } from "./contracts";

const SITE_ORIGIN = "https://wizardgang.ai";
const SOCIAL_IMAGE_ALT = "WizardGang — software, systems, integrations, and inspectable engineering projects";

function Metadata({ metadata, build, browserAssetPath }: { metadata: PageMetadata; build: BuildMetadata; browserAssetPath: string }) {
  const canonical = `${SITE_ORIGIN}${metadata.path}`;
  const assetVersion = encodeURIComponent(`${build.commit}-${Date.parse(build.builtAt)}`);
  const socialImage = metadata.socialImage ? new URL(metadata.socialImage, SITE_ORIGIN).toString() : null;

  return (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta name="theme-color" content="#09090b" />
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      {metadata.noIndex ? (
        <meta name="robots" content="noindex" />
      ) : (
        <>
          <link rel="canonical" href={canonical} />
          <meta property="og:url" content={canonical} />
        </>
      )}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="WizardGang" />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      {socialImage ? (
        <>
          <meta property="og:image" content={socialImage} />
          <meta property="og:image:type" content="image/jpeg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={SOCIAL_IMAGE_ALT} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={socialImage} />
        </>
      ) : (
        <meta name="twitter:card" content="summary" />
      )}
      <link rel="preload" href="/fonts/instrument-sans-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/jetbrains-mono-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="stylesheet" href={`/assets/styles.css?v=${assetVersion}`} />
      <script type="module" src={browserAssetPath}></script>
    </head>
  );
}

export function Document({
  page,
  build,
  browserAssetPath,
  children
}: {
  page: Pick<ReactPageDefinition, "metadata">;
  build: BuildMetadata;
  browserAssetPath: string;
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <Metadata metadata={page.metadata} build={build} browserAssetPath={browserAssetPath} />
      <body>
        <SiteHeader current={navigationSectionForPath(page.metadata.path)} />
        {children}
        <SiteFooter build={build} />
      </body>
    </html>
  );
}

function renderStaticDocument(
  page: Pick<ReactPageDefinition, "metadata">,
  body: ReactNode,
  build: BuildMetadata,
  browserAssetPath: string
): string {
  return `<!doctype html>\n${renderToStaticMarkup(
    <Document page={page} build={build} browserAssetPath={browserAssetPath}>{body}</Document>
  )}`;
}

export function renderStaticDocuments(build: BuildMetadata, browserAssetPath: string): Map<string, string> {
  return new Map(
    createStaticPageRegistry().map((page) => [
      page.relative,
      renderStaticDocument(page, page.body, build, browserAssetPath)
    ])
  );
}

export function sitemapPaths(): readonly string[] {
  return createStaticPageRegistry()
    .filter((page) => !page.metadata.noIndex)
    .map((page) => page.metadata.path);
}

export type { BuildMetadata, PageMetadata, ReactPageDefinition } from "./contracts";
