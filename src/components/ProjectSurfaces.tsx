import {
  projectActionsFor,
  type ProjectArchitectureItem,
  type ProjectRecord
} from "../data/projects";
import { ProjectPreview } from "./ProjectPreviews";

function Arrow({ external }: { external: boolean }) {
  return <span aria-hidden="true">{external ? "↗" : "→"}</span>;
}

/* A case study's outbound actions: the live application first where one
   exists, then evidence, then source. */
export function ProjectActions({ project }: { project: ProjectRecord }) {
  return (
    <div className="button-row">
      {projectActionsFor(project, "detail").map((action) => (
        <a
          className={`button${action.primary ? " button-primary" : ""}`}
          data-project-action={action.id}
          data-primary={action.primary ? "true" : undefined}
          href={action.href}
          aria-label={action.ariaLabel}
          key={action.id}
        >
          {action.label} <Arrow external={action.external} />
        </a>
      ))}
    </div>
  );
}

export function ProjectArchitecture({ items }: { items: readonly ProjectArchitectureItem[] }) {
  return (
    <div className="architecture">
      {items.map(([name, detail]) => <div key={name}><strong>{name}</strong><span>{detail}</span></div>)}
    </div>
  );
}

export function ProjectVisualFrame({ project }: { project: ProjectRecord }) {
  if (!project.preview) return null;
  return (
    <div
      className="case-visual"
      aria-hidden="true"
      inert
      data-preview-id={project.preview.id}
      data-preview-kind={project.preview.kind}
      data-preview-fixture={project.preview.fixture}
    >
      <ProjectPreview project={project} />
    </div>
  );
}

/* The homepage work list. Each entry is a disclosure: the card header is the
   control, and the preview lives inside the panel so nothing animates until a
   visitor asks for it. `name` makes the set exclusive, so at most one preview
   ever runs. */
export function WorkRow({ project }: { project: ProjectRecord }) {
  const actions = projectActionsFor(project, "card");
  const detail = actions.find((candidate) => candidate.id === "project");
  const live = projectActionsFor(project, "detail").find((candidate) => candidate.id === "live");
  return (
    <details className="work-row" name="work-list">
      <summary className="work-summary">
        <span className="work-number">{project.number}</span>
        <span className="work-identity">
          <span className="work-name">{project.name}</span>
          <span className="work-eyebrow">{project.eyebrow}</span>
        </span>
        <span className="work-tagline">{project.narrative.tagline}</span>
        <span className="work-tags">
          {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </span>
        <span className="work-disclose" aria-hidden="true">
          <svg viewBox="0 0 16 16" focusable="false"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </summary>
      <div className="work-panel">
        {project.preview ? (
          <div
            className="work-visual"
            aria-hidden="true"
            inert
            data-preview-id={project.preview.id}
            data-preview-kind={project.preview.kind}
            data-preview-fixture={project.preview.fixture}
          >
            <ProjectPreview project={project} />
          </div>
        ) : null}
        <div className="work-actions">
          {detail ? (
            <a className="button button-primary" href={detail.href} aria-label={detail.ariaLabel} data-project-action={detail.id}>
              {detail.label} <span aria-hidden="true">→</span>
            </a>
          ) : null}
          {live ? (
            <a className="button" href={live.href} aria-label={live.ariaLabel} data-project-action={live.id}>
              {live.label} <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </div>
    </details>
  );
}
