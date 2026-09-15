import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A screenshot that fails politely.
 *
 * Project media lives in Supabase storage, and a row can outlive its file —
 * a bucket rebuilt, a project migrated, an upload that never finished. A bare
 * <img> answers that with the browser's broken-image glyph and a line of alt
 * text, which looks like the site is broken rather than the file being absent.
 *
 * This renders the same placeholder the no-screenshot case already uses, so a
 * missing file is indistinguishable from "nothing uploaded yet" — which, from
 * the visitor's side, is exactly what it is.
 */
export function Shot({
  src,
  alt,
  className,
  imgClassName,
  accent = "hog-red",
  label = "no preview yet",
  loading = "lazy",
}: {
  src: string | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  accent?: string;
  label?: string;
  loading?: "lazy" | "eager";
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The markup is server-rendered, so an image can finish failing before React
  // hydrates and attaches onError — the event is gone by the time anyone is
  // listening. A finished image with no intrinsic width is a failed one.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-1.5 bg-secondary font-mono text-xs text-muted-foreground",
          className,
        )}
      >
        <span aria-hidden className="text-2xl opacity-40" style={{ color: `var(--${accent})` }}>
          {"</>"}
        </span>
        {label}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
      className={cn("h-full w-full object-cover object-top", imgClassName, className)}
    />
  );
}
