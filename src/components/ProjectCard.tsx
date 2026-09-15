import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Github, Globe } from "lucide-react";
import type { Project } from "@/lib/projects";
import { toAbsoluteUrl } from "@/lib/site";
import { StatusDot } from "@/components/kit";
import { accentFor } from "@/lib/accents";
import { cn } from "@/lib/utils";

export function ProjectCard({
  project,
  index = 0,
  className,
}: {
  project: Project;
  index?: number;
  className?: string;
}) {
  const cover = project.screenshots[0];
  const accent = accentFor(index);
  const live = toAbsoluteUrl(project.live_url);

  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className={cn(
        "hog-card hog-card-hover group flex h-full flex-col overflow-hidden",
        className,
      )}
    >
      {/* Colour bar — the cheapest way to make a grid of cards feel authored. */}
      <span
        aria-hidden
        className="h-1.5 w-full shrink-0"
        style={{ background: `var(--${accent})` }}
      />

      <div className="relative aspect-[16/10] shrink-0 overflow-hidden border-b-2 border-border bg-secondary">
        {cover ? (
          <img
            src={cover}
            alt={`${project.title} screenshot`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted-foreground">
            {"</>"} no preview yet
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border-2 border-border bg-card px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
            {project.category}
          </span>
          {live ? (
            <span className="flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
              <StatusDot />
              Live
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="display-sm text-foreground">{project.title}</h3>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>

        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="rounded border border-border/25 bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground/80"
            >
              {tech}
            </span>
          ))}
          {project.tech.length > 4 ? (
            <span className="px-1 py-0.5 font-mono text-[11px] text-muted-foreground">
              +{project.tech.length - 4}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t-2 border-border/15 pt-3 font-mono text-[11px] text-muted-foreground">
          <span className="truncate">{project.period}</span>
          <span className="flex shrink-0 items-center gap-2">
            {project.github_visibility === "public" && project.github_url ? (
              <Github className="h-3.5 w-3.5" />
            ) : null}
            {live ? <Globe className="h-3.5 w-3.5" /> : null}
          </span>
        </div>
      </div>
    </Link>
  );
}
