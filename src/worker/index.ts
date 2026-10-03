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

export interface WorkerEnv {
  ASSETS: AssetBinding;
}

type WorkerModule = {
  fetch(request: Request, env: WorkerEnv): Promise<Response>;
};

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

const SECURITY_HEADERS = {
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()"
} as const;

function permanentRedirectFor(path: string): PermanentRedirectRoute | undefined {
  return PERMANENT_REDIRECT_ROUTES.find((route) => route.source === path);
}

function redirect(target: string): Response {
  return new Response(null, {
    status: 308,
    headers: { location: target, "cache-control": "public, max-age=3600", ...SECURITY_HEADERS }
  });
}

const worker = {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const path = new URL(request.url).pathname;
    const permanentRoute = permanentRedirectFor(path);
    if (permanentRoute) return redirect(permanentRoute.destination);
    return env.ASSETS.fetch(request);
  }
} satisfies WorkerModule;

export default worker;
