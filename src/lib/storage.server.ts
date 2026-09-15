import { SCREENSHOT_BUCKET } from "@/lib/projects";

/**
 * Turning stored object paths into URLs a browser can actually load.
 *
 * `project-screenshots` is a PUBLIC bucket, so the honest answer is a plain
 * public object URL. That matters for three reasons the old signed-URL path
 * got wrong:
 *
 *   1. Signing needs the service-role key. When it is absent the previous code
 *      swallowed the error and handed the page raw paths like
 *      `anibakes/home.png`, which the browser resolved against the site origin
 *      and rendered as broken images. Every screenshot on the site died the
 *      moment that one env var went missing.
 *   2. Signed URLs expire. A six-hour token inside `og:image` means social
 *      previews rot by lunchtime.
 *   3. Signing is a network round trip on every render of every public page.
 *
 * If the bucket is ever flipped to private, set SUPABASE_STORAGE_PRIVATE=true
 * and these helpers fall back to signing — with the public URL still used for
 * anything that could not be signed, so a missing key degrades to "maybe 404"
 * rather than "definitely broken".
 */

function baseUrl(): string {
  return (process.env["SUPABASE_URL"] ?? "").replace(/\/$/, "");
}

function usePrivateBucket(): boolean {
  return process.env["SUPABASE_STORAGE_PRIVATE"] === "true";
}

/** Already a URL, or an object path we have to resolve? */
export function isRemote(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

export function publicStorageUrl(path: string, bucket = SCREENSHOT_BUCKET): string {
  if (!path) return path;
  if (isRemote(path)) return path;
  const base = baseUrl();
  if (!base) return path;
  // Encode each segment separately: the slashes in `anibakes/home.png` are
  // real path separators, but the filenames themselves may contain spaces.
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}

/**
 * Resolve many object paths at once. Returns a path -> URL map covering every
 * input that is not already an absolute URL.
 */
export async function resolveStorageUrls(
  paths: readonly string[],
  bucket = SCREENSHOT_BUCKET,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const pending = [...new Set(paths)].filter((path) => path && !isRemote(path));
  if (pending.length === 0) return map;

  for (const path of pending) map.set(path, publicStorageUrl(path, bucket));

  if (!usePrivateBucket()) return map;

  // Private bucket: upgrade whatever we can to a signed URL, leave the rest.
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrls(pending, 60 * 60 * 6);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
    }
  } catch (error) {
    console.error("[storage] could not sign URLs, using public URLs instead:", error);
  }

  return map;
}
