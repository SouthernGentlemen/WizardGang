import type { ReactPageDefinition } from "../app/contracts";
import { PROJECTS_ROOT, projectActionsFor, projectPath, projects } from "../data/projects";

/* The Projects index. The navigation menu lists the same case studies, so
   this page exists for the click on "Projects" itself — it says what the work is
   before asking anyone to pick one. */
export const PROJECTS_PAGE: ReactPageDefinition = {
  relative: "projects/index.html",
  metadata: {
    title: "Projects — WizardGang",
    description: "Hexframe: open-source software WizardGang builds and operates, with source, case study and a live application.",
    path: PROJECTS_ROOT,
    socialImage: "/og.jpg"
  },
  body: (
    <main className="site-main" id="main" tabIndex={-1}>
      <section className="page-hero">
        <h1>Projects</h1>
        <p>
          Open-source software WizardGang builds and operates. Explore the source and case study
          for each project, and open its live application where available.
        </p>
      </section>

      <ul className="index-list">
        {projects.map((project) => {
          const live = projectActionsFor(project, "detail").find((action) => action.id === "live");
          return (
            <li key={project.slug}>
              <a className="index-entry" href={projectPath(project.slug)}>
                <span className="index-number">{project.number}</span>
                <span className="index-body">
                  <span className="index-name">{project.name}</span>
                  <span className="index-eyebrow">{project.eyebrow}</span>
                  <span className="index-detail">{project.narrative.tagline}</span>
                  <span className="index-tags">
                    {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </span>
                </span>
                <span className="index-go" aria-hidden="true">→</span>
              </a>
              {live ? (
                <a className="index-aside" href={live.href} aria-label={live.ariaLabel}>
                  {live.label} <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </main>
  )
};
