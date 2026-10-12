import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../theme";
import { mono, hand } from "../fonts";
import { prog, mix } from "../ease";

export const Label = ({ children, color = C.muted, style }: { children: ReactNode; color?: string; style?: CSSProperties }) => (
  <div
    style={{
      fontFamily: mono,
      fontSize: 20,
      letterSpacing: 3,
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/** A stack chip that pops in at `at`. */
export const Chip = ({ at, children, accent }: { at: number; children: ReactNode; accent: string }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 22);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 16px",
        borderRadius: 999,
        border: `1px solid ${C.hairline}`,
        background: "oklch(1 0 0 / 4%)",
        fontFamily: mono,
        fontSize: 19,
        color: C.ink,
        opacity: p,
        transform: `translateY(${mix(14, 0, p)}px) scale(${mix(0.92, 1, p)})`,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 99, background: accent }} />
      {children}
    </span>
  );
};

/** Handwritten note (Caveat), like the site's HandNote. Writes on left→right. */
export const HandNote = ({
  at,
  children,
  color = C.orange,
  rotate = -3,
  size = 46,
  style,
}: {
  at: number;
  children: ReactNode;
  color?: string;
  rotate?: number;
  size?: number;
  style?: CSSProperties;
}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 40);
  return (
    <div
      style={{
        fontFamily: hand,
        fontWeight: 700,
        fontSize: size,
        color,
        transform: `rotate(${rotate}deg)`,
        clipPath: `inset(-20% ${mix(100, -5, p)}% -20% -5%)`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Hand-drawn underline stroke, drawn on. */
export const Squiggle = ({ at, width, color = C.red, dur = 26 }: { at: number; width: number; color?: string; dur?: number }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur);
  const len = width * 1.15;
  return (
    <svg width={width} height={28} viewBox={`0 0 ${width} 28`} style={{ display: "block", overflow: "visible" }}>
      <path
        d={`M4 18 C ${width * 0.2} 8, ${width * 0.35} 24, ${width * 0.52} 14 S ${width * 0.82} 8, ${width - 4} 16`}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - p)}
      />
    </svg>
  );
};

/** Dot grid like the site's `.dot-grid`. */
export const DotGrid = ({ opacity = 0.5, shift = 0 }: { opacity?: number; shift?: number }) => (
  <div
    style={{
      position: "absolute",
      inset: -60,
      opacity,
      backgroundImage: "radial-gradient(oklch(1 0 0 / 14%) 1.2px, transparent 1.4px)",
      backgroundSize: "34px 34px",
      transform: `translateY(${shift}px)`,
    }}
  />
);
