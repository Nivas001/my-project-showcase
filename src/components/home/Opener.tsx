import { ArrowRight, Mail } from "lucide-react";
import type { Project } from "@/lib/projects";
import { site, toAbsoluteUrl, prettyUrl } from "@/lib/site";
import {
  Annotation,
  BrowserFrame,
  DoodleArrow,
  HardLink,
  HardRouteLink,
  SplitLines,
  Squiggle,
} from "@/components/kit";
import { Reveal } from "@/components/Reveal";

/**
 * Act II's opening pitch. Structured like a product landing page, because that
 * is what a portfolio is — the product just happens to be a person.
 *
 * The headline spans the full container rather than sitting in a column: at
 * display-lg sizes a half-width column would wrap every line and destroy the
 * stacked rhythm.
 */
export function Opener({ projects }: { projects: Project[] }) {
  // Lead with whatever is live and featured; a running product is the strongest
  // thing on the page, so it goes in the browser frame.
  const hero =
    projects.find((p) => p.featured && p.live_url && p.screenshots.length > 0) ??
    projects.find((p) => p.screenshots.length > 0) ??
    projects[0];
  const heroUrl = toAbsoluteUrl(hero?.live_url);

  return (
    <section id="showcase" data-act="hog" className="act-hog relative scroll-mt-16">
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <SplitLines
          as="h2"
          onView
          lines={["What if your next hire", "had already shipped?"]}
          className="display-lg max-w-[18ch] text-foreground"
        />

        <Reveal delay={120}>
          <div className="mt-3 w-full max-w-sm">
            <Squiggle tone="hog-red" />
          </div>
        </Reveal>

        <div className="mt-12 grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <Reveal delay={60} className="min-w-0">
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
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

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t-2 border-border/15 pt-6">
              {[
                ["3", "products in production"],
                ["1", "published research model"],
                ["0", "handoffs required"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-3xl font-bold leading-none tracking-tighter text-foreground">
                    {value}
                  </dt>
                  <dd className="mt-2 font-mono text-[10px] uppercase leading-relaxed tracking-widest text-muted-foreground">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* The proof: a real product, framed like a running browser. */}
          {hero ? (
            <Reveal delay={160} className="relative min-w-0">
              <div className="pointer-events-none absolute -top-12 left-2 z-10 hidden items-start gap-1 lg:flex">
                <Annotation tone="hog-blue" rotate={-8}>
                  this one's live
                </Annotation>
                <DoodleArrow tone="hog-blue" className="h-10 w-12 translate-y-1" />
              </div>

              <BrowserFrame url={heroUrl ? prettyUrl(heroUrl) : hero.title}>
                <div className="aspect-[16/10] w-full overflow-hidden bg-secondary">
                  {hero.screenshots[0] ? (
                    <img
                      src={hero.screenshots[0]}
                      alt=""
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
                      {hero.title}
                    </div>
                  )}
                </div>
              </BrowserFrame>

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
      </div>
    </section>
  );
}
