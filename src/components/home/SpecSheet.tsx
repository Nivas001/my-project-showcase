import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { shortTitle, skills, toAbsoluteUrl } from "@/lib/site";
import { CountUp } from "@/components/Reveal";
import { EASE, Eyebrow, FadeIn, RiseWords } from "./fx";

type Group = { group: string; items: string[] };

/* Two columns on phones, four on desktop — a rule between neighbours only. */
const DIVIDERS = [
  "",
  "border-l border-border pl-6 lg:pl-8",
  "lg:border-l lg:border-border lg:pl-8",
  "border-l border-border pl-6 lg:pl-8",
];

/**
 * Technical depth: four figures, the research, and the whole stack — set as
 * plain columns of text. It used to be tiles, a six-row table and a bordered
 * grid; the same facts read faster when nothing is drawn around them.
 */
export function SpecSheet({
  projects,
  groups,
}: {
  projects: Project[];
  groups?: Group[] | undefined;
}) {
  const stack = groups && groups.length > 0 ? groups : skills;
  const liveProducts = projects.filter(
    (p) => toAbsoluteUrl(p.live_url) && p.category !== "Research",
  ).length;
  const techCount = new Set(projects.flatMap((p) => p.tech)).size;
  const research = projects.find((p) => p.category === "Research");

  const figures = [
    { value: String(liveProducts), label: "Products in production" },
    { value: String(projects.length), label: "Projects shipped" },
    { value: String(techCount), label: "Technologies in use" },
    { value: "8.79", label: "MCA GPA, out of 10" },
  ];

  return (
    <section data-act="noir" data-rail="Stack" className="act-noir relative">
      <div className="mx-auto max-w-6xl px-5 pb-28 sm:px-8 sm:pb-40">
        <Eyebrow index="06">Technical depth</Eyebrow>

        <RiseWords
          text="The stack,"
          muted="and the numbers behind it."
          className="mt-10 max-w-[20ch] text-balance font-display text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-foreground"
        />

        <dl className="mt-16 grid grid-cols-2 gap-y-10 border-y border-border py-10 sm:mt-20 lg:grid-cols-4 lg:py-12">
          {figures.map((figure, i) => (
            <FadeIn key={figure.label} delay={i * 0.08} className={DIVIDERS[i] ?? ""}>
              <dt className="font-display text-[clamp(2.5rem,5vw,4rem)] font-medium leading-none tracking-[-0.045em] text-foreground tabular-nums">
                <CountUp value={figure.value} />
              </dt>
              <dd className="mt-3 text-[13px] text-muted-foreground">{figure.label}</dd>
            </FadeIn>
          ))}
        </dl>

        {research ? (
          <FadeIn className="mt-12">
            <Link
              to="/projects/$slug"
              params={{ slug: research.slug }}
              className="group grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-baseline sm:gap-8"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                Research
              </span>
              <span className="max-w-2xl text-[15px] leading-relaxed text-foreground/90">
                Entity-preserving abstractive summarisation for Tamil — mT5 fine-tuned with PEFT,
                NER wired in so the names survive. Public on Hugging Face.
              </span>
              <ArrowUpRight className="hidden h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground sm:block" />
            </Link>
          </FadeIn>
        ) : null}

        <StackExplorer stack={stack} projects={projects} />
      </div>
    </section>
  );
}

/** Does a stored project tech label refer to this stack item? "React 19" is React; "C" is only C. */
function uses(project: Project, item: string): boolean {
  const needle = item.toLowerCase();
  return project.tech.some((t) => {
    const hay = t.toLowerCase();
    if (needle.length < 3 || hay.length < 3) return hay === needle;
    return hay.includes(needle) || needle.includes(hay);
  });
}

/**
 * The stack as something to interrogate rather than read. Every tool carries
 * a count of the projects it shipped in; pointing at one lists them, so
 * "I know Postgres" becomes "here are the four products running on it".
 */
function StackExplorer({ stack, projects }: { stack: Group[]; projects: Project[] }) {
  const [active, setActive] = useState<string | null>(null);
  const usedIn = active ? projects.filter((p) => uses(p, active)) : [];

  return (
    <div className="mt-16 sm:mt-20" onMouseLeave={() => setActive(null)}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-8">
        {stack.map((group, gi) => (
          <FadeIn key={group.group} delay={gi * 0.08}>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {group.group}
            </h3>
            <ul className="mt-5 space-y-1">
              {group.items.map((item) => {
                const count = projects.filter((p) => uses(p, item)).length;
                const on = active === item;
                const faded = active !== null && !on;
                return (
                  <li key={item}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(item)}
                      onFocus={() => setActive(item)}
                      onClick={() => setActive((a) => (a === item ? null : item))}
                      aria-pressed={on}
                      className={`group -mx-2 flex items-baseline gap-1.5 rounded-md px-2 py-0.5 text-left text-[15px] transition-[color,opacity,background-color] duration-300 ${
                        on ? "bg-secondary text-foreground" : "text-foreground/85"
                      } ${faded ? "opacity-40" : "opacity-100"}`}
                    >
                      {item}
                      {count > 0 ? (
                        <sup
                          className={`font-mono text-[9.5px] tabular-nums transition-colors ${
                            on ? "text-accent" : "text-muted-foreground"
                          }`}
                        >
                          {count}
                        </sup>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </FadeIn>
        ))}
      </div>

      <div
        aria-live="polite"
        className="mt-12 flex min-h-[3.5rem] flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-5 text-[14px]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {active ? (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                {active}
              </span>
              {usedIn.length > 0 ? (
                <>
                  <span className="text-muted-foreground">shipped in</span>
                  {usedIn.map((p) => (
                    <Link
                      key={p.id}
                      to="/projects/$slug"
                      params={{ slug: p.slug }}
                      className="link-sweep text-foreground"
                    >
                      {shortTitle(p.title)}
                    </Link>
                  ))}
                </>
              ) : (
                <span className="text-muted-foreground">
                  in my toolkit — not in a shipped project on this site yet
                </span>
              )}
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
            >
              Point at any tool to see where it shipped — the small number is how many projects
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
