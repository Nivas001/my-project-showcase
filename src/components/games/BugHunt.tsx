import { useCallback, useEffect, useRef, useState } from "react";
import { Bug, Clock, Skull, Sparkles, Target } from "lucide-react";
import { useArcadeAudio } from "@/lib/arcade/use-arcade-audio";
import { readBest, recordBest } from "@/lib/arcade/best";
import {
  ComboMeter,
  CountdownOverlay,
  Hud,
  HudStat,
  Pops,
  ResultCard,
  StartButton,
  usePops,
  useCountdown,
} from "./bits";

/* ==========================================================================
 * BUG HUNT
 *
 * Whack-a-mole was the starting point, and on its own it is a game you play
 * once. Three things give it a reason to exist for a second run:
 *
 *   combo     consecutive hits multiply, and the meter drains on its own, so
 *             the real skill is chaining rather than reacting
 *   variety   a rare golden bug is worth five, and a "prod deploy" tile
 *             punishes you for swinging at everything
 *   pressure  spawn rate and peek time both tighten every ten seconds, and
 *             past halfway two things can be on the board at once
 * ======================================================================== */

const GRID = 4;
const CELLS = GRID * GRID;
const DURATION = 45;
/** Combo drains over this window; one hit inside it keeps the chain alive. */
const COMBO_WINDOW = 2200;

type Critter = { cell: number; kind: "bug" | "gold" | "prod"; born: number; ttl: number };

export function BugHunt({ onGameOver }: { onGameOver: (score: number) => void }) {
  const audio = useArcadeAudio();
  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [critters, setCritters] = useState<Critter[]>([]);
  const [combo, setCombo] = useState(0);
  const [comboFill, setComboFill] = useState(0);
  const [hits, setHits] = useState(0);
  const [swings, setSwings] = useState(0);
  const [best, setBest] = useState<number | undefined>(undefined);
  const [isBest, setIsBest] = useState(false);
  const [pops, pushPop] = usePops();

  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const lastHitRef = useRef(0);
  const spawnRef = useRef<number | null>(null);
  const rafRef = useRef(0);
  const elapsedRef = useRef(0);

  useEffect(() => setBest(readBest("bug-hunt")), []);

  /* ---- spawning -------------------------------------------------------- */

  const spawn = useCallback(() => {
    const t = elapsedRef.current;
    // Peek time falls from 1.4s to 0.58s across the run.
    const ttl = Math.max(580, 1400 - t * 19);
    // Past the halfway mark two can share the board.
    const maxAlive = t > DURATION * 0.45 ? 2 : 1;

    setCritters((prev) => {
      const alive = prev.filter((c) => performance.now() - c.born < c.ttl);
      if (alive.length >= maxAlive) return alive;

      const taken = new Set(alive.map((c) => c.cell));
      const free: number[] = [];
      for (let i = 0; i < CELLS; i++) if (!taken.has(i)) free.push(i);
      const cell = free[Math.floor(Math.random() * free.length)];
      if (cell === undefined) return alive;

      const roll = Math.random();
      // Prod tiles only start appearing once the player has the rhythm.
      const kind: Critter["kind"] =
        roll < 0.08 ? "gold" : roll < (t > 8 ? 0.24 : 0.08) ? "prod" : "bug";

      return [...alive, { cell, kind, born: performance.now(), ttl }];
    });

    const gap = Math.max(240, 720 - t * 9);
    spawnRef.current = window.setTimeout(spawn, gap + Math.random() * 180);
  }, []);

  /* ---- run loop -------------------------------------------------------- */

  const end = useCallback(() => {
    if (spawnRef.current) window.clearTimeout(spawnRef.current);
    cancelAnimationFrame(rafRef.current);
    setStatus("over");
    setCritters([]);
    const final = scoreRef.current;
    // Read before writing: the result card wants the bar the player was trying
    // to clear, not the one they just set.
    setBest(readBest("bug-hunt"));
    const beat = recordBest("bug-hunt", final);
    setIsBest(beat);
    audio.play(beat ? "highscore" : "gameover");
    onGameOver(final);
  }, [audio, onGameOver]);

  const beginRun = useCallback(() => {
    setStatus("playing");
    elapsedRef.current = 0;
    const startedAt = performance.now();

    // One rAF drives the clock, the combo drain and critter expiry together.
    // Three separate intervals used to leave the timer and the board a frame or
    // two out of sync, which reads as a bug the moment anyone notices it.
    const loop = () => {
      const now = performance.now();
      const elapsed = (now - startedAt) / 1000;
      elapsedRef.current = elapsed;

      const left = DURATION - elapsed;
      setTimeLeft(Math.max(0, left));
      if (left <= 0) {
        end();
        return;
      }
      if (left <= 5 && Math.floor(left) !== Math.floor(left + 1 / 60)) audio.play("tick");

      setCritters((prev) => prev.filter((c) => now - c.born < c.ttl));

      if (comboRef.current > 0) {
        const since = now - lastHitRef.current;
        if (since > COMBO_WINDOW) {
          comboRef.current = 0;
          setCombo(0);
          setComboFill(0);
        } else {
          setComboFill(100 - (since / COMBO_WINDOW) * 100);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    spawn();
  }, [audio, end, spawn]);

  const { count, begin } = useCountdown(beginRun, () => audio.play("tick"));

  const start = () => {
    audio.play("start");
    scoreRef.current = 0;
    comboRef.current = 0;
    lastHitRef.current = 0;
    setScore(0);
    setCombo(0);
    setComboFill(0);
    setHits(0);
    setSwings(0);
    setIsBest(false);
    setTimeLeft(DURATION);
    setCritters([]);
    begin();
  };

  useEffect(
    () => () => {
      if (spawnRef.current) window.clearTimeout(spawnRef.current);
      cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  /* ---- input ----------------------------------------------------------- */

  const swing = (index: number) => {
    if (status !== "playing") return;
    setSwings((s) => s + 1);

    const target = critters.find((c) => c.cell === index);
    const x = ((index % GRID) + 0.5) * (100 / GRID);
    const y = (Math.floor(index / GRID) + 0.5) * (100 / GRID);

    if (!target || target.kind === "prod") {
      // Swinging at nothing, or at a deploy, both break the chain.
      comboRef.current = 0;
      setCombo(0);
      setComboFill(0);
      if (target?.kind === "prod") {
        scoreRef.current = Math.max(0, scoreRef.current - 3);
        setScore(scoreRef.current);
        setCritters((prev) => prev.filter((c) => c.cell !== index));
        audio.play("hurt");
        pushPop(x, y, "-3", "destructive");
      } else {
        audio.play("miss");
      }
      return;
    }

    const now = performance.now();
    const chained = now - lastHitRef.current < COMBO_WINDOW;
    comboRef.current = chained ? comboRef.current + 1 : 1;
    lastHitRef.current = now;
    setCombo(comboRef.current);
    setComboFill(100);

    const multiplier = 1 + Math.floor(comboRef.current / 4);
    const base = target.kind === "gold" ? 5 : 1;
    const gained = base * multiplier;

    scoreRef.current += gained;
    setScore(scoreRef.current);
    setHits((h) => h + 1);
    setCritters((prev) => prev.filter((c) => c.cell !== index));

    audio.play(comboRef.current > 1 ? "combo" : "hit", comboRef.current);
    if (target.kind === "gold") audio.play("coin");
    pushPop(x, y, `+${gained}`, target.kind === "gold" ? "hog-yellow" : undefined);
  };

  const accuracy = swings > 0 ? Math.round((hits / swings) * 100) : 100;

  return (
    <div className="mx-auto w-full max-w-md">
      <Hud>
        <HudStat
          icon={Clock}
          value={`${Math.ceil(timeLeft)}s`}
          tone={timeLeft <= 5 ? "bad" : undefined}
          pulse={timeLeft <= 5 && status === "playing"}
        />
        <HudStat icon={Target} label="acc" value={`${accuracy}%`} />
        <HudStat label="score" value={score} tone="accent" />
      </Hud>

      <ComboMeter combo={combo} fill={comboFill} />

      <div className="relative mt-4">
        <Pops pops={pops} />
        <CountdownOverlay count={count} />

        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: CELLS }).map((_, i) => {
            const critter = critters.find((c) => c.cell === i);
            return (
              <button
                key={i}
                type="button"
                onPointerDown={() => swing(i)}
                disabled={status !== "playing"}
                className={`relative aspect-square rounded-md border-2 transition-all duration-100 active:scale-[0.93] ${
                  critter?.kind === "gold"
                    ? "border-hog-yellow bg-hog-yellow/20 shadow-[0_0_24px_-4px_var(--hog-yellow)]"
                    : critter?.kind === "prod"
                      ? "border-destructive bg-destructive/15"
                      : critter
                        ? "border-game-go bg-game-go/15 shadow-[0_0_20px_-6px_var(--game-go)]"
                        : "border-border bg-surface-raised hover:border-foreground/40"
                }`}
                aria-label={`Cell ${i + 1}`}
              >
                {critter?.kind === "gold" ? (
                  <Sparkles className="animate-[game-pop_0.18s_ease-out] absolute inset-0 m-auto h-8 w-8 text-hog-yellow" />
                ) : critter?.kind === "prod" ? (
                  <Skull className="animate-[game-pop_0.18s_ease-out] absolute inset-0 m-auto h-8 w-8 text-destructive" />
                ) : critter ? (
                  <Bug className="animate-[game-pop_0.18s_ease-out] absolute inset-0 m-auto h-8 w-8 text-game-go" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {status === "idle" && (
        <div className="mt-6 text-center">
          <StartButton onClick={start}>Start hunting</StartButton>
          <ul className="mx-auto mt-4 max-w-xs space-y-1 text-left font-mono text-[11px] text-muted-foreground">
            <li>
              <Bug className="mr-1.5 inline h-3 w-3 text-game-go" />
              bug — +1, more with a combo running
            </li>
            <li>
              <Sparkles className="mr-1.5 inline h-3 w-3 text-hog-yellow" />
              golden — worth five of them
            </li>
            <li>
              <Skull className="mr-1.5 inline h-3 w-3 text-destructive" />
              prod deploy — hit it and you lose three
            </li>
          </ul>
        </div>
      )}

      {status === "over" && (
        <ResultCard
          score={score}
          unit="bugs"
          best={best}
          isBest={isBest}
          detail={`${hits} hits · ${accuracy}% accuracy`}
          onRetry={start}
        />
      )}
    </div>
  );
}
