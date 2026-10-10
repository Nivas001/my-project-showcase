import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { heroProject, type Project } from "@/lib/projects";
import { prettyUrl, shortTitle, toAbsoluteUrl } from "@/lib/site";
import { Shot } from "@/components/Shot";
import { ratioOf } from "@/content/project-media";
import { Eyebrow, FadeIn, RiseWords, SectionGlow } from "./fx";

const FEATURED = 3;

/**
 * The showcase. Three projects arrive as a deck: on desktop each card pins
 * below the header and the next one slides over it, while the ones beneath
 * settle back and dim — so the eye is always on exactly one project, and the
 * pile behind it says there is more. Everything else is an index: one line
 * per project.
 */
export function SelectedWork({ projects }: { projects: Project[] }) {
  const lead = heroProject(projects);
  const withShots = projects.filter((p) => p.screenshots.length > 0);
  const ordered = [
    ...(lead ? [lead] : []),
    ...withShots.filter((p) => p.featured && p.id !== lead?.id),
    ...withShots.filter((p) => !p.featured && p.id !== lead?.id),
  ];
  const featured = ordered.slice(0, FEATURED);
  const rest = projects.filter((p) => !featured.some((f) => f.id === p.id));

  if (featured.length === 0) return null;

  return (
    <section
      id="work"
      data-act="noir"
      data-rail="Work"
      className="act-noir tone-rose relative scroll-mt-10"
    >
      <SectionGlow side="right" />
      <div className="relative mx-auto max-w-6xl px-5 pb-28 sm:px-8 sm:pb-40">
        <Eyebrow index="03">Selected work</Eyebrow>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <RiseWords
            text="Things I built"
            muted="and still maintain."
            className="max-w-[20ch] text-balance font-display text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-foreground"
          />
          <FadeIn delay={0.2}>
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              All {projects.length} projects
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </FadeIn>
        </div>

        <Deck projects={featured} />

        {rest.length > 0 ? (
          <div className="mt-28 sm:mt-40">
            <FadeIn>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Also built
              </p>
            </FadeIn>
            <ul className="mt-6 border-t border-border">
              {rest.map((project, i) => (
                <FadeIn as="li" key={project.id} delay={i * 0.05} y={12}>
                  <Link
                    to="/projects/$slug"
                    params={{ slug: project.slug }}
                    className="group grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-border py-5 transition-colors sm:grid-cols-[1fr_12rem_5rem_auto] sm:py-6"
                  >
                    <span className="text-lg font-medium tracking-tight text-foreground transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 sm:text-xl">
                      {shortTitle(project.title)}
                    </span>
                    <span className="hidden truncate text-sm text-muted-foreground sm:block">
                      {project.category}
                    </span>
                    <span className="hidden font-mono text-xs tabular-nums text-muted-foreground sm:block">
                      {yearOf(project.period)}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                  </Link>
                </FadeIn>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return desktop;
}

function Deck({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const desktop = useDesktop();
  const stacking = desktop && !reduced;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <div ref={ref} className="mt-16 space-y-8 sm:mt-24 lg:space-y-0">
      {projects.map((project, i) => (
        <div
          key={project.id}
          className="lg:sticky lg:flex lg:h-[88vh] lg:items-start"
          style={stacking ? { top: `${96 + i * 22}px` } : {}}
        >
          <Card
            project={project}
            index={i}
            total={projects.length}
            progress={scrollYProgress}
            stacking={stacking}
          />
        </div>
      ))}
    </div>
  );
}

function Card({
  project,
  index,
  total,
  progress,
  stacking,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
  stacking: boolean;
}) {
  const live = toAbsoluteUrl(project.live_url);
  // Each card starts receding once the next begins to cover it, and ends
  // smaller the deeper it sits in the pile.
  const start = (index + 1) / total - 1 / total / 2;
  const depth = total - 1 - index;
  const scale = useTransform(progress, [Math.max(0, start - 0.15), 1], [1, 1 - depth * 0.045]);
  const dim = useTransform(progress, [Math.max(0, start - 0.15), 1], [0, depth * 0.22]);

  return (
    <motion.article
      style={stacking ? { scale } : {}}
      initial={stacking ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full origin-top overflow-hidden rounded-3xl border border-border bg-card lg:grid lg:grid-cols-12"
    >
      <div className="flex flex-col justify-between gap-8 p-6 sm:p-9 lg:col-span-5 lg:p-10">
        <p className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span className="tabular-nums text-accent">0{index + 1}</span>
          <span className="tabular-nums">{yearOf(project.period)}</span>
          <span className="text-border">/</span>
          <span className="uppercase tracking-[0.14em]">{project.category}</span>
        </p>

        <div>
          <h3 className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-foreground">
            {shortTitle(project.title)}
          </h3>
          <p className="mt-4 line-clamp-4 text-[15px] leading-relaxed text-muted-foreground">
            {project.summary}
          </p>
          <ul className="mt-6 flex flex-wrap gap-1.5">
            {project.tech.slice(0, 5).map((t) => (
              <li
                key={t}
                className="rounded-full border border-border px-2.5 py-1 font-mono text-[10.5px] text-muted-foreground"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link
            to="/projects/$slug"
            params={{ slug: project.slug }}
            className="group inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 font-medium text-background transition-opacity hover:opacity-85"
          >
            Case study
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          {live ? (
            <a
              href={live}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {prettyUrl(live)}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          ) : null}
        </div>
      </div>

      {/* The screenshot sits in a frame cut to its own proportions, so nothing
          is cropped: the stage around it absorbs whatever space is left. */}
      <Link
        to="/projects/$slug"
        params={{ slug: project.slug }}
        data-cursor="View case study"
        aria-label={`${project.title} — case study`}
        className="group relative flex items-center justify-center border-t border-border bg-secondary/40 p-4 sm:p-7 lg:col-span-7 lg:border-l lg:border-t-0"
      >
        <span
          className="relative block w-full overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_60px_-32px_rgba(0,0,0,0.55)]"
          style={{ aspectRatio: String(ratioOf(project.screenshots[0]) ?? 16 / 10) }}
        >
          <Shot
            src={project.screenshots[0]}
            alt=""
            className="transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
          />
        </span>
      </Link>

      {stacking ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-background"
          style={{ opacity: dim }}
        />
      ) : null}
    </motion.article>
  );
}

function yearOf(period: string): string {
  const years = period.match(/\d{4}/g);
  return years ? years[years.length - 1]! : period;
}
