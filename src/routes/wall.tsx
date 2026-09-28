import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { Brush, Clock, Star, X } from "lucide-react";
import { canonical } from "@/lib/site";
import { PageHero } from "@/components/kit";
import { listPaintings } from "@/lib/paint.functions";
import { ratingWord, type Painting } from "@/lib/paint";
import { useWindows } from "@/components/os/WindowManager";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * /wall — the paint wall
 * ============================================================================
 *
 * Everything anyone has drawn in the Paint app, with whatever rating I have
 * given it.
 *
 * The ratings carry a word as well as a number, for a reason worth keeping:
 * somebody drew this for fun, and "3/5" on a drawing reads as a grade. "3/5 —
 * genuinely good" reads as an opinion, which is what it is.
 */

const TITLE = "The paint wall — Srinivas M";
const DESCRIPTION =
  "Everything visitors have drawn in the Paint app on this site, with ratings. Open Paint, draw something, and it appears here.";

export const wallQuery = queryOptions({
  queryKey: ["paint-wall"],
  queryFn: () => listPaintings(),
});

export const Route = createFileRoute("/wall")({
  loader: ({ context }) => context.queryClient.ensureQueryData(wallQuery),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [canonical("/wall")],
  }),
  component: Wall,
});

type Sort = "newest" | "rated" | "featured";

function Stars({ rating, size = 3.5 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
          className={cn(
            n <= rating ? "fill-hog-yellow text-hog-yellow" : "text-muted-foreground/35",
          )}
        />
      ))}
    </span>
  );
}

function Wall() {
  const { data } = useQuery(wallQuery);
  const { open } = useWindows();
  const [sort, setSort] = useState<Sort>("newest");
  const [zoom, setZoom] = useState<Painting | null>(null);

  const paintings = data?.paintings ?? [];

  const shown = useMemo(() => {
    const list = [...paintings];
    if (sort === "rated") {
      // Unrated last rather than first: a sort called "best rated" that opens
      // with a wall of unrated drawings is not doing what it says.
      list.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    } else if (sort === "featured") {
      return list.filter((p) => p.featured);
    }
    return list;
  }, [paintings, sort]);

  const rated = paintings.filter((p) => p.rating !== null).length;

  return (
    <>
      <PageHero
        index="06"
        label="The paint wall"
        lines={["Everything", "anyone has", "drawn here."]}
        lede="There is a Paint app on this site. Whatever you make in it lands here, under your name, and I rate it whenever I next look. Nothing is curated on the way in."
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
          <span>
            <span className="font-bold text-foreground">{paintings.length}</span> paintings
          </span>
          <span>
            <span className="font-bold text-foreground">{rated}</span> rated
          </span>
          <button
            type="button"
            onClick={() => open("paint")}
            className="inline-flex items-center gap-1.5 rounded-full border border-hog-red/60 px-3 py-1 text-hog-red transition-colors hover:bg-hog-red/15"
          >
            <Brush className="h-3.5 w-3.5" />
            Open Paint
          </button>
        </div>
      </PageHero>

      <section
        data-act="noir"
        className="act-noir grain relative overflow-hidden border-t border-border"
      >
        <div
          aria-hidden
          className="hairline-grid pointer-events-none absolute inset-0 opacity-40"
        />

        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            {(
              [
                { id: "newest", label: "Newest" },
                { id: "rated", label: "Best rated" },
                { id: "featured", label: "Framed" },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSort(option.id)}
                aria-pressed={sort === option.id}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-all",
                  sort === option.id
                    ? "border-hog-red bg-hog-red/15 text-hog-red"
                    : "border-border text-muted-foreground hover:border-foreground/60 hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {data?.pending ? (
            <p className="mx-auto max-w-md text-center text-sm leading-relaxed text-muted-foreground">
              The wall is not open yet — the database migration that creates it still has to run.
              Paint works; saving will start the moment it does.
            </p>
          ) : shown.length === 0 ? (
            <div className="mx-auto max-w-md text-center">
              <p className="font-story text-lg text-foreground">
                {sort === "featured" ? "Nothing framed yet." : "Nobody has drawn anything yet."}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {sort === "featured"
                  ? "Framed means I liked it enough to pin it to the top."
                  : "Which makes this a very good moment to be first."}
              </p>
              <button
                type="button"
                onClick={() => open("paint")}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-foreground/10"
              >
                <Brush className="h-3.5 w-3.5" />
                Open Paint
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((painting, i) => (
                <figure
                  key={painting.id}
                  className={cn(
                    "beat-in group flex flex-col overflow-hidden rounded-md border bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:bg-card",
                    painting.featured
                      ? "border-hog-yellow/50 hover:border-hog-yellow"
                      : "border-border hover:border-foreground/40",
                  )}
                  style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => setZoom(painting)}
                    className="block bg-white"
                    aria-label={`View ${painting.title} full size`}
                  >
                    <img
                      src={painting.image}
                      alt={`${painting.title}, drawn by ${painting.artist_name}`}
                      loading="lazy"
                      width={painting.width || 1000}
                      height={painting.height || 620}
                      className="h-auto w-full"
                    />
                  </button>

                  <figcaption className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-[15px] font-bold text-foreground">
                          {painting.title}
                        </h2>
                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                          {painting.artist_name}
                        </p>
                      </div>
                      {painting.featured ? (
                        <span className="shrink-0 rounded-sm bg-hog-yellow/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-hog-yellow">
                          framed
                        </span>
                      ) : null}
                    </div>

                    {painting.rating !== null ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Stars rating={painting.rating} />
                        <span className="font-mono text-[11px] text-foreground">
                          {ratingWord(painting.rating)}
                        </span>
                      </div>
                    ) : (
                      <p className="font-mono text-[11px] text-muted-foreground">Not rated yet</p>
                    )}

                    {painting.rating_note ? (
                      <p className="border-l-2 border-hog-red/60 pl-2.5 text-[12.5px] italic leading-snug text-muted-foreground">
                        {painting.rating_note}
                      </p>
                    ) : null}

                    <p className="mt-auto flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(painting.created_at).toLocaleDateString()}
                      </span>
                      {painting.strokes > 0 ? <span>{painting.strokes} strokes</span> : null}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---- Lightbox ---- */}
      {zoom ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/92 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-white">{zoom.title}</p>
              <p className="truncate font-mono text-[11px] text-white/60">{zoom.artist_name}</p>
            </div>
            {zoom.rating !== null ? <Stars rating={zoom.rating} /> : null}
            <button
              type="button"
              onClick={() => setZoom(null)}
              aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid min-h-0 flex-1 place-items-center p-4">
            <img
              src={zoom.image}
              alt={`${zoom.title}, drawn by ${zoom.artist_name}`}
              className="max-h-full max-w-full rounded-md bg-white object-contain"
            />
          </div>
          {zoom.rating_note ? (
            <p className="px-5 pb-5 text-center text-sm italic text-white/70">
              &ldquo;{zoom.rating_note}&rdquo;
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
