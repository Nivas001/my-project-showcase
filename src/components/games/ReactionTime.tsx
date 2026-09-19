import { useCallback, useEffect, useRef, useState } from "react";
import { Timer, Zap } from "lucide-react";
import { useArcadeAudio } from "@/lib/arcade/use-arcade-audio";
import { readBest, recordBest } from "@/lib/arcade/best";
import { Hud, HudStat, ResultCard, StartButton } from "./bits";

/* ==========================================================================
 * REACTION TIME
 *
 * Five rounds, averaged. Three fixes over the first version:
 *
 *   false starts   used to burn a round. Jumping the light now replays the
 *                  same round, which is the only fair reading of "too soon".
 *   flow           rounds used to need a click to continue. They now chain
 *                  automatically, so five rounds take eight seconds.
 *   context        a bare millisecond number means nothing to most people, so
 *                  each result gets a band it falls into.
 * ======================================================================== */

const ROUNDS = 5;

type Phase = "idle" | "arming" | "live" | "tooSoon" | "between" | "over";

/** Where a time lands. Bands are from published simple-visual-reaction data. */
function band(ms: number) {
  if (ms < 160) return { label: "inhuman", tone: "hog-purple" };
  if (ms < 200) return { label: "elite", tone: "game-go" };
  if (ms < 250) return { label: "quick", tone: "game-go" };
  if (ms < 300) return { label: "average", tone: "hog-yellow" };
  if (ms < 400) return { label: "sleepy", tone: "hog-orange" };
  return { label: "geological", tone: "hog-red" };
}

export function ReactionTime({ onGameOver }: { onGameOver: (score: number) => void }) {
  const audio = useArcadeAudio();
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(1);
  const [times, setTimes] = useState<number[]>([]);
  const [last, setLast] = useState<number | null>(null);
  const [best, setBest] = useState<number | undefined>(undefined);
  const [isBest, setIsBest] = useState(false);

  const timer = useRef<number | null>(null);
  const litAt = useRef(0);
  const roundRef = useRef(1);
  const timesRef = useRef<number[]>([]);

  useEffect(() => setBest(readBest("reaction-time")), []);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const arm = useCallback(() => {
    setPhase("arming");
    if (timer.current) window.clearTimeout(timer.current);
    // 1.4–4.2s. The spread has to be wide enough that rhythm can't beat it.
    timer.current = window.setTimeout(
      () => {
        setPhase("live");
        litAt.current = performance.now();
        audio.play("blip");
      },
      1400 + Math.random() * 2800,
    );
  }, [audio]);

  const finish = useCallback(() => {
    const all = timesRef.current;
    const avg = Math.round(all.reduce((a, b) => a + b, 0) / (all.length || 1));
    setPhase("over");
    setBest(readBest("reaction-time"));
    const beat = recordBest("reaction-time", avg);
    setIsBest(beat);
    audio.play(beat ? "highscore" : "gameover");
    onGameOver(avg);
  }, [audio, onGameOver]);

  const tap = () => {
    if (phase === "idle" || phase === "over") {
      audio.play("start");
      roundRef.current = 1;
      timesRef.current = [];
      setRound(1);
      setTimes([]);
      setLast(null);
      setIsBest(false);
      arm();
      return;
    }

    if (phase === "tooSoon") {
      arm();
      return;
    }

    if (phase === "arming") {
      if (timer.current) window.clearTimeout(timer.current);
      audio.play("error");
      setPhase("tooSoon");
      return;
    }

    if (phase !== "live") return;

    const ms = Math.round(performance.now() - litAt.current);
    timesRef.current = [...timesRef.current, ms];
    setTimes(timesRef.current);
    setLast(ms);
    audio.play(ms < 250 ? "coin" : "hit");

    if (roundRef.current >= ROUNDS) {
      setPhase("between");
      window.setTimeout(finish, 700);
      return;
    }

    roundRef.current += 1;
    setRound(roundRef.current);
    setPhase("between");
    // Chain straight into the next round; no click required.
    window.setTimeout(arm, 850);
  };

  // Space bar, because that is what anyone testing a reaction time reaches for.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      tap();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;

  const surface =
    phase === "live"
      ? "border-game-go bg-game-go"
      : phase === "tooSoon"
        ? "border-destructive bg-destructive/25"
        : phase === "arming"
          ? "border-hog-red/60 bg-hog-red/10"
          : "border-border bg-surface-raised";

  const headline =
    phase === "idle"
      ? "Tap to begin"
      : phase === "arming"
        ? "Wait for green…"
        : phase === "live"
          ? "TAP"
          : phase === "tooSoon"
            ? "Too soon"
            : phase === "between" && last !== null
              ? `${last} ms`
              : "…";

  const sub =
    phase === "idle"
      ? `${ROUNDS} rounds, averaged · space bar works too`
      : phase === "arming"
        ? "tapping early replays the round"
        : phase === "live"
          ? "now"
          : phase === "tooSoon"
            ? "tap to replay this round"
            : phase === "between" && last !== null
              ? band(last).label
              : "";

  return (
    <div className="mx-auto w-full max-w-md">
      <Hud>
        <HudStat icon={Timer} label="round" value={`${Math.min(round, ROUNDS)}/${ROUNDS}`} />
        <HudStat icon={Zap} label="avg" value={avg !== null ? `${avg} ms` : "—"} tone="accent" />
      </Hud>

      {/* Per-round chips. Seeing round three was the slow one is the whole
          point of running five of them. */}
      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: ROUNDS }).map((_, i) => {
          const t = times[i];
          return (
            <span
              key={i}
              className="flex-1 rounded-sm border py-1 text-center font-mono text-[10px] tabular-nums"
              style={
                t !== undefined
                  ? {
                      borderColor: `var(--${band(t).tone})`,
                      color: `var(--${band(t).tone})`,
                      background: `color-mix(in oklab, var(--${band(t).tone}) 12%, transparent)`,
                    }
                  : { borderColor: "var(--border)", color: "var(--muted-foreground)" }
              }
            >
              {t !== undefined ? t : "—"}
            </span>
          );
        })}
      </div>

      <button
        type="button"
        onPointerDown={tap}
        className={`mt-3 flex h-56 w-full select-none flex-col items-center justify-center rounded-md border-2 transition-colors duration-75 active:scale-[0.995] ${surface}`}
      >
        <span
          className={`font-mono font-black tracking-tight ${
            phase === "live"
              ? "text-5xl text-game-go-foreground"
              : "text-3xl text-foreground"
          }`}
        >
          {headline}
        </span>
        <span
          className={`mt-2 font-mono text-[11px] uppercase tracking-[0.25em] ${
            phase === "live" ? "text-game-go-foreground/70" : "text-muted-foreground"
          }`}
        >
          {sub}
        </span>
      </button>

      {phase === "idle" && (
        <div className="mt-5 text-center">
          <StartButton onClick={tap}>Start</StartButton>
        </div>
      )}

      {phase === "over" && avg !== null && (
        <ResultCard
          score={avg}
          unit="ms"
          best={best}
          isBest={isBest}
          detail={`${band(avg).label} · fastest ${Math.min(...times)} ms · slowest ${Math.max(...times)} ms`}
          onRetry={tap}
        />
      )}
    </div>
  );
}
