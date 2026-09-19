import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/site";
import { useEffect, useMemo, useState } from "react";
import { Clock, Eye, GitBranch, Headphones, Skull, Video, BookOpen } from "lucide-react";
/* Metadata only. The library page lists sixteen stories; it does not need a
   single line of any of them. See content/horror/manifest.ts. */
import { STORY_INDEX, TOTAL_ENDINGS, type StoryMeta } from "@/content/horror/manifest";
import { readProgress, type Progress } from "@/lib/horror/progress";
import { PageHero } from "@/components/kit";

const TITLE = "The Dark Room — Interactive horror by Srinivas M";
const DESCRIPTION =
  "Sixteen branching horror stories with live-synthesised sound, timed choices and multiple endings — including found-footage tapes rendered in the browser and stories written in Tanglish. Read in the dark. Headphones recommended.";

export const Route = createFileRoute("/horror/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [canonical("/horror")],
  }),
  component: HorrorLibrary,
});

type Filter = "all" | "read" | "tape" | "english" | "tanglish";

const FILTERS: { id: Filter; label: string; hint: string }[] = [
  { id: "all", label: "Everything", hint: "All sixteen" },
  { id: "tape", label: "Tapes", hint: "Found footage, rendered live" },
  { id: "read", label: "Read", hint: "Prose on a black page" },
  { id: "english", label: "English", hint: "" },
  { id: "tanglish", label: "Tanglish", hint: "Tamil-English, as it's spoken" },
];

function matches(story: StoryMeta, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "read" || filter === "tape") return story.kind === filter;
  return story.lang === filter;
}

function HorrorLibrary() {
  // Progress lives in localStorage, so it can only be read after mount.
  const [progress, setProgress] = useState<Progress>({});
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  /* The library renders from `manifest.ts`, which is a hand-kept copy of every
     story's metadata. Two lists can drift, so in development the real stories
     are pulled in and compared. Vite strips this branch from the production
     build, so the check costs nothing a visitor pays for. */
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    void import("@/content/horror").then(({ checkManifest }) => {
      const problems = checkManifest(STORY_INDEX);
      if (problems.length > 0) {
        console.warn(["[horror] manifest.ts is out of date:", ...problems].join("\n"));
      }
    });
  }, []);

  const foundEndings = Object.values(progress).reduce(
    (sum, entry) => sum + (entry?.endings.length ?? 0),
    0,
  );

  const shown = useMemo(() => STORY_INDEX.filter((s) => matches(s, filter)), [filter]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map((f) => [f.id, STORY_INDEX.filter((s) => matches(s, f.id)).length]),
      ) as Record<Filter, number>,
    [],
  );

  return (
    <>
      <PageHero
        index="01"
        label="The dark room"
        lines={["Sixteen stories.", "None of them", "end well."]}
        lede="Every one branches, times you out if you hesitate, and finishes more than one way. Two of them are tapes — found footage generated in your browser, frame by frame. Two are in Tanglish. Every sound is synthesised live; there is not a single audio file on this page."
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
          <span>
            <span className="font-bold text-foreground">{STORY_INDEX.length}</span> stories
          </span>
          <span>
            <span className="font-bold text-foreground">{TOTAL_ENDINGS}</span> endings
          </span>
          {foundEndings > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-hog-red">
              <Eye className="h-3.5 w-3.5" />
              {foundEndings} found
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Headphones className="h-3.5 w-3.5" />
            Headphones. Lights off. Sound starts only when you press Enter.
          </span>
        </div>
      </PageHero>

      <section
        data-act="noir"
        className="act-noir grain relative overflow-hidden border-t border-border"
      >
        <div aria-hidden className="hairline-grid pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
          {/* ---- Filters ---- */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
            {FILTERS.map((f) => {
              const on = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  aria-pressed={on}
                  title={f.hint}
                  className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-all ${
                    on
                      ? "border-hog-red bg-hog-red/15 text-hog-red"
                      : "border-border text-muted-foreground hover:border-foreground/60 hover:text-foreground"
                  }`}
                >
                  {f.label}
                  <span className="ml-1.5 opacity-50">{counts[f.id]}</span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {shown.map((story, i) => {
              const found = progress[story.slug]?.endings.length ?? 0;
              const complete = found >= story.endings;
              const { kind, lang } = story;

              return (
                <Link
                  key={story.slug}
                  to="/horror/$slug"
                  params={{ slug: story.slug }}
                  className={`beat-in group relative flex flex-col overflow-hidden rounded-md border bg-card/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-card ${
                    kind === "tape"
                      ? "border-hog-purple/40 hover:border-hog-purple"
                      : "border-border hover:border-hog-red"
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {/* Format + language tags, top line. */}
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
                    {kind === "tape" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-sm bg-hog-purple/20 px-2 py-0.5 text-hog-purple">
                        <Video className="h-3 w-3" /> tape
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <BookOpen className="h-3 w-3" /> read
                      </span>
                    )}
                    {lang === "tanglish" ? (
                      <span className="rounded-sm bg-hog-yellow/15 px-2 py-0.5 text-hog-yellow">
                        tanglish
                      </span>
                    ) : null}
                    <span
                      className="ml-auto text-muted-foreground"
                      title={`Fear level ${story.fear} of 5`}
                    >
                      {"▮".repeat(story.fear)}
                      {"▯".repeat(5 - story.fear)}
                    </span>
                  </div>

                  <h2
                    className={`mt-3 font-display text-[1.35rem] font-bold leading-tight tracking-tight text-foreground transition-colors ${
                      kind === "tape" ? "group-hover:text-hog-purple" : "group-hover:text-hog-red"
                    }`}
                  >
                    {story.title}
                  </h2>

                  <p
                    className={`mt-3 flex-1 text-sm leading-relaxed text-muted-foreground ${
                      lang === "tanglish" ? "" : "font-story text-[15px]"
                    }`}
                  >
                    {story.hook}
                  </p>

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
                      <span
                        className={`inline-flex items-center gap-1.5 ${
                          complete ? "text-game-go" : "text-hog-red"
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {complete ? "all found" : `${found} found`}
                      </span>
                    ) : null}
                  </div>

                  {/* Ending progress bar — the reason to come back. */}
                  {found > 0 ? (
                    <div className="mt-3 flex gap-1">
                      {Array.from({ length: story.endings }).map((_, k) => (
                        <span
                          key={k}
                          className={`h-0.5 flex-1 rounded-full ${
                            k < found ? (complete ? "bg-game-go" : "bg-hog-red") : "bg-secondary"
                          }`}
                        />
                      ))}
                    </div>
                  ) : null}

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
