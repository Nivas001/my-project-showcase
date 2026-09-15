import type { Project } from "@/lib/projects";
import { site, skills, toAbsoluteUrl } from "@/lib/site";
import { accentFor } from "@/lib/accents";
import { Annotation, SectionLabel, SplitLines, StatusDot } from "@/components/kit";
import { Reveal, CountUp } from "@/components/Reveal";

type Group = { group: string; items: string[] };

/**
 * The hard numbers and the stack, as one spec sheet. A table signals "here are
 * the facts, check them" better than a row of tiles does.
 *
 * The stack slab used to be its own Toolbox section. Between the two, the stack
 * was listed three times on one page — here, in Toolbox, and again inside the
 * pillar cards — so the two sections became one and the table lost its
 * "Primary stack" / "Also fluent in" rows, which the slab below states in full.
 */
export function SpecSheet({
  projects,
  groups,
}: {
  projects: Project[];
  groups?: Group[] | undefined;
}) {
  const stack = groups && groups.length > 0 ? groups : skills;
  // A research demo on Hugging Face has a live URL but isn't a product in
  // production — counting it would contradict the copy everywhere else.
  const liveProducts = projects.filter(
    (p) => toAbsoluteUrl(p.live_url) && p.category !== "Research",
  ).length;
  const techCount = new Set(projects.flatMap((p) => p.tech)).size;

  const headline = [
    { value: String(liveProducts), label: "products in production", accent: "hog-red" },
    { value: String(projects.length), label: "projects shipped", accent: "hog-blue" },
    { value: "8.79", label: "MCA GPA / 10", accent: "hog-yellow" },
    { value: String(techCount), label: "technologies used", accent: "hog-green" },
  ];

  const rows: [string, React.ReactNode][] = [
    ["Based in", site.location],
    ["Working hours", "IST (UTC+5:30) — flexible for overlap"],
    ["Education", "MCA, Pondicherry University · 2023–2025"],
    ["Research", "Tamil abstractive summarisation with NER"],
    [
      "Status",
      <span key="status" className="inline-flex items-center gap-2">
        <StatusDot />
        Available for work
      </span>,
    ],
    ["Typical reply", "Within a day"],
  ];

  return (
    <section data-act="hog" className="act-hog relative border-t-2 border-border/15">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal>
          <SectionLabel index="04">By the numbers</SectionLabel>
        </Reveal>

        <SplitLines
          as="h2"
          onView
          lines={["The spec sheet."]}
          className="hero-md mt-6 text-foreground"
        />
        <Reveal delay={100}>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Every figure here is checkable on the pages behind it, and the stack below is the whole
            of it — deep in the first two columns, comfortable in the rest.
          </p>
        </Reveal>

        {/* Headline figures. */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {headline.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <div className="hog-card flex h-full flex-col justify-between overflow-hidden">
                <span
                  aria-hidden
                  className="h-1.5 w-full"
                  style={{ background: `var(--${stat.accent})` }}
                />
                <div className="p-5">
                  <div
                    className="font-display text-5xl font-bold leading-none tracking-tighter"
                    style={{ color: `var(--${stat.accent})` }}
                  >
                    <CountUp value={stat.value} />
                  </div>
                  <p className="mt-2.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* The detail table. */}
        <Reveal delay={120}>
          <div className="relative mt-6">
            <Annotation
              tone="hog-purple"
              rotate={4}
              className="absolute -top-8 right-2 hidden lg:block"
            >
              all verifiable ↓
            </Annotation>

            <div className="hog-card overflow-hidden">
              <table className="w-full text-left">
                <tbody>
                  {rows.map(([label, value], i) => (
                    <tr
                      key={label}
                      className={i < rows.length - 1 ? "border-b-2 border-border/15" : undefined}
                    >
                      <th
                        scope="row"
                        className="w-[38%] whitespace-nowrap bg-secondary px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground sm:w-[30%] sm:px-6"
                      >
                        {label}
                      </th>
                      <td className="px-4 py-3 text-sm text-foreground sm:px-6">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        {/* ---- The stack, in full ---- */}
        <Reveal delay={80}>
          <p className="micro mt-14 text-muted-foreground">Everything I reach for</p>
          <div className="hog-card mt-5 grid overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
            {stack.map((group, gi) => {
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
