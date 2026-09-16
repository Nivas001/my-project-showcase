import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Github, Globe } from "lucide-react";
import type { Project } from "@/lib/projects";
import { shortTitle, toAbsoluteUrl } from "@/lib/site";
import { StatusDot, TiltCard } from "@/components/kit";
import { Shot } from "@/components/Shot";
import { accentFor } from "@/lib/accents";
import { cn } from "@/lib/utils";

/**
 * A project in the grid.
 *
 * The card tilts toward the pointer and the cover pushes forward on its own Z
 * plane, so the image sits slightly proud of the frame rather than flat inside
 * it. Everything here is decorative: the whole card is one link, and under
 * reduced motion or on touch the tilt never engages.
 */
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
    <TiltCard max={5} lift={10} className={cn("h-full", className)}>
      <Link
        to="/projects/$slug"
        params={{ slug: project.slug }}
        className="hog-card hog-card-hover group flex h-full flex-col overflow-hidden"
      >
        {/* Accent bar */}
        <span
          aria-hidden
          className="h-1.5 w-full shrink-0 transition-all duration-300 group-hover:h-2.5"
          style={{ background: `var(--${accent})` }}
        />

        {/* Cover image with hover overlay */}
        <div className="relative aspect-[16/10] shrink-0 overflow-hidden border-b-2 border-border bg-secondary">
          <Shot
            src={cover}
            alt={`${project.title} screenshot`}
            accent={accent}
            imgClassName="transition-transform duration-700 group-hover:scale-[1.07]"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Tech stack preview — slides up on hover */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
            <div className="flex flex-wrap gap-1">
              {project.tech.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px] text-white backdrop-blur-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
            {/* "Live" as a category and "Live" as a status are the same word;
                showing both put it on the card twice. The status pill wins —
                it carries the indicator dot. */}
            {project.category.toLowerCase() === "live" && live ? null : (
              <span className="rounded-full border-2 border-border bg-card px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                {project.category}
              </span>
            )}
            {live ? (
              <span className="flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                <StatusDot />
                Live
              </span>
            ) : null}
          </div>

          {/* Index, top right — reads like a plate number on a catalogue entry. */}
          <span
            aria-hidden
            className="absolute right-3 top-3 font-display text-2xl font-bold leading-none tracking-tighter text-white/0 transition-colors duration-300 group-hover:text-white/80"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="display-sm text-foreground">{shortTitle(project.title)}</h3>
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
    </TiltCard>
  );
}
