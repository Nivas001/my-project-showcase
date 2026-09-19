import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Gauge, Rocket } from "lucide-react";
import { useArcadeAudio } from "@/lib/arcade/use-arcade-audio";
import { readBest, recordBest } from "@/lib/arcade/best";
import { CountdownOverlay, Hud, HudStat, ResultCard, StartButton, useCountdown } from "./bits";

/* ==========================================================================
 * DEPLOY DASH
 *
 * The one game here with a fail state you can see coming, which is what the
 * arcade was missing: the other five are reaction, memory or accuracy tests,
 * and none of them ask you to read a situation two seconds ahead.
 *
 * You are a build travelling down a pipeline. Failing tests sit on the floor
 * and must be jumped; merge conflicts hang from the ceiling and must be ducked;
 * green checks are worth points and sit exactly where the jump arc peaks.
 *
 * Everything is drawn on one canvas from a single rAF loop with a fixed
 * timestep accumulator, so the physics behave identically on a 60Hz laptop and
 * a 144Hz monitor — a runner that gets harder on better hardware is broken.
 * ======================================================================== */

const W = 720;
const H = 240;
const GROUND = 196;
const PLAYER_X = 92;
const STEP = 1000 / 120; // physics tick, ms

const GRAVITY = 0.62;
const JUMP_V = -11.4;
const START_SPEED = 4.6;
const MAX_SPEED = 12.5;

type Obstacle = {
  x: number;
  kind: "fail" | "conflict" | "flake";
  w: number;
  h: number;
  y: number;
  hit?: boolean;
};
type Pickup = { x: number; y: number; taken?: boolean };

type Palette = {
  bg: string;
  line: string;
  ground: string;
  player: string;
  fail: string;
  conflict: string;
  flake: string;
  check: string;
  dust: string;
};

const FALLBACK: Palette = {
  bg: "#0d0d12",
  line: "rgba(255,255,255,0.06)",
  ground: "#3a3a44",
  player: "#e8653a",
  fail: "#d7443a",
  conflict: "#8b5cf6",
  flake: "#e3b341",
  check: "#3ecf8e",
  dust: "rgba(255,255,255,0.35)",
};

function readPalette(el: HTMLElement | null): Palette {
  if (!el || typeof window === "undefined") return FALLBACK;
  const cs = getComputedStyle(el);
  const v = (n: string, f: string) => cs.getPropertyValue(n).trim() || f;
  return {
    bg: v("--surface-raised", FALLBACK.bg),
    line: "rgba(255,255,255,0.055)",
    ground: v("--border", FALLBACK.ground),
    player: v("--hog-red", FALLBACK.player),
    fail: v("--destructive", FALLBACK.fail),
    conflict: v("--hog-purple", FALLBACK.conflict),
    flake: v("--hog-yellow", FALLBACK.flake),
    check: v("--game-go", FALLBACK.check),
    dust: "rgba(255,255,255,0.3)",
  };
}

export function DeployDash({ onGameOver }: { onGameOver: (score: number) => void }) {
  const audio = useArcadeAudio();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [checks, setChecks] = useState(0);
  const [speedPct, setSpeedPct] = useState(0);
  const [best, setBest] = useState<number | undefined>(undefined);
  const [isBest, setIsBest] = useState(false);

  const overRef = useRef(false);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const accRef = useRef(0);
  const paletteRef = useRef<Palette>(FALLBACK);

  const g = useRef({
    y: GROUND,
    vy: 0,
    ducking: false,
    grounded: true,
    speed: START_SPEED,
    distance: 0,
    checks: 0,
    score: 0,
    obstacles: [] as Obstacle[],
    pickups: [] as Pickup[],
    dust: [] as { x: number; y: number; vx: number; vy: number; life: number }[],
    nextSpawn: 420,
    shake: 0,
  });

  useEffect(() => setBest(readBest("deploy-dash")), []);

  /* ---- spawning -------------------------------------------------------- */

  const spawn = useCallback(() => {
    const s = g.current;
    const roll = Math.random();
    // Ceiling hazards are held back until the player has the jump timing.
    const kind: Obstacle["kind"] =
      s.distance < 900 ? "fail" : roll < 0.45 ? "fail" : roll < 0.78 ? "conflict" : "flake";

    if (kind === "fail") {
      const w = 18 + Math.random() * 20;
      s.obstacles.push({ x: W + 40, kind, w, h: 30 + Math.random() * 16, y: 0 });
    } else if (kind === "conflict") {
      // Hangs low enough that only a duck clears it.
      s.obstacles.push({ x: W + 40, kind, w: 46, h: 54, y: GROUND - 118 });
    } else {
      // Mid-height: jump it, or slide under the tall version.
      s.obstacles.push({ x: W + 40, kind, w: 26, h: 26, y: GROUND - 62 });
    }

    // A check sits at roughly the apex of a jump taken from here.
    if (Math.random() < 0.6) {
      s.pickups.push({ x: W + 40 + 90 + Math.random() * 90, y: GROUND - 74 - Math.random() * 34 });
    }

    // Gap shortens with speed but never below a jumpable window.
    const base = Math.max(240, 620 - s.distance / 22);
    s.nextSpawn = base + Math.random() * 220;
  }, []);

  /* ---- rendering ------------------------------------------------------- */

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const p = paletteRef.current;
    const s = g.current;

    ctx.save();
    if (s.shake > 0) {
      ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
    }

    ctx.fillStyle = p.bg;
    ctx.fillRect(-20, -20, W + 40, H + 40);

    // Two parallax layers of pipeline scaffolding.
    ctx.strokeStyle = p.line;
    ctx.lineWidth = 1;
    const far = (s.distance * 0.28) % 90;
    for (let x = -far; x < W; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, 34);
      ctx.lineTo(x, GROUND);
      ctx.stroke();
    }
    const near = (s.distance * 0.7) % 180;
    ctx.globalAlpha = 0.6;
    for (let x = -near; x < W; x += 180) {
      ctx.strokeRect(x, GROUND - 78, 54, 78);
    }
    ctx.globalAlpha = 1;

    // Floor.
    ctx.strokeStyle = p.ground;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND + 1);
    ctx.lineTo(W, GROUND + 1);
    ctx.stroke();

    const dash = (s.distance * 1) % 40;
    ctx.globalAlpha = 0.5;
    ctx.setLineDash([14, 26]);
    ctx.lineDashOffset = dash;
    ctx.beginPath();
    ctx.moveTo(0, GROUND + 12);
    ctx.lineTo(W, GROUND + 12);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Pickups.
    for (const c of s.pickups) {
      if (c.taken) continue;
      ctx.fillStyle = p.check;
      ctx.shadowColor = p.check;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = p.bg;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(c.x - 3.6, c.y);
      ctx.lineTo(c.x - 1, c.y + 3);
      ctx.lineTo(c.x + 4, c.y - 3.4);
      ctx.stroke();
    }

    // Obstacles.
    for (const o of s.obstacles) {
      const colour = o.kind === "fail" ? p.fail : o.kind === "conflict" ? p.conflict : p.flake;
      ctx.fillStyle = colour;
      ctx.shadowColor = colour;
      ctx.shadowBlur = 12;
      const top = o.kind === "fail" ? GROUND - o.h : o.y;
      ctx.beginPath();
      ctx.roundRect(o.x, top, o.w, o.h, 3);
      ctx.fill();
      ctx.shadowBlur = 0;

      // A conflict hangs from the ceiling on a line, so its danger reads.
      if (o.kind === "conflict") {
        ctx.strokeStyle = colour;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(o.x + o.w / 2, 0);
        ctx.lineTo(o.x + o.w / 2, top);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // Dust kicked up by the run.
    for (const d of s.dust) {
      ctx.globalAlpha = Math.max(0, d.life);
      ctx.fillStyle = p.dust;
      ctx.fillRect(d.x, d.y, 2, 2);
    }
    ctx.globalAlpha = 1;

    // The build.
    const ph = s.ducking ? 20 : 34;
    const pw = s.ducking ? 40 : 28;
    ctx.fillStyle = p.player;
    ctx.shadowColor = p.player;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.roundRect(PLAYER_X, s.y - ph, pw, ph, 5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Thruster, only while airborne.
    if (!s.grounded) {
      ctx.fillStyle = p.flake;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.moveTo(PLAYER_X + 4, s.y);
      ctx.lineTo(PLAYER_X + 12, s.y + 9 + Math.random() * 6);
      ctx.lineTo(PLAYER_X + 20, s.y);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }, []);

  /* ---- simulation ------------------------------------------------------ */

  const end = useCallback(() => {
    overRef.current = true;
    cancelAnimationFrame(rafRef.current);
    setStatus("over");
    const final = g.current.score;
    setBest(readBest("deploy-dash"));
    const beat = recordBest("deploy-dash", final);
    setIsBest(beat);
    audio.play("crash");
    window.setTimeout(() => audio.play(beat ? "highscore" : "gameover"), 320);
    onGameOver(final);
  }, [audio, onGameOver]);

  const tick = useCallback(() => {
    const s = g.current;

    s.speed = Math.min(MAX_SPEED, START_SPEED + s.distance / 1400);
    s.distance += s.speed;
    s.shake = Math.max(0, s.shake - 0.6);

    // Vertical.
    s.vy += GRAVITY;
    s.y += s.vy;
    if (s.y >= GROUND) {
      if (!s.grounded) s.shake = 3;
      s.y = GROUND;
      s.vy = 0;
      s.grounded = true;
    } else {
      s.grounded = false;
    }
    // Ducking in the air is a fast-fall, which is the only way to recover from
    // jumping into a conflict.
    if (s.ducking && !s.grounded) s.vy += 0.5;

    // Dust.
    if (s.grounded && Math.random() < 0.55) {
      s.dust.push({
        x: PLAYER_X,
        y: GROUND - 2,
        vx: -s.speed * (0.6 + Math.random() * 0.5),
        vy: -Math.random() * 1.2,
        life: 1,
      });
    }
    for (const d of s.dust) {
      d.x += d.vx;
      d.y += d.vy;
      d.vy += 0.05;
      d.life -= 0.035;
    }
    s.dust = s.dust.filter((d) => d.life > 0);

    // Spawning.
    s.nextSpawn -= s.speed;
    if (s.nextSpawn <= 0) spawn();

    for (const o of s.obstacles) o.x -= s.speed;
    for (const c of s.pickups) c.x -= s.speed;
    s.obstacles = s.obstacles.filter((o) => o.x + o.w > -20);
    s.pickups = s.pickups.filter((c) => c.x > -20);

    // Collision. The player box is generous by 3px on each side: a runner that
    // is pixel-exact reads as unfair even when it is technically correct.
    const ph = s.ducking ? 20 : 34;
    const pw = s.ducking ? 40 : 28;
    const px = PLAYER_X + 3;
    const py = s.y - ph + 3;
    const pw2 = pw - 6;
    const ph2 = ph - 6;

    for (const o of s.obstacles) {
      const top = o.kind === "fail" ? GROUND - o.h : o.y;
      if (px < o.x + o.w && px + pw2 > o.x && py < top + o.h && py + ph2 > top) {
        end();
        return;
      }
    }

    for (const c of s.pickups) {
      if (c.taken) continue;
      if (Math.abs(c.x - (px + pw2 / 2)) < 16 && Math.abs(c.y - (py + ph2 / 2)) < 20) {
        c.taken = true;
        s.checks += 1;
        s.score += 10;
        audio.play("coin");
        setChecks(s.checks);
      }
    }

    // Distance is the base score; checks are the skill bonus on top.
    const distScore = Math.floor(s.distance / 20);
    const next = distScore + s.checks * 10;
    if (next !== s.score) {
      // Every 250 points is a milestone worth hearing.
      if (Math.floor(next / 250) > Math.floor(s.score / 250)) audio.play("levelup");
      s.score = next;
      setScore(next);
    }
    setSpeedPct(((s.speed - START_SPEED) / (MAX_SPEED - START_SPEED)) * 100);
  }, [audio, end, spawn]);

  /* ---- loop ------------------------------------------------------------ */

  const beginRun = useCallback(() => {
    setStatus("playing");
    lastRef.current = performance.now();
    accRef.current = 0;

    const frame = (now: number) => {
      if (overRef.current) return;
      const dt = Math.min(120, now - lastRef.current);
      lastRef.current = now;
      accRef.current += dt;
      while (accRef.current >= STEP) {
        accRef.current -= STEP;
        tick();
        if (overRef.current) return;
      }
      draw();
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
  }, [draw, tick]);

  const { count, begin } = useCountdown(beginRun, () => audio.play("tick"));

  const start = () => {
    audio.play("start");
    overRef.current = false;
    g.current = {
      y: GROUND,
      vy: 0,
      ducking: false,
      grounded: true,
      speed: START_SPEED,
      distance: 0,
      checks: 0,
      score: 0,
      obstacles: [],
      pickups: [],
      dust: [],
      nextSpawn: 420,
      shake: 0,
    };
    paletteRef.current = readPalette(wrapRef.current);
    setScore(0);
    setChecks(0);
    setSpeedPct(0);
    setIsBest(false);
    begin();
  };

  useEffect(() => {
    paletteRef.current = readPalette(wrapRef.current);
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  /* ---- input ----------------------------------------------------------- */

  const jump = useCallback(() => {
    const s = g.current;
    if (!s.grounded) return;
    s.vy = JUMP_V;
    s.grounded = false;
    audio.play("whoosh");
  }, [audio]);

  const duck = useCallback((on: boolean) => {
    g.current.ducking = on;
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        if (status === "playing") jump();
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        if (status === "playing") duck(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown" || e.code === "KeyS") duck(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [jump, duck, status]);

  // Touch: top half of the canvas jumps, bottom half ducks while held.
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (status !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    if ((e.clientY - rect.top) / rect.height > 0.62) duck(true);
    else jump();
  };

  return (
    <div ref={wrapRef} className="mx-auto w-full max-w-2xl">
      <Hud>
        <HudStat icon={Rocket} label="score" value={score} tone="accent" />
        <HudStat icon={CheckCircle2} label="checks" value={checks} tone="go" />
        <HudStat icon={Gauge} label="speed" value={`${Math.round(speedPct)}%`} />
      </Hud>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-hog-red transition-[width] duration-200"
          style={{ width: `${speedPct}%` }}
        />
      </div>

      <div className="relative mt-3">
        <CountdownOverlay count={count} />
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={onPointerDown}
          onPointerUp={() => duck(false)}
          onPointerLeave={() => duck(false)}
          className="w-full touch-none select-none rounded-md border-2 border-border"
          style={{ aspectRatio: `${W}/${H}` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="hidden sm:inline">space / ↑ jump · ↓ duck</span>
        <span className="sm:hidden">tap top to jump · hold bottom to duck</span>
        <span className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <i className="h-2 w-2 rounded-sm bg-destructive" /> failing test
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="h-2 w-2 rounded-sm bg-hog-purple" /> conflict
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="h-2 w-2 rounded-sm bg-hog-yellow" /> flake
          </span>
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
        <button
          type="button"
          onPointerDown={jump}
          className="flex items-center justify-center gap-2 rounded-md border-2 border-border py-3 font-mono text-xs uppercase active:bg-hog-red/20"
        >
          <ArrowUp className="h-4 w-4" /> jump
        </button>
        <button
          type="button"
          onPointerDown={() => duck(true)}
          onPointerUp={() => duck(false)}
          onPointerLeave={() => duck(false)}
          className="flex items-center justify-center gap-2 rounded-md border-2 border-border py-3 font-mono text-xs uppercase active:bg-hog-red/20"
        >
          <ArrowDown className="h-4 w-4" /> duck
        </button>
      </div>

      {status === "idle" && (
        <div className="mt-5 text-center">
          <StartButton onClick={start}>Ship it</StartButton>
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            distance scores on its own · green checks are worth ten each
          </p>
        </div>
      )}

      {status === "over" && (
        <ResultCard
          score={score}
          unit="pts"
          best={best}
          isBest={isBest}
          detail={`${checks} checks collected · ${Math.round(g.current.distance / 20)} m of pipeline`}
          onRetry={start}
        />
      )}
    </div>
  );
}
