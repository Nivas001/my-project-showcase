import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { DOCK_APPS, TRASH_APP, type AppSpec } from "@/lib/os-apps";
import { AppIcon, AppTarget } from "./AppIcon";

const BASE = 46;
/** How much the icon under the pointer grows. */
const MAX_SCALE = 1.75;
/** Pointer distance, in pixels, over which the magnification falls off. */
const FALLOFF = 110;

/**
 * The dock.
 *
 * Magnification is computed per icon from the pointer's horizontal distance, so
 * neighbours swell too and the row ripples the way the real dock does. It is
 * driven by direct style writes inside a rAF rather than React state — this
 * runs on every pointer move and must not re-render the tree.
 */
export function Dock() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const dockRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hidden, setHidden] = useState(false);

  const apps: AppSpec[] = [...DOCK_APPS, TRASH_APP];

  // Magnification
  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    if (
      typeof window.matchMedia === "function" &&
      (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches)
    ) {
      return;
    }

    let frame = 0;
    let pointerX: number | null = null;

    const apply = () => {
      frame = 0;
      for (const item of itemRefs.current) {
        if (!item) continue;
        let scale = 1;
        if (pointerX !== null) {
          const rect = item.getBoundingClientRect();
          const centre = rect.left + rect.width / 2;
          const distance = Math.abs(pointerX - centre);
          if (distance < FALLOFF) {
            // Cosine falloff: smooth at the edges, peaked at the pointer.
            const t = 1 - distance / FALLOFF;
            scale = 1 + (MAX_SCALE - 1) * (0.5 - Math.cos(t * Math.PI) / 2);
          }
        }
        item.style.transform = `scale(${scale.toFixed(3)}) translateY(${(-(scale - 1) * 14).toFixed(2)}px)`;
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onMove = (event: PointerEvent) => {
      const rect = dock.getBoundingClientRect();
      // Keep magnifying slightly outside the dock so it does not snap off.
      const near =
        event.clientY > rect.top - 60 &&
        event.clientY < rect.bottom + 30 &&
        event.clientX > rect.left - 60 &&
        event.clientX < rect.right + 60;
      pointerX = near ? event.clientX : null;
      schedule();
    };

    const onLeave = () => {
      pointerX = null;
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
  }, []);

  // Auto-hide on the way down, reveal on the way up or near the bottom edge —
  // otherwise the dock sits on top of the content for the whole page.
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const check = () => {
      frame = 0;
      const y = window.scrollY;
      const atTop = y < 120;
      const atBottom = y + window.innerHeight > document.body.scrollHeight - 160;
      setHidden(!atTop && !atBottom && y > lastY + 4);
      lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    const onPointer = (event: PointerEvent) => {
      if (event.clientY > window.innerHeight - 90) setHidden(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden justify-center pb-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:flex ${
        hidden ? "translate-y-[130%]" : "translate-y-0"
      }`}
    >
      <nav
        ref={dockRef}
        aria-label="Dock"
        className="vibrancy pointer-events-auto flex items-end gap-1.5 rounded-2xl px-2.5 pb-2 pt-2"
      >
        {apps.map((app, i) => {
          const active = Boolean(app.to_ && pathname.startsWith(app.to_) && app.to_ !== "/");
          const isTrash = app.id === TRASH_APP.id;
          return (
            <div key={app.id} className="contents">
              {isTrash ? (
                <span aria-hidden className="mx-1 mb-2 h-9 w-px self-end bg-foreground/20" />
              ) : null}
              <div className="group relative flex flex-col items-center">
                {/* Tooltip */}
                <span
                  aria-hidden
                  className="vibrancy pointer-events-none absolute -top-11 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium text-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                >
                  {app.label}
                </span>

                <AppTarget
                  app={app}
                  aria-label={app.label}
                  className="block rounded-[23%] outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  <div
                    ref={(node) => {
                      itemRefs.current[i] = node;
                    }}
                    className="dock-item"
                  >
                    <AppIcon app={app} size={BASE} />
                  </div>
                </AppTarget>

                {/* Running indicator */}
                <span
                  aria-hidden
                  className={`mt-1 h-1 w-1 rounded-full bg-foreground transition-opacity duration-200 ${
                    active ? "opacity-80" : "opacity-0"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
