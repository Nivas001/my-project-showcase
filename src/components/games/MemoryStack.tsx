import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw } from "lucide-react";

const CELLS = 9;
const START_DELAY = 700;

export function MemoryStack({ onGameOver }: { onGameOver: (score: number) => void }) {
  const [status, setStatus] = useState<"idle" | "playing" | "input" | "over">("idle");
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [flash, setFlash] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const timeouts = useRef<number[]>([]);

  const clearTimeouts = () => {
    timeouts.current.forEach((t) => clearTimeout(t));
    timeouts.current = [];
  };

  const playSequence = useCallback((seq: number[]) => {
    setStatus("playing");
    setFlash(null);
    setInputIndex(0);
    clearTimeouts();
    const speed = Math.max(350, START_DELAY - (seq.length - 1) * 35);

    seq.forEach((cell, i) => {
      timeouts.current.push(
        window.setTimeout(() => {
          setFlash(cell);
          timeouts.current.push(
            window.setTimeout(() => setFlash(null), speed * 0.55),
          );
        }, i * speed),
      );
    });

    timeouts.current.push(
      window.setTimeout(() => {
        setStatus("input");
      }, seq.length * speed + 150),
    );
  }, []);

  const start = () => {
    clearTimeouts();
    const first = [Math.floor(Math.random() * CELLS)];
    setLevel(1);
    setSequence(first);
    setInputIndex(0);
    setStatus("playing");
    playSequence(first);
  };

  const nextLevel = () => {
    const next = [...sequence, Math.floor(Math.random() * CELLS)];
    setSequence(next);
    setLevel((l) => l + 1);
    setInputIndex(0);
    playSequence(next);
  };

  const handleCell = (cell: number) => {
    if (status !== "input") return;
    if (sequence[inputIndex] !== cell) {
      setStatus("over");
      onGameOver(level);
      return;
    }
    setFlash(cell);
    window.setTimeout(() => setFlash(null), 180);
    const nextIndex = inputIndex + 1;
    if (nextIndex >= sequence.length) {
      setStatus("playing");
      window.setTimeout(nextLevel, 650);
    } else {
      setInputIndex(nextIndex);
    }
  };

  useEffect(() => clearTimeouts, []);

  return (
    <div className="mx-auto w-full max-w-xs">
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span>level: {level}</span>
        <span>{status === "input" ? "your turn" : status === "playing" ? "watch" : "ready"}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {Array.from({ length: CELLS }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleCell(i)}
            disabled={status !== "input"}
            className={`aspect-square rounded-md border border-border transition-all duration-150 ${
              flash === i
                ? "border-accent bg-accent/40 shadow-[0_0_30px_-6px_var(--glow)]"
                : "bg-surface-raised hover:border-primary"
            } ${status !== "input" ? "cursor-default" : "active:scale-95"}`}
            aria-label={`Cell ${i + 1}`}
          />
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
