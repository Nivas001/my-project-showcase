import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Braces,
  Brain,
  Layers,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Project } from "@/lib/projects";
import { shortTitle, skills, toAbsoluteUrl } from "@/lib/site";
import { CountUp } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { EASE, Eyebrow, FadeIn, RiseWords, SectionGlow } from "./fx";

type Group = { group: string; items: string[] };

/* Two columns on phones, four on desktop — a rule between neighbours only. */
const DIVIDERS = [
  "",
  "border-l border-border pl-6 lg:pl-8",
  "lg:border-l lg:border-border lg:pl-8",
  "border-l border-border pl-6 lg:pl-8",
];

/** Hues for the stack columns, in order; a fifth group wraps round. */
const GROUP_TONES = ["tone-amber", "tone-cyan", "tone-lime", "tone-violet", "tone-rose"];

/** Groups come from the database, so the icon is matched on the name. */
function groupIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("lang")) return Braces;
  if (n.includes("framework") || n.includes("librar")) return Layers;
  if (n.includes("tool") || n.includes("platform")) return Wrench;
  if (n.includes("concept")) return Brain;
  return Sparkles;
}

/**
 * Technical depth: four figures, the research, and the whole stack. Each
 * figure and each stack column carries its own hue; the GPA — the one number
 * that is a grade rather than a count — is painted in the full spectrum.
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
    { value: String(liveProducts), label: "Products in production", tone: "tone-cyan" },
    { value: String(projects.length), label: "Projects shipped", tone: "tone-rose" },
    { value: String(techCount), label: "Technologies in use", tone: "tone-lime" },
    { value: "8.79", label: "MCA GPA, out of 10", tone: "tone-amber", outOf: 10 },
  ];

  return (
    <section data-act="noir" data-rail="Stack" className="act-noir tone-violet relative">
      <SectionGlow side="right" />
      <div className="relative mx-auto max-w-6xl px-5 pb-28 sm:px-8 sm:pb-40">
        <Eyebrow index="06">Technical depth</Eyebrow>

        <RiseWords
          text="The stack,"
          muted="and the numbers behind it."
          className="mt-10 max-w-[20ch] text-balance font-display text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-foreground"
        />

        <dl className="mt-16 grid grid-cols-2 gap-y-10 border-y border-border py-10 sm:mt-20 lg:grid-cols-4 lg:py-12">
          {figures.map((figure, i) => (
            <FadeIn key={figure.label} delay={i * 0.08} className={cn(DIVIDERS[i], figure.tone)}>
              <dt
                className={cn(
                  "font-display text-[clamp(2.5rem,5vw,4rem)] font-medium leading-none tracking-[-0.045em] tabular-nums",
                  "before:mb-5 before:block before:h-[3px] before:w-8 before:rounded-full before:bg-(--tone) before:shadow-[0_0_12px_var(--tone)]",
                  figure.outOf
                    ? "w-fit text-spectrum [filter:drop-shadow(0_0_28px_color-mix(in_oklab,var(--spark-rose)_35%,transparent))]"
                    : "text-foreground",
                )}
              >
                <CountUp value={figure.value} />
              </dt>
              <dd className="mt-3 text-[13px] text-muted-foreground">
                {figure.label}
                {figure.outOf ? (
                  <Meter fraction={Number.parseFloat(figure.value) / figure.outOf} />
                ) : null}
              </dd>
            </FadeIn>
          ))}
        </dl>

        {research ? (
          <FadeIn className="mt-12">
            <Link
              to="/projects/$slug"
              params={{ slug: research.slug }}
              className="tone-violet tone-card group grid gap-4 rounded-2xl p-5 sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-8 sm:p-7"
            >
              <span className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-(--tone)">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-(--tone)/15">
                  <Sparkles className="h-4 w-4" />
                </span>
                Research
              </span>
              <span className="max-w-2xl text-[15px] leading-relaxed text-foreground/90">
                Entity-preserving abstractive summarisation for Tamil — mT5 fine-tuned with PEFT,
                NER wired in so the names survive. Public on Hugging Face.
                <span className="mt-3 flex flex-wrap gap-2">
                  {["mT5", "PEFT", "NER", "Hugging Face"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-(--tone)/30 bg-(--tone)/10 px-2.5 py-0.5 font-mono text-[10.5px] tracking-wide text-(--tone)"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              </span>
              <ArrowUpRight className="hidden h-4 w-4 text-(--tone) transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block" />
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
  const activeGroup = active ? stack.findIndex((g) => g.items.includes(active)) : -1;
  const activeTone = GROUP_TONES[Math.max(activeGroup, 0) % GROUP_TONES.length];

  return (
    <div className="mt-16 sm:mt-20" onMouseLeave={() => setActive(null)}>
      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {stack.map((group, gi) => {
          const Icon = groupIcon(group.group);
          return (
            <FadeIn
              key={group.group}
              delay={gi * 0.08}
              className={cn(
                "tone-card rounded-2xl p-4 sm:p-5",
                GROUP_TONES[gi % GROUP_TONES.length],
              )}
            >
              <h3 className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-(--tone)">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-(--tone)/15">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 leading-snug">{group.group}</span>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {String(group.items.length).padStart(2, "0")}
                </span>
              </h3>
              <span
                aria-hidden
                className="mt-4 block h-px bg-gradient-to-r from-(--tone)/50 to-transparent"
              />
              <ul className="mt-4 space-y-1">
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
                          on
                            ? "bg-(--tone)/15 text-foreground"
                            : "text-foreground/85 hover:text-foreground"
                        } ${faded ? "opacity-40" : "opacity-100"}`}
                      >
                        {item}
                        {count > 0 ? (
                          <sup
                            className={`font-mono text-[9.5px] tabular-nums text-(--tone) transition-opacity ${
                              on ? "opacity-100" : "opacity-70"
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
          );
        })}
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
              className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", activeTone)}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--tone)">
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

/** A thin gauge under a grade, filling to its fraction as it arrives. */
function Meter({ fraction }: { fraction: number }) {
  const reduced = useReducedMotion();
  return (
    <span
      aria-hidden
      className="mt-4 block h-1 w-full max-w-[10rem] overflow-hidden rounded-full bg-border"
    >
      <motion.span
        className="block h-full origin-left rounded-full bg-gradient-to-r from-(--spark-amber) via-(--spark-rose) to-(--spark-violet)"
        style={{ width: `${Math.min(Math.max(fraction, 0), 1) * 100}%` }}
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
      />
    </span>
  );
}
