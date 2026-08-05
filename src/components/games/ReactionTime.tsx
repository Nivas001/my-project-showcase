import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

const ROUNDS = 5;

export function ReactionTime({ onGameOver }: { onGameOver: (score: number) => void }) {
  const [status, setStatus] = useState<"idle" | "waiting" | "ready" | "tooSoon" | "roundDone" | "over">("idle");
  const [round, setRound] = useState(1);
  const [times, setTimes] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);

  const reset = () => {
    setRound(1);
    setTimes([]);
    setCurrentTime(0);
    setStatus("idle");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const start = () => {
    reset();
    setStatus("waiting");
    const delay = 1500 + Math.random() * 2500;
    timeoutRef.current = window.setTimeout(() => {
      setStatus("ready");
      startTimeRef.current = performance.now();
    }, delay);
  };

  const handleClick = () => {
    if (status === "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus("tooSoon");
      return;
    }
    if (status !== "ready") return;
    const time = performance.now() - startTimeRef.current;
    setCurrentTime(Math.round(time));
    setTimes((prev) => [...prev, time]);
    setStatus("roundDone");
  };

  const nextRound = () => {
    if (round >= ROUNDS) {
      setStatus("over");
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / (times.length || 1));
      onGameOver(avg);
      return;
    }
    setRound((r) => r + 1);
    setStatus("waiting");
    const delay = 1500 + Math.random() * 2500;
    timeoutRef.current = window.setTimeout(() => {
      setStatus("ready");
      startTimeRef.current = performance.now();
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const bgColor =
    status === "ready" ? "bg-accent/20" : status === "tooSoon" ? "bg-destructive/20" : "bg-surface-raised";

  const label =
    status === "idle"
      ? "Click Start, then tap when green."
      : status === "waiting"
      ? "Wait for green..."
      : status === "tooSoon"
      ? "Too soon! Click to retry this round."
      : status === "ready"
      ? "Tap now!"
      : status === "roundDone"
      ? `${currentTime} ms — click to continue.`
      : `Average: ${Math.round(times.reduce((a, b) => a + b, 0) / (times.length || 1))} ms`;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span>round {Math.min(round, ROUNDS)} / {ROUNDS}</span>
        <span>
          {times.length > 0 ? `avg: ${Math.round(times.reduce((a, b) => a + b, 0) / times.length)} ms` : "avg: —"}
        </span>
      </div>

      <button
        type="button"
        onClick={status === "idle" || status === "over" ? start : status === "tooSoon" ? nextRound : handleClick}
        disabled={status === "waiting" || status === "roundDone"}
        className={`mt-4 flex h-64 w-full flex-col items-center justify-center rounded-md border border-border transition-colors active:scale-[0.99] ${bgColor}`}
      >
        <span className="font-mono text-sm text-foreground">{label}</span>
        {status === "ready" && (
          <span className="mt-2 font-mono text-xs text-accent">tap anywhere</span>
        )}
      </button>

      {status === "roundDone" && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={nextRound}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Next round
          </button>
        </div>
      )}

      {status === "over" && (
        <div className="mt-4 text-center">
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
