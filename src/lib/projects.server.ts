import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SCREENSHOT_BUCKET, type Project } from "@/lib/projects";

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
 * Screenshots, design pages and documentation files are stored as object paths
 * in a private bucket. Turn them into temporary readable URLs so public pages
 * can display them, while keeping the raw paths for the admin editor.
 */
export async function signScreenshots(rows: Project[]): Promise<SignedProject[]> {
  const paths = [
    ...new Set([
      ...rows.flatMap((row) => row.screenshots ?? []),
      ...rows.flatMap((row) => row.designs ?? []),
      ...rows.map((row) => row.doc_path ?? ""),
    ]),
  ].filter((path) => path && !path.startsWith("http"));

  const map = new Map<string, string>();
  if (paths.length > 0) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.storage
      .from(SCREENSHOT_BUCKET)
      .createSignedUrls(paths, 60 * 60 * 6);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
    }
  }

  const sign = (path: string) => (path.startsWith("http") ? path : (map.get(path) ?? path));

  return rows.map((row) => ({
    ...row,
    screenshot_paths: row.screenshots ?? [],
    design_paths: row.designs ?? [],
    screenshots: (row.screenshots ?? []).map(sign),
    designs: (row.designs ?? []).map(sign),
    doc_signed_url: row.doc_path ? sign(row.doc_path) : null,
  }));
}

