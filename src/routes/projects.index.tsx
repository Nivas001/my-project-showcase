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
              className={`rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors ${
                filter === category
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
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
          className="w-full rounded-sm border border-border bg-card px-3 py-2 font-mono text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary sm:w-64"
        />
      </div>

      {visible.length === 0 ? (
        <p className="mt-16 font-mono text-sm text-muted-foreground">
          No projects match that filter yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
