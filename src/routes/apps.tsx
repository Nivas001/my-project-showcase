import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState, type ComponentType } from "react";
import {
  Bug,
  Calculator as CalcIcon,
  FileText,
  Grid2x2,
  Image,
  Music4,
  Palette,
  SlidersHorizontal,
  Sparkles,
  Terminal as TerminalIcon,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react";
import { canonical } from "@/lib/site";
import { PageHero } from "@/components/kit";
import { useWindows, type AppId } from "@/components/os/WindowManager";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * /apps — every application, as a page
 * ============================================================================
 *
 * The desktop is a large-screen idea. A draggable 860px paint canvas on a
 * 390px phone is not a smaller version of the feature, it is a broken one — so
 * phones get this instead: the same apps, one at a time, filling the screen.
 *
 * On a large screen the tiles open the real window instead, because somebody on
 * a desktop who clicked "Paint" wants Paint on the desktop, not a page that
 * happens to contain Paint.
 */

const TITLE = "Apps — Srinivas M";
const DESCRIPTION =
  "Paint, Notes, a tycoon game, a working terminal, a Spotify player and several apps that exist purely to waste your time. All of them run in the browser.";

export const Route = createFileRoute("/apps")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [canonical("/apps")],
  }),
  component: AppsPage,
});

const l = <T,>(load: () => Promise<T>, pick: (mod: T) => ComponentType) =>
  lazy(() => load().then((mod) => ({ default: pick(mod) })));

type Entry = {
  id: AppId;
  label: string;
  blurb: string;
  Icon: typeof Palette;
  tint: string;
  group: "make" | "play" | "tools" | "jokes";
  /** Rendered inline on phones. */
  Component: ComponentType;
  /** Apps that manage their own height. */
  tall?: boolean;
};

const ENTRIES: Entry[] = [
  {
    id: "paint",
    label: "Paint",
    blurb: "Brush, fill, spray and an undo stack. Save it to the wall when you are done.",
    Icon: Palette,
    tint: "oklch(0.7 0.2 320)",
    group: "make",
    Component: l(
      () => import("@/components/apps/Paint"),
      (m) => m.Paint,
    ),
    tall: true,
  },
  {
    id: "notes",
    label: "Notes",
    blurb: "A public sticky board. Drafts save as you type; the board is visible to everyone.",
    Icon: FileText,
    tint: "oklch(0.8 0.15 95)",
    group: "make",
    Component: l(
      () => import("@/components/apps/Notes"),
      (m) => m.Notes,
    ),
    tall: true,
  },
  {
    id: "music",
    label: "Boombox",
    blurb: "Spotify in a window. Paste any link and it plays.",
    Icon: Music4,
    tint: "oklch(0.7 0.17 150)",
    group: "play",
    Component: l(
      () => import("@/components/apps/Boombox"),
      (m) => m.Boombox,
    ),
    tall: true,
  },
  {
    id: "tycoon",
    label: "Ship It Tycoon",
    blurb: "Hire, ship, get bugs, hire more. An animated office that runs while you read.",
    Icon: TrendingUp,
    tint: "oklch(0.72 0.18 60)",
    group: "play",
    Component: l(
      () => import("@/components/apps/Tycoon"),
      (m) => m.Tycoon,
    ),
    tall: true,
  },
  {
    id: "minesweeper",
    label: "Minesweeper",
    blurb: "Nine by nine, ten mines, first click always safe.",
    Icon: Bug,
    tint: "oklch(0.66 0.2 25)",
    group: "play",
    Component: l(
      () => import("@/components/apps/Minesweeper"),
      (m) => m.Minesweeper,
    ),
  },
  {
    id: "terminal",
    label: "Terminal",
    blurb: "A shell that actually drives the site. Try `open paint` or `theme kali`.",
    Icon: TerminalIcon,
    tint: "oklch(0.6 0.15 220)",
    group: "tools",
    Component: l(
      () => import("@/components/apps/Terminal"),
      (m) => m.TerminalApp,
    ),
    tall: true,
  },
  {
    id: "calculator",
    label: "Calculator",
    blurb: "Four functions, keyboard support, and it repeats on equals like a real one.",
    Icon: CalcIcon,
    tint: "oklch(0.62 0.05 250)",
    group: "tools",
    Component: l(
      () => import("@/components/apps/Calculator"),
      (m) => m.Calculator,
    ),
  },
  {
    id: "photos",
    label: "Photos",
    blurb: "Every screenshot from every project, in one library.",
    Icon: Image,
    tint: "oklch(0.66 0.18 255)",
    group: "tools",
    Component: l(
      () => import("@/components/apps/Photos"),
      (m) => m.Photos,
    ),
    tall: true,
  },
  {
    id: "settings",
    label: "System Settings",
    blurb: "Seven desktop skins, light and dark, and eight switches that make it worse.",
    Icon: SlidersHorizontal,
    tint: "oklch(0.55 0.04 250)",
    group: "tools",
    Component: l(
      () => import("@/components/apps/Settings"),
      (m) => m.SettingsApp,
    ),
    tall: true,
  },
  {
    id: "vibe",
    label: "Vibe Check",
    blurb: "Reads your browser and files a report. Nothing leaves the page.",
    Icon: Sparkles,
    tint: "oklch(0.72 0.19 320)",
    group: "jokes",
    Component: l(
      () => import("@/components/apps/Funnies"),
      (m) => m.VibeCheck,
    ),
  },
  {
    id: "excuses",
    label: "Excuse Engine",
    blurb: "Four hundred reasons it is not done yet. All grammatical.",
    Icon: Wrench,
    tint: "oklch(0.7 0.16 45)",
    group: "jokes",
    Component: l(
      () => import("@/components/apps/Funnies"),
      (m) => m.ExcuseEngine,
    ),
  },
  {
    id: "assistant",
    label: "NIV-9000",
    blurb: "An assistant with no function and strong opinions.",
    Icon: Grid2x2,
    tint: "oklch(0.68 0.15 200)",
    group: "jokes",
    Component: l(
      () => import("@/components/apps/Funnies"),
      (m) => m.Assistant,
    ),
  },
  {
    id: "installer",
    label: "Setup",
    blurb: "A progress bar that converges on ninety-nine and stops there.",
    Icon: Bug,
    tint: "oklch(0.6 0.06 250)",
    group: "jokes",
    Component: l(
      () => import("@/components/apps/Funnies"),
      (m) => m.Installer,
    ),
  },
];

const GROUPS: { id: Entry["group"]; label: string; blurb: string }[] = [
  { id: "make", label: "Make something", blurb: "Both of these save to a public page." },
  { id: "play", label: "Play something", blurb: "All three run entirely in your browser." },
  { id: "tools", label: "Actually useful", blurb: "Or at least genuinely working." },
  { id: "jokes", label: "Waste some time", blurb: "No redeeming features whatsoever." },
];

function AppsPage() {
  const { open } = useWindows();
  const [inline, setInline] = useState<Entry | null>(null);

  return (
    <>
      <PageHero
        index="05"
        label="Applications"
        lines={["Thirteen apps.", "All of them", "actually work."]}
        lede="Paint that saves to a public wall. A notes board anyone can post to. A tycoon game with an animated office. A terminal that drives the site. And four that exist only to waste ninety seconds of your life."
      >
        <p className="font-mono text-xs text-muted-foreground">
          On a desktop these open as real windows you can drag and stack. On a phone they open
          full-screen, right here.
        </p>
      </PageHero>

      <section
        data-act="noir"
        className="act-noir grain relative overflow-hidden border-t border-border"
      >
        <div
          aria-hidden
          className="hairline-grid pointer-events-none absolute inset-0 opacity-40"
        />

        <div className="relative mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
          {GROUPS.map((group) => (
            <div key={group.id} className="mb-12 last:mb-0">
              <div className="mb-4 flex flex-wrap items-baseline gap-x-3 border-b border-border pb-2.5">
                <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                  {group.label}
                </h2>
                <p className="text-sm text-muted-foreground">{group.blurb}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ENTRIES.filter((entry) => entry.group === group.id).map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      // The window layer only mounts at `lg`. Below that the
                      // tile has to render the app itself or the click does
                      // nothing at all, which is the worst possible outcome.
                      if (window.matchMedia("(min-width: 1024px)").matches) open(entry.id);
                      else setInline(entry);
                    }}
                    className="group flex flex-col rounded-md border border-border bg-card/60 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-foreground/40 hover:bg-card"
                  >
                    <span
                      aria-hidden
                      className="mb-3 grid h-10 w-10 place-items-center rounded-[10px]"
                      style={{ background: entry.tint }}
                    >
                      <entry.Icon className="h-5 w-5 text-black/75" />
                    </span>
                    <span className="text-[15px] font-bold text-foreground">{entry.label}</span>
                    <span className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {entry.blurb}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Full-screen inline app, for phones ---- */}
      {inline ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-background lg:hidden">
          <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2.5">
            <span className="text-[14px] font-semibold text-foreground">{inline.label}</span>
            <button
              type="button"
              onClick={() => setInline(null)}
              aria-label={`Close ${inline.label}`}
              className="ml-auto grid h-8 w-8 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div
            className={cn("min-h-0 flex-1", inline.tall ? "overflow-hidden" : "overflow-y-auto")}
          >
            <Suspense
              fallback={<p className="micro animate-pulse p-6 text-muted-foreground">Opening…</p>}
            >
              <inline.Component />
            </Suspense>
          </div>
        </div>
      ) : null}
    </>
  );
}
