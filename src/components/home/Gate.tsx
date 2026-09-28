import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { shortTitle, site, toAbsoluteUrl } from "@/lib/site";
import { PortraitMatrix, ScrambleText, StatusDot, type MatrixMode } from "@/components/kit";
import { useMagnetic } from "@/hooks/use-magnetic";
import { EASE, RiseWords } from "./fx";

const MODES: { id: MatrixMode; label: string }[] = [
  { id: "dots", label: "Dots" },
  { id: "ascii", label: "ASCII" },
  { id: "photo", label: "Photo" },
];

/**
 * The hero. One sentence, one portrait, one way in.
 *
 * It used to carry a desktop of files, a dock, a ticker, three hand-drawn
 * notes, a proof line and a live status chip — every one of them good, and
 * together too many things asking to be looked at first. Now the headline
 * says who this is, the portrait is the thing to play with, and everything
 * else waits further down the page.
 */
export function Gate({ projects = [] }: { projects?: Project[] }) {
  const [mode, setMode] = useState<MatrixMode>("dots");
  const reduced = useReducedMotion();
  const primary = useMagnetic<HTMLAnchorElement>({ strength: 0.25, radius: 60 });
  const secondary = useMagnetic<HTMLAnchorElement>({ strength: 0.25, radius: 60 });

  // On the way out the copy lifts and fades a little faster than the portrait,
  // so the hero recedes rather than simply scrolling off.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -80]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], reduced ? [1, 1] : [1, 0]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 0.92]);
  const portraitOpacity = useTransform(scrollYProgress, [0.1, 0.8], reduced ? [1, 1] : [1, 0]);

  const building = projects
    .filter((p) => toAbsoluteUrl(p.live_url) && p.category !== "Research")
    .map((p) => shortTitle(p.title));
  const phrases = building.length > 0 ? building : ["Ani Bakes", "AARRKKAA", "Velocity"];

  const enter = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16, filter: "blur(6px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 1.1, ease: EASE, delay },
        };

  return (
    <section
      ref={heroRef}
      data-act="noir"
      data-rail="Top"
      className="act-noir relative flex min-h-svh flex-col overflow-hidden"
    >
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-5 pb-10 pt-28 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pb-16 lg:pt-24">
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="min-w-0">
          <motion.p
            {...enter(0.05)}
            className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            <StatusDot />
            Available for work
            <span className="text-border">/</span>
            {site.locationShort}
          </motion.p>

          <RiseWords
            as="h1"
            onView={false}
            stacked
            delay={0.15}
            stagger={0.06}
            text={site.fullName}
            muted="Full-stack engineer."
            className="mt-8 font-display text-[clamp(2.75rem,6.2vw,5.5rem)] font-semibold leading-[1] tracking-[-0.045em] text-foreground"
          />

          <motion.p
            {...enter(0.55)}
            className="mt-8 max-w-[34ch] text-[17px] leading-relaxed text-muted-foreground sm:text-lg"
          >
            I take products from an empty repo to a live domain, on my own — web, mobile, and the
            research behind them.
          </motion.p>

          <motion.div
            {...enter(0.7)}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <a
              ref={primary}
              href="#work"
              className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-foreground px-6 text-[15px] font-medium text-background transition-opacity hover:opacity-85"
            >
              See the work
              <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
            <a
              ref={secondary}
              href={site.resumeUrl}
              download
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border px-6 text-[15px] font-medium text-foreground transition-colors hover:border-foreground/40"
            >
              Résumé
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </motion.div>
        </motion.div>

        {/* The portrait — the one thing on this screen made to be played with. */}
        <motion.div
          style={{ scale: portraitScale, opacity: portraitOpacity }}
          className="mx-auto w-full max-w-sm min-w-0 lg:max-w-none"
        >
          <motion.div {...enter(0.45)}>
            <PortraitMatrix
              src="/portrait.png"
              mode={mode}
              alt="Illustrated portrait of Srinivas M"
              className="h-[clamp(16rem,40vh,22rem)] w-full lg:h-[clamp(20rem,56vh,32rem)]"
            />

            <div className="mt-5 flex items-center justify-between gap-4">
              <div
                role="group"
                aria-label="Portrait render mode"
                className="inline-flex items-center rounded-full border border-border p-0.5"
              >
                {MODES.map((option) => {
                  const active = mode === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setMode(option.id)}
                      aria-pressed={active}
                      className={`rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors duration-300 ${
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
              <p className="hidden font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground sm:block">
                Move across me
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floor: what is live right now, and a nudge to keep going. */}
      <motion.div
        {...enter(1.1)}
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 pb-8 sm:px-8"
      >
        <p className="flex min-w-0 items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span className="uppercase tracking-[0.18em]">Now shipping</span>
          <ScrambleText phrases={phrases} className="truncate text-foreground" />
        </p>
        <span className="hidden items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:flex">
          Scroll
          <span aria-hidden className="relative block h-8 w-px overflow-hidden bg-border">
            <span className="scroll-cue absolute inset-x-0 top-0 block h-1/2 bg-foreground" />
          </span>
        </span>
      </motion.div>
    </section>
  );
}
