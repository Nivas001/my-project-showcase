import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { uptimeQuery } from "@/lib/queries";
import { StatusDot } from "@/components/kit";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

/**
 * The proof strip.
 *
 * "Three live in production" is the claim the rest of the site rests on, and a
 * claim a visitor has no way to check is worth roughly nothing. This asks each
 * site the question in real time and prints the answer — response time, HTTP
 * status, last push to the repo.
 *
 * It reports a failure as readily as a success, which is the point: a badge
 * that can only ever be green is decoration, not evidence.
 *
 * Renders nothing until the check resolves. A skeleton here would be three
 * grey boxes claiming to be proof, which is worse than a beat of silence.
 */
export function LiveProof({ className }: { className?: string }) {
  const { data } = useQuery(uptimeQuery);

  if (!data || data.sites.length === 0) return null;

  return (
    <Reveal className={className ?? ""}>
      <div className="hog-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-border px-4 py-2.5">
          <span className="micro text-muted-foreground">Checked just now, from the server</span>
          <span className="micro text-muted-foreground">
            {new Date(data.checkedAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              timeZoneName: "short",
            })}
          </span>
        </div>

        <ul className="divide-y-2 divide-border">
          {data.sites.map((site) => (
            <li key={site.slug}>
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center gap-x-4 px-4 py-3 transition-colors hover:bg-secondary"
              >
                <StatusDot tone={site.up ? "hog-green" : "hog-red"} />

                {/* The title never yields: a row that truncates the product
                    name down to "T.." to make room for its URL has thrown away
                    the only part a reader needed. Everything to the right of it
                    is progressively dropped instead. */}
                <span className="min-w-[9rem] flex-1 basis-0 truncate text-[14px] font-semibold text-foreground">
                  {site.title}
                </span>

                <span className="hidden max-w-[16rem] shrink truncate font-mono text-[11px] text-muted-foreground sm:block">
                  {site.host}
                </span>

                <span
                  className={cn(
                    "shrink-0 font-mono text-[11px] font-bold tabular-nums",
                    site.up ? "text-hog-green" : "text-hog-red",
                  )}
                >
                  {site.up ? `${site.status} · ${site.ms}ms` : "unreachable"}
                </span>

                {site.lastPush ? (
                  <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground lg:block">
                    pushed {relativeDays(site.lastPush)}
                  </span>
                ) : null}

                <ArrowUpRight
                  aria-hidden
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

/** "3d ago" / "2mo ago". Precise enough to be evidence, short enough for a row. */
function relativeDays(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
