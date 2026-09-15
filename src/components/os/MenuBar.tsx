import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BatteryMedium, Command, Download, Mail, Search, User, Wifi } from "lucide-react";
import { site } from "@/lib/site";
import { LocalClock, ScrambleText, StatusDot } from "@/components/kit";
import { cn } from "@/lib/utils";

const MENUS = [
  { to: "/projects" as const, label: "Work" },
  { to: "/about" as const, label: "About" },
  { to: "/fun" as const, label: "Play" },
  { to: "/horror" as const, label: "Stories" },
  { to: "/contact" as const, label: "Contact" },
];

/** Items under the logo menu — the Apple menu's role, filled with real links. */
const LOGO_MENU = [
  { label: "About this developer", to: "/about" as const, icon: User },
  { label: "Download résumé", href: site.resumeUrl, icon: Download, download: true },
  { label: "Get in touch", href: `mailto:${site.email}`, icon: Mail },
];

/**
 * The macOS menu bar: a floating glass strip with the logo menu and section
 * menus on the left, and system status on the right.
 *
 * It reads its colour from whichever act is painted beneath it, so the same bar
 * works over the black wallpaper and the cream product pages.
 */
export function MenuBar({
  onOpenSearch,
  nowShipping,
}: {
  onOpenSearch?: () => void;
  nowShipping?: readonly string[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click-away and Escape, the way a real menu behaves.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden px-3 pt-3 lg:block">
      <div className="vibrancy pointer-events-auto mx-auto flex h-11 max-w-[1600px] items-center gap-1 rounded-xl px-2">
        {/* ---- Left cluster ---- */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className={cn(
              "flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors",
              menuOpen ? "bg-foreground/15" : "hover:bg-foreground/10",
            )}
          >
            <span className="grid h-5 w-5 place-items-center rounded-[6px] bg-foreground font-display text-[11px] font-bold leading-none text-background">
              S
            </span>
            <span className="font-display text-sm font-bold tracking-tight text-foreground">
              {site.fullName}
            </span>
          </button>

          <div
            role="menu"
            className={cn(
              "vibrancy-strong absolute left-0 top-[calc(100%+0.5rem)] w-64 origin-top-left rounded-xl p-1.5 transition-all duration-150",
              menuOpen
                ? "pointer-events-auto scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0",
            )}
          >
            {LOGO_MENU.map((item) =>
              "href" in item && item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  {...(item.download ? { download: true } : {})}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-foreground/12"
                >
                  <item.icon className="h-4 w-4 opacity-70" />
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.to!}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-foreground/12"
                >
                  <item.icon className="h-4 w-4 opacity-70" />
                  {item.label}
                </Link>
              ),
            )}
            <span aria-hidden className="my-1 block h-px bg-foreground/12" />
            <p className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {site.locationShort} · Available
            </p>
          </div>
        </div>

        <nav aria-label="Sections" className="flex items-center">
          {MENUS.map((menu) => (
            <Link
              key={menu.to}
              to={menu.to}
              className="rounded-lg px-2.5 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-foreground/10 hover:text-foreground"
              activeProps={{ className: "bg-foreground/15 text-foreground" }}
            >
              {menu.label}
            </Link>
          ))}
        </nav>

        {/* ---- Right cluster ---- */}
        <div className="ml-auto flex items-center gap-1">
          {nowShipping && nowShipping.length > 0 ? (
            <span className="mr-1 hidden items-center gap-2 rounded-lg px-2.5 py-1.5 xl:flex">
              <StatusDot tone="hog-red" />
              <span className="micro text-muted-foreground">Shipping</span>
              <ScrambleText
                phrases={nowShipping}
                className="font-mono text-[11px] font-bold text-foreground"
              />
            </span>
          ) : null}

          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search (Control K)"
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-foreground/80 transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            <kbd className="hidden items-center gap-0.5 font-mono text-[10px] opacity-70 xl:flex">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>

          <span
            aria-hidden
            className="flex items-center gap-2.5 px-2 text-foreground/75"
            title="All systems nominal"
          >
            <Wifi className="h-4 w-4" />
            <BatteryMedium className="h-4 w-4" />
          </span>

          <span className="flex items-center gap-2 rounded-lg px-2.5 py-1.5">
            <StatusDot />
            <LocalClock
              timeZone={site.timezone}
              className="font-mono text-xs tabular-nums text-foreground"
            />
          </span>
        </div>
      </div>
    </div>
  );
}
