# Source and system ownership

This repository owns the public `wizardgang.ai` company site. Product runtimes and their operating records remain separate systems with their own source authorities.

| Surface | Canonical source | This repository's relationship |
| --- | --- | --- |
| `wizardgang.ai` | [`Wizard-Gang/WizardGang`](https://github.com/Wizard-Gang/WizardGang) | Owns company pages, typed site data, project metadata/presentation, static assets, canonical route generation, and the stateless compatibility Worker |
| `hexframe.wizardgang.ai` | [`Wizard-Gang/Hexframe`](https://github.com/Wizard-Gang/Hexframe) | Main site describes and links to the product; Hexframe owns its runtime, simulation, content, tests, releases, and deployment |
| YarReader offline product | [`Wizard-Gang/YarReader`](https://github.com/Wizard-Gang/YarReader) | Main site describes and links to the project; YarReader owns ingestion, conversion, offline export/reader behavior, tests, releases, and recovery records |
| `demo.wizardgang.ai` | external Demo Framework application | Main site explains the framework and links outward; the demo system owns its detailed architecture, executable demonstrations, assurance/security surfaces, and operational evidence |

## Company and professional ownership

WizardGang-owned projects, capabilities, and solutions are company content.

Jacob Yongue's employer roles, employer/customer deployments, and professional outcomes are Team/professional content. They can support capability statements when attribution remains explicit, but they are not WizardGang client engagements unless a source establishes that relationship.

The current public ownership model is documented in [`INFORMATION-ARCHITECTURE.md`](INFORMATION-ARCHITECTURE.md).

## Data boundary

Public Git history may contain source, configuration, documentation, synthetic fixtures, and reproducible tests.

Do not commit:

- production credentials or operator secrets;
- private runtime state;
- personal/private library metadata;
- customer or publisher-owned confidential records;
- copyrighted publication content that the project is not authorized to redistribute.

Product-specific runtime state, backup/recovery procedures, and operating records stay with the product that owns them. WizardGang.ai links to those authorities rather than copying them into this repository.

## Verification boundary

Repository acceptance protects the ownership boundary by checking canonical project/source relationships, company-versus-professional content ownership, route authority, and absence of retired parallel presentation sources.

`npm run check` is the authoritative gate before release work.
