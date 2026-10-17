import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Music,
  Package,
  Pause,
  Play,
  RotateCcw,
  Rocket,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useArcadeAudio } from "@/lib/arcade/use-arcade-audio";
import type { SimEvent } from "./sim";
import type { ShipItWorld } from "./world";

/* ==========================================================================
 * SHIP IT INC. — the page
 *
 * React owns the chrome: the title card, the HUD, the pause menu. The game
 * itself (three.js, the simulation, the input) is a separate chunk loaded
 * after mount, so nobody downloads a 3D engine to read the homepage, and the
 * server render is just the title card.
 *
 * The HUD does not subscribe to the simulation. It samples it ten times a
 * second, which is plenty for numbers a person reads, and keeps React out of
 * the 60 fps loop entirely.
 * ======================================================================== */

type Phase = "loading" | "title" | "playing" | "paused" | "failed";

type Hud = {
  cash: number;
  objective: string;
  stack: number;
  carry: number;
  shipped: number;
  tutorial: boolean;
};

const EMPTY_HUD: Hud = { cash: 0, objective: "", stack: 0, carry: 4, shipped: 0, tutorial: true };

const FONT = `"Fredoka", "Inter Tight", ui-rounded, system-ui, sans-serif`;

export function ShipIt() {
  const audio = useArcadeAudio();
  const audioRef = useRef(audio);
  audioRef.current = audio;

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const cashRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<ShipItWorld | null>(null);

  const [phase, setPhase] = useState<Phase>("loading");
  const phaseRef = useRef<Phase>("loading");
  phaseRef.current = phase;
  const [hud, setHud] = useState<Hud>(EMPTY_HUD);
  const [run, setRun] = useState(0);
  const [moved, setMoved] = useState(false);

  // The page is a game, not a document: no scrolling behind it.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  /* ---- Boot (and reboot on restart) ----------------------------------- */

  useEffect(() => {
    let cancelled = false;
    let world: ShipItWorld | null = null;
    let input: import("./input").Input | null = null;
    let ro: ResizeObserver | null = null;
    let hudTimer = 0;
    let popAt = 0;
    let popN = 0;
    let drainN = 0;
    let cashN = 0;
    let coins = 0;
    const rootEl = rootRef.current;

    const onEvents = (events: SimEvent[]) => {
      const a = audioRef.current;
      const now = performance.now();
      for (const e of events) {
        if (e.t === "move") {
          if (now - popAt > 45) {
            a.play("pop", popN++);
            popAt = now;
          }
        } else if (e.t === "launch") a.play("launch");
        else if (e.t === "unlock") {
          a.play("unlock");
          navigator.vibrate?.(40);
        } else if (e.t === "drain") {
          if (drainN++ % 4 === 0) a.play("drain", drainN);
        }
      }
    };

    const onCollect = (x: number, y: number) => {
      const target = cashRef.current?.getBoundingClientRect();
      const root = rootRef.current;
      if (!target || !root) return;
      const a = audioRef.current;
      if (coins > 24) {
        a.play("cash", cashN++);
        return;
      }
      coins++;
      const el = document.createElement("div");
      el.className = "si-coin";
      root.appendChild(el);
      const tx = target.left + 22;
      const ty = target.top + target.height / 2;
      const anim = el.animate(
        [
          { transform: `translate(${x}px, ${y}px) scale(0.9)` },
          {
            transform: `translate(${(x + tx) / 2}px, ${Math.min(y, ty) - 60}px) scale(1.15)`,
            offset: 0.45,
          },
          { transform: `translate(${tx}px, ${ty}px) scale(0.7)` },
        ],
        { duration: 520, easing: "cubic-bezier(0.45, 0, 0.6, 1)" },
      );
      anim.onfinish = () => {
        el.remove();
        coins--;
        a.play("cash", cashN++);
        cashRef.current?.animate([{ scale: "1.14" }, { scale: "1" }], {
          duration: 180,
          easing: "ease-out",
        });
      };
    };

    (async () => {
      try {
        const probe = document.createElement("canvas");
        if (!probe.getContext("webgl2") && !probe.getContext("webgl")) throw new Error("no webgl");
        const [{ createShipIt }, { Input }] = await Promise.all([
          import("./world"),
          import("./input"),
        ]);
        if (cancelled || !canvasRef.current || !overlayRef.current || !rootRef.current) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const quality = (navigator.hardwareConcurrency ?? 8) <= 4 ? "low" : "high";

        input = new Input(surfaceRef.current!, baseRef.current!, knobRef.current!, () =>
          setMoved(true),
        );
        const inp = input;
        world = createShipIt(
          canvasRef.current,
          overlayRef.current,
          {
            onEvents,
            onCollect,
            input: () => (phaseRef.current === "playing" ? inp.vector() : { x: 0, z: 0 }),
          },
          { quality, reducedMotion: reduced },
        );
        worldRef.current = world;
        // Lets a test script fast-forward the simulation. Dev builds only.
        if (import.meta.env.DEV) (window as unknown as { __shipit?: ShipItWorld }).__shipit = world;

        const root = rootRef.current;
        const size = () => world?.resize(root.clientWidth, root.clientHeight);
        size();
        ro = new ResizeObserver(size);
        ro.observe(root);

        const restarting = run > 0;
        world.setPaused(!restarting);
        world.start();
        setPhase(restarting ? "playing" : "title");

        hudTimer = window.setInterval(() => {
          const s = world?.sim;
          if (!s) return;
          const next: Hud = {
            cash: Math.floor(s.cash),
            objective: s.objective().text,
            stack: s.player.stack.length,
            carry: s.carry,
            shipped: s.shipped,
            tutorial: s.shipped < 4 || s.bought < 1,
          };
          setHud((prev) =>
            prev.cash === next.cash &&
            prev.objective === next.objective &&
            prev.stack === next.stack &&
            prev.carry === next.carry &&
            prev.shipped === next.shipped &&
            prev.tutorial === next.tutorial
              ? prev
              : next,
          );
        }, 100);
      } catch {
        if (!cancelled) setPhase("failed");
      }
    })();

    return () => {
      cancelled = true;
      window.clearInterval(hudTimer);
      ro?.disconnect();
      input?.dispose();
      world?.dispose();
      worldRef.current = null;
      rootEl?.querySelectorAll(".si-coin").forEach((el) => el.remove());
    };
  }, [run]);

  /* ---- Controls ------------------------------------------------------- */

  const begin = useCallback(() => {
    audioRef.current.play("start");
    worldRef.current?.setPaused(false);
    setPhase("playing");
  }, []);

  const pause = useCallback(() => {
    worldRef.current?.setPaused(true);
    setPhase("paused");
  }, []);

  const resume = useCallback(() => {
    audioRef.current.play("select");
    worldRef.current?.setPaused(false);
    setPhase("playing");
  }, []);

  const restart = useCallback(() => {
    audioRef.current.play("select");
    setHud(EMPTY_HUD);
    setPhase("loading");
    setRun((r) => r + 1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        if (phaseRef.current === "playing") pause();
        else if (phaseRef.current === "paused") resume();
      } else if ((e.key === "Enter" || e.key === " ") && phaseRef.current === "title") {
        e.preventDefault();
        begin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [begin, pause, resume]);

  const playing = phase === "playing";
  const showHud = phase === "playing" || phase === "paused";

  return (
    <div
      ref={rootRef}
      className="si-root fixed inset-0 z-[60] select-none overflow-hidden bg-[#cfe8f2] text-[#2c2f3d]"
      style={{ fontFamily: FONT }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      <div ref={overlayRef} className="pointer-events-none absolute inset-0" aria-hidden />
      <div
        ref={surfaceRef}
        className={`absolute inset-0 touch-none ${playing ? "" : "pointer-events-none"}`}
        aria-label="Game area. Drag, or use WASD or the arrow keys, to walk."
      />
      <div ref={baseRef} className="si-stick" aria-hidden>
        <div ref={knobRef} className="si-knob" />
      </div>

      {/* ---- HUD ---- */}
      {showHud && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 px-3 sm:px-5"
            style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
          >
            <div className="flex items-center gap-2">
              <Link
                to="/fun"
                className="si-glass pointer-events-auto grid h-11 w-11 place-items-center rounded-2xl"
                aria-label="Back to the arcade"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="si-glass hidden items-center gap-2.5 rounded-2xl py-1.5 pl-1.5 pr-4 sm:flex">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#e5533c] text-white">
                  <Rocket className="h-4 w-4" />
                </span>
                <div className="leading-tight">
                  <p className="text-[13px] font-semibold">Ship It Inc.</p>
                  <p className="text-[11px] font-medium opacity-60">
                    Garage · {hud.shipped} shipped
                  </p>
                </div>
              </div>
            </div>

            <div
              ref={cashRef}
              className="si-glass absolute left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-5"
              style={{ top: "max(12px, env(safe-area-inset-top))" }}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-b from-[#ffe08a] to-[#e9a92a] text-[15px] font-bold text-[#7a5410] shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)]">
                $
              </span>
              <Rolling
                value={hud.cash}
                className="min-w-[2.5ch] text-[22px] font-bold tabular-nums"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => audio.setMusic(!audio.music)}
                aria-pressed={audio.music}
                title={audio.music ? "Music off" : "Music on"}
                className={`si-glass pointer-events-auto hidden h-11 w-11 place-items-center rounded-2xl sm:grid ${audio.music ? "text-[#e5533c]" : ""}`}
              >
                <Music className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => audio.setMuted(!audio.muted)}
                aria-pressed={audio.muted}
                title={audio.muted ? "Unmute" : "Mute"}
                className="si-glass pointer-events-auto grid h-11 w-11 place-items-center rounded-2xl"
              >
                {audio.muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={pause}
                title="Pause (Esc)"
                className="si-glass pointer-events-auto grid h-11 w-11 place-items-center rounded-2xl"
              >
                <Pause className="h-5 w-5" />
              </button>
            </div>
          </div>

          {hud.tutorial && hud.objective && (
            <div
              key={hud.objective}
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 animate-scale-in"
              style={{ top: "calc(max(12px, env(safe-area-inset-top)) + 58px)" }}
            >
              <div className="flex items-center gap-2 whitespace-nowrap rounded-full bg-[#2c2f3d]/85 px-4 py-2 text-[14px] font-semibold text-white shadow-lg backdrop-blur">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#f6c64a] text-[11px] text-[#2c2f3d]">
                  !
                </span>
                {hud.objective}
              </div>
            </div>
          )}

          <div
            className="pointer-events-none absolute left-3 sm:left-5"
            style={{ bottom: "max(14px, env(safe-area-inset-bottom))" }}
          >
            <div className="si-glass flex items-center gap-2.5 rounded-2xl px-3 py-2">
              <Package className="h-5 w-5 text-[#25b2a0]" />
              <div className="flex gap-1">
                {Array.from({ length: hud.carry }, (_, i) => (
                  <span
                    key={i}
                    className={`h-3.5 w-2.5 rounded-[3px] transition-colors ${i < hud.stack ? "bg-[#25b2a0]" : "bg-[#2c2f3d]/15"}`}
                  />
                ))}
              </div>
              <span className="text-[13px] font-semibold tabular-nums">
                {hud.stack}/{hud.carry}
              </span>
            </div>
          </div>

          {!moved && playing && (
            <div
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 animate-fade-in"
              style={{ bottom: "max(22px, env(safe-area-inset-bottom))" }}
            >
              <p className="rounded-full bg-white/85 px-4 py-2 text-[14px] font-semibold shadow-lg backdrop-blur">
                <span className="hidden sm:inline">Drag anywhere or use WASD to walk</span>
                <span className="sm:hidden">Drag anywhere to walk</span>
              </p>
            </div>
          )}
        </>
      )}

      {/* ---- Title card ---- */}
      {(phase === "loading" || phase === "title" || phase === "failed") && (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-[#2c2f3d]/10 via-[#2c2f3d]/25 to-[#2c2f3d]/70 px-5">
          <div className="flex w-full max-w-md flex-col items-center text-center">
            <p className="rounded-full bg-white/85 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#e5533c] shadow">
              The Arcade · Sim
            </p>
            <h1
              className="mt-4 text-[clamp(52px,13vw,96px)] font-bold leading-[0.9] text-white"
              style={{
                textShadow:
                  "0 4px 0 #e5533c, 0 9px 0 rgba(44,47,61,0.35), 0 18px 40px rgba(44,47,61,0.35)",
              }}
            >
              Ship It
              <br />
              Inc.
            </h1>
            <p className="mt-5 max-w-xs text-[17px] font-medium leading-snug text-white drop-shadow">
              Start in a garage. Turn client briefs into websites. Ship them, get paid, grow.
            </p>

            {phase === "failed" ? (
              <p className="mt-8 rounded-2xl bg-white/90 px-5 py-4 text-[15px] font-medium shadow-lg">
                This game needs WebGL, and your browser has it switched off.
              </p>
            ) : (
              <button
                type="button"
                onClick={begin}
                disabled={phase === "loading"}
                className="si-cta mt-8 inline-flex h-16 items-center gap-3 rounded-full bg-[#e5533c] px-10 text-[22px] font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-1 disabled:opacity-70"
              >
                {phase === "loading" ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white" />
                    Opening the garage…
                  </>
                ) : (
                  <>
                    <Play className="h-6 w-6 fill-current" />
                    Start shipping
                  </>
                )}
              </button>
            )}

            <ul className="mt-8 grid w-full gap-2 text-left text-[14px] font-medium">
              {[
                ["🕹️", "Drag anywhere, or WASD, to walk"],
                ["📦", "Step into the white squares to pick up and drop work"],
                ["💵", "Walk over cash to collect it, stand on a pad to spend it"],
              ].map(([icon, text]) => (
                <li
                  key={text}
                  className="flex items-center gap-3 rounded-2xl bg-white/85 px-4 py-2.5 shadow backdrop-blur"
                >
                  <span className="text-[18px]">{icon}</span>
                  {text}
                </li>
              ))}
            </ul>

            <Link
              to="/fun"
              className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/90 underline-offset-4 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to the arcade
            </Link>
          </div>
        </div>
      )}

      {/* ---- Pause ---- */}
      {phase === "paused" && (
        <div className="absolute inset-0 grid place-items-center bg-[#2c2f3d]/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-[28px] bg-[#fffaf1] p-6 text-center shadow-2xl">
            <p className="text-[28px] font-bold">Paused</p>
            <p className="mt-1 text-[14px] font-medium opacity-60">
              ${hud.cash} in the bank · {hud.shipped} shipped
            </p>
            <div className="mt-6 grid gap-2.5">
              <button
                type="button"
                onClick={resume}
                className="si-cta inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#e5533c] py-3 text-[18px] font-bold text-white"
              >
                <Play className="h-5 w-5 fill-current" /> Resume
              </button>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2c2f3d]/8 py-3 text-[16px] font-semibold"
              >
                <RotateCcw className="h-4 w-4" /> Start over
              </button>
              <Link
                to="/fun"
                className="inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-[15px] font-semibold opacity-70 hover:opacity-100"
              >
                <ArrowLeft className="h-4 w-4" /> Back to the arcade
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** A number that counts towards its value instead of jumping. */
function Rolling({ value, className }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const shownRef = useRef(value);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const cur = shownRef.current;
      const diff = value - cur;
      if (Math.abs(diff) < 1) {
        shownRef.current = value;
        setShown(value);
        return;
      }
      const next = cur + Math.sign(diff) * Math.max(1, Math.abs(diff) * 0.18);
      shownRef.current = next;
      setShown(Math.round(next));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className={className}>{shown.toLocaleString("en-IN")}</span>;
}
