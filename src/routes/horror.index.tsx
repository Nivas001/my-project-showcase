import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Skull, Clock, GitBranch, Volume2, Eye } from "lucide-react";
import { STORIES } from "@/content/horror";
import { readProgress, type Progress } from "@/lib/horror/progress";

export const Route = createFileRoute("/horror/")({
  head: () => ({
    meta: [
      { title: "Horror Stories — Interactive Nightmares | Srinivas M" },
      {
        name: "description",
        content:
          "Ten branching horror stories with synthesized sound, multiple endings and choices that time out. Read in the dark. Headphones recommended.",
      },
      { property: "og:title", content: "Horror Stories — Interactive Nightmares" },
      { property: "og:description", content: "Ten branching horror stories. Multiple endings. Headphones on, lights off." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HorrorLibrary,
});

function HorrorLibrary() {
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  return (
    <div className="horror-scope film-grain horror-vignette min-h-screen">
      <div className="relative z-10 mx-auto max-w-5xl px-5 py-16 sm:py-24">
        <header className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.4em] blood">// do not read alone</p>
          <h1 className="flicker mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            The Dark Room
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed opacity-70">
            Ten stories. Every one of them branches, times you out if you hesitate, and ends more than one way.
            Sound is synthesized live in your browser. Headphones on. Lights off. Your choices are recorded.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-sm border border-white/10 px-3 py-1.5 font-mono text-[11px] opacity-60">
            <Volume2 className="h-3.5 w-3.5" />
            audio starts only when you press ENTER inside a story
          </p>
        </header>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {STORIES.map((story, i) => {
            const found = progress[story.slug]?.endings.length ?? 0;
            return (
              <Link
                key={story.slug}
                to="/horror/$slug"
                params={{ slug: story.slug }}
                className="beat-in group relative overflow-hidden rounded-md border border-white/10 bg-black/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--horror-blood)] hover:bg-black/70"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-[color:var(--horror-blood)]">
                    {story.title}
                  </h2>
                  <span className="shrink-0 font-mono text-[10px] tracking-widest opacity-50">
                    {"▮".repeat(story.fear)}
                    {"▯".repeat(5 - story.fear)}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed opacity-70">{story.hook}</p>

                <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-[11px] opacity-55">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {story.minutes}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <GitBranch className="h-3.5 w-3.5" />
                    {story.endings} endings
                  </span>
                  {found > 0 && (
                    <span className="inline-flex items-center gap-1.5 bone">
                      <Eye className="h-3.5 w-3.5" />
                      {found} found
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {story.tags.map((tag) => (
                    <span key={tag} className="rounded-sm border border-white/10 px-2 py-0.5 font-mono text-[10px] opacity-50">
                      {tag}
                    </span>
                  ))}
                </div>

                <Skull className="pointer-events-none absolute -bottom-6 -right-4 h-24 w-24 opacity-[0.04] transition-opacity duration-500 group-hover:opacity-[0.12]" />
              </Link>
            );
          })}
        </div>

        <p className="mt-16 text-center font-mono text-[11px] opacity-40">
          all stories are fiction. none of them are about you. probably.
        </p>
      </div>
    </div>
  );
}
