import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/* ==========================================================================
 * SectionLabel — the tiny letterspaced marker that opens every section.
 * `01 — SELECTED WORK ─────────`
 * ======================================================================== */

export function SectionLabel({
  index,
  children,
  rule = true,
  className,
}: {
  index?: string | undefined;
  children: ReactNode;
  rule?: boolean;
  className?: string | undefined;
}) {
  return (
    <div className={cn("flex items-center gap-3 text-muted-foreground", className)}>
      {index ? (
        <span className="font-mono text-[11px] tabular-nums text-accent">{index}</span>
      ) : null}
      <span className="font-mono text-[11px] uppercase tracking-[0.18em]">{children}</span>
      {rule ? <span aria-hidden className="h-px flex-1 bg-border" /> : null}
    </div>
  );
}

/* ==========================================================================
 * SplitLines — display type rising out of a mask, one line at a time.
 * Renders immediately on mount (hero) or when scrolled into view (`onView`).
 * ======================================================================== */

export function SplitLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 90,
  onView = false,
  as: Tag = "div",
}: {
  lines: readonly string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  /** Wait until scrolled into view instead of animating on mount. */
  onView?: boolean;
  as?: "div" | "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLElement>(null);
  const [play, setPlay] = useState(!onView);

  useEffect(() => {
    if (!onView) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setPlay(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPlay(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onView]);

  return (
    <Tag ref={ref as never} className={className}>
      {lines.map((line, i) => (
        <span key={`${line}-${i}`} className="line-mask">
          <span
            className={cn(play ? "line-rise" : "block", lineClassName)}
            style={
              play
                ? ({ "--line-delay": `${delay + i * stagger}ms` } as React.CSSProperties)
                : { transform: "translateY(105%)" }
            }
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/* ==========================================================================
 * HardButton — a quiet pill. Solid for the one action that matters on a
 * screen, hairline for everything else. The name is historical.
 * ======================================================================== */

type ButtonVariant = "primary" | "secondary" | "ghost" | "invert";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-foreground text-background border-foreground hover:opacity-85",
  secondary:
    "bg-transparent text-foreground border-border hover:border-foreground/40 hover:bg-secondary/60",
  invert: "bg-foreground text-background border-foreground hover:opacity-85",
  ghost:
    "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/60",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-xs gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2.5",
};

function buttonClass(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    "group inline-flex items-center justify-center whitespace-nowrap rounded-full border font-medium tracking-tight",
    "transition-[opacity,background-color,border-color,color,transform] duration-300 active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className,
  );
}

type HardButtonBase = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function HardButton({
  children,
  variant = "primary",
  size = "md",
  className,
  ...rest
}: HardButtonBase & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function HardLink({
  children,
  variant = "primary",
  size = "md",
  className,
  ...rest
}: HardButtonBase & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </a>
  );
}

/**
 * Same styling, routed through TanStack Router.
 *
 * `params` is widened deliberately: TanStack types it as a reducer keyed to
 * whichever route `to` resolves to, which a generic wrapper cannot carry
 * through. `to` stays fully type-checked.
 */
type HardRouteLinkProps = HardButtonBase &
  Omit<React.ComponentProps<typeof Link>, "className" | "children" | "params"> & {
    params?: Record<string, string>;
  };

export function HardRouteLink({
  children,
  variant = "primary",
  size = "md",
  className,
  ...rest
}: HardRouteLinkProps) {
  const RouterLink = Link as unknown as React.ComponentType<Record<string, unknown>>;
  return (
    <RouterLink className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </RouterLink>
  );
}

/* ==========================================================================
 * Sticker — a small outlined pill. It used to sit rotated like a sticker;
 * `rotate` is still accepted so callers compile, and ignored.
 * ======================================================================== */

export function Sticker({
  children,
  tone,
  className,
}: {
  children: ReactNode;
  /** A `hog-*` colour token name, e.g. "hog-blue". */
  tone?: string;
  className?: string;
  rotate?: number;
}) {
  return (
    <span
      className={cn("sticker", className)}
      style={tone ? { color: `var(--${tone})` } : undefined}
    >
      {children}
    </span>
  );
}

/* ==========================================================================
 * Marquee — infinite horizontal ticker. Duplicates its children so the
 * -50% translate loops seamlessly.
 * ======================================================================== */

export function Marquee({
  items,
  duration = 38,
  reverse = false,
  separator = "·",
  className,
  itemClassName,
}: {
  items: readonly string[];
  duration?: number;
  reverse?: boolean;
  separator?: string;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className={cn("marquee-track", reverse && "marquee-reverse")}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {items.map((item, i) => (
              <span key={`${item}-${i}`} className="flex shrink-0 items-center">
                <span className={cn("micro whitespace-nowrap", itemClassName)}>{item}</span>
                <span aria-hidden className="mx-5 opacity-40">
                  {separator}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
 * BrowserFrame — faux browser chrome around a screenshot, so a flat image
 * reads as a real running product.
 * ======================================================================== */

export function BrowserFrame({
  url,
  children,
  className,
}: {
  url?: string;
  children: ReactNode;
  className?: string;
  /** Retained for callers; the frame no longer paints colour. */
  tone?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      {url ? (
        <div className="flex items-center justify-center border-b border-border px-3 py-2">
          <span className="min-w-0 truncate font-mono text-[10.5px] text-muted-foreground">
            {url}
          </span>
        </div>
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}

/* ==========================================================================
 * CopyCommand — the `npx …` strip. PostHog puts one on every landing page.
 * ======================================================================== */

export function CopyCommand({ command, className }: { command: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      /* Clipboard blocked (insecure context or denied permission) — the text
         is selectable on screen, so there is nothing useful to recover. */
    }
  };

  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-3 rounded-md border-2 border-border bg-card px-3 py-2 hard-shadow",
        className,
      )}
    >
      <span aria-hidden className="font-mono text-xs text-accent">
        $
      </span>
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground sm:text-sm">
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy command"}
        className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-hog-green" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

/* ==========================================================================
 * Squiggle — hand-drawn marks. PostHog's pages are full of them and they do
 * more to sell the personality than any colour choice.
 * ======================================================================== */

export function Squiggle(_: { className?: string; tone?: string }) {
  return null;
}

/** A curving arrow for pointing at things, like a note scribbled in a margin. */
export function DoodleArrow({
  className,
  tone = "hog-red",
  flip = false,
}: {
  className?: string;
  tone?: string;
  flip?: boolean;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 90 70"
      fill="none"
      className={cn("h-16 w-20", className)}
      style={{ color: `var(--${tone})`, transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path
        d="M6 4c16 14 22 32 18 50-1 5-3 9-6 11"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M8 51c3 6 7 11 10 14M31 57c-6 3-11 6-13 8"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Handwritten margin note. Rotates slightly so it never looks typeset. */
export function Annotation({
  children,
  className,
  tone = "hog-red",
  rotate = -4,
}: {
  children: ReactNode;
  className?: string;
  tone?: string;
  rotate?: number;
}) {
  return (
    <span
      className={cn("hand inline-block text-xl leading-tight sm:text-2xl", className)}
      style={{ color: `var(--${tone})`, transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

/* ==========================================================================
 * StatusDot — the pinging "available" indicator.
 * ======================================================================== */

export function StatusDot({ tone = "hog-green" }: { tone?: string }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span
        className="status-ping absolute inline-flex h-full w-full rounded-full"
        style={{ background: `var(--${tone})` }}
      />
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ background: `var(--${tone})` }}
      />
    </span>
  );
}

/* ==========================================================================
 * LocalClock — the visitor sees Srinivas's local time. A small thing that
 * makes the page feel like it belongs to a person in a place.
 * ======================================================================== */

export function LocalClock({ timeZone, className }: { timeZone: string; className?: string }) {
  // Empty until mounted: the server has no notion of the visitor's clock, and
  // rendering a time on both sides guarantees a hydration mismatch.
  const [time, setTime] = useState("");

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());

    setTime(format());
    const id = window.setInterval(() => setTime(format()), 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  if (!time) return <span className={className} />;
  return (
    <span className={className}>
      {time} <span className="opacity-60">IST</span>
    </span>
  );
}

/* ==========================================================================
 * PageHero — the quiet band that opens every interior page: a label, one
 * headline, one line of context. Nothing behind it.
 * ======================================================================== */

export function PageHero({
  label,
  index,
  lines,
  lede,
  children,
  className,
}: {
  label: string;
  index?: string | undefined;
  lines: readonly string[];
  lede?: ReactNode;
  /** Actions, filters or meta rendered under the lede. */
  children?: ReactNode;
  className?: string | undefined;
}) {
  return (
    <section data-act="noir" className={cn("act-noir relative", className)}>
      <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-32 sm:px-8 sm:pb-20 sm:pt-44">
        <SectionLabel index={index} rule={false} className="soft-in">
          {label}
        </SectionLabel>

        <SplitLines
          as="h1"
          lines={lines}
          delay={80}
          className="display-lg mt-6 max-w-4xl text-foreground"
        />

        {lede ? (
          <div
            className="soft-in mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{ "--line-delay": "280ms" } as React.CSSProperties}
          >
            {lede}
          </div>
        ) : null}

        {children ? (
          <div className="soft-in mt-9" style={{ "--line-delay": "380ms" } as React.CSSProperties}>
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { PortraitMatrix, type MatrixMode } from "./PortraitMatrix";
export { ScrambleText } from "./ScrambleText";
export {
  Marked,
  Highlight,
  StarMark,
  CheckMark,
  ScribbleArrow,
  HandNote,
  StickyNote,
  type MarkKind,
  type ArrowKind,
} from "./marks";
export { CharReveal, TiltCard, useSpecular } from "./motion";
