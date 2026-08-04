import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { projectsQuery } from "@/lib/queries";
import { ProjectCard } from "@/components/ProjectCard";

export const Route = createFileRoute("/projects/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQuery),
  head: () => ({
    meta: [
      { title: "Projects — Srinivas M" },
      {
        name: "description",
        content:
          "Every project by Srinivas M: live web apps, Flutter mobile builds and NLP research, each with its own detailed case study page.",
      },
      { property: "og:title", content: "Projects — Srinivas M" },
      {
        property: "og:description",
        content: "Live web apps, Flutter mobile builds and NLP research case studies.",
      },
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

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        // ls ~/projects
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Projects</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Pick any project to open its own page with the full breakdown, screenshots, tech stack and
        links.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              className={`rounded-sm border px-3 py-1.5 font-mono text-xs transition-all duration-200 ${
                filter === category
                  ? "border-primary bg-primary/15 text-foreground shadow-[var(--shadow-glow)]"
                  : "border-border text-muted-foreground hover:-translate-y-0.5 hover:border-primary/60 hover:text-foreground"
              }`}
            >
              {category.toLowerCase()}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="grep by name or tech…"
          aria-label="Search projects"
          className="w-full rounded-sm border border-border bg-card px-3 py-2 font-mono text-xs text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:shadow-[var(--shadow-glow)] sm:w-64"
        />
      </div>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {visible.length} of {projects.length} projects
      </p>

      {visible.length === 0 ? (
        <div className="mt-12 rounded-md border border-dashed border-border bg-card/40 p-8 text-center font-mono text-sm text-muted-foreground">
          <p className="text-accent">{"// 0 results"}</p>
          <p className="mt-2">Nothing matches that filter yet.</p>
          <button
            type="button"
            onClick={() => {
              setFilter("All");
              setQuery("");
            }}
            className="mt-4 rounded-sm border border-border px-3 py-1.5 text-xs transition-colors hover:border-primary hover:text-accent"
          >
            clear filters
          </button>
        </div>
      ) : (
        <div
          key={`${filter}-${query}`}
          className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((project, index) => (
            <div
              key={project.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
