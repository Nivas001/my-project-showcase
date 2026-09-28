import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { Window } from "./Window";

/**
 * ============================================================================
 * THE WINDOW MANAGER
 * ============================================================================
 *
 * One provider at the root owns every window on the site, so anything — a dock
 * tile, a menu item, a link in a paragraph — can open an app without knowing
 * where the window layer lives.
 *
 * Every app is behind `lazy()`. That is not an optimisation, it is the only
 * reason this is affordable: the paint canvas, the tycoon simulation and the
 * voice theatre are each larger than the homepage, and none of them should be
 * downloaded by somebody who came to read a case study.
 *
 * Stacking is an ordered list rather than a z-index map. The most recently
 * focused window is last, gets the highest index, and that is the whole rule.
 */

export type AppId =
  /* Documents — the files on the wallpaper. */
  | "about"
  | "resume"
  | "projects"
  | "readme"
  | "changelog"
  | "certificates"
  | "education"
  | "stack"
  | "contact"
  /* Applications. */
  | "paint"
  | "notes"
  | "settings"
  | "music"
  | "tycoon"
  | "terminal"
  | "calculator"
  | "photos"
  | "minesweeper"
  /* The ones that exist to waste your time. */
  | "vibe"
  | "excuses"
  | "installer"
  | "assistant";

type AppWindow = {
  title: string;
  /** Shown under the title in the macOS skin — the "which app is this" line. */
  subtitle: string;
  width: number;
  height?: number;
  scroll?: boolean;
  /** Cascade offset from the centre, so a second window never lands on a first. */
  offset: { x: number; y: number };
  Component: ComponentType;
};

/* --------------------------------------------------------------------------
 * Lazy chunks
 *
 * Named exports are re-shaped into the default export `lazy()` expects. Doing
 * it here rather than adding default exports keeps every app file exporting a
 * name you can grep for.
 * ------------------------------------------------------------------------ */

const l = <T,>(load: () => Promise<T>, pick: (mod: T) => ComponentType) =>
  lazy(() => load().then((mod) => ({ default: pick(mod) })));

const docs = () => import("./WindowContents");

const REGISTRY: Record<AppId, AppWindow> = {
  /* ---- Documents ---- */
  about: {
    title: "about-me.txt",
    subtitle: "TextEdit",
    width: 520,
    offset: { x: -60, y: 10 },
    Component: l(docs, (m) => m.AboutWindow),
  },
  resume: {
    title: "Résumé.pdf",
    subtitle: "Preview",
    width: 500,
    offset: { x: 90, y: -20 },
    Component: l(docs, (m) => m.ResumeWindow),
  },
  projects: {
    title: "Projects",
    subtitle: "Finder",
    width: 620,
    offset: { x: 40, y: 60 },
    Component: l(
      () => import("./DataWindows"),
      (m) => m.ProjectsFinder,
    ),
  },
  readme: {
    title: "read-me-first.rtf",
    subtitle: "TextEdit",
    width: 520,
    offset: { x: -180, y: -40 },
    Component: l(
      () => import("./DataWindows"),
      (m) => m.ReadmeDoc,
    ),
  },
  changelog: {
    title: "changelog.log",
    subtitle: "Console",
    width: 560,
    offset: { x: -140, y: 70 },
    Component: l(docs, (m) => m.ChangelogWindow),
  },
  certificates: {
    title: "certificates",
    subtitle: "Finder",
    width: 520,
    offset: { x: 150, y: 40 },
    Component: l(docs, (m) => m.CertificatesWindow),
  },
  education: {
    title: "education.txt",
    subtitle: "TextEdit",
    width: 520,
    offset: { x: -20, y: -70 },
    Component: l(docs, (m) => m.EducationWindow),
  },
  stack: {
    title: "stack.app",
    subtitle: "About This Stack",
    width: 540,
    offset: { x: 110, y: -60 },
    Component: l(docs, (m) => m.StackWindow),
  },
  contact: {
    title: "contact.card",
    subtitle: "Contacts",
    width: 440,
    offset: { x: -210, y: 20 },
    Component: l(docs, (m) => m.ContactWindow),
  },

  /* ---- Applications ---- */
  paint: {
    title: "Paint",
    subtitle: "Draw something",
    width: 860,
    height: 560,
    scroll: false,
    offset: { x: 0, y: -10 },
    Component: l(
      () => import("@/components/apps/Paint"),
      (m) => m.Paint,
    ),
  },
  notes: {
    title: "Notes",
    subtitle: "Write it down",
    width: 720,
    height: 520,
    scroll: false,
    offset: { x: -40, y: 20 },
    Component: l(
      () => import("@/components/apps/Notes"),
      (m) => m.Notes,
    ),
  },
  settings: {
    title: "System Settings",
    subtitle: "Make it yours",
    width: 760,
    height: 540,
    scroll: false,
    offset: { x: 30, y: 0 },
    Component: l(
      () => import("@/components/apps/Settings"),
      (m) => m.SettingsApp,
    ),
  },
  music: {
    title: "Boombox",
    subtitle: "Spotify",
    width: 420,
    height: 600,
    scroll: false,
    offset: { x: 240, y: 10 },
    Component: l(
      () => import("@/components/apps/Boombox"),
      (m) => m.Boombox,
    ),
  },
  tycoon: {
    title: "Ship It Tycoon",
    subtitle: "Idle empire",
    width: 900,
    height: 580,
    scroll: false,
    offset: { x: 0, y: 0 },
    Component: l(
      () => import("@/components/apps/Tycoon"),
      (m) => m.Tycoon,
    ),
  },
  terminal: {
    title: "nivas@portfolio: ~",
    subtitle: "Terminal",
    width: 640,
    height: 420,
    scroll: false,
    offset: { x: -120, y: 90 },
    Component: l(
      () => import("@/components/apps/Terminal"),
      (m) => m.TerminalApp,
    ),
  },
  calculator: {
    title: "Calculator",
    subtitle: "Basic",
    width: 260,
    scroll: false,
    offset: { x: 300, y: -60 },
    Component: l(
      () => import("@/components/apps/Calculator"),
      (m) => m.Calculator,
    ),
  },
  photos: {
    title: "Photos",
    subtitle: "Shipped work",
    width: 720,
    height: 480,
    scroll: false,
    offset: { x: -70, y: -30 },
    Component: l(
      () => import("@/components/apps/Photos"),
      (m) => m.Photos,
    ),
  },
  minesweeper: {
    title: "Minesweeper",
    subtitle: "Ten mines",
    width: 320,
    scroll: false,
    offset: { x: 200, y: 70 },
    Component: l(
      () => import("@/components/apps/Minesweeper"),
      (m) => m.Minesweeper,
    ),
  },

  /* ---- The time-wasters ---- */
  vibe: {
    title: "Vibe Check",
    subtitle: "Diagnostics",
    width: 480,
    offset: { x: -160, y: -50 },
    Component: l(
      () => import("@/components/apps/Funnies"),
      (m) => m.VibeCheck,
    ),
  },
  excuses: {
    title: "Excuse Engine",
    subtitle: "Standup helper",
    width: 460,
    offset: { x: 130, y: 80 },
    Component: l(
      () => import("@/components/apps/Funnies"),
      (m) => m.ExcuseEngine,
    ),
  },
  installer: {
    title: "Setup",
    subtitle: "Please wait",
    width: 480,
    offset: { x: -30, y: -90 },
    Component: l(
      () => import("@/components/apps/Funnies"),
      (m) => m.Installer,
    ),
  },
  assistant: {
    title: "NIV-9000",
    subtitle: "Assistant",
    width: 380,
    offset: { x: 280, y: 90 },
    Component: l(
      () => import("@/components/apps/Funnies"),
      (m) => m.Assistant,
    ),
  },
};

export const APP_IDS = Object.keys(REGISTRY) as AppId[];

export function appTitle(id: AppId) {
  return REGISTRY[id].title;
}

export function isAppId(value: string): value is AppId {
  return value in REGISTRY;
}

type ManagerState = {
  /** Bottom to top. The last entry is focused. */
  stack: AppId[];
  open: (id: AppId) => void;
  close: (id: AppId) => void;
  toggle: (id: AppId) => void;
  focus: (id: AppId) => void;
  closeAll: () => void;
};

const Ctx = createContext<ManagerState | null>(null);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<AppId[]>([]);

  const focus = useCallback((id: AppId) => {
    setStack((s) => (s[s.length - 1] === id ? s : [...s.filter((x) => x !== id), id]));
  }, []);

  const open = useCallback((id: AppId) => {
    setStack((s) => [...s.filter((x) => x !== id), id]);
  }, []);

  const close = useCallback((id: AppId) => {
    setStack((s) => s.filter((x) => x !== id));
  }, []);

  const toggle = useCallback((id: AppId) => {
    setStack((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }, []);

  const closeAll = useCallback(() => setStack([]), []);

  const value = useMemo<ManagerState>(
    () => ({ stack, open, close, toggle, focus, closeAll }),
    [stack, open, close, toggle, focus, closeAll],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <WindowLayer />
    </Ctx.Provider>
  );
}

/**
 * Inert outside the provider rather than throwing, so a component that happens
 * to offer an "open in a window" affordance can still render on a page that
 * has no window layer.
 */
export function useWindows(): ManagerState {
  return (
    useContext(Ctx) ?? {
      stack: [],
      open: () => {},
      close: () => {},
      toggle: () => {},
      focus: () => {},
      closeAll: () => {},
    }
  );
}

function Fallback() {
  return (
    <div className="grid h-40 place-items-center">
      <span className="micro animate-pulse text-muted-foreground">Opening…</span>
    </div>
  );
}

/**
 * The window layer itself.
 *
 * Desktop windows are a large-screen idea. On a phone the same apps are reached
 * as full pages from /apps, so this layer simply does not mount below `lg` —
 * a draggable 860px canvas on a 390px screen is not a smaller version of the
 * feature, it is a broken one.
 */
function WindowLayer() {
  const { stack, close, focus } = useWindows();
  if (stack.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 hidden lg:block">
      <div className="relative mx-auto flex h-full max-w-[1600px] items-center justify-center">
        {stack.map((id, i) => {
          const spec = REGISTRY[id];
          const { Component } = spec;
          return (
            <Window
              key={id}
              title={spec.title}
              subtitle={spec.subtitle}
              width={spec.width}
              {...(spec.height !== undefined ? { height: spec.height } : {})}
              scroll={spec.scroll ?? true}
              initial={spec.offset}
              zIndex={30 + i}
              onFocus={() => focus(id)}
              onClose={() => close(id)}
            >
              <Suspense fallback={<Fallback />}>
                <Component />
              </Suspense>
            </Window>
          );
        })}
      </div>
    </div>
  );
}
