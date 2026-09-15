import type { Project } from "@/lib/projects";
import { site, toAbsoluteUrl } from "@/lib/site";
import { Annotation, SectionLabel, SplitLines, StatusDot } from "@/components/kit";
import { Reveal, CountUp } from "@/components/Reveal";

/**
 * The hard numbers, as a spec sheet. PostHog leans on tables for exactly this
 * — it signals "here are the facts, check them" better than a row of tiles.
 */
export function SpecSheet({ projects }: { projects: Project[] }) {
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
    ["Primary stack", "TypeScript · React · TanStack Start · PostgreSQL"],
    ["Also fluent in", "Python · Flutter · Node.js · Supabase · Firebase"],
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
          className="display-md mt-6 text-foreground"
        />

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
      </div>
    </section>
  );
}
