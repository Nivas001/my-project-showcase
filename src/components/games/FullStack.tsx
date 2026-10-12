import { useCallback, useEffect, useRef, useState } from "react";
import { Flame, Layers, Target } from "lucide-react";
import { useArcadeAudio } from "@/lib/arcade/use-arcade-audio";
import { readBest, recordBest } from "@/lib/arcade/best";
import { Hud, HudStat, ResultCard, StartButton } from "./bits";

/* ==========================================================================
 * FULL STACK
 *
 * Build a product one layer at a time. A slab slides in over the tower; drop
 * it, and whatever hangs over the edge is sliced off and falls. Land it dead
 * centre and it snaps perfectly — chain those and the slab grows back.
 *
 * Every layer is named after a real piece of a product, bottom to top, so a
 * good run reads like the stack I actually ship: Postgres at the base, deploy
 * and monitoring near the top.
 *
 * Rendering is a hand-rolled isometric projection on a 2D canvas — no three.js
 * for six quads a frame. All game state lives in refs and the loop runs on
 * requestAnimationFrame; React only hears about the things the HUD shows.
 * ======================================================================== */

const LAYERS = [
  "postgres",
  "schema",
  "migrations",
  "prisma",
  "row-level security",
  "auth",
  "storage",
  "api",
  "validation",
  "cache",
  "queue",
  "webhooks",
  "payments",
  "server fns",
  "router",
  "ssr",
  "react 19",
  "tailwind",
  "a11y",
  "admin panel",
  "tests",
  "ci",
  "preview",
  "edge",
  "deploy",
  "monitoring",
];

const BASE = 1; // slab footprint, world units
const SLAB_H = 0.2; // slab thickness
const RANGE = 1.45; // how far a slab travels either side of the tower
const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

type Box = {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
  y: number;
  hue: number;
  label: string;
};
type Debris = Box & { vy: number; vx: number; vz: number; age: number };
type Ripple = { box: Box; age: number };
type Phase = "idle" | "playing" | "over";

const hueAt = (level: number) => (8 + level * 8.5) % 360;
const labelAt = (level: number) => LAYERS[(level - 1) % LAYERS.length]!;

export function FullStack({ onGameOver }: { onGameOver: (score: number) => void }) {
  const audio = useArcadeAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [floors, setFloors] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState<number | undefined>(undefined);
  const [isBest, setIsBest] = useState(false);
  const [summary, setSummary] = useState({ perfects: 0, maxCombo: 0, top: "" });

  // --- mutable game state, read by the render loop -------------------------
  const g = useRef({
    phase: "idle" as Phase,
    tower: [] as Box[],
    moving: null as Box | null,
    axis: "x" as "x" | "z",
    t: 0, // travel parameter for the moving slab
    speed: 1.5,
    debris: [] as Debris[],
    ripples: [] as Ripple[],
    combo: 0,
    perfects: 0,
    maxCombo: 0,
    camY: 0,
    zoom: 1,
    shake: 0,
    banner: null as { text: string; age: number } | null,
  });

  useEffect(() => setBest(readBest("full-stack")), []);

  const reset = useCallback(() => {
    const s = g.current;
    s.tower = [
      {
        x0: -BASE / 2,
        x1: BASE / 2,
        z0: -BASE / 2,
        z1: BASE / 2,
        y: 0,
        hue: hueAt(0),
        label: "localhost",
      },
    ];
    s.moving = null;
    s.debris = [];
    s.ripples = [];
    s.combo = 0;
    s.perfects = 0;
    s.maxCombo = 0;
    s.camY = 0;
    s.zoom = 1;
    s.shake = 0;
    s.banner = null;
    s.speed = 1.5;
  }, []);

  /** The idle screen: a finished-looking tower, so the first frame sells it. */
  const demo = useCallback(() => {
    const s = g.current;
    const offsets = [0.06, -0.04, 0.03, -0.05, 0.02, -0.03, 0.04, -0.02, 0.03, 0];
    let { x0, x1, z0, z1 } = s.tower[0]!;
    offsets.forEach((o, i) => {
      const level = i + 1;
      if (level % 2) {
        x0 = Math.max(x0, x0 + o);
        x1 = Math.min(x1, x1 + o);
      } else {
        z0 = Math.max(z0, z0 + o);
        z1 = Math.min(z1, z1 + o);
      }
      s.tower.push({ x0, x1, z0, z1, y: level * SLAB_H, hue: hueAt(level), label: labelAt(level) });
    });
  }, []);

  /** Spawn the next slab off to one side, matching the top of the tower. */
  const spawn = useCallback(() => {
    const s = g.current;
    const top = s.tower[s.tower.length - 1]!;
    const level = s.tower.length;
    s.axis = level % 2 === 1 ? "x" : "z";
    s.t = -1; // start at the far end of travel
    s.speed = Math.min(3.4, 1.5 + level * 0.045);
    s.moving = { ...top, y: top.y + SLAB_H, hue: hueAt(level), label: labelAt(level) };
  }, []);

  const start = () => {
    audio.unlock();
    audio.play("start");
    reset();
    spawn();
    g.current.phase = "playing";
    setPhase("playing");
    setFloors(0);
    setCombo(0);
    setIsBest(false);
    wrapRef.current?.focus({ preventScroll: true });
  };

  const end = useCallback(() => {
    const s = g.current;
    s.phase = "over";
    setPhase("over");
    const score = s.tower.length - 1;
    setBest(readBest("full-stack"));
    const beat = score > 0 && recordBest("full-stack", score);
    setIsBest(beat);
    if (beat) setBest(score);
    setSummary({
      perfects: s.perfects,
      maxCombo: s.maxCombo,
      top: score > 0 ? s.tower[s.tower.length - 1]!.label : "nothing, yet",
    });
    audio.play(beat ? "highscore" : "crash");
    onGameOver(score);
  }, [audio, onGameOver]);

  /** The one input: drop the moving slab. */
  const drop = useCallback(() => {
    const s = g.current;
    if (s.phase !== "playing" || !s.moving) return;
    const top = s.tower[s.tower.length - 1]!;
    const m = s.moving;
    const ax = s.axis;
    const a0 = ax === "x" ? m.x0 : m.z0;
    const a1 = ax === "x" ? m.x1 : m.z1;
    const p0 = ax === "x" ? top.x0 : top.z0;
    const p1 = ax === "x" ? top.x1 : top.z1;
    const lo = Math.max(a0, p0);
    const hi = Math.min(a1, p1);

    // Missed the tower entirely.
    if (hi - lo <= 0.004) {
      s.debris.push({
        ...m,
        vy: 0,
        vx: ax === "x" ? Math.sign(a0 - p0) * 0.6 : 0,
        vz: ax === "z" ? Math.sign(a0 - p0) * 0.6 : 0,
        age: 0,
      });
      s.moving = null;
      s.shake = 1;
      end();
      return;
    }

    const offset = (a0 + a1) / 2 - (p0 + p1) / 2;
    const tolerance = Math.max(0.03, 0.06 - s.tower.length * 0.001);
    let placed: Box;

    if (Math.abs(offset) <= tolerance) {
      // Perfect: snap to the slab below, and after a streak, grow back.
      s.combo += 1;
      s.perfects += 1;
      s.maxCombo = Math.max(s.maxCombo, s.combo);
      placed = { ...m, x0: top.x0, x1: top.x1, z0: top.z0, z1: top.z1 };
      if (s.combo >= 3) {
        const grow = 0.035;
        if (ax === "x") {
          placed.x0 = Math.max(-BASE / 2 - 0.5, placed.x0 - grow / 2);
          placed.x1 = Math.min(placed.x0 + BASE, placed.x1 + grow / 2);
        } else {
          placed.z0 = Math.max(-BASE / 2 - 0.5, placed.z0 - grow / 2);
          placed.z1 = Math.min(placed.z0 + BASE, placed.z1 + grow / 2);
        }
      }
      s.ripples.push({ box: placed, age: 0 });
      audio.play("combo", Math.min(10, s.combo - 1));
    } else {
      s.combo = 0;
      placed = ax === "x" ? { ...m, x0: lo, x1: hi } : { ...m, z0: lo, z1: hi };
      // The overhang: whichever side stuck out.
      const cut: Box =
        ax === "x"
          ? offset > 0
            ? { ...m, x0: hi, x1: a1 }
            : { ...m, x0: a0, x1: lo }
          : offset > 0
            ? { ...m, z0: hi, z1: a1 }
            : { ...m, z0: a0, z1: lo };
      const dir = Math.sign(offset);
      s.debris.push({
        ...cut,
        vy: 0.4,
        vx: ax === "x" ? dir * 0.5 : 0,
        vz: ax === "z" ? dir * 0.5 : 0,
        age: 0,
      });
      audio.play("hit");
      audio.play("whoosh");
    }

    s.tower.push(placed);
    const n = s.tower.length - 1;
    setFloors(n);
    setCombo(s.combo);
    if (n % 10 === 0) {
      s.banner = { text: `v${n / 10}.0 shipped`, age: 0 };
      audio.play("levelup");
    }
    spawn();
  }, [audio, end, spawn]);

  // --- input ---------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (g.current.phase !== "playing") return;
      if (e.code === "Space" || e.code === "Enter" || e.code === "ArrowDown") {
        // Only claim the key while a run is live, so the page still scrolls.
        e.preventDefault();
        if (!e.repeat) drop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drop]);

  // --- render loop ---------------------------------------------------------
  useEffect(() => {
    reset();
    demo();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
    let W = 0;
    let H = 0;
    let dpr = 1;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = g.current;

      // Moving slab: linear ping-pong across the tower.
      if (s.phase === "playing" && s.moving) {
        s.t += dt * s.speed * 0.9;
        const tri = ((((s.t + 1) % 4) + 4) % 4) - 2; // -2..2
        const pos = (Math.abs(tri) - 1) * -RANGE; // ±RANGE
        const top = s.tower[s.tower.length - 1]!;
        const m = s.moving;
        if (s.axis === "x") {
          const w = m.x1 - m.x0;
          const c = (top.x0 + top.x1) / 2 + pos;
          m.x0 = c - w / 2;
          m.x1 = c + w / 2;
        } else {
          const d = m.z1 - m.z0;
          const c = (top.z0 + top.z1) / 2 + pos;
          m.z0 = c - d / 2;
          m.z1 = c + d / 2;
        }
      }

      // Debris physics.
      for (const d of s.debris) {
        d.age += dt;
        d.vy -= 9 * dt;
        d.y += d.vy * dt;
        d.x0 += d.vx * dt;
        d.x1 += d.vx * dt;
        d.z0 += d.vz * dt;
        d.z1 += d.vz * dt;
      }
      s.debris = s.debris.filter((d) => d.age < 2.2);
      for (const r of s.ripples) r.age += dt;
      s.ripples = s.ripples.filter((r) => r.age < 0.6);
      if (s.banner) {
        s.banner.age += dt;
        if (s.banner.age > 2) s.banner = null;
      }
      s.shake = Math.max(0, s.shake - dt * 2.5);

      // Camera: follow the top while playing; pull back to show it all after.
      const height = (s.tower.length - 1) * SLAB_H;
      const baseScale = Math.min(W * 0.27, H * 0.36);
      if (s.phase !== "playing") {
        const fit = Math.min(1, (H * 0.62) / ((height + 0.9) * baseScale));
        s.zoom += (fit - s.zoom) * Math.min(1, dt * 2.2);
        s.camY += (height / 2 - 0.2 - s.camY) * Math.min(1, dt * 2.2);
      } else {
        s.zoom += (1 - s.zoom) * Math.min(1, dt * 4);
        s.camY += (Math.max(0, height - 0.4) - s.camY) * Math.min(1, dt * 5);
      }
      const S = baseScale * s.zoom;
      const shx = (Math.random() - 0.5) * 10 * s.shake;
      const shy = (Math.random() - 0.5) * 10 * s.shake;
      const cx = W / 2 + shx;
      const cy = H * 0.6 + shy;
      const P = (x: number, y: number, z: number): [number, number] => [
        cx + (x - z) * COS * S,
        cy + (x + z) * SIN * S - (y - s.camY) * S,
      ];

      // Background: deep, tinted by the current layer's hue.
      const level = s.tower.length;
      const hue = hueAt(level);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, `hsl(${hue} 45% 13%)`);
      bg.addColorStop(1, `hsl(${(hue + 40) % 360} 30% 5%)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      const glow = ctx.createRadialGradient(
        W / 2,
        H * 0.45,
        0,
        W / 2,
        H * 0.45,
        Math.max(W, H) * 0.6,
      );
      glow.addColorStop(0, `hsl(${hue} 70% 55% / 0.14)`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Floor count, big and quiet, behind everything.
      if (s.phase !== "idle") {
        ctx.font = `800 ${Math.round(Math.min(W, H) * 0.17)}px "Inter Tight", Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillText(String(s.tower.length - 1), W / 2, H * 0.07);
      }

      // Soft shadow under the base.
      const b = s.tower[0]!;
      ctx.beginPath();
      const sh = [
        P(b.x0 - 0.15, -0.02, b.z0 - 0.15),
        P(b.x1 + 0.15, -0.02, b.z0 - 0.15),
        P(b.x1 + 0.15, -0.02, b.z1 + 0.15),
        P(b.x0 - 0.15, -0.02, b.z1 + 0.15),
      ];
      sh.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.filter = "blur(12px)";
      ctx.fill();
      ctx.filter = "none";

      const drawBox = (bx: Box, h: number, alpha = 1, showLabel = true) => {
        // `h` is the visible depth: one slab, or a deep pedestal for the base.
        const y1 = bx.y + SLAB_H;
        const yy0 = y1 - h;
        const top = [
          P(bx.x0, y1, bx.z0),
          P(bx.x1, y1, bx.z0),
          P(bx.x1, y1, bx.z1),
          P(bx.x0, y1, bx.z1),
        ];
        const right = [
          P(bx.x1, y1, bx.z0),
          P(bx.x1, y1, bx.z1),
          P(bx.x1, yy0, bx.z1),
          P(bx.x1, yy0, bx.z0),
        ];
        const left = [
          P(bx.x0, y1, bx.z1),
          P(bx.x1, y1, bx.z1),
          P(bx.x1, yy0, bx.z1),
          P(bx.x0, yy0, bx.z1),
        ];
        const poly = (pts: [number, number][], fill: string | CanvasGradient) => {
          ctx.beginPath();
          pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          ctx.closePath();
          ctx.fillStyle = fill;
          ctx.fill();
        };
        ctx.globalAlpha = alpha;
        poly(right, `hsl(${bx.hue} 62% 40%)`);
        poly(left, `hsl(${bx.hue} 58% 31%)`);
        const tg = ctx.createLinearGradient(top[0]![0], top[0]![1], top[2]![0], top[2]![1]);
        tg.addColorStop(0, `hsl(${bx.hue} 75% 66%)`);
        tg.addColorStop(1, `hsl(${bx.hue} 68% 56%)`);
        poly(top, tg);
        // Crisp front edges catch the light.
        ctx.beginPath();
        ctx.moveTo(...top[3]!);
        ctx.lineTo(...top[2]!);
        ctx.lineTo(...top[1]!);
        ctx.strokeStyle = "rgba(255,255,255,0.28)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label printed on the front (z1) face.
        if (showLabel && S > 70) {
          const fh = (y1 - yy0) * S;
          const fw = (bx.x1 - bx.x0) * S;
          if (fw > 30) {
            const [ox, oy] = P(bx.x0, y1, bx.z1);
            ctx.save();
            ctx.beginPath();
            left.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
            ctx.closePath();
            ctx.clip();
            ctx.setTransform(COS * dpr, SIN * dpr, 0, dpr, ox * dpr, oy * dpr);
            ctx.font = `600 ${Math.max(9, Math.min(15, fh * 0.42))}px "JetBrains Mono", ui-monospace, monospace`;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(255,255,255,0.78)";
            ctx.fillText(bx.label, 9, fh / 2 + 0.5);
            ctx.restore();
          }
        }
        ctx.globalAlpha = 1;
      };

      // Debris behind the tower first, then the tower, then debris in front.
      const tc = s.tower[s.tower.length - 1]!;
      const centre = (bx: Box) => (bx.x0 + bx.x1) / 2 + (bx.z0 + bx.z1) / 2;
      const behind = s.debris.filter((d) => centre(d) < centre(tc));
      const front = s.debris.filter((d) => centre(d) >= centre(tc));
      for (const d of behind) drawBox(d, SLAB_H, Math.max(0, 1 - d.age / 2.2), false);
      s.tower.forEach((bx, i) => drawBox(bx, i === 0 ? SLAB_H * 6 : SLAB_H));
      if (s.moving && s.phase === "playing") drawBox(s.moving, SLAB_H);
      for (const d of front) drawBox(d, SLAB_H, Math.max(0, 1 - d.age / 2.2), false);

      // Perfect-drop ripples: the top face outline, expanding and fading.
      for (const r of s.ripples) {
        const k = r.age / 0.6;
        const grow = 0.04 + k * 0.22;
        const y = r.box.y + SLAB_H;
        const pts = [
          P(r.box.x0 - grow, y, r.box.z0 - grow),
          P(r.box.x1 + grow, y, r.box.z0 - grow),
          P(r.box.x1 + grow, y, r.box.z1 + grow),
          P(r.box.x0 - grow, y, r.box.z1 + grow),
        ];
        ctx.beginPath();
        pts.forEach(([x, yy], i) => (i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy)));
        ctx.closePath();
        ctx.strokeStyle = `rgba(255,255,255,${0.85 * (1 - k)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Milestone banner.
      if (s.banner) {
        const a = s.banner.age;
        const op = Math.min(1, a * 5) * Math.min(1, (2 - a) * 2);
        ctx.globalAlpha = op;
        ctx.font = `700 ${Math.round(Math.min(W, H) * 0.045)}px "JetBrains Mono", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.fillText(`✓ ${s.banner.text}`, W / 2, H * 0.3 - a * 12);
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reset, demo]);

  return (
    <div>
      <Hud>
        <HudStat icon={Layers} label="floors" value={floors} />
        <HudStat
          icon={Flame}
          label="perfect streak"
          value={combo}
          tone={combo >= 3 ? "accent" : undefined}
          pulse={combo >= 5}
        />
        <HudStat icon={Target} label="best" value={best ?? "—"} />
      </Hud>

      <div
        ref={wrapRef}
        tabIndex={0}
        role="application"
        aria-label="Full Stack. Press space or tap to drop each layer onto the tower."
        onPointerDown={(e) => {
          if (phase === "playing") {
            e.preventDefault();
            drop();
          }
        }}
        className="relative mt-4 overflow-hidden rounded-md border-2 border-border outline-none focus-visible:border-hog-red"
        style={{ touchAction: "manipulation" }}
      >
        <canvas ref={canvasRef} className="block h-[420px] w-full sm:h-[500px]" />

        {phase === "idle" ? (
          <div className="absolute inset-0 grid place-items-center bg-black/30 backdrop-blur-[1px]">
            <div className="px-6 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
                localhost → production
              </p>
              <p className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Build the whole stack.
              </p>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/70">
                Tap, click or press space to drop each layer. Whatever hangs over the edge gets cut.
              </p>
              <div className="mt-6">
                <StartButton onClick={start}>Start building</StartButton>
              </div>
            </div>
          </div>
        ) : null}

        {phase === "playing" && floors === 0 ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 animate-pulse text-center font-mono text-[11px] text-white/70">
            tap · click · space
          </p>
        ) : null}
      </div>

      {phase === "over" ? (
        <ResultCard
          score={floors}
          unit="floors"
          best={best}
          isBest={isBest}
          onRetry={start}
          detail={
            <span>
              topped out at <span className="text-foreground">{summary.top}</span> ·{" "}
              {summary.perfects} perfect
              {summary.perfects === 1 ? "" : "s"} · longest streak {summary.maxCombo}
            </span>
          }
        />
      ) : null}
    </div>
  );
}
