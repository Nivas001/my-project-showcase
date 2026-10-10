import { pillars } from "@/lib/site";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Eyebrow, FadeIn, RiseWords, SectionGlow } from "./fx";
import { CAPABILITY_ILLOS } from "./illustrations";

/** One hue per capability; the drawing's moving part takes it too. */
const TONES = ["tone-amber", "tone-rose", "tone-cyan", "tone-violet"];

/**
 * Four things owned end to end: a small drawing of the thing itself working,
 * then a number, a claim and one sentence, sitting on a shared hairline. The stack that
 * used to hang off every card lives once, in the technical-depth section.
 */
export function Capabilities() {
  return (
    <section data-act="noir" data-rail="Capabilities" className="act-noir tone-cyan relative">
      <SectionGlow side="left" />
      <div className="relative mx-auto max-w-6xl px-5 pb-28 sm:px-8 sm:pb-40">
        <Eyebrow index="02">What I do</Eyebrow>

        <RiseWords
          text="Four things I own,"
          muted="from the first commit to production."
          className="mt-10 max-w-[22ch] text-balance font-display text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-foreground"
        />

        <ol className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {pillars.map((pillar, i) => {
            const Illo = CAPABILITY_ILLOS[pillar.id];
            return (
              <FadeIn
                as="li"
                key={pillar.id}
                delay={i * 0.08}
                className={cn(
                  "group relative border-t border-border pt-6",
                  TONES[i % TONES.length],
                )}
              >
                <span
                  aria-hidden
                  className="absolute -top-px left-0 h-[2px] w-12 bg-(--tone) transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
                />
                <div
                  className="tone-card rounded-2xl px-3 py-4"
                  style={{ "--accent": "var(--tone)" } as CSSProperties}
                >
                  <Illo />
                </div>
                <span className="mt-6 block font-mono text-[11px] tabular-nums text-(--tone)">
                  0{i + 1}
                </span>
                <h3 className="mt-3 text-[1.15rem] font-medium leading-snug tracking-tight text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
                  {pillar.body}
                </p>
              </FadeIn>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
