import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
  FileText,
  Github,
  Lock,
  Presentation,
} from "lucide-react";
import { projectQuery } from "@/lib/queries";
import { toAbsoluteUrl, prettyUrl } from "@/lib/site";
import { VideoEmbed } from "@/components/VideoEmbed";
import { DocViewer } from "@/components/DocViewer";
import { DesignBoard } from "@/components/DesignBoard";
import { ScreenshotCarousel } from "@/components/ScreenshotCarousel";
import {
  BrowserFrame,
  HardLink,
  HardRouteLink,
  SectionLabel,
  SplitLines,
  StatusDot,
  Sticker,
} from "@/components/kit";
import { Reveal } from "@/components/Reveal";

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
    <section
      data-act="noir"
      className="act-noir grain flex min-h-svh flex-col items-center justify-center px-5 text-center"
    >
      <div aria-hidden className="hairline-grid pointer-events-none absolute inset-0 opacity-40" />
      <p className="micro relative text-hog-red">Not found</p>
      <h1 className="display-lg relative mt-4 text-foreground">
        No such project<span className="text-hog-red">.</span>
      </h1>
      <p className="relative mt-5 max-w-sm text-base text-muted-foreground">
        It may have been renamed or removed.
      </p>
      <HardRouteLink to="/projects" variant="invert" size="md" className="relative mt-8">
        <ArrowLeft className="h-4 w-4" />
        All projects
      </HardRouteLink>
    </section>
  );
}

/** A labelled block in the cream body. */
function Block({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 first:mt-0">
      <Reveal>
        <SectionLabel index={index}>{label}</SectionLabel>
      </Reveal>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(projectQuery(slug));
  if (!data) return <ProjectMissing />;

  const { project, prev, next } = data;
  const docUrl = project.doc_url || project.doc_signed_url || null;
  const slidesUrl = project.slides_url || project.slides_signed_url || null;
  const liveUrl = toAbsoluteUrl(project.live_url);
  const cover = project.screenshots[0];

  // Numbered so the case study reads as a document, not a pile of sections.
  let step = 0;
  const nextIndex = () => String(++step).padStart(2, "0");

  return (
    <article>
      {/* ---------------------------------------------------------------- */}
      {/* Act I — the title card                                            */}
      {/* ---------------------------------------------------------------- */}
      <section data-act="noir" className="act-noir grain relative overflow-hidden">
        <div
          aria-hidden
          className="hairline-grid pointer-events-none absolute inset-0 opacity-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-0 h-[26rem] w-[26rem] rounded-full blur-[110px]"
          style={{
            background: "radial-gradient(circle, var(--hog-red) 0%, transparent 70%)",
            opacity: 0.14,
          }}
        />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32">
          <Link
            to="/projects"
            className="nav-link inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All projects
          </Link>

          <div className="mt-8 grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {project.category}
                </span>
                {liveUrl ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-hog-green/40 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                    <StatusDot />
                    Live
                  </span>
                ) : null}
                <span className="font-mono text-[11px] text-muted-foreground">
                  {project.period}
                </span>
                {project.role ? (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    · {project.role}
                  </span>
                ) : null}
              </div>

              <SplitLines
                as="h1"
                lines={[project.title]}
                className="display-lg mt-5 text-foreground"
              />

              <p
                className="fade-rise mt-6 max-w-xl text-base leading-relaxed text-muted-foreground"
                style={{ "--line-delay": "260ms" } as React.CSSProperties}
              >
                {project.summary}
              </p>

              <div
                className="fade-rise mt-8 flex flex-wrap gap-3"
                style={{ "--line-delay": "340ms" } as React.CSSProperties}
              >
                {liveUrl ? (
                  <HardLink
                    href={liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    variant="invert"
                    size="md"
                  >
                    Visit {prettyUrl(liveUrl)}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </HardLink>
                ) : null}
                {project.github_visibility === "public" && project.github_url ? (
                  <HardLink
                    href={project.github_url}
                    target="_blank"
                    rel="noreferrer"
                    variant="ghost"
                    size="md"
                  >
                    <Github className="h-4 w-4" />
                    Source
                  </HardLink>
                ) : null}
                {docUrl ? (
                  <HardLink
                    href={docUrl}
                    target="_blank"
                    rel="noreferrer"
                    variant="ghost"
                    size="md"
                  >
                    <FileText className="h-4 w-4" />
                    Documentation
                  </HardLink>
                ) : null}
                {slidesUrl ? (
                  <HardLink
                    href={slidesUrl}
                    target="_blank"
                    rel="noreferrer"
                    variant="ghost"
                    size="md"
                  >
                    <Presentation className="h-4 w-4" />
                    Slides
                  </HardLink>
                ) : null}
              </div>

              {project.github_visibility !== "public" ? (
                <p className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                  {project.github_visibility === "private" ? (
                    <>
                      <Lock className="h-3 w-3 text-hog-red" />
                      Repository is private — source kept secured
                    </>
                  ) : (
                    <>
                      <Github className="h-3 w-3" />
                      No public repository for this project
                    </>
                  )}
                </p>
              ) : null}
            </div>

            {cover ? (
              <div
                className="fade-rise min-w-0"
                style={{ "--line-delay": "420ms" } as React.CSSProperties}
              >
                <BrowserFrame url={liveUrl ? prettyUrl(liveUrl) : project.title}>
                  <div className="aspect-[16/10] w-full overflow-hidden bg-secondary">
                    <img src={cover} alt="" className="h-full w-full object-cover object-top" />
                  </div>
                </BrowserFrame>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Act II — the working surface                                      */}
      {/* ---------------------------------------------------------------- */}
      <section data-act="hog" className="act-hog relative border-t-[3px] border-ink">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-14">
            <div className="min-w-0">
              {project.video_url ? (
                <Block index={nextIndex()} label="Demo">
                  <VideoEmbed url={project.video_url} title={project.title} />
                </Block>
              ) : null}

              {project.description ? (
                <Block index={nextIndex()} label="Overview">
                  <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                    {project.description.split(/\n{2,}/).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </Block>
              ) : null}

              {project.highlights.length > 0 ? (
                <Block index={nextIndex()} label="What it does">
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {project.highlights.map((highlight, i) => (
                      <Reveal key={highlight} delay={i * 70}>
                        <li className="hog-card flex h-full gap-3 p-4 text-[14px] leading-relaxed text-muted-foreground">
                          <span
                            aria-hidden
                            className="mt-0.5 h-4 w-1 shrink-0 rounded-full bg-primary"
                          />
                          {highlight}
                        </li>
                      </Reveal>
                    ))}
                  </ul>
                </Block>
              ) : null}

              {project.screenshots.length > 0 ? (
                <Block index={nextIndex()} label="Screens">
                  <ScreenshotCarousel images={project.screenshots} title={project.title} />
                </Block>
              ) : null}

              {project.designs.length > 0 ? (
                <Block index={nextIndex()} label="Design pages">
                  <p className="-mt-2 mb-4 text-sm text-muted-foreground">
                    Every page of the design on one canvas — zoom and pan to explore.
                  </p>
                  <DesignBoard images={project.designs} title={project.title} />
                </Block>
              ) : null}

              {docUrl ? (
                <Block index={nextIndex()} label="Documentation">
                  <DocViewer url={docUrl} title={project.title} kind="pdf" />
                </Block>
              ) : null}

              {slidesUrl ? (
                <Block index={nextIndex()} label="Slides">
                  <DocViewer url={slidesUrl} title={project.title} kind="slides" />
                </Block>
              ) : null}
            </div>

            {/* Spec rail — the facts, always in reach. */}
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <div className="hog-card overflow-hidden">
                <div className="border-b-2 border-border bg-secondary px-5 py-3">
                  <h2 className="micro text-muted-foreground">Project spec</h2>
                </div>

                <dl className="divide-y-2 divide-border/15">
                  {[
                    ["Category", project.category],
                    ["Timeline", project.period],
                    ["Role", project.role],
                    [
                      "Status",
                      // A research model on Hugging Face is live, but calling it
                      // "in production" would overstate it.
                      liveUrl
                        ? project.category === "Research"
                          ? "Published demo"
                          : "In production"
                        : "Not deployed",
                    ],
                  ]
                    .filter(([, value]) => Boolean(value))
                    .map(([label, value]) => (
                      <div key={label} className="flex gap-4 px-5 py-3">
                        <dt className="w-24 shrink-0 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="min-w-0 flex-1 text-sm text-foreground">{value}</dd>
                      </div>
                    ))}
                </dl>

                <div className="border-t-2 border-border/15 px-5 py-4">
                  <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Stack ({project.tech.length})
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="rounded border border-border/25 bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground/85"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {project.downloads.length > 0 ? (
                  <div className="border-t-2 border-border/15 px-5 py-4">
                    <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Downloads
                    </h3>
                    <div className="mt-3 flex flex-col gap-2">
                      {project.downloads.map((item) => (
                        <HardLink
                          key={item.url}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          variant="secondary"
                          size="sm"
                          className="justify-between"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Download className="h-3.5 w-3.5" />
                            {item.label || `${item.platform} app`}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {item.platform}
                          </span>
                        </HardLink>
                      ))}
                    </div>
                  </div>
                ) : null}

                {liveUrl ? (
                  <div className="border-t-2 border-border/15 p-4">
                    <HardLink
                      href={liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      variant="primary"
                      size="md"
                      className="w-full"
                    >
                      {project.category === "Research" ? "Open the demo" : "Open the live site"}
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </HardLink>
                  </div>
                ) : null}
              </div>

              <Sticker className="mt-5 ml-2" rotate={-2}>
                {project.featured ? "Featured build" : "Case study"}
              </Sticker>
            </aside>
          </div>

          {/* Prev / next */}
          <nav className="mt-20 grid gap-4 border-t-2 border-border/15 pt-8 sm:grid-cols-2">
            {prev ? (
              <Link
                to="/projects/$slug"
                params={{ slug: prev.slug }}
                className="hog-card hog-card-hover group p-5"
              >
                <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <ArrowLeft className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-1" />
                  Previous
                </span>
                <span className="display-sm mt-2 block text-foreground">{prev.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next ? (
              <Link
                to="/projects/$slug"
                params={{ slug: next.slug }}
                className="hog-card hog-card-hover group p-5 sm:text-right"
              >
                <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:justify-end">
                  Next
                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
                <span className="display-sm mt-2 block text-foreground">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        </div>
      </section>
    </article>
  );
}
