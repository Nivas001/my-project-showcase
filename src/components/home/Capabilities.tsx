import { pillars } from "@/lib/site";
import { Eyebrow, FadeIn, RiseWords } from "./fx";
import { CAPABILITY_ILLOS } from "./illustrations";

/**
 * Four things owned end to end: a small drawing of the thing itself working,
 * then a number, a claim and one sentence, sitting on a shared hairline. The stack that
 * used to hang off every card lives once, in the technical-depth section.
 */
export function Capabilities() {
  return (
    <section data-act="noir" data-rail="Capabilities" className="act-noir relative">
      <div className="mx-auto max-w-6xl px-5 pb-28 sm:px-8 sm:pb-40">
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
                className="group border-t border-border pt-6"
              >
                <div className="rounded-2xl border border-border/70 bg-card/40 px-3 py-4 transition-colors duration-500 group-hover:border-border">
                  <Illo />
                </div>
                <span className="mt-6 block font-mono text-[11px] tabular-nums text-muted-foreground">
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
