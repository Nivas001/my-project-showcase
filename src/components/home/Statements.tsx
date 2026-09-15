import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import { statements } from "@/lib/site";
import { CheckMark, HandNote, Marked, SplitLines } from "@/components/kit";
import { StatementScene, type SceneId } from "./StatementScenes";

/**
 * Three full-height statements pinned to the viewport. Scrolling advances the
 * statement rather than the page, so each claim gets the screen to itself.
 *
 * Each panel now carries its own diagram and three checkable facts, because a
 * claim set in 90px type is still only a claim: the evidence beside it is what
 * turns it into something a visitor can verify on the next page.
 *
 * With `prefers-reduced-motion` the whole mechanism is dropped and the three
 * statements simply stack as ordinary sections.
 */
export function Statements() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(
      statements.length - 1,
      Math.max(0, Math.floor(value * statements.length)),
    );
    setActive(next);
  });

  if (reduced) return <StackedStatements />;

  return (
    <section
      data-act="noir"
      ref={ref}
      className="act-noir relative"
      style={{ height: `${statements.length * 115}vh` }}
    >
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <div
          aria-hidden
          className="hairline-grid pointer-events-none absolute inset-0 opacity-40"
        />

        {/* Accent wash that changes with the active statement. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[12%] top-[10%] h-[34rem] w-[34rem] rounded-full blur-[140px] transition-colors duration-700"
          style={{
            background: `radial-gradient(circle, var(--${statements[active]?.accent ?? "hog-red"}) 0%, transparent 70%)`,
            opacity: 0.13,
          }}
        />

        {/* Progress rail — where you are, and what is coming. */}
        <div className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-5 sm:flex lg:left-8">
          {statements.map((statement, i) => (
            <RailSegment
              key={statement.index}
              index={i}
              total={statements.length}
              accent={statement.accent}
              label={statement.index}
              active={i === active}
              progress={scrollYProgress}
            />
          ))}
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-16 lg:px-24">
          {statements.map((statement, i) => (
            <Panel
              key={statement.index}
              statement={statement}
              index={i}
              total={statements.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * One tick of the progress rail. A component rather than a hook call in the
 * map: useTransform is a hook, and hooks cannot run inside a loop callback.
 */
function RailSegment({
  index,
  total,
  accent,
  label,
  active,
  progress,
}: {
  index: number;
  total: number;
  accent: string;
  label: string;
  active: boolean;
  progress: MotionValue<number>;
}) {
  const slice = 1 / total;
  const fill = useTransform(progress, [index * slice, (index + 1) * slice], [0, 1], {
    clamp: true,
  });

  return (
    <span className="flex items-center gap-3">
      <span className="relative block h-16 w-[3px] overflow-hidden rounded-full bg-border">
        <motion.span
          className="absolute inset-x-0 top-0 block h-full origin-top rounded-full"
          style={{ background: `var(--${accent})`, scaleY: fill }}
        />
      </span>
      <span
        className="micro transition-all duration-500"
        style={{
          color: active ? `var(--${accent})` : "var(--muted-foreground)",
          opacity: active ? 1 : 0.4,
        }}
      >
        {label}
      </span>
    </span>
  );
}

function Panel({
  statement,
  index,
  total,
  progress,
}: {
  statement: (typeof statements)[number];
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const slice = 1 / total;
  const start = index * slice;
  const end = start + slice;
  // Hold the statement steady through the middle 60% of its slice, and cross
  // it with its neighbours at the edges.
  const fadeIn = start + slice * 0.14;
  const fadeOut = end - slice * 0.14;

  const opacity = useTransform(
    progress,
    [start, fadeIn, fadeOut, end],
    index === 0 ? [1, 1, 1, 0] : index === total - 1 ? [0, 1, 1, 1] : [0, 1, 1, 0],
  );
  const y = useTransform(progress, [start, fadeIn, fadeOut, end], [40, 0, 0, -40]);
  // The diagram travels further than the text, so the panel has depth.
  const sceneY = useTransform(progress, [start, end], [90, -90]);

  return (
    <motion.div
      style={{ opacity, y }}
      className={
        index === 0
          ? "relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16"
          : "absolute inset-x-5 top-0 grid items-center gap-10 sm:inset-x-16 lg:inset-x-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16"
      }
    >
      <div className="relative min-w-0">
        {/* Oversized ghost numeral behind the claim. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-14 right-0 select-none font-display text-[9rem] font-bold leading-none tracking-tighter text-foreground opacity-[0.04] sm:-top-24 sm:text-[15rem]"
        >
          {statement.index}
        </span>

        <p className="micro relative" style={{ color: `var(--${statement.accent})` }}>
          {statement.kicker}
        </p>

        <h2 className="hero-lg relative mt-5 text-foreground">
          {statement.line.map((line, li) => (
            <span key={line} className="block">
              {li === statement.line.length - 1 ? (
                <Marked kind="underline" tone={statement.accent} delay={500}>
                  {line}
                </Marked>
              ) : (
                line
              )}
            </span>
          ))}
        </h2>

        <p className="relative mt-7 max-w-xl text-base leading-relaxed text-muted-foreground">
          {statement.body}
        </p>

        {/* The evidence. Three things a visitor can go and check. */}
        <dl className="relative mt-8 grid max-w-xl grid-cols-3 gap-4 border-t border-border/60 pt-5">
          {statement.evidence.map((item) => (
            <div key={item.label}>
              <dt
                className="font-display text-xl font-bold leading-none tracking-tight sm:text-2xl"
                style={{ color: `var(--${statement.accent})` }}
              >
                {item.value}
              </dt>
              <dd className="mt-2 flex items-start gap-1.5 font-mono text-[10px] uppercase leading-relaxed tracking-widest text-muted-foreground">
                <CheckMark tone={statement.accent} className="mt-px h-3 w-3.5 shrink-0" />
                {item.label}
              </dd>
            </div>
          ))}
        </dl>

        <HandNote
          tone={statement.accent}
          rotate={-3}
          size="sm"
          arrow="curve"
          className="relative mt-6 hidden sm:inline-flex"
          arrowClassName="h-7 w-8"
        >
          {statement.note}
        </HandNote>
      </div>

      {/* The diagram. */}
      <motion.div style={{ y: sceneY }} className="hidden min-w-0 lg:block">
        <StatementScene id={statement.scene as SceneId} />
      </motion.div>
    </motion.div>
  );
}

/** Reduced-motion fallback: no pinning, no cross-fade, same content. */
function StackedStatements() {
  return (
    <section data-act="noir" className="act-noir relative">
      <div className="mx-auto max-w-5xl space-y-24 px-5 py-24 sm:px-8">
        {statements.map((statement) => (
          <div key={statement.index}>
            <p className="micro" style={{ color: `var(--${statement.accent})` }}>
              {statement.index} — {statement.kicker}
            </p>
            <SplitLines
              as="h2"
              onView
              lines={statement.line}
              className="hero-lg mt-5 text-foreground"
            />
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              {statement.body}
            </p>
            <dl className="mt-8 grid max-w-xl grid-cols-3 gap-4 border-t border-border/60 pt-5">
              {statement.evidence.map((item) => (
                <div key={item.label}>
                  <dt
                    className="font-display text-xl font-bold leading-none tracking-tight"
                    style={{ color: `var(--${statement.accent})` }}
                  >
                    {item.value}
                  </dt>
                  <dd className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-10">
              <StatementScene id={statement.scene as SceneId} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
