# WizardGang accessibility

Scope: canonical pages served from `wizardgang.ai`, including shared navigation, display preferences, project previews, and site content. Detailed architecture/assurance evidence is owned by [`demo.wizardgang.ai/assurance`](https://demo.wizardgang.ai/assurance).

Target: WCAG 2.2 Level AA for scoped content. This is a design and testing target, not an accessibility certification or blanket conformance claim.

## Current contract

The site is expected to preserve:

- semantic landmarks and logical heading order;
- one meaningful H1 and a usable `main` landmark per generated page;
- keyboard-operable navigation and controls;
- early skip navigation and visible focus;
- a real button-controlled mobile menu when JavaScript is active;
- primary mobile navigation that remains usable when JavaScript is unavailable;
- descriptive link/control names and current-section navigation state;
- dark/light display support and color-independent meaning;
- 200% text support and responsive reflow;
- play-by-default preview motion, reduced-motion handling, and a persistent project-preview motion preference;
- decorative project previews excluded from the accessibility tree while adjacent text/links carry the meaning;
- explicit image alternative-text semantics;
- English/Spanish page-language behavior;
- stable metadata, error-page, and canonical-route semantics.

Run the deterministic accessibility acceptance directly with:

```bash
npm run test:accessibility
```

`npm run check` includes the same contract as part of the complete repository acceptance suite. Structural checks run across the generated HTML inventory so new generated pages receive the baseline automatically.

Automated tests do not replace keyboard, screen-reader, zoom/reflow, contrast, and visual review.

## Current limitations and follow-up

Known areas for continued content/accessibility improvement include:

- completing Spanish translation and explicit language marking for remaining technical names;
- defining unusual technical terms in place, now that the separate glossary page is retired;
- providing simpler alternatives for the denser technical passages; and
- adding pronunciation help when a name or term cannot reasonably be inferred from spelling.

## Reporting

Report an accessibility problem to `jacob@wizardgang.ai`. Include the affected page, browser or assistive technology when relevant, observed behavior, and safe reproduction steps. Do not include passwords, credentials, or private records.
