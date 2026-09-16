import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  normaliseDecisions,
  normaliseDownloads,
  PROJECT_COLUMNS,
  PROJECT_COLUMNS_LEGACY,
  type Project,
  type SignedProject,
} from "@/lib/projects";

function isOpaqueKey(value: string) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

export function createPublicServerClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (isOpaqueKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/**
 * Read every project row, newest schema first.
 *
 * `decisions` arrives with a migration the deploy may not have run yet, and
 * PostgREST answers an unknown column with 42703 rather than a null, which
 * would take the whole site down. One retry on the pre-migration column list
 * keeps the pages serving with an empty decision log instead.
 */
export async function selectAllProjects(
  supabase: ReturnType<typeof createPublicServerClient>,
): Promise<Project[]> {
  const query = (columns: string) =>
    supabase.from("projects").select(columns).order("sort_order", { ascending: true });

  const { data, error } = await query(PROJECT_COLUMNS);
  if (!error) return (data ?? []) as unknown as Project[];
  if (error.code !== "42703") throw new Error(error.message);

  const legacy = await query(PROJECT_COLUMNS_LEGACY);
  if (legacy.error) throw new Error(legacy.error.message);
  return (legacy.data ?? []) as unknown as Project[];
}

/**
 * Screenshots, design pages and documentation files are stored as object paths
 * in the `project-screenshots` bucket. Turn them into URLs a browser can load,
 * while keeping the raw paths for the admin editor.
 *
 * See storage.server.ts for why these are public URLs rather than signed ones.
 */
export async function signScreenshots(rows: Project[]): Promise<SignedProject[]> {
  const { resolveStorageUrls } = await import("@/lib/storage.server");

  const map = await resolveStorageUrls([
    ...rows.flatMap((row) => row.screenshots ?? []),
    ...rows.flatMap((row) => row.designs ?? []),
    ...rows.map((row) => row.doc_path ?? ""),
    ...rows.map((row) => row.slides_path ?? ""),
  ]);

  const resolve = (path: string) => map.get(path) ?? path;

  // Real file extension in the path — Office Online / Google viewers reject
  // query-string-only URLs when embedding .pptx decks.
  const proxy = (row: Project, kind: "doc" | "slides", path: string) => {
    const ext = (path.split(".").pop() ?? "pdf").toLowerCase();
    return `/api/public/project-file/${encodeURIComponent(row.slug)}/${kind}/${kind === "slides" ? "deck" : "documentation"}.${ext}`;
  };

  return rows.map((row) => ({
    ...row,
    screenshot_paths: row.screenshots ?? [],
    design_paths: row.designs ?? [],
    screenshots: (row.screenshots ?? []).map(resolve),
    designs: (row.designs ?? []).map(resolve),
    downloads: normaliseDownloads(row.downloads),
    decisions: normaliseDecisions(row.decisions),
    // Served through a proxy so the file renders inline; ext lets the viewer
    // pick a PDF reader or a slide-deck embed.
    doc_signed_url: row.doc_path ? proxy(row, "doc", row.doc_path) : null,
    slides_signed_url: row.slides_path ? proxy(row, "slides", row.slides_path) : null,
  }));
}
