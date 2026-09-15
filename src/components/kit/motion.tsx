import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ==========================================================================
 * Text and card motion primitives.
 *
 * SplitLines (in index.tsx) animates whole lines out of a mask. These two go
 * finer: one animates individual characters, the other tilts a card in 3D
 * under the pointer. Both are decorative and both stop dead under
 * prefers-reduced-motion, handled globally in styles.css.
 * ======================================================================== */

function useSeen<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(!enabled);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSeen(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return { ref, seen };
}

/**
 * Reveals text one character at a time.
 *
 * Words are kept whole (each word is an inline-block) so a mid-word line break
 * is impossible, and the whole string is exposed to assistive tech as one
 * label — a screen reader should not read forty separate letters.
 */
export function CharReveal({
  text,
  className,
  charClassName,
  delay = 0,
  onView = true,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  charClassName?: string;
  /** Milliseconds before the first character. */
  delay?: number;
  /** Wait for the element to scroll into view. */
  onView?: boolean;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
}) {
  const { ref, seen } = useSeen<HTMLElement>(onView);
  const words = text.split(" ");
  let index = 0;

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} aria-hidden className="inline-block whitespace-nowrap">
          {[...word].map((char, ci) => {
            const i = index++;
            return (
              <span
                key={`${char}-${ci}`}
                className={cn(seen && "char-in", charClassName)}
                style={
                  {
                    "--char-index": i,
                    "--char-base": `${delay}ms`,
                    ...(seen ? undefined : { opacity: 0 }),
                  } as React.CSSProperties
                }
              >
                {char}
              </span>
            );
          })}
          {wi < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
        </span>
      ))}
    </Tag>
  );
}

/**
 * A card that tilts towards the pointer.
 *
 * The transform is written straight to the node inside a rAF rather than held
 * in state: this fires on every pointer move and must not re-render the tree.
 * Touch and coarse pointers are skipped — there is no hover there to respond
 * to, and the tilt would only fight the scroll.
 */
export function TiltCard({
  children,
  className,
  /** Maximum rotation in degrees at the far corner. */
  max = 7,
  /** How far the card lifts toward the viewer, in pixels. */
  lift = 14,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  lift?: number;
  glare?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;
    if (
      typeof window.matchMedia === "function" &&
      (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches)
    ) {
      return;
    }

    let frame = 0;
    let point: { x: number; y: number } | null = null;

    const apply = () => {
      frame = 0;
      if (!point) {
        inner.style.transform = "";
        if (glareRef.current) glareRef.current.style.opacity = "0";
        return;
      }
      const rect = wrap.getBoundingClientRect();
      // -0.5 … 0.5 from the centre of the card.
      const dx = (point.x - rect.left) / rect.width - 0.5;
      const dy = (point.y - rect.top) / rect.height - 0.5;
      inner.style.transform = `perspective(900px) rotateY(${(dx * max * 2).toFixed(2)}deg) rotateX(${(-dy * max * 2).toFixed(2)}deg) translateZ(${lift}px)`;
      if (glareRef.current) {
        glareRef.current.style.opacity = "1";
        glareRef.current.style.background = `radial-gradient(420px circle at ${((dx + 0.5) * 100).toFixed(1)}% ${((dy + 0.5) * 100).toFixed(1)}%, oklch(1 0 0 / 22%), transparent 60%)`;
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onMove = (event: PointerEvent) => {
      point = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const onLeave = () => {
      point = null;
      schedule();
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [max, lift]);

  return (
    <div ref={wrapRef} className={cn("scene-3d", className)}>
      <div ref={innerRef} className="tilt-card relative h-full">
        {children}
        {glare ? (
          <span
            ref={glareRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
          />
        ) : null}
      </div>
    </div>
  );
}

/**
 * Moves a liquid-glass panel's specular highlight with the pointer.
 *
 * Writes `--gx` / `--gy` / `--sheen` onto the element; the gradient that reads
 * them lives in styles.css beside the rest of the glass recipe. Like TiltCard
 * this writes straight to the node inside a rAF — it fires on every pointer
 * move and must never re-render the tree.
 *
 * `margin` keeps the highlight alive slightly outside the panel so it fades
 * rather than snapping off as the pointer leaves.
 *
 * Returns a ref to attach to the glass element.
 */
export function useSpecular<T extends HTMLElement>(margin = 80) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window.matchMedia === "function" &&
      (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches)
    ) {
      return;
    }

    let frame = 0;
    let point: { x: number; y: number } | null = null;

    const apply = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      if (!point) {
        // Rest state: a static bloom at the top centre, the way an overhead
        // light would sit on the panel with nothing disturbing it.
        el.style.setProperty("--gx", "50%");
        el.style.setProperty("--gy", "0%");
        el.style.setProperty("--sheen", "0.55");
        return;
      }
      const x = ((point.x - rect.left) / rect.width) * 100;
      const y = ((point.y - rect.top) / rect.height) * 100;
      el.style.setProperty("--gx", `${x.toFixed(1)}%`);
      el.style.setProperty("--gy", `${y.toFixed(1)}%`);
      el.style.setProperty("--sheen", "1");
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const near =
        event.clientX > rect.left - margin &&
        event.clientX < rect.right + margin &&
        event.clientY > rect.top - margin &&
        event.clientY < rect.bottom + margin;
      point = near ? { x: event.clientX, y: event.clientY } : null;
      schedule();
    };

    const onLeave = () => {
      point = null;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [margin]);

  return ref;
}
