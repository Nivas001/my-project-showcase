import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";

/**
 * A quiet custom cursor for fine pointers: a small dot that tracks exactly and
 * a ring that follows with a little lag. Over anything interactive the ring
 * opens up; over an element carrying `data-cursor="Label"` it becomes a pill
 * that says what a click will do ("View", "Open", "Write").
 *
 * The native cursor stays visible — this is an accent, not a replacement —
 * so nothing about text selection or accessibility changes. Touch screens and
 * reduced-motion visitors never mount it.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(fine.matches && !calm.matches);
    sync();
    fine.addEventListener("change", sync);
    calm.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      calm.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const target = e.target instanceof Element ? e.target : null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      setLabel(labelled?.dataset["cursor"] ?? null);
      setActive(Boolean(target?.closest("a, button, [role='button'], input, textarea, select")));
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <motion.div
        className="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
        style={{ x, y, opacity: visible && !label ? 1 : 0 }}
      />
      <motion.div className="absolute left-0 top-0" style={{ x: rx, y: ry }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {label ? (
            <motion.span
              key="label"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-foreground px-3.5 py-1.5 text-[12px] font-medium text-background"
            >
              {label}
            </motion.span>
          ) : (
            <motion.span
              key="ring"
              initial={false}
              animate={{
                width: active ? 44 : 28,
                height: active ? 44 : 28,
                opacity: visible ? (active ? 0.9 : 0.45) : 0,
              }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/60"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/** A hairline across the top of the viewport that fills as the page is read. */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-px origin-left bg-accent"
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}
