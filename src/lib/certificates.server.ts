import { SCREENSHOT_BUCKET } from "@/lib/projects";
import type { Certificate } from "@/lib/certificates";

/** Certificate images live in the private bucket — sign them for public pages. */
export async function signCertificateImages<T extends Pick<Certificate, "images">>(
  rows: T[],
): Promise<T[]> {
  const paths = [...new Set(rows.flatMap((row) => row.images ?? []))].filter(
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
    images: (row.images ?? []).map((path) =>
      path.startsWith("http") ? path : (map.get(path) ?? path),
    ),
  }));
}
