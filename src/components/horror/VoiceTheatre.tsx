import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronsRight,
  Gauge,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { HorrorAudio } from "@/lib/horror/audio";
import { estimateMs, pickVoice, tokenise, type VoiceStory } from "@/lib/horror/voice";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * THE VOICE THEATRE
 * ============================================================================
 *
 * Plays a narrated story: the browser reads it aloud, the words light up as
 * they are spoken, and the existing synthesised horror bed runs underneath.
 *
 * THE THREE THINGS THAT MAKE THIS HARD
 *
 * 1. `boundary` events are not reliable. Chrome and Firefox report a character
 *    index as they speak; Safari and most mobile browsers fire nothing at all.
 *    So a timer always runs, estimating progress, and a real boundary event
 *    overrides it the moment one arrives. The highlight is therefore exact
 *    where the browser allows it and close enough everywhere else.
 *
 * 2. Long utterances get cut off. Chrome's synthesiser stops after roughly
 *    fifteen seconds unless it is nudged, so a keep-alive pauses and resumes it
 *    every few seconds while speaking. Lines here are short enough that this
 *    rarely fires, but "rarely" is not "never" and a story that stops dead
 *    halfway is worse than one that never started.
 *
 * 3. `onend` sometimes never arrives — a backgrounded tab, a cancelled queue, a
 *    voice that failed to load. Every line therefore carries a watchdog set to
 *    well past its expected length, so the story can never simply hang.
 *
 * Everything is user-initiated. Nothing speaks, and no audio context opens,
 * until the listener presses play on the gate.
 */

type Phase = "gate" | "playing" | "paused" | "done";

const RATES = [0.75, 0.9, 1, 1.15] as const;

export function VoiceTheatre({ story }: { story: VoiceStory }) {
  const [phase, setPhase] = useState<Phase>("gate");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [fear, setFear] = useState(0);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState<number>(1);
  const [shake, setShake] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voicesReady, setVoicesReady] = useState(false);
  /** True when the platform has no voice for this story's language. */
  const [silent, setSilent] = useState(false);

  const audio = useRef<HorrorAudio | null>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);
  /** Timers and flags for the line currently being performed. */
  const karaoke = useRef<number | null>(null);
  const watchdog = useRef<number | null>(null);
  const holdTimer = useRef<number | null>(null);
  const keepAlive = useRef<number | null>(null);
  const gotBoundary = useRef(false);
  /** Guards against a cancelled utterance's `onend` advancing the story. */
  const token = useRef(0);

  const script = story.script;
  const line = script[index];

  /* ---- Voices ----------------------------------------------------------
   * The list arrives asynchronously and, on Chrome, is empty on first call.
   * `voiceschanged` is the only reliable signal that it has been populated.
   * ------------------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSilent(true);
      setVoicesReady(true);
      return;
    }

    const sync = () => {
      const all = window.speechSynthesis.getVoices();
      if (all.length === 0) return;
      const chosen = pickVoice(all, story.lang);
      setVoice(chosen);
      setSilent(chosen === null);
      setVoicesReady(true);
    };

    sync();
    window.speechSynthesis.addEventListener("voiceschanged", sync);
    // Some builds populate the list without ever firing the event. Give up
    // waiting after a moment and run with whatever is there.
    const settle = window.setTimeout(() => setVoicesReady(true), 1200);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", sync);
      window.clearTimeout(settle);
    };
  }, [story.lang]);

  /* ---- Teardown -------------------------------------------------------- */

  const clearTimers = useCallback(() => {
    for (const ref of [karaoke, watchdog, holdTimer, keepAlive]) {
      if (ref.current !== null) {
        window.clearInterval(ref.current);
        window.clearTimeout(ref.current);
        ref.current = null;
      }
    }
  }, []);

  const stopEverything = useCallback(() => {
    token.current += 1;
    clearTimers();
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* no synthesiser */
    }
  }, [clearTimers]);

  useEffect(() => {
    return () => {
      stopEverything();
      audio.current?.destroy();
      audio.current = null;
    };
  }, [stopEverything]);

  /* ---- Performing one line ---------------------------------------------- */

  const perform = useCallback(
    (i: number) => {
      const current = script[i];
      if (!current) {
        setPhase("done");
        audio.current?.setFear(0);
        return;
      }

      const mine = ++token.current;
      clearTimers();
      gotBoundary.current = false;
      setCharIndex(0);
      setIndex(i);

      /* Sound and pressure, before the words. */
      const bed = audio.current;
      if (bed) {
        if (current.amb) bed.setAmbience(current.amb);
        if (current.sfx) bed.play(current.sfx);
      }
      if (current.fear) {
        setFear((f) => {
          const next = Math.max(0, Math.min(100, f + current.fear!));
          bed?.setFear(next);
          return next;
        });
      }
      if (current.shake) {
        setShake(true);
        window.setTimeout(() => setShake(false), 360);
      }

      const lineRate = rate * (current.rate ?? 1);
      const expected = estimateMs(current.s, story.lang, lineRate);

      const advance = () => {
        if (mine !== token.current) return;
        clearTimers();
        setCharIndex(current.s.length);
        holdTimer.current = window.setTimeout(
          () => {
            if (mine !== token.current) return;
            perform(i + 1);
          },
          // A beat between lines, plus whatever extra silence the line asked
          // for. The pause is where a horror story actually lives.
          420 + (current.hold ?? 0),
        );
      };

      /* The estimated highlight. Always runs; a real boundary event wins. */
      const startedAt = performance.now();
      karaoke.current = window.setInterval(() => {
        if (mine !== token.current) return;
        if (gotBoundary.current) return;
        const progress = (performance.now() - startedAt) / expected;
        setCharIndex(Math.min(current.s.length, Math.floor(progress * current.s.length)));
      }, 60);

      /* A line of written text inside the story is shown, never spoken. */
      const speakable = current.speaker !== "text" && !silent && voice !== null;

      if (!speakable) {
        watchdog.current = window.setTimeout(advance, expected);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(current.s);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = Math.max(0.5, Math.min(1.5, lineRate));
      utterance.pitch = Math.max(0.5, Math.min(1.6, current.pitch ?? 1));
      utterance.volume = muted ? 0 : 1;

      utterance.onboundary = (event) => {
        if (mine !== token.current) return;
        gotBoundary.current = true;
        setCharIndex(event.charIndex);
      };
      utterance.onend = advance;
      utterance.onerror = advance;

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        watchdog.current = window.setTimeout(advance, expected);
        return;
      }

      // Chrome stops speaking after ~15s without a nudge.
      keepAlive.current = window.setInterval(() => {
        if (mine !== token.current) return;
        const synth = window.speechSynthesis;
        if (synth.speaking && !synth.paused) {
          synth.pause();
          synth.resume();
        }
      }, 6000);

      // If `onend` never arrives, move on anyway.
      watchdog.current = window.setTimeout(advance, expected * 2.5 + 4000);
    },
    [script, rate, muted, voice, silent, story.lang, clearTimers],
  );

  /* ---- Controls --------------------------------------------------------- */

  const begin = () => {
    const bed = new HorrorAudio();
    bed.unlock();
    bed.setAmbience(story.ambience);
    bed.setMuted(muted);
    audio.current = bed;
    setPhase("playing");
    setFear(0);
    perform(0);
  };

  const pause = () => {
    setPhase("paused");
    clearTimers();
    try {
      window.speechSynthesis?.pause();
    } catch {
      /* no synthesiser */
    }
  };

  const resume = () => {
    setPhase("playing");
    // Re-performing the current line is more robust than `resume()`, which is
    // unreliable across browsers and leaves the highlight out of step when it
    // does work. The cost is hearing one line twice; the benefit is that
    // resume always works.
    perform(index);
  };

  const skip = () => {
    stopEverything();
    perform(index + 1);
  };

  const restart = () => {
    stopEverything();
    setFear(0);
    audio.current?.setFear(0);
    audio.current?.setAmbience(story.ambience);
    setPhase("playing");
    perform(0);
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      audio.current?.setMuted(next);
      // The voice has to be silenced too, and volume cannot be changed on an
      // utterance that is already speaking — so the line is restarted.
      if (phase === "playing") {
        stopEverything();
        window.setTimeout(() => perform(index), 30);
      }
      return next;
    });
  };

  /* Keep the live line in view without yanking the page around. */
  useEffect(() => {
    if (phase !== "playing") return;
    lineRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [index, phase]);

  const progress = script.length > 0 ? (index + 1) / script.length : 0;

  /* ---- The gate --------------------------------------------------------- */

  if (phase === "gate") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="micro mb-3 text-[oklch(0.7_0.18_25)]">Narrated · {story.minutes}</p>
        <h1 className="font-story text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          {story.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-story text-lg leading-relaxed text-foreground/70">
          {story.standfirst}
        </p>

        <div className="mx-auto mt-8 max-w-md space-y-3 rounded-xl border border-border/70 bg-card/50 p-4 text-left">
          <p className="flex items-start gap-2.5 text-[13px] leading-relaxed text-foreground/80">
            <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.7_0.18_25)]" />
            Headphones. Half the sounds in this are panned, and the ones behind you are the point.
          </p>

          {!voicesReady ? (
            <p className="micro text-muted-foreground">Looking for a voice…</p>
          ) : silent ? (
            <p className="text-[13px] leading-relaxed text-[oklch(0.8_0.14_80)]">
              Your device has no{" "}
              <strong className="font-semibold">
                {story.lang === "tamil" ? "Tamil" : "speech"}
              </strong>{" "}
              voice installed, so nothing will be read aloud. The story still runs — the words light
              up in time and the sound design plays underneath.
              {story.lang === "tamil"
                ? " Adding a Tamil voice in your system's language settings turns the narration on."
                : ""}
            </p>
          ) : (
            <p className="text-[13px] leading-relaxed text-foreground/70">
              Reading voice:{" "}
              <span className="font-mono text-[12px] text-foreground">
                {voice?.name} ({voice?.lang})
              </span>
            </p>
          )}

          {story.note ? (
            <p className="border-t border-border/60 pt-3 text-[12px] leading-relaxed text-muted-foreground">
              {story.note}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={begin}
          className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[oklch(0.58_0.22_25)] px-7 py-3 text-[15px] font-semibold text-white transition-transform hover:scale-[1.03]"
        >
          <Play className="h-4 w-4" />
          Listen
        </button>
      </div>
    );
  }

  /* ---- The stage -------------------------------------------------------- */

  return (
    <div
      className="voice-stage relative min-h-[calc(100svh-6rem)]"
      data-shake={shake ? "true" : "false"}
      style={{ ["--fear" as string]: (fear / 100).toFixed(2) }}
    >
      <div
        aria-hidden
        className="voice-vignette pointer-events-none fixed inset-0 z-0"
        style={{ opacity: 0.55 + (fear / 100) * 0.4 }}
      />

      {/* The lyric sheet. Every line is in the DOM so a screen reader gets the
          whole story as text, and so the listener can see where they are. */}
      <div className="relative z-10 mx-auto max-w-2xl px-5 py-[35vh]">
        {script.map((entry, i) => {
          const state = i === index ? "live" : i < index ? "past" : "ahead";
          const isText = entry.speaker === "text";
          const isOther = entry.speaker === "other";
          const isVoice = entry.speaker === "voice";

          return (
            <p
              key={i}
              ref={i === index ? lineRef : undefined}
              data-state={state}
              className={cn(
                "voice-line mb-6 font-story text-[22px] leading-[1.55] sm:text-[26px]",
                isText &&
                  "border-l-2 border-[oklch(0.7_0.18_25)] pl-4 font-mono text-[15px] uppercase tracking-wide sm:text-[16px]",
                isOther && "font-semibold text-[oklch(0.82_0.1_25)]",
                isVoice && "italic",
                !isText && !isOther && "text-foreground",
              )}
            >
              {i === index
                ? tokenise(entry.s).map((tk, j) =>
                    tk.word ? (
                      <span
                        key={j}
                        className="voice-word"
                        data-lit={tk.start < charIndex + 1 ? "true" : "false"}
                      >
                        {tk.text}
                      </span>
                    ) : (
                      <span key={j}>{tk.text}</span>
                    ),
                  )
                : entry.s}

              {entry.gloss ? (
                <span className="mt-1.5 block font-sans text-[13px] not-italic leading-snug text-muted-foreground">
                  {entry.gloss}
                </span>
              ) : null}
            </p>
          );
        })}

        {phase === "done" ? (
          <div className="mt-10 border-t border-border/60 pt-8 text-center">
            <p className="micro mb-2 text-[oklch(0.7_0.18_25)]">End of recording</p>
            <h2 className="font-story text-2xl text-foreground">{story.title}</h2>
            <button
              type="button"
              onClick={restart}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-[14px] text-foreground transition-colors hover:bg-foreground/10"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Again
            </button>
          </div>
        ) : null}
      </div>

      {/* ---- Transport ---- */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/80 backdrop-blur-xl">
        <div
          aria-hidden
          className="h-0.5 bg-[oklch(0.58_0.22_25)] transition-[width] duration-500"
          style={{ width: `${progress * 100}%` }}
        />
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5">
          <button
            type="button"
            onClick={phase === "playing" ? pause : phase === "done" ? restart : resume}
            aria-label={phase === "playing" ? "Pause" : phase === "done" ? "Start again" : "Resume"}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[oklch(0.58_0.22_25)] text-white transition-transform hover:scale-105"
          >
            {phase === "playing" ? (
              <Pause className="h-4 w-4" />
            ) : phase === "done" ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={skip}
            disabled={phase === "done"}
            aria-label="Next line"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-30"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <span className="mx-1 hidden items-center gap-1.5 sm:flex">
            <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
            {RATES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRate(r);
                  if (phase === "playing") {
                    stopEverything();
                    window.setTimeout(() => perform(index), 30);
                  }
                }}
                aria-pressed={rate === r}
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[11px] transition-colors",
                  rate === r
                    ? "bg-foreground text-background"
                    : "text-foreground/60 hover:bg-foreground/10",
                )}
              >
                {r}×
              </button>
            ))}
          </span>

          <span className="ml-auto flex items-center gap-3">
            <span className="hidden font-mono text-[11px] tabular-nums text-muted-foreground sm:inline">
              {index + 1} / {script.length}
            </span>
            <span className="flex items-center gap-1.5" title={`Fear ${fear}`}>
              <span className="micro hidden text-muted-foreground sm:inline">Fear</span>
              <span
                aria-hidden
                className="h-1.5 w-16 overflow-hidden rounded-full bg-foreground/15"
              >
                <span
                  className="block h-full rounded-full bg-[oklch(0.58_0.22_25)] transition-[width] duration-700"
                  style={{ width: `${fear}%` }}
                />
              </span>
            </span>
          </span>
        </div>

        {silent ? (
          <p className="border-t border-border/50 px-4 py-1 text-center text-[11px] text-muted-foreground">
            No {story.lang === "tamil" ? "Tamil" : "speech"} voice on this device — running as a
            timed reading with sound design.
          </p>
        ) : null}
      </div>
    </div>
  );
}
