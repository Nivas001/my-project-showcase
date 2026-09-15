import { ArrowRight, Check, Cpu, LayoutDashboard, Mail, Rocket, Smartphone } from "lucide-react";
import { heroProject, type Project } from "@/lib/projects";
import { pillars, site, toAbsoluteUrl, prettyUrl } from "@/lib/site";
import { accentSurface } from "@/lib/accents";
import {
  BrowserFrame,
  HandNote,
  HardLink,
  HardRouteLink,
  Marked,
  ScribbleArrow,
  SectionLabel,
  SplitLines,
  Squiggle,
  StatusDot,
  TiltCard,
} from "@/components/kit";
import { Shot } from "@/components/Shot";
import { Reveal } from "@/components/Reveal";

/**
 * Act II's opening pitch. Structured like a product landing page, because that
 * is what a portfolio is — the product just happens to be a person.
 *
 * The first thing it does is answer "who is this?" in plain words, with the
 * four verbs the rest of the site keeps proving. Someone who reads only this
 * section should be able to describe what I do to a colleague.
 *
 * The headline spans the full container rather than sitting in a column: at
 * display sizes a half-width column would wrap every line and destroy the
 * stacked rhythm.
 */

const ICONS = {
  ship: Rocket,
  model: Cpu,
  mobile: Smartphone,
  operate: LayoutDashboard,
} as const;

export function Opener({ projects }: { projects: Project[] }) {
  // Lead with whatever is live and featured; a running product is the strongest
  // thing on the page, so it goes in the browser frame.
  const hero = heroProject(projects);
  const heroUrl = toAbsoluteUrl(hero?.live_url);

  return (
    <section id="showcase" data-act="hog" className="act-hog relative scroll-mt-16">
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <SplitLines
          as="h2"
          onView
          lines={["What if your next hire", "had already shipped?"]}
          className="hero-lg max-w-[18ch] text-foreground"
        />

        <Reveal delay={120}>
          <div className="mt-3 w-full max-w-sm">
            <Squiggle tone="hog-red" />
          </div>
        </Reveal>

        {/* ---- Who this is, said plainly ---- */}
        <Reveal delay={80}>
          <div className="mt-12 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <div className="min-w-0">
              <p className="text-xl leading-snug text-foreground sm:text-2xl">
                I&apos;m <span className="signature-name font-semibold">Srinivas</span> — a{" "}
                <Marked kind="underline" tone="hog-red" delay={400}>
                  full-stack engineer
                </Marked>{" "}
                who takes a product from an empty repo to a live domain, on my own.
              </p>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                {site.summary}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <HardRouteLink to="/projects" size="lg" variant="primary">
                  See the work
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </HardRouteLink>
                <HardLink href={`mailto:${site.email}`} size="lg" variant="secondary">
                  <Mail className="h-4 w-4" />
                  Talk to a human
                </HardLink>
              </div>

              {/* The three-figure row that sat here was hardcoded ("3", "1",
                  "0") and restated the spec sheet's tiles further down, which
                  count the same things from live data. */}
            </div>

            {/* The proof: a real product, framed like a running browser. */}
            {hero ? (
              <Reveal delay={160} className="relative min-w-0">
                <div className="pointer-events-none absolute -top-12 left-2 z-10 hidden items-start gap-1 lg:flex">
                  <HandNote tone="hog-blue" rotate={-8}>
                    this one&apos;s live
                  </HandNote>
                  <ScribbleArrow
                    kind="curve"
                    tone="hog-blue"
                    className="h-10 w-11 translate-y-1"
                    delay={600}
                  />
                </div>

                <TiltCard max={5} lift={12}>
                  <BrowserFrame url={heroUrl ? prettyUrl(heroUrl) : hero.title}>
                    <div className="aspect-[16/10] w-full overflow-hidden bg-secondary">
                      <Shot src={hero.screenshots[0]} alt={`${hero.title} screenshot`} />
                    </div>
                  </BrowserFrame>
                </TiltCard>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="min-w-0 font-mono text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{hero.title}</span>
                    {heroUrl ? ` — ${prettyUrl(heroUrl)}` : ""}
                  </p>
                  {heroUrl ? (
                    <HardLink
                      href={heroUrl}
                      target="_blank"
                      rel="noreferrer"
                      size="sm"
                      variant="ghost"
                    >
                      Visit site
                      <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </HardLink>
                  ) : null}
                </div>
              </Reveal>
            ) : null}
          </div>
        </Reveal>

        {/* ---- The four things I own end to end ----
            These used to be a separate Pillars section under a Design/Build/
            Secure/Ship grid that said the same four things with less substance.
            One grid, the one with the evidence in it. */}
        <div className="mt-20 border-t-2 border-border/15 pt-16">
          <Reveal>
            <SectionLabel index="01">What I actually do</SectionLabel>
          </Reveal>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <SplitLines
              as="h3"
              onView
              lines={["Four things I do", "end to end."]}
              className="hero-md max-w-2xl text-foreground"
            />
            <Reveal delay={100}>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Not a list of technologies — a list of{" "}
                <Marked kind="underline" tone="hog-red" delay={300}>
                  outcomes I can own
                </Marked>
                , from the first commit to the thing running in production.
              </p>
            </Reveal>
          </div>

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
                      <h4 className="mt-2 font-display text-[1.3rem] font-bold leading-[1.15] tracking-tight text-foreground">
                        {pillar.title}
                      </h4>
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

          <Reveal delay={120}>
            <p className="mt-6 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
              <StatusDot />
              Available for full-time and contract work · {site.location}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
