import { useEffect, useState, type ComponentType, type CSSProperties } from "react";

/* ==========================================================================
 * DOCK MARKS
 *
 * Purpose-drawn glyphs for the dock, in the same house style as
 * kit/TechMark.tsx: a 24×24 box, `currentColor`, stroke-led geometry, and
 * deliberately not anyone's real logo.
 *
 * These exist because the dock was reading as a row of stock icons — a folder
 * for "Work", a compass for "Live sites", a terminal for "Contact". A dock icon
 * has to say what the thing *is* at 46px, so each mark here is drawn for its
 * one destination rather than picked from a set.
 * ======================================================================== */

export type AppGlyph = ComponentType<{
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}>;

type MarkProps = { className?: string; style?: CSSProperties; strokeWidth?: number };

function Mark({
  children,
  className,
  style,
  strokeWidth = 1.7,
}: MarkProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Work — a folder with a document edge showing, not a bare folder. */
export const WorkMark: AppGlyph = (props) => (
  <Mark {...props}>
    <path d="M3 7.5a1.5 1.5 0 0 1 1.5-1.5h4l2 2.2h8A1.5 1.5 0 0 1 20 9.7v8.8a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3 18.5Z" />
    <path d="M7.5 6V4.4a.9.9 0 0 1 .9-.9h6.2a.9.9 0 0 1 .9.9V8.2" opacity="0.55" />
    <path d="M7 14.5h6" opacity="0.7" />
  </Mark>
);

/** Projects — stacked planes, the stack metaphor for "many of these". */
export const StackMark: AppGlyph = (props) => (
  <Mark {...props}>
    <path d="m12 3.5 8.2 4.2-8.2 4.2L3.8 7.7Z" />
    <path d="m4.4 11.6-.6.3 8.2 4.2 8.2-4.2-.6-.3" opacity="0.7" />
    <path d="m4.4 15.6-.6.3 8.2 4.2 8.2-4.2-.6-.3" opacity="0.45" />
  </Mark>
);

/** About — a portrait bust inside a frame, rather than a generic user icon. */
export const AboutMark: AppGlyph = (props) => (
  <Mark {...props}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3.2" />
    <circle cx="12" cy="10" r="2.9" />
    <path d="M6.6 18.4a5.7 5.7 0 0 1 10.8 0" />
  </Mark>
);

/** Arcade — a joystick, which reads faster at 46px than a gamepad. */
export const ArcadeMark: AppGlyph = (props) => (
  <Mark {...props}>
    <circle cx="12" cy="5.8" r="2.4" />
    <path d="M12 8.2v5.4" />
    <path d="M4.6 20.2a2 2 0 0 1-1.4-2.4l.7-2.5a2.4 2.4 0 0 1 2.3-1.7h11.6a2.4 2.4 0 0 1 2.3 1.7l.7 2.5a2 2 0 0 1-1.4 2.4Z" />
    <path d="M7.4 17.2h1.8M16.6 17.2h.01" opacity="0.7" />
  </Mark>
);

/** Stories — an open book with a ribbon. */
export const StoriesMark: AppGlyph = (props) => (
  <Mark {...props}>
    <path d="M12 6.6C10.3 5.2 8.2 4.6 5 4.6a1 1 0 0 0-1 1v11.5a1 1 0 0 0 1 1c3.2 0 5.3.6 7 2 1.7-1.4 3.8-2 7-2a1 1 0 0 0 1-1V5.6a1 1 0 0 0-1-1c-3.2 0-5.3.6-7 2Z" />
    <path d="M12 6.6v13" opacity="0.6" />
    <path d="M15.6 4.8v5l1.7-1.2 1.7 1.2v-5" opacity="0.7" />
  </Mark>
);

/** Contact — a shell prompt. The site's contact page is a terminal. */
export const TerminalMark: AppGlyph = (props) => (
  <Mark {...props}>
    <rect x="2.8" y="4.2" width="18.4" height="15.6" rx="2.6" />
    <path d="M6.8 9.4 9.6 12l-2.8 2.6" />
    <path d="M12.4 15h4.4" opacity="0.75" />
  </Mark>
);

/** Launchpad — the grid of everything. */
export const LaunchpadMark: AppGlyph = (props) => (
  <Mark {...props} strokeWidth={0}>
    <g fill="currentColor">
      {[5.2, 12, 18.8].map((y) =>
        [5.2, 12, 18.8].map((x) => (
          <rect key={`${x}-${y}`} x={x - 2.3} y={y - 2.3} width="4.6" height="4.6" rx="1.5" />
        )),
      )}
    </g>
  </Mark>
);

/** Live sites — a browser window with a signal, not a compass. */
export const LiveMark: AppGlyph = (props) => (
  <Mark {...props}>
    <rect x="2.8" y="4.4" width="18.4" height="15.2" rx="2.6" />
    <path d="M2.8 8.6h18.4" opacity="0.7" />
    <circle cx="5.9" cy="6.5" r="0.8" fill="currentColor" stroke="none" opacity="0.8" />
    <path d="M9.4 15.6a3.7 3.7 0 0 1 5.2 0M11.3 17.4h1.4" />
  </Mark>
);

/** The social stack — overlapping link chain. */
export const SocialMark: AppGlyph = (props) => (
  <Mark {...props}>
    <path d="M10.2 13.8a3.4 3.4 0 0 0 5.1.4l2.6-2.6a3.4 3.4 0 0 0-4.8-4.8l-1.5 1.5" />
    <path d="M13.8 10.2a3.4 3.4 0 0 0-5.1-.4l-2.6 2.6a3.4 3.4 0 0 0 4.8 4.8l1.5-1.5" />
  </Mark>
);

/** Trash, drawn rather than borrowed so it matches the rest of the row. */
export const TrashMark: AppGlyph = (props) => (
  <Mark {...props}>
    <path d="M4.8 6.8h14.4" />
    <path d="M9.4 6.8V5.2a1.2 1.2 0 0 1 1.2-1.2h2.8a1.2 1.2 0 0 1 1.2 1.2v1.6" />
    <path d="M6.6 6.8 7.5 19a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l.9-12.2" />
    <path d="M10.6 10.4v6M13.4 10.4v6" opacity="0.6" />
  </Mark>
);

/* --------------------------------------------------------------------------
 * Live widget faces
 *
 * These read the clock rather than drawing a picture of one. The dock's whole
 * claim is that it is real, and a calendar frozen on the 12th undercuts that
 * more than having no calendar at all.
 *
 * Both wait for mount before reading the time. The server renders at one
 * instant and the client hydrates at another, so reading `new Date()` during
 * render is a guaranteed hydration mismatch — and on a clock it mismatches
 * every single time.
 * ------------------------------------------------------------------------ */

/** Null until mounted, so the server and the client agree on the first paint. */
function useNow(tickMs?: number) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    if (!tickMs) return;
    const id = window.setInterval(() => setNow(new Date()), tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);

  return now;
}

/** A calendar tile showing today's actual date. */
export function CalendarFace({ size }: { size: number }) {
  // Ticks hourly: cheap insurance for a tab left open across midnight.
  const now = useNow(3_600_000);
  const month = now ? now.toLocaleDateString(undefined, { month: "short" }).toUpperCase() : "";
  const day = now ? now.getDate() : "";

  return (
    <span
      className="grid place-items-center overflow-hidden rounded-[inherit] leading-none"
      style={{ width: size, height: size }}
    >
      <span className="flex h-full w-full flex-col">
        <span
          className="grid place-items-center font-mono font-bold tracking-widest text-white"
          style={{ height: size * 0.3, fontSize: size * 0.17, background: "oklch(0.55 0.21 25)" }}
        >
          {month}
        </span>
        <span
          className="grid flex-1 place-items-center font-display font-bold"
          style={{ fontSize: size * 0.46, color: "oklch(0.2 0 0)" }}
        >
          {day}
        </span>
      </span>
    </span>
  );
}

/** An analog clock whose hands sit where the hands actually are. */
export function ClockFace({ size }: { size: number }) {
  // Ticks every half minute — enough for a minute hand at 46px.
  const now = useNow(30_000);
  const minute = now ? now.getMinutes() : 0;
  const hour = now ? now.getHours() % 12 : 0;
  const minuteAngle = minute * 6;
  const hourAngle = hour * 30 + minute * 0.5;

  return (
    <svg viewBox="0 0 48 48" style={{ width: size, height: size }} aria-hidden>
      <circle cx="24" cy="24" r="21" fill="oklch(0.99 0 0)" />
      <circle cx="24" cy="24" r="21" fill="none" stroke="oklch(0.8 0 0)" strokeWidth="1" />
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1="24"
          y1="6.5"
          x2="24"
          y2={i % 3 === 0 ? 10 : 8.6}
          stroke="oklch(0.45 0 0)"
          strokeWidth={i % 3 === 0 ? 1.6 : 0.9}
          transform={`rotate(${i * 30} 24 24)`}
        />
      ))}
      <line
        x1="24"
        y1="24"
        x2="24"
        y2="14"
        stroke="oklch(0.2 0 0)"
        strokeWidth="2.4"
        strokeLinecap="round"
        transform={`rotate(${hourAngle} 24 24)`}
      />
      <line
        x1="24"
        y1="24"
        x2="24"
        y2="9.5"
        stroke="oklch(0.2 0 0)"
        strokeWidth="1.7"
        strokeLinecap="round"
        transform={`rotate(${minuteAngle} 24 24)`}
      />
      <circle cx="24" cy="24" r="1.9" fill="oklch(0.55 0.21 25)" />
    </svg>
  );
}
