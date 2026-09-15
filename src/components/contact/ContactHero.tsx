import { Download, Mail } from "lucide-react";
import { site } from "@/lib/site";
import {
  CheckMark,
  HandNote,
  HardLink,
  Highlight,
  LocalClock,
  Marked,
  ScribbleArrow,
  SectionLabel,
  StarMark,
  StatusDot,
} from "@/components/kit";

/* ==========================================================================
 * THE CONTACT OPENER
 *
 * A contact page's real job is removing the reasons someone talks themselves
 * out of writing. So this answers the three unasked questions up front — is my
 * thing worth writing about, how long will a reply take, and is anyone
 * actually at the other end — before asking for anything at all.
 * ======================================================================== */

const REASONS = [
  "you are hiring a full-stack engineer",
  "you need a product built end to end",
  "you want a Flutter app that actually ships",
  "you have an NLP problem in a small language",
  "you just want to argue about schemas",
];

const STEPS = [
  {
    step: "01",
    title: "You write",
    body: "The form below opens your own mail app with everything filled in. Or email me directly — same inbox.",
    tone: "hog-red",
  },
  {
    step: "02",
    title: "I reply — usually same day",
    body: "Within a day at the outside, and always with a real answer rather than a holding note.",
    tone: "hog-yellow",
  },
  {
    step: "03",
    title: "We work out whether it fits",
    body: "A short call, in your timezone. If I am not the right person I will say so and point you somewhere better.",
    tone: "hog-green",
  },
];

export function ContactHero() {
  return (
    <section data-act="noir" className="act-noir grain relative overflow-hidden">
      <div aria-hidden className="hairline-grid pointer-events-none absolute inset-0 opacity-50" />
      <div
        aria-hidden
        className="wallpaper-drift pointer-events-none absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle, var(--hog-red) 0%, transparent 70%)",
          opacity: 0.16,
        }}
      />
      <div
        aria-hidden
        className="wallpaper-drift pointer-events-none absolute -right-24 bottom-0 h-[24rem] w-[24rem] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle, var(--signature) 0%, transparent 70%)",
          opacity: 0.12,
          animationDelay: "-8s",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
        <SectionLabel index="01" className="max-w-xs">
          Contact
        </SectionLabel>

        <h1 className="hero-xl mt-6 text-foreground">
          <span className="line-mask">
            <span
              className="line-rise block"
              style={{ "--line-delay": "100ms" } as React.CSSProperties}
            >
              Let&apos;s
            </span>
          </span>
          {/* No mask on this line: the circle overshoots its box by design. */}
          <span
            className="fade-rise block"
            style={{ "--line-delay": "250ms" } as React.CSSProperties}
          >
            <Marked kind="circle" tone="hog-red" delay={1100} duration={950} immediate>
              talk
            </Marked>
            <span className="text-hog-red">.</span>
          </span>
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="min-w-0">
            <p
              className="fade-rise max-w-xl text-lg leading-relaxed text-foreground/90"
              style={{ "--line-delay": "420ms" } as React.CSSProperties}
            >
              Worth writing if{" "}
              <Highlight tone="hog-yellow" delay={900}>
                <span className="font-semibold text-foreground">any of this is you</span>
              </Highlight>
              :
            </p>

            <ul
              className="fade-rise mt-5 space-y-2.5"
              style={{ "--line-delay": "480ms" } as React.CSSProperties}
            >
              {REASONS.map((reason, i) => (
                <li
                  key={reason}
                  className="flex items-start gap-3 text-[15px] leading-relaxed text-muted-foreground"
                >
                  <CheckMark tone="hog-green" className="mt-1 h-3.5 w-4 shrink-0" delay={i * 150} />
                  {reason}
                </li>
              ))}
            </ul>

            <div
              className="fade-rise mt-9 flex flex-wrap items-center gap-3"
              style={{ "--line-delay": "560ms" } as React.CSSProperties}
            >
              <HardLink href={`mailto:${site.email}`} variant="invert" size="md">
                <Mail className="h-4 w-4" />
                Email me
              </HardLink>
              <HardLink href={site.resumeUrl} download variant="ghost" size="md">
                <Download className="h-4 w-4" />
                Résumé
              </HardLink>
            </div>
          </div>

          {/* What actually happens after you press send. */}
          <div
            className="fade-rise relative min-w-0"
            style={{ "--line-delay": "620ms" } as React.CSSProperties}
          >
            <div className="pointer-events-none absolute -left-8 -top-8 hidden lg:block">
              <ScribbleArrow kind="curve" tone="hog-blue" className="h-10 w-11" delay={1500} />
            </div>

            <div className="rounded-lg border border-border bg-card/55 p-6 backdrop-blur-sm">
              <p className="micro text-muted-foreground">What happens next</p>
              <ol className="mt-5 space-y-5">
                {STEPS.map((item) => (
                  <li key={item.step} className="flex gap-4">
                    <span
                      aria-hidden
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border font-mono text-[11px] font-bold"
                      style={{
                        background: `color-mix(in oklab, var(--${item.tone}) 20%, transparent)`,
                        color: `var(--${item.tone})`,
                      }}
                    >
                      {item.step}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold text-foreground">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                        {item.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>

              <p className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4 font-mono text-[11px] text-muted-foreground">
                <StatusDot />
                It is
                <LocalClock
                  timeZone={site.timezone}
                  className="font-mono tabular-nums text-foreground"
                />
                where I am
              </p>
            </div>

            <span className="mt-5 flex items-center justify-center gap-2 lg:justify-start">
              <StarMark tone="hog-yellow" className="h-3.5 w-3.5" />
              <HandNote tone="hog-yellow" rotate={-3} size="sm">
                no recruiters-only filter, promise
              </HandNote>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
