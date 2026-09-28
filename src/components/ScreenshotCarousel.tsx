import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Shot } from "@/components/Shot";
import { labelOf, ratioOf } from "@/content/project-media";

type Props = {
  images: string[];
  title: string;
};

/**
 * One screen at a time, in a frame cut to that screenshot's own proportions —
 * so a 16:10 capture and a wide 2:1 capture both fill it edge to edge with
 * nothing cropped and no letterboxing. The frame eases between shapes as you
 * move through them. A strip of thumbnails underneath jumps straight to any.
 *
 * Sizes come from content/project-media.ts where known, and from the image
 * itself once it loads otherwise.
 */
export function ScreenshotCarousel({ images, title }: Props) {
  const [index, setIndex] = useState(0);
  const [measured, setMeasured] = useState<Record<string, number>>({});
  const touchStart = useRef<number | null>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const count = images.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable]")) return;
      if (event.key === "ArrowLeft") go(index - 1);
      if (event.key === "ArrowRight") go(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    const strip = thumbs.current;
    const active = strip?.children[index] as HTMLElement | undefined;
    if (strip && active) {
      strip.scrollTo({
        left: active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2,
        behavior: "smooth",
      });
    }
  }, [index]);

  if (count === 0) return null;

  const ratio = (src: string) => ratioOf(src) ?? measured[src] ?? 16 / 10;
  const current = images[index]!;
  const caption = labelOf(current);

  return (
    <div className="w-full">
      <div
        className="group relative overflow-hidden rounded-2xl border border-border bg-secondary/40 transition-[aspect-ratio] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ aspectRatio: String(ratio(current)) }}
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          const end = event.changedTouches[0]?.clientX ?? null;
          if (start === null || end === null) return;
          const delta = start - end;
          if (Math.abs(delta) > 40) go(index + (delta > 0 ? 1 : -1));
          touchStart.current = null;
        }}
      >
        {images.map((src, i) => (
          <div
            key={src}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              i === index ? "scale-100 opacity-100" : "pointer-events-none scale-[0.985] opacity-0"
            }`}
          >
            {/* Only the current slide and its neighbours are fetched. */}
            {Math.abs(i - index) <= 1 || (index === 0 && i === count - 1) ? (
              <MeasuredShot
                src={src}
                alt={labelOf(src) ? `${title} — ${labelOf(src)}` : `${title} screenshot ${i + 1}`}
                eager={i === 0}
                onRatio={(r) => setMeasured((m) => (m[src] ? m : { ...m, [src]: r }))}
              />
            ) : null}
          </div>
        ))}

        {count > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous screenshot"
              onClick={() => go(index - 1)}
              className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/85 text-foreground opacity-0 transition-opacity duration-300 hover:text-accent group-hover:opacity-100 focus-visible:opacity-100 sm:left-3 sm:h-10 sm:w-10 max-sm:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next screenshot"
              onClick={() => go(index + 1)}
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/85 text-foreground opacity-0 transition-opacity duration-300 hover:text-accent group-hover:opacity-100 focus-visible:opacity-100 sm:right-3 sm:h-10 sm:w-10 max-sm:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 text-[13px]">
        <p className="min-w-0 truncate">
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          {caption ? <span className="ml-3 text-foreground">{caption}</span> : null}
        </p>
        <a
          href={current}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 font-mono text-[11px] text-muted-foreground transition-colors hover:text-accent"
        >
          open full size ↗
        </a>
      </div>

      {count > 1 ? (
        <div ref={thumbs} className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${labelOf(src) ?? `screenshot ${i + 1}`}`}
              aria-current={i === index}
              className={`relative h-14 shrink-0 overflow-hidden rounded-md border transition-[opacity,border-color] duration-300 sm:h-16 ${
                i === index
                  ? "border-accent opacity-100"
                  : "border-border opacity-55 hover:opacity-100"
              }`}
              style={{ aspectRatio: String(ratio(src)) }}
            >
              <Shot src={src} alt="" label="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MeasuredShot({
  src,
  alt,
  eager,
  onRatio,
}: {
  src: string;
  alt: string;
  eager: boolean;
  onRatio: (ratio: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const img = ref.current?.querySelector("img");
    if (!img) return;
    const report = () => {
      if (img.naturalWidth && img.naturalHeight) onRatio(img.naturalWidth / img.naturalHeight);
    };
    if (img.complete) report();
    img.addEventListener("load", report);
    return () => img.removeEventListener("load", report);
  }, [src, onRatio]);
  return (
    <div ref={ref} className="h-full w-full">
      <Shot src={src} alt={alt} loading={eager ? "eager" : "lazy"} label="screenshot missing" />
    </div>
  );
}
