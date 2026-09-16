import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { projectsQuery } from "@/lib/queries";
import { toAbsoluteUrl, canonical } from "@/lib/site";
import { ProjectCard } from "@/components/ProjectCard";
import {
  HandNote,
  HardButton,
  Marked,
  PageHero,
  SectionLabel,
  SplitLines,
  StatusDot,
} from "@/components/kit";
import { Reveal } from "@/components/Reveal";
import { PinnedProject } from "@/components/projects/PinnedProject";
import { BuildPipeline } from "@/components/projects/BuildPipeline";

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
    links: [canonical("/projects")],
  }),
  component: ProjectsPage,
});

/**
 * The work index, in three movements:
 *
 *   1. The pinned project, alone, with the whole screen.
 *   2. How a project gets built — seven stages, in 3D, on scroll.
 *   3. Everything else, filterable.
 *
 * Which project is pinned is decided in the admin (`featured`, then
 * `sort_order`), so the order here is editorial rather than hard-coded.
 */
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

  // The pin. `projects` already arrives ordered by sort_order, so the first
  // featured row is the one the admin put at the top.
  const pinned = useMemo(() => projects.find((p) => p.featured) ?? null, [projects]);

  const rest = useMemo(
    () => (pinned ? projects.filter((p) => p.id !== pinned.id) : projects),
    [projects, pinned],
  );

  const visible = rest.filter((project) => {
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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: rest.length };
    for (const p of rest) counts[p.category] = (counts[p.category] ?? 0) + 1;
    return counts;
  }, [rest]);

  const clear = () => {
    setFilter("All");
    setQuery("");
  };

  return (
    <>
      <PageHero
        index="00"
        label="Selected work"
        lines={["Everything", "I've built."]}
        lede={
          <>
            A property platform, a weekly magazine, commerce sites, mobile apps and one research
            model — each one{" "}
            <Marked kind="underline" tone="hog-red" delay={600}>
              designed, built and deployed by me
            </Marked>
            . Open any project for the full breakdown.
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

      {/* 1 — the pin. */}
      {pinned ? <PinnedProject project={pinned} /> : null}

      {/* 2 — how any of it gets made. */}
      <BuildPipeline />

      {/* 3 — the rest. */}
      <section
        id="all-projects"
        data-act="hog"
        className="act-hog relative border-t-[3px] border-ink"
      >
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <SectionLabel index="03">The rest of it</SectionLabel>
          </Reveal>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <SplitLines
              as="h2"
              onView
              lines={["Everything else", "worth showing."]}
              className="hero-md max-w-2xl text-foreground"
            />
            <Reveal delay={120}>
              <HandNote
                tone="hog-blue"
                rotate={-4}
                size="sm"
                arrow="swoop"
                arrowClassName="h-8 w-14"
              >
                filter by what you care about
              </HandNote>
            </Reveal>
          </div>

          {/* Filter bar — sticks under the menu bar while you scan the grid. */}
          <div className="sticky top-16 z-20 -mx-2 mt-8 rounded-lg border-2 border-border bg-card/85 px-3 py-3 backdrop-blur-xl hard-shadow sm:mx-0">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const active = filter === category;
                  const count = categoryCounts[category] ?? 0;
                  if (category !== "All" && count === 0) return null;
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
                        {count}
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
                  className="w-full rounded-md border-2 border-border bg-background py-2 pl-9 pr-8 font-mono text-xs text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:hard-shadow"
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
          </div>

          <p
            aria-live="polite"
            className="mt-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
          >
            {filtering
              ? `Showing ${visible.length} of ${rest.length}`
              : `${rest.length} more project${rest.length !== 1 ? "s" : ""}`}
          </p>

          {visible.length === 0 ? (
            <div className="mt-10 rounded-lg border-2 border-dashed border-border/40 p-12 text-center">
              <p className="display-sm text-foreground">Nothing matches that.</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Try a different category, or clear the search and browse everything.
              </p>
              <HardButton variant="secondary" size="md" className="mt-6" onClick={clear}>
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
                  style={{ "--line-delay": `${Math.min(index, 8) * 70}ms` } as React.CSSProperties}
                >
                  <ProjectCard project={project} index={index} />
                </div>
              ))}
            </div>
          )}

          {filtering && visible.length > 0 ? (
            <div className="mt-10 text-center">
              <HardButton variant="ghost" size="sm" onClick={clear}>
                Clear filters
              </HardButton>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
