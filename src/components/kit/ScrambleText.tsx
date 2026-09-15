import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>[]{}*#%&$@";

/**
 * Cycles through phrases, resolving each one character by character out of a
 * wash of random glyphs.
 *
 * The visible element is `aria-hidden` and the current phrase is mirrored into a
 * polite live region, so a screen reader hears "Ani Bakes" rather than a stream
 * of punctuation.
 */
export function ScrambleText({
  phrases,
  interval = 2600,
  speed = 34,
  className,
}: {
  phrases: readonly string[];
  /** How long a resolved phrase is held before the next one starts. */
  interval?: number;
  /** Milliseconds per animation tick. */
  speed?: number;
  className?: string;
}) {
  const longest = phrases.reduce((a, b) => (b.length > a.length ? b : a), "");
  const [display, setDisplay] = useState(phrases[0] ?? "");
  const [index, setIndex] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const ids = timers.current;
    return () => ids.forEach((id) => window.clearInterval(id));
  }, []);

  useEffect(() => {
    if (phrases.length <= 1) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let tick: number | undefined;

    const cycle = window.setInterval(() => {
      const next = (index + 1) % phrases.length;
      const target = phrases[next] ?? "";

      if (reduced) {
        setDisplay(target);
        setIndex(next);
        return;
      }

      const from = phrases[index] ?? "";
      const length = Math.max(from.length, target.length);
      let step = 0;

      if (tick) window.clearInterval(tick);
      tick = window.setInterval(() => {
        step += 1;
        // Characters lock in left to right; everything past the front is noise.
        const settled = Math.floor(step / 1.6);
        let out = "";
        for (let i = 0; i < length; i += 1) {
          if (i < settled) out += target[i] ?? "";
          else if (i < target.length + 2) out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setDisplay(out);
        if (settled >= length) {
          if (tick) window.clearInterval(tick);
          setDisplay(target);
          setIndex(next);
        }
      }, speed);
      timers.current.push(tick);
    }, interval);

    timers.current.push(cycle);
    return () => {
      window.clearInterval(cycle);
      if (tick) window.clearInterval(tick);
    };
  }, [index, phrases, interval, speed]);

  return (
    <span className={cn("relative inline-block", className)}>
      {/* Reserves the width of the longest phrase so nothing reflows mid-cycle. */}
      <span aria-hidden className="invisible whitespace-pre">
        {longest}
      </span>
      <span aria-hidden className="absolute inset-0 whitespace-pre">
        {display}
      </span>
      <span className="sr-only" aria-live="polite">
        {phrases[index]}
      </span>
    </span>
  );
}
