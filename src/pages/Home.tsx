import type { ReactPageDefinition } from "../app/contracts";
import { WorkRow } from "../components/ProjectSurfaces";
import { PROJECTS_ROOT, projects } from "../data/projects";
import { DEMO_FRAMEWORK_URL, GITHUB_ORG_URL } from "../data/site";
import { SOLUTIONS_PATH, SOLUTION_SECTIONS } from "../data/solutions-menu";
import {
  professionalIntegrationEvidence,
  professionalSystemEvidence
} from "../data/professional-systems";

/* Software first: the projects lead, because they are the evidence the hero
   promises. Professional categories follow, visible without a click. Project
   rows remain disclosures because each holds a motion-controlled preview. */

function SectionHead({ id, label, blurb, href, hrefLabel }: {
  id: string; label: string; blurb: string; href?: string; hrefLabel?: string;
}) {
  return (
    <div className="section-head">
      <h2 className="section-label" id={id}>{label}</h2>
      <p className="section-blurb">{blurb}</p>
      {href && hrefLabel ? (
        <a className="section-more" href={href}>{hrefLabel} <span aria-hidden="true">→</span></a>
      ) : null}
    </div>
  );
}

export const HOME_PAGE: ReactPageDefinition = {
  relative: "index.html",
  metadata: {
    title: "WizardGang — Software that ships",
    description: "Software you can read, run, and keep. The industries it was delivered to, the systems it connects, and the open-source projects WizardGang builds and operates.",
    path: "/",
    socialImage: "/og.jpg"
  },
  body: (
    <main className="site-main" id="main" tabIndex={-1}>
      <section className="home-hero">
        <h1>Software that Ships</h1>
        <p className="home-lede">
          Most custom software arrives as a black box. Here you can inspect the source, read how
          each project was built, and open the live applications where available &mdash; so you can
          check the work before you pay for it, and keep what is built for you.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#home-projects-heading">
            Browse the projects <span aria-hidden="true">↓</span>
          </a>
          <a className="button" href={GITHUB_ORG_URL}>
            Source on GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className="work" aria-labelledby="home-projects-heading">
        <SectionHead
          id="home-projects-heading"
          label="Selected projects"
          blurb="Open-source software WizardGang builds and operates."
          href={PROJECTS_ROOT}
          hrefLabel="All projects"
        />
        <div className="work-list">
          {projects.map((project) => <WorkRow key={project.id} project={project} />)}
        </div>
      </section>

      <section className="work" aria-labelledby="home-industries-heading">
        <SectionHead id="home-industries-heading" label="Industries" blurb={SOLUTION_SECTIONS[0].lede} />
        <ul className="home-topic-grid home-topic-grid-industries">
          {professionalSystemEvidence.map((group) => (
            <li className="home-topic" key={group.title}>
              <h3>{group.title}</h3>
              <ul className="home-topic-examples" aria-label={`${group.title} examples`}>
                {group.items.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="work" aria-labelledby="home-integrations-heading">
        <SectionHead id="home-integrations-heading" label="Integrations" blurb={SOLUTION_SECTIONS[1].lede} />
        <ul className="home-topic-grid home-topic-grid-integrations">
          {professionalIntegrationEvidence.map((group) => (
            <li className="home-topic" key={group.title}>
              <h3>{group.title}</h3>
              <ul className="home-topic-examples" aria-label={`${group.title} examples`}>
                {group.items.slice(0, 3).map((item) => <li key={item.name}>{item.name}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-outro" aria-labelledby="home-architecture-heading">
        <h2 className="section-label" id="home-architecture-heading">Go deeper</h2>
        <p className="section-blurb">
          Explore WizardGang's live architecture examples, with source and supporting evidence
          beside them.
        </p>
        <div className="outro-actions">
          <a className="button button-primary" href={DEMO_FRAMEWORK_URL}>
            Explore the Architecture <span aria-hidden="true">↗</span>
          </a>
          <a className="button" href={SOLUTIONS_PATH}>
            See the full record <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </main>
  )
};
