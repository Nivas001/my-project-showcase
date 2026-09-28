import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { site } from "@/lib/site";
import { useWindows, type AppId } from "@/components/os/WindowManager";
import { SKINS, useTheme, isSkin } from "@/lib/os/theme";

/**
 * ============================================================================
 * TERMINAL
 * ============================================================================
 *
 * A shell that actually drives the site. `open paint` opens Paint, `cd about`
 * navigates, `theme kali` reskins the desktop. It is not a prop with a list of
 * canned responses — every command does the thing it says.
 *
 * The parser is deliberately tiny: split on whitespace, look the verb up in a
 * table, hand it the rest. Anything cleverer would be a lot of code to support
 * quoting rules nobody is going to use.
 */

type Line = { kind: "in" | "out" | "err" | "note"; text: string };

const BANNER = ["portfolio-shell 2.1  ·  type `help`", ""];

const APPS: AppId[] = [
  "paint",
  "notes",
  "settings",
  "music",
  "tycoon",
  "calculator",
  "photos",
  "minesweeper",
  "vibe",
  "excuses",
  "installer",
  "assistant",
];

const ROUTES: Record<string, string> = {
  "~": "/",
  home: "/",
  work: "/projects",
  projects: "/projects",
  about: "/about",
  contact: "/contact",
  arcade: "/fun",
  fun: "/fun",
  horror: "/horror",
  stories: "/horror",
  wall: "/wall",
  genz: "/genz",
  apps: "/apps",
};

export function TerminalApp() {
  const [lines, setLines] = useState<Line[]>(BANNER.map((text) => ({ kind: "note", text })));
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { open } = useWindows();
  const { setSkin, setMode, skin } = useTheme();

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines]);

  const say = (text: string, kind: Line["kind"] = "out") => setLines((l) => [...l, { kind, text }]);
  const sayAll = (texts: string[], kind: Line["kind"] = "out") =>
    setLines((l) => [...l, ...texts.map((text) => ({ kind, text }))]);

  const run = (raw: string) => {
    const line = raw.trim();
    setLines((l) => [...l, { kind: "in", text: line }]);
    if (!line) return;

    setHistory((h) => [...h, line]);
    setCursor(-1);

    const [verb = "", ...rest] = line.split(/\s+/);
    const arg = rest.join(" ").toLowerCase();

    switch (verb.toLowerCase()) {
      case "help":
        sayAll([
          "open <app>     open an app window   (open paint)",
          "cd <page>      go to a page         (cd about)",
          "theme <skin>   reskin the desktop   (theme kali)",
          "mode <l|d|a>   light, dark or auto",
          "apps           list every app",
          "pages          list every page",
          "whoami         who built this",
          "sudo ...       no",
          "clear          wipe the scrollback",
        ]);
        break;

      case "open": {
        const id = arg.replace(/\s+/g, "") as AppId;
        if (!APPS.includes(id)) {
          say(`open: no app called "${arg}". Try \`apps\`.`, "err");
          break;
        }
        open(id);
        say(`opening ${id}…`);
        break;
      }

      case "apps":
        say(APPS.join("  "));
        break;

      case "cd":
      case "go": {
        const to = ROUTES[arg || "~"];
        if (!to) {
          say(`cd: no page called "${arg}". Try \`pages\`.`, "err");
          break;
        }
        say(`→ ${to}`);
        void navigate({ to });
        break;
      }

      case "pages":
        say(Object.keys(ROUTES).join("  "));
        break;

      case "theme": {
        if (!arg) {
          say(`current: ${skin}. Options: ${SKINS.map((s) => s.id).join(", ")}`);
          break;
        }
        if (!isSkin(arg)) {
          say(`theme: unknown skin "${arg}". Options: ${SKINS.map((s) => s.id).join(", ")}`, "err");
          break;
        }
        setSkin(arg);
        say(`skin → ${arg}`);
        break;
      }

      case "mode": {
        const map: Record<string, "light" | "dark" | "auto"> = {
          l: "light",
          light: "light",
          d: "dark",
          dark: "dark",
          a: "auto",
          auto: "auto",
        };
        const next = map[arg];
        if (!next) {
          say("mode: expected light, dark or auto.", "err");
          break;
        }
        setMode(next);
        say(`mode → ${next}`);
        break;
      }

      case "whoami":
        sayAll([
          `${site.fullName} — ${site.role}`,
          site.location,
          site.email,
          "",
          "Five products live in production. One published Tamil summarisation model.",
        ]);
        break;

      case "ls":
        say("projects/  about/  contact/  arcade/  horror/  wall/  genz/  apps/");
        break;

      case "pwd":
        say(typeof window === "undefined" ? "/" : window.location.pathname);
        break;

      case "date":
        say(new Date().toString());
        break;

      case "echo":
        say(rest.join(" "));
        break;

      case "sudo":
        say("You are not in the sudoers file. This incident has been reported.", "err");
        break;

      case "rm":
        if (arg.includes("-rf")) {
          sayAll(
            [
              "rm: refusing to remove '/' — and also this is a portfolio,",
              "so there is genuinely nothing here to delete.",
            ],
            "err",
          );
          break;
        }
        say("rm: permission denied.", "err");
        break;

      case "exit":
      case "quit":
        say("Use the close button. It is right there.");
        break;

      case "clear":
        setLines([]);
        break;

      default:
        say(`${verb}: command not found. Try \`help\`.`, "err");
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      run(value);
      setValue("");
      return;
    }
    // Shell history. The cursor counts backwards from the end so a new command
    // pushed onto the list does not shift the position under your finger.
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      if (next < 0) return;
      setCursor(next);
      setValue(history[history.length - 1 - next] ?? "");
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = cursor - 1;
      setCursor(next);
      setValue(next < 0 ? "" : (history[history.length - 1 - next] ?? ""));
      return;
    }
    // A terminal that closes on Escape is a terminal that eats your work the
    // first time you reach for it to dismiss an autocomplete.
    if (event.key === "Escape") {
      event.preventDefault();
      setValue("");
    }
  };

  const ink: Record<Line["kind"], string> = {
    in: "text-[oklch(0.78_0.14_145)]",
    out: "text-foreground/85",
    err: "text-[oklch(0.72_0.18_25)]",
    note: "text-muted-foreground",
  };

  return (
    /*
     * A plain div, not a button.
     *
     * The whole surface focuses the prompt when you click it, which is how a
     * terminal should behave — but a <button> may not contain interactive
     * content, and wrapping the <input> in one produced invalid markup that
     * browsers silently restructure, breaking both focus and the caret.
     *
     * The click handler is a convenience on top of a control that is already
     * reachable: the input is a real focusable field with its own label, so
     * keyboard and screen-reader users never depend on this handler. That is
     * what makes the missing button role correct rather than lazy.
     */
    <div
      onClick={() => input.current?.focus()}
      className="flex h-full w-full cursor-text flex-col bg-[oklch(0.12_0.012_230)] text-left font-mono text-[12.5px] leading-relaxed"
    >
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {lines.map((line, i) => (
          <p key={i} className={`whitespace-pre-wrap break-words ${ink[line.kind]}`}>
            {line.kind === "in" ? <span className="opacity-60">$ </span> : null}
            {line.text}
          </p>
        ))}

        <p className="flex items-center gap-1.5 text-[oklch(0.78_0.14_145)]">
          <span className="opacity-60">$</span>
          <input
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
            className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-[oklch(0.9_0.05_145)] caret-[oklch(0.78_0.14_145)] outline-none"
          />
        </p>
      </div>
    </div>
  );
}
