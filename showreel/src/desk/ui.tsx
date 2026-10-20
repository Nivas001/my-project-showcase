import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { K, hand, lift, mono, pixel, sans } from "./theme";
import { inOut, mix, prog } from "../ease";

/* -------------------------------------------------------------------------- */
/* Surfaces                                                                    */
/* -------------------------------------------------------------------------- */

/** Desk paper: a flat warm sheet with a soft key light from the upper left. */
export const Paper = ({ tint = K.paper, dots = 0, shift = 0 }: { tint?: string; dots?: number; shift?: number }) => (
  <AbsoluteFill style={{ background: tint }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 80% 70% at 28% 22%, rgba(255,255,255,0.55), transparent 62%), radial-gradient(ellipse 90% 80% at 80% 110%, rgba(120,95,50,0.10), transparent 70%)",
      }}
    />
    {dots > 0 && (
      <div
        style={{
          position: "absolute",
          inset: -80,
          opacity: dots,
          backgroundImage: "radial-gradient(rgba(23,22,15,0.22) 1.3px, transparent 1.6px)",
          backgroundSize: "32px 32px",
          transform: `translateY(${shift}px)`,
        }}
      />
    )}
  </AbsoluteFill>
);

/**
 * Paper grain + a warm lens falloff over everything. Re-seeded every two
 * frames so it reads as 30fps grain on a 60fps picture.
 */
export const Grain = ({ amount = 0.11 }: { amount?: number }) => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 89;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: amount, mixBlendMode: "multiply" }}>
        <filter id={`pg${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 1.6 -0.35" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#pg${seed})`} />
      </svg>
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse 125% 95% at 50% 45%, transparent 58%, rgba(70,50,20,0.22) 100%)" }}
      />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* Window chrome                                                               */
/* -------------------------------------------------------------------------- */

export const Lights = ({ size = 13 }: { size?: number }) => (
  <div style={{ display: "flex", gap: size * 0.62 }}>
    {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
      <span
        key={c}
        style={{
          width: size,
          height: size,
          borderRadius: size,
          background: c,
          boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.18)",
        }}
      />
    ))}
  </div>
);

/** A light macOS window: traffic lights, centred URL pill, paper shadow. */
export const Win = ({
  url,
  width,
  children,
  style,
  h = 1.4,
  bar = 46,
  dark = false,
}: {
  url?: string;
  width: number;
  children: ReactNode;
  style?: CSSProperties;
  h?: number;
  bar?: number;
  dark?: boolean;
}) => (
  <div
    style={{
      width,
      borderRadius: 16,
      overflow: "hidden",
      background: dark ? "#1E1E22" : K.card,
      boxShadow: `0 0 0 1px ${dark ? "rgba(0,0,0,0.5)" : "rgba(23,22,15,0.10)"}, ${lift(h)}`,
      ...style,
    }}
  >
    <div
      style={{
        height: bar,
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "0 18px",
        background: dark ? "#2A2A2F" : "#F6F4EF",
        borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : K.lineSoft}`,
      }}
    >
      <Lights size={bar * 0.28} />
      {url && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            height: bar * 0.62,
            padding: `0 ${bar * 0.5}px`,
            borderRadius: 99,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: dark ? "rgba(255,255,255,0.07)" : "rgba(23,22,15,0.05)",
            fontFamily: mono,
            fontSize: bar * 0.32,
            color: dark ? "rgba(255,255,255,0.6)" : K.ink2,
            whiteSpace: "nowrap",
          }}
        >
          <svg width={bar * 0.24} height={bar * 0.28} viewBox="0 0 10 12" style={{ opacity: 0.6 }}>
            <rect x="1" y="5" width="8" height="6.5" rx="1.4" fill="currentColor" />
            <path d="M3 5V3.6a2 2 0 0 1 4 0V5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          {url}
        </div>
      )}
    </div>
    <div style={{ position: "relative", overflow: "hidden" }}>{children}</div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Paper things that land on the desk                                         */
/* -------------------------------------------------------------------------- */

/** 0→1 with overshoot, for things that get slapped down. */
export const useSlap = (at: number, damping = 13, stiffness = 210) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: { damping, stiffness, mass: 0.7 } });
};

/** Square sticky note with a strip of tape. Slaps down at `at`. */
export const Sticky = ({
  at,
  children,
  color = K.sticky.yellow,
  rotate = -3,
  w = 230,
  hgt,
  size = 40,
  tape = true,
  style,
}: {
  at: number;
  children: ReactNode;
  color?: string;
  rotate?: number;
  w?: number;
  hgt?: number;
  size?: number;
  tape?: boolean;
  style?: CSSProperties;
}) => {
  const f = useCurrentFrame();
  const s = useSlap(at);
  const shown = f >= at;
  const o = interpolate(f, [at, at + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        width: w,
        minHeight: hgt ?? w * 0.9,
        padding: `${w * 0.11}px ${w * 0.1}px`,
        boxSizing: "border-box",
        background: `linear-gradient(170deg, ${color} 0%, ${color} 70%, color-mix(in oklab, ${color} 88%, #7a5a20) 100%)`,
        fontFamily: hand,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.08,
        color: K.ink,
        position: "relative",
        opacity: shown ? o : 0,
        transform: `rotate(${mix(rotate - 9, rotate, s)}deg) scale(${mix(1.35, 1, s)})`,
        boxShadow: lift(mix(5, 0.7, Math.min(1, s))),
        borderBottomRightRadius: "22px 8px",
        ...style,
      }}
    >
      {tape && (
        <div
          style={{
            position: "absolute",
            top: -14,
            left: "50%",
            width: w * 0.42,
            height: 28,
            transform: "translateX(-50%) rotate(-3deg)",
            background: "rgba(255, 255, 250, 0.55)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            backdropFilter: "none",
          }}
        />
      )}
      {children}
    </div>
  );
};

/** Die-cut vinyl sticker: thick white border, pops in with overshoot. */
export const Sticker = ({
  at,
  children,
  bg = K.blue,
  fg = "#fff",
  rotate = -6,
  size = 30,
  font = sans,
  weight = 700,
  radius = 999,
  pad = "12px 26px",
  style,
}: {
  at: number;
  children: ReactNode;
  bg?: string;
  fg?: string;
  rotate?: number;
  size?: number;
  font?: string;
  weight?: number;
  radius?: number;
  pad?: string;
  style?: CSSProperties;
}) => {
  const f = useCurrentFrame();
  const s = useSlap(at, 10, 240);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: pad,
        borderRadius: radius,
        background: bg,
        color: fg,
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: -0.3,
        whiteSpace: "nowrap",
        border: "7px solid #FFFFFF",
        boxShadow: lift(0.8),
        opacity: f >= at ? 1 : 0,
        transform: `rotate(${mix(rotate + 14, rotate, s)}deg) scale(${Math.max(0, s)})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Pastel tag for a stack item. */
export const Tag = ({ at, children, dot }: { at: number; children: ReactNode; dot: string }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 22);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 16px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.72)",
        boxShadow: `0 0 0 1px ${K.line}, 0 2px 0 rgba(23,22,15,0.06)`,
        fontFamily: mono,
        fontSize: 19,
        color: K.ink,
        opacity: p,
        transform: `translateY(${mix(14, 0, p)}px) scale(${mix(0.92, 1, p)})`,
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: 2, background: dot }} />
      {children}
    </span>
  );
};

/** Mono kicker label. */
export const Kicker = ({ children, color = K.ink2, style }: { children: ReactNode; color?: string; style?: CSSProperties }) => (
  <div style={{ fontFamily: mono, fontSize: 19, letterSpacing: 3.2, textTransform: "uppercase", color, ...style }}>{children}</div>
);

/** Highlighter stroke behind a phrase, swept left→right. */
export const Marker = ({ at, children, color = K.blue, ink = "#fff", dur = 22 }: { at: number; children: ReactNode; color?: string; ink?: string; dur?: number }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur, inOut);
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0 0.14em" }}>
      <span
        style={{
          position: "absolute",
          inset: "0.06em 0 0.02em 0",
          background: color,
          borderRadius: "0.12em 0.2em 0.16em 0.1em",
          transform: `scaleX(${p}) rotate(-1deg)`,
          transformOrigin: "0% 50%",
        }}
      />
      <span style={{ position: "relative", color: p > 0.55 ? ink : "inherit" }}>{children}</span>
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* Pixel bits                                                                  */
/* -------------------------------------------------------------------------- */

const PROMPT_PX = [
  [0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2], [1, 3], [2, 3], [0, 4], [1, 4],
];

/** The `>_` app icon, drawn in blocks. `cursor` toggles the underscore. */
export const PixelPrompt = ({ size = 8, color = K.phosphor, cursor = true, glow = false }: { size?: number; color?: string; cursor?: boolean; glow?: boolean }) => (
  <svg width={size * 9} height={size * 6} viewBox="0 0 9 6" shapeRendering="crispEdges" style={{ display: "block", overflow: "visible", filter: glow ? `drop-shadow(0 0 ${size * 0.8}px ${color})` : undefined }}>
    {PROMPT_PX.map(([x, y]) => (
      <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={color} />
    ))}
    {cursor && <rect x={4.5} y={4.6} width={3.5} height={1} fill={color} />}
  </svg>
);

export const PixelLabel = ({ children, size = 16, color = K.ink, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) => (
  <span style={{ fontFamily: pixel, fontSize: size, letterSpacing: 1, color, textTransform: "uppercase", ...style }}>{children}</span>
);

/* -------------------------------------------------------------------------- */
/* Transitions                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Vertical blue stripes, after the reference GIF. `dir` "out": a full blue
 * frame thins into stripes and clears left→right. "in": the reverse.
 */
export const StripeWipe = ({ at, dur = 54, dir = "out", color = K.blue, cols = 44 }: { at: number; dur?: number; dir?: "in" | "out"; color?: string; cols?: number }) => {
  const f = useCurrentFrame();
  const t = (f - at) / dur;
  if (t >= 1.2 && dir === "out") return null;
  if (t < -0.2 && dir === "in") return null;
  const W = 1920;
  const H = 1080;
  const cw = W / cols;
  const rows = 18;
  const polys: string[] = [];
  for (let i = 0; i < cols; i++) {
    const u = i / (cols - 1);
    const left: string[] = [];
    const right: string[] = [];
    for (let r = 0; r <= rows; r++) {
      const v = r / rows;
      // A diamond-shaped front: the middle of the frame leads the edges.
      const lag = u * 0.55 + Math.abs(v - 0.5) * 0.32 + 0.05 * Math.sin(u * 9 + v * 3);
      const q = Math.min(1, Math.max(0, (t - lag + 0.05) / 0.42));
      const e = q * q * (3 - 2 * q);
      const fill = dir === "out" ? 1 - e : e;
      const x1 = (i + 1) * cw;
      const x0 = x1 - cw * fill * 1.02;
      const y = v * H;
      left.push(`${x0.toFixed(1)},${y.toFixed(1)}`);
      right.unshift(`${x1.toFixed(1)},${y.toFixed(1)}`);
    }
    polys.push([...left, ...right].join(" "));
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {polys.map((p, i) => (
          <polygon key={i} points={p} fill={color} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* Construction lines (logo-guideline look)                                   */
/* -------------------------------------------------------------------------- */

export type Guide = { x?: number; y?: number; from: number; to: number; at: number; label?: string };

export const Guides = ({ lines, opacity = 1, color = "rgba(23,22,15,0.22)" }: { lines: Guide[]; opacity?: number; color?: string }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      {lines.map((g, i) => {
        const p = prog(f, g.at, 40, inOut);
        const horiz = g.y !== undefined;
        const len = g.to - g.from;
        return (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                left: horiz ? g.from : g.x,
                top: horiz ? g.y : g.from,
                width: horiz ? len : 1,
                height: horiz ? 1 : len,
                background: color,
                transform: horiz ? `scaleX(${p})` : `scaleY(${p})`,
                transformOrigin: "0 0",
              }}
            />
            {g.label && (
              <div
                style={{
                  position: "absolute",
                  left: horiz ? g.from + 8 : (g.x ?? 0) + 8,
                  top: horiz ? (g.y ?? 0) - 22 : g.from + 6,
                  fontFamily: mono,
                  fontSize: 13,
                  color: "rgba(23,22,15,0.45)",
                  opacity: prog(f, g.at + 20, 20),
                }}
              >
                {g.label}
              </div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* OS chrome                                                                   */
/* -------------------------------------------------------------------------- */

export const MenuBar = ({ label, minute, opacity = 1 }: { label: string; minute: number; opacity?: number }) => {
  const mm = String(41 + minute).padStart(2, "0");
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 40,
        display: "flex",
        alignItems: "center",
        padding: "0 22px",
        gap: 26,
        background: "rgba(252, 251, 247, 0.78)",
        borderBottom: `1px solid ${K.lineSoft}`,
        fontFamily: sans,
        fontSize: 16,
        color: K.ink,
        opacity,
      }}
    >
      <PixelPrompt size={2.6} color={K.ink} />
      <span style={{ fontWeight: 600 }}>nivas.tech</span>
      {["File", "Edit", "View", "Projects", "Window", "Help"].map((m) => (
        <span key={m} style={{ color: K.ink2 }}>
          {m}
        </span>
      ))}
      <span style={{ flex: 1 }} />
      <span style={{ fontFamily: mono, fontSize: 14, color: K.dim, letterSpacing: 0.5 }}>{label}</span>
      <svg width="20" height="14" viewBox="0 0 20 14" style={{ opacity: 0.8 }}>
        <path d="M10 13 L1.5 4.2 A12 12 0 0 1 18.5 4.2 Z" fill={K.ink} />
      </svg>
      <svg width="28" height="14" viewBox="0 0 28 14">
        <rect x="0.5" y="0.5" width="23" height="13" rx="3.5" fill="none" stroke={K.ink} strokeOpacity="0.5" />
        <rect x="2.5" y="2.5" width="16" height="9" rx="2" fill={K.ink} />
        <rect x="25" y="4.5" width="2" height="5" rx="1" fill={K.ink} fillOpacity="0.5" />
      </svg>
      <span style={{ fontWeight: 500 }}>Tue 21 Oct&nbsp;&nbsp;9:{mm} AM</span>
    </div>
  );
};

/** A desktop folder icon with a label, in a project colour. */
export const Folder = ({ color, label, size = 92 }: { color: string; label: string; size?: number }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: size * 2.2 }}>
    <svg width={size} height={size * 0.8} viewBox="0 0 100 80" style={{ filter: "drop-shadow(0 6px 8px rgba(40,30,10,0.18))" }}>
      <path d="M4 14 a6 6 0 0 1 6-6 h26 l8 8 h46 a6 6 0 0 1 6 6 v6 H4z" fill={`color-mix(in oklab, ${color} 78%, #000)`} />
      <rect x="4" y="22" width="92" height="54" rx="7" fill={color} />
      <rect x="4" y="22" width="92" height="10" rx="5" fill="rgba(255,255,255,0.25)" />
    </svg>
    <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 19, color: K.ink, textAlign: "center", lineHeight: 1.2 }}>{label}</div>
  </div>
);
