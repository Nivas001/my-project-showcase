import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "motion/react";
import { statements } from "@/lib/site";
import { SplitLines } from "@/components/kit";

/**
 * Three full-height statements pinned to the viewport. Scrolling advances the
 * statement rather than the page, so each claim gets the screen to itself.
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

  if (reduced) return <StackedStatements />;

  return (
    <section
      data-act="noir"
      ref={ref}
      className="act-noir relative"
      style={{ height: `${statements.length * 100}vh` }}
    >
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <div
          aria-hidden
          className="hairline-grid pointer-events-none absolute inset-0 opacity-40"
        />

        {/* Progress rail — where you are in the sequence. */}
        <div className="absolute left-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-4 sm:flex lg:left-8">
          <span className="micro text-muted-foreground">01</span>
          <div className="relative h-32 w-px bg-border">
            <motion.div
              className="absolute left-0 top-0 w-px origin-top bg-hog-red"
              style={{ height: "100%", scaleY: scrollYProgress }}
            />
          </div>
          <span className="micro text-muted-foreground">0{statements.length}</span>
        </div>

        <div className="relative mx-auto w-full max-w-5xl px-5 sm:px-16 lg:px-20">
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

  return (
    <motion.div
      style={{ opacity, y }}
      className={index === 0 ? "relative" : "absolute inset-x-5 top-0 sm:inset-x-16 lg:inset-x-20"}
    >
      {/* Oversized ghost numeral behind the claim. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 right-0 select-none font-display text-[10rem] font-bold leading-none tracking-tighter text-foreground opacity-[0.04] sm:-top-24 sm:text-[16rem]"
      >
        {statement.index}
      </span>

      <p className="micro relative text-hog-red">{statement.kicker}</p>
      <h2 className="display-lg relative mt-5 text-foreground">
        {statement.line.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
      <p className="relative mt-7 max-w-xl text-base leading-relaxed text-muted-foreground">
        {statement.body}
      </p>
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
            <p className="micro text-hog-red">
              {statement.index} — {statement.kicker}
            </p>
            <SplitLines
              as="h2"
              onView
              lines={statement.line}
              className="display-lg mt-5 text-foreground"
            />
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              {statement.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
