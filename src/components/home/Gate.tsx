import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight, MousePointer2 } from "lucide-react";
import type { Project } from "@/lib/projects";
import { shortTitle, site, tickerItems, toAbsoluteUrl } from "@/lib/site";
import {
  Annotation,
  DoodleArrow,
  Marquee,
  PortraitMatrix,
  ScrambleText,
  StatusDot,
  type MatrixMode,
} from "@/components/kit";
import { useMagnetic } from "@/hooks/use-magnetic";
import { Desktop } from "@/components/os/Desktop";
import { HomeScreen } from "@/components/os/MobileShell";

const MODES: { id: MatrixMode; label: string }[] = [
  { id: "dots", label: "Dots" },
  { id: "ascii", label: "ASCII" },
  { id: "photo", label: "Photo" },
];

/**
 * Act I opens here: a full-viewport black field with the name set enormous on
 * the left and an interactive portrait on the right.
 *
 * Nothing gates the scroll — the "Enter" button is an anchor into Act II, so
 * the drama costs a visitor nothing if they just want to keep scrolling.
 */
export function Gate({ projects = [] }: { projects?: Project[] }) {
  const [mode, setMode] = useState<MatrixMode>("dots");
  const magnet = useMagnetic<HTMLAnchorElement>({ strength: 0.22, radius: 70 });
  const reduced = useReducedMotion();

  // Scrolling out of the hero drifts the name and the portrait at different
  // rates, so Act I recedes rather than simply scrolling off. Under reduced
  // motion the ranges flatten to no-ops — hooks cannot be called conditionally.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const nameY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -40]);
  const nameOpacity = useTransform(scrollYProgress, [0, 0.8], reduced ? [1, 1] : [1, 0]);
  const portraitY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -104]);
  const portraitOpacity = useTransform(scrollYProgress, [0, 0.65], reduced ? [1, 1] : [1, 0]);

  // Whatever is actually live. The stored titles carry a descriptor, and the
  // cycling line reads better as just the product name.
  const building = projects
    .filter((p) => toAbsoluteUrl(p.live_url) && p.category !== "Research")
    .map((p) => shortTitle(p.title));
  const phrases = building.length > 0 ? building : ["Ani Bakes", "AARRKKAA", "Velocity"];

  return (
    <section
      ref={heroRef}
      data-act="noir"
      className="act-noir grain relative flex min-h-svh flex-col justify-between overflow-hidden"
    >
      {/* Wallpaper: a fine grid over a slow two-tone aurora. */}
      <div aria-hidden className="hairline-grid pointer-events-none absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="wallpaper-drift pointer-events-none absolute -left-[15%] bottom-[4%] h-[42rem] w-[42rem] rounded-full blur-[130px]"
        style={{
          background: "radial-gradient(circle, var(--hog-red) 0%, transparent 68%)",
          opacity: 0.18,
        }}
      />
      <div
        aria-hidden
        className="wallpaper-drift pointer-events-none absolute -right-[10%] top-[6%] h-[34rem] w-[34rem] rounded-full blur-[130px]"
        style={{
          background: "radial-gradient(circle, var(--hog-blue) 0%, transparent 70%)",
          opacity: 0.14,
          animationDelay: "-13s",
        }}
      />

      {/* Files on the wallpaper, and the windows they open. Desktop only. */}
      <Desktop projects={projects} />

      {/* Availability, phones only: the macOS menu bar carries this on desktop
          and the iOS status bar already shows the clock. */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-5 pt-16 sm:px-8 sm:pt-20 lg:hidden">
        <p
          className="micro fade-rise whitespace-nowrap text-muted-foreground"
          style={{ "--line-delay": "500ms" } as React.CSSProperties}
        >
          Portfolio <span className="opacity-40">/</span> 2026
        </p>
        <span
          className="micro fade-rise flex items-center gap-2 whitespace-nowrap text-foreground"
          style={{ "--line-delay": "560ms" } as React.CSSProperties}
        >
          <StatusDot />
          Available
        </span>
      </div>

      <div className="relative z-10 grid flex-1 items-end gap-3 px-5 pb-4 pt-3 sm:gap-8 sm:px-8 sm:pb-10 sm:pt-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-12 lg:pt-24">
        {/* The name. Bottom-aligned, tight, stacked — the whole point of Act I. */}
        <motion.div style={{ y: nameY, opacity: nameOpacity }} className="order-1 min-w-0">
          <h1 className="display-lg text-foreground xl:text-[6.5rem]">
            {site.displayLines.map((line, i) => (
              <span key={line} className="line-mask">
                <span
                  className="line-rise block"
                  style={{ "--line-delay": `${120 + i * 110}ms` } as React.CSSProperties}
                >
                  {line}
                  {i === site.displayLines.length - 1 ? (
                    <span className="text-hog-red">.</span>
                  ) : null}
                </span>
              </span>
            ))}
          </h1>

          <div
            className="fade-rise mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-2 sm:mt-6"
            style={{ "--line-delay": "620ms" } as React.CSSProperties}
          >
            <p className="micro text-muted-foreground">Est. {site.locationShort}</p>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              {site.tagline}
            </p>
          </div>

          {/* Live status line — the work, cycling. */}
          <div
            className="fade-rise mt-4 inline-flex items-center gap-3 rounded-sm border border-border/70 bg-card/40 px-3.5 py-2 sm:mt-7"
            style={{ "--line-delay": "660ms" } as React.CSSProperties}
          >
            <StatusDot tone="hog-red" />
            <span className="micro text-muted-foreground">Now shipping</span>
            <ScrambleText
              phrases={phrases}
              className="font-mono text-xs font-bold text-foreground sm:text-sm"
            />
          </div>

          {/* The flat y-n10 CTA, plus two quiet secondaries. */}
          <div
            className="fade-rise mt-5 flex flex-col items-stretch gap-2.5 sm:mt-8 sm:flex-row sm:items-center sm:gap-3"
            style={{ "--line-delay": "700ms" } as React.CSSProperties}
          >
            <a
              ref={magnet}
              href="#showcase"
              className="glare-swipe group flex items-center justify-between gap-10 rounded-sm bg-foreground px-6 py-4 text-background transition-colors hover:bg-hog-red-deep hover:text-white sm:min-w-[18rem]"
            >
              <span className="text-sm font-semibold tracking-tight">Enter the showcase</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1.5" />
            </a>
            <div className="hidden gap-3 sm:flex">
              <Link
                to="/projects"
                className="flex-1 rounded-sm border border-border px-5 py-3 text-center text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                All work
              </Link>
              <a
                href={site.resumeUrl}
                download
                className="group flex flex-1 items-center justify-center gap-2 rounded-sm border border-border px-5 py-3 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                Résumé
                <ArrowDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Interactive portrait. */}
        <motion.div style={{ y: portraitY, opacity: portraitOpacity }} className="order-2 min-w-0">
          <div className="fade-rise" style={{ "--line-delay": "760ms" } as React.CSSProperties}>
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              {/* Corner ticks — a viewfinder around the portrait. */}
              {[
                "left-0 top-0 border-l border-t",
                "right-0 top-0 border-r border-t",
                "left-0 bottom-0 border-l border-b",
                "right-0 bottom-0 border-r border-b",
              ].map((corner) => (
                <span
                  key={corner}
                  aria-hidden
                  className={`pointer-events-none absolute h-5 w-5 border-border ${corner}`}
                />
              ))}

              <div className="pointer-events-none absolute -left-2 -top-9 z-10 hidden items-end gap-1 lg:flex">
                <Annotation tone="hog-blue" rotate={-7} className="text-lg">
                  that&apos;s me, in dots
                </Annotation>
                <DoodleArrow tone="hog-blue" className="h-9 w-10 -scale-x-100" />
              </div>

              <PortraitMatrix
                src="/portrait.png"
                mode={mode}
                alt="Illustrated portrait of Srinivas M"
                className="h-[clamp(12.5rem,30vh,16rem)] w-full sm:h-[clamp(14rem,34vh,21rem)] lg:h-[clamp(18rem,46vh,29rem)]"
              />
            </div>

            <div className="mx-auto mt-3 flex w-full max-w-md flex-wrap items-center justify-between gap-3 sm:mt-4 lg:max-w-none">
              <div
                className="flex items-center gap-1"
                role="group"
                aria-label="Portrait render mode"
              >
                {MODES.map((option) => {
                  const active = mode === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setMode(option.id)}
                      aria-pressed={active}
                      className={`micro rounded-sm px-2.5 py-1.5 transition-colors ${
                        active
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <p className="micro hidden items-center gap-2 text-muted-foreground sm:flex">
                <MousePointer2 className="h-3 w-3" />
                Move across me
              </p>
            </div>

            <div className="mx-auto mt-7 w-full max-w-md lg:hidden">
              <HomeScreen />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-[8.5rem] left-[37%] z-10 hidden lg:block">
        <span className="flex items-end gap-1">
          <Annotation tone="hog-red" rotate={-4} className="pb-1 text-lg">
            the dock is real — try it
          </Annotation>
          <DoodleArrow tone="hog-red" className="h-10 w-11 -scale-y-100" />
        </span>
      </div>

      {/* Floor ticker, with clearance for the dock that floats over it. */}
      <div className="relative z-10 border-t border-border/70 py-2 pb-28 sm:py-3.5 sm:pb-32 lg:pb-24">
        <Marquee
          items={tickerItems}
          duration={46}
          className="text-muted-foreground [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
        />
      </div>
    </section>
  );
}
