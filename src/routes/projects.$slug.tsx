import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Download, ExternalLink, FileText, Github, Lock } from "lucide-react";
import { Expandable } from "@/components/Expandable";
import { projectQuery } from "@/lib/queries";
import { VideoEmbed } from "@/components/VideoEmbed";
import { DocViewer } from "@/components/DocViewer";
import { DesignBoard } from "@/components/DesignBoard";
import { ScreenshotCarousel } from "@/components/ScreenshotCarousel";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(projectQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Project not found — Srinivas M" }, { name: "robots", content: "noindex" }],
      };
    }
    const { project } = loaderData;
    const title = `${project.title} — Srinivas M`;
    const image = project.screenshots.find((url) => url.startsWith("https://"));
    return {
      meta: [
        { title },
        { name: "description", content: project.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: project.summary },
        { property: "og:type", content: "article" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
    };
  },
  notFoundComponent: ProjectMissing,
  errorComponent: ProjectMissing,
  component: ProjectDetail,
});

function ProjectMissing() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="font-mono text-2xl font-bold">project not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This project may have been renamed or removed.
      </p>
      <Link to="/projects" className="mt-6 inline-block font-mono text-sm text-accent hover:underline">
        ← back to all projects
      </Link>
    </div>
  );
}

function CollapsibleSummary({ text }: { text: string }) {
  return (
    <div className="mt-4 max-w-2xl">
      <Expandable collapsedLines={3} lineHeight={26}>
        <p className="text-base leading-relaxed text-muted-foreground">{text}</p>
      </Expandable>
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-4">
        <Expandable collapsedLines={3} lineHeight={26}>
          {children}
        </Expandable>
      </div>
    </section>
  );
}

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(projectQuery(slug));
  if (!data) return <ProjectMissing />;
  const { project, prev, next } = data;
  const docUrl = project.doc_url || project.doc_signed_url || null;



  return (
    <article className="mx-auto max-w-4xl px-5 py-16">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> all projects
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="rounded-sm border border-border px-2 py-0.5">{project.category}</span>
          <span>{project.period}</span>
          {project.role ? <span>· {project.role}</span> : null}
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          {project.title}
        </h1>
        <CollapsibleSummary text={project.summary} />

        <div className="mt-6 flex flex-wrap gap-3">
          {project.live_url ? (
            <a
              href={project.live_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4" /> Go to the site
            </a>
          ) : null}
          {project.github_visibility === "public" && project.github_url ? (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary"
            >
              <Github className="h-4 w-4" /> Source code
            </a>
          ) : null}
          {docUrl ? (
            <a
              href={docUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary"
            >
              <FileText className="h-4 w-4" /> Documentation / slides
            </a>
          ) : null}
        </div>

        <div className="mt-4">
          {project.github_visibility === "private" ? (
            <span className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface-raised px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3 text-accent" /> repository is private — source kept secured
            </span>
          ) : project.github_visibility === "none" ? (
            <span className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface-raised px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
              <Github className="h-3 w-3" /> no public repository for this project
            </span>
          ) : null}
        </div>

        {project.downloads.length > 0 ? (
          <div className="mt-6">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              // downloads
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.downloads.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface-raised px-4 py-2 text-sm transition-colors hover:border-primary"
                >
                  <Download className="h-4 w-4 text-accent" />
                  <span>{item.label || `${item.platform} app`}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {item.platform}
                  </span>
                </a>
              ))}
            </div>
          </div>
        ) : null}

      </header>

      {project.video_url ? (
        <section className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            // demo
          </h2>
          <div className="mt-4">
            <VideoEmbed url={project.video_url} title={project.title} />
          </div>
        </section>
      ) : null}


      <section className="mt-12 rounded-md border border-border bg-card p-5 font-mono text-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">// stack</p>
        <div className="mt-3 space-y-1">
          {project.tech.map((tech) => (
            <div key={tech}>
              <span className="text-primary">import</span>{" "}
              <span className="text-foreground">{tech}</span>{" "}
              <span className="text-muted-foreground">from</span>{" "}
              <span className="text-accent">&apos;{project.slug}&apos;</span>
            </div>
          ))}
        </div>
      </section>

      {project.description ? (
        <CollapsibleSection title="// overview">
          <div className="space-y-4 text-[15px] leading-relaxed text-foreground/85">
            {project.description.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </CollapsibleSection>
      ) : null}

      {project.highlights.length > 0 ? (
        <CollapsibleSection title="// highlights">
          <ul className="space-y-3">
            {project.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3 text-[15px] leading-relaxed">
                <span className="mt-1 font-mono text-accent">▹</span>
                <span className="text-foreground/85">{highlight}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      ) : null}

      {project.screenshots.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            // screenshots
          </h2>
          <div className="mt-4">
            <ScreenshotCarousel images={project.screenshots} title={project.title} />
          </div>
        </section>
      ) : null}

      {project.designs.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            // design pages
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every page of the design on one canvas — zoom and pan to explore.
          </p>
          <div className="mt-4">
            <DesignBoard images={project.designs} title={project.title} />
          </div>
        </section>
      ) : null}

      {docUrl ? (
        <section className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {/(\.(ppt|pptx|key|odp)(\?|$)|[?&]ext=(ppt|pptx|key|odp)(&|$))/i.test(docUrl) ||
            docUrl.includes("/presentation/d/")
              ? "// slides"
              : "// documentation"}
          </h2>
          <div className="mt-4">
            <DocViewer url={docUrl} title={project.title} />
          </div>
        </section>
      ) : null}



      <nav className="mt-16 grid gap-3 border-t border-border/70 pt-6 sm:grid-cols-2">
        {prev ? (
          <Link
            to="/projects/$slug"
            params={{ slug: prev.slug }}
            className="group rounded-md border border-border p-4 transition-colors hover:border-primary"
          >
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <ArrowLeft className="h-3 w-3" /> previous
            </span>
            <span className="mt-1 block text-sm font-medium group-hover:text-accent">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/projects/$slug"
            params={{ slug: next.slug }}
            className="group rounded-md border border-border p-4 text-right transition-colors hover:border-primary"
          >
            <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] text-muted-foreground">
              next <ArrowRight className="h-3 w-3" />
            </span>
            <span className="mt-1 block text-sm font-medium group-hover:text-accent">
              {next.title}
            </span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
