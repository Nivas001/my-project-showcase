import { FlaskConical, Globe, Monitor, Smartphone } from "lucide-react";
import type { Project } from "@/lib/projects";
import { shortTitle } from "@/lib/site";

const ICONS = { mobile: Smartphone, desktop: Monitor, research: FlaskConical } as const;

/**
 * The cover for a project that has no screenshot.
 *
 * Some work has nothing to photograph — a mobile app from before this site, a
 * desktop tool that only lives on my machine. Rather than a "no preview" box,
 * it gets a typographic cover in the card's accent: the name, the first few
 * technologies and a large faint glyph for the kind of project. Sizes are in
 * container units, so the same cover reads in a grid card and in a hero frame.
 */
export function ProjectPoster({
  project,
  accent = "hog-red",
}: {
  project: Pick<Project, "title" | "category" | "tech">;
  accent?: string;
}) {
  const Icon = ICONS[project.category.toLowerCase() as keyof typeof ICONS] ?? Globe;
  const tint = `var(--${accent})`;

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-secondary"
      style={{
        containerType: "inline-size",
        backgroundImage: `radial-gradient(120% 90% at 100% 0%, color-mix(in oklch, ${tint} 30%, transparent), transparent 62%)`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklch, var(--foreground) 24%, transparent) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          maskImage: "linear-gradient(160deg, black 10%, transparent 75%)",
        }}
      />
      <Icon
        aria-hidden
        strokeWidth={1}
        className="absolute -bottom-[14%] -right-[6%] h-auto"
        style={{ width: "58cqw", color: `color-mix(in oklch, ${tint} 38%, transparent)` }}
      />
      <div className="relative flex h-full flex-col justify-end p-[6cqw]">
        <p
          className="line-clamp-3 max-w-[78%] font-display font-bold tracking-tight text-foreground"
          style={{ fontSize: "clamp(18px, 7.5cqw, 72px)", lineHeight: 0.98 }}
        >
          {shortTitle(project.title)}
        </p>
        <p
          className="mt-[2.4cqw] truncate font-mono uppercase tracking-widest"
          style={{ fontSize: "max(9px, 2.3cqw)", color: tint }}
        >
          {project.tech.slice(0, 3).join(" · ")}
        </p>
      </div>
    </div>
  );
}
