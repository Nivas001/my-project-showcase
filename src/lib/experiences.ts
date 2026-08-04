export type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  employment_type: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  summary: string;
  highlights: string[];
  tech: string[];
  company_url: string | null;
  sort_order: number;
};

export type ExperienceInput = Omit<Experience, "id"> & { id?: string };

export const EXPERIENCE_COLUMNS =
  "id, role, company, location, employment_type, start_date, end_date, is_current, summary, highlights, tech, company_url, sort_order";

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Freelance",
  "Contract",
] as const;

export const emptyExperience: ExperienceInput = {
  role: "",
  company: "",
  location: "",
  employment_type: "Full-time",
  start_date: "",
  end_date: "",
  is_current: false,
  summary: "",
  highlights: [],
  tech: [],
  company_url: null,
  sort_order: 0,
};

/** "Jan 2026 — Present" style label for a role. */
export function experiencePeriod(experience: Pick<Experience, "start_date" | "end_date" | "is_current">) {
  const end = experience.is_current ? "Present" : experience.end_date;
  return [experience.start_date, end].filter(Boolean).join(" — ");
}
