import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { Marquee } from "@/components/kit";
import { tickerItems } from "@/lib/site";

/**
 * The turn. A cream sheet slides up over the black field and the site changes
 * register — Act I's restraint gives way to Act II's product page.
 *
 * This is the one piece of pure theatre on the site, so it gets its own
 * scroll-length and nothing competes with it — but kept short enough that a
 * visitor who just wants the work is not held hostage by it.
 */
export function ActWipe() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // The sheet covers the screen over the first 75% of the scroll, then holds.
  const sheetY = useTransform(scrollYProgress, [0, 0.75], ["100%", "0%"]);
  // Behind it, Act I recedes rather than simply being covered.
  const noirScale = useTransform(scrollYProgress, [0, 0.75], [1, 0.94]);
  const noirOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0.25]);
  // The headline only resolves once the sheet has actually landed.
  const titleOpacity = useTransform(scrollYProgress, [0.58, 0.82], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0.58, 0.82], [36, 0]);

  if (reduced) return <StaticTurn />;

  return (
    <section ref={ref} className="relative h-[160vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Act I, receding. */}
        <motion.div
          data-act="noir"
          style={{ scale: noirScale, opacity: noirOpacity }}
          className="act-noir grain absolute inset-0 flex flex-col items-center justify-center gap-6"
        >
          <div
            aria-hidden
            className="hairline-grid pointer-events-none absolute inset-0 opacity-40"
          />
          <p className="micro relative text-muted-foreground">Keep going</p>
          <ArrowDown className="relative h-5 w-5 text-hog-red" />
        </motion.div>

        {/* The sheet. */}
        <motion.div
          data-act="hog"
          style={{ y: sheetY }}
          className="act-hog absolute inset-0 border-t-[3px] border-ink shadow-[0_-18px_50px_-12px_oklch(0_0_0/45%)]"
        >
          <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />

          <motion.div
            style={{ opacity: titleOpacity, y: titleY }}
            className="relative flex h-full flex-col items-center justify-center px-5 text-center"
          >
            <p className="micro text-accent">Act II</p>
            <h2 className="display-xl mt-4 text-foreground">
              The work<span className="text-hog-red">.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Six projects, three of them live. Here's what each one actually does and what it took
              to build.
            </p>
          </motion.div>

          <div className="absolute inset-x-0 bottom-0 border-t-2 border-border py-3">
            <Marquee
              items={tickerItems}
              duration={46}
              reverse
              className="text-muted-foreground [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** Reduced-motion fallback: the change of register still happens, just as a cut. */
function StaticTurn() {
  return (
    <section data-act="hog" className="act-hog relative border-t-[3px] border-ink">
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative mx-auto max-w-3xl px-5 py-28 text-center">
        <p className="micro text-accent">Act II</p>
        <h2 className="display-lg mt-4 text-foreground">
          The work<span className="text-hog-red">.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
          Six projects, three of them live. Here's what each one actually does and what it took to
          build.
        </p>
      </div>
    </section>
  );
}
