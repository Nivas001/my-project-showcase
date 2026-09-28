import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { projectsQuery } from "@/lib/queries";
import { shortTitle } from "@/lib/site";

/**
 * ============================================================================
 * PHOTOS
 * ============================================================================
 *
 * The screenshots already stored against every project, shown as a library
 * rather than buried one case study at a time.
 *
 * It reads the same query the rest of the site does, so opening this window
 * costs one cache hit and no extra network. Thumbnails are the full images
 * scaled down by the browser — the stored screenshots are the only copies
 * there are, and generating a second size at runtime would mean shipping an
 * image pipeline to do it.
 */

type Shot = { src: string; project: string; slug: string };

export function Photos() {
  const { data: projects, isLoading } = useQuery(projectsQuery);
  const [index, setIndex] = useState<number | null>(null);
  const [broken, setBroken] = useState<Set<string>>(new Set());

  const shots = useMemo<Shot[]>(() => {
    if (!projects) return [];
    return projects.flatMap((project) =>
      (project.screenshots ?? []).map((src) => ({
        src,
        project: shortTitle(project.title),
        slug: project.slug,
      })),
    );
  }, [projects]);

  const usable = shots.filter((s) => !broken.has(s.src));
  const open = index === null ? null : usable[index];

  const step = (delta: number) => {
    if (index === null || usable.length === 0) return;
    setIndex((index + delta + usable.length) % usable.length);
  };

  if (isLoading) {
    return (
      <div className="grid h-full place-items-center bg-background">
        <span className="micro animate-pulse text-muted-foreground">Loading the library…</span>
      </div>
    );
  }

  if (usable.length === 0) {
    return (
      <div className="grid h-full place-items-center gap-2 bg-background p-6 text-center">
        <ImageOff className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="text-[13px] text-muted-foreground">
          No screenshots stored yet. They show up here the moment a project has some.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0 bg-background">
      <div className="grid h-full grid-cols-3 gap-1.5 overflow-y-auto p-2 sm:grid-cols-4">
        {usable.map((shot, i) => (
          <button
            key={`${shot.slug}-${shot.src}`}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-[var(--os-radius-ctl)] bg-foreground/8"
          >
            <img
              src={shot.src}
              alt={`${shot.project} screenshot`}
              loading="lazy"
              onError={() => setBroken((b) => new Set(b).add(shot.src))}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/75 to-transparent px-1.5 pb-1 pt-4 text-left text-[10.5px] font-medium text-white">
              {shot.project}
            </span>
          </button>
        ))}
      </div>

      {/* ---- Lightbox ---- */}
      {open ? (
        <div className="absolute inset-0 z-10 flex flex-col bg-black/92 backdrop-blur-sm">
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white">
              {open.project}
            </span>
            <span className="font-mono text-[11px] tabular-nums text-white/60">
              {index! + 1} / {usable.length}
            </span>
            <button
              type="button"
              onClick={() => setIndex(null)}
              aria-label="Close preview"
              className="rounded-[var(--os-radius-ctl)] px-2 py-1 text-[13px] text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="relative grid min-h-0 flex-1 place-items-center p-3">
            <img
              src={open.src}
              alt={`${open.project} screenshot, full size`}
              className="max-h-full max-w-full rounded-[var(--os-radius-ctl)] object-contain"
            />
            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => step(dir === "prev" ? -1 : 1)}
                aria-label={dir === "prev" ? "Previous" : "Next"}
                className={cn(
                  "absolute top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/25",
                  dir === "prev" ? "left-3" : "right-3",
                )}
              >
                {dir === "prev" ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
