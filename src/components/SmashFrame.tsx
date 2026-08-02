import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import portraitAsset from "@/assets/portrait.png.asset.json";

const MAX_HITS = 3;

type Spark = { id: number; x: number; y: number; dx: number; dy: number };

/** Deterministic pseudo-random so SSR and client agree. */
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildShards(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const cx = rand(i + 1) * 100;
    const cy = rand(i + 41) * 100;
    const pts = Array.from({ length: 3 }, (_, k) => {
      const a = (rand(i * 7 + k + 3) + k / 3) * Math.PI * 2;
      const r = 22 + rand(i * 13 + k + 9) * 42;
      return `${(cx + Math.cos(a) * r).toFixed(1)}% ${(cy + Math.sin(a) * r).toFixed(1)}%`;
    });
    const dir = (cx - 50) / 50;
    return {
      id: i,
      clip: `polygon(${pts.join(",")})`,
      dx: dir * (90 + rand(i + 77) * 160),
      dy: -60 - rand(i + 91) * 140,
      rot: (rand(i + 55) - 0.5) * 220,
      delay: rand(i + 23) * 120,
    };
  });
}

const CRACKS: string[][] = [
  ["M50,50 L26,14 M50,50 L78,20 M50,50 L44,88 M50,50 L88,62"],
  [
    "M50,50 L26,14 M50,50 L78,20 M50,50 L44,88 M50,50 L88,62",
    "M50,50 L8,44 M26,14 L14,4 M78,20 L92,8 M44,88 L30,98 M88,62 L98,80 M50,50 L64,96",
  ],
  [
    "M50,50 L26,14 M50,50 L78,20 M50,50 L44,88 M50,50 L88,62",
    "M50,50 L8,44 M26,14 L14,4 M78,20 L92,8 M44,88 L30,98 M88,62 L98,80 M50,50 L64,96",
    "M26,14 L8,44 M8,44 L44,88 M44,88 L88,62 M88,62 L78,20 M78,20 L26,14 M64,96 L88,62 M50,50 L18,74 M18,74 L44,88",
  ],
];

export function SmashFrame() {
  const [armed, setArmed] = useState(false);
  const [hits, setHits] = useState(0);
  const [swinging, setSwinging] = useState(false);
  const [shattered, setShattered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [typed, setTyped] = useState("");
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [shockwave, setShockwave] = useState<{ id: number; x: number; y: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  const shards = useMemo(() => buildShards(22), []);

  useEffect(() => {
    if (!armed) return;
    const move = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [armed]);

  useEffect(() => {
    if (!shattered) return;
    const t = window.setTimeout(() => setRevealed(true), 260);
    return () => window.clearTimeout(t);
  }, [shattered]);

  useEffect(() => {
    if (!revealed) return;
    const line = "it's me.";
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(line.slice(0, i));
      if (i >= line.length) window.clearInterval(id);
    }, 90);
    return () => window.clearInterval(id);
  }, [revealed]);

  const strike = useCallback(
    (clientX?: number, clientY?: number) => {
      if (!armed || shattered || swinging) return;
      const box = frameRef.current?.getBoundingClientRect();
      const px = clientX ?? (box ? box.left + box.width / 2 : 0);
      const py = clientY ?? (box ? box.top + box.height / 2 : 0);
      const localX = box ? ((px - box.left) / box.width) * 100 : 50;
      const localY = box ? ((py - box.top) / box.height) * 100 : 50;

      setSwinging(true);
      window.setTimeout(() => setSwinging(false), 320);

      const base = (seq.current += 1) * 100;
      setShockwave({ id: base, x: localX, y: localY });
      setSparks(
        Array.from({ length: 14 }, (_, i) => ({
          id: base + i,
          x: localX,
          y: localY,
          dx: (rand(base + i) - 0.5) * 260,
          dy: (rand(base + i + 33) - 0.5) * 260,
        })),
      );
      window.setTimeout(() => setSparks([]), 700);

      setHits((h) => {
        const next = h + 1;
        if (next >= MAX_HITS) window.setTimeout(() => setShattered(true), 120);
        return next;
      });
    },
    [armed, shattered, swinging],
  );

  const reset = () => {
    setHits(0);
    setShattered(false);
    setRevealed(false);
    setTyped("");
    setSparks([]);
    setShockwave(null);
  };

  const crackPaths = hits > 0 ? CRACKS[Math.min(hits, MAX_HITS) - 1]! : [];

  return (
    <div className={armed ? "smash cursor-none select-none" : "smash select-none"}>
      <div
        ref={frameRef}
        role="button"
        tabIndex={0}
        aria-label={shattered ? "Frame shattered" : "Hit the frame with the hammer"}
        onPointerDown={(e) => strike(e.clientX, e.clientY)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            strike();
          }
        }}
        className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-sm border-4 border-border bg-surface-raised shadow-[var(--shadow-glow)] outline-none focus-visible:border-primary sm:max-w-md"
        style={swinging ? { animation: "smash-shake 0.32s ease-out" } : undefined}
      >
        {/* revealed portrait */}
        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "scale(1)" : "scale(1.12)",
            transition: "opacity 900ms ease-out, transform 1200ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 blur-2xl"
            style={{
              background: "radial-gradient(circle at 50% 45%, var(--glow) 0%, transparent 70%)",
              opacity: revealed ? 0.45 : 0,
              transition: "opacity 1200ms ease-out",
            }}
          />
          <img
            src={portraitAsset.url}
            alt="Portrait of Srinivas revealed behind the broken frame"
            className="relative h-[92%] w-full object-contain object-bottom"
            style={revealed ? { animation: "hero-float 6s ease-in-out 1s infinite" } : undefined}
          />
        </div>

        {/* cover */}
        {!shattered && (
          <div
            className="absolute inset-0 grid-lines"
            style={{
              background:
                "linear-gradient(150deg, oklch(0.16 0.04 285) 0%, oklch(0.11 0.03 285) 100%)",
              opacity: 1 - hits * 0.16,
              transition: "opacity 250ms ease-out",
            }}
          >
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {armed ? "// strike" : "// sealed"}
              </span>
              <span className="font-mono text-[0.7rem] text-muted-foreground/70">
                {hits}/{MAX_HITS} hits
              </span>
            </div>
          </div>
        )}

        {/* cracks */}
        {!shattered && crackPaths.length > 0 && (
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            {crackPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={0.6}
                vectorEffect="non-scaling-stroke"
                style={{
                  filter: "drop-shadow(0 0 4px var(--glow))",
                  animation: "smash-crack 380ms ease-out both",
                }}
              />
            ))}
          </svg>
        )}

        {/* flying shards */}
        {shattered &&
          shards.map((s) => (
            <div
              key={s.id}
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={
                {
                  clipPath: s.clip,
                  background:
                    "linear-gradient(150deg, oklch(0.18 0.05 285) 0%, oklch(0.11 0.03 285) 100%)",
                  animation: `smash-shard 1s cubic-bezier(0.3,0.1,0.4,1) ${s.delay}ms both`,
                  ["--sx" as string]: `${s.dx}px`,
                  ["--sy" as string]: `${s.dy}px`,
                  ["--sr" as string]: `${s.rot}deg`,
                } as React.CSSProperties
              }
            />
          ))}

        {/* shockwave */}
        {shockwave && (
          <span
            key={shockwave.id}
            aria-hidden
            className="pointer-events-none absolute rounded-full border border-accent"
            style={{
              left: `${shockwave.x}%`,
              top: `${shockwave.y}%`,
              width: 20,
              height: 20,
              marginLeft: -10,
              marginTop: -10,
              animation: "smash-shock 600ms ease-out forwards",
            }}
          />
        )}

        {/* sparks */}
        {sparks.map((s) => (
          <span
            key={s.id}
            aria-hidden
            className="pointer-events-none absolute h-1 w-1 rounded-full bg-accent"
            style={
              {
                left: `${s.x}%`,
                top: `${s.y}%`,
                boxShadow: "0 0 8px var(--glow)",
                animation: "smash-spark 650ms ease-out forwards",
                ["--sx" as string]: `${s.dx}px`,
                ["--sy" as string]: `${s.dy}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-4">
        {revealed ? (
          <>
            <p className="font-mono text-lg text-accent text-glow">
              {typed}
              <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-accent align-middle" />
            </p>
            <button
              onClick={reset}
              className="font-mono text-xs text-muted-foreground transition-colors hover:text-accent"
            >
              // smash again
            </button>
          </>
        ) : (
          <>
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                setArmed(true);
                setPos({ x: e.clientX, y: e.clientY });
              }}
              aria-pressed={armed}
              className="rounded-sm border border-border px-5 py-2.5 font-mono text-sm transition-colors hover:border-primary"
              style={armed ? { opacity: 0.35 } : { animation: "smash-idle 2.4s ease-in-out infinite" }}
            >
              🔨 {armed ? "hammer in hand" : "pick up the hammer"}
            </button>
            <p className="font-mono text-xs text-muted-foreground">
              {armed ? "now hit the frame — three times" : "something is sealed behind that frame"}
            </p>
          </>
        )}
      </div>

      {/* cursor hammer */}
      {armed && !revealed && pos && (
        <span
          aria-hidden
          className="pointer-events-none fixed z-50 text-4xl"
          style={{
            left: pos.x,
            top: pos.y,
            transformOrigin: "20% 80%",
            transform: "translate(-10%, -70%)",
            animation: swinging
              ? "smash-swing 0.32s ease-out"
              : "smash-hold 2.6s ease-in-out infinite",
          }}
        >
          🔨
        </span>
      )}
    </div>
  );
}
