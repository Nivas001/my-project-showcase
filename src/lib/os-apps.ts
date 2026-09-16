import { FileText, Mail, type LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import { site } from "@/lib/site";
import {
  AboutMark,
  ArcadeMark,
  CalendarFace,
  ClockFace,
  LaunchpadMark,
  LiveMark,
  SocialMark,
  StackMark,
  StoriesMark,
  TerminalMark,
  TrashMark,
  WorkMark,
  type AppGlyph,
} from "@/components/os/app-marks";

/**
 * The desktop's apps.
 *
 * Every tile is a real destination. Dock items route through TanStack Router so
 * deep links, the back button and crawlers all keep working — the desktop is a
 * skin over the site, not a replacement for it.
 */

/** What a dock tile *is*, which decides how clicking it behaves. */
export type AppKind = "app" | "stack" | "widget" | "launchpad";

/** One row of an icon's right-click menu. */
export type DockMenuItem =
  | { kind: "route"; label: string; to: string; params?: Record<string, string> }
  | { kind: "link"; label: string; href: string; download?: boolean }
  | { kind: "copy"; label: string; value: string }
  | { kind: "separator" }
  | { kind: "caption"; label: string };

export type AppSpec = {
  id: string;
  /** Shown under the icon and in the tooltip. */
  label: string;
  /** A tighter label for the phone dock, where four slots share one row. */
  short?: string;
  glyph: AppGlyph | LucideIcon;
  /** Two stops for the tile gradient, top then bottom. */
  from: string;
  to: string;
  /** Glyph colour. Light tiles need dark glyphs to stay legible. */
  ink?: "light" | "dark";
  /** Internal route. */
  to_?: string;
  /** External link, used instead of `to_`. */
  href?: string;
  /** Opens a window on the desktop rather than navigating. */
  window?: WindowId;
  /** Defaults to "app". */
  kind?: AppKind;
  /** Fanned out on click when `kind` is "stack". */
  items?: AppSpec[];
  /** Right-click menu. Every app gets one; this is the extra, app-specific part. */
  menu?: DockMenuItem[];
  /**
   * Renders the tile's face itself instead of a glyph on a gradient. Used by
   * the widgets, which have to show live values rather than a picture.
   *
   * A component, not a render function: these use hooks to defer reading the
   * clock until after mount, and calling them as plain functions would splice
   * those hooks into whichever component rendered the tile.
   */
  face?: ComponentType<{ size: number }>;
};

export type WindowId =
  | "about"
  | "resume"
  | "projects"
  | "readme"
  | "changelog"
  | "certificates"
  | "education"
  | "stack"
  | "contact";

/* The dock, left to right. Order matters — it is muscle memory. */
export const DOCK_APPS: AppSpec[] = [
  {
    id: "launchpad",
    label: "Launchpad",
    glyph: LaunchpadMark,
    kind: "launchpad",
    from: "oklch(0.86 0.02 250)",
    to: "oklch(0.66 0.03 255)",
    ink: "dark",
  },
  {
    id: "finder",
    label: "Work",
    glyph: WorkMark,
    from: "oklch(0.74 0.15 240)",
    to: "oklch(0.55 0.2 255)",
    to_: "/projects",
    menu: [
      { kind: "route", label: "All projects", to: "/projects" },
      { kind: "route", label: "How a project gets built", to: "/projects" },
    ],
  },
  {
    id: "projects-stack",
    label: "Projects",
    glyph: StackMark,
    kind: "stack",
    from: "oklch(0.8 0.13 200)",
    to: "oklch(0.58 0.16 225)",
    // Filled at runtime from the projects query — see Dock.tsx.
    items: [],
  },
  {
    id: "about",
    label: "About",
    glyph: AboutMark,
    from: "oklch(0.78 0.03 250)",
    to: "oklch(0.52 0.04 255)",
    to_: "/about",
    menu: [
      { kind: "route", label: "The long version", to: "/about" },
      { kind: "link", label: "Download résumé", href: site.resumeUrl, download: true },
    ],
  },
  {
    id: "arcade",
    label: "Arcade",
    glyph: ArcadeMark,
    from: "oklch(0.72 0.19 320)",
    to: "oklch(0.52 0.24 300)",
    to_: "/fun",
  },
  {
    id: "stories",
    label: "Stories",
    glyph: StoriesMark,
    from: "oklch(0.58 0.2 25)",
    to: "oklch(0.36 0.16 20)",
    to_: "/horror",
  },
  {
    id: "terminal",
    label: "Contact",
    glyph: TerminalMark,
    from: "oklch(0.34 0 0)",
    to: "oklch(0.16 0 0)",
    to_: "/contact",
    menu: [
      { kind: "route", label: "Contact page", to: "/contact" },
      { kind: "separator" },
      { kind: "copy", label: "Copy email address", value: site.email },
      { kind: "copy", label: "Copy phone number", value: site.phone },
    ],
  },
  {
    id: "mail",
    label: "Email me",
    short: "Email",
    glyph: Mail,
    from: "oklch(0.78 0.14 235)",
    to: "oklch(0.56 0.19 250)",
    href: `mailto:${site.email}`,
    menu: [
      { kind: "link", label: "New message", href: `mailto:${site.email}` },
      { kind: "copy", label: "Copy address", value: site.email },
    ],
  },
  {
    id: "safari",
    label: "Live sites",
    glyph: LiveMark,
    from: "oklch(0.82 0.11 220)",
    to: "oklch(0.55 0.2 250)",
    href: "https://estate-ulagam.vercel.app",
    menu: [
      { kind: "caption", label: "Five products, live right now" },
      { kind: "link", label: "Estate Ulagam", href: "https://estate-ulagam.vercel.app" },
      { kind: "link", label: "Vaaram Magazine", href: "https://vaaram.ca" },
      { kind: "link", label: "Ani Bakes", href: "https://anibakes.app" },
      { kind: "link", label: "AARRKKAA", href: "https://aarrkkaa.com" },
      { kind: "link", label: "Velocity", href: "https://velocitybox.app" },
      { kind: "separator" },
      { kind: "route", label: "See all live work", to: "/projects" },
    ],
  },
  {
    id: "social",
    label: "Elsewhere",
    glyph: SocialMark,
    kind: "stack",
    from: "oklch(0.7 0.12 150)",
    to: "oklch(0.45 0.13 160)",
    items: [
      {
        id: "social-github",
        label: "GitHub",
        glyph: SocialMark,
        from: "oklch(0.42 0 0)",
        to: "oklch(0.2 0 0)",
        href: site.github,
      },
      {
        id: "social-linkedin",
        label: "LinkedIn",
        glyph: AboutMark,
        from: "oklch(0.66 0.13 245)",
        to: "oklch(0.45 0.15 250)",
        href: site.linkedin,
      },
      {
        id: "social-mail",
        label: "Email",
        glyph: Mail,
        from: "oklch(0.78 0.14 235)",
        to: "oklch(0.56 0.19 250)",
        href: `mailto:${site.email}`,
      },
      {
        id: "social-resume",
        label: "Résumé",
        glyph: FileText,
        from: "oklch(0.95 0 0)",
        to: "oklch(0.84 0.03 30)",
        ink: "dark",
        href: site.resumeUrl,
      },
    ],
  },
  {
    id: "calendar",
    label: "Today",
    glyph: AboutMark,
    kind: "widget",
    from: "oklch(0.97 0 0)",
    to: "oklch(0.9 0 0)",
    ink: "dark",
    face: CalendarFace,
    to_: "/about",
  },
  {
    id: "clock",
    label: site.locationShort,
    glyph: AboutMark,
    kind: "widget",
    from: "oklch(0.97 0 0)",
    to: "oklch(0.88 0 0)",
    ink: "dark",
    face: ClockFace,
    to_: "/contact",
  },
];

/** Pinned to the right of the dock separator, exactly where macOS puts it. */
export const TRASH_APP: AppSpec = {
  id: "trash",
  label: "Trash",
  glyph: TrashMark,
  from: "oklch(0.8 0.02 240)",
  to: "oklch(0.58 0.03 245)",
  ink: "dark",
  to_: "/surprise",
};

/** Files sitting on the wallpaper. These open windows instead of navigating. */
export const DESKTOP_FILES: AppSpec[] = [
  {
    id: "projects-folder",
    label: "Projects",
    glyph: WorkMark,
    from: "oklch(0.8 0.12 235)",
    to: "oklch(0.62 0.17 250)",
    window: "projects",
  },
  {
    id: "about-txt",
    label: "about-me.txt",
    glyph: FileText,
    from: "oklch(0.95 0 0)",
    to: "oklch(0.82 0 0)",
    ink: "dark",
    window: "about",
  },
  {
    id: "resume-pdf",
    label: "Résumé.pdf",
    glyph: FileText,
    from: "oklch(0.95 0 0)",
    to: "oklch(0.84 0.03 30)",
    ink: "dark",
    window: "resume",
  },
  {
    id: "changelog-log",
    label: "changelog.log",
    glyph: TerminalMark,
    from: "oklch(0.42 0 0)",
    to: "oklch(0.2 0 0)",
    window: "changelog",
  },
  {
    id: "stack-app",
    label: "stack.app",
    glyph: StackMark,
    from: "oklch(0.78 0.14 175)",
    to: "oklch(0.54 0.15 195)",
    window: "stack",
  },
  {
    id: "certificates",
    label: "certificates",
    glyph: WorkMark,
    from: "oklch(0.86 0.13 85)",
    to: "oklch(0.68 0.16 65)",
    window: "certificates",
  },
  {
    id: "education-txt",
    label: "education.txt",
    glyph: FileText,
    from: "oklch(0.95 0.04 95)",
    to: "oklch(0.84 0.08 85)",
    ink: "dark",
    window: "education",
  },
  {
    id: "contact-card",
    label: "contact.card",
    glyph: AboutMark,
    from: "oklch(0.74 0.15 300)",
    to: "oklch(0.5 0.18 305)",
    window: "contact",
  },
  {
    id: "readme",
    label: "read-me-first.rtf",
    glyph: FileText,
    from: "oklch(0.95 0.04 95)",
    to: "oklch(0.84 0.08 85)",
    ink: "dark",
    window: "readme",
  },
];

const byId = (id: string) => DOCK_APPS.find((app) => app.id === id)!;

/** The iOS home screen. Same destinations, phone-sized set. */
export const HOME_APPS: AppSpec[] = [
  byId("finder"),
  byId("about"),
  byId("arcade"),
  byId("stories"),
  {
    id: "resume-ios",
    label: "Résumé",
    glyph: FileText,
    from: "oklch(0.95 0 0)",
    to: "oklch(0.84 0.03 30)",
    ink: "dark",
    href: site.resumeUrl,
  },
  byId("safari"),
  byId("mail"),
  TRASH_APP,
];

/** The iOS dock: the four things most worth tapping. */
export const IOS_DOCK: AppSpec[] = [byId("finder"), byId("about"), byId("terminal"), byId("mail")];

/**
 * Every destination on the site, in one list.
 *
 * The ⌘K palette and the Launchpad are two views of this — they must never
 * drift apart, which they will the moment each keeps its own copy.
 */
export const NAV_PAGES = [
  { label: "Home", to: "/" as const },
  { label: "Work", to: "/projects" as const },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
  { label: "The arcade", to: "/fun" as const },
  { label: "Horror stories", to: "/horror" as const },
  { label: "Beat an AI", to: "/how-to-be-smarter-than-an-ai" as const },
  { label: "Something else", to: "/surprise" as const },
];
