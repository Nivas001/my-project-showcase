import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A macOS window: traffic lights, a draggable title bar, and a body.
 *
 * Dragging is pointer-event based and writes transforms directly, so moving a
 * window never re-renders its contents. The window traps Escape to close and is
 * announced as a dialog; the traffic lights are real buttons, not decoration.
 */
export function Window({
  title,
  subtitle,
  children,
  onClose,
  onFocus,
  zIndex = 10,
  initial,
  width = 560,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  onFocus?: () => void;
  zIndex?: number;
  /** Starting offset from the centre of the desktop, in pixels. */
  initial?: { x: number; y: number };
  width?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const pos = useRef({ x: initial?.x ?? 0, y: initial?.y ?? 0 });
  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );

  const paint = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
  }, []);

  useEffect(() => {
    paint();
  }, [paint]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Never start a drag from the traffic lights.
    if ((event.target as HTMLElement).closest("button")) return;
    if (zoomed) return;
    onFocus?.();
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: pos.current.x,
      originY: pos.current.y,
    };
    // Capture keeps the drag alive if the pointer outruns the title bar. It
    // throws for a pointer id that is not actually active, which must not take
    // the drag down with it.
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      /* not capturable — the move handler still tracks it */
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    pos.current = {
      x: d.originX + (event.clientX - d.startX),
      y: d.originY + (event.clientY - d.startY),
    };
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = null;
    try {
      (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
    } catch {
      /* never captured */
    }
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      onPointerDown={() => onFocus?.()}
      style={{ zIndex, width: zoomed ? undefined : width }}
      className={cn(
        "window-open vibrancy-strong pointer-events-auto absolute overflow-hidden rounded-xl",
        zoomed ? "inset-4 !translate-x-0 !translate-y-0" : "max-w-[calc(100vw-3rem)]",
        className,
      )}
    >
      {/* Title bar */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn(
          "group flex h-10 shrink-0 items-center gap-2 border-b border-foreground/10 px-3",
          zoomed ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        )}
      >
        <span className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="h-3 w-3 rounded-full transition-transform hover:scale-110"
            style={{ background: "var(--mac-close)" }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={`Minimise ${title}`}
            className="h-3 w-3 rounded-full transition-transform hover:scale-110"
            style={{ background: "var(--mac-min)" }}
          />
          <button
            type="button"
            onClick={() => setZoomed((v) => !v)}
            aria-label={zoomed ? `Restore ${title}` : `Zoom ${title}`}
            className="h-3 w-3 rounded-full transition-transform hover:scale-110"
            style={{ background: "var(--mac-max)" }}
          />
        </span>

        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-center">
          <span className="block text-[13px] font-semibold text-foreground">{title}</span>
          {subtitle ? (
            <span className="block font-mono text-[10px] text-muted-foreground">{subtitle}</span>
          ) : null}
        </span>
      </div>

      <div className={cn("overflow-y-auto", zoomed ? "h-[calc(100%-2.5rem)]" : "max-h-[60vh]")}>
        {children}
      </div>
    </div>
  );
}
