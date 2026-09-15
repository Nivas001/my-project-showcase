import { ArrowRight, Download, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/site";
import {
  Annotation,
  DoodleArrow,
  HardLink,
  HardRouteLink,
  SplitLines,
  Squiggle,
  StatusDot,
  Sticker,
} from "@/components/kit";
import { accentSurface } from "@/lib/accents";
import { Reveal } from "@/components/Reveal";

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
    accent: "hog-red",
  },
  { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone}`, accent: "hog-blue" },
  { icon: Github, label: "GitHub", value: "Nivas001", href: site.github, accent: "hog-yellow" },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "srinivas-m",
    href: site.linkedin,
    accent: "hog-green",
  },
] as const;

/**
 * The close. Shaped like a pricing card, because the joke lands and because the
 * shape already tells a visitor "this is the part where you decide".
 */
export function HireCTA() {
  return (
    <section data-act="hog" className="act-hog relative border-t-2 border-border/15">
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="relative">
          <div className="absolute -top-5 left-1/2 z-10 -translate-x-1/2">
            <Sticker tone="hog-red" rotate={-4}>
              Open to offers
            </Sticker>
          </div>

          <div className="hog-card hard-shadow-lg overflow-hidden">
            <div className="border-b-2 border-border bg-secondary px-6 py-9 text-center sm:px-10 sm:py-12">
              <p className="micro text-muted-foreground">Currently</p>
              <SplitLines
                as="h2"
                onView
                lines={["Free to talk."]}
                className="display-lg mt-3 text-foreground"
              />
              <div className="mx-auto mt-3 w-52">
                <Squiggle tone="hog-red" />
              </div>
              <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
                Looking for a full-stack or Python role where I own real surface area. Contract work
                and interesting one-off builds welcome too.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <HardLink href={`mailto:${site.email}`} size="lg" variant="primary">
                  <Mail className="h-4 w-4" />
                  Start a conversation
                </HardLink>
                <HardLink href={site.resumeUrl} download size="lg" variant="secondary">
                  <Download className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                  Download résumé
                </HardLink>
              </div>

              <p className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <StatusDot />
                  Available now
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {site.location}
                </span>
                <span>Replies within a day</span>
              </p>
            </div>

            <div className="grid sm:grid-cols-2">
              {CHANNELS.map((channel, i) => (
                <a
                  key={channel.label}
                  href={channel.href}
                  {...(channel.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  className={`group flex items-center gap-4 p-5 transition-colors hover:bg-secondary ${
                    i % 2 === 0 ? "sm:border-r-2" : ""
                  } ${i < CHANNELS.length - 2 ? "border-b-2" : ""} border-border/15`}
                >
                  <span
                    aria-hidden
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-md border-2 border-border"
                    style={accentSurface(channel.accent)}
                  >
                    <channel.icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {channel.label}
                    </span>
                    <span className="block truncate text-sm font-medium text-foreground">
                      {channel.value}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              ))}
            </div>
          </div>

          <Reveal delay={150}>
            <div className="mt-8 flex items-start justify-center gap-2">
              <DoodleArrow tone="hog-blue" flip className="h-12 w-14 -scale-y-100" />
              <Annotation tone="hog-blue" rotate={-3} className="pt-4">
                or just poke around a bit longer
              </Annotation>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <HardRouteLink to="/fun" variant="ghost" size="sm">
                Play a game
              </HardRouteLink>
              <HardRouteLink to="/horror" variant="ghost" size="sm">
                Read something unsettling
              </HardRouteLink>
              <HardRouteLink to="/about" variant="ghost" size="sm">
                The long version
              </HardRouteLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
