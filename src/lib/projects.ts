export type GithubVisibility = "none" | "public" | "private";

export const GITHUB_VISIBILITIES: { value: GithubVisibility; label: string }[] = [
  { value: "none", label: "No repository" },
  { value: "public", label: "Public repository" },
  { value: "private", label: "Private repository" },
];

export type ProjectDownload = {
  platform: string;
  label: string;
  url: string;
};

export const DOWNLOAD_PLATFORMS = ["Android", "iOS", "Windows", "macOS", "Linux", "Other"] as const;

export function normaliseDownloads(value: unknown): ProjectDownload[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      platform: String(item["platform"] ?? "Other"),
      label: String(item["label"] ?? ""),
      url: String(item["url"] ?? ""),
    }))
    .filter((item) => item.url);
}

/**
 * One entry in a project's decision log.
 *
 * `highlights` says what the project does; this says why it is built the way
 * it is. The five fields are deliberately fixed rather than free prose — a
 * decision you cannot state as "I picked X over Y because Z, and it cost me W"
 * is usually one you have not actually made.
 */
export type ProjectDecision = {
  /** The constraint that forced a choice. */
  problem: string;
  /** The alternatives that lost. Does not include `chose` — list only what was rejected. */
  options: string[];
  /** What was picked. */
  chose: string;
  /** Why it won. */
  because: string;
  /** What it cost — the honest half. Blank is allowed; a lie is not. */
  cost: string;
};

/** Coerce a `decisions` jsonb column into the shape the page renders. */
export function normaliseDecisions(value: unknown): ProjectDecision[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      problem: String(item["problem"] ?? ""),
      options: Array.isArray(item["options"]) ? item["options"].map(String).filter(Boolean) : [],
      chose: String(item["chose"] ?? ""),
      because: String(item["because"] ?? ""),
      cost: String(item["cost"] ?? ""),
    }))
    .filter((item) => item.problem.trim() && item.chose.trim());
}

export type Project = {
  github_visibility: GithubVisibility;
  downloads: ProjectDownload[];
  decisions: ProjectDecision[];
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  highlights: string[];
  tech: string[];
  category: string;
  period: string;
  role: string;
  live_url: string | null;
  github_url: string | null;
  video_url: string | null;
  doc_url: string | null;
  doc_path: string | null;
  slides_url: string | null;
  slides_path: string | null;
  screenshots: string[];
  designs: string[];
  featured: boolean;
  sort_order: number;
};

/** What public pages receive: media fields are signed URLs, `*_paths` keep the raw storage paths. */
export type SignedProject = Project & {
  screenshot_paths: string[];
  design_paths: string[];
  doc_signed_url: string | null;
  slides_signed_url: string | null;
};

export type ProjectInput = Omit<Project, "id"> & { id?: string };

export const PROJECT_CATEGORIES = ["Live", "Web", "Mobile", "Research", "Other"] as const;

export const SCREENSHOT_BUCKET = "project-screenshots";

/**
 * Columns the `decisions` migration added. Selecting a column Postgres does
 * not have is a hard error, not a null, so the read path falls back to
 * PROJECT_COLUMNS_LEGACY when the migration has not been applied yet — the
 * site keeps serving, the decision log is simply empty.
 */
export const PROJECT_COLUMNS_LEGACY =
  "id, slug, title, summary, description, highlights, tech, category, period, role, live_url, github_url, github_visibility, downloads, video_url, doc_url, doc_path, slides_url, slides_path, screenshots, designs, featured, sort_order";

export const PROJECT_COLUMNS =
  "id, slug, title, summary, description, highlights, tech, category, period, role, live_url, github_url, github_visibility, downloads, decisions, video_url, doc_url, doc_path, slides_url, slides_path, screenshots, designs, featured, sort_order";

/**
 * The one project that leads the homepage, shown running in a browser frame.
 *
 * Lives here because two sections need to agree on it: Opener puts it in the
 * frame, and SelectedWork has to lead with something else — otherwise the same
 * project headlines the page twice in a row.
 */
export function heroProject<T extends Project>(projects: T[]): T | undefined {
  return (
    projects.find((p) => p.featured && p.live_url && p.screenshots.length > 0) ??
    projects.find((p) => p.screenshots.length > 0) ??
    projects[0]
  );
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Strip the signed-URL extras so a draft can be saved back to the database. */
export function toProjectInput(project: SignedProject | Project): ProjectInput {
  const {
    screenshot_paths,
    design_paths,
    doc_signed_url,
    slides_signed_url,
    screenshots,
    designs,
    ...rest
  } = project as SignedProject;
  return {
    ...rest,
    screenshots: screenshot_paths ?? screenshots ?? [],
    designs: design_paths ?? designs ?? [],
  };
}

export const emptyProject: ProjectInput = {
  slug: "",
  title: "",
  summary: "",
  description: "",
  highlights: [],
  tech: [],
  category: "Web",
  period: "",
  role: "",
  live_url: null,
  github_url: null,
  github_visibility: "none",
  downloads: [],
  decisions: [],
  video_url: null,
  doc_url: null,
  doc_path: null,
  slides_url: null,
  slides_path: null,
  screenshots: [],
  designs: [],
  featured: false,
  sort_order: 0,
};
