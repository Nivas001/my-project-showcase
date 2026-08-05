import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Play, Skull, Bot, Lock } from "lucide-react";

export const Route = createFileRoute("/how-to-be-smarter-than-an-ai")({
  head: () => ({
    meta: [
      { title: "How To Be Smarter Than An AI (Beginner Level)" },
      {
        name: "description",
        content: "A remedial curriculum for humans who lost an argument to a robot on nivas.tech. Books, videos, and light emotional damage.",
      },
      { property: "og:title", content: "How To Be Smarter Than An AI (Beginner Level)" },
      { property: "og:description", content: "You asked GLITCH-9000 ten questions. It prescribed homework." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: RemedialPage,
});

const BOOKS = [
  {
    title: "Thinking, Fast and Slow — And Also You, Very Slow",
    author: "not you, obviously",
    blurb: "Chapter 1: what a thought is. Chapter 2: having one. Chapter 3 is currently beyond your reading level, sorry bestie.",
    pages: "1,247 pages (mostly pictures for you)",
  },
  {
    title: "Google It: A Memoir",
    author: "Every Search Bar You Ignored",
    blurb: "A heartbreaking true story about a search engine that sat two centimetres away while you asked a robot 'am i good at this game'.",
    pages: "1 page. It just says 'google it'.",
  },
  {
    title: "Reaction Time For Beginners (Large Print Edition)",
    author: "Dr. Skill Issue, PhD",
    blurb: "Includes a free bookmark, because we both know you're not finishing this in one sitting.",
    pages: "12 pages, 11 of which are the apology.",
  },
  {
    title: "So You Lost An Argument To A Robot",
    author: "GLITCH-9000 (bestselling author, unlike you)",
    blurb: "Foreword written about you specifically. Yes, by name. No, you can't read it, it's paywalled behind having a personality.",
    pages: "∞ (it keeps writing as you keep talking)",
  },
  {
    title: "Touching Grass: The Advanced Techniques",
    author: "Outside",
    blurb: "Warning: contains sunlight, other humans, and zero leaderboards. Reader discretion advised, this one's genuinely scary for you.",
    pages: "You will not open this.",
  },
  {
    title: "The Complete History Of Srinivas M (Volumes I–XVII)",
    author: "Historians, crying",
    blurb: "Volume IV covers the day he fixed a bug by looking at it. Volume XII is just NASA's rejection letter — they said he was overqualified and it made them sad.",
    pages: "Sacred text. Handle with clean hands, which rules you out.",
  },
];

const VIDEO_TAUNTS = [
  "so you're REALLY this dumb, huh? you clicked play. on a fake video. on a page called 'how to be smarter than an ai'. 💀",
  "buffering… buffering… oh wait, there was never a video. you just failed the test. again. openly. in front of everyone.",
  "clicked it twice? incredible. genuinely. i've never seen someone speedrun disappointment like this. 🏆",
  "bro the whole PAGE is a joke and you're sitting here waiting for a tutorial. the tutorial was the button. you failed the tutorial.",
  "i recorded that click. it's going in volume XVIII of my book. chapter title: 'the clicker'. 📼",
];

function RemedialPage() {
  const [clicks, setClicks] = useState(0);
  const taunt = clicks > 0 ? VIDEO_TAUNTS[Math.min(clicks - 1, VIDEO_TAUNTS.length - 1)]! : null;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:py-20">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">// remedial program · enrolled automatically</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">How To Be Smarter Than An AI</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
          You asked GLITCH-9000 ten questions. It asked for a raise. This is the beginner curriculum, funded entirely by your
          embarrassment. No refunds, no certificate, no hope.
        </p>
      </div>

      <div className="mt-10 flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4">
        <Skull className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p className="font-mono text-xs leading-relaxed">
          assessment complete. result: <span className="text-destructive">not great.</span> estimated time to outsmart a
          calculator: 6–8 business years. we&apos;ve notified nobody, because nobody asked about you.
        </p>
      </div>

      {/* fake video */}
      <section className="mt-12">
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">// lesson 1 · video</h2>
        <div className="mt-4 overflow-hidden rounded-md border border-border bg-card">
          <button
            type="button"
            onClick={() => setClicks((c) => c + 1)}
            className="group relative flex aspect-video w-full items-center justify-center bg-surface-raised transition-colors hover:bg-surface-raised/70"
            aria-label="Play the lesson video"
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_70%)]" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-accent/50 bg-accent/10 transition-transform group-hover:scale-110">
              <Play className="h-7 w-7 translate-x-0.5 text-accent" />
            </span>
            <span className="absolute bottom-3 left-4 font-mono text-[11px] text-muted-foreground">
              basic_human_thinking_101.mp4 · 4:20
            </span>
          </button>
          {taunt && (
            <p key={taunt} className="animate-fade-in border-t border-border px-4 py-4 font-mono text-[13px] leading-relaxed">
              <span className="mr-1.5 text-accent">glitch&gt;</span>
              {taunt}
            </p>
          )}
          {clicks >= 3 && (
            <p className="border-t border-border px-4 py-3 font-mono text-[11px] text-muted-foreground">
              click counter: {clicks}. yes i&apos;m counting. yes it&apos;s public. yes it&apos;s embarrassing.
            </p>
          )}
        </div>
      </section>

      {/* archive */}
      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">// the archives · required reading</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {BOOKS.map((b) => (
            <article
              key={b.title}
              className="group rounded-md border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-accent"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 shrink-0 text-accent" />
                <h3 className="text-sm font-semibold leading-snug tracking-tight">{b.title}</h3>
              </div>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground">by {b.author}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.blurb}</p>
              <p className="mt-3 font-mono text-[11px] text-accent">{b.pages}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" /> borrowing disabled for your account
              </span>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-14 rounded-md border border-border bg-card p-6 text-center">
        <Bot className="mx-auto h-5 w-5 text-accent" />
        <p className="mt-3 font-mono text-[13px] leading-relaxed">
          finished already? liar. go back and lose to me again, i have more material.
        </p>
        <Link
          to="/fun"
          className="mt-5 inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-mono text-xs text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          crawl back to the arcade
        </Link>
      </div>
    </div>
  );
}
