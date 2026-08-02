import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Github, Globe } from "lucide-react";
import type { Project } from "@/lib/projects";

export function ProjectCard({ project }: { project: Project }) {
  const cover = project.screenshots[0];

  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="glow-card group flex flex-col overflow-hidden rounded-md border border-border bg-card"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-raised">
        {cover ? (
          <img
            src={cover}
            alt={`${project.title} screenshot`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted-foreground">
            {"</>"} no preview yet
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-sm border border-border bg-background/85 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {project.category}
          </span>
          {project.live_url ? (
            <span className="flex items-center gap-1 rounded-sm border border-accent/50 bg-background/85 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              live
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-tight text-foreground">{project.title}</h3>
          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
        </div>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>

        <div className="flex flex-wrap gap-1.5">
          {project.tech.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="rounded-sm bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground/80"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-3 font-mono text-[11px] text-muted-foreground">
          <span>{project.period}</span>
          <span className="flex items-center gap-2">
            {project.github_visibility === "public" && project.github_url ? (
              <Github className="h-3.5 w-3.5" />
            ) : null}
            {project.live_url ? <Globe className="h-3.5 w-3.5" /> : null}
          </span>
        </div>
      </div>
    </Link>
  );
}
