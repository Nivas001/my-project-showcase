import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { STAGES, PIPELINE_TOOLS, type Stage } from "./pipeline-stages";
import { TechChip, TechGlyph, techLabel } from "@/components/kit/TechMark";
import { CheckMark, HandNote, Marked, SectionLabel, SplitLines } from "@/components/kit";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

/* ==========================================================================
 * THE BUILD PIPELINE
 *
 * Seven stages that fly toward the viewer as the page scrolls. The section is
 * seven screens tall; inside it one sticky viewport holds a 3D scene, and each
 * stage card is placed on its own Z plane.
 *
 * The maths, once, so the rest reads easily:
 *
 *   progress ∈ [0, 1] across the whole section
 *   local    = progress * COUNT - i     (0 when stage i is dead centre)
 *
 * A card is drawn from local = -1 (far away, tilted back, transparent) through
 * 0 (front and centre) to +1 (past the camera, tilted away, gone). Everything
 * else — Z, rotation, opacity, blur — is a curve over that one number.
 *
 * Under prefers-reduced-motion none of this runs: the stages render as a plain
 * ordered list, which is the same information without the theatre.
 * ======================================================================== */

const COUNT = STAGES.length;

export function BuildPipeline({
  className,
  id = "how-it-gets-built",
}: {
  className?: string;
  id?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(COUNT - 1, Math.max(0, Math.round(value * COUNT - 0.5)));
    setActive(next);
  });

  if (reduced) return <StaticPipeline className={className} id={id} />;

  return (
    <section
      id={id}
      data-act="noir"
      className={cn("act-noir grain relative border-y-[3px] border-ink", className)}
    >
      {/* Intro — read normally, before the scroll takes over. */}
      <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-20 sm:px-8 sm:pb-14 sm:pt-28">
        <div
          aria-hidden
          className="hairline-grid pointer-events-none absolute inset-0 opacity-40"
        />
        <Reveal>
          <SectionLabel index="02">Before the rest of the work</SectionLabel>
        </Reveal>
        <div className="relative mt-6 flex flex-wrap items-end justify-between gap-8">
          <SplitLines
            as="h2"
            onView
            lines={["From a conversation", "to a live URL."]}
            className="hero-md max-w-[20ch] text-foreground"
          />
          <Reveal delay={120} className="max-w-sm">
            <p className="text-base leading-relaxed text-muted-foreground">
              Every project below went through the same seven passes. Not a methodology — just the
              order things actually have to happen in when{" "}
              <Marked kind="underline" tone="hog-red">
                one person owns all of it
              </Marked>
              .
            </p>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <p className="micro mt-10 flex items-center gap-2 text-muted-foreground">
            <ArrowDown className="h-3.5 w-3.5 animate-bounce text-hog-red" />
            Keep scrolling — the stages come to you
          </p>
        </Reveal>
      </div>

      {/* The scroll track. */}
      <div ref={ref} style={{ height: `${COUNT * 88}vh` }} className="relative">
        <div className="sticky top-0 flex h-svh items-center overflow-hidden">
          <Floor progress={scrollYProgress} />

          {/* Stage rail. */}
          {/* Only from xl. Below that the 896px card is centred in a viewport
              with no room left over, and the rail lands on top of it. */}
          <nav
            aria-hidden
            className="absolute left-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 xl:flex"
          >
            {STAGES.map((stage, i) => (
              <span key={stage.id} className="flex items-center gap-3">
                <span
                  className="h-px transition-all duration-500"
                  style={{
                    width: i === active ? 30 : 14,
                    background:
                      i <= active
                        ? `var(--${stage.accent})`
                        : "color-mix(in oklab, currentColor 30%, transparent)",
                    color: "var(--muted-foreground)",
                  }}
                />
                <span
                  className="micro transition-all duration-500"
                  style={{
                    color: i === active ? `var(--${stage.accent})` : "var(--muted-foreground)",
                    opacity: i === active ? 1 : 0.4,
                  }}
                >
                  {stage.kicker}
                </span>
              </span>
            ))}
          </nav>

          {/* Progress ring, top-right — xl and up, where there is room beside
              the card. Narrower viewports get the compact strip below. */}
          <ProgressRing progress={scrollYProgress} active={active} />

          <div className="absolute inset-x-0 top-16 z-30 flex justify-center px-5 xl:hidden">
            <span className="flex items-center gap-2.5 rounded-full border border-border/70 bg-background/70 px-3.5 py-1.5 backdrop-blur-sm">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: `var(--${STAGES[active]?.accent ?? "hog-red"})` }}
              />
              <span
                className="micro"
                style={{ color: `var(--${STAGES[active]?.accent ?? "hog-red"})` }}
              >
                {STAGES[active]?.kicker}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {String(active + 1).padStart(2, "0")}/{String(COUNT).padStart(2, "0")}
              </span>
            </span>
          </div>

          {/* The 3D scene. */}
          <div className="scene-3d relative mx-auto w-full max-w-4xl px-5 sm:px-8">
            <div className="preserve-3d relative h-[30rem] sm:h-[32rem]">
              {STAGES.map((stage, i) => (
                <StageCard key={stage.id} stage={stage} index={i} progress={scrollYProgress} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tool marquee — everything the pipeline touched, on one belt. */}
      <div className="relative overflow-hidden border-t border-border/60 bg-background/60 py-5 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
        <div
          className="marquee-track"
          style={{ "--marquee-duration": "44s" } as React.CSSProperties}
        >
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0 items-center gap-8 pr-8"
            >
              {PIPELINE_TOOLS.map((tool) => (
                <span key={`${copy}-${tool}`} className="flex shrink-0 items-center gap-2.5">
                  <TechGlyph id={tool} className="h-6 w-6" />
                  <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {techLabel(tool)}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
 * One stage card, placed on its own Z plane.
 * ------------------------------------------------------------------------ */

function StageCard({
  stage,
  index,
  progress,
}: {
  stage: Stage;
  index: number;
  progress: MotionValue<number>;
}) {
  // 0 when this stage is centred; ±1 when it is one full stage away.
  const local = useTransform(progress, (value) => value * COUNT - index - 0.5);

  // The stages travel sideways: the next one enters from the right, the last
  // one leaves to the left, each turned slightly away from the camera as it
  // goes so the row still reads as depth rather than a flat carousel.
  const x = useTransform(local, [-1, 0, 1], ["116%", "0%", "-116%"]);
  const rotateY = useTransform(local, [-1, 0, 1], [-26, 0, 26]);
  const z = useTransform(local, [-1, 0, 1], [-320, 0, -320]);
  const opacity = useTransform(local, [-1, -0.55, 0, 0.55, 1], [0, 1, 1, 1, 0]);
  // A little vertical drift keeps the motion from looking mechanical.
  const y = useTransform(local, [-1, 0, 1], [22, 0, 22]);
  const blur = useTransform(local, [-1, -0.5, 0, 0.5, 1], [7, 0, 0, 0, 7]);
  const filter = useTransform(blur, (value) => `blur(${value.toFixed(2)}px)`);

  return (
    <motion.article
      style={{ x, y, z, rotateY, opacity, filter }}
      className="preserve-3d absolute inset-0 origin-center"
    >
      <div className="relative h-full overflow-hidden rounded-xl border-2 border-border bg-card/85 backdrop-blur-xl">
        {/* Accent edge and wash. */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ background: `var(--${stage.accent})` }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full blur-[90px]"
          style={{ background: `var(--${stage.accent})`, opacity: 0.16 }}
        />

        <div className="relative grid h-full gap-6 p-6 sm:p-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-3">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md border-2 border-border font-display text-base font-bold"
                style={{
                  background: `color-mix(in oklab, var(--${stage.accent}) 24%, var(--card))`,
                  color: `var(--${stage.accent})`,
                }}
              >
                {stage.index}
              </span>
              <span className="micro" style={{ color: `var(--${stage.accent})` }}>
                {stage.kicker}
              </span>
            </div>

            <h3 className="hero-md mt-5 text-foreground">{stage.title}</h3>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              {stage.body}
            </p>

            <ul className="mt-5 space-y-2">
              {stage.beats.map((beat) => (
                <li key={beat} className="flex items-start gap-2.5 text-[13px] text-foreground/85">
                  <CheckMark tone={stage.accent} className="mt-0.5 h-3.5 w-4 shrink-0" />
                  {beat}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
              {stage.tools.map((tool) => (
                <TechChip key={tool} id={tool} size="sm" />
              ))}
            </div>
          </div>

          {/* Illustration column. */}
          <div className="relative hidden min-w-0 items-center justify-center lg:flex">
            <div
              className="float-slow h-40 w-full max-w-[15rem]"
              style={
                {
                  color: `var(--${stage.accent})`,
                  "--float-delay": `${index * 0.4}s`,
                } as React.CSSProperties
              }
            >
              {stage.illustration}
            </div>
            {stage.note ? (
              <HandNote
                tone={stage.accent}
                rotate={-7}
                size="sm"
                className="absolute -bottom-1 right-0"
              >
                {stage.note}
              </HandNote>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* --------------------------------------------------------------------------
 * Scene furniture
 * ------------------------------------------------------------------------ */

/** A perspective grid floor that slides under the cards as they advance. */
function Floor({ progress }: { progress: MotionValue<number> }) {
  // Tracks sideways with the cards, so the ground moves the same way they do.
  const shift = useTransform(progress, [0, 1], ["0px", "-760px"]);
  const fade = useTransform(progress, [0, 0.08, 0.92, 1], [0, 0.55, 0.55, 0]);

  return (
    <motion.div
      aria-hidden
      style={{ opacity: fade }}
      className="scene-3d pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-x-[-40%] bottom-[-10%] h-[70%] origin-bottom"
        // A flat grid rotated back into the floor plane: the classic vanishing
        // -point treatment, and far cheaper than rendering real geometry.
      >
        {/* The scroll-linked position has to live on the element that actually
            carries the gradient — on the wrapper it animates nothing. */}
        <motion.div
          className="h-full w-full"
          style={{
            backgroundPositionX: shift,
            transform: "rotateX(72deg)",
            backgroundImage:
              "linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "linear-gradient(to top, black, transparent 78%)",
            WebkitMaskImage: "linear-gradient(to top, black, transparent 78%)",
          }}
        />
      </div>
    </motion.div>
  );
}

/** Circular progress through the seven stages. */
function ProgressRing({ progress, active }: { progress: MotionValue<number>; active: number }) {
  const R = 22;
  const C = 2 * Math.PI * R;
  const offset = useTransform(progress, [0, 1], [C, 0]);

  return (
    <div className="absolute right-5 top-20 z-30 hidden items-center gap-3 xl:flex">
      <span className="micro text-right text-muted-foreground">
        Stage
        <br />
        <span className="font-bold text-foreground">
          {String(active + 1).padStart(2, "0")} / {String(COUNT).padStart(2, "0")}
        </span>
      </span>
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90" aria-hidden>
        <circle cx="28" cy="28" r={R} stroke="var(--border)" strokeWidth="3" fill="none" />
        <motion.circle
          cx="28"
          cy="28"
          r={R}
          stroke={`var(--${STAGES[active]?.accent ?? "hog-red"})`}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={C}
          style={{ strokeDashoffset: offset }}
        />
      </svg>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Reduced-motion fallback: the same seven stages, stacked and readable.
 * ------------------------------------------------------------------------ */

function StaticPipeline({ className, id }: { className?: string | undefined; id: string }) {
  return (
    <section
      id={id}
      data-act="noir"
      className={cn("act-noir grain relative border-y-[3px] border-ink", className)}
    >
      <div className="relative mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-24">
        <SectionLabel index="02">Before the rest of the work</SectionLabel>
        <h2 className="hero-md mt-6 text-foreground">From a conversation to a live URL.</h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          Every project below went through the same seven passes.
        </p>

        <ol className="mt-12 space-y-5">
          {STAGES.map((stage) => (
            <li
              key={stage.id}
              className="rounded-xl border-2 border-border bg-card/70 p-6"
              style={{ borderLeftColor: `var(--${stage.accent})`, borderLeftWidth: 6 }}
            >
              <span className="micro" style={{ color: `var(--${stage.accent})` }}>
                {stage.index} — {stage.kicker}
              </span>
              <h3 className="display-sm mt-3 text-foreground">{stage.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{stage.body}</p>
              <ul className="mt-4 space-y-1.5">
                {stage.beats.map((beat) => (
                  <li key={beat} className="text-[13px] text-foreground/85">
                    — {beat}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                {stage.tools.map((tool) => (
                  <TechChip key={tool} id={tool} size="sm" />
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
