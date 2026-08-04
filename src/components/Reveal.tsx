import { useEffect, useRef, useState } from "react";

/** Fires once when the element scrolls into view. */
export function useInView<T extends HTMLElement>(rootMargin = "0px 0px -10% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin, threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

/**
 * Fades + lifts its children into view on scroll. Motion is disabled through
 * the global prefers-reduced-motion rule in styles.css.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  as?: "div" | "section" | "li" | "span";
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${inView ? "reveal-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** Counts up to `value` once visible. Keeps the original formatting. */
export function CountUp({ value, duration = 1200 }: { value: string; duration?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const target = Number.parseFloat(value);
  const decimals = value.includes(".") ? (value.split(".")[1]?.length ?? 0) : 0;
  const [display, setDisplay] = useState(Number.isFinite(target) ? "0" : value);

  useEffect(() => {
    if (!inView || !Number.isFinite(target)) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay((target * eased).toFixed(decimals));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, decimals, duration]);

  return <span ref={ref}>{Number.isFinite(target) ? display : value}</span>;
}
