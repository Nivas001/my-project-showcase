import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ==========================================================================
 * HAND-DRAWN MARKS
 *
 * The site is annotated, not just laid out: things get circled, underlined,
 * boxed and struck through as though someone went over the page afterwards.
 *
 * Every mark is an SVG stroke that draws itself once it scrolls into view.
 * Path length is measured with getTotalLength() rather than hard-coded, so a
 * path can be edited without hunting for the matching dash-array constant.
 *
 * QUIET MODE. The minimal redesign retired the pen. Marked and Highlight now
 * render their text plainly; HandNote, ScribbleArrow and StarMark render
 * nothing; StickyNote is a flat aside. The signatures are unchanged so every
 * page still compiles, and the drawing code stays for CheckMark, which is
 * still used as a list tick.
 * ======================================================================== */

/** Fires once, when the element has been on screen for a beat. */
function useDrawn<T extends Element>(rootMargin = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setDrawn(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setDrawn(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin, threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, drawn };
}

type MarkProps = {
  /** A `hog-*` / `signature` colour token name. */
  tone?: string;
  className?: string;
  /** Milliseconds before the stroke starts. */
  delay?: number;
  /** Milliseconds the stroke takes. */
  duration?: number;
  strokeWidth?: number;
  /** Draw immediately instead of waiting to scroll into view. */
  immediate?: boolean;
};

/**
 * The shared stroke renderer. Measures each path on mount and hands the length
 * to CSS as `--mark-len` so the dash animation lands exactly on zero.
 */
function MarkSvg({
  viewBox,
  paths,
  tone = "hog-red",
  className,
  delay = 0,
  duration = 720,
  strokeWidth = 3,
  immediate = false,
  preserveAspectRatio = "none",
}: MarkProps & {
  viewBox: string;
  paths: readonly string[];
  preserveAspectRatio?: string;
}) {
  const { ref, drawn } = useDrawn<SVGSVGElement>();
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const [lengths, setLengths] = useState<number[]>([]);

  useEffect(() => {
    const measured = pathRefs.current.map((path) => {
      try {
        return path?.getTotalLength() ?? 0;
      } catch {
        // Engines without SVG geometry (or a detached node) report nothing;
        // the CSS fallback length covers it.
        return 0;
      }
    });
    setLengths(measured);
  }, [paths]);

  const play = immediate || drawn;

  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox={viewBox}
      fill="none"
      preserveAspectRatio={preserveAspectRatio}
      className={cn("pointer-events-none overflow-visible", className)}
      style={{ color: `var(--${tone})` }}
    >
      {paths.map((d, i) => (
        <path
          key={d}
          ref={(node) => {
            pathRefs.current[i] = node;
          }}
          d={d}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={cn("mark-path", play && "mark-draw")}
          style={
            {
              "--mark-len": lengths[i] ? String(lengths[i]) : "600",
              "--mark-dur": `${duration}ms`,
              "--mark-delay": `${delay + i * 110}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </svg>
  );
}

/* --------------------------------------------------------------------------
 * The marks themselves. Deliberately imperfect — ends that overshoot, uneven
 * curvature, and a second pass that does not retrace the first.
 * ------------------------------------------------------------------------ */

const CIRCLE_PATHS = [
  "M40 16C92 2 168 6 196 28c22 17 12 44-34 56C110 96 38 92 14 70 -4 53 6 28 44 12",
] as const;

const OVAL_PATHS = [
  "M28 22C74 4 156 2 190 20c26 14 22 42-22 56C120 91 44 88 16 68 -2 55 2 30 34 16",
  "M186 26c14 14 8 34-26 46",
] as const;

const UNDERLINE_PATHS = ["M4 11C54 3 128 2 216 9", "M12 18C68 12 142 12 206 17"] as const;

const SINGLE_UNDERLINE = ["M4 11C58 2 130 3 216 10"] as const;

const BOX_PATHS = [
  "M10 12C70 5 152 5 212 11c6 20 6 44 1 62-62 7-142 7-204 1C4 55 4 30 10 12",
  "M14 16c62-6 140-6 196-1",
] as const;

const STRIKE_PATHS = ["M4 13C62 5 150 17 218 8"] as const;

const BRACKET_PATHS = [
  "M22 4C8 6 5 14 5 24v18c0 10 3 18 17 20",
  "M198 4c14 2 17 10 17 20v18c0 10-3 18-17 20",
] as const;

const STAR_PATHS = ["M24 4v40M4 24h40M9 9l30 30M39 9L9 39"] as const;

const CHECK_PATHS = ["M4 22c8 4 14 10 18 18C30 24 42 10 58 3"] as const;

export type MarkKind = "circle" | "oval" | "underline" | "line" | "box" | "strike" | "bracket";

const KINDS: Record<MarkKind, { viewBox: string; paths: readonly string[]; strokeWidth: number }> =
  {
    circle: { viewBox: "0 0 210 100", paths: CIRCLE_PATHS, strokeWidth: 3.2 },
    oval: { viewBox: "0 0 210 96", paths: OVAL_PATHS, strokeWidth: 3 },
    underline: { viewBox: "0 0 220 22", paths: UNDERLINE_PATHS, strokeWidth: 3.2 },
    line: { viewBox: "0 0 220 16", paths: SINGLE_UNDERLINE, strokeWidth: 3.2 },
    box: { viewBox: "0 0 222 80", paths: BOX_PATHS, strokeWidth: 2.8 },
    strike: { viewBox: "0 0 222 22", paths: STRIKE_PATHS, strokeWidth: 3 },
    bracket: { viewBox: "0 0 220 88", paths: BRACKET_PATHS, strokeWidth: 3 },
  };

/**
 * Wraps a phrase and draws a mark over it.
 *
 *   <Marked kind="circle" tone="signature">Full-stack</Marked>
 *
 * The mark is absolutely positioned and pointer-events: none, so it never
 * affects layout or selection — the text underneath stays ordinary text.
 */
export function Marked({
  children,
  className,
}: {
  children: ReactNode;
  kind?: MarkKind;
  tone?: string;
  delay?: number;
  duration?: number;
  className?: string;
  markClassName?: string;
  immediate?: boolean;
}) {
  return <span className={className}>{children}</span>;
}

/** A marker highlight that sweeps in behind a phrase. */
export function Highlight({
  children,
  className,
}: {
  children: ReactNode;
  tone?: string;
  delay?: number;
  className?: string;
}) {
  return <span className={className}>{children}</span>;
}

/** Loose asterisk / sparkle, for marking something as new or important. */
export function StarMark(_: { tone?: string; className?: string; delay?: number }) {
  return null;
}

/** Hand-drawn tick, for checklists that should not look like a UI component. */
export function CheckMark({
  tone = "hog-green",
  className,
  delay = 0,
}: {
  tone?: string;
  className?: string;
  delay?: number;
}) {
  return (
    <MarkSvg
      viewBox="0 0 62 44"
      paths={CHECK_PATHS}
      tone={tone}
      delay={delay}
      duration={420}
      strokeWidth={4}
      preserveAspectRatio="xMidYMid meet"
      className={cn("h-4 w-5", className)}
    />
  );
}

/* --------------------------------------------------------------------------
 * Arrows
 * ------------------------------------------------------------------------ */

const ARROWS = {
  /** Sweeps down and to the right, head pointing down-right. */
  curve: ["M6 6c20 6 34 20 40 44", "M34 44c6 3 10 6 12 8M52 34c-3 7-5 12-6 18"],
  /** Long horizontal swoop, head pointing right. */
  swoop: ["M4 34C24 6 62 4 92 18", "M76 6c8 4 13 8 16 12M78 30c7-5 12-9 14-12"],
  /** A full loop before the head — the "look at this" scribble. */
  loop: [
    "M8 8c26 2 42 14 44 30 1 11-9 17-16 12-8-6-2-19 12-21 16-3 30 6 36 21",
    "M74 38c6 3 9 6 11 12M92 42c-6 4-11 7-18 8",
  ],
  /** Points straight down with a wobble. */
  down: ["M20 4c6 18 4 34-2 50", "M8 42c5 5 8 9 10 14M30 44c-4 6-8 10-12 12"],
} as const;

export type ArrowKind = keyof typeof ARROWS;

const ARROW_BOXES: Record<ArrowKind, string> = {
  curve: "0 0 64 60",
  swoop: "0 0 100 44",
  loop: "0 0 100 56",
  down: "0 0 40 60",
};

/** A pen arrow that draws itself, for pointing at things in the margin. */
export function ScribbleArrow(_: {
  kind?: ArrowKind;
  tone?: string;
  className?: string;
  delay?: number;
  flipX?: boolean;
  flipY?: boolean;
}) {
  return null;
}

/* --------------------------------------------------------------------------
 * Notes
 * ------------------------------------------------------------------------ */

/**
 * A margin note: handwriting plus, optionally, an arrow pointing back at
 * whatever it is talking about.
 */
export function HandNote(_: {
  children: ReactNode;
  tone?: string;
  rotate?: number;
  arrow?: ArrowKind;
  arrowClassName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  hand?: "pen" | "marker";
}) {
  return null;
}

/**
 * A torn-off sticky note. Used where a longer aside would look wrong set in
 * body copy — a caveat, a joke, the bit worth being proud of.
 */
export function StickyNote({
  children,
  className,
}: {
  children: ReactNode;
  tone?: string;
  rotate?: number;
  className?: string;
  pin?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card px-5 py-4", className)}>
      <div className="text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
