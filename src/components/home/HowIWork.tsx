import { principles } from "@/lib/site";
import { accentFor, accentSurface } from "@/lib/accents";
import { Annotation, DoodleArrow, SectionLabel, SplitLines } from "@/components/kit";
import { Reveal } from "@/components/Reveal";

/** Inline SVG illustrations — one per principle, in order. */
const ILLUSTRATIONS = [
  // 01 — Ship it, then make it good: rocket launching
  (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* exhaust */}
      <ellipse cx="40" cy="66" rx="7" ry="4" fill="currentColor" opacity="0.15"/>
      <path d="M34 62 Q40 74 46 62" fill="currentColor" opacity="0.25"/>
      {/* body */}
      <path d="M40 14 C28 28 26 44 28 56 Q34 62 40 62 Q46 62 52 56 C54 44 52 28 40 14Z" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.5"/>
      {/* nose */}
      <path d="M33 34 Q40 14 47 34Z" fill="currentColor" opacity="0.3"/>
      {/* window */}
      <circle cx="40" cy="42" r="5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="40" cy="42" r="2.5" fill="currentColor" opacity="0.4"/>
      {/* fins */}
      <path d="M28 52 L22 62 L30 56Z" fill="currentColor" opacity="0.2"/>
      <path d="M52 52 L58 62 L50 56Z" fill="currentColor" opacity="0.2"/>
    </svg>
  ),
  // 02 — Own the whole stack: stacked layers
  (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* bottom layer */}
      <ellipse cx="40" cy="62" rx="22" ry="6" fill="currentColor" opacity="0.10" stroke="currentColor" strokeWidth="1.5"/>
      {/* middle layer */}
      <path d="M18 50 L40 56 L62 50 L40 44Z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
      {/* top layer */}
      <path d="M22 38 L40 44 L58 38 L40 32Z" fill="currentColor" opacity="0.22" stroke="currentColor" strokeWidth="1.5"/>
      {/* top cap */}
      <path d="M28 26 L40 32 L52 26 L40 20Z" fill="currentColor" opacity="0.32" stroke="currentColor" strokeWidth="1.5"/>
      {/* vertical connectors */}
      <line x1="40" y1="20" x2="40" y2="56" stroke="currentColor" strokeWidth="1" opacity="0.2" strokeDasharray="2 2"/>
    </svg>
  ),
  // 03 — Boring tech: gear/cog (reliability)
  (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M40 18 L43 22 L48 20 L50 25 L55 25 L55 30 L60 32 L58 37 L62 40 L58 43 L60 48 L55 50 L55 55 L50 55 L48 60 L43 58 L40 62 L37 58 L32 60 L30 55 L25 55 L25 50 L20 48 L22 43 L18 40 L22 37 L20 32 L25 30 L25 25 L30 25 L32 20 L37 22Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.10"/>
      <circle cx="40" cy="40" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="40" cy="40" r="3" fill="currentColor" opacity="0.5"/>
    </svg>
  ),
  // 04 — Admin panel too: grid/dashboard
  (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* browser chrome */}
      <rect x="14" y="18" width="52" height="44" rx="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.06"/>
      <line x1="14" y1="28" x2="66" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
      {/* traffic dots */}
      <circle cx="22" cy="23" r="2" fill="currentColor" opacity="0.4"/>
      <circle cx="29" cy="23" r="2" fill="currentColor" opacity="0.25"/>
      <circle cx="36" cy="23" r="2" fill="currentColor" opacity="0.15"/>
      {/* sidebar */}
      <rect x="18" y="32" width="14" height="26" rx="2" fill="currentColor" opacity="0.12"/>
      {/* cards */}
      <rect x="36" y="32" width="12" height="11" rx="2" fill="currentColor" opacity="0.20"/>
      <rect x="52" y="32" width="10" height="11" rx="2" fill="currentColor" opacity="0.14"/>
      <rect x="36" y="47" width="26" height="11" rx="2" fill="currentColor" opacity="0.16"/>
    </svg>
  ),
] as const;

export function HowIWork() {
  return (
    <section data-act="hog" className="act-hog relative border-t-2 border-border/15">
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Sticky heading column */}
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
              className="hero-md mt-6 text-foreground"
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

          {/* Principles */}
          <ol className="space-y-5">
            {principles.map((principle, i) => {
              const accent = accentFor(i);
              const Illo = ILLUSTRATIONS[i];
              return (
                <Reveal key={principle.title} delay={i * 90}>
                  <li className="hog-card hog-card-hover group relative flex gap-5 overflow-hidden p-5 sm:p-6">
                    {/* Illustration floats in the top-right corner */}
                    <div
                      className="pointer-events-none absolute right-4 top-2 h-20 w-20 opacity-60 transition-opacity duration-300 group-hover:opacity-90"
                      style={{ color: `var(--${accent})` }}
                    >
                      {Illo}
                    </div>

                    <span
                      aria-hidden
                      className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-md border-2 border-border font-display text-lg font-bold"
                      style={accentSurface(accent)}
                    >
                      {i + 1}
                    </span>
                    <div className="relative z-10 min-w-0 pr-14">
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
