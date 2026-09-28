import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Monitor, Moon, Palette, RotateCcw, Sparkles, Sun } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FLAGS, SKINS, useTheme, type Mode, type Skin } from "@/lib/os/theme";
import { NAV_PAGES } from "@/lib/os-apps";

/**
 * ============================================================================
 * SYSTEM SETTINGS
 * ============================================================================
 *
 * Three panes, because the three things it controls answer different
 * questions: what the desktop looks like, how bright the site is, and which
 * jokes are switched on.
 *
 * Every control here is reversible from this same panel, including the ones
 * that make the site briefly unusable. "Reset everything" is always visible in
 * the footer for exactly that reason — a settings screen that can trap you is
 * not a toy, it is a bug.
 */

type Pane = "appearance" | "desktop" | "fun";

const PANES: { id: Pane; label: string; Icon: typeof Palette }[] = [
  { id: "appearance", label: "Appearance", Icon: Sun },
  { id: "desktop", label: "Desktop", Icon: Monitor },
  { id: "fun", label: "Play", Icon: Sparkles },
];

const MODES: { id: Mode; label: string; blurb: string; Icon: typeof Sun }[] = [
  { id: "light", label: "Light", blurb: "Paper. Warm white ground, near-black ink.", Icon: Sun },
  {
    id: "dark",
    label: "Dark",
    blurb: "The default. Black field, charcoal product pages.",
    Icon: Moon,
  },
  {
    id: "auto",
    label: "Auto",
    blurb: "Follows whatever your operating system is doing.",
    Icon: Monitor,
  },
];

/* A miniature of the skin, drawn rather than screenshotted — a picture of a
   desktop would date the moment the skin was retuned, and would be another
   200KB of images on a page that is already a desktop. */
function SkinPreview({ id }: { id: Skin }) {
  const isWin = id.startsWith("win");
  const square = id === "win81" || id === "win10";
  const chrome: Record<Skin, { bar: string; body: string; accent: string; wall: string }> = {
    macos: {
      bar: "oklch(0.3 0 0 / 70%)",
      body: "oklch(0.22 0 0)",
      accent: "oklch(0.62 0.2 255)",
      wall: "linear-gradient(135deg, oklch(0.4 0.14 33), oklch(0.3 0.16 266))",
    },
    win7: {
      bar: "oklch(0.55 0.1 235 / 75%)",
      body: "oklch(0.26 0.02 235)",
      accent: "oklch(0.66 0.14 235)",
      wall: "linear-gradient(135deg, oklch(0.5 0.15 235), oklch(0.42 0.12 190))",
    },
    win81: {
      bar: "oklch(0.25 0.02 260)",
      body: "oklch(0.2 0.01 260)",
      accent: "oklch(0.55 0.2 250)",
      wall: "linear-gradient(135deg, oklch(0.5 0.2 250), oklch(0.5 0.18 150))",
    },
    win10: {
      bar: "oklch(0.2 0.01 260)",
      body: "oklch(0.24 0.01 260)",
      accent: "oklch(0.52 0.21 255)",
      wall: "linear-gradient(135deg, oklch(0.42 0.2 258), oklch(0.32 0.14 280))",
    },
    win11: {
      bar: "oklch(0.28 0.01 250 / 80%)",
      body: "oklch(0.24 0.01 250)",
      accent: "oklch(0.6 0.15 245)",
      wall: "linear-gradient(135deg, oklch(0.5 0.15 245), oklch(0.46 0.14 300))",
    },
    ubuntu: {
      bar: "oklch(0.31 0.06 330)",
      body: "oklch(0.24 0.04 330)",
      accent: "oklch(0.64 0.19 42)",
      wall: "linear-gradient(135deg, oklch(0.55 0.19 42), oklch(0.3 0.09 330))",
    },
    kali: {
      bar: "oklch(0.16 0.015 230)",
      body: "oklch(0.12 0.015 230)",
      accent: "oklch(0.68 0.15 220)",
      wall: "linear-gradient(135deg, oklch(0.4 0.16 220), oklch(0.2 0.1 250))",
    },
  };
  const c = chrome[id];

  return (
    <span
      aria-hidden
      className="block h-16 w-full overflow-hidden rounded-[6px] border border-black/20"
      style={{ background: c.wall }}
    >
      {/* A window, with its controls on the side that skin puts them. */}
      <span
        className="mx-auto mt-3 block w-[72%] overflow-hidden border border-black/25"
        style={{ borderRadius: square ? 0 : id === "win7" ? "4px 4px 0 0" : "5px" }}
      >
        <span
          className="flex h-3 items-center gap-0.5 px-1"
          style={{ background: c.bar, justifyContent: isWin ? "flex-end" : "flex-start" }}
        >
          {isWin ? (
            <>
              <span className="block h-px w-1.5 bg-white/70" />
              <span className="block h-1 w-1 border border-white/70" />
              <span className="block text-[5px] leading-none text-white/70">✕</span>
            </>
          ) : (
            <>
              <span className="block h-1.5 w-1.5 rounded-full bg-[var(--mac-close)]" />
              <span className="block h-1.5 w-1.5 rounded-full bg-[var(--mac-min)]" />
              <span className="block h-1.5 w-1.5 rounded-full bg-[var(--mac-max)]" />
            </>
          )}
        </span>
        <span className="block h-6 px-1 pt-1" style={{ background: c.body }}>
          <span className="block h-1 w-2/3 rounded-full" style={{ background: c.accent }} />
          <span className="mt-1 block h-1 w-1/2 rounded-full bg-white/20" />
        </span>
      </span>
      {/* The dock / taskbar. */}
      <span
        className={cn("mt-1 flex h-2.5 items-center gap-0.5 px-1", isWin ? "" : "justify-center")}
        style={{ background: c.bar }}
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="block h-1.5 w-1.5"
            style={{
              background: i === 0 ? c.accent : "oklch(1 0 0 / 35%)",
              borderRadius: square ? 0 : 2,
            }}
          />
        ))}
      </span>
    </span>
  );
}

export function SettingsApp() {
  const [pane, setPane] = useState<Pane>("appearance");
  const { skin, mode, resolved, flags, setSkin, setMode, toggleFlag, resetFlags } = useTheme();

  const card =
    "rounded-[var(--os-radius-ctl)] border border-border bg-card p-3 text-left transition-transform hover:-translate-y-px";

  return (
    <div className="flex h-full min-h-0 bg-background">
      {/* ---- Sidebar ---- */}
      <aside className="flex w-44 shrink-0 flex-col gap-0.5 border-r border-border/60 p-2">
        {PANES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPane(id)}
            aria-current={pane === id ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-[var(--os-radius-ctl)] px-2.5 py-2 text-left text-[13px] transition-colors",
              pane === id
                ? "text-[var(--os-accent-ink)]"
                : "text-foreground/75 hover:bg-foreground/10 hover:text-foreground",
            )}
            style={pane === id ? { background: "var(--os-accent)" } : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}

        <span aria-hidden className="my-2 h-px bg-border" />

        <p className="px-2.5 pb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Jump to
        </p>
        {NAV_PAGES.slice(0, 6).map((page) => (
          <Link
            key={page.to}
            to={page.to}
            className="rounded-[var(--os-radius-ctl)] px-2.5 py-1.5 text-[12.5px] text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            {page.label}
          </Link>
        ))}
      </aside>

      {/* ---- Panes ---- */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {pane === "appearance" ? (
          <section className="space-y-4">
            <header>
              <h2 className="text-[15px] font-bold text-foreground">Appearance</h2>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                The site is written in two registers — a dark cinematic one and a loud product one.
                This decides which way round they are lit.
              </p>
            </header>

            <div className="grid grid-cols-3 gap-2">
              {MODES.map(({ id, label, blurb, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  aria-pressed={mode === id}
                  className={cn(
                    card,
                    mode === id && "!border-[var(--os-accent)] ring-1 ring-[var(--os-accent)]",
                  )}
                >
                  <Icon className="mb-1.5 h-4 w-4 text-foreground" />
                  <span className="block text-[13px] font-semibold text-foreground">{label}</span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
                    {blurb}
                  </span>
                </button>
              ))}
            </div>

            <p className="font-mono text-[11px] text-muted-foreground">
              Currently painting: <span className="text-foreground">{resolved}</span>
              {mode === "auto" ? " (from your system)" : ""}
            </p>

            <div className="rounded-[var(--os-radius-ctl)] border border-border bg-card p-3">
              <h3 className="text-[13px] font-semibold text-foreground">Contrast</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Both modes are tuned rather than inverted. Body copy clears 12:1 against its ground
                in either one, and the secondary tier clears 5.5:1 — so nothing on this site drops
                below the AA threshold when you throw the switch.
              </p>
              <div className="mt-2 flex gap-1.5">
                {[
                  "bg-background text-foreground",
                  "bg-card text-card-foreground",
                  "bg-muted text-muted-foreground",
                  "bg-accent text-accent-foreground",
                ].map((klass) => (
                  <span
                    key={klass}
                    className={cn(
                      "grid h-9 flex-1 place-items-center rounded-[4px] border border-border text-[11px] font-semibold",
                      klass,
                    )}
                  >
                    Aa
                  </span>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {pane === "desktop" ? (
          <section className="space-y-4">
            <header>
              <h2 className="text-[15px] font-bold text-foreground">Desktop</h2>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Which operating system this portfolio is pretending to be. It changes the chrome —
                window corners, where the controls sit, the accent, the wallpaper — and nothing
                else. Every page and every link stays exactly where it was.
              </p>
            </header>

            <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
              {SKINS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    setSkin(entry.id);
                    toast(`${entry.label}.`, { description: entry.blurb });
                  }}
                  aria-pressed={skin === entry.id}
                  className={cn(
                    card,
                    "space-y-2",
                    skin === entry.id &&
                      "!border-[var(--os-accent)] ring-1 ring-[var(--os-accent)]",
                  )}
                >
                  <SkinPreview id={entry.id} />
                  <span className="block text-[13px] font-semibold text-foreground">
                    {entry.label}
                  </span>
                  <span className="block text-[11.5px] leading-snug text-muted-foreground">
                    {entry.blurb}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {pane === "fun" ? (
          <section className="space-y-4">
            <header>
              <h2 className="text-[15px] font-bold text-foreground">Play</h2>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Switches that make the site worse on purpose. All of them are off by default, all of
                them survive a reload, and all of them come back off from the button at the bottom.
              </p>
            </header>

            <div className="space-y-1.5">
              {FLAGS.map((flag) => {
                const on = Boolean(flags[flag.id]);
                return (
                  <button
                    key={flag.id}
                    type="button"
                    role="switch"
                    aria-checked={on}
                    onClick={() => toggleFlag(flag.id)}
                    className="flex w-full items-center gap-3 rounded-[var(--os-radius-ctl)] border border-border bg-card p-2.5 text-left transition-colors hover:border-foreground/30"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                        on ? "" : "bg-foreground/20",
                      )}
                      style={on ? { background: "var(--os-accent)" } : undefined}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                          on ? "translate-x-[1.125rem]" : "translate-x-0.5",
                        )}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-foreground">
                        {flag.label}
                      </span>
                      <span className="block text-[11.5px] leading-snug text-muted-foreground">
                        {flag.blurb}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                resetFlags();
                toast("Back to normal.", { description: "Every switch is off again." });
              }}
              className="flex items-center gap-2 rounded-[var(--os-radius-ctl)] border border-border px-3 py-2 text-[13px] text-foreground transition-colors hover:bg-foreground/10"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Turn everything off
            </button>
          </section>
        ) : null}
      </div>
    </div>
  );
}

/** The same panel as a full page, for phones and for deep links. */
export function SettingsPage() {
  return (
    <div className="mx-auto h-[70vh] max-w-5xl overflow-hidden rounded-xl border border-border">
      <SettingsApp />
    </div>
  );
}
