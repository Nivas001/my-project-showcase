import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { EASE } from "./fx";

type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
type Calendar = { total: Record<string, number>; contributions: Day[] };
type GhEvent = { type: string; repo: { name: string }; created_at: string };

const USER = site.github.split("/").filter(Boolean).pop() ?? "Nivas001";

/**
 * The receipts: a year of commits as a heat-map, with the most recent push
 * written out beside it. Everything is fetched live in the browser from public
 * endpoints, so it is never stale and costs the server nothing. If GitHub or
 * the calendar service is down the strip simply does not render.
 */
export function GitHubStrip() {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<Day | null>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const calendar = useQuery({
    queryKey: ["github", "calendar", USER],
    queryFn: async (): Promise<Calendar> => {
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`);
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const events = useQuery({
    queryKey: ["github", "events", USER],
    queryFn: async (): Promise<GhEvent[]> => {
      const res = await fetch(`https://api.github.com/users/${USER}/events/public?per_page=30`);
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const weeks = useMemo(() => {
    const days = calendar.data?.contributions ?? [];
    const out: (Day | null)[][] = [];
    let week: (Day | null)[] = [];
    // Pad the first week so rows are weekdays, Sunday at the top.
    const first = days[0] ? new Date(`${days[0].date}T00:00:00`).getDay() : 0;
    for (let i = 0; i < first; i++) week.push(null);
    for (const d of days) {
      week.push(d);
      if (week.length === 7) {
        out.push(week);
        week = [];
      }
    }
    if (week.length) out.push(week);
    return out;
  }, [calendar.data]);

  const stats = useMemo(() => {
    const days = calendar.data?.contributions ?? [];
    const total = calendar.data?.total?.["lastYear"] ?? days.reduce((n, d) => n + d.count, 0);
    let streak = 0;
    // Today may simply not have happened yet; start from yesterday if empty.
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i]!.count > 0) streak++;
      else if (i === days.length - 1) continue;
      else break;
    }
    const active = days.filter((d) => d.count > 0).length;
    return { total, streak, active };
  }, [calendar.data]);

  // Phones get the last five months, at a size a finger can read.
  const shownWeeks = narrow ? weeks.slice(-22) : weeks;

  const lastPush = events.data?.find((e) => e.type === "PushEvent");
  const repos = new Set(events.data?.map((e) => e.repo.name.split("/").pop()) ?? []);

  if (calendar.isError) return null;

  return (
    <div className="mt-20 sm:mt-28">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          <Stat
            label="Contributions, last 12 months"
            value={calendar.data ? stats.total.toLocaleString() : "—"}
          />
          <Stat label="Days with commits" value={calendar.data ? String(stats.active) : "—"} />
          <Stat label="Current streak" value={calendar.data ? `${stats.streak}d` : "—"} />
        </dl>
        <a
          href={site.github}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          github.com/{USER}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>

      <div className="relative mt-8">
        {calendar.data ? (
          <motion.div
            className="grid w-full gap-[2px] sm:gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${shownWeeks.length}, minmax(0, 1fr))` }}
            initial="out"
            whileInView="in"
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            onMouseLeave={() => setHover(null)}
            role="img"
            aria-label={`${stats.total} GitHub contributions in the last year`}
          >
            {shownWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px] sm:gap-[3px]">
                {week.map((day, di) => (
                  <motion.span
                    key={di}
                    onMouseEnter={() => day && setHover(day)}
                    variants={
                      reduced
                        ? {}
                        : {
                            out: { opacity: 0, scale: 0.4 },
                            in: {
                              opacity: 1,
                              scale: 1,
                              transition: {
                                duration: 0.5,
                                ease: EASE,
                                delay: 0.2 + wi * 0.016 + di * 0.012,
                              },
                            },
                          }
                    }
                    className={`block aspect-square w-full rounded-[2px] sm:rounded-[3px] ${day ? LEVEL[day.level] : "bg-transparent"} ${
                      day && hover?.date === day.date ? "ring-1 ring-foreground" : ""
                    }`}
                  />
                ))}
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="h-[95px] w-full animate-pulse rounded-lg bg-secondary/60" />
        )}
      </div>

      <div className="mt-4 flex min-h-[1.5rem] flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-muted-foreground">
        <span>
          {hover
            ? `${hover.count} contribution${hover.count === 1 ? "" : "s"} · ${formatDay(hover.date)}`
            : lastPush
              ? `Last push ${ago(lastPush.created_at)} · ${lastPush.repo.name.split("/").pop()}`
              : " "}
        </span>
        {repos.size > 0 ? (
          <span className="hidden sm:inline">Recently in {[...repos].slice(0, 3).join(", ")}</span>
        ) : null}
        <span className="flex items-center gap-1.5">
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={`h-[9px] w-[9px] rounded-[2px] ${LEVEL[l as Day["level"]]}`} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}

const LEVEL: Record<Day["level"], string> = {
  0: "bg-border/70",
  1: "bg-accent/30",
  2: "bg-accent/55",
  3: "bg-accent/80",
  4: "bg-accent",
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-[1.9rem] font-medium tabular-nums tracking-[-0.03em] text-foreground">
        {value}
      </dd>
    </div>
  );
}

function formatDay(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ago(iso: string) {
  const s = Math.max(1, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}
