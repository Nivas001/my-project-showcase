import {
  BookOpen,
  Compass,
  FileText,
  FolderOpen,
  Gamepad2,
  Github,
  Linkedin,
  Mail,
  Terminal,
  Trash2,
  User,
  type LucideIcon,
} from "lucide-react";
import { site } from "@/lib/site";

/**
 * The desktop's apps.
 *
 * Every tile is a real destination. Dock items route through TanStack Router so
 * deep links, the back button and crawlers all keep working — the desktop is a
 * skin over the site, not a replacement for it.
 */
export type AppSpec = {
  id: string;
  /** Shown under the icon and in the tooltip. */
  label: string;
  glyph: LucideIcon;
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
};

export type WindowId = "about" | "resume" | "projects" | "readme";

/* The dock, left to right. Order matters — it is muscle memory. */
export const DOCK_APPS: AppSpec[] = [
  {
    id: "finder",
    label: "Work",
    glyph: FolderOpen,
    from: "oklch(0.74 0.15 240)",
    to: "oklch(0.55 0.2 255)",
    to_: "/projects",
  },
  {
    id: "about",
    label: "About",
    glyph: User,
    from: "oklch(0.78 0.03 250)",
    to: "oklch(0.52 0.04 255)",
    to_: "/about",
  },
  {
    id: "arcade",
    label: "Arcade",
    glyph: Gamepad2,
    from: "oklch(0.72 0.19 320)",
    to: "oklch(0.52 0.24 300)",
    to_: "/fun",
  },
  {
    id: "stories",
    label: "Stories",
    glyph: BookOpen,
    from: "oklch(0.58 0.2 25)",
    to: "oklch(0.36 0.16 20)",
    to_: "/horror",
  },
  {
    id: "terminal",
    label: "Contact",
    glyph: Terminal,
    from: "oklch(0.34 0 0)",
    to: "oklch(0.16 0 0)",
    to_: "/contact",
  },
  {
    id: "mail",
    label: "Email me",
    glyph: Mail,
    from: "oklch(0.78 0.14 235)",
    to: "oklch(0.56 0.19 250)",
    href: `mailto:${site.email}`,
  },
  {
    id: "safari",
    label: "Live sites",
    glyph: Compass,
    from: "oklch(0.82 0.11 220)",
    to: "oklch(0.55 0.2 250)",
    href: "https://www.anibakes.app",
  },
  {
    id: "github",
    label: "GitHub",
    glyph: Github,
    from: "oklch(0.42 0 0)",
    to: "oklch(0.2 0 0)",
    href: site.github,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    glyph: Linkedin,
    from: "oklch(0.66 0.13 245)",
    to: "oklch(0.45 0.15 250)",
    href: site.linkedin,
  },
];

/** Pinned to the right of the dock separator, exactly where macOS puts it. */
export const TRASH_APP: AppSpec = {
  id: "trash",
  label: "Trash",
  glyph: Trash2,
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
    glyph: FolderOpen,
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
    id: "readme",
    label: "read-me-first.rtf",
    glyph: FileText,
    from: "oklch(0.95 0.04 95)",
    to: "oklch(0.84 0.08 85)",
    ink: "dark",
    window: "readme",
  },
];

/** The iOS home screen. Same destinations, phone-sized set. */
export const HOME_APPS: AppSpec[] = [
  ...DOCK_APPS.slice(0, 4),
  {
    id: "resume-ios",
    label: "Résumé",
    glyph: FileText,
    from: "oklch(0.95 0 0)",
    to: "oklch(0.84 0.03 30)",
    ink: "dark",
    href: site.resumeUrl,
  },
  DOCK_APPS[6]!,
  DOCK_APPS[7]!,
  TRASH_APP,
];

/** The iOS dock: the four things most worth tapping. */
export const IOS_DOCK: AppSpec[] = [DOCK_APPS[0]!, DOCK_APPS[1]!, DOCK_APPS[4]!, DOCK_APPS[5]!];
