import { Check, Cpu, LayoutDashboard, Rocket, Smartphone } from "lucide-react";
import { pillars } from "@/lib/site";
import { HandNote, Marked, SectionLabel, SplitLines } from "@/components/kit";
import { accentSurface } from "@/lib/accents";
import { Reveal } from "@/components/Reveal";

const ICONS = {
  ship: Rocket,
  model: Cpu,
  mobile: Smartphone,
  operate: LayoutDashboard,
} as const;

/**
 * Four capability cards — the analogue of PostHog's Signals / Scouts / Inbox /
 * Pull requests grid. Each card owns one accent so the row reads as a set.
 */
export function Pillars() {
  return (
    <section data-act="hog" className="act-hog relative border-t-2 border-border/15">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <SectionLabel index="01">What I actually do</SectionLabel>
        </Reveal>

        <SplitLines
          as="h2"
          onView
          lines={["Four things I do", "end to end."]}
          className="hero-md mt-6 max-w-2xl text-foreground"
        />

        <Reveal delay={100}>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Not a list of technologies — a list of{" "}
            <Marked kind="underline" tone="hog-red" delay={300}>
              outcomes I can own
            </Marked>{" "}
            from the first commit to the thing running in production.
          </p>
          <span className="mt-4 hidden lg:inline-flex">
            <HandNote tone="hog-blue" rotate={-3} size="sm">
              pick the one you need and ask me about it
            </HandNote>
          </span>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, i) => {
            const Icon = ICONS[pillar.id];
            return (
              <Reveal key={pillar.id} delay={i * 90}>
                <article className="hog-card hog-card-hover flex h-full flex-col overflow-hidden">
                  <span
                    aria-hidden
                    className="h-1.5 w-full"
                    style={{ background: `var(--${pillar.accent})` }}
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-md border-2 border-border"
                      style={accentSurface(pillar.accent)}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.2} />
                    </span>

                    <p className="micro mt-4" style={{ color: `var(--${pillar.accent})` }}>
                      {pillar.label}
                    </p>
                    <h3 className="mt-2 font-display text-[1.3rem] font-bold leading-[1.15] tracking-tight text-foreground">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {pillar.body}
                    </p>

                    <ul className="mt-5 space-y-2 border-t-2 border-border/15 pt-4">
                      {pillar.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-[13px] text-foreground/85"
                        >
                          <Check
                            className="mt-0.5 h-3.5 w-3.5 shrink-0"
                            strokeWidth={3}
                            style={{ color: `var(--${pillar.accent})` }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
