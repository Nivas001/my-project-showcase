import { useEffect, useRef, useState, useCallback } from "react";
import { Bug, Play, RotateCcw, Clock } from "lucide-react";

const GRID_SIZE = 4;
const GAME_DURATION = 60;

export function BugHunt({ onGameOver }: { onGameOver: (score: number) => void }) {
  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [peekMs, setPeekMs] = useState(1500);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const spawnBug = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);

    const cell = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
    setActiveCell(cell);
    hideRef.current = window.setTimeout(() => {
      setActiveCell(null);
      timerRef.current = window.setTimeout(() => spawnBug(), 400);
    }, peekMs);
  }, [peekMs]);

  const start = () => {
    setStatus("playing");
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setPeekMs(1500);
    spawnBug();
  };

  const end = () => {
    setStatus("over");
    setActiveCell(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
    onGameOver(score);
  };

  useEffect(() => {
    if (status !== "playing") return;
    const interval = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(interval);
          end();
          return 0;
        }
        if (t % 10 === 0) setPeekMs((ms) => Math.max(650, ms - 120));
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const whack = (index: number) => {
    if (status !== "playing" || activeCell !== index) return;
    setScore((s) => s + 1);
    setActiveCell(null);
    if (hideRef.current) clearTimeout(hideRef.current);
    timerRef.current = window.setTimeout(() => spawnBug(), 250);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {timeLeft}s
        </span>
        <span>score: {score}</span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => whack(i)}
            className={`relative aspect-square rounded-md border border-border bg-surface-raised transition-all duration-150 active:scale-95 ${
              activeCell === i ? "border-accent bg-accent/20 shadow-[0_0_20px_-4px_var(--glow)]" : "hover:border-primary"
            }`}
            aria-label={`Cell ${i + 1}`}
          >
            {activeCell === i && (
              <Bug className="absolute inset-0 m-auto h-8 w-8 animate-[game-pop_0.2s_ease-out] text-accent" />
            )}
          </button>
        ))}
      </div>

      {status === "idle" && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={start}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Play className="h-4 w-4" /> Start
          </button>
        </div>
      )}

      {status === "over" && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={start}
            className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-2.5 text-sm transition-colors hover:border-primary"
          >
            <RotateCcw className="h-4 w-4" /> Play again
          </button>
        </div>
      )}
    </div>
  );
}
