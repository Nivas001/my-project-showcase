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
 * Screenshots are stored as object paths in a private bucket. Turn them into
 * temporary readable URLs so public pages can display them.
 */
export async function signScreenshots<T extends Pick<Project, "screenshots">>(
  rows: T[],
): Promise<T[]> {
  const paths = [...new Set(rows.flatMap((row) => row.screenshots ?? []))].filter(
    (path) => path && !path.startsWith("http"),
  );
  if (paths.length === 0) return rows;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage
    .from(SCREENSHOT_BUCKET)
    .createSignedUrls(paths, 60 * 60 * 6);

  const map = new Map<string, string>();
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
  }

  return rows.map((row) => ({
    ...row,
    screenshots: (row.screenshots ?? []).map((path) =>
      path.startsWith("http") ? path : (map.get(path) ?? path),
    ),
  }));
}
