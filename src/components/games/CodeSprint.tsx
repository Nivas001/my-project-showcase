import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, Gauge, Target, Terminal } from "lucide-react";
import { useArcadeAudio } from "@/lib/arcade/use-arcade-audio";
import { readBest, recordBest } from "@/lib/arcade/best";
import { CountdownOverlay, Hud, HudStat, ResultCard, StartButton, useCountdown } from "./bits";

/* ==========================================================================
 * CODE SPRINT
 *
 * It is called Code Sprint and it used to hand you "the quick brown fox". It
 * now hands you code — brackets, semicolons and camelCase, which is where the
 * difficulty in typing code actually lives.
 *
 * Three scoring bugs went with the pangrams:
 *
 *   - WPM was measured against the current line only while the clock ran from
 *     the start of the run, so it collapsed every time a line was completed.
 *   - The clock started on Start rather than on the first keystroke, so the
 *     travel time from button to keyboard counted against you.
 *   - Corrections were not counted, so backspacing a typo cost nothing.
 *
 * Score is net WPM: correct characters ÷ 5, over elapsed minutes.
 * ======================================================================== */

const LINES = [
  "const [state, setState] = useState<number>(0);",
  "export async function load({ params }) { return db.find(params.id); }",
  "if (!user?.permissions.includes('admin')) throw new Error('nope');",
  "const sum = items.reduce((acc, x) => acc + x.price * x.qty, 0);",
  "await supabase.from('projects').select('*').eq('featured', true);",
  "type Props = { items: Item[]; onSelect: (id: string) => void };",
  "git commit -m 'fix: stop the timer leaking on unmount'",
  "SELECT id, title FROM projects WHERE live_url IS NOT NULL;",
  "useEffect(() => { const t = setTimeout(tick, 250); return () => clearTimeout(t); }, []);",
  "className={cn('flex items-center', isActive && 'text-hog-red')}",
  "for (let i = 0; i < grid.length; i++) render(grid[i], i % cols);",
  "const { data, error } = await fetch(url).then((r) => r.json());",
] as const;

const DURATION = 45;

export function CodeSprint({ onGameOver }: { onGameOver: (score: number) => void }) {
  const audio = useArcadeAudio();
  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");
  const [target, setTarget] = useState<string>(LINES[0]);
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [lines, setLines] = useState(0);
  const [shake, setShake] = useState(false);
  const [best, setBest] = useState<number | undefined>(undefined);
  const [isBest, setIsBest] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef(0);
  const startedAt = useRef(0);
  /** Null until the first keystroke — the clock does not run before you do. */
  const firstKey = useRef<number | null>(null);
  const correctRef = useRef(0);
  const strokesRef = useRef(0);
  const wpmRef = useRef(0);
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => setBest(readBest("code-sprint")), []);

  const nextLine = useCallback((current?: string) => {
    let pick = current;
    // Never hand back the same line twice in a row.
    while (pick === current) pick = LINES[Math.floor(Math.random() * LINES.length)];
    setTarget(pick ?? LINES[0]);
    setTyped("");
  }, []);

  const end = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setStatus("over");
    const final = wpmRef.current;
    setBest(readBest("code-sprint"));
    const beat = recordBest("code-sprint", final);
    setIsBest(beat);
    audio.play(beat ? "highscore" : "gameover");
    onGameOver(final);
  }, [audio, onGameOver]);

  const beginRun = useCallback(() => {
    setStatus("playing");
    startedAt.current = performance.now();
    firstKey.current = null;
    inputRef.current?.focus();

    const loop = () => {
      const left = DURATION - (performance.now() - startedAt.current) / 1000;
      setTimeLeft(Math.max(0, left));
      if (left <= 0) {
        end();
        return;
      }

      // Live net WPM, recomputed every frame so the number moves while you type
      // rather than jumping once per line.
      if (firstKey.current !== null) {
        const minutes = (performance.now() - firstKey.current) / 60000;
        const next = minutes > 0 ? Math.round(correctRef.current / 5 / minutes) : 0;
        wpmRef.current = next;
        setWpm(next);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [end]);

  const { count, begin } = useCountdown(beginRun, () => audio.play("tick"));

  const start = () => {
    audio.play("start");
    correctRef.current = 0;
    strokesRef.current = 0;
    wpmRef.current = 0;
    setWpm(0);
    setAccuracy(100);
    setLines(0);
    setIsBest(false);
    setTimeLeft(DURATION);
    nextLine();
    begin();
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  /* ---- typing ---------------------------------------------------------- */

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (statusRef.current !== "playing") return;

    if (e.key === "Backspace") {
      e.preventDefault();
      setTyped((prev) => {
        if (prev.length === 0) return prev;
        // Un-count a character that was right before it is removed, so a
        // backspaced typo cannot be paid for twice.
        if (prev[prev.length - 1] === target[prev.length - 1]) {
          correctRef.current = Math.max(0, correctRef.current - 1);
        }
        return prev.slice(0, -1);
      });
      audio.play("blip");
      return;
    }

    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();

    const next = typed + e.key;
    if (next.length > target.length) return;

    strokesRef.current += 1;
    const right = e.key === target[typed.length];
    if (right) {
      correctRef.current += 1;
      audio.play("type");
    } else {
      audio.play("error");
      setShake(true);
      window.setTimeout(() => setShake(false), 160);
    }

    if (firstKey.current === null) firstKey.current = performance.now();
    setTyped(next);
    setAccuracy(Math.round((correctRef.current / strokesRef.current) * 100));

    if (next.length === target.length) {
      // Only a perfectly typed line counts as cleared; the rest is still worth
      // the characters you got right.
      if (next === target) {
        setLines((l) => l + 1);
        audio.play("levelup");
      } else {
        audio.play("miss");
      }
      nextLine(target);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Hud>
        <HudStat
          icon={Clock}
          value={`${Math.ceil(timeLeft)}s`}
          tone={timeLeft <= 5 ? "bad" : undefined}
          pulse={timeLeft <= 5 && status === "playing"}
        />
        <HudStat icon={Gauge} label="wpm" value={wpm} tone="accent" />
        <HudStat
          icon={Target}
          label="acc"
          value={`${accuracy}%`}
          tone={accuracy >= 95 ? "go" : accuracy >= 85 ? "warn" : "bad"}
        />
        <HudStat icon={Terminal} label="lines" value={lines} />
      </Hud>

      <div className="relative mt-4">
        <CountdownOverlay count={count} />

        {/* Clicking anywhere on the code panel returns focus to the hidden
            input — the panel is the thing that looks typeable. */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => inputRef.current?.focus()}
          className={`block w-full cursor-text rounded-md border-2 border-border bg-surface-raised p-5 text-left font-mono text-[15px] leading-loose sm:p-6 sm:text-lg ${
            shake ? "fear-shake" : ""
          }`}
        >
          {target.split("").map((char, i) => {
            const done = i < typed.length;
            const ok = typed[i] === char;
            const atCursor = i === typed.length && status === "playing";
            return (
              <span
                key={i}
                className={
                  done
                    ? ok
                      ? "text-game-go"
                      : "rounded-[2px] bg-destructive/25 text-destructive"
                    : atCursor
                      ? "rounded-[2px] bg-hog-red/70 text-white"
                      : "text-muted-foreground"
                }
              >
                {char === " " && done && !ok ? "␣" : char}
              </span>
            );
          })}
        </button>

        <input
          ref={inputRef}
          type="text"
          value=""
          onKeyDown={onKeyDown}
          onChange={() => {}}
          disabled={status !== "playing"}
          aria-label="Type the code shown above"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
        />
      </div>

      {status === "playing" ? (
        <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
          keep typing — a finished line is replaced automatically
        </p>
      ) : null}

      {status === "idle" && (
        <div className="mt-5 text-center">
          <StartButton onClick={start}>Start sprint</StartButton>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            {DURATION} seconds of real code · scored on net WPM
          </p>
        </div>
      )}

      {status === "over" && (
        <ResultCard
          score={wpm}
          unit="wpm"
          best={best}
          isBest={isBest}
          detail={`${accuracy}% accuracy · ${lines} line${lines === 1 ? "" : "s"} clean`}
          onRetry={start}
        />
      )}
    </div>
  );
}
