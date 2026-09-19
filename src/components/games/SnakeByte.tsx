import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Database,
  Layers,
  Pause,
  Zap,
} from "lucide-react";
import { useArcadeAudio } from "@/lib/arcade/use-arcade-audio";
import { readBest, recordBest } from "@/lib/arcade/best";
import { CountdownOverlay, Hud, HudStat, ResultCard, StartButton, useCountdown } from "./bits";

/* ==========================================================================
 * SNAKE BYTE
 *
 * Snake, with three changes that turn it from a demo into a game:
 *
 *   interpolation  logic still ticks on a fixed grid, but rendering happens
 *                  every frame and lerps between the last two states. The rules
 *                  are unchanged; it simply stops looking like a slideshow.
 *   levels         every eight bytes the board gains a memory block and the
 *                  tick shortens. The arena you finish in is not the one you
 *                  started in.
 *   pickups        a cache byte is worth five and trims your tail; a leak byte
 *                  is worth two and costs you three segments of length.
 *
 * Colours are read from the act's custom properties rather than hardcoded, so
 * the board belongs to the same palette as the page around it.
 * ======================================================================== */

const COLS = 20;
const ROWS = 20;
const START_MS = 150;
const MIN_MS = 68;

type Vec = { x: number; y: number };
type PickupKind = "byte" | "cache" | "leak";
type Pickup = Vec & { kind: PickupKind };

type Palette = {
  bg: string;
  grid: string;
  head: string;
  body: string;
  food: string;
  cache: string;
  leak: string;
  wall: string;
};

const FALLBACK: Palette = {
  bg: "#0d0d12",
  grid: "rgba(255,255,255,0.05)",
  head: "#e8653a",
  body: "#b8492a",
  food: "#3ecf8e",
  cache: "#e3b341",
  leak: "#8b5cf6",
  wall: "#3a3a44",
};

function readPalette(el: HTMLElement | null): Palette {
  if (!el || typeof window === "undefined") return FALLBACK;
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    bg: v("--surface-raised", FALLBACK.bg),
    grid: "rgba(255,255,255,0.045)",
    head: v("--hog-red", FALLBACK.head),
    body: v("--hog-red-deep", FALLBACK.body),
    food: v("--game-go", FALLBACK.food),
    cache: v("--hog-yellow", FALLBACK.cache),
    leak: v("--hog-purple", FALLBACK.leak),
    wall: v("--border", FALLBACK.wall),
  };
}

const eq = (a: Vec, b: Vec) => a.x === b.x && a.y === b.y;

export function SnakeByte({ onGameOver }: { onGameOver: (score: number) => void }) {
  const audio = useArcadeAudio();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [status, setStatus] = useState<"idle" | "playing" | "paused" | "over">("idle");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [length, setLength] = useState(3);
  const [best, setBest] = useState<number | undefined>(undefined);
  const [isBest, setIsBest] = useState(false);

  const statusRef = useRef<typeof status>("idle");
  statusRef.current = status;
  /* setStatus is async; the loop needs to know it crashed *this* frame, before
     React has re-rendered. statusRef alone would run one more tick. */
  const overRef = useRef(false);

  const paletteRef = useRef<Palette>(FALLBACK);
  const rafRef = useRef(0);
  const lastTickRef = useRef(0);
  const accRef = useRef(0);

  const game = useRef({
    snake: [
      { x: 6, y: 10 },
      { x: 5, y: 10 },
      { x: 4, y: 10 },
    ] as Vec[],
    prev: [] as Vec[],
    dir: { x: 1, y: 0 } as Vec,
    /** Queued turns. A queue (not a single value) means two fast keypresses
        inside one tick both land, which is how a 90° flick is meant to feel. */
    queue: [] as Vec[],
    pickup: { x: 13, y: 10, kind: "byte" } as Pickup,
    walls: [] as Vec[],
    score: 0,
    level: 1,
    ms: START_MS,
    eaten: 0,
  });

  useEffect(() => setBest(readBest("snake-byte")), []);
  useEffect(() => {
    paletteRef.current = readPalette(wrapRef.current);
  }, []);

  /* ---- placement ------------------------------------------------------- */

  const freeCell = useCallback((): Vec => {
    const g = game.current;
    let pos: Vec;
    let guard = 0;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      guard++;
    } while (
      guard < 400 &&
      (g.snake.some((s) => eq(s, pos)) || g.walls.some((w) => eq(w, pos)))
    );
    return pos;
  }, []);

  const placePickup = useCallback((): Pickup => {
    const roll = Math.random();
    const kind: PickupKind = roll < 0.1 ? "cache" : roll < 0.2 ? "leak" : "byte";
    return { ...freeCell(), kind };
  }, [freeCell]);

  /* ---- drawing --------------------------------------------------------- */

  const draw = useCallback((alpha: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const size = canvas.width;
    const cell = size / COLS;
    const p = paletteRef.current;
    const g = game.current;

    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = p.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.round(i * cell) + 0.5, 0);
      ctx.lineTo(Math.round(i * cell) + 0.5, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, Math.round(i * cell) + 0.5);
      ctx.lineTo(size, Math.round(i * cell) + 0.5);
      ctx.stroke();
    }

    // Memory blocks.
    ctx.fillStyle = p.wall;
    for (const w of g.walls) {
      ctx.fillRect(w.x * cell + 1, w.y * cell + 1, cell - 2, cell - 2);
    }

    // Pickup, with a slow breath so it reads as alive.
    const pulse = 0.82 + Math.sin(performance.now() / 260) * 0.14;
    const colour = g.pickup.kind === "cache" ? p.cache : g.pickup.kind === "leak" ? p.leak : p.food;
    ctx.fillStyle = colour;
    ctx.shadowColor = colour;
    ctx.shadowBlur = 16;
    const r = (cell / 2 - 3) * pulse;
    ctx.beginPath();
    ctx.arc(g.pickup.x * cell + cell / 2, g.pickup.y * cell + cell / 2, Math.max(2, r), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Body, interpolated between the previous tick and this one.
    for (let i = g.snake.length - 1; i >= 0; i--) {
      const cur = g.snake[i]!;
      const was = g.prev[i] ?? cur;
      // A wrap would lerp the whole way across the board; snap instead.
      const jump = Math.abs(cur.x - was.x) > 1 || Math.abs(cur.y - was.y) > 1;
      const x = jump ? cur.x : was.x + (cur.x - was.x) * alpha;
      const y = jump ? cur.y : was.y + (cur.y - was.y) * alpha;

      const head = i === 0;
      ctx.fillStyle = head ? p.head : p.body;
      ctx.globalAlpha = head ? 1 : Math.max(0.42, 1 - i / (g.snake.length * 1.4));
      if (head) {
        ctx.shadowColor = p.head;
        ctx.shadowBlur = 18;
      }
      const inset = head ? 1.5 : 2.5;
      const radius = Math.max(2, cell * 0.22);
      ctx.beginPath();
      ctx.roundRect(x * cell + inset, y * cell + inset, cell - inset * 2, cell - inset * 2, radius);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }, []);

  /* ---- simulation ------------------------------------------------------ */

  const end = useCallback(() => {
    overRef.current = true;
    cancelAnimationFrame(rafRef.current);
    setStatus("over");
    const final = game.current.score;
    setBest(readBest("snake-byte"));
    const beat = recordBest("snake-byte", final);
    setIsBest(beat);
    audio.play("crash");
    window.setTimeout(() => audio.play(beat ? "highscore" : "gameover"), 260);
    onGameOver(final);
  }, [audio, onGameOver]);

  const step = useCallback(() => {
    const g = game.current;
    g.prev = g.snake.map((s) => ({ ...s }));

    // Take the next queued turn that is not a reversal.
    while (g.queue.length > 0) {
      const next = g.queue.shift()!;
      if (next.x === -g.dir.x && next.y === -g.dir.y) continue;
      g.dir = next;
      break;
    }

    const head = g.snake[0]!;
    const nx = head.x + g.dir.x;
    const ny = head.y + g.dir.y;

    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return end();
    if (g.walls.some((w) => w.x === nx && w.y === ny)) return end();
    // The tail tip vacates this tick, so running into it is legal.
    if (g.snake.slice(0, -1).some((s) => s.x === nx && s.y === ny)) return end();

    g.snake.unshift({ x: nx, y: ny });

    if (nx === g.pickup.x && ny === g.pickup.y) {
      const kind = g.pickup.kind;
      g.eaten += 1;

      if (kind === "cache") {
        g.score += 5;
        // Worth five, and trims three segments — a reward that also buys room.
        for (let i = 0; i < 3 && g.snake.length > 4; i++) g.snake.pop();
        audio.play("coin");
      } else if (kind === "leak") {
        g.score += 2;
        for (let i = 0; i < 3; i++) g.snake.push({ ...g.snake[g.snake.length - 1]! });
        audio.play("power");
      } else {
        g.score += 1;
        audio.play("hit", g.eaten);
      }

      // Level step: faster tick, one more memory block in the way.
      if (g.eaten % 8 === 0) {
        g.level += 1;
        g.ms = Math.max(MIN_MS, g.ms - 9);
        const block = freeCell();
        // Never wall in the square directly ahead of the head.
        if (!(block.x === nx + g.dir.x && block.y === ny + g.dir.y)) g.walls.push(block);
        audio.play("levelup");
        setLevel(g.level);
      }

      g.pickup = placePickup();
      setScore(g.score);
    } else {
      g.snake.pop();
    }

    setLength(g.snake.length);
  }, [audio, end, freeCell, placePickup]);

  /* ---- loop ------------------------------------------------------------ */

  const beginRun = useCallback(() => {
    setStatus("playing");
    lastTickRef.current = performance.now();
    accRef.current = 0;

    const frame = (now: number) => {
      if (overRef.current) return;
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      if (statusRef.current === "playing") {
        accRef.current += dt;
        // Cap the catch-up: a backgrounded tab must not resume by running
        // forty ticks in one frame and killing a snake nobody was driving.
        if (accRef.current > game.current.ms * 4) accRef.current = game.current.ms;
        while (accRef.current >= game.current.ms) {
          accRef.current -= game.current.ms;
          step();
          if (overRef.current) return;
        }
      }

      draw(Math.min(1, accRef.current / game.current.ms));
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
  }, [draw, step]);

  const { count, begin } = useCountdown(beginRun, () => audio.play("tick"));

  const start = () => {
    audio.play("start");
    overRef.current = false;
    game.current = {
      snake: [
        { x: 6, y: 10 },
        { x: 5, y: 10 },
        { x: 4, y: 10 },
      ],
      prev: [],
      dir: { x: 1, y: 0 },
      queue: [],
      pickup: { x: 13, y: 10, kind: "byte" },
      walls: [],
      score: 0,
      level: 1,
      ms: START_MS,
      eaten: 0,
    };
    paletteRef.current = readPalette(wrapRef.current);
    setScore(0);
    setLevel(1);
    setLength(3);
    setIsBest(false);
    begin();
  };

  // First paint of the idle board.
  useEffect(() => {
    draw(1);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  /* ---- input ----------------------------------------------------------- */

  const turn = useCallback((x: number, y: number) => {
    const g = game.current;
    if (g.queue.length < 2) g.queue.push({ x, y });
  }, []);

  const togglePause = useCallback(() => {
    setStatus((s) => (s === "playing" ? "paused" : s === "paused" ? "playing" : s));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (statusRef.current !== "playing" && statusRef.current !== "paused") return;
      const k = e.key.toLowerCase();
      const map: Record<string, Vec> = {
        arrowup: { x: 0, y: -1 },
        w: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 },
        s: { x: 0, y: 1 },
        arrowleft: { x: -1, y: 0 },
        a: { x: -1, y: 0 },
        arrowright: { x: 1, y: 0 },
        d: { x: 1, y: 0 },
      };
      if (map[k]) {
        e.preventDefault();
        turn(map[k]!.x, map[k]!.y);
      } else if (k === " " || k === "p") {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [turn, togglePause]);

  // Swipe. The board is square and thumb-sized on a phone; a D-pad below it is
  // a fallback, not the primary control.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    let sx = 0;
    let sy = 0;
    const down = (e: PointerEvent) => {
      sx = e.clientX;
      sy = e.clientY;
    };
    const up = (e: PointerEvent) => {
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
      if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
      else turn(0, dy > 0 ? 1 : -1);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
    };
  }, [turn]);

  const dpad = (dx: number, dy: number) => () => turn(dx, dy);

  return (
    <div ref={wrapRef} className="mx-auto w-full max-w-sm">
      <Hud>
        <HudStat icon={Database} label="bytes" value={score} tone="accent" />
        <HudStat icon={Layers} label="lvl" value={level} />
        <HudStat icon={Zap} label="len" value={length} />
      </Hud>

      <div className="relative mt-4">
        <CountdownOverlay count={count} />

        {status === "paused" && (
          <button
            type="button"
            onClick={togglePause}
            className="absolute inset-0 z-20 grid place-items-center rounded-md bg-background/85 font-mono text-sm uppercase tracking-[0.3em] backdrop-blur-sm"
          >
            <span className="inline-flex items-center gap-2">
              <Pause className="h-4 w-4" /> paused
            </span>
          </button>
        )}

        <canvas
          ref={canvasRef}
          width={COLS * 24}
          height={ROWS * 24}
          className="w-full touch-none rounded-md border-2 border-border"
          style={{ aspectRatio: "1/1", imageRendering: "auto" }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="hidden sm:inline">arrows / wasd · space to pause</span>
        <span className="sm:hidden">swipe the board</span>
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <i className="h-2 w-2 rounded-full bg-game-go" /> byte
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="h-2 w-2 rounded-full bg-hog-yellow" /> cache +5
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="h-2 w-2 rounded-full bg-hog-purple" /> leak
          </span>
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
        <span />
        <button
          type="button"
          onClick={dpad(0, -1)}
          className="rounded-md border-2 border-border p-2.5 active:bg-hog-red/20"
          aria-label="Up"
        >
          <ArrowUp className="mx-auto h-4 w-4" />
        </button>
        <span />
        <button
          type="button"
          onClick={dpad(-1, 0)}
          className="rounded-md border-2 border-border p-2.5 active:bg-hog-red/20"
          aria-label="Left"
        >
          <ArrowLeft className="mx-auto h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={dpad(0, 1)}
          className="rounded-md border-2 border-border p-2.5 active:bg-hog-red/20"
          aria-label="Down"
        >
          <ArrowDown className="mx-auto h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={dpad(1, 0)}
          className="rounded-md border-2 border-border p-2.5 active:bg-hog-red/20"
          aria-label="Right"
        >
          <ArrowRight className="mx-auto h-4 w-4" />
        </button>
      </div>

      {status === "idle" && (
        <div className="mt-5 text-center">
          <StartButton onClick={start}>Start</StartButton>
        </div>
      )}

      {status === "over" && (
        <ResultCard
          score={score}
          unit="bytes"
          best={best}
          isBest={isBest}
          detail={`level ${level} · ${length} segments long`}
          onRetry={start}
        />
      )}
    </div>
  );
}
