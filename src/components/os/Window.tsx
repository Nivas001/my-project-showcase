import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { controlSide, useTheme } from "@/lib/os/theme";

/**
 * A desktop window, dressed by whichever skin is active.
 *
 * Dragging is pointer-event based and writes transforms directly, so moving a
 * window never re-renders its contents — which matters a great deal once the
 * contents are a paint canvas or a running game loop.
 *
 * The skin decides three things and nothing else: which side the controls sit
 * on, what the title bar looks like, and how round the corners are. All three
 * come from CSS custom properties, so switching skins repaints without
 * remounting the window or losing what is inside it.
 */

/* --------------------------------------------------------------------------
 * Controls
 *
 * macOS and Ubuntu draw three coloured discs; the Windows family draws three
 * glyph buttons in a row, with close turning red on hover. Both are real
 * buttons with real labels — the traffic lights on this site have always done
 * something, and a skin is no reason to start faking them.
 * ------------------------------------------------------------------------ */

function Controls({
  title,
  zoomed,
  onClose,
  onMinimise,
  onZoom,
}: {
  title: string;
  zoomed: boolean;
  onClose: () => void;
  onMinimise: () => void;
  onZoom: () => void;
}) {
  const { skin } = useTheme();
  const discs = skin === "macos" || skin === "ubuntu";

  if (discs) {
    return (
      <span className="group/lights flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="h-3 w-3 rounded-full border border-black/20 transition-transform hover:scale-110"
          style={{ background: "var(--mac-close)" }}
        />
        <button
          type="button"
          onClick={onMinimise}
          aria-label={`Minimise ${title}`}
          className="h-3 w-3 rounded-full border border-black/20 transition-transform hover:scale-110"
          style={{ background: "var(--mac-min)" }}
        />
        <button
          type="button"
          onClick={onZoom}
          aria-label={zoomed ? `Restore ${title}` : `Zoom ${title}`}
          className="h-3 w-3 rounded-full border border-black/20 transition-transform hover:scale-110"
          style={{ background: "var(--mac-max)" }}
        />
      </span>
    );
  }

  const btn =
    "grid h-full w-11 place-items-center text-[11px] leading-none transition-colors hover:bg-foreground/12";
  return (
    <span className="-my-px flex h-[var(--os-titlebar-h)] shrink-0 items-stretch self-stretch">
      <button type="button" onClick={onMinimise} aria-label={`Minimise ${title}`} className={btn}>
        <span aria-hidden className="mt-2 block h-px w-3 bg-current" />
      </button>
      <button
        type="button"
        onClick={onZoom}
        aria-label={zoomed ? `Restore ${title}` : `Maximise ${title}`}
        className={btn}
      >
        <span aria-hidden className="block h-2.5 w-2.5 border border-current" />
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label={`Close ${title}`}
        className={cn(btn, "hover:!bg-[oklch(0.58_0.22_25)] hover:!text-white")}
      >
        <span aria-hidden>✕</span>
      </button>
    </span>
  );
}

export function Window({
  title,
  subtitle,
  children,
  onClose,
  onFocus,
  zIndex = 10,
  initial,
  width = 560,
  /** Body height. `auto` lets short windows shrink to their contents. */
  height,
  className,
  bodyClassName,
  /** Apps that manage their own scrolling (canvas, game loops) opt out. */
  scroll = true,
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
  height?: number;
  className?: string;
  bodyClassName?: string;
  scroll?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const { skin } = useTheme();
  const side = controlSide(skin);
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
      // Escape belongs to whatever has focus inside the window first — a text
      // field mid-edit, a colour picker, a confirm step. Only an unhandled
      // Escape should take the window down with it.
      if (event.key === "Escape" && !event.defaultPrevented) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    if (zoomed) return;
    onFocus?.();
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: pos.current.x,
      originY: pos.current.y,
    };
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

  const controls = (
    <Controls
      title={title}
      zoomed={zoomed}
      onClose={onClose}
      onMinimise={onClose}
      onZoom={() => setZoomed((v) => !v)}
    />
  );

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      onPointerDown={() => onFocus?.()}
      style={{
        zIndex,
        width: zoomed ? undefined : width,
        borderRadius: "var(--os-radius)",
        boxShadow: "var(--os-shadow)",
        fontFamily: "var(--os-font)",
      }}
      className={cn(
        "window-open os-window vibrancy-strong pointer-events-auto absolute flex flex-col overflow-hidden",
        zoomed ? "inset-4 !translate-x-0 !translate-y-0" : "max-w-[calc(100vw-3rem)]",
        className,
      )}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          height: "var(--os-titlebar-h)",
          background: "var(--os-titlebar)",
          color: "var(--os-titlebar-ink)",
        }}
        className={cn(
          "group relative flex shrink-0 items-center gap-2 border-b px-3",
          zoomed ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        )}
      >
        {side === "left" ? controls : null}

        <span
          className={cn(
            "pointer-events-none min-w-0 flex-1 truncate",
            // macOS centres the title; the Windows family and GNOME left-align
            // it against the icon. Getting this wrong is the single most
            // obvious tell that a skin is a costume.
            skin === "macos" ? "absolute left-1/2 w-full -translate-x-1/2 text-center" : "",
          )}
        >
          <span className="block truncate text-[13px] font-semibold">{title}</span>
          {subtitle && skin === "macos" ? (
            <span className="block font-mono text-[10px] opacity-60">{subtitle}</span>
          ) : null}
        </span>

        {side === "right" ? <span className="ml-auto flex items-stretch">{controls}</span> : null}
      </div>

      <div
        style={height && !zoomed ? { height } : undefined}
        className={cn(
          "min-h-0 flex-1",
          scroll ? "overflow-y-auto" : "overflow-hidden",
          !height && !zoomed ? "max-h-[60vh]" : "",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
