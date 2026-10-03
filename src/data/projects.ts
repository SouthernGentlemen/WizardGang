export type ProjectSlug = "hexframe" | "yarreader";
export type ProjectId = ProjectSlug;
export type ProjectArchitectureItem = readonly [name: string, detail: string];
export type ProjectPreviewKind = "motion-controlled" | "static";
export type ProjectPreviewFixture = "product-recreation" | "synthetic-demo";

export const PROJECTS_ROOT = "/projects/" as const;

export function projectPath(slug: ProjectSlug): `/projects/${ProjectSlug}/` {
  return `${PROJECTS_ROOT}${slug}/`;
}

export function projectOutputPath(slug: ProjectSlug): `projects/${ProjectSlug}/index.html` {
  return `projects/${slug}/index.html`;
}

export interface ProjectNarrative {
  tagline: string;
  what: string;
  why: string;
  highlights: readonly string[];
}

export interface ProjectPreviewDefinition {
  id: string;
  kind: ProjectPreviewKind;
  fixture: ProjectPreviewFixture;
}

export interface ProjectCaseStudyDefinition {
  title: string;
}

export type ProjectActionSurface = "card" | "detail";
export type ProjectActionId = "project" | "live" | "evidence" | "source";

export interface ProjectAction {
  id: ProjectActionId;
  label: string;
  ariaLabel: string;
  href: string;
  external: boolean;
  primary: boolean;
}

export interface ProjectRecord {
  id: ProjectId;
  slug: ProjectSlug;
  name: string;
  number: string;
  eyebrow: string;
  summary: string;
  primaryCapability: string;
  technologies?: readonly string[];
  characteristics: readonly string[];
  tags: readonly string[];
  liveUrl: string | null;
  operationsUrl?: string;
  sourceUrl: string;
  preview: ProjectPreviewDefinition | null;
  caseStudy: ProjectCaseStudyDefinition | null;
  problem: string;
  built: readonly string[];
  architecture: readonly ProjectArchitectureItem[];
  engineering: string;
  result: string;
  narrative: ProjectNarrative;
}

export const projects = [
  {
    id: "hexframe",
    slug: "hexframe",
    name: "Hexframe",
    number: "01",
    eyebrow: "Deterministic systems",
    summary: "A browser fighting game where every hit has one repeatable result. It includes accessible controls, training tools, replays, computer players, and a foundation for future online play.",
    primaryCapability: "Deterministic combat simulation",
    characteristics: ["Deterministic simulation", "Rollback architecture", "WCAG 2.0 AA interfaces", "Training tools", "Accessible controls"],
    tags: ["Cloudflare", "TypeScript", "WCAG 2.0 AA"],
    liveUrl: "https://hexframe.wizardgang.ai/play/",
    sourceUrl: "https://github.com/Wizard-Gang/Hexframe",
    preview: { id: "hexframe-training", kind: "motion-controlled", fixture: "product-recreation" },
    caseStudy: { title: "Deterministic Fighting Game Systems" },
    problem: "The match, training screen, computer player, replay, saved game, and future online mode all need to agree about what happened. If each part calculates combat differently, a punch could hit in one view and miss in another. Hexframe therefore calculates the fight in one place and lets every feature read the same result.",
    built: [
      "A playable training stage with one fighter and one practice dummy",
      "Pause, play, or move forward and backward through the fight one frame at a time",
      "Freeze automatically when a hit connects so the exact contact can be inspected",
      "Show or hide hitboxes, hurtboxes, pushboxes, character origins, and skeletons",
      "Read damage, movement, hitstun, blockstun, and fighter state for the selected frame",
      "Save a position, capture its inputs, and replay the same scenario",
      "Use the lab with keyboard or gamepad and adjust focus, text size, contrast, color labels, and motion"
    ],
    architecture: [
      ["Controls", "Read player buttons and choices made by computer teammates"],
      ["Game rules", "Calculate movement, hits, damage, and status effects"],
      ["Saved state", "Store exact moments for saves, replays, and rollback"],
      ["Graphics", "Draw characters and effects from results that are already decided"]
    ],
    engineering: "Hexframe decides whether a hit landed before it draws the punch or spark. Training, replay, computer players, and future online play all read that same result. This keeps browser speed and visual timing from changing who won.",
    result: "You can play matches, build move sets, use accessible menus, train with frame data, save progress, and fight with computer teammates. Because every feature uses the same combat rules, the project can add characters, tools, and online play without rebuilding its foundation.",
    narrative: {
      tagline: "Fighting-game systems made deterministic and inspectable.",
      what: "A browser-based fighting-game system and engineering laboratory built around fixed-step combat, authored frame data, replayable state, rollback-ready boundaries, keyboard and gamepad parity, semantic menus, and accessible training tools.",
      why: "Fighting games compress hard engineering problems into a visible system: timing, input, simulation authority, animation, collision, debugging, accessibility, and tools all have to agree on what happened.",
      highlights: ["A playable stage with a practice dummy", "Pause-on-contact and frame-by-frame controls", "Hitbox, hurtbox, pushbox, and state inspection", "Saved positions and repeatable scenario replays", "Keyboard, gamepad, and accessible display settings"]
    },
  },
  {
    id: "yarreader",
    slug: "yarreader",
    name: "YarReader",
    number: "02",
    eyebrow: "Portable media pipeline",
    summary: "An offline comic and book library that turns mixed files into a checked, portable reader and can safely continue after a crash or interrupted copy.",
    primaryCapability: "Offline, recoverable media pipeline",
    technologies: ["TypeScript", "CLI", "Static HTML"],
    tags: ["TypeScript", "CLI", "Offline-first"],
    characteristics: ["Content addressing", "Crash recovery", "Verified exports", "Offline-first"],
    liveUrl: null,
    sourceUrl: "https://github.com/Wizard-Gang/YarReader",
    preview: { id: "yarreader-library", kind: "static", fixture: "synthetic-demo" },
    caseStudy: { title: "Portable Media Pipeline" },
    problem: "A single folder may contain comics, ebooks, PDFs, loose images, duplicate editions, and half-finished downloads. YarReader must protect the original files, recover after an interruption, and never replace the working library with an incomplete copy.",
    built: [
      "Readers for six common source types, including comic archives, ebooks, PDFs, and image folders",
      "A SHA-256 digital fingerprint for every file, so renamed copies can still be recognized",
      "Optional AI suggestions that must pass format checks and receive human approval",
      "A work journal that lets long copy and archive jobs continue after a crash",
      "The same page-conversion rules every time, producing versioned WebP images",
      "A complete new library is checked before it replaces the old one; the finished reader needs no server"
    ],
    architecture: [
      ["Inspect", "Open each source safely and record what it contains"],
      ["Identify", "Match the book using rules first, optional AI second, and a person when needed"],
      ["Convert", "Turn pages into consistent images with digital fingerprints"],
      ["Publish", "Check the entire new library before making it the active copy"]
    ],
    engineering: "All difficult work—opening formats, checking files, and converting pages—happens before the reader opens. The finished library is ordinary HTML and images with local links, so it can be copied to a drive and used without internet access.",
    result: "If a copy or conversion stops, YarReader continues from its work journal. Different editions keep clear identities. Every finished library is checked before use and never changes afterward. If generated files are lost, they can be rebuilt from the protected originals and catalog.",
    narrative: {
      tagline: "A portable media library that works without a server.",
      what: "A browser-based reading experience backed by a crash-recoverable pipeline that converts mixed publication formats into a verified, self-contained offline library.",
      why: "Portable archives fail when readers depend on a database, a network, or fragile application state. YarReader pushes complexity into the build pipeline so the activated library stays ordinary, durable, and movable.",
      highlights: ["CBZ, CBR, EPUB, PDF, and image adapters", "Content-addressed normalization", "Crash-recoverable transactions", "Immutable static exports with an offline reader"]
    },
  }
] as const satisfies readonly ProjectRecord[];


export function projectActionsFor(project: ProjectRecord, surface: ProjectActionSurface): readonly ProjectAction[] {
  const projectAction: ProjectAction = {
    id: "project",
    label: "View project",
    ariaLabel: `View ${project.name} project`,
    href: projectPath(project.slug),
    external: false,
    primary: true
  };
  const liveAction: ProjectAction | null = project.liveUrl ? {
    id: "live",
    label: "Open live demo",
    ariaLabel: `Open ${project.name} live demo`,
    href: project.liveUrl,
    external: true,
    primary: surface === "detail"
  } : null;
  const evidenceAction: ProjectAction | null = project.operationsUrl ? {
    id: "evidence",
    label: "Explore evidence",
    ariaLabel: `Explore ${project.name} operating evidence`,
    href: project.operationsUrl,
    external: true,
    primary: false
  } : null;
  const sourceAction: ProjectAction = {
    id: "source",
    label: "View source",
    ariaLabel: `View ${project.name} source on GitHub`,
    href: project.sourceUrl,
    external: true,
    primary: surface === "detail" && !liveAction
  };

  if (surface === "card") return [projectAction];
  return [...(liveAction ? [liveAction] : []), ...(evidenceAction ? [evidenceAction] : []), sourceAction];
}

function assertHttpsUrl(value: string, label: string): void {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error(`${label} must use HTTPS`);
}

function assertUniqueStrings(values: readonly string[] | undefined, label: string): void {
  if (!values) return;
  const normalized = values.map((value) => value.trim().toLowerCase());
  if (normalized.some((value) => !value)) throw new Error(`${label} contains an empty value`);
  if (new Set(normalized).size !== normalized.length) throw new Error(`${label} contains duplicate values`);
}

export function validateProjectRecords(records: readonly ProjectRecord[]): void {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const previewIds = new Set<string>();
  const routes = new Set<string>();

  for (const project of records) {
    if (!project.id.trim() || !project.slug.trim() || !project.name.trim() || !project.summary.trim() || !project.primaryCapability.trim()) {
      throw new Error(`Incomplete project record: ${project.slug || project.id}`);
    }
    if (project.id !== project.slug) throw new Error(`Project id and slug must match: ${project.id} / ${project.slug}`);
    if (ids.has(project.id)) throw new Error(`Duplicate project id: ${project.id}`);
    if (slugs.has(project.slug)) throw new Error(`Duplicate project slug: ${project.slug}`);
    ids.add(project.id);
    slugs.add(project.slug);

    assertHttpsUrl(project.sourceUrl, `${project.slug} sourceUrl`);
    if (project.liveUrl) assertHttpsUrl(project.liveUrl, `${project.slug} liveUrl`);
    if (project.operationsUrl) assertHttpsUrl(project.operationsUrl, `${project.slug} operationsUrl`);
    assertUniqueStrings(project.technologies, `${project.slug} technologies`);
    assertUniqueStrings(project.tags, `${project.slug} tags`);
    if (project.tags.length < 2) throw new Error(`Project needs at least two tags: ${project.slug}`);
    assertUniqueStrings(project.characteristics, `${project.slug} characteristics`);

    const entryPath = projectPath(project.slug);
    if (!entryPath.startsWith(PROJECTS_ROOT)) throw new Error(`Invalid canonical project path: ${entryPath}`);
    if (routes.has(entryPath)) throw new Error(`Duplicate project route: ${entryPath}`);
    routes.add(entryPath);

    if (project.caseStudy && !project.caseStudy.title.trim()) {
      throw new Error(`Empty case-study title: ${project.slug}`);
    }

    if (project.preview) {
      if (!project.preview.id.trim()) throw new Error(`Empty preview id: ${project.slug}`);
      if (previewIds.has(project.preview.id)) throw new Error(`Duplicate project preview id: ${project.preview.id}`);
      previewIds.add(project.preview.id);
      if (!["motion-controlled", "static"].includes(project.preview.kind)) throw new Error(`Invalid project preview kind: ${project.preview.kind}`);
      if (!["product-recreation", "synthetic-demo"].includes(project.preview.fixture)) throw new Error(`Invalid project preview fixture: ${project.preview.fixture}`);
    }
  }
}

validateProjectRecords(projects);

export const projectBySlug = new Map<ProjectSlug, ProjectRecord>(
  projects.map((project) => [project.slug, project] as const)
);

/** The Projects menu in the primary navigation. */
export const PROJECT_MENU: readonly { label: string; href: string; accessibleName?: string }[] =
  projects.map((project) => ({
    label: project.name,
    href: projectPath(project.slug),
    accessibleName: `${project.name} case study`
  }));
