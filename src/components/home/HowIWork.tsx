import { principles } from "@/lib/site";
import { accentFor, accentSurface } from "@/lib/accents";
import { Annotation, DoodleArrow, SectionLabel, SplitLines } from "@/components/kit";
import { Reveal } from "@/components/Reveal";

/**
 * Opinions, stated plainly. PostHog's equivalent section ("agents run on their
 * own, but don't run wild") works because it takes a position — so this one
 * does too, rather than listing neutral soft skills.
 */
export function HowIWork() {
  return (
    <section data-act="hog" className="act-hog relative border-t-2 border-border/15">
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal>
              <SectionLabel index="05" rule={false}>
                How I work
              </SectionLabel>
            </Reveal>

            <SplitLines
              as="h2"
              onView
              lines={["I have opinions.", "Here they are."]}
              className="display-md mt-6 text-foreground"
            />

            <Reveal delay={120}>
              <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
                Four years of building things alone taught me what actually matters and what was
                just a preference I was defending.
              </p>

              <div className="mt-8 hidden items-end gap-2 lg:flex">
                <DoodleArrow tone="hog-red" className="h-14 w-16" />
                <Annotation tone="hog-red" rotate={-5} className="pb-3">
                  disagree? let's argue
                </Annotation>
              </div>
            </Reveal>
          </div>

          <ol className="space-y-5">
            {principles.map((principle, i) => {
              const accent = accentFor(i);
              return (
                <Reveal key={principle.title} delay={i * 90}>
                  <li className="hog-card hog-card-hover flex gap-5 p-5 sm:p-6">
                    <span
                      aria-hidden
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-md border-2 border-border font-display text-lg font-bold"
                      style={accentSurface(accent)}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="display-sm text-foreground">{principle.title}</h3>
                      <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                        {principle.body}
                      </p>
                    </div>
                  </li>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
