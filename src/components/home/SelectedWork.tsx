import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { heroProject, type Project } from "@/lib/projects";
import { toAbsoluteUrl, prettyUrl } from "@/lib/site";
import {
  BrowserFrame,
  HandNote,
  HardLink,
  HardRouteLink,
  SectionLabel,
  SplitLines,
  Sticker,
  StatusDot,
} from "@/components/kit";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { LiveProof } from "@/components/home/LiveProof";
import { Shot } from "@/components/Shot";

/**
 * The showcase proper. The lead project gets a wide feature card with browser
 * chrome; the rest fall into a standard grid.
 */
export function SelectedWork({ projects }: { projects: Project[] }) {
  // Opener already gave this one a browser frame two sections up; leading with
  // it again makes the page look like it only has one project.
  const alreadyShown = heroProject(projects)?.id;
  const pool = projects.filter((p) => p.id !== alreadyShown);

  const featured = pool.filter((p) => p.featured);
  const ordered = featured.length > 0 ? [...featured, ...pool.filter((p) => !p.featured)] : pool;
  const [lead, ...rest] = ordered;
  const shown = rest.slice(0, 3);

  if (!lead) return null;

  const leadUrl = toAbsoluteUrl(lead.live_url);

  return (
    <section data-act="hog" className="act-hog relative border-t-2 border-border/15">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <SectionLabel index="02">Selected work</SectionLabel>
        </Reveal>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <SplitLines
            as="h2"
            onView
            lines={["Things I built", "and still maintain."]}
            className="hero-md max-w-2xl text-foreground"
          />
          <Reveal delay={120}>
            <span className="flex flex-wrap items-center gap-3">
              <HandNote
                tone="hog-blue"
                rotate={-4}
                size="sm"
                arrow="swoop"
                arrowClassName="h-7 w-12"
              >
                and the rest in here
              </HandNote>
              <HardRouteLink to="/projects" variant="secondary" size="md">
                All {projects.length} projects
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </HardRouteLink>
            </span>
          </Reveal>
        </div>

        {/* Substantiates "and still maintain" directly under the line that
            claims it, rather than leaving it as a sentence. */}
        <LiveProof className="mt-8" />

        {/* Lead project — given the width it deserves. */}
        <Reveal delay={80}>
          <article className="hog-card mt-12 overflow-hidden">
            <div className="grid lg:grid-cols-[1fr_1.15fr]">
              <div className="flex flex-col justify-center gap-5 border-b-2 border-border p-6 sm:p-9 lg:border-b-0 lg:border-r-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Sticker tone="hog-red" rotate={-4}>
                    Featured
                  </Sticker>
                  {leadUrl ? (
                    <span className="sticker" style={{ transform: "rotate(2deg)" }}>
                      <StatusDot />
                      Live
                    </span>
                  ) : null}
                  <span className="font-mono text-[11px] text-muted-foreground">{lead.period}</span>
                </div>

                <h3 className="display-md text-foreground">{lead.title}</h3>
                <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
                  {lead.summary}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {lead.tech.slice(0, 7).map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-border/25 bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground/80"
                    >
                      {tech}
                    </span>
                  ))}
                  {lead.tech.length > 7 ? (
                    <span className="px-1 py-0.5 font-mono text-[11px] text-muted-foreground">
                      +{lead.tech.length - 7} more
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <HardRouteLink
                    to="/projects/$slug"
                    params={{ slug: lead.slug }}
                    variant="primary"
                    size="md"
                  >
                    Read the case study
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </HardRouteLink>
                  {leadUrl ? (
                    <HardLink
                      href={leadUrl}
                      target="_blank"
                      rel="noreferrer"
                      variant="ghost"
                      size="md"
                    >
                      Visit
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </HardLink>
                  ) : null}
                  {lead.github_visibility === "public" && lead.github_url ? (
                    <HardLink
                      href={lead.github_url}
                      target="_blank"
                      rel="noreferrer"
                      variant="ghost"
                      size="md"
                      aria-label={`${lead.title} source on GitHub`}
                    >
                      <Github className="h-4 w-4" />
                      Source
                    </HardLink>
                  ) : null}
                </div>
              </div>

              <div className="bg-secondary p-6 sm:p-9">
                <Link to="/projects/$slug" params={{ slug: lead.slug }} className="block">
                  <BrowserFrame
                    url={leadUrl ? prettyUrl(leadUrl) : lead.title}
                    className="hard-shadow"
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden bg-card">
                      <Shot src={lead.screenshots[0]} alt={`${lead.title} screenshot`} />
                    </div>
                  </BrowserFrame>
                </Link>
              </div>
            </div>
          </article>
        </Reveal>

        {shown.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((project, i) => (
              <Reveal key={project.id} delay={i * 100}>
                <ProjectCard project={project} index={i + 1} />
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
