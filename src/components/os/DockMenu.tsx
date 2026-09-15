import { useEffect, useRef, type ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { AppSpec, DockMenuItem } from "@/lib/os-apps";

/* ==========================================================================
 * DOCK CONTEXT MENU
 *
 * Right-click (or long-press) a dock icon. Every app gets the standard rows;
 * apps that declare `menu` get their own above them.
 *
 * Dismissal mirrors MenuBar's: pointerdown outside closes, Escape closes. The
 * two menus behave identically on purpose — one of them being subtly different
 * is exactly the kind of thing that makes a fake desktop feel fake.
 * ======================================================================== */

export function DockMenu({
  app,
  open,
  onClose,
}: {
  app: AppSpec;
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

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

  // The rows every app has, appended under whatever the app declared.
  const standard: DockMenuItem[] = [
    ...(app.menu && app.menu.length > 0 ? [{ kind: "separator" as const }] : []),
    ...(app.href
      ? [{ kind: "copy" as const, label: "Copy link", value: app.href }]
      : app.to_
        ? [
            {
              kind: "copy" as const,
              label: "Copy link",
              value:
                typeof window !== "undefined" ? `${window.location.origin}${app.to_}` : app.to_,
            },
          ]
        : []),
    { kind: "caption" as const, label: app.label },
  ];

  const items = [...(app.menu ?? []), ...standard];

  const row =
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left text-[13px] text-foreground transition-colors hover:bg-foreground/12 focus-visible:bg-foreground/12 focus-visible:outline-none";

  return (
    <div
      ref={ref}
      role="menu"
      aria-hidden={!open}
      className={`liquid-glass absolute bottom-[calc(100%+0.9rem)] left-1/2 z-50 w-56 -translate-x-1/2 rounded-xl p-1.5 transition-[opacity,transform] duration-150 ${
        open
          ? "pointer-events-auto scale-100 opacity-100"
          : "pointer-events-none scale-[0.96] opacity-0"
      }`}
    >
      {items.map((item, i) => {
        if (item.kind === "separator") {
          return <span key={`sep-${i}`} aria-hidden className="my-1 block h-px bg-foreground/12" />;
        }
        if (item.kind === "caption") {
          return (
            <p
              key={`cap-${i}`}
              className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              {item.label}
            </p>
          );
        }
        if (item.kind === "copy") {
          return (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              tabIndex={open ? 0 : -1}
              onClick={() => {
                void navigator.clipboard?.writeText(item.value);
                toast("Copied", { description: item.value });
                onClose();
              }}
              className={row}
            >
              {item.label}
            </button>
          );
        }
        if (item.kind === "link") {
          const external = item.href.startsWith("http");
          return (
            <a
              key={item.label}
              href={item.href}
              role="menuitem"
              tabIndex={open ? 0 : -1}
              {...(item.download ? { download: true } : {})}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              onClick={onClose}
              className={row}
            >
              {item.label}
            </a>
          );
        }

        // As in MenuBar: `to` is a real route string, but TanStack types params
        // against whichever route it resolves to, which a data-driven menu
        // cannot carry through.
        const RouterLink = Link as unknown as ComponentType<Record<string, unknown>>;
        return (
          <RouterLink
            key={`${item.to}-${item.label}`}
            to={item.to}
            {...(item.params ? { params: item.params } : {})}
            role="menuitem"
            tabIndex={open ? 0 : -1}
            onClick={onClose}
            className={row}
          >
            {item.label}
          </RouterLink>
        );
      })}
    </div>
  );
}
