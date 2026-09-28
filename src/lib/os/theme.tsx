import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * ============================================================================
 * THE OS THEME
 * ============================================================================
 *
 * Two independent axes, because they answer different questions:
 *
 *   mode   light / dark / auto — how bright the page is. Retunes the two acts
 *          (see styles.css); every component already reads semantic tokens, so
 *          nothing needs a conditional.
 *
 *   skin   which desktop the chrome is dressed as. macOS, four Windows eras,
 *          Ubuntu and Kali. A skin changes window corners, title-bar layout,
 *          accent, wallpaper and typeface — never the site's content.
 *
 * Both are written to <html> as data attributes and read entirely from CSS.
 * That is deliberate: a skin that lived in React state would have to be
 * threaded through forty components and would flash the wrong theme on every
 * server-rendered paint.
 *
 * `flags` is the fun drawer — the toggles on the Settings page that exist to
 * be played with rather than used. They are opt-in, off by default, and every
 * one of them is reversible from the same panel that turned it on.
 */

export const SKINS = [
  {
    id: "macos",
    label: "macOS Tahoe",
    blurb: "Liquid glass, traffic lights on the left, a dock that magnifies.",
    family: "mac",
  },
  {
    id: "win7",
    label: "Windows 7",
    blurb: "Aero. Glass with a blue bleed, gradient buttons, a Start orb.",
    family: "win",
  },
  {
    id: "win81",
    label: "Windows 8.1",
    blurb: "Metro. Flat squares, no corners at all, one loud accent.",
    family: "win",
  },
  {
    id: "win10",
    label: "Windows 10",
    blurb: "Fluent, before the rounding. Sharp chrome, cobalt highlight.",
    family: "win",
  },
  {
    id: "win11",
    label: "Windows 11",
    blurb: "Mica, 8px corners, everything centred.",
    family: "win",
  },
  {
    id: "ubuntu",
    label: "Ubuntu",
    blurb: "Yaru. Aubergine and orange, controls on the right.",
    family: "linux",
  },
  {
    id: "kali",
    label: "Kali Linux",
    blurb: "Xfce in the dark. Dragon blue on black, monospace everywhere.",
    family: "linux",
  },
] as const;

export type Skin = (typeof SKINS)[number]["id"];
export type Mode = "light" | "dark" | "auto";

export function isSkin(value: string): value is Skin {
  return SKINS.some((s) => s.id === value);
}

/** Where the window controls live. Drives the Window title-bar layout. */
export function controlSide(skin: Skin): "left" | "right" {
  return skin === "macos" || skin === "ubuntu" ? "left" : "right";
}

/* --------------------------------------------------------------------------
 * The fun drawer
 *
 * Each flag is one CSS class or one small behaviour. Keeping them in a single
 * record means the Settings panel renders itself from this list and never
 * drifts out of sync with what actually works.
 * ------------------------------------------------------------------------ */

export const FLAGS = [
  {
    id: "crt",
    label: "CRT mode",
    blurb: "Scanlines and a phosphor glow over the whole site. Regret it slowly.",
  },
  {
    id: "comic",
    label: "Comic Sans everything",
    blurb: "Six weeks of type decisions, undone in one click.",
  },
  {
    id: "trail",
    label: "Cursor trail",
    blurb: "A comet follows your pointer, like it is 2003 and you host on GeoCities.",
  },
  {
    id: "shake",
    label: "Nervous buttons",
    blurb: "Buttons flinch when you get close. They know what you did.",
  },
  {
    id: "upside",
    label: "Down under",
    blurb: "Flips the entire page. There is no second click to undo it — use the switch.",
  },
  {
    id: "grayscale",
    label: "Drain the colour",
    blurb: "For when you want to see whether the layout holds up without the paint.",
  },
  {
    id: "confetti",
    label: "Applause",
    blurb: "Every click throws confetti. Every single one.",
  },
  {
    id: "honest",
    label: "Honest labels",
    blurb: "Rewrites the interface to say what it actually means.",
  },
] as const;

export type FlagId = (typeof FLAGS)[number]["id"];
export type Flags = Partial<Record<FlagId, boolean>>;

type ThemeState = {
  skin: Skin;
  mode: Mode;
  /** The mode actually painted — `auto` resolved against the OS preference. */
  resolved: "light" | "dark";
  flags: Flags;
  setSkin: (skin: Skin) => void;
  setMode: (mode: Mode) => void;
  toggleFlag: (id: FlagId) => void;
  setFlag: (id: FlagId, on: boolean) => void;
  resetFlags: () => void;
};

const KEY = "nivas.os.theme.v1";

const ThemeContext = createContext<ThemeState | null>(null);

type Stored = { skin?: string; mode?: string; flags?: Flags };

function read(): Stored {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Stored;
  } catch {
    return {};
  }
}

/**
 * Written into <head> so the attributes land before first paint. Without it
 * every visitor who chose Kali gets one white frame of macOS on each
 * navigation, which is worse than not offering the choice at all.
 */
export const THEME_BOOT_SCRIPT = [
  "(function(){try{",
  `var s=JSON.parse(localStorage.getItem(${JSON.stringify(KEY)})||"{}");`,
  "var root=document.documentElement;",
  'root.setAttribute("data-skin", s.skin||"macos");',
  'var m=s.mode||"dark";',
  'var r=m==="auto"?(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):m;',
  'root.setAttribute("data-mode", r);',
  'root.classList.toggle("dark", r==="dark");',
  "var f=s.flags||{};",
  'for(var k in f){if(f[k])root.classList.add("fx-"+k);}',
  "}catch(e){}})();",
].join("");

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The server has no localStorage, so the first render must match the markup
  // the boot script has *already* corrected in the browser. Starting from the
  // defaults and syncing in an effect keeps hydration quiet.
  const [skin, setSkinState] = useState<Skin>("macos");
  const [mode, setModeState] = useState<Mode>("dark");
  const [flags, setFlags] = useState<Flags>({});
  const [systemLight, setSystemLight] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = read();
    if (stored.skin && isSkin(stored.skin)) setSkinState(stored.skin);
    if (stored.mode === "light" || stored.mode === "dark" || stored.mode === "auto") {
      setModeState(stored.mode);
    }
    if (stored.flags) setFlags(stored.flags);
    setHydrated(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const sync = () => setSystemLight(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const resolved: "light" | "dark" = mode === "auto" ? (systemLight ? "light" : "dark") : mode;

  // Paint. Skipped until hydration so the boot script's attributes are not
  // briefly stomped with the defaults on the way through.
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.setAttribute("data-skin", skin);
    root.setAttribute("data-mode", resolved);
    root.classList.toggle("dark", resolved === "dark");
    for (const flag of FLAGS) root.classList.toggle(`fx-${flag.id}`, Boolean(flags[flag.id]));

    // Phone browser chrome reads this, and a light site under a black status
    // bar looks broken in a way people blame on the site.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", resolved === "light" ? "#f4f3ef" : "#080808");
  }, [skin, resolved, flags, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ skin, mode, flags }));
    } catch {
      /* private mode, quota, or a browser that blocks storage — not fatal */
    }
  }, [skin, mode, flags, hydrated]);

  const setSkin = useCallback((next: Skin) => setSkinState(next), []);
  const setMode = useCallback((next: Mode) => setModeState(next), []);
  const toggleFlag = useCallback((id: FlagId) => setFlags((f) => ({ ...f, [id]: !f[id] })), []);
  const setFlag = useCallback(
    (id: FlagId, on: boolean) => setFlags((f) => ({ ...f, [id]: on })),
    [],
  );
  const resetFlags = useCallback(() => setFlags({}), []);

  const value = useMemo<ThemeState>(
    () => ({ skin, mode, resolved, flags, setSkin, setMode, toggleFlag, setFlag, resetFlags }),
    [skin, mode, resolved, flags, setSkin, setMode, toggleFlag, setFlag, resetFlags],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Safe outside the provider: returns inert defaults rather than throwing, so a
 * component can be rendered in isolation without dragging the theme layer in.
 */
export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  return {
    skin: "macos",
    mode: "dark",
    resolved: "dark",
    flags: {},
    setSkin: () => {},
    setMode: () => {},
    toggleFlag: () => {},
    setFlag: () => {},
    resetFlags: () => {},
  };
}
