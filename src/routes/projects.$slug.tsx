import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "motion/react";
import {
  ArrowDown,
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
import { toAbsoluteUrl, prettyUrl, shortTitle } from "@/lib/site";
import { VideoEmbed } from "@/components/VideoEmbed";
import { DocViewer } from "@/components/DocViewer";
import { DesignBoard } from "@/components/DesignBoard";
import { ScreenshotCarousel } from "@/components/ScreenshotCarousel";
import { Shot } from "@/components/Shot";
import {
  BrowserFrame,
  CharReveal,
  HandNote,
  HardLink,
  HardRouteLink,
  Marked,
  SectionLabel,
  SplitLines,
  StatusDot,
  Sticker,
  TiltCard,
} from "@/components/kit";
import { Reveal, CountUp } from "@/components/Reveal";
import { cn } from "@/lib/utils";

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
      <h1 className="hero-lg relative mt-4 text-foreground">
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

/* ==========================================================================
 * Reading chrome
 * ======================================================================== */

/** A hairline that fills as the case study is read. */
function ReadingBar() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: width }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-hog-red"
    />
  );
}

type Chapter = { id: string; index: string; label: string };

/**
 * Sticky contents rail. Highlights whichever block is currently under the top
 * of the viewport, so a long case study always says where you are in it.
 */
function Contents({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(chapters[0]?.id ?? "");

  useEffect(() => {
    if (chapters.length === 0) return;
    const sections = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      // The block whose top has most recently passed the reading line.
      const line = window.innerHeight * 0.32;
      let current = sections[0]!.id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [chapters]);

  if (chapters.length < 2) return null;

  return (
    <nav aria-label="Contents" className="hidden xl:block">
      <p className="micro mb-4 text-muted-foreground">Contents</p>
      <ol className="space-y-1">
        {chapters.map((chapter) => {
          const on = chapter.id === active;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2 py-1.5 font-mono text-[11px] transition-colors",
                  on
                    ? "bg-secondary font-bold text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  aria-hidden
                  className="h-px transition-all duration-300"
                  style={{
                    width: on ? 18 : 8,
                    background: on ? "var(--hog-red)" : "currentColor",
                  }}
                />
                {chapter.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** A labelled block in the cream body. */
function Block({
  id,
  index,
  label,
  note,
  children,
}: {
  id: string;
  index: string;
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-16 scroll-mt-24 first:mt-0">
      <Reveal>
        <div className="flex flex-wrap items-center gap-4">
          <SectionLabel index={index} rule={!note}>
            {label}
          </SectionLabel>
          {note ? (
            <HandNote tone="hog-blue" rotate={-4} size="sm">
              {note}
            </HandNote>
          ) : null}
        </div>
      </Reveal>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/* ==========================================================================
 * Page
 * ======================================================================== */

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(projectQuery(slug));
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const coverY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -70]);
  const coverOpacity = useTransform(scrollYProgress, [0, 0.85], reduced ? [1, 1] : [1, 0.15]);
  const titleY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -24]);

  // Hooks must run before any early return, so the chapter list is computed
  // from possibly-missing data and only read after the guard below.
  const project = data?.project ?? null;
  const chapters = useMemo<Chapter[]>(() => {
    if (!project) return [];
    const docUrl = project.doc_url || project.doc_signed_url;
    const slidesUrl = project.slides_url || project.slides_signed_url;
    const list: Chapter[] = [];
    const add = (id: string, label: string) =>
      list.push({ id, index: String(list.length + 1).padStart(2, "0"), label });

    if (project.video_url) add("demo", "Demo");
    if (project.description) add("overview", "Overview");
    if (project.highlights.length > 0) add("features", "What it does");
    if (project.screenshots.length > 0) add("screens", "Screens");
    if (project.designs.length > 0) add("designs", "Design pages");
    if (docUrl) add("docs", "Documentation");
    if (slidesUrl) add("slides", "Slides");
    return list;
  }, [project]);

  if (!data || !project) return <ProjectMissing />;

  const { prev, next } = data;
  const docUrl = project.doc_url || project.doc_signed_url || null;
  const slidesUrl = project.slides_url || project.slides_signed_url || null;
  const liveUrl = toAbsoluteUrl(project.live_url);
  const cover = project.screenshots[0];
  const chapterFor = (id: string) => chapters.find((chapter) => chapter.id === id);

  const facts = [
    { value: String(project.tech.length), label: "technologies" },
    { value: String(project.highlights.length), label: "shipped features" },
    { value: String(project.screenshots.length), label: "screens" },
  ].filter((fact) => fact.value !== "0");

  return (
    <article>
      <ReadingBar />

      {/* ---------------------------------------------------------------- */}
      {/* Act I — the title card                                            */}
      {/* ---------------------------------------------------------------- */}
      <section ref={heroRef} data-act="noir" className="act-noir grain relative overflow-hidden">
        <div
          aria-hidden
          className="hairline-grid pointer-events-none absolute inset-0 opacity-50"
        />
        <div
          aria-hidden
          className="wallpaper-drift pointer-events-none absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full blur-[120px]"
          style={{
            background: "radial-gradient(circle, var(--hog-red) 0%, transparent 70%)",
            opacity: 0.16,
          }}
        />
        <div
          aria-hidden
          className="wallpaper-drift pointer-events-none absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full blur-[120px]"
          style={{
            background: "radial-gradient(circle, var(--hog-blue) 0%, transparent 70%)",
            opacity: 0.12,
            animationDelay: "-11s",
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
            <motion.div style={{ y: titleY }} className="min-w-0">
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

              <CharReveal
                as="h1"
                onView={false}
                delay={120}
                text={shortTitle(project.title)}
                className="hero-lg mt-5 block text-foreground"
              />

              <p
                className="fade-rise mt-6 max-w-xl text-base leading-relaxed text-muted-foreground"
                style={{ "--line-delay": "360ms" } as React.CSSProperties}
              >
                {project.summary}
              </p>

              {/* Three facts, counted up. Cheap to render, and they anchor the
                  claim before anyone scrolls. */}
              {facts.length > 0 ? (
                <dl
                  className="fade-rise mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-border/60 pt-5"
                  style={{ "--line-delay": "420ms" } as React.CSSProperties}
                >
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="font-display text-2xl font-bold leading-none tracking-tight text-foreground">
                        <CountUp value={fact.value} />
                      </dt>
                      <dd className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {fact.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <div
                className="fade-rise mt-8 flex flex-wrap gap-3"
                style={{ "--line-delay": "480ms" } as React.CSSProperties}
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
            </motion.div>

            <motion.div style={{ y: coverY, opacity: coverOpacity }} className="fade-rise min-w-0">
              <TiltCard max={5} lift={14}>
                <BrowserFrame url={liveUrl ? prettyUrl(liveUrl) : project.title}>
                  <div className="aspect-[16/10] w-full overflow-hidden bg-secondary">
                    <Shot src={cover} alt={`${project.title} screenshot`} loading="eager" />
                  </div>
                </BrowserFrame>
              </TiltCard>
            </motion.div>
          </div>

          {chapters.length > 0 ? (
            <p className="micro mt-14 flex items-center gap-2 text-muted-foreground">
              <ArrowDown className="h-3.5 w-3.5 animate-bounce text-hog-red" />
              {chapters.length} section{chapters.length === 1 ? "" : "s"} below
            </p>
          ) : null}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Act II — the working surface                                      */}
      {/* ---------------------------------------------------------------- */}
      <section data-act="hog" className="act-hog relative border-t-[3px] border-ink">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />

        <div className="relative mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-12 xl:grid-cols-[11rem_minmax(0,1fr)_20rem] xl:gap-12">
            {/* Contents rail */}
            <div className="xl:sticky xl:top-24 xl:self-start">
              <Contents chapters={chapters} />
            </div>

            <div className="min-w-0">
              {project.video_url && chapterFor("demo") ? (
                <Block
                  id="demo"
                  index={chapterFor("demo")!.index}
                  label="Demo"
                  note="watch it actually run"
                >
                  <VideoEmbed url={project.video_url} title={project.title} />
                </Block>
              ) : null}

              {project.description && chapterFor("overview") ? (
                <Block id="overview" index={chapterFor("overview")!.index} label="Overview">
                  <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                    {project.description
                      .split(/\\n{2,}|\n{2,}/)
                      .map((paragraph) => paragraph.replace(/\\n/g, " ").trim())
                      .filter(Boolean)
                      .map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                  </div>
                </Block>
              ) : null}

              {project.highlights.length > 0 && chapterFor("features") ? (
                <Block
                  id="features"
                  index={chapterFor("features")!.index}
                  label="What it does"
                  note="the parts worth the work"
                >
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {project.highlights.map((highlight, i) => (
                      <Reveal key={highlight} delay={i * 70}>
                        <li className="hog-card hog-card-hover flex h-full gap-3 p-4 text-[14px] leading-relaxed text-muted-foreground">
                          <span
                            aria-hidden
                            className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-sm border-2 border-border font-mono text-[9px] font-bold text-foreground"
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {highlight}
                        </li>
                      </Reveal>
                    ))}
                  </ul>
                </Block>
              ) : null}

              {project.screenshots.length > 0 && chapterFor("screens") ? (
                <Block id="screens" index={chapterFor("screens")!.index} label="Screens">
                  <ScreenshotCarousel images={project.screenshots} title={project.title} />
                </Block>
              ) : null}

              {project.designs.length > 0 && chapterFor("designs") ? (
                <Block
                  id="designs"
                  index={chapterFor("designs")!.index}
                  label="Design pages"
                  note="zoom and pan"
                >
                  <p className="-mt-2 mb-4 text-sm text-muted-foreground">
                    Every page of the design on one canvas — zoom and pan to explore.
                  </p>
                  <DesignBoard images={project.designs} title={project.title} />
                </Block>
              ) : null}

              {docUrl && chapterFor("docs") ? (
                <Block id="docs" index={chapterFor("docs")!.index} label="Documentation">
                  <DocViewer url={docUrl} title={project.title} kind="pdf" />
                </Block>
              ) : null}

              {slidesUrl && chapterFor("slides") ? (
                <Block id="slides" index={chapterFor("slides")!.index} label="Slides">
                  <DocViewer url={slidesUrl} title={project.title} kind="slides" />
                </Block>
              ) : null}
            </div>

            {/* Spec rail — the facts, always in reach. */}
            <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
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
                    {project.tech.map((tech, i) => (
                      <span
                        key={tech}
                        className="fade-rise rounded border border-border/25 bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground/85"
                        style={
                          { "--line-delay": `${Math.min(i, 12) * 40}ms` } as React.CSSProperties
                        }
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

              <Sticker className="ml-2 mt-5" rotate={-2}>
                {project.featured ? "Featured build" : "Case study"}
              </Sticker>
            </aside>
          </div>

          {/* Close + prev / next */}
          <div className="mt-24 border-t-2 border-border/15 pt-14">
            <Reveal>
              <div className="text-center">
                <SplitLines
                  as="h2"
                  onView
                  lines={["Seen enough?"]}
                  className="hero-md text-foreground"
                />
                <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                  There are{" "}
                  <Marked kind="circle" tone="hog-red" delay={300} className="px-1">
                    more
                  </Marked>{" "}
                  where this came from — or skip the browsing and just say hello.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <HardRouteLink to="/projects" variant="primary" size="lg">
                    Back to all work
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </HardRouteLink>
                  <HardRouteLink to="/contact" variant="secondary" size="lg">
                    Get in touch
                  </HardRouteLink>
                </div>
              </div>
            </Reveal>

            <nav className="mt-14 grid gap-4 sm:grid-cols-2">
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
                  <span className="display-sm mt-2 block text-foreground">
                    {shortTitle(prev.title)}
                  </span>
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
                  <span className="display-sm mt-2 block text-foreground">
                    {shortTitle(next.title)}
                  </span>
                </Link>
              ) : null}
            </nav>
          </div>
        </div>
      </section>
    </article>
  );
}
