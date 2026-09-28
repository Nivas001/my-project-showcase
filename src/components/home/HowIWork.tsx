import { principles } from "@/lib/site";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE, Eyebrow, FadeIn, RiseWords } from "./fx";

/**
 * Four opinions, as a numbered list. The heading holds still on desktop while
 * the principles pass beside it; the one in the middle of the screen is lit,
 * and its number rolls over in the margin.
 */
export function HowIWork() {
  const [active, setActive] = useState(0);
  return (
    <section data-act="noir" data-rail="Principles" className="act-noir relative">
      <div className="mx-auto max-w-6xl px-5 pb-28 sm:px-8 sm:pb-40">
        <Eyebrow index="07">How I work</Eyebrow>

        <div className="mt-10 grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <RiseWords
              text="I have opinions."
              muted="Here they are."
              className="max-w-[14ch] font-display text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-foreground"
            />
            <FadeIn delay={0.2}>
              <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
                Years of building alone taught me which of these matter, and which were just
                preferences I was defending.
              </p>
            </FadeIn>

            {/* The current principle's number, rolling as the list passes. */}
            <div
              aria-hidden
              className="mt-14 hidden h-[9rem] overflow-hidden font-display text-[9rem] font-semibold leading-none tracking-[-0.06em] text-foreground/[0.08] lg:block"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={active}
                  className="block tabular-nums"
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  0{active + 1}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <ol className="lg:col-span-7">
            {principles.map((principle, i) => (
              <motion.li
                key={principle.title}
                onViewportEnter={() => setActive(i)}
                viewport={{ margin: "-45% 0px -45% 0px" }}
                className={`grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-border py-8 transition-opacity duration-500 last:border-b sm:grid-cols-[3.5rem_1fr] sm:py-10 ${
                  i === active ? "lg:opacity-100" : "lg:opacity-35"
                }`}
              >
                <span
                  className={`pt-1 font-mono text-[11px] tabular-nums transition-colors duration-500 ${
                    i === active ? "text-accent" : "text-muted-foreground"
                  }`}
                >
                  0{i + 1}
                </span>
                <div>
                  <h3 className="text-[1.3rem] font-medium leading-snug tracking-[-0.02em] text-foreground sm:text-[1.45rem]">
                    {principle.title}
                  </h3>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                    {principle.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
