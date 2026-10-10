import { principles } from "@/lib/site";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Blocks, Rocket, SlidersHorizontal, Wrench, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE, Eyebrow, FadeIn, RiseWords } from "./fx";

/** Each principle's hue and mark, in list order; extra principles wrap round. */
const TONES = ["tone-amber", "tone-rose", "tone-violet", "tone-cyan"];
const ICONS: LucideIcon[] = [Rocket, Blocks, Wrench, SlidersHorizontal];

/**
 * Four opinions, as a numbered list. The heading holds still on desktop while
 * the principles pass beside it; the one in the middle of the screen is lit
 * in its own hue, its number rolls over in the margin, and the glow behind
 * the heading turns to match.
 */
export function HowIWork() {
  const [active, setActive] = useState(0);
  const activeTone = TONES[active % TONES.length];
  return (
    <section data-act="noir" data-rail="Principles" className="act-noir tone-rose relative">
      {/* A wash of the lit principle's hue; background-color transitions between them. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute -left-60 top-0 h-[36rem] w-[52rem] bg-(--tone) opacity-[0.13] transition-[background-color] duration-700 [mask-image:radial-gradient(closest-side,black,transparent)]",
            activeTone,
          )}
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-5 pb-28 sm:px-8 sm:pb-40">
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
              className="mt-14 hidden h-[9rem] overflow-hidden font-display text-[9rem] font-semibold leading-none tracking-[-0.06em] lg:block"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={active}
                  className={cn(
                    "block w-fit bg-gradient-to-b from-(--tone)/55 to-(--tone)/0 bg-clip-text tabular-nums text-transparent",
                    activeTone,
                  )}
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
            {principles.map((principle, i) => {
              const Icon = ICONS[i % ICONS.length]!;
              const on = i === active;
              return (
                <motion.li
                  key={principle.title}
                  onViewportEnter={() => setActive(i)}
                  viewport={{ margin: "-45% 0px -45% 0px" }}
                  className={cn(
                    "relative grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-border py-8 transition-opacity duration-500 last:border-b sm:grid-cols-[3.5rem_1fr] sm:py-10",
                    TONES[i % TONES.length],
                    on ? "lg:opacity-100" : "lg:opacity-35",
                  )}
                >
                  {/* The lit principle's rule takes its hue and runs the full width. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -top-px left-0 h-px origin-left bg-gradient-to-r from-(--tone) to-transparent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      "w-full",
                      on ? "scale-x-100" : "scale-x-[0.15] lg:scale-x-0",
                    )}
                  />
                  <span className="pt-1 font-mono text-[11px] tabular-nums text-(--tone)">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="flex items-center gap-3 text-[1.3rem] font-medium leading-snug tracking-[-0.02em] text-foreground sm:text-[1.45rem]">
                      <span
                        aria-hidden
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-(--tone)/25 bg-(--tone)/10 text-(--tone) transition-shadow duration-500",
                          on && "lg:shadow-[0_0_24px_-4px_var(--tone)]",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      {principle.title}
                    </h3>
                    <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                      {principle.body}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
