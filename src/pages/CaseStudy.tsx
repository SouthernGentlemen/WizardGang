import type { ReactPageDefinition } from "../app/contracts";
import { ProjectActions, ProjectArchitecture, ProjectVisualFrame } from "../components/ProjectSurfaces";
import { PROJECTS_ROOT, projectOutputPath, projectPath, projects, type ProjectRecord } from "../data/projects";

/* One page per project. The overview and the case study used to be two routes
   restating each other; the home page now carries the preview and the one-liner,
   so this page only has to carry the substance. The actions sit in the hero as
   well as after the result, so a phone reaches the live application without
   scrolling the whole account first. */
function caseStudyBody(project: ProjectRecord) {
  return (
    <main className="site-main" id="main" tabIndex={-1}>
      <section className="page-hero case-hero">
        <a className="back-link" href={PROJECTS_ROOT}><span aria-hidden="true">←</span> Projects</a>
        <p className="kicker">{project.number} / {project.eyebrow}</p>
        <h1>{project.name}</h1>
        <p>{project.narrative.tagline}</p>
        <ProjectActions project={project} />
      </section>

      <ProjectVisualFrame project={project} />

      <dl className="work-facts">
        <div>
          <dt>Primary capability</dt>
          <dd>{project.primaryCapability}</dd>
        </div>
        <div>
          <dt>Built with</dt>
          <dd>
            <ul className="work-tags">
              {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </dd>
        </div>
      </dl>

      <section className="case-section">
        <div className="case-label">Problem</div>
        <div><p>{project.problem}</p></div>
      </section>

      <section className="case-section">
        <div className="case-label">Built</div>
        <div>
          <ul className="built-list">
            {project.built.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <section className="case-section">
        <div className="case-label">Architecture</div>
        <div><ProjectArchitecture items={project.architecture} /></div>
      </section>

      <section className="case-section">
        <div className="case-label">Approach</div>
        <div><p>{project.engineering}</p></div>
      </section>

      <section className="case-section">
        <div className="case-label">Result</div>
        <div>
          <p>{project.result}</p>
          <ProjectActions project={project} />
        </div>
      </section>
    </main>
  );
}

export function createCaseStudyPageDefinitions(): readonly ReactPageDefinition[] {
  return projects.map((project) => ({
    relative: projectOutputPath(project.slug),
    metadata: {
      title: `${project.name} — WizardGang`,
      description: `${project.narrative.tagline} ${project.narrative.what}`.slice(0, 300),
      path: projectPath(project.slug),
      socialImage: "/og.jpg"
    },
    body: caseStudyBody(project)
  }));
}
