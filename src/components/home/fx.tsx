import { Fragment, useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The homepage's motion vocabulary. Four moves, used sparingly:
 *
 *   FadeIn        content settles into place once, as it arrives
 *   RiseWords     a headline lifts out of its baseline, word by word
 *   LitParagraph  a paragraph brightens word by word as you read down it
 *   Parallax      an image drifts a little slower than the page
 *
 * All of them collapse to static markup under prefers-reduced-motion.
 */

export const EASE = [0.16, 1, 0.3, 1] as const;

export function FadeIn({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "p" | "span";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/**
 * Splits a line into words and lifts each out of a mask. `muted` words are the
 * quieter half of a two-tone headline.
 */
export function RiseWords({
  text,
  muted,
  className,
  delay = 0,
  stagger = 0.045,
  onView = true,
  stacked = false,
  as = "h2",
}: {
  text: string;
  muted?: string;
  /** Put the muted half on its own line. */
  stacked?: boolean;
  className?: string;
  delay?: number;
  stagger?: number;
  onView?: boolean;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const reduced = useReducedMotion();
  const Tag = as;
  const loud = text.split(" ");
  const quiet = muted ? muted.split(" ") : [];
  const words = [
    ...loud.map((w) => ({ w, quiet: false })),
    ...quiet.map((w) => ({ w, quiet: true })),
  ];

  if (reduced) {
    return (
      <Tag className={className}>
        {text}
        {muted && stacked ? <br /> : null}
        {muted ? <span className="text-muted-foreground"> {muted}</span> : null}
      </Tag>
    );
  }

  const trigger = onView
    ? { whileInView: "in", viewport: { once: true, margin: "0px 0px -10% 0px" } }
    : { animate: "in" };

  return (
    <Tag className={className}>
      <span className="sr-only">
        {text}
        {muted ? ` ${muted}` : ""}
      </span>
      <motion.span aria-hidden initial="out" {...trigger} className="inline">
        {words.map(({ w, quiet: q }, i) => (
          <Fragment key={`${w}-${i}`}>
            {stacked && q && !words[i - 1]?.quiet ? <br /> : null}
            <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
              <motion.span
                className={cn("inline-block", q && "text-muted-foreground")}
                variants={{
                  out: { y: "105%" },
                  in: {
                    y: "0%",
                    transition: { duration: 1, ease: EASE, delay: delay + i * stagger },
                  },
                }}
              >
                {w}
                {i < words.length - 1 && !(stacked && !q && words[i + 1]?.quiet) ? " " : ""}
              </motion.span>
            </span>
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}

/**
 * A paragraph that lights up as it is read. Each word's opacity is tied to how
 * far the paragraph has travelled through the viewport, so the brightness
 * follows the reader's eye instead of a timer.
 */
export function LitParagraph({
  text,
  className,
  emphasis = [],
}: {
  text: string;
  className?: string;
  /** Words (exact, punctuation included) drawn in the accent once lit. */
  emphasis?: string[];
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });
  const words = text.split(" ");

  if (reduced) {
    return <p className={className}>{text}</p>;
  }

  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <LitWord
            key={`${word}-${i}`}
            word={word}
            index={i}
            total={words.length}
            progress={scrollYProgress}
            accent={emphasis.includes(word)}
          />
        ))}
      </span>
    </p>
  );
}

function LitWord({
  word,
  index,
  total,
  progress,
  accent,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  accent: boolean;
}) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className={accent ? "text-accent" : undefined}>
      {word}{" "}
    </motion.span>
  );
}

/**
 * An image that drifts inside its frame as the page scrolls past it, and eases
 * down from a slight zoom on the way in. The frame itself does not move.
 */
export function Parallax({
  children,
  className,
  distance = 48,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-distance, distance]);
  const scale = useTransform(scrollYProgress, [0, 0.5], reduced ? [1, 1] : [1.12, 1.04]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y, scale }} className="absolute inset-[-8%]">
        {children}
      </motion.div>
    </div>
  );
}

/** A section's opening marker: index, label, and a rule that draws in. */
export function Eyebrow({ index, children }: { index: string; children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
      <span className="tabular-nums text-accent">{index}</span>
      <span className="uppercase tracking-[0.18em]">{children}</span>
      <motion.span
        aria-hidden
        className="h-px flex-1 origin-left bg-border"
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.1 }}
      />
    </div>
  );
}
