import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { changelog } from "@/lib/site";
import { accentSurface } from "@/lib/accents";
import { SectionLabel, SplitLines } from "@/components/kit";
import { Reveal } from "@/components/Reveal";

/**
 * A changelog instead of a CV timeline. Same information, but framed as
 * shipping history — which is what the dates actually record.
 */
export function Changelog() {
  return (
    <section data-act="hog" className="act-hog relative border-t-2 border-border/15">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <SectionLabel index="06">Changelog</SectionLabel>
        </Reveal>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <SplitLines
            as="h2"
            onView
            lines={["What shipped,", "and when."]}
            className="display-md text-foreground"
          />
          <Reveal delay={100}>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Newest first. Every entry links to the thing it's about.
            </p>
          </Reveal>
        </div>

        <div className="hog-card mt-12 overflow-hidden">
          {changelog.map((entry, i) => {
            const rowClass = `group flex flex-col gap-4 p-5 transition-colors hover:bg-secondary sm:flex-row sm:items-start sm:gap-8 sm:p-6 ${
              i < changelog.length - 1 ? "border-b-2 border-border/15" : ""
            }`;
            const body = (
              <>
                <div className="flex shrink-0 items-center gap-3 sm:w-44 sm:flex-col sm:items-start sm:gap-2">
                  <time className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {entry.date}
                  </time>
                  <span
                    className="rounded-full border-2 border-border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest"
                    style={accentSurface(entry.accent)}
                  >
                    {entry.tag}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="display-sm flex items-start gap-2 text-foreground">
                    {entry.title}
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                    {entry.body}
                  </p>
                </div>
              </>
            );

            return entry.slug ? (
              <Link
                key={entry.title}
                to="/projects/$slug"
                params={{ slug: entry.slug }}
                className={rowClass}
              >
                {body}
              </Link>
            ) : (
              <Link key={entry.title} to="/about" className={rowClass}>
                {body}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
