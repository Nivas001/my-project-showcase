import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Github } from "lucide-react";
import type { Project } from "@/lib/projects";
import { prettyUrl, shortTitle, toAbsoluteUrl } from "@/lib/site";
import {
  BrowserFrame,
  HandNote,
  HardLink,
  HardRouteLink,
  Marked,
  SectionLabel,
  SplitLines,
  StarMark,
  StatusDot,
  Sticker,
  TiltCard,
} from "@/components/kit";
import { Reveal } from "@/components/Reveal";
import { Shot } from "@/components/Shot";

/**
 * The pinned project — whatever is marked featured and sorted first in the
 * admin. It gets a whole screen before anything else, because a single real
 * product carries more weight than a grid of twelve thumbnails.
 *
 * The screenshot sits in browser chrome on a card that tilts under the
 * pointer, so the proof is the most physical thing on the page.
 */
export function PinnedProject({ project }: { project: Project }) {
  const live = toAbsoluteUrl(project.live_url);
  const cover = project.screenshots[0];

  return (
    <section data-act="hog" className="act-hog relative overflow-hidden border-t-[3px] border-ink">
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-32 h-[32rem] w-[32rem] rounded-full blur-[130px]"
        style={{
          background: "radial-gradient(circle, var(--hog-red) 0%, transparent 70%)",
          opacity: 0.12,
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <Reveal>
          <div className="flex flex-wrap items-center gap-4">
            <SectionLabel index="01" rule={false}>
              Pinned
            </SectionLabel>
            <span className="flex items-center gap-1.5">
              <StarMark tone="hog-yellow" className="h-4 w-4" />
              <span className="hand text-lg text-hog-yellow">the one to look at first</span>
            </span>
          </div>
        </Reveal>

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14">
          {/* Copy */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <Sticker tone="hog-red" rotate={-4}>
                Featured build
              </Sticker>
              {live ? (
                <span className="sticker" style={{ transform: "rotate(2deg)" }}>
                  <StatusDot />
                  Live
                </span>
              ) : null}
              <span className="font-mono text-[11px] text-muted-foreground">{project.period}</span>
            </div>

            <SplitLines
              as="h2"
              onView
              lines={[shortTitle(project.title)]}
              className="hero-md mt-5 text-foreground"
            />

            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              {project.summary}
            </p>

            {project.highlights.length > 0 ? (
              <ul className="mt-6 space-y-2">
                {project.highlights.slice(0, 3).map((highlight, i) => (
                  <Reveal key={highlight} delay={i * 80} as="li">
                    <span className="flex items-start gap-2.5 text-[14px] leading-relaxed text-foreground/85">
                      <span
                        aria-hidden
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      />
                      {highlight}
                    </span>
                  </Reveal>
                ))}
              </ul>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-1.5">
              {project.tech.slice(0, 8).map((tech) => (
                <span
                  key={tech}
                  className="rounded border border-border/25 bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground/80"
                >
                  {tech}
                </span>
              ))}
              {project.tech.length > 8 ? (
                <span className="px-1 py-0.5 font-mono text-[11px] text-muted-foreground">
                  +{project.tech.length - 8} more
                </span>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <HardRouteLink
                to="/projects/$slug"
                params={{ slug: project.slug }}
                variant="primary"
                size="lg"
              >
                Read the case study
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </HardRouteLink>
              {live ? (
                <HardLink
                  href={live}
                  target="_blank"
                  rel="noreferrer"
                  variant="secondary"
                  size="lg"
                >
                  Visit {prettyUrl(live)}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </HardLink>
              ) : null}
              {project.github_visibility === "public" && project.github_url ? (
                <HardLink
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  variant="ghost"
                  size="lg"
                  aria-label={`${project.title} source on GitHub`}
                >
                  <Github className="h-4 w-4" />
                  Source
                </HardLink>
              ) : null}
            </div>
          </div>

          {/* Proof */}
          <Reveal delay={120} className="relative min-w-0">
            <div className="pointer-events-none absolute -top-10 right-4 z-10 hidden lg:block">
              <HandNote
                tone="hog-blue"
                rotate={-6}
                size="sm"
                arrow="curve"
                arrowClassName="h-8 w-9"
              >
                real screenshot, real site
              </HandNote>
            </div>

            <Link
              to="/projects/$slug"
              params={{ slug: project.slug }}
              aria-label={`Open the ${project.title} case study`}
              className="block"
            >
              <TiltCard max={6} lift={18}>
                <BrowserFrame url={live ? prettyUrl(live) : project.title}>
                  <div className="aspect-[16/10] w-full overflow-hidden bg-secondary">
                    <Shot
                      src={cover}
                      alt={`${project.title} screenshot`}
                      loading="eager"
                      label="no preview uploaded yet"
                    />
                  </div>
                </BrowserFrame>
              </TiltCard>
            </Link>

            <p className="mt-4 text-center font-mono text-[11px] text-muted-foreground">
              <Marked kind="line" tone="hog-red" delay={400}>
                {project.role || "Designed, built and deployed solo"}
              </Marked>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
