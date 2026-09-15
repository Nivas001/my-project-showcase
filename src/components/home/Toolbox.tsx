import { skills } from "@/lib/site";
import { accentFor } from "@/lib/accents";
import { SectionLabel, SplitLines } from "@/components/kit";
import { Reveal } from "@/components/Reveal";

type Group = { group: string; items: string[] };

/**
 * The stack, laid out as one bordered slab divided into columns — PostHog's
 * "give your agents the tools they need" grid. Reads denser and more
 * confident than a scattering of pill badges.
 */
export function Toolbox({ groups }: { groups?: Group[] | undefined }) {
  const list = groups && groups.length > 0 ? groups : skills;

  return (
    <section data-act="hog" className="act-hog relative border-t-2 border-border/15">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <SectionLabel index="03">The stack</SectionLabel>
        </Reveal>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <SplitLines
            as="h2"
            onView
            lines={["Everything I reach", "for, in one place."]}
            className="hero-md max-w-2xl text-foreground"
          />
          <Reveal delay={100}>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Deep in the first two columns, comfortable in the rest. I'd rather say that plainly
              than claim all of it equally.
            </p>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <div className="hog-card mt-12 grid overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
            {list.map((group, gi) => {
              const accent = accentFor(gi);
              return (
                <div
                  key={group.group}
                  className="border-border/15 p-5 [&:not(:last-child)]:border-b-2 sm:[&:not(:last-child)]:border-b-0 sm:[&:nth-child(-n+2)]:border-b-2 sm:[&:nth-child(odd)]:border-r-2 lg:[&:nth-child(-n+2)]:border-b-0 lg:[&:nth-child(n)]:border-b-0 lg:[&:not(:last-child)]:border-r-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className="h-3 w-3 shrink-0 rounded-sm border-2 border-border"
                      style={{ background: `var(--${accent})` }}
                    />
                    <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
                      {group.group}
                    </h3>
                  </div>

                  <ul className="mt-4 space-y-1.5">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-baseline gap-2 text-[13px] leading-relaxed text-muted-foreground"
                      >
                        <span aria-hidden className="text-foreground/25">
                          ―
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
