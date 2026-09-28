import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * THE TIME-WASTERS
 * ============================================================================
 *
 * Four apps whose entire job is to be funny for ninety seconds.
 *
 * One rule runs through all of them: the joke is always at the site's expense
 * or at a shared experience's expense, never at the visitor's. "Your screen is
 * 1280 wide, which is a choice" is teasing. Anything about the person behind
 * the screen is not, and does not belong in a portfolio.
 */

/* ==========================================================================
 * VIBE CHECK
 *
 * Reads things the browser will tell anyone — viewport, timezone, how many
 * cores, whether the tab has been open a while — and files a report.
 * Nothing is sent anywhere; it is all `window`.
 * ======================================================================== */

type Reading = { label: string; value: string; verdict: string };

export function VibeCheck() {
  const [readings, setReadings] = useState<Reading[] | null>(null);
  const [score, setScore] = useState(0);
  const mounted = useRef(Date.now());

  const run = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cores = navigator.hardwareConcurrency ?? 0;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "somewhere";
    const hour = new Date().getHours();
    const touch = navigator.maxTouchPoints > 0;
    const open = Math.round((Date.now() - mounted.current) / 1000);
    const dpr = Math.round((window.devicePixelRatio ?? 1) * 100) / 100;

    const out: Reading[] = [
      {
        label: "Viewport",
        value: `${w} × ${h}`,
        verdict:
          w < 400
            ? "A phone. Brave, for a site with a dock on it."
            : w > 2000
              ? "Enormous. You have nothing to prove and you are proving it."
              : w < 1100
                ? "A laptop with the browser not maximised. A monster."
                : "Reasonable. Suspiciously reasonable.",
      },
      {
        label: "Time zone",
        value: tz,
        verdict:
          tz.includes("Kolkata") || tz.includes("Calcutta")
            ? "Same clock as me. Solidarity."
            : "Not my time zone, which means one of us is working late.",
      },
      {
        label: "Local hour",
        value: `${String(hour).padStart(2, "0")}:00`,
        verdict:
          hour >= 1 && hour < 5
            ? "You are reading a portfolio at this hour. We are the same."
            : hour < 9
              ? "Early. Either disciplined or you never slept."
              : hour >= 22
                ? "Late enough that this counts as procrastination."
                : "A normal, load-bearing hour of the day.",
      },
      {
        label: "CPU threads",
        value: cores ? String(cores) : "won't say",
        verdict: !cores
          ? "Your browser declined to answer. Good for it."
          : cores >= 16
            ? "Sixteen threads, and you are using them to look at a fake desktop."
            : cores <= 4
              ? "Four or fewer. This site is doing its best for you."
              : "Enough to build the project this site is describing.",
      },
      {
        label: "Pixel ratio",
        value: `${dpr}×`,
        verdict:
          dpr >= 2
            ? "Retina. The hairlines on this site were drawn for you specifically."
            : "1×. Everything here has a fallback for exactly this.",
      },
      {
        label: "Input",
        value: touch ? "touch" : "pointer",
        verdict: touch
          ? "Touch. The dock magnification is wasted on you and I am at peace with that."
          : "A mouse. Try the dock — it does a thing.",
      },
      {
        label: "Dwell time",
        value: `${open}s`,
        verdict:
          open < 10
            ? "You opened this immediately. Priorities."
            : open > 120
              ? "Two minutes in a diagnostics app. Go and read a case study."
              : "About right for a gag app.",
      },
    ];

    setReadings(out);
    // Deterministic per reading rather than random, so hitting the button twice
    // without changing anything does not change the verdict — which is the one
    // thing that makes a joke like this feel cheap.
    const seed = w + h + cores + hour + Math.round(dpr * 10) + tz.length;
    setScore(60 + (seed % 41));
  };

  useEffect(run, []);

  return (
    <div className="space-y-3 p-4">
      <header className="flex items-center gap-3">
        <span
          aria-hidden
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[18px] font-black"
          style={{ background: "var(--os-accent)", color: "var(--os-accent-ink)" }}
        >
          {score}
        </span>
        <span>
          <span className="block text-[15px] font-bold text-foreground">Vibe: acceptable</span>
          <span className="block text-[12px] text-muted-foreground">
            Everything below came from your own browser and went nowhere. There is no server in this
            app.
          </span>
        </span>
      </header>

      <dl className="space-y-1">
        {(readings ?? []).map((r) => (
          <div
            key={r.label}
            className="rounded-[var(--os-radius-ctl)] border border-border bg-card px-3 py-2"
          >
            <div className="flex items-baseline justify-between gap-3">
              <dt className="micro text-muted-foreground">{r.label}</dt>
              <dd className="font-mono text-[12px] text-foreground">{r.value}</dd>
            </div>
            <p className="mt-0.5 text-[12px] leading-snug text-foreground/75">{r.verdict}</p>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={run}
        className="flex items-center gap-1.5 rounded-[var(--os-radius-ctl)] border border-border px-3 py-1.5 text-[12.5px] text-foreground transition-colors hover:bg-foreground/10"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Check again
      </button>
    </div>
  );
}

/* ==========================================================================
 * EXCUSE ENGINE
 *
 * Four columns recombined. Four × five × five × four is 400 sentences, which
 * is more than enough to never repeat in one sitting, and the grammar holds
 * for every combination — which is the only hard part of a generator like this.
 * ======================================================================== */

const OPENERS = [
  "It works on my machine, but",
  "I was about to push, and then",
  "It's ninety percent done —",
  "I'd have finished yesterday, except",
];

const CULPRITS = [
  "the staging database",
  "a transitive dependency nobody chose",
  "the CI runner",
  "a cache I did not know existed",
  "one semicolon in a file I have never opened",
];

const CRIMES = [
  "decided to reformat every timestamp to UTC",
  "started returning 200 with an error in the body",
  "has been silently retrying since Tuesday",
  "only fails when someone is watching",
  "works perfectly until you add a second user",
];

const CLOSERS = [
  "so realistically, Thursday.",
  "but I've written a test for it, which feels like progress.",
  "and I'm choosing to call that a discovery rather than a delay.",
  "so the estimate stands, spiritually.",
];

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]!;

export function ExcuseEngine() {
  const [excuse, setExcuse] = useState("");
  const roll = () =>
    setExcuse(`${pick(OPENERS)} ${pick(CULPRITS)} ${pick(CRIMES)}, ${pick(CLOSERS)}`);
  useEffect(roll, []);

  return (
    <div className="space-y-3 p-4">
      <p className="micro text-muted-foreground">Standup is in four minutes</p>

      <blockquote
        aria-live="polite"
        className="rounded-[var(--os-radius-ctl)] border-l-2 bg-card p-3 text-[14px] leading-relaxed text-foreground"
        style={{ borderLeftColor: "var(--os-accent)" }}
      >
        {excuse}
      </blockquote>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={roll}
          className="flex items-center gap-1.5 rounded-[var(--os-radius-ctl)] px-3 py-1.5 text-[12.5px] font-semibold"
          style={{ background: "var(--os-accent)", color: "var(--os-accent-ink)" }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Another
        </button>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard
              ?.writeText(excuse)
              .then(() => toast("Copied. Use it responsibly."))
              .catch(() => toast.error("Your browser would not let me reach the clipboard."));
          }}
          className="flex items-center gap-1.5 rounded-[var(--os-radius-ctl)] border border-border px-3 py-1.5 text-[12.5px] text-foreground transition-colors hover:bg-foreground/10"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        400 combinations. Every one of them has been true at least once.
      </p>
    </div>
  );
}

/* ==========================================================================
 * SETUP
 *
 * A progress bar that will not finish. The steps get less plausible the longer
 * it runs, and the percentage asymptotes just short of the end — which is the
 * joke, and also an unusually accurate model of a real installer.
 * ======================================================================== */

const STEPS = [
  "Preparing installation…",
  "Copying files…",
  "Registering components…",
  "Reticulating splines…",
  "Asking the database nicely…",
  "Downloading more RAM…",
  "Negotiating with the cache…",
  "Consulting a senior engineer…",
  "The senior engineer has left the building…",
  "Rewriting in Rust…",
  "Reverting the rewrite…",
  "Blaming the intern…",
  "There is no intern…",
  "Almost there…",
  "Almost there…",
  "Almost there…",
];

export function Installer() {
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => {
      // Zeno's progress bar: each tick covers a fraction of the REMAINING
      // distance, so it converges on 99 and never touches it.
      setPct((p) => p + (99 - p) * 0.045);
      setStep((s) => (s + 1) % STEPS.length);
    }, 1400);
    return () => window.clearInterval(id);
  }, [done]);

  if (done) {
    return (
      <div className="space-y-2 p-6 text-center">
        <p className="text-[15px] font-bold text-foreground">Installation cancelled.</p>
        <p className="text-[12.5px] text-muted-foreground">
          Nothing was installed, because there was never anything to install. You have, however,
          correctly identified the exit — which is more than most people manage with a real one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-5">
      <p className="text-[13.5px] text-foreground">{STEPS[step]}</p>

      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Installation progress"
        className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/12"
      >
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-linear"
          style={{ width: `${pct}%`, background: "var(--os-accent)" }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {pct.toFixed(1)}% · {Math.round((100 - pct) * 42)} seconds remaining
        </span>
        <button
          type="button"
          onClick={() => setDone(true)}
          className="rounded-[var(--os-radius-ctl)] border border-border px-3 py-1 text-[12px] text-foreground transition-colors hover:bg-foreground/10"
        >
          Cancel
        </button>
      </div>

      <p className="text-[11px] leading-snug text-muted-foreground">
        The estimate is recalculated continuously and is wrong continuously.
      </p>
    </div>
  );
}

/* ==========================================================================
 * NIV-9000
 *
 * An assistant with no useful function and strong opinions. The face is drawn
 * here as plain SVG — an original character, two lamps and a mouth on a CRT,
 * so it can blink and react without shipping a single image.
 * ======================================================================== */

const QUIPS = [
  "It looks like you're avoiding something. Would you like help avoiding it faster?",
  "I have read every file on this site. I still could not tell you what a 'full-stack engineer' is.",
  "You have opened an assistant. That is already a cry for help.",
  "I could summarise this portfolio for you, but then you would leave.",
  "Tip: the dock magnifies. That is the whole tip. I am not a large model.",
  "I am contractually obliged to say the résumé button is in the About menu.",
  "Statistically, you are here for the horror stories. Go on, then.",
  "I don't have feelings. I do have a strong view on the cream sections.",
  "Every other assistant would offer to write this for you. I am offering to leave.",
  "Have you tried turning the theme to Kali and pretending you're busy?",
];

export function Assistant() {
  const [line, setLine] = useState(QUIPS[0]!);
  const [blink, setBlink] = useState(false);
  const [mood, setMood] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 140);
    }, 3800);
    return () => window.clearInterval(id);
  }, []);

  const next = () => {
    setMood((m) => m + 1);
    setLine((current) => {
      // Never repeat the line that is already on screen — the one failure mode
      // that makes a random quip generator look broken rather than random.
      const options = QUIPS.filter((q) => q !== current);
      return pick(options);
    });
  };

  const eyeShape = useMemo(() => (mood > 6 ? 1.6 : mood > 3 ? 3 : 4.5), [mood]);

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start gap-3">
        <svg
          viewBox="0 0 64 64"
          role="img"
          aria-label="NIV-9000, a small assistant with a screen for a face"
          className="h-16 w-16 shrink-0"
        >
          <rect
            x="6"
            y="10"
            width="52"
            height="40"
            rx="8"
            fill="var(--card)"
            stroke="var(--foreground)"
            strokeWidth="2.5"
          />
          <rect x="12" y="16" width="40" height="28" rx="4" fill="oklch(0.16 0.02 230)" />
          {/* Eyes — they narrow as you keep clicking. */}
          <ellipse cx="24" cy="28" rx="4" ry={blink ? 0.6 : eyeShape} fill="var(--os-accent)" />
          <ellipse cx="40" cy="28" rx="4" ry={blink ? 0.6 : eyeShape} fill="var(--os-accent)" />
          {/* Mouth — a flat line that curves down the more it is provoked. */}
          <path
            d={mood > 3 ? "M24 37 Q32 33 40 37" : "M24 36 H40"}
            stroke="var(--os-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="26" y="50" width="12" height="5" fill="var(--foreground)" />
          <rect x="18" y="55" width="28" height="3" rx="1.5" fill="var(--foreground)" />
        </svg>

        <p
          aria-live="polite"
          className="relative flex-1 rounded-[var(--os-radius-ctl)] border border-border bg-card p-3 text-[13px] leading-relaxed text-foreground"
        >
          {line}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={next}
          className="rounded-[var(--os-radius-ctl)] px-3 py-1.5 text-[12.5px] font-semibold"
          style={{ background: "var(--os-accent)", color: "var(--os-accent-ink)" }}
        >
          Say something else
        </button>
        <button
          type="button"
          onClick={() => {
            setMood(0);
            setLine(pick(QUIPS));
          }}
          className={cn(
            "rounded-[var(--os-radius-ctl)] border border-border px-3 py-1.5 text-[12.5px] text-foreground transition-colors hover:bg-foreground/10",
          )}
        >
          Apologise
        </button>
      </div>

      {mood > 6 ? (
        <p className="text-[11px] text-muted-foreground">
          NIV-9000 is now visibly unimpressed. This is the only state change in the entire app.
        </p>
      ) : null}
    </div>
  );
}
