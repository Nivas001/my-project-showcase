import type { Certificate } from "@/lib/certificates";

/**
 * Certificate images live in the same bucket as project screenshots.
 * See storage.server.ts for why these resolve to public URLs.
 */
export async function signCertificateImages<T extends Pick<Certificate, "images">>(
  rows: T[],
): Promise<(T & { image_paths: string[] })[]> {
  const { resolveStorageUrls } = await import("@/lib/storage.server");
  const map = await resolveStorageUrls(rows.flatMap((row) => row.images ?? []));

  return rows.map((row) => ({
    ...row,
    image_paths: row.images ?? [],
    images: (row.images ?? []).map((path) => map.get(path) ?? path),
  }));
}
