import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { AppSpec } from "@/lib/os-apps";
import { AppIcon, AppTarget } from "./AppIcon";

/* ==========================================================================
 * DOCK STACK
 *
 * A folder in the dock that fans its contents out on click, the way the
 * Downloads stack does.
 *
 * The fan is an arc, not a column: items spread across a shallow curve above
 * the icon so a stack of six is still readable without becoming a tall list.
 * Under prefers-reduced-motion it degrades to exactly that tall list — the arc
 * is the decoration, the contents are the point.
 * ======================================================================== */

/** Half-width of the arc, in degrees. */
const SPREAD = 52;
/** Distance from the dock icon to the fanned tiles. */
const RADIUS = 118;
/**
 * Above this many items the arc stops working — six labels on a 118px radius
 * overlap into an unreadable cluster — so the stack opens as a grid instead.
 * macOS makes the same switch for the same reason.
 */
const FAN_LIMIT = 4;

export function DockStack({
  app,
  open,
  onClose,
}: {
  app: AppSpec;
  open: boolean;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const items = app.items ?? [];

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (items.length === 0) return null;

  // Grid mode: too many to fan, but still a panel rather than a plain list.
  if (!reduced && items.length > FAN_LIMIT) {
    return (
      <div
        ref={ref}
        aria-hidden={!open}
        className={`liquid-glass absolute bottom-[calc(100%+1rem)] left-1/2 z-50 w-[19rem] -translate-x-1/2 rounded-2xl p-3 transition-[opacity,transform] duration-200 ${
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-[0.94] opacity-0"
        }`}
      >
        <div className="grid grid-cols-3 gap-1">
          {items.map((item) => (
            <AppTarget
              key={item.id}
              app={item}
              aria-label={item.label}
              className="group/stack flex flex-col items-center gap-1.5 rounded-xl p-2 outline-none transition-colors hover:bg-foreground/10"
              onClick={onClose}
            >
              <AppIcon
                app={item}
                size={42}
                className="transition-transform duration-150 group-hover/stack:scale-110"
              />
              <span className="line-clamp-2 text-center text-[11px] leading-tight text-foreground">
                {item.label}
              </span>
            </AppTarget>
          ))}
        </div>
      </div>
    );
  }

  if (reduced) {
    return (
      <div
        ref={ref}
        aria-hidden={!open}
        className={`liquid-glass absolute bottom-[calc(100%+0.9rem)] left-1/2 z-50 w-48 -translate-x-1/2 rounded-xl p-1.5 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {items.map((item) => (
          <AppTarget
            key={item.id}
            app={item}
            aria-label={item.label}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] text-foreground transition-colors hover:bg-foreground/12"
            onClick={onClose}
          >
            <AppIcon app={item} size={24} />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </AppTarget>
        ))}
      </div>
    );
  }

  // Spread the items evenly across the arc, centred on straight up.
  const step = items.length > 1 ? (SPREAD * 2) / (items.length - 1) : 0;

  return (
    <div
      ref={ref}
      aria-hidden={!open}
      className={`absolute bottom-full left-1/2 z-50 h-0 w-0 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {items.map((item, i) => {
        const angle = items.length > 1 ? -SPREAD + i * step : 0;
        const radians = (angle * Math.PI) / 180;
        const x = Math.sin(radians) * RADIUS;
        const y = -Math.cos(radians) * RADIUS;

        return (
          <motion.div
            key={item.id}
            initial={false}
            animate={open ? { x, y, opacity: 1, scale: 1 } : { x: 0, y: 0, opacity: 0, scale: 0.5 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 30,
              // Fan outward from the centre rather than all at once.
              delay: open ? i * 0.028 : 0,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <AppTarget
              app={item}
              aria-label={item.label}
              className="group/stack flex flex-col items-center gap-1.5 outline-none"
              onClick={onClose}
            >
              <AppIcon
                app={item}
                size={44}
                className="transition-transform duration-150 group-hover/stack:scale-110"
              />
              <span className="liquid-glass whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] leading-tight text-foreground">
                {item.label}
              </span>
            </AppTarget>
          </motion.div>
        );
      })}
    </div>
  );
}
