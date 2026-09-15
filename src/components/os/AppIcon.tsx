import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { AppSpec } from "@/lib/os-apps";
import { cn } from "@/lib/utils";

/**
 * An Apple-style app tile: a gradient squircle with a gloss highlight, a
 * hairline rim and a soft drop shadow, wrapping a single glyph.
 *
 * Purely presentational — `AppTarget` decides whether it links, routes or acts.
 */
export function AppIcon({
  app,
  size = 52,
  className,
}: {
  app: AppSpec;
  size?: number;
  className?: string;
}) {
  const Glyph = app.glyph;
  const Face = app.face;
  const dark = app.ink === "dark";

  return (
    <span
      className={cn(
        "squircle icon-gloss desktop-icon-tile grid shrink-0 place-items-center",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(160deg, ${app.from} 0%, ${app.to} 100%)`,
        boxShadow: `0 0 0 0.5px oklch(0 0 0 / 35%), 0 ${size * 0.06}px ${size * 0.18}px -${size * 0.06}px oklch(0 0 0 / 55%)`,
      }}
    >
      {Face ? (
        // Widgets draw their own face because they show a live value — a date
        // or a clock hand — that a static glyph cannot carry.
        <span className="relative z-10 grid place-items-center">
          <Face size={size} />
        </span>
      ) : (
        <Glyph
          className="relative z-10"
          style={{
            width: size * 0.48,
            height: size * 0.48,
            color: dark ? "oklch(0.24 0 0)" : "oklch(0.99 0 0)",
          }}
          strokeWidth={dark ? 1.9 : 1.8}
          aria-hidden
        />
      )}
    </span>
  );
}

/**
 * Wraps children in whichever element the app's destination calls for: a router
 * Link for internal routes, an anchor for external ones, a button for windows.
 *
 * Keeping this in one place is what lets the dock, the desktop and the phone
 * home screen share a single app registry.
 */
export function AppTarget({
  app,
  children,
  className,
  onOpenWindow,
  onClick,
  ...rest
}: {
  app: AppSpec;
  children: ReactNode;
  className?: string;
  onOpenWindow?: (id: NonNullable<AppSpec["window"]>) => void;
  /** Fired in addition to the destination — used to close a stack or menu. */
  onClick?: () => void;
} & { "aria-label"?: string; title?: string }) {
  if (app.window && onOpenWindow) {
    const id = app.window;
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          onOpenWindow(id);
          onClick?.();
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }

  if (app.href) {
    const external = app.href.startsWith("http");
    return (
      <a
        href={app.href}
        className={className}
        onClick={onClick}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }

  if (app.to_) {
    return (
      <Link to={app.to_} className={className} onClick={onClick} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <span className={className} {...rest}>
      {children}
    </span>
  );
}
