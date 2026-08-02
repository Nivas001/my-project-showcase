export type Project = {
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
};

export type ProjectInput = Omit<Project, "id"> & { id?: string };

export const PROJECT_CATEGORIES = ["Live", "Web", "Mobile", "Research", "Other"] as const;

export const SCREENSHOT_BUCKET = "project-screenshots";

export const PROJECT_COLUMNS =
  "id, slug, title, summary, description, highlights, tech, category, period, role, live_url, github_url, video_url, doc_url, doc_path, screenshots, designs, featured, sort_order";

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
  video_url: null,
  doc_url: null,
  doc_path: null,
  screenshots: [],
  designs: [],
  featured: false,
  sort_order: 0,
};
