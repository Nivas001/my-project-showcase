import { Link, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ComponentType } from "react";
import {
  AppWindow,
  ArrowUp,
  BatteryMedium,
  BookOpen,
  Brain,
  Briefcase,
  Command,
  Download,
  ExternalLink,
  Gamepad2,
  Github,
  Hammer,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Monitor,
  Moon,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sun,
  User,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { site } from "@/lib/site";
import { LocalClock, ScrambleText, StatusDot, useSpecular } from "@/components/kit";
import { cn } from "@/lib/utils";
import { useTheme, type Mode } from "@/lib/os/theme";
import { useWindows, type AppId } from "@/components/os/WindowManager";

/* ==========================================================================
 * THE MENU BAR
 *
 * A real macOS menu bar, not a nav bar wearing one: traffic lights, an Apple
 * menu, top-level menus that open on click and then follow the pointer, and a
 * system-status cluster on the right.
 *
 * It reads its colour from whichever act is painted beneath it (see
 * useSectionAct in __root.tsx), so the same bar works over the black wallpaper
 * and over the cream product pages.
 * ======================================================================== */

type MenuItem =
  | {
      kind: "route";
      label: string;
      to: string;
      params?: Record<string, string>;
      icon?: Icon;
      hint?: string;
    }
  | { kind: "link"; label: string; href: string; icon?: Icon; hint?: string; download?: boolean }
  | { kind: "anchor"; label: string; hash: string; icon?: Icon; hint?: string }
  | { kind: "separator" }
  | { kind: "caption"; label: string };

type Icon = ComponentType<{ className?: string }>;

type Menu = { id: string; label: string; items: MenuItem[] };

const MENUS: Menu[] = [
  {
    id: "work",
    label: "Work",
    items: [
      { kind: "route", label: "All projects", to: "/projects", icon: Briefcase },
      { kind: "separator" },
      {
        kind: "route",
        label: "Estate Ulagam",
        to: "/projects/$slug",
        params: { slug: "estate-ulagam" },
      },
      {
        kind: "route",
        label: "Vaaram Magazine",
        to: "/projects/$slug",
        params: { slug: "vaaram-magazine" },
      },
      { kind: "route", label: "Ani Bakes", to: "/projects/$slug", params: { slug: "anibakes" } },
      {
        kind: "route",
        label: "AARRKKAA International",
        to: "/projects/$slug",
        params: { slug: "aarrkkaa-international" },
      },
      { kind: "route", label: "Velocity", to: "/projects/$slug", params: { slug: "velocity" } },
      {
        kind: "route",
        label: "Tamil summariser",
        to: "/projects/$slug",
        params: { slug: "tamil-ner-summarizer" },
        icon: Brain,
      },
      { kind: "separator" },
      {
        kind: "anchor",
        label: "How a project gets built",
        hash: "#how-it-gets-built",
        icon: Hammer,
      },
    ],
  },
  {
    id: "about",
    label: "About",
    items: [
      { kind: "route", label: "The long version", to: "/about", icon: User },
      { kind: "link", label: "Résumé (PDF)", href: site.resumeUrl, icon: Download, download: true },
      { kind: "separator" },
      { kind: "link", label: "GitHub", href: site.github, icon: Github, hint: "External" },
      { kind: "link", label: "LinkedIn", href: site.linkedin, icon: Linkedin, hint: "External" },
    ],
  },
  {
    id: "detours",
    label: "Detours",
    items: [
      { kind: "route", label: "The arcade", to: "/fun", icon: Gamepad2 },
      { kind: "route", label: "Horror stories", to: "/horror", icon: BookOpen },
      { kind: "route", label: "Beat an AI", to: "/how-to-be-smarter-than-an-ai", icon: Brain },
      { kind: "separator" },
      { kind: "route", label: "Something else", to: "/surprise", icon: Sparkles },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    items: [
      { kind: "route", label: "Contact page", to: "/contact", icon: Mail },
      { kind: "separator" },
      { kind: "link", label: site.email, href: `mailto:${site.email}`, icon: Mail },
      { kind: "link", label: site.phone, href: `tel:${site.phone}`, icon: Phone },
      { kind: "separator" },
      { kind: "caption", label: "Usually replies within a day" },
    ],
  },
];

/* --------------------------------------------------------------------------
 * Traffic lights
 *
 * Decorative buttons are a waste of three of the most recognisable controls on
 * a screen, so each one does the closest honest thing: close refuses, minimise
 * folds the bar into a pill, zoom returns to the top of the page.
 * ------------------------------------------------------------------------ */

function TrafficLights({ onMinimise }: { onMinimise: () => void }) {
  const lights = [
    {
      id: "close",
      colour: "var(--mac-close)",
      title: "Close",
      glyph: "✕",
      action: () =>
        toast("There is no closing a portfolio.", { description: "Try the dock instead." }),
    },
    { id: "min", colour: "var(--mac-min)", title: "Minimise", glyph: "–", action: onMinimise },
    {
      id: "zoom",
      colour: "var(--mac-max)",
      title: "Back to top",
      glyph: "+",
      action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
  ];

  return (
    <div className="group/lights flex items-center gap-2 pl-2 pr-1">
      {lights.map((light) => (
        <button
          key={light.id}
          type="button"
          onClick={light.action}
          title={light.title}
          aria-label={light.title}
          className="grid h-3 w-3 place-items-center rounded-full border border-black/25 text-[7px] font-black leading-none text-black/55 opacity-90 transition-transform duration-150 hover:scale-110 active:scale-95"
          style={{ background: light.colour }}
        >
          <span aria-hidden className="opacity-0 transition-opacity group-hover/lights:opacity-100">
            {light.glyph}
          </span>
        </button>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * A dropdown panel
 * ------------------------------------------------------------------------ */

function MenuPanel({
  items,
  open,
  onPick,
  align = "left",
}: {
  items: MenuItem[];
  open: boolean;
  onPick: () => void;
  align?: "left" | "right";
}) {
  const row =
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-left text-[13px] text-foreground transition-colors hover:bg-foreground/12 focus-visible:bg-foreground/12 focus-visible:outline-none";

  return (
    <div
      role="menu"
      aria-hidden={!open}
      className={cn(
        "vibrancy-strong absolute top-[calc(100%+0.45rem)] z-50 w-64 rounded-xl p-1.5 transition-[opacity,transform] duration-150",
        align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
        open
          ? "pointer-events-auto scale-100 opacity-100"
          : "pointer-events-none scale-[0.97] opacity-0",
      )}
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

        const Glyph = item.icon;
        const inner = (
          <>
            {Glyph ? (
              <Glyph className="h-3.5 w-3.5 shrink-0 opacity-70" />
            ) : (
              <span aria-hidden className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.hint ? <ExternalLink className="h-3 w-3 shrink-0 opacity-45" /> : null}
          </>
        );

        if (item.kind === "link") {
          return (
            <a
              key={item.label}
              href={item.href}
              role="menuitem"
              tabIndex={open ? 0 : -1}
              {...(item.download ? { download: true } : {})}
              {...(item.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              onClick={onPick}
              className={row}
            >
              {inner}
            </a>
          );
        }

        if (item.kind === "anchor") {
          return (
            <a
              key={item.label}
              href={item.hash}
              role="menuitem"
              tabIndex={open ? 0 : -1}
              onClick={onPick}
              className={row}
            >
              {inner}
            </a>
          );
        }

        // TanStack types `params` against whichever route `to` resolves to,
        // which a data-driven menu cannot carry through. `to` is still a real
        // route string; only the params reducer is widened.
        const RouterLink = Link as unknown as ComponentType<Record<string, unknown>>;
        return (
          <RouterLink
            key={`${item.to}-${item.label}`}
            to={item.to}
            {...(item.params ? { params: item.params } : {})}
            role="menuitem"
            tabIndex={open ? 0 : -1}
            onClick={onPick}
            className={row}
          >
            {inner}
          </RouterLink>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Appearance
 *
 * A three-way segmented control rather than a single toggle. A plain switch
 * cannot express "follow my system", and on a site that ships two complete
 * palettes that is the option most people actually want.
 *
 * It sits in the status cluster beside the clock, which is where an operating
 * system puts the controls that change how the whole machine looks.
 * ------------------------------------------------------------------------ */

const MODE_OPTIONS: { id: Mode; label: string; Icon: typeof Sun }[] = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "auto", label: "Match my system", Icon: Monitor },
];

function AppearanceControl() {
  const { mode, setMode } = useTheme();
  const { open } = useWindows();

  return (
    <span className="flex items-center gap-0.5 rounded-lg bg-foreground/8 p-0.5">
      {MODE_OPTIONS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setMode(id)}
          title={label}
          aria-label={label}
          aria-pressed={mode === id}
          className={cn(
            "grid h-6 w-6 place-items-center rounded-[6px] transition-colors",
            mode === id
              ? "bg-foreground text-background"
              : "text-foreground/60 hover:bg-foreground/10 hover:text-foreground",
          )}
        >
          <Icon className="h-3 w-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => open("settings")}
        title="Appearance and desktop settings"
        aria-label="Open settings"
        className="ml-0.5 grid h-6 w-6 place-items-center rounded-[6px] text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
      >
        <SlidersHorizontal className="h-3 w-3" />
      </button>
    </span>
  );
}

/* --------------------------------------------------------------------------
 * The apps menu
 *
 * Every window on the site, opened from the bar. This is the only route into
 * the apps that does not require finding an icon first, and it is deliberately
 * a plain list: the dock is for browsing, the menu is for knowing what you
 * want.
 * ------------------------------------------------------------------------ */

const APP_MENU: { id: AppId; label: string; hint: string }[] = [
  { id: "paint", label: "Paint", hint: "Draw, then hang it" },
  { id: "notes", label: "Notes", hint: "The public board" },
  { id: "music", label: "Boombox", hint: "Spotify, in a window" },
  { id: "tycoon", label: "Ship It Tycoon", hint: "Run a studio" },
  { id: "minesweeper", label: "Minesweeper", hint: "Ten mines" },
  { id: "terminal", label: "Terminal", hint: "It drives the site" },
  { id: "calculator", label: "Calculator", hint: "Four functions" },
  { id: "photos", label: "Photos", hint: "Every screenshot" },
  { id: "vibe", label: "Vibe Check", hint: "Diagnostics, of a sort" },
  { id: "excuses", label: "Excuse Engine", hint: "Standup in four minutes" },
  { id: "assistant", label: "NIV-9000", hint: "Unhelpful by design" },
  { id: "installer", label: "Setup", hint: "It never finishes" },
  { id: "settings", label: "System Settings", hint: "Skins and bad ideas" },
];

function AppsMenu({ open: isOpen, onPick }: { open: boolean; onPick: () => void }) {
  const { open } = useWindows();

  return (
    <div
      role="menu"
      aria-hidden={!isOpen}
      className={cn(
        "vibrancy-strong absolute left-0 top-[calc(100%+0.45rem)] z-50 w-72 origin-top-left rounded-xl p-1.5 transition-[opacity,transform] duration-150",
        isOpen
          ? "pointer-events-auto scale-100 opacity-100"
          : "pointer-events-none scale-[0.97] opacity-0",
      )}
    >
      <p className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Opens in a window
      </p>
      {APP_MENU.map((app) => (
        <button
          key={app.id}
          type="button"
          role="menuitem"
          tabIndex={isOpen ? 0 : -1}
          onClick={() => {
            open(app.id);
            onPick();
          }}
          className="flex w-full items-baseline gap-2 rounded-lg px-2.5 py-[7px] text-left transition-colors hover:bg-foreground/12"
        >
          <span className="text-[13px] text-foreground">{app.label}</span>
          <span className="ml-auto truncate text-[11px] text-muted-foreground">{app.hint}</span>
        </button>
      ))}
      <span aria-hidden className="my-1 block h-px bg-foreground/12" />
      <Link
        to="/apps"
        role="menuitem"
        tabIndex={isOpen ? 0 : -1}
        onClick={onPick}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] text-foreground transition-colors hover:bg-foreground/12"
      >
        <AppWindow className="h-3.5 w-3.5 opacity-70" />
        All apps as a page
      </Link>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * The bar
 * ------------------------------------------------------------------------ */

export function MenuBar({
  onOpenSearch,
  nowShipping,
}: {
  onOpenSearch?: () => void;
  nowShipping?: readonly string[];
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState<string | null>(null);
  const [minimised, setMinimised] = useState(false);
  // Doubles as the click-away boundary below and as the glass the specular
  // highlight tracks across.
  const barRef = useSpecular<HTMLDivElement>();

  const close = useCallback(() => setOpen(null), []);

  // Click-away and Escape, the way a real menu behaves.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
    // barRef comes from useSpecular rather than useRef directly, so the linter
    // cannot tell it is a stable ref. It is; listing it changes nothing.
  }, [open, close, barRef]);

  // Navigating away should not leave a menu hanging open over the new page.
  useEffect(close, [pathname, close]);

  if (minimised) {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden px-3 pt-3 lg:block">
        <button
          type="button"
          onClick={() => setMinimised(false)}
          className="vibrancy pointer-events-auto mx-auto flex h-9 items-center gap-2.5 rounded-full px-4 text-[13px] text-foreground transition-transform hover:scale-[1.03]"
        >
          <span className="grid h-4 w-4 place-items-center rounded-[5px] bg-foreground font-display text-[9px] font-bold leading-none text-background">
            S
          </span>
          <span className="font-display font-bold tracking-tight">{site.name}</span>
          <ArrowUp className="h-3.5 w-3.5 opacity-60" />
          <span className="micro text-muted-foreground">Restore</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden px-3 pt-3 lg:block">
      <div
        ref={barRef}
        className="vibrancy pointer-events-auto mx-auto flex h-11 max-w-[1600px] items-center gap-0.5 rounded-xl pl-1 pr-2"
      >
        <TrafficLights onMinimise={() => setMinimised(true)} />

        <span aria-hidden className="mx-1.5 h-4 w-px bg-foreground/15" />

        {/* The wordmark goes home.

            It used to open an identity menu in the Apple menu's slot, which
            was the one place on the bar where the macOS metaphor cost more
            than it paid: a logo is the most-clicked "take me home" control on
            any site, and every visitor who reached for it got a dropdown
            instead. The menu's items all lived in Work/About/Contact anyway. */}
        <Link
          to="/"
          onClick={close}
          aria-label={`${site.name} — home`}
          aria-current={pathname === "/" ? "page" : undefined}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-foreground/10"
        >
          <span className="grid h-5 w-5 place-items-center rounded-[6px] bg-foreground font-display text-[11px] font-bold leading-none text-background">
            S
          </span>
          <span className="font-display text-sm font-bold tracking-tight text-foreground">
            {site.name}
          </span>
        </Link>

        {/* Section menus. */}
        <nav aria-label="Sections" className="flex items-center">
          {/* Apps sits first: it is the only menu that opens things rather
              than navigating, and it is the way into half the site. */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => (v === "apps" ? null : "apps"))}
              onPointerEnter={() => setOpen((v) => (v ? "apps" : v))}
              aria-expanded={open === "apps"}
              aria-haspopup="menu"
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                open === "apps"
                  ? "bg-foreground/15 text-foreground"
                  : "text-foreground/75 hover:bg-foreground/10 hover:text-foreground",
              )}
            >
              Apps
            </button>
            <AppsMenu open={open === "apps"} onPick={close} />
          </div>

          {MENUS.map((menu) => {
            const isOpen = open === menu.id;
            const active = menu.items.some(
              (item) =>
                item.kind === "route" &&
                item.to !== "/" &&
                pathname.startsWith(item.to.replace("/$slug", "")),
            );
            return (
              <div key={menu.id} className="relative">
                <button
                  type="button"
                  onClick={() => setOpen((v) => (v === menu.id ? null : menu.id))}
                  onPointerEnter={() => setOpen((v) => (v ? menu.id : v))}
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                    isOpen
                      ? "bg-foreground/15 text-foreground"
                      : active
                        ? "text-foreground hover:bg-foreground/10"
                        : "text-foreground/75 hover:bg-foreground/10 hover:text-foreground",
                  )}
                >
                  {menu.label}
                </button>
                <MenuPanel items={menu.items} open={isOpen} onPick={close} />
              </div>
            );
          })}
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
            className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-foreground/70 xl:flex"
            title={site.location}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span className="font-mono text-[11px]">{site.locationShort}</span>
          </span>

          <span
            aria-hidden
            className="flex items-center gap-2.5 px-2 text-foreground/70"
            title="All systems nominal"
          >
            <Wifi className="h-4 w-4" />
            <BatteryMedium className="h-4 w-4" />
          </span>

          <AppearanceControl />

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
