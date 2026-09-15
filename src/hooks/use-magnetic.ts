import { useEffect, useRef } from "react";

/**
 * Gives an element a slight pull toward the pointer while it is nearby, and
 * lets it spring back when the pointer leaves.
 *
 * Attach the returned ref to the element you want to behave this way. Coarse
 * pointers and `prefers-reduced-motion` opt out entirely — there is no hover on
 * a touchscreen, and the drift is exactly the kind of motion people turn off.
 */
export function useMagnetic<T extends HTMLElement>({
  strength = 0.28,
  radius = 90,
}: { strength?: number; radius?: number } = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;

    const settle = () => {
      x += (targetX - x) * 0.18;
      y += (targetY - y) * 0.18;
      // Stop burning frames once it has effectively arrived.
      if (Math.abs(targetX - x) < 0.05 && Math.abs(targetY - y) < 0.05) {
        x = targetX;
        y = targetY;
        el.style.transform =
          x === 0 && y === 0 ? "" : `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        frame = 0;
        return;
      }
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      frame = requestAnimationFrame(settle);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(settle);
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const reach = Math.max(rect.width, rect.height) / 2 + radius;

      if (Math.hypot(dx, dy) > reach) {
        targetX = 0;
        targetY = 0;
      } else {
        targetX = dx * strength;
        targetY = dy * strength;
      }
      schedule();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onLeave);
      window.removeEventListener("blur", onLeave);
      el.style.transform = "";
    };
  }, [strength, radius]);

  return ref;
}
