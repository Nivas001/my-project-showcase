import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { prog, mix } from "../ease";

/**
 * A line that rises out of a clipping mask — the way the site's SplitLines
 * enter. `exit` (frame) sends it up and out the top.
 */
export const MaskLine = ({
  at,
  children,
  dur = 34,
  exit,
  exitDur = 22,
  style,
}: {
  at: number;
  children: ReactNode;
  dur?: number;
  exit?: number;
  exitDur?: number;
  style?: CSSProperties;
}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur);
  const q = exit === undefined ? 0 : prog(f, exit, exitDur);
  const y = mix(105, 0, p) + mix(0, -105, q);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em", ...style }}>
      <div style={{ transform: `translateY(${y}%)`, willChange: "transform" }}>{children}</div>
    </div>
  );
};

/** Per-letter mask reveal, staggered. */
export const MaskLetters = ({
  text,
  at,
  stagger = 2,
  dur = 40,
  style,
}: {
  text: string;
  at: number;
  stagger?: number;
  dur?: number;
  style?: CSSProperties;
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", overflow: "hidden", paddingBottom: "0.1em", ...style }}>
      {[...text].map((ch, i) => {
        const p = prog(f, at + i * stagger, dur);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${mix(110, 0, p)}%) rotate(${mix(8, 0, p)}deg)`,
              transformOrigin: "0% 100%",
              whiteSpace: "pre",
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** Fade + small lift. */
export const Rise = ({
  at,
  children,
  dur = 30,
  dist = 24,
  style,
}: {
  at: number;
  children: ReactNode;
  dur?: number;
  dist?: number;
  style?: CSSProperties;
}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur);
  return (
    <div style={{ opacity: p, transform: `translateY(${mix(dist, 0, p)}px)`, ...style }}>{children}</div>
  );
};
