import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/site";
import { useEffect, useState } from "react";
import { Clock, Eye, GitBranch, Skull, Volume2 } from "lucide-react";
import { STORIES } from "@/content/horror";
import { readProgress, type Progress } from "@/lib/horror/progress";
import { PageHero } from "@/components/kit";

const TITLE = "The Dark Room — Interactive horror by Srinivas M";
const DESCRIPTION =
  "Ten branching horror stories with synthesised sound, multiple endings, and choices that time out. Read in the dark. Headphones recommended.";

export const Route = createFileRoute("/horror/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
    ],
    links: [canonical("/horror")],
  }),
  component: HorrorLibrary,
});

function HorrorLibrary() {
  // Progress lives in localStorage, so it can only be read after mount.
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  const totalEndings = STORIES.reduce((sum, story) => sum + story.endings, 0);
  const foundEndings = Object.values(progress).reduce(
    (sum, entry) => sum + (entry?.endings.length ?? 0),
    0,
  );

  return (
    <>
      <PageHero
        index="01"
        label="The dark room"
        lines={["Ten stories.", "None of them", "end well."]}
        lede="Every one branches, times you out if you hesitate, and finishes more than one way. Sound is synthesised live in your browser. Headphones on, lights off."
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
          <span>
            <span className="font-bold text-foreground">{STORIES.length}</span> stories
          </span>
          <span>
            <span className="font-bold text-foreground">{totalEndings}</span> endings
          </span>
          {foundEndings > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-hog-red">
              <Eye className="h-3.5 w-3.5" />
              {foundEndings} found
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5" />
            Audio starts only when you press Enter inside a story
          </span>
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

        <div className="relative mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-4 sm:grid-cols-2">
            {STORIES.map((story, i) => {
              const found = progress[story.slug]?.endings.length ?? 0;
              return (
                <Link
                  key={story.slug}
                  to="/horror/$slug"
                  params={{ slug: story.slug }}
                  className="beat-in group relative overflow-hidden rounded-md border border-border bg-card/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-hog-red hover:bg-card"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="display-sm text-foreground transition-colors group-hover:text-hog-red">
                      {story.title}
                    </h2>
                    <span
                      className="shrink-0 font-mono text-[10px] tracking-widest text-muted-foreground"
                      title={`Fear level ${story.fear} of 5`}
                    >
                      {"▮".repeat(story.fear)}
                      {"▯".repeat(5 - story.fear)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story.hook}</p>

                  <div className="mt-5 flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {story.minutes}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <GitBranch className="h-3.5 w-3.5" />
                      {story.endings} endings
                    </span>
                    {found > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-hog-red">
                        <Eye className="h-3.5 w-3.5" />
                        {found} found
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {story.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Skull
                    aria-hidden
                    className="pointer-events-none absolute -bottom-6 -right-4 h-24 w-24 opacity-[0.04] transition-opacity duration-500 group-hover:opacity-[0.12]"
                  />
                </Link>
              );
            })}
          </div>

          <p className="mt-16 text-center font-mono text-[11px] text-muted-foreground">
            All stories are fiction. None of them are about you. Probably.
          </p>
        </div>
      </section>
    </>
  );
}
