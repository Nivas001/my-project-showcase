import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Skull, Heart } from "lucide-react";
import { getStory, STORIES } from "@/content/horror";
import type { Beat, ChoiceBeat, EndingBeat, Story, TextBeat } from "@/lib/horror/types";
import { HorrorAudio } from "@/lib/horror/audio";
import { recordEnding, readNickname, writeNickname } from "@/lib/horror/progress";
import { recordRun } from "@/lib/horror.functions";

export const Route = createFileRoute("/horror/$slug")({
  loader: ({ params }) => {
    const story = getStory(params.slug);
    if (!story) throw notFound();
    return { story };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Story not found — The Dark Room" }, { name: "robots", content: "noindex" }] };
    }
    const s = loaderData.story;
    return {
      meta: [
        { title: `${s.title} — Interactive Horror | Srinivas M` },
        { name: "description", content: s.hook },
        { property: "og:title", content: `${s.title} — Interactive Horror` },
        { property: "og:description", content: s.hook },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  errorComponent: () => <Fallback title="Something went wrong in the dark" />,
  notFoundComponent: () => <Fallback title="That story isn't here anymore" />,
  component: StoryReader,
});

function Fallback({ title }: { title: string }) {
  return (
    <div className="horror-scope film-grain horror-vignette flex min-h-screen items-center justify-center px-6">
      <div className="relative z-10 text-center">
        <Skull className="mx-auto h-10 w-10 blood" />
        <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
        <Link to="/horror" className="mt-6 inline-block border-b border-current font-mono text-sm opacity-70 hover:opacity-100">
          back to the dark room
        </Link>
      </div>
    </div>
  );
}

type Shown = { key: string; beat: TextBeat };

function StoryReader() {
  const { story } = Route.useLoaderData();
  const [started, setStarted] = useState(false);

  if (!started) return <EntryGate story={story} onEnter={() => setStarted(true)} />;
  return <Player key={story.slug} story={story} />;
}

function EntryGate({ story, onEnter }: { story: Story; onEnter: () => void }) {
  return (
    <div className="horror-scope film-grain horror-vignette flex min-h-screen items-center justify-center px-6">
      <div className="relative z-10 w-full max-w-lg text-center">
        <Link
          to="/horror"
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs opacity-50 transition-opacity hover:opacity-100"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> the dark room
        </Link>

        <p className="font-mono text-[11px] uppercase tracking-[0.4em] blood">
          {"▮".repeat(story.fear)}
          {"▯".repeat(5 - story.fear)} fear rating
        </p>
        <h1 className="flicker mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{story.title}</h1>
        <p className="mt-5 text-sm leading-relaxed opacity-70">{story.hook}</p>

        <ul className="mx-auto mt-8 max-w-sm space-y-2 text-left font-mono text-[11px] opacity-55">
          <li>— choices are timed. hesitate and the story decides for you.</li>
          <li>— sound is generated live. headphones are strongly recommended.</li>
          <li>— {story.endings} endings. this one takes {story.minutes}.</li>
        </ul>

        <button
          type="button"
          onClick={onEnter}
          className="heart-pulse mt-10 w-full rounded-sm border border-[color:var(--horror-blood)] bg-[color:var(--horror-blood)]/10 px-6 py-4 font-mono text-sm uppercase tracking-[0.3em] transition-colors hover:bg-[color:var(--horror-blood)]/25"
        >
          enter
        </button>
        <p className="mt-4 font-mono text-[10px] opacity-40">pressing enter turns the sound on</p>
      </div>
    </div>
  );
}

function Player({ story }: { story: Story }) {
  const audioRef = useRef<HorrorAudio | null>(null);
  const [muted, setMuted] = useState(false);
  const [fear, setFear] = useState(10);
  const [shown, setShown] = useState<Shown[]>([]);
  const [choice, setChoice] = useState<ChoiceBeat | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [ending, setEnding] = useState<EndingBeat | null>(null);
  const [shake, setShake] = useState(false);

  const pathRef = useRef<string[]>([]);
  const startedAt = useRef(Date.now());
  const cancelled = useRef(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const fearRef = useRef(10);
  const bump = useCallback((d: number) => {
    fearRef.current = Math.max(0, Math.min(100, fearRef.current + d));
    setFear(fearRef.current);
    audioRef.current?.setFear(fearRef.current);
  }, []);

  // Boot audio (called from the entry gate click, so the context unlocks).
  useEffect(() => {
    const a = new HorrorAudio();
    a.unlock();
    a.setAmbience(story.ambience);
    a.setFear(10);
    audioRef.current = a;
    return () => {
      cancelled.current = true;
      a.destroy();
    };
  }, [story.ambience]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [shown.length, choice, ending]);

  const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

  const runNode = useCallback(
    async (nodeId: string) => {
      const beats: Beat[] | undefined = story.nodes[nodeId];
      if (!beats) return;

      for (const beat of beats) {
        if (cancelled.current) return;

        if (beat.t === "text") {
          const a = audioRef.current;
          if (beat.amb) a?.setAmbience(beat.amb);
          if (beat.sfx) a?.play(beat.sfx);
          if (beat.fear) bump(beat.fear);
          if (beat.shake) {
            setShake(true);
            window.setTimeout(() => setShake(false), 420);
          }
          setShown((prev) => [...prev, { key: `${nodeId}-${prev.length}`, beat }]);
          const base = beat.slow ? 60 : 34;
          await wait(Math.min(9000, 900 + beat.s.length * base * (beat.slow ? 0.55 : 0.4)) + (beat.hold ?? 0));
          continue;
        }

        if (beat.t === "goto") {
          await runNode(beat.go);
          return;
        }

        if (beat.t === "ending") {
          audioRef.current?.play(beat.outcome === "survived" ? "bell" : "scream");
          if (beat.outcome !== "survived") bump(25);
          setEnding(beat);
          recordEnding(story.slug, beat.id);
          return;
        }

        // choice — stop and wait for the reader
        setChoice(beat);
        return;
      }
    },
    [bump, story],
  );

  // kick off
  useEffect(() => {
    cancelled.current = false;
    void runNode("start");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = useCallback(
    (go: string, label: string, delta?: number) => {
      setChoice(null);
      setTimeLeft(null);
      pathRef.current = [...pathRef.current, label];
      if (delta) bump(delta);
      audioRef.current?.play("knock");
      void runNode(go);
    },
    [bump, runNode],
  );

  // choice countdown
  useEffect(() => {
    if (!choice?.timer) return;
    setTimeLeft(choice.timer);
    const started = Date.now();
    const id = window.setInterval(() => {
      const left = choice.timer! - (Date.now() - started) / 1000;
      if (left <= 0) {
        window.clearInterval(id);
        const first = choice.options[0]!;
        audioRef.current?.play("sting");
        bump(8);
        pick(first.go, `${first.label} (timed out)`, first.fear);
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [choice, bump, pick]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    audioRef.current?.setMuted(next);
  };

  const restart = () => {
    cancelled.current = true;
    window.location.reload();
  };

  return (
    <div className={`horror-scope film-grain horror-vignette min-h-screen ${shake ? "fear-shake" : ""}`}>
      <div className="relative z-10 mx-auto max-w-2xl px-5 pb-32 pt-6">
        <div className="sticky top-0 z-20 -mx-5 flex items-center justify-between gap-3 bg-[color:var(--horror-bg)]/90 px-5 py-3 backdrop-blur">
          <Link to="/horror" className="inline-flex items-center gap-2 font-mono text-[11px] opacity-50 hover:opacity-100">
            <ArrowLeft className="h-3.5 w-3.5" /> leave
          </Link>

          <div className="flex flex-1 items-center gap-2">
            <Heart className={`h-3.5 w-3.5 blood ${fear > 45 ? "animate-pulse" : ""}`} />
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[color:var(--horror-blood)] transition-[width] duration-700"
                style={{ width: `${fear}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={toggleMute} aria-label={muted ? "unmute" : "mute"} className="opacity-50 hover:opacity-100">
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button type="button" onClick={restart} aria-label="restart" className="opacity-50 hover:opacity-100">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h1 className="mt-6 font-mono text-[11px] uppercase tracking-[0.4em] opacity-40">{story.title}</h1>

        <div className="mt-8 space-y-6">
          {shown.map(({ key, beat }) => (
            <p
              key={key}
              className={`beat-in text-[15px] leading-8 sm:text-base ${
                beat.slow ? "bone text-lg leading-9 tracking-wide" : "opacity-85"
              }`}
            >
              {beat.s}
            </p>
          ))}
        </div>

        {choice && !ending && (
          <div className="beat-in mt-10 rounded-md border border-white/10 bg-black/50 p-5">
            {choice.prompt && <p className="mb-4 text-sm italic opacity-70">{choice.prompt}</p>}

            {timeLeft !== null && choice.timer && (
              <div className="mb-4 h-0.5 w-full overflow-hidden bg-white/10">
                <div
                  className="h-full bg-[color:var(--horror-blood)]"
                  style={{ width: `${(timeLeft / choice.timer) * 100}%`, transition: "width 100ms linear" }}
                />
              </div>
            )}

            <div className="space-y-2">
              {choice.options.map((opt) => (
                <button
                  key={opt.go + opt.label}
                  type="button"
                  onClick={() => pick(opt.go, opt.label, opt.fear)}
                  className="block w-full rounded-sm border border-white/10 px-4 py-3 text-left text-sm transition-all hover:translate-x-1 hover:border-[color:var(--horror-blood)] hover:bg-[color:var(--horror-blood)]/10"
                >
                  <span className="mr-2 font-mono text-[11px] blood">&gt;</span>
                  {opt.label}
                </button>
              ))}
            </div>

            {timeLeft !== null && (
              <p className="mt-3 font-mono text-[10px] opacity-40">{timeLeft.toFixed(1)}s — silence is also a choice</p>
            )}
          </div>
        )}

        {ending && (
          <EndingCard
            story={story}
            ending={ending}
            path={pathRef.current}
            seconds={Math.round((Date.now() - startedAt.current) / 1000)}
          />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function EndingCard({
  story,
  ending,
  path,
  seconds,
}: {
  story: Story;
  ending: EndingBeat;
  path: string[];
  seconds: number;
}) {
  const [nickname, setNickname] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  useEffect(() => {
    setNickname(readNickname());
  }, []);

  const tone =
    ending.outcome === "survived"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : ending.outcome === "doomed"
        ? "border-amber-600/30 bg-amber-600/5"
        : "border-[color:var(--horror-blood)]/50 bg-[color:var(--horror-blood)]/10";

  const others = useMemo(() => STORIES.filter((s) => s.slug !== story.slug).slice(0, 3), [story.slug]);

  const submit = async () => {
    setState("saving");
    try {
      writeNickname(nickname.trim());
      await recordRun({
        data: {
          story: story.slug,
          ending: ending.id,
          outcome: ending.outcome,
          nickname: nickname.trim() || "anonymous",
          choices: path,
          durationSeconds: seconds,
        },
      });
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className={`beat-in mt-14 rounded-md border p-6 sm:p-8 ${tone}`}>
      <p className="font-mono text-[11px] uppercase tracking-[0.4em] opacity-60">
        {ending.outcome === "survived" ? "you got out" : ending.outcome === "doomed" ? "you did not get out" : "worst ending"}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">{ending.title}</h2>

      <div className="mt-5 space-y-3">
        {ending.lines.map((line) => (
          <p key={line} className="text-sm leading-7 opacity-80">
            {line}
          </p>
        ))}
      </div>

      <p className="mt-6 font-mono text-[11px] opacity-45">
        {path.length} choices · {Math.floor(seconds / 60)}m {seconds % 60}s in the dark
      </p>

      <div className="mt-6 border-t border-white/10 pt-6">
        {state === "done" ? (
          <p className="font-mono text-xs bone">recorded. your ending is part of the archive now.</p>
        ) : (
          <>
            <label htmlFor="horror-nick" className="font-mono text-[11px] opacity-60">
              add your ending to the public archive
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="horror-nick"
                value={nickname}
                maxLength={20}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="nickname"
                className="flex-1 rounded-sm border border-white/15 bg-black/40 px-3 py-2 font-mono text-sm outline-none focus:border-[color:var(--horror-blood)]"
              />
              <button
                type="button"
                onClick={() => void submit()}
                disabled={state === "saving"}
                className="rounded-sm border border-[color:var(--horror-blood)] px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:bg-[color:var(--horror-blood)]/20 disabled:opacity-40"
              >
                {state === "saving" ? "saving…" : "record"}
              </button>
            </div>
            {state === "error" && <p className="mt-2 font-mono text-[11px] blood">couldn't save that. the dark ate it.</p>}
          </>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-sm border border-white/15 px-4 py-2 font-mono text-xs transition-colors hover:border-[color:var(--horror-blood)]"
        >
          try a different path
        </button>
        <Link
          to="/horror"
          className="rounded-sm border border-white/15 px-4 py-2 font-mono text-xs transition-colors hover:border-[color:var(--horror-blood)]"
        >
          back to the dark room
        </Link>
      </div>

      <div className="mt-8">
        <p className="font-mono text-[11px] opacity-40">still awake? try:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {others.map((s) => (
            <Link
              key={s.slug}
              to="/horror/$slug"
              params={{ slug: s.slug }}
              className="rounded-sm border border-white/10 px-3 py-1.5 font-mono text-[11px] opacity-70 hover:opacity-100"
            >
              {s.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
