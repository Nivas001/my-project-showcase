import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/lib/site";
import { STORY_INDEX } from "@/content/horror/manifest";

/**
 * /sitemap.xml
 *
 * The filename escapes the dot as `[.]` because TanStack Router reads `.` as a
 * path separator — `sitemap.xml.ts` would have served `/sitemap/xml`.
 *
 * Project URLs come from the database on every request rather than a build-time
 * list: projects are added through the admin panel, and a sitemap that only
 * refreshes on deploy would silently omit them.
 */

type Entry = { path: string; changefreq: string; priority: string };

/** Indexable routes. /auth, /admin, /surprise and the noindex pages are absent. */
const STATIC_ENTRIES: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/projects", changefreq: "weekly", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/fun", changefreq: "monthly", priority: "0.4" },
  { path: "/horror", changefreq: "monthly", priority: "0.4" },
];

function urlTag({ path, changefreq, priority }: Entry, lastmod: string) {
  return [
    "  <url>",
    `    <loc>${site.url}${path}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const lastmod = new Date().toISOString().slice(0, 10);

        const entries: Entry[] = [...STATIC_ENTRIES];

        // A database that is down must not take the sitemap with it — the
        // static routes are still worth serving.
        try {
          const { createPublicServerClient, selectAllProjects } =
            await import("@/lib/projects.server");
          const projects = await selectAllProjects(createPublicServerClient());
          for (const project of projects) {
            entries.push({
              path: `/projects/${encodeURIComponent(project.slug)}`,
              changefreq: "monthly",
              priority: project.featured ? "0.9" : "0.7",
            });
          }
        } catch {
          /* static entries only */
        }

        for (const story of STORY_INDEX) {
          entries.push({
            path: `/horror/${encodeURIComponent(story.slug)}`,
            changefreq: "yearly",
            priority: "0.3",
          });
        }

        const body = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...entries.map((entry) => urlTag(entry, lastmod)),
          "</urlset>",
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
