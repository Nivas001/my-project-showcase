import { useEffect, useRef, useState, type ReactNode } from "react";
import { Flame, Play, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

/* ==========================================================================
 * SHARED ARCADE PARTS
 *
 * The five games were each drawing their own score line, their own Start
 * button and their own "play again" state, slightly differently. These are the
 * pieces they now share, so a change to how a run reads applies everywhere.
 * ======================================================================== */

/* --------------------------------------------------------------------------
 * HUD
 * ------------------------------------------------------------------------ */

export function Hud({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
      {children}
    </div>
  );
}

export function HudStat({
  icon: Icon,
  label,
  value,
  tone,
  pulse,
}: {
  icon?: React.ComponentType<{ className?: string }> | undefined;
  label?: string | undefined;
  value: ReactNode;
  /* `| undefined` throughout: the project compiles with
     exactOptionalPropertyTypes, so a caller passing a computed
     `cond ? "bad" : undefined` needs the property to accept it. */
  tone?: "go" | "warn" | "bad" | "accent" | undefined;
  pulse?: boolean | undefined;
}) {
  const colour =
    tone === "go"
      ? "text-game-go"
      : tone === "warn"
        ? "text-game-warn"
        : tone === "bad"
          ? "text-destructive"
          : tone === "accent"
            ? "text-hog-red"
            : "text-foreground";

  return (
    <span className={cn("inline-flex items-center gap-1.5", pulse && "animate-pulse")}>
      {Icon ? <Icon className="h-3.5 w-3.5 opacity-70" /> : null}
      {label ? <span className="opacity-60">{label}</span> : null}
      <span className={cn("font-bold tabular-nums", colour)}>{value}</span>
    </span>
  );
}

/* --------------------------------------------------------------------------
 * Combo meter
 *
 * A streak is the cheapest way to turn a click-the-thing game into something
 * with a shape: the bar drains on its own, so holding a multiplier is a second
 * skill sitting on top of the first one.
 * ------------------------------------------------------------------------ */

export function ComboMeter({ combo, fill }: { combo: number; fill: number }) {
  if (combo < 2) return <span className="h-1.5" />;
  const tier = combo >= 12 ? "hog-red" : combo >= 6 ? "hog-orange" : "game-go";
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
        <span className="inline-flex items-center gap-1" style={{ color: `var(--${tier})` }}>
          <Flame className="h-3 w-3" />
          {combo}× combo
        </span>
        <span className="text-muted-foreground">
          {combo >= 12 ? "on fire" : combo >= 6 ? "heating up" : "keep going"}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-[width] duration-100 ease-linear"
          style={{ width: `${Math.max(0, Math.min(100, fill))}%`, background: `var(--${tier})` }}
        />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Floating score pops
 *
 * Positioned in percentages of the parent, so the caller does not have to know
 * anything about pixels. The parent needs `relative`.
 * ------------------------------------------------------------------------ */

export type Pop = { id: number; x: number; y: number; text: string; tone?: string };

export function Pops({ pops }: { pops: Pop[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pops.map((p) => (
        <span
          key={p.id}
          className="score-pop absolute font-mono text-sm font-black"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            color: p.tone ? `var(--${p.tone})` : "var(--game-go)",
          }}
        >
          {p.text}
        </span>
      ))}
    </div>
  );
}

/** Adds pops and expires them. Returns [pops, push]. */
export function usePops(ttl = 750) {
  const [pops, setPops] = useState<Pop[]>([]);
  const idRef = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const push = (x: number, y: number, text: string, tone?: string) => {
    const id = ++idRef.current;
    setPops((prev) => [...prev.slice(-11), { id, x, y, text, ...(tone ? { tone } : {}) }]);
    timers.current.push(
      window.setTimeout(() => setPops((prev) => prev.filter((p) => p.id !== id)), ttl),
    );
  };

  return [pops, push] as const;
}

/* --------------------------------------------------------------------------
 * Start / retry
 * ------------------------------------------------------------------------ */

export function StartButton({
  onClick,
  children = "Start",
  retry,
}: {
  onClick: () => void;
  children?: ReactNode;
  retry?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-sm px-6 py-3 text-sm font-semibold transition-all active:scale-95",
        retry
          ? "border-2 border-border text-foreground hover:border-hog-red hover:text-hog-red"
          : "glare-swipe bg-hog-red-deep text-white hover:brightness-110",
      )}
    >
      {retry ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      {children}
    </button>
  );
}

/* --------------------------------------------------------------------------
 * Result card
 *
 * Every game ends the same way now: what you scored, whether it beat your best,
 * and one button. Consistency here is worth more than per-game personality —
 * the personality lives in the roast underneath.
 * ------------------------------------------------------------------------ */

export function ResultCard({
  score,
  unit,
  best,
  isBest,
  detail,
  onRetry,
}: {
  score: number;
  unit: string;
  best?: number | undefined;
  isBest: boolean;
  detail?: ReactNode;
  onRetry: () => void;
}) {
  return (
    <div className="animate-scale-in mt-6 rounded-md border-2 border-border bg-surface-raised p-5 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {isBest ? "new personal best" : "run over"}
      </p>
      <p
        className={cn(
          "mt-2 font-mono text-4xl font-black tabular-nums",
          isBest ? "text-game-go" : "text-foreground",
        )}
      >
        {score}
        <span className="ml-1 text-base font-bold opacity-50">{unit}</span>
      </p>

      {best !== undefined && !isBest ? (
        <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <Trophy className="h-3 w-3" />
          your best: {best} {unit}
        </p>
      ) : null}

      {detail ? <div className="mt-3 font-mono text-[11px] text-muted-foreground">{detail}</div> : null}

      <div className="mt-5">
        <StartButton onClick={onRetry} retry>
          Play again
        </StartButton>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Countdown
 *
 * Three beats between pressing Start and the run beginning. It exists so the
 * first bug does not appear while your hand is still travelling from the
 * button, which was the single most common way to lose a Bug Hunt run.
 * ------------------------------------------------------------------------ */

export function useCountdown(onDone: () => void, tick?: () => void) {
  const [count, setCount] = useState<number | null>(null);
  const doneRef = useRef(onDone);
  const tickRef = useRef(tick);
  doneRef.current = onDone;
  tickRef.current = tick;

  useEffect(() => {
    if (count === null) return;
    if (count === 0) {
      const t = window.setTimeout(() => {
        setCount(null);
        doneRef.current();
      }, 420);
      return () => window.clearTimeout(t);
    }
    tickRef.current?.();
    const t = window.setTimeout(() => setCount((c) => (c === null ? null : c - 1)), 620);
    return () => window.clearTimeout(t);
  }, [count]);

  return { count, begin: () => setCount(3), cancel: () => setCount(null) };
}

export function CountdownOverlay({ count }: { count: number | null }) {
  if (count === null) return null;
  return (
    <div className="absolute inset-0 z-20 grid place-items-center rounded-md bg-background/85 backdrop-blur-sm">
      <span
        key={count}
        className="animate-scale-in font-mono text-6xl font-black tabular-nums text-hog-red"
      >
        {count === 0 ? "GO" : count}
      </span>
    </div>
  );
}
