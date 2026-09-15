import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { projectsQuery } from "@/lib/queries";
import { shortTitle } from "@/lib/site";
import { DOCK_APPS, TRASH_APP, type AppSpec } from "@/lib/os-apps";
import { AppIcon, AppTarget } from "./AppIcon";
import { DockMenu } from "./DockMenu";
import { DockStack } from "./DockStack";
import { Launchpad } from "./Launchpad";

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
  /** Which icon has its context menu open, by app id. */
  const [menuFor, setMenuFor] = useState<string | null>(null);
  /** Which stack is fanned out, by app id. */
  const [stackFor, setStackFor] = useState<string | null>(null);
  const [launchpad, setLaunchpad] = useState(false);

  const { data: projects } = useQuery(projectsQuery);

  // The Projects stack is the only dock item whose contents come from the
  // database, so it is filled here rather than declared in the registry.
  const apps: AppSpec[] = useMemo(() => {
    const filled = DOCK_APPS.map((app) =>
      app.id === "projects-stack"
        ? {
            ...app,
            items: (projects ?? []).slice(0, 6).map((project) => ({
              id: `stack-${project.id}`,
              // Stored titles carry a descriptor ("Ani Bakes - E-comerce
              // Platform") that will not fit under a 42px tile.
              label: shortTitle(project.title),
              glyph: app.glyph,
              from: app.from,
              to: app.to,
              to_: `/projects/${project.slug}`,
            })),
          }
        : app,
    );
    return [...filled, TRASH_APP];
  }, [projects]);

  const closeOverlays = useCallback(() => {
    setMenuFor(null);
    setStackFor(null);
  }, []);

  // Navigating away should not leave a stack fanned open over the new page.
  useEffect(closeOverlays, [pathname, closeOverlays]);

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
    let pointerY: number | null = null;

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

      // The glass sheen rides the same frame — a second rAF loop for one
      // gradient position would double the cost of every pointer move.
      const rect = dock.getBoundingClientRect();
      if (pointerX === null || pointerY === null) {
        dock.style.setProperty("--gx", "50%");
        dock.style.setProperty("--gy", "0%");
        dock.style.setProperty("--sheen", "0.55");
      } else {
        dock.style.setProperty(
          "--gx",
          `${(((pointerX - rect.left) / rect.width) * 100).toFixed(1)}%`,
        );
        dock.style.setProperty(
          "--gy",
          `${(((pointerY - rect.top) / rect.height) * 100).toFixed(1)}%`,
        );
        dock.style.setProperty("--sheen", "1");
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
      pointerY = near ? event.clientY : null;
      schedule();
    };

    const onLeave = () => {
      pointerX = null;
      pointerY = null;
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
    <>
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
            const isStack = app.kind === "stack";
            const isLaunchpad = app.kind === "launchpad";
            const open = menuFor === app.id || stackFor === app.id;

            const tile = (
              <div
                ref={(node) => {
                  itemRefs.current[i] = node;
                }}
                className="dock-item"
              >
                <AppIcon app={app} size={BASE} />
              </div>
            );

            const targetClass =
              "block rounded-[23%] outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

            return (
              <div key={app.id} className="contents">
                {isTrash ? (
                  <span aria-hidden className="mx-1 mb-2 h-9 w-px self-end bg-foreground/20" />
                ) : null}
                <div
                  className="group relative flex flex-col items-center"
                  onContextMenu={(event) => {
                    event.preventDefault();
                    setStackFor(null);
                    setMenuFor((current) => (current === app.id ? null : app.id));
                  }}
                >
                  {/* Tooltip. Suppressed while this icon has something open over
                    it, or it collides with the menu. */}
                  <span
                    aria-hidden
                    className={`vibrancy pointer-events-none absolute -top-11 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium text-foreground transition-opacity duration-150 ${
                      open ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {app.label}
                  </span>

                  {isStack || isLaunchpad ? (
                    <button
                      type="button"
                      aria-label={app.label}
                      aria-expanded={isStack ? stackFor === app.id : launchpad}
                      onClick={() => {
                        setMenuFor(null);
                        if (isLaunchpad) {
                          setLaunchpad((v) => !v);
                        } else {
                          setStackFor((current) => (current === app.id ? null : app.id));
                        }
                      }}
                      className={targetClass}
                    >
                      {tile}
                    </button>
                  ) : (
                    <AppTarget
                      app={app}
                      aria-label={app.label}
                      className={targetClass}
                      onClick={closeOverlays}
                    >
                      {tile}
                    </AppTarget>
                  )}

                  {/* Running indicator. Stacks and Launchpad light up while open
                    rather than by route, since they have no route of their own. */}
                  <span
                    aria-hidden
                    className={`mt-1 h-1 w-1 rounded-full bg-foreground transition-opacity duration-200 ${
                      active || open || (isLaunchpad && launchpad) ? "opacity-80" : "opacity-0"
                    }`}
                  />

                  {isStack ? (
                    <DockStack
                      app={app}
                      open={stackFor === app.id}
                      onClose={() => setStackFor(null)}
                    />
                  ) : null}

                  <DockMenu app={app} open={menuFor === app.id} onClose={() => setMenuFor(null)} />
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Outside the dock wrapper on purpose: that wrapper is transformed when
          the dock auto-hides, which would re-anchor this fixed overlay to it,
          and it is pointer-events-none, which would swallow every click. */}
      <Launchpad open={launchpad} onClose={() => setLaunchpad(false)} />
    </>
  );
}
