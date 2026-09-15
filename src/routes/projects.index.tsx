import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { projectsQuery } from "@/lib/queries";
import { toAbsoluteUrl, shortTitle } from "@/lib/site";
import { ProjectCard } from "@/components/ProjectCard";
import { HardButton, PageHero, StatusDot } from "@/components/kit";
import { accentFor } from "@/lib/accents";
import { Reveal } from "@/components/Reveal";

const TITLE = "Work — Srinivas";
const DESCRIPTION =
  "Every project by Srinivas: live commerce platforms, Flutter mobile builds and NLP research, each with a full case study.";

export const Route = createFileRoute("/projects/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQuery),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projects } = useSuspenseQuery(projectsQuery);
  const [filter, setFilter] = useState<string>("All");
  const [query, setQuery] = useState("");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(projects.map((p) => p.category)))],
    [projects],
  );

  const liveCount = projects.filter(
    (p) => toAbsoluteUrl(p.live_url) && p.category !== "Research",
  ).length;

  // Featured projects shown as hero cards at the top (when no filter is active)
  const featured = useMemo(
    () => projects.filter((p) => p.featured),
    [projects],
  );

  const visible = projects.filter((project) => {
    const matchesCategory = filter === "All" || project.category === filter;
    const needle = query.trim().toLowerCase();
    const matchesQuery =
      !needle ||
      project.title.toLowerCase().includes(needle) ||
      project.summary.toLowerCase().includes(needle) ||
      project.tech.some((tech) => tech.toLowerCase().includes(needle));
    return matchesCategory && matchesQuery;
  });

  const filtering = filter !== "All" || query.trim() !== "";

  // When filtering, show all matches; otherwise show non-featured in the grid
  // (featured get their own hero strip)
  const gridProjects = filtering
    ? visible
    : visible.filter((p) => !p.featured);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: projects.length };
    for (const p of projects) {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    return counts;
  }, [projects]);

  return (
    <>
      <PageHero
        index="01"
        label="Selected work"
        lines={["Everything", "I've built."]}
        lede={
          <>
            Commerce platforms, mobile apps and one research model. Open any project for the full
            breakdown — architecture, screenshots, stack and links.
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
          <span>
            <span className="font-bold text-foreground">{projects.length}</span> projects
          </span>
          <span className="inline-flex items-center gap-2">
            <StatusDot />
            <span className="font-bold text-foreground">{liveCount}</span> in production
          </span>
          <span>
            <span className="font-bold text-foreground">
              {new Set(projects.flatMap((p) => p.tech)).size}
            </span>{" "}
            technologies
          </span>
        </div>
      </PageHero>

      <section data-act="hog" className="act-hog relative border-t-[3px] border-ink">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />

        {/* Featured hero strip — shown only when not actively filtering */}
        {!filtering && featured.length > 0 ? (
          <div className="relative border-b-2 border-border/15">
            <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
              <p className="mb-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Featured
              </p>
              <div className="grid gap-6 lg:grid-cols-2">
                {featured.map((project, i) => {
                  const cover = project.screenshots[0];
                  const accent = accentFor(i);
                  const live = toAbsoluteUrl(project.live_url);
                  return (
                    <Reveal key={project.id} delay={i * 80}>
                      <Link
                        to="/projects/$slug"
                        params={{ slug: project.slug }}
                        className="hog-card hog-card-hover group relative flex h-full flex-col overflow-hidden"
                      >
                        <span
                          aria-hidden
                          className="absolute left-0 top-0 h-full w-1"
                          style={{ background: `var(--${accent})` }}
                        />
                        <div className="relative aspect-[2/1] shrink-0 overflow-hidden border-b-2 border-border bg-secondary">
                          {cover ? (
                            <img
                              src={cover}
                              alt={`${project.title} screenshot`}
                              loading="lazy"
                              className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.05]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
                              {"</>"} no preview yet
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          <div className="absolute left-4 top-4 flex items-center gap-2">
                            <span className="rounded-full border-2 border-white/30 bg-black/50 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                              {project.category}
                            </span>
                            {live ? (
                              <span className="flex items-center gap-1.5 rounded-full border-2 border-white/30 bg-black/50 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                                <StatusDot />
                                Live
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-6">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="display-sm text-foreground">{shortTitle(project.title)}</h3>
                            <ArrowUpRight className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                          </div>
                          <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                            {project.summary}
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {project.tech.slice(0, 5).map((tech) => (
                              <span
                                key={tech}
                                className="rounded border border-border/25 bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground/80"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.tech.length > 5 ? (
                              <span className="px-1 py-0.5 font-mono text-[11px] text-muted-foreground">
                                +{project.tech.length - 5}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          {/* Filter bar */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const active = filter === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setFilter(category)}
                    aria-pressed={active}
                    className={`hog-press flex items-center gap-1.5 rounded-full border-2 border-border px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-widest transition-all duration-150 ${
                      active
                        ? "bg-primary text-primary-foreground hard-shadow"
                        : "bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] leading-none ${
                        active ? "bg-white/20 text-white" : "bg-border/30 text-muted-foreground"
                      }`}
                    >
                      {categoryCounts[category] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or tech…"
                aria-label="Search projects"
                className="w-full rounded-md border-2 border-border bg-card py-2 pl-9 pr-8 font-mono text-xs text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:hard-shadow"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {filtering
              ? `Showing ${visible.length} of ${projects.length}`
              : `${gridProjects.length} more project${gridProjects.length !== 1 ? "s" : ""}`}
          </p>

          {gridProjects.length === 0 && filtering ? (
            <div className="mt-10 rounded-lg border-2 border-dashed border-border/40 p-12 text-center">
              <p className="display-sm text-foreground">Nothing matches that.</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Try a different category, or clear the search and browse everything.
              </p>
              <HardButton
                variant="secondary"
                size="md"
                className="mt-6"
                onClick={() => {
                  setFilter("All");
                  setQuery("");
                }}
              >
                Clear filters
              </HardButton>
            </div>
          ) : gridProjects.length > 0 ? (
            <div
              key={`${filter}-${query}`}
              className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {gridProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="fade-rise min-w-0"
                  style={
                    {
                      "--line-delay": `${Math.min(index, 8) * 70}ms`,
                    } as React.CSSProperties
                  }
                >
                  <ProjectCard project={project} index={index} />
                </div>
              ))}
            </div>
          ) : null}

          {filtering && visible.length > 0 ? (
            <div className="mt-10 text-center">
              <HardButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilter("All");
                  setQuery("");
                }}
              >
                Clear filters
              </HardButton>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
