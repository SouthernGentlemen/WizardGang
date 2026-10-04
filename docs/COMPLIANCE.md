# WizardGang compliance management record

Effective date: 2026-08-30 (America/New_York)

Owner: Jacob Yongue

Scope: the public `wizardgang.ai` site, its generated HTML/CSS/JavaScript, its stateless
Cloudflare Worker, its public source repository, and the process used to create and release them.
The independently operated Hexframe product is outside this management
boundary and maintains its own source and operating records.

This is a public implementation record and self-assessment. It is not an ISO certification,
accredited audit result, legal opinion, or claim of complete conformity.

## Management policy

WizardGang will:

- keep a named human owner accountable for AI-produced changes and release decisions;
- minimize collected data and public attack surface;
- review source, dependencies, generated output, accessibility, and deployment behavior before release;
- keep security, accessibility, AI-development, and recovery decisions versioned with the source;
- use development deployment and rollback paths before changing production;
- publish known gaps honestly and correct material defects; and
- keep product runtimes and private operational data outside the site repository.

## Interested parties and requirements

| Interested party | Need or expectation | Site response |
| --- | --- | --- |
| Visitors | Safe, usable, understandable pages | Static delivery, no accounts or forms, accessibility preferences, Spanish mode, security headers |
| People using assistive technology | Keyboard access, semantic structure, contrast, alternatives, motion control | WCAG checklist, semantic HTML, visible focus, reduced-motion support, text and theme controls |
| Site owner | Accurate representation, controlled cost, recoverable releases | Human approval, public source, build metadata, development deployment, rollback |
| Cloud and source providers | Acceptable, secure use of their services | Limited dependencies, no embedded credentials, documented boundary |
| Future maintainers | Traceable decisions and reproducible releases | Versioned source, build/check commands, ownership and compliance records |

## Information-security risk register

| Risk | Likelihood | Impact | Treatment | Owner | Current status |
| --- | --- | --- | --- | --- | --- |
| Secret or private data enters public history | Low | High | No secrets in source; automated private-information checks; review changes before publication | Jacob Yongue | Treated and monitored |
| AI-produced code introduces a security defect | Medium | High | Human review, static boundary, automated verification, staged release, rollback | Jacob Yongue | Treated and monitored |
| Dependency or supplier behavior changes | Medium | Medium | Keep dependencies minimal; lock versions; review release notes before upgrades | Jacob Yongue | Ongoing |
| Accessibility regresses | Medium | High | WCAG checklist, keyboard/focus/motion/zoom checks, public reporting path | Jacob Yongue | Ongoing |
| Incorrect or misleading compliance claim | Medium | High | Self-assessment language, linked evidence, explicit gaps, no certification claim | Jacob Yongue | Treated and monitored |
| Deployment serves stale or broken content | Low | Medium | Build verification, development deployment, route probes, version metadata, rollback | Jacob Yongue | Treated and monitored |
| Spanish translation is incomplete or misleading | Medium | Medium | Versioned translations, untranslated-copy audit, human review, English fallback | Jacob Yongue | Ongoing |
| Security or accessibility report is missed | Low | High | Published private reporting address and issue-review responsibility | Jacob Yongue | Ongoing |

<a id="iso-27001-clause-4"></a>
## ISO/IEC 27001:2022 — Clause 4: context of the organization

The scope, interested parties, requirements, interfaces, and exclusions are recorded above and in
[`OWNERSHIP.md`](OWNERSHIP.md). The site information-security management system consists of
the policy, risk register, applicability record, release controls, checks, reporting path, and
continual-improvement records kept in this repository.

<a id="iso-27001-clause-5"></a>
## ISO/IEC 27001:2022 — Clause 5: leadership

Jacob Yongue is the management-system owner, approves releases, accepts residual risk, reviews
reports, and owns corrective action. The policy commitments in this document apply to every
site change, including AI-produced changes.

<a id="iso-27001-clause-6"></a>
## ISO/IEC 27001:2022 — Clause 6: planning

The risk register above records current information-security risks and treatments. Objectives are
to keep the public site free of visitor accounts and sensitive-data collection, prevent
secrets from entering public history, pass release verification, preserve a tested rollback path,
and respond to material reports. Material scope, supplier, or architecture changes require this
record and the applicability record to be reviewed.

<a id="iso-27001-clause-7"></a>
## ISO/IEC 27001:2022 — Clause 7: support

Resources include the public repository, locked development dependency, generated build, Cloudflare
development and production environments, automated verification, and public documentation. Source,
decisions, and evidence are controlled through Git history. Security and accessibility reports use
the route in [`SECURITY.md`](../SECURITY.md). A recurring competence-review record is not yet
established and remains a partial item.

<a id="iso-27001-clause-8"></a>
## ISO/IEC 27001:2022 — Clause 8: operation

Each change follows this operating path: edit versioned source; review the diff; build generated
assets; run automated checks; deploy to the development environment; probe public routes,
redirects, headers, and critical behavior; obtain human approval; and retain rollback through the
previous deployment and Git history. Product-specific services and data are not copied into the
site boundary.

<a id="iso-27001-clause-9"></a>
## ISO/IEC 27001:2022 — Clause 9: performance evaluation

The repository verifies canonical pages, metadata, links, assets, ownership redirects, the versioned governance record,
motion controls, and private-information exclusions. Development deployments are checked before
release. A scheduled internal-audit and management-review history is not yet established and
remains a partial item.

<a id="iso-27001-clause-10"></a>
## ISO/IEC 27001:2022 — Clause 10: improvement

Defects, user feedback, failed checks, and inaccurate claims trigger correction in versioned source,
re-verification, and a new development deployment. Material events will be recorded with cause,
impact, correction, and follow-up. A formal nonconformity and corrective-action history is not yet
established and remains a partial item.

<a id="iso-27001-annex-a"></a>
## ISO/IEC 27001:2022 — Annex A applicability record

This is a site-scoped applicability summary, not a reproduction of the standard's control
text. Organizational and technological controls for policy, roles, access, supplier use, secure
development, change, backup/rollback, logging, incident reporting, and continuity are applicable.
People controls are limited to the owner-operated development process. Physical and data-center
controls are inherited from service providers and are evaluated through supplier selection rather
than operated by WizardGang. Controls for visitor identity, employment administration, office
facilities, payment processing, and production databases are outside scope because the site
does not operate those systems.

<a id="iso-42001-clause-4"></a>
## ISO/IEC 42001:2023 — Clause 4: context of the organization

AI is used to develop the site source. The public site is not itself an AI service and
does not send visitor content to an AI system. Relevant interested parties are visitors, people
using assistive technology, the site owner, source and hosting providers, and future maintainers.
The AI-management boundary covers the planning, generation, review, testing, documentation, and
release of site changes.

<a id="iso-42001-clause-5"></a>
## ISO/IEC 42001:2023 — Clause 5: leadership

Jacob Yongue remains accountable for goals, content, risk acceptance, release approval, and results.
AI output is treated as an implementation input, not as approval or evidence by itself. The
management policy above requires human ownership, traceability, risk review, and honest disclosure.

<a id="iso-42001-clause-6"></a>
## ISO/IEC 42001:2023 — Clause 6: planning

AI-related risks include insecure generated code, accessibility regression, inaccurate content,
supplier change, incomplete translation, and misleading compliance claims. Treatments include
human review, bounded scope, source control, automated checks, development deployment, linked
evidence, public gaps, and rollback. The objective is a traceable release whose behavior is checked
rather than inferred from generated output.

<a id="iso-42001-clause-7"></a>
## ISO/IEC 42001:2023 — Clause 7: support

Source, prompts and user direction retained in the development task, diffs, build metadata, public
documentation, and verification results support the process. External AI models and development
tools are suppliers. Material model/tool changes require renewed review. A recurring competence and
supplier-review record is not yet established and remains a partial item.

<a id="iso-42001-clause-8"></a>
## ISO/IEC 42001:2023 — Clause 8: operation

AI-produced work follows the same controlled release path as other changes: bounded request,
versioned implementation, diff review, automated verification, development deployment, browser or
route checks appropriate to the change, human approval, and rollback availability. Visitor data is
not used as model input by the public site.

<a id="iso-42001-clause-9"></a>
## ISO/IEC 42001:2023 — Clause 9: performance evaluation

Build results, route behavior, accessibility controls, translation coverage, and visual regressions
are evaluated during development. Public status and gaps are updated when evidence changes. A
scheduled AI-management internal-audit and management-review history is not yet established and
remains a partial item.

<a id="iso-42001-clause-10"></a>
## ISO/IEC 42001:2023 — Clause 10: improvement

Reported defects and failed verification produce source changes, renewed checks, and updated
documentation. Material AI-related incidents will record the issue, cause, impact, correction, and
follow-up. A formal nonconformity and corrective-action history is not yet established and remains
a partial item.

<a id="iso-42001-annex-a"></a>
## ISO/IEC 42001:2023 — Annex A applicability record

This is a site-scoped control summary, not a reproduction of the standard. Applicable areas
include AI policy, accountable ownership, risk and impact review, data boundaries, lifecycle
controls, external-tool management, transparency, documentation, monitoring, and improvement.
Controls for operating an AI system on visitor data, automated decisions about people, model
training, model hosting, and customer AI-service operations are outside scope because the public
site performs none of those activities.

## AI impact assessment

The intended benefit is faster implementation of a public software-engineering site while
retaining human ownership and evidence. Foreseeable harms include insecure code, inaccessible
interfaces, inaccurate claims, biased or incomplete language, disclosure of private information,
and dependency on external tools. The controls above reduce those risks. The residual risk is
accepted by the owner for development review and must be reconsidered if the site begins to
collect submissions, make automated decisions, host an AI model, or operate customer data.

## Accessibility record

The architecture demo’s [compliance and assurance index](https://demo.wizardgang.ai/assurance) links
to its canonical working accessibility evidence. Site scope, release checks, limitations, and
reporting remain documented in [`ACCESSIBILITY.md`](ACCESSIBILITY.md).

## Review and change control

Review this record after a material change to scope, data collection, hosting, dependencies,
AI-development tools, public claims, or incident history, and at least annually while the site is
maintained. Changes are approved through the same public source history as the implementation.
