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
  screenshots: string[];
  featured: boolean;
  sort_order: number;
};

export type ProjectInput = Omit<Project, "id"> & { id?: string };

export const PROJECT_CATEGORIES = ["Live", "Web", "Mobile", "Research", "Other"] as const;

export const SCREENSHOT_BUCKET = "project-screenshots";

export const PROJECT_COLUMNS =
  "id, slug, title, summary, description, highlights, tech, category, period, role, live_url, github_url, screenshots, featured, sort_order";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
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
  screenshots: [],
  featured: false,
  sort_order: 0,
};
