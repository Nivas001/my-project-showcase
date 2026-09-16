import { createServerFn } from "@tanstack/react-start";

/**
 * Live-site health, checked from the server.
 *
 * "Three products live in production" is the load-bearing claim on the whole
 * site, and until now it was a sentence. This makes it checkable: each site
 * named on the homepage is actually requested, and the strip reports what came
 * back — including when the answer is "down", which is the only reason the
 * green version means anything.
 *
 * Server-side because the browser cannot read a cross-origin response status:
 * a client-side fetch to anibakes.app is opaque at best and blocked at worst.
 */

export type SiteStatus = {
  slug: string;
  title: string;
  /** What the strip prints: host, plus a trailing path segment when there is one. */
  host: string;
  /** Where the row links. Kept separate from `host`, which is a label, not a URL. */
  url: string;
  /** null when the request never completed (timeout, DNS, refused connection). */
  status: number | null;
  /** Round-trip in milliseconds. */
  ms: number;
  up: boolean;
  /** Last push to the project's public GitHub repo, ISO date. Null when there isn't one. */
  lastPush: string | null;
};

export type UptimeReport = {
  sites: SiteStatus[];
  /** When this report was produced, ISO. The strip prints it so a stale cache is visible. */
  checkedAt: string;
};

const TIMEOUT_MS = 6_000;
const CACHE_MS = 5 * 60 * 1000;

/**
 * Module-scope cache. On a warm serverless instance this keeps a page refresh
 * from re-pinging three origins; on a cold one it simply starts empty, which
 * is correct rather than merely acceptable.
 */
let cache: { at: number; report: UptimeReport } | null = null;

/**
 * What the strip prints for a site.
 *
 * Host alone is right for a product on its own domain, and useless for one
 * living at a path — "huggingface.co" says nothing about which Space it is —
 * so a path is kept, trimmed to its last segment.
 */
function labelOf(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.host.replace(/^www\./, "");
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return host;
    return `${host}/${segments[segments.length - 1]}`;
  } catch {
    return url;
  }
}

async function ping(url: string): Promise<{ status: number | null; ms: number }> {
  const started = Date.now();
  try {
    // GET, not HEAD: enough hosts answer HEAD with 405 that a HEAD-based
    // checker reports healthy sites as broken. `redirect: follow` is the
    // default and is what a visitor would experience anyway.
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "nivas.tech-uptime/1.0" },
    });
    // Drain so the connection can be reused rather than left hanging.
    await response.body?.cancel();
    return { status: response.status, ms: Date.now() - started };
  } catch {
    return { status: null, ms: Date.now() - started };
  }
}

/** Last push date for a public repo, or null for anything that isn't one. */
async function lastPush(githubUrl: string | null): Promise<string | null> {
  if (!githubUrl) return null;
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (!match) return null;
  const repo = `${match[1]}/${match[2]!.replace(/\.git$/, "")}`;

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "nivas.tech-uptime/1.0",
      },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { pushed_at?: string };
    return body.pushed_at ?? null;
  } catch {
    return null;
  }
}

export const getUptime = createServerFn({ method: "GET" }).handler(
  async (): Promise<UptimeReport> => {
    if (cache && Date.now() - cache.at < CACHE_MS) return cache.report;

    const { createPublicServerClient, selectAllProjects } = await import("@/lib/projects.server");
    const { toAbsoluteUrl, shortTitle } = await import("@/lib/site");

    let live: { slug: string; title: string; url: string; github: string | null }[] = [];
    try {
      const projects = await selectAllProjects(createPublicServerClient());
      live = projects.flatMap((project) => {
        const url = toAbsoluteUrl(project.live_url);
        if (!url) return [];
        return [
          {
            slug: project.slug,
            title: shortTitle(project.title),
            url,
            github: project.github_visibility === "public" ? project.github_url : null,
          },
        ];
      });
    } catch {
      return { sites: [], checkedAt: new Date().toISOString() };
    }

    const sites = await Promise.all(
      live.map(async (site): Promise<SiteStatus> => {
        const [{ status, ms }, pushed] = await Promise.all([ping(site.url), lastPush(site.github)]);
        return {
          slug: site.slug,
          title: site.title,
          host: labelOf(site.url),
          url: site.url,
          status,
          ms,
          up: status !== null && status < 400,
          lastPush: pushed,
        };
      }),
    );

    const report = { sites, checkedAt: new Date().toISOString() };
    cache = { at: Date.now(), report };
    return report;
  },
);
