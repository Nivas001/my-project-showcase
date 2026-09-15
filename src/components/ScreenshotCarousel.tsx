import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Shot } from "@/components/Shot";

type Props = {
  images: string[];
  title: string;
};

export function ScreenshotCarousel({ images, title }: Props) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") go(index - 1);
      if (event.key === "ArrowRight") go(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  if (count === 0) return null;

  return (
    <div className="w-full">
      <div
        className="group relative overflow-hidden rounded-md border border-border bg-surface-raised"
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
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <div key={src} className="w-full shrink-0 grow-0 basis-full">
              <div className="flex aspect-[16/10] items-center justify-center overflow-hidden sm:aspect-[16/9]">
                <Shot
                  src={src}
                  alt={`${title} screenshot ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  label="screenshot missing"
                  imgClassName={`object-contain transition-all duration-700 ${
                    i === index ? "scale-100 opacity-100" : "scale-95 opacity-0"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous screenshot"
              onClick={() => go(index - 1)}
              className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-colors hover:border-primary hover:text-accent sm:left-3 sm:h-10 sm:w-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next screenshot"
              onClick={() => go(index + 1)}
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-colors hover:border-primary hover:text-accent sm:right-3 sm:h-10 sm:w-10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 backdrop-blur">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`Go to screenshot ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index
                      ? "w-5 bg-accent"
                      : "w-1.5 bg-muted-foreground/50 hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
        <a href={images[index]} target="_blank" rel="noreferrer" className="hover:text-accent">
          open full size ↗
        </a>
      </div>
    </div>
  );
}
