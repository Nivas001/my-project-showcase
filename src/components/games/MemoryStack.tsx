import { useCallback, useEffect, useRef, useState } from "react";
import { Brain, Eye, Hand, Layers } from "lucide-react";
import { useArcadeAudio } from "@/lib/arcade/use-arcade-audio";
import { readBest, recordBest } from "@/lib/arcade/best";
import { Hud, HudStat, ResultCard, StartButton } from "./bits";

/* ==========================================================================
 * MEMORY STACK
 *
 * Simon, with the two things Simon actually needs and the original here was
 * missing: every tile has its own pitch, and the sequence is drawn as a
 * progress strip while you repeat it.
 *
 * The pitch is not decoration. Sound is a second channel to memorise through,
 * and it is the difference between recalling nine flashes and recalling a tune.
 * ======================================================================== */

const CELLS = 9;
const BASE_DELAY = 720;

/** One accent per tile, so a sequence has colour shape as well as position. */
const TONES = [
  "hog-red",
  "hog-orange",
  "hog-yellow",
  "game-go",
  "hog-blue",
  "hog-purple",
  "hog-green",
  "signature",
  "hog-red-deep",
] as const;

export function MemoryStack({ onGameOver }: { onGameOver: (score: number) => void }) {
  const audio = useArcadeAudio();
  const [status, setStatus] = useState<"idle" | "watch" | "input" | "over">("idle");
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [flash, setFlash] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [best, setBest] = useState<number | undefined>(undefined);
  const [isBest, setIsBest] = useState(false);

  const timeouts = useRef<number[]>([]);
  const seqRef = useRef<number[]>([]);
  const idxRef = useRef(0);

  useEffect(() => setBest(readBest("memory-stack")), []);

  const clearTimers = () => {
    timeouts.current.forEach((t) => window.clearTimeout(t));
    timeouts.current = [];
  };
  useEffect(() => clearTimers, []);

  const after = (ms: number, fn: () => void) => {
    timeouts.current.push(window.setTimeout(fn, ms));
  };

  /* ---- playback -------------------------------------------------------- */

  const playSequence = useCallback(
    (seq: number[]) => {
      setStatus("watch");
      setFlash(null);
      setWrong(null);
      setInputIndex(0);
      idxRef.current = 0;
      clearTimers();

      // Tightens as the chain grows, with a floor that keeps it readable.
      const gap = Math.max(300, BASE_DELAY - (seq.length - 1) * 38);

      seq.forEach((cell, i) => {
        after(i * gap + 400, () => {
          setFlash(cell);
          audio.play("hit", cell);
          after(gap * 0.52, () => setFlash(null));
        });
      });

      after(seq.length * gap + 560, () => {
        setStatus("input");
        audio.play("blip");
      });
    },
    [audio],
  );

  const start = () => {
    clearTimers();
    audio.play("start");
    const first = [Math.floor(Math.random() * CELLS)];
    seqRef.current = first;
    setSequence(first);
    setLevel(1);
    setIsBest(false);
    playSequence(first);
  };

  const nextLevel = useCallback(() => {
    const next = [...seqRef.current, Math.floor(Math.random() * CELLS)];
    seqRef.current = next;
    setSequence(next);
    setLevel(next.length);
    audio.play("levelup");
    playSequence(next);
  }, [audio, playSequence]);

  /* ---- input ----------------------------------------------------------- */

  const press = (cell: number) => {
    if (status !== "input") return;

    if (seqRef.current[idxRef.current] !== cell) {
      clearTimers();
      setWrong(cell);
      setStatus("over");
      const reached = seqRef.current.length - 1; // the last level you cleared
      const final = Math.max(0, reached);
      setBest(readBest("memory-stack"));
      const beat = recordBest("memory-stack", final);
      setIsBest(beat);
      audio.play("hurt");
      after(300, () => audio.play(beat ? "highscore" : "gameover"));
      onGameOver(final);
      return;
    }

    setFlash(cell);
    audio.play("hit", cell);
    after(170, () => setFlash(null));

    idxRef.current += 1;
    setInputIndex(idxRef.current);

    if (idxRef.current >= seqRef.current.length) {
      setStatus("watch");
      after(700, nextLevel);
    }
  };

  const statusLabel =
    status === "watch"
      ? "watch"
      : status === "input"
        ? "your turn"
        : status === "over"
          ? "broken chain"
          : "ready";

  return (
    <div className="mx-auto w-full max-w-xs">
      <Hud>
        <HudStat icon={Layers} label="level" value={level} tone="accent" />
        <HudStat
          icon={status === "input" ? Hand : Eye}
          value={statusLabel}
          tone={status === "input" ? "go" : undefined}
        />
      </Hud>

      {/* Progress strip: one notch per beat in the sequence, filled as you
          repeat it. Without it a nine-long chain is invisible while you play. */}
      <div className="mt-3 flex gap-1">
        {sequence.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              status === "input" && i < inputIndex ? "bg-game-go" : "bg-secondary"
            }`}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {Array.from({ length: CELLS }).map((_, i) => {
          const lit = flash === i;
          const bad = wrong === i;
          const tone = TONES[i]!;
          return (
            <button
              key={i}
              type="button"
              onPointerDown={() => press(i)}
              disabled={status !== "input"}
              aria-label={`Tile ${i + 1}`}
              className={`aspect-square rounded-md border-2 transition-all duration-100 ${
                bad
                  ? "border-destructive bg-destructive/40"
                  : lit
                    ? "scale-[1.04]"
                    : "border-border bg-surface-raised"
              } ${status === "input" ? "cursor-pointer hover:border-foreground/40 active:scale-95" : "cursor-default"}`}
              style={
                lit && !bad
                  ? {
                      borderColor: `var(--${tone})`,
                      background: `color-mix(in oklab, var(--${tone}) 45%, transparent)`,
                      boxShadow: `0 0 28px -4px var(--${tone})`,
                    }
                  : undefined
              }
            />
          );
        })}
      </div>

      {status === "idle" && (
        <div className="mt-6 text-center">
          <StartButton onClick={start}>Start</StartButton>
          <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <Brain className="h-3 w-3" />
            every tile has its own note — listen, don't just look
          </p>
        </div>
      )}

      {status === "over" && (
        <ResultCard
          score={Math.max(0, sequence.length - 1)}
          unit="levels"
          best={best}
          isBest={isBest}
          detail={`you repeated ${sequence.length - 1} of ${sequence.length}`}
          onRetry={start}
        />
      )}
    </div>
  );
}
