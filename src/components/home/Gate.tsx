import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight, MousePointer2 } from "lucide-react";
import type { Project } from "@/lib/projects";
import { shortTitle, site, tickerItems, toAbsoluteUrl } from "@/lib/site";
import {
  HandNote,
  Highlight,
  Marked,
  Marquee,
  PortraitMatrix,
  ScrambleText,
  ScribbleArrow,
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
 * Two jobs, in order. First, say who this is — plainly enough that someone who
 * reads three lines and leaves still knows. Second, be worth staying for: the
 * portrait renders three ways, the pitch answers whichever question the visitor
 * actually arrived with, and the desktop behind it is real.
 *
 * Nothing gates the scroll — "Enter the showcase" is an anchor into Act II, so
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
  const liveCount = building.length > 0 ? building.length : 5;

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
      <div
        aria-hidden
        className="wallpaper-drift pointer-events-none absolute left-[38%] top-[-8%] h-[26rem] w-[26rem] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle, var(--signature) 0%, transparent 70%)",
          opacity: 0.1,
          animationDelay: "-7s",
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

      {/* The desktop files occupy a ~13.5rem lane down the right edge from
          top-24. Without the reserved padding the portrait renders underneath
          them — dark dots behind nine icons, which is how the one element on
          this page people actually play with became invisible. */}
      <div className="relative z-10 grid flex-1 items-end gap-3 px-5 pb-4 pt-3 sm:gap-8 sm:px-8 sm:pb-10 sm:pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pr-[14.5rem] lg:pt-20 xl:gap-14 xl:pr-[15.5rem]">
        {/* The name. Bottom-aligned, tight, stacked — the whole point of Act I. */}
        <motion.div style={{ y: nameY, opacity: nameOpacity }} className="order-1 min-w-0">
          <p
            className="micro fade-rise mb-3 hidden text-muted-foreground lg:block"
            style={{ "--line-delay": "80ms" } as React.CSSProperties}
          >
            Portfolio <span className="opacity-40">/</span> {site.locationShort}
          </p>

          {/* Also capped against viewport height: at a fixed 6.8rem the three
              stacked lines alone are 330px, which on a laptop-height window
              pushes the call to action under the dock. */}
          <h1 className="hero-lg text-foreground xl:text-[min(6.8rem,13.5vh)]">
            <span className="line-mask">
              <span
                className="line-rise block"
                style={{ "--line-delay": "120ms" } as React.CSSProperties}
              >
                <span className="signature-name">Srinivas</span> M
              </span>
            </span>
            {/* No line-mask on this line. The mask clips its overflow, and the
                hand-drawn circle deliberately overshoots the text box — inside
                a mask only the bottom arc survives. */}
            <span
              className="fade-rise block"
              style={{ "--line-delay": "300ms" } as React.CSSProperties}
            >
              <Marked kind="circle" tone="hog-red" delay={1250} duration={900} immediate>
                Full-Stack
              </Marked>
            </span>
            <span className="line-mask">
              <span
                className="line-rise block"
                style={{ "--line-delay": "340ms" } as React.CSSProperties}
              >
                Engineer<span className="text-hog-red">.</span>
              </span>
            </span>
          </h1>

          {/* ---- One sentence, then get out of the way ----

              This column used to carry the sentence, a four-way "You need…"
              tab set, a paragraph answering whichever tab was open, a proof
              line and a stack line — roughly sixty words of body copy stacked
              under a display headline, which is the wrong shape for a hero:
              the eye reads a name that size and wants one claim, not a menu.

              Everything that block said is said properly in Act II, by the
              four capability cards in Opener, with the same four subjects and
              more evidence behind each one. This is now name, claim, proof of
              life, and a way in. */}
          <div
            className="fade-rise mt-4 max-w-lg sm:mt-6"
            style={{ "--line-delay": "620ms" } as React.CSSProperties}
          >
            <p className="text-[15px] leading-relaxed text-foreground/90 sm:text-lg">
              I take products from an empty repo to a live domain{" "}
              <Highlight tone="hog-yellow" delay={900}>
                <span className="font-semibold text-foreground">on my own</span>
              </Highlight>{" "}
              — web, mobile, and the research behind them.
            </p>
          </div>

          {/* Three checkable facts on one line. Replaces five lines of prose
              with the part a hiring manager was scanning for anyway. */}
          <div
            className="fade-rise mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] sm:mt-6"
            style={{ "--line-delay": "660ms" } as React.CSSProperties}
          >
            <span className="text-muted-foreground">
              <span className="font-bold text-foreground">{liveCount}</span> live in production
            </span>
            <span className="text-muted-foreground">
              <span className="font-bold text-foreground">100%</span> built solo
            </span>
            <span className="text-muted-foreground">{site.locationShort}</span>
          </div>

          {/* Live status line — the work, cycling. */}
          <div
            className="fade-rise mt-4 inline-flex items-center gap-3 rounded-sm border border-border/70 bg-card/40 px-3.5 py-2 sm:mt-6"
            style={{ "--line-delay": "700ms" } as React.CSSProperties}
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
            className="fade-rise relative mt-5 flex flex-col items-stretch gap-2.5 sm:mt-7 sm:flex-row sm:items-center sm:gap-3"
            style={{ "--line-delay": "740ms" } as React.CSSProperties}
          >
            <a
              ref={magnet}
              href="#showcase"
              className="glare-swipe group flex items-center justify-between gap-10 rounded-sm bg-foreground px-6 py-4 text-background transition-colors hover:bg-hog-red-deep hover:text-white sm:min-w-[18rem]"
            >
              <span className="text-sm font-semibold tracking-tight">Enter the showcase</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1.5" />
            </a>
            {/* One secondary, not two. The dock, the menu bar and the
                Launchpad all reach /projects already. */}
            <a
              href={site.resumeUrl}
              download
              className="group hidden items-center justify-center gap-2 rounded-sm border border-border px-5 py-3 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground sm:flex"
            >
              Résumé
              <ArrowDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
            </a>

            <span className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 translate-x-full items-center gap-1 xl:flex">
              <ScribbleArrow kind="swoop" tone="hog-red" flipX className="h-8 w-16" delay={1600} />
              <HandNote tone="hog-red" rotate={-6} size="sm">
                start here
              </HandNote>
            </span>
          </div>
        </motion.div>

        {/* Interactive portrait. */}
        <motion.div style={{ y: portraitY, opacity: portraitOpacity }} className="order-2 min-w-0">
          <div className="fade-rise" style={{ "--line-delay": "760ms" } as React.CSSProperties}>
            {/* Render-mode toggle, above the portrait rather than below it.

                It used to sit underneath, and on a laptop-height viewport the
                hero runs past the fold — which put the only three controls on
                this screen behind the floating dock. Above the frame they are
                reachable at every height. */}
            <div className="mx-auto mb-2 flex w-full max-w-md items-center justify-between gap-3 lg:max-w-none">
              <div className="flex items-center gap-1" role="group" aria-label="Portrait render mode">
                {MODES.map((option) => {
                  const active_ = mode === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setMode(option.id)}
                      aria-pressed={active_}
                      className={`micro rounded-sm px-2.5 py-1.5 transition-colors ${
                        active_
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

              {/* The note moved to the foot of the frame: the render-mode
                  toggle now occupies the space above it. */}
              <div className="pointer-events-none absolute -bottom-10 right-0 z-10 hidden items-start gap-1 lg:flex">
                <ScribbleArrow
                  kind="curve"
                  tone="hog-blue"
                  className="h-9 w-10 -scale-y-100"
                  delay={1400}
                />
                <HandNote tone="hog-blue" rotate={-5} size="sm" className="mt-3">
                  that&apos;s me, in dots
                </HandNote>
              </div>

              <PortraitMatrix
                src="/portrait.png"
                mode={mode}
                alt="Illustrated portrait of Srinivas M"
                /* Sized to leave room for the render-mode buttons and the
                   ticker above the floating dock. At 46vh the controls landed
                   behind it and the three modes were unreachable. */
                className="h-[clamp(12.5rem,28vh,16rem)] w-full sm:h-[clamp(14rem,32vh,20rem)] lg:h-[clamp(16rem,38vh,25rem)]"
              />
            </div>

            <div className="mx-auto mt-3 flex w-full max-w-md flex-wrap items-center justify-between gap-3 sm:mt-4 lg:max-w-none">

            </div>

            <div className="mx-auto mt-7 w-full max-w-md lg:hidden">
              <HomeScreen />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-[8.5rem] left-1/2 z-10 hidden -translate-x-1/2 lg:block">
        <span className="flex items-end gap-1">
          <HandNote tone="hog-red" rotate={-4} size="sm" className="pb-1">
            the dock is real — try it
          </HandNote>
          <ScribbleArrow kind="down" tone="hog-red" className="h-10 w-9" delay={1800} />
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
