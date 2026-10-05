# Security policy

## Supported surface

Security reports are accepted for the current `wizardgang.ai` site and its stateless TypeScript Worker, including the vendored wg-edge shell it runs on.

Hexframe and the detailed Demo Framework application are separate system boundaries. Report product-specific issues through the owning repository or operating surface.

## Report privately

Email `jacob@wizardgang.ai` with the affected URL, impact, and minimal safe reproduction steps.

Do not open a public issue for an unpatched vulnerability. Do not include passwords, credentials, private records, destructive proof, or data belonging to another person.

## Site boundary

WizardGang.ai serves generated static HTML, CSS, a first-party browser module, public media, and the shell's `/version.json` release record through Cloudflare. It does not accept visitor accounts, passwords, payments, uploads, or form submissions.

`public/_headers` is the production HTTP-header authority. It includes the production Content Security Policy and HTTPS-only controls. Local HTTP development never edits that source file; the dev lifecycle sanitizes only the generated `dist/_headers` copy by removing HSTS and `upgrade-insecure-requests`.

The browser architecture does not require inline application scripts or React hydration. First-party browser behavior is emitted as a Vite module from `src/browser/`.

Automated checks, source review, dry-run validation, versioned source, and rollback options reduce risk but do not guarantee that defects or incidents cannot occur.

`npm run check` scans tracked files and reachable Git history for credential
patterns without network access or token output. The bounded scanner permits
the empty `.env.example` template, explicit `test-`/`fake-`/`example`
placeholders, and source identifiers or regex syntax that are not credential
values. Pure cases prove current and historical detection.
