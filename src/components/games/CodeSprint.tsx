import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Clock } from "lucide-react";

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump.",
  "Sphinx of black quartz judge my vow.",
  "Two driven jocks help fax my big quiz.",
  "The five boxing wizards jump quickly.",
  "Bright vixens jump dozy fowl quack.",
  "A wizard's job is to vex chumps quickly.",
];

const GAME_DURATION = 60;

export function CodeSprint({ onGameOver }: { onGameOver: (score: number) => void }) {
  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");
  const [target, setTarget] = useState(SENTENCES[0]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [stats, setStats] = useState({ correct: 0, total: 0, wpm: 0 });
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setStatus("playing");
    setTarget(SENTENCES[Math.floor(Math.random() * SENTENCES.length)]);
    setInput("");
    setStats({ correct: 0, total: 0, wpm: 0 });
    setTimeLeft(GAME_DURATION);
    startTimeRef.current = performance.now();
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          finish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const finish = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setStatus("over");
    onGameOver(stats.wpm);
  };

  const nextSentence = () => {
    setInput("");
    setTarget(SENTENCES[Math.floor(Math.random() * SENTENCES.length)]);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (status !== "playing") return;
    if (e.key === "Backspace") {
      setInput((prev) => prev.slice(0, -1));
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const next = input + e.key;
      if (next.length > target.length) return;
      setInput(next);

      const correctCount = next.split("").filter((c, i) => c === target[i]).length;
      const total = next.length;
      const elapsed = (performance.now() - (startTimeRef.current ?? performance.now())) / 1000 / 60;
      const grossWpm = elapsed > 0 ? total / 5 / elapsed : 0;
      const accuracy = total > 0 ? correctCount / total : 0;
      const wpm = Math.round(grossWpm * accuracy);
      setStats({ correct: correctCount, total, wpm });

      if (next.length === target.length) {
        nextSentence();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> {timeLeft}s
        </span>
        <span>wpm: {stats.wpm}</span>
      </div>

      <div className="relative mt-4 rounded-md border border-border bg-card p-6 font-mono text-lg leading-relaxed tracking-tight">
        {target.split("").map((char, i) => {
          let cls = "text-muted-foreground";
          if (i < input.length) {
            cls = input[i] === char ? "text-accent" : "text-destructive";
          } else if (i === input.length && status === "playing") {
            cls = "border-b-2 border-accent text-foreground animate-pulse";
          } else {
            cls = "text-foreground";
          }
          return (
            <span key={i} className={cls}>
              {char}
            </span>
          );
        })}
      </div>

      <input
        type="text"
        value={input}
        onKeyDown={handleKey}
        onChange={() => {}}
        readOnly
        disabled={status !== "playing"}
        placeholder={status === "idle" ? "Press Start, then type here" : "Type the sentence..."}
        className="mt-4 w-full rounded-md border border-border bg-background px-4 py-3 font-mono text-sm outline-none focus:border-primary"
        autoFocus={status === "playing"}
      />

      {status === "idle" && (
        <div className="mt-4 text-center">
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
