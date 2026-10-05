import { createEdge } from "#wg-edge";
import type { EdgeEnv, EdgeHandler, Release } from "#wg-edge";

const GITHUB_ORG = "https://github.com/Wizard-Gang";
const DEMO_ORIGIN = "https://demo.wizardgang.ai";

type Path = `/${string}`;
type HttpsUrl = `https://${string}`;

type ExternalPermanentRedirect = {
  kind: "external";
  source: Path;
  destination: HttpsUrl;
};

type PermanentRedirectRoute = ExternalPermanentRedirect;

export interface AssetBinding {
  fetch(request: Request): Promise<Response>;
}

export interface WorkerEnv extends EdgeEnv {
  ASSETS: AssetBinding;
}

/* Outward shortcuts only. These were never pages on this site — they are handy
   aliases for surfaces that live elsewhere, so they keep resolving.
   Compatibility redirects for routes this site used to serve have been removed:
   those paths are dead and return the ordinary 404. */
const PERMANENT_REDIRECT_ROUTES = [
  { kind: "external", source: "/github", destination: GITHUB_ORG },
  { kind: "external", source: "/github/", destination: GITHUB_ORG },
  { kind: "external", source: "/compliance", destination: `${DEMO_ORIGIN}/assurance` },
  { kind: "external", source: "/compliance/", destination: `${DEMO_ORIGIN}/assurance` },
  { kind: "external", source: "/accessibility", destination: `${DEMO_ORIGIN}/assurance` },
  { kind: "external", source: "/accessibility/", destination: `${DEMO_ORIGIN}/assurance` },
  { kind: "external", source: "/security", destination: `${DEMO_ORIGIN}/security` },
  { kind: "external", source: "/security/", destination: `${DEMO_ORIGIN}/security` }
] as const satisfies readonly PermanentRedirectRoute[];

export const PERMANENT_REDIRECTS = new Map<string, string>(
  PERMANENT_REDIRECT_ROUTES.map(({ source, destination }) => [source, destination] as const)
);

/* The shell answers /robots.txt before the app sees it, so the site's crawl policy lives here. */
export const ROBOTS = "User-agent: *\nAllow: /\n\nSitemap: https://wizardgang.ai/sitemap.xml\n";

function permanentRedirectFor(path: string): PermanentRedirectRoute | undefined {
  return PERMANENT_REDIRECT_ROUTES.find((route) => route.source === path);
}

function redirect(target: string): Response {
  // The shell adds the security headers to every app response.
  return new Response(null, {
    status: 308,
    headers: { location: target, "cache-control": "public, max-age=3600" }
  });
}

/* The wg-edge shell owns the host guard, the www → apex 308, TLS, /version.json, /health.json,
   /robots.txt, the /admin gate, security headers and errors. The site adds its outward
   shortcuts and serves everything else from its assets. */
export function createSiteWorker(release: Release, { logSink }: { logSink?: (line: string) => void } = {}): EdgeHandler<WorkerEnv> {
  return createEdge<WorkerEnv>({
    release,
    robots: ROBOTS,
    logSink,
    async fetch(request, env) {
      const permanentRoute = permanentRedirectFor(new URL(request.url).pathname);
      if (permanentRoute) return redirect(permanentRoute.destination);
      return env.ASSETS.fetch(request);
    }
  });
}
