import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { projectsQuery } from "@/lib/queries";
import { toAbsoluteUrl } from "@/lib/site";
import { ProjectCard } from "@/components/ProjectCard";
import { HardButton, PageHero, StatusDot } from "@/components/kit";

const TITLE = "Work — Srinivas M";
const DESCRIPTION =
  "Every project by Srinivas M: live commerce platforms, Flutter mobile builds and NLP research, each with a full case study.";

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
                    className={`hog-press rounded-full border-2 border-border px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-widest ${
                      active
                        ? "bg-primary text-primary-foreground hard-shadow"
                        : "bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category}
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
            Showing {visible.length} of {projects.length}
          </p>

          {visible.length === 0 ? (
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
          ) : (
            <div
              key={`${filter}-${query}`}
              className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visible.map((project, index) => (
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
          )}

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
