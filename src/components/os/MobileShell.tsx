import { useRouterState } from "@tanstack/react-router";
import { BatteryMedium, Signal, Wifi } from "lucide-react";
import { StatusDot } from "@/components/kit";
import { HOME_APPS, IOS_DOCK } from "@/lib/os-apps";
import { LocalClock } from "@/components/kit";
import { site } from "@/lib/site";
import { AppIcon, AppTarget } from "./AppIcon";

/**
 * iOS status bar. Phones and tablets only; the desktop gets the menu bar.
 *
 * It sits above the page rather than inside it, so every route keeps the same
 * "this is a device" framing.
 */
/** What the island should say for the route currently on screen. */
const ROUTE_TITLES: [prefix: string, title: string][] = [
  ["/projects", "Work"],
  ["/about", "About"],
  ["/contact", "Contact"],
  ["/fun", "Arcade"],
  ["/horror", "Stories"],
  ["/how-to-be-smarter-than-an-ai", "Beat an AI"],
  ["/surprise", "???"],
  ["/auth", "Admin"],
  ["/admin", "Admin"],
];

export function StatusBar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const match = ROUTE_TITLES.find(([prefix]) => pathname.startsWith(prefix));

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 lg:hidden">
      <div className="vibrancy flex h-11 items-center justify-between rounded-none border-x-0 border-t-0 px-4">
        <LocalClock
          timeZone={site.timezone}
          className="shrink-0 whitespace-nowrap font-mono text-[12px] font-semibold tabular-nums text-foreground"
        />

        {/* The island. Carries the route name so a phone always knows where it
            is — the menu bar does that job on desktop, and the dock alone does
            not say which page you are on. */}
        <span className="mx-2 flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-foreground/10 px-2.5 py-1">
          <StatusDot tone={match ? "hog-red" : "hog-green"} />
          <span className="truncate font-mono text-[10px] uppercase tracking-widest text-foreground/90">
            {match ? match[1] : `${site.name} · Portfolio`}
          </span>
        </span>

        <span
          aria-hidden
          className="flex shrink-0 items-center justify-end gap-1.5 text-foreground"
        >
          <Signal className="h-3.5 w-3.5" />
          <Wifi className="h-3.5 w-3.5" />
          <BatteryMedium className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

/**
 * The iOS home-screen grid. Rendered inside the hero on small screens, in the
 * space the desktop uses for its file icons.
 */
export function HomeScreen() {
  return (
    <div className="lg:hidden">
      <div className="grid grid-cols-4 gap-x-3 gap-y-5">
        {HOME_APPS.map((app) => (
          <AppTarget
            key={app.id}
            app={app}
            aria-label={app.label}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <AppIcon app={app} size={58} />
            <span className="w-full truncate text-[11px] leading-tight text-foreground/90">
              {app.label}
            </span>
          </AppTarget>
        ))}
      </div>

      {/* Page dots, because a home screen has them. */}
      <div aria-hidden className="mt-5 flex items-center justify-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-foreground/80" />
        <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
      </div>
    </div>
  );
}

/** The frosted iOS dock, pinned to the bottom of every page on small screens. */
export function MobileDock() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 lg:hidden">
      <nav
        aria-label="Dock"
        className="vibrancy pointer-events-auto mx-auto flex max-w-sm items-center justify-around rounded-[1.75rem] px-3 py-2.5"
      >
        {IOS_DOCK.map((app) => {
          const active = Boolean(app.to_ && pathname.startsWith(app.to_) && app.to_ !== "/");
          return (
            <AppTarget
              key={app.id}
              app={app}
              aria-label={app.label}
              className="relative flex flex-col items-center gap-1 rounded-xl p-0.5"
            >
              <AppIcon app={app} size={50} />
              <span
                aria-hidden
                className={`h-1 w-1 rounded-full bg-foreground transition-opacity ${
                  active ? "opacity-80" : "opacity-0"
                }`}
              />
            </AppTarget>
          );
        })}
      </nav>

      {/* Home indicator. */}
      <span aria-hidden className="mx-auto mt-2 block h-1 w-32 rounded-full bg-foreground/35" />
    </div>
  );
}
