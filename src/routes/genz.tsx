import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { canonical } from "@/lib/site";
import { Marquee } from "@/components/kit";
import { useInView } from "@/components/Reveal";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * /genz — a wall of tribute
 * ============================================================================
 *
 * A scroll-led editorial page: big type, hard colour blocks, pinned sections
 * that resolve as you move through them, and illustrations drawn as inline SVG
 * rather than loaded as images.
 *
 * TWO RULES THIS PAGE KEEPS
 *
 * It names nobody. A tribute wall with real names on it becomes a claim about
 * real people, and this is a portfolio, not a record. Every panel is about a
 * shared experience instead — which is also the more honest thing to put on a
 * wall, because the interesting part was never any one person.
 *
 * It invents no statistics. There are numbers on this page and all of them are
 * either definitional (the birth years) or plainly a joke (the tab count). A
 * fabricated "73% of Gen Z" would be indistinguishable from the real thing and
 * would be worse than saying nothing.
 *
 * Every scroll effect collapses to a no-op under prefers-reduced-motion. The
 * transforms are still created — hooks cannot be called conditionally — but
 * their ranges flatten.
 */

const TITLE = "Gen Z — a wall of tribute";
const DESCRIPTION =
  "A scroll-led tribute to the generation that grew up with the whole internet in one hand and learned to build with it. Illustrated, animated, and entirely free of statistics I made up.";

export const Route = createFileRoute("/genz")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [canonical("/genz")],
  }),
  component: GenZ,
});

/* ==========================================================================
 * Illustrations
 *
 * All original, all inline SVG, all built from primitives so they inherit the
 * page's colour tokens and cost nothing to load. Each one is a single idea
 * drawn plainly — an illustration that needs a caption to be understood is a
 * diagram, and a diagram does not belong on a tribute wall.
 * ======================================================================== */

/** A face lit from below by a screen. The oldest image this generation has. */
function ScreenLight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="A face lit by a screen in the dark"
    >
      <defs>
        <radialGradient id="gz-glow" cx="50%" cy="78%" r="55%">
          <stop offset="0%" stopColor="var(--hog-blue)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--hog-blue)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="none" />
      <circle cx="100" cy="150" r="78" fill="url(#gz-glow)" />
      {/* Head */}
      <path
        d="M62 92 Q62 44 100 44 Q138 44 138 92 Q138 128 100 134 Q62 128 62 92 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      {/* Eyes, looking down at the thing in their hands */}
      <path
        d="M78 94 q8 7 16 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M106 94 q8 7 16 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* The phone */}
      <rect x="84" y="150" width="32" height="46" rx="5" fill="var(--hog-blue)" opacity="0.9" />
      <rect x="88" y="156" width="24" height="30" rx="2" fill="var(--background)" opacity="0.4" />
    </svg>
  );
}

/** Many small marks resolving into one shape. A crowd that is also a signal. */
function Crowd({ className }: { className?: string }) {
  const dots: { x: number; y: number; r: number }[] = [];
  // A deterministic lattice with a fixed jitter — random() here would reshuffle
  // the illustration on every render and on every hydration.
  for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 17; col++) {
      const seed = (row * 17 + col) * 9301;
      const jitter = ((seed % 233) / 233 - 0.5) * 5;
      dots.push({
        x: 12 + col * 11 + jitter,
        y: 14 + row * 15 + jitter,
        r: 2.2 + ((seed % 7) / 7) * 2,
      });
    }
  }
  return (
    <svg
      viewBox="0 0 200 180"
      className={className}
      role="img"
      aria-label="Many small marks forming a crowd"
    >
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill="currentColor"
          opacity={0.18 + ((i * 37) % 60) / 100}
        />
      ))}
    </svg>
  );
}

/** A window with a cursor in it. The workshop this generation was handed. */
function Workshop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      className={className}
      role="img"
      aria-label="An editor window with a cursor"
    >
      <rect
        x="14"
        y="20"
        width="172"
        height="122"
        rx="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <line x1="14" y1="44" x2="186" y2="44" stroke="currentColor" strokeWidth="3" />
      <circle cx="28" cy="32" r="3.5" fill="var(--hog-red)" />
      <circle cx="40" cy="32" r="3.5" fill="var(--hog-yellow)" />
      <circle cx="52" cy="32" r="3.5" fill="var(--hog-green)" />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x="30"
          y={62 + i * 16}
          width={[92, 64, 110, 48][i]}
          height="6"
          rx="3"
          fill="currentColor"
          opacity={0.3 + i * 0.12}
        />
      ))}
      <rect x="84" y="126" width="3" height="14" fill="var(--hog-red)">
        <animate attributeName="opacity" values="1;1;0;0" dur="1.1s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

/** An open loop — a thing begun and deliberately not finished. */
function OpenLoop({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} role="img" aria-label="An unclosed loop">
      <path
        d="M40 80 Q40 30 100 30 Q160 30 160 80 Q160 130 100 130 Q62 130 50 106"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="1000"
        strokeDashoffset="0"
      />
      <circle cx="50" cy="106" r="6" fill="var(--hog-red)" />
    </svg>
  );
}

/* ==========================================================================
 * Panels
 * ======================================================================== */

type Panel = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  tint: string;
  ink: string;
  Art: typeof ScreenLight;
};

const PANELS: Panel[] = [
  {
    id: "lit",
    kicker: "Born into it",
    title: "The first generation with no before",
    body: "Everyone older remembers a version of the world without this in it, and quietly measures against it. Gen Z has no control group. The whole library, the whole archive, every stranger alive — handed over at once, at thirteen, with no manual and no adult who had done it first.",
    tint: "var(--hog-blue)",
    ink: "oklch(0.98 0 0)",
    Art: ScreenLight,
  },
  {
    id: "crowd",
    kicker: "In numbers",
    title: "Organised before anyone noticed",
    body: "A group chat is infrastructure. A shared document is a headquarters. This is the cohort that worked out you can coordinate thousands of people with tools that were built for sharing homework, and then did it, repeatedly, while being told they were on their phones too much.",
    tint: "var(--hog-red)",
    ink: "oklch(0.99 0 0)",
    Art: Crowd,
  },
  {
    id: "build",
    kicker: "Self-taught",
    title: "Nobody asked permission",
    body: "The gatekeepers did not fall so much as become irrelevant. A sixteen-year-old with a laptop can ship to the same internet as a company of four hundred, and increasingly does. Not because it is easy. Because the alternative was waiting for a turn that was never scheduled.",
    tint: "var(--hog-green)",
    ink: "oklch(0.16 0.04 160)",
    Art: Workshop,
  },
  {
    id: "loop",
    kicker: "Unfinished",
    title: "Still going",
    body: "This panel does not get a conclusion, because the generation it is about has not finished doing whatever it is doing. Anyone writing the summary right now is guessing. So: a loop left open, on purpose, and a note to come back later.",
    tint: "var(--hog-purple)",
    ink: "oklch(0.99 0 0)",
    Art: OpenLoop,
  },
];

/* The band between the hero and the panels. Short phrases only — a marquee
   is read in glances, not sentences. */
const MARQUEE = [
  "built it anyway",
  "asked what the salary was",
  "learned it from a stranger",
  "shipped it from a laptop",
  "left the platform quietly",
  "still going",
] as const;

/* The tribute wall itself: short, specific, shared. */
const TRIBUTES: { text: string; tone: string }[] = [
  {
    text: "For everyone who learned to code from a video paused every four seconds.",
    tone: "var(--hog-blue)",
  },
  {
    text: "For the group chat that became a movement and then went back to being a group chat.",
    tone: "var(--hog-red)",
  },
  {
    text: "For making sincerity embarrassing, then making it cool again inside eighteen months.",
    tone: "var(--hog-green)",
  },
  {
    text: "For treating a therapist as maintenance rather than an emergency.",
    tone: "var(--hog-purple)",
  },
  {
    text: "For asking what the salary is, out loud, in the first interview.",
    tone: "var(--hog-yellow)",
  },
  {
    text: "For the side project that was never going to make money and got made anyway.",
    tone: "var(--hog-orange)",
  },
  {
    text: "For being fluent in three registers of irony and one of genuine care.",
    tone: "var(--hog-blue)",
  },
  { text: "For reading the terms. Some of you. Occasionally.", tone: "var(--hog-red)" },
  {
    text: "For knowing exactly which of your friends to send which link to.",
    tone: "var(--hog-green)",
  },
  {
    text: "For the ones who left the platform and did not announce it.",
    tone: "var(--hog-purple)",
  },
  { text: "For building in public before anyone called it that.", tone: "var(--hog-yellow)" },
  { text: "For the 47 open tabs. They are a filing system. It works.", tone: "var(--hog-orange)" },
];

/* ==========================================================================
 * Page
 * ======================================================================== */

function GenZ() {
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(heroProgress, [0, 1], reduced ? [1, 1] : [1, 1.14]);
  const heroY = useTransform(heroProgress, [0, 1], reduced ? [0, 0] : [0, -90]);
  const heroFade = useTransform(heroProgress, [0, 0.75], reduced ? [1, 1] : [1, 0]);

  return (
    <>
      {/* ---- Hero ---- */}
      <section
        ref={heroRef}
        data-act="noir"
        className="act-noir grain relative flex min-h-svh items-center justify-center overflow-hidden"
      >
        <div
          aria-hidden
          className="hairline-grid pointer-events-none absolute inset-0 opacity-50"
        />
        <motion.div
          aria-hidden
          style={{ scale: heroScale }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, var(--hog-red), var(--hog-purple), var(--hog-blue), var(--hog-green), var(--hog-red))",
              opacity: 0.2,
            }}
          />
        </motion.div>

        <motion.div
          style={{ y: heroY, opacity: heroFade }}
          className="relative mx-auto max-w-5xl px-5 text-center"
        >
          <p className="micro text-hog-red">A wall of tribute</p>
          <h1 className="display-xl mt-5 text-foreground">
            GEN
            <span className="text-hog-red">Z</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Born roughly 1997 to 2012. Handed the entire internet at thirteen with no instructions
            and no adult who had done it first. This page is for them, and it names nobody, because
            the interesting part was never any one person.
          </p>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Scroll
          </p>
        </motion.div>
      </section>

      {/* ---- Marquee ---- */}
      <section data-act="hog" className="act-hog border-y-[3px] border-ink py-4">
        <Marquee
          items={MARQUEE}
          duration={34}
          separator="★"
          itemClassName="font-display text-2xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl"
        />
      </section>

      {/* ---- Panels ---- */}
      {PANELS.map((panel, i) => (
        <PanelSection key={panel.id} panel={panel} index={i} reduced={Boolean(reduced)} />
      ))}

      {/* ---- The wall ---- */}
      <section
        data-act="noir"
        className="act-noir grain relative overflow-hidden border-t border-border"
      >
        <div
          aria-hidden
          className="hairline-grid pointer-events-none absolute inset-0 opacity-35"
        />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <p className="micro text-hog-red">The wall</p>
          <h2 className="display-md mt-4 max-w-3xl text-foreground">
            Twelve things worth saying out loud
            <span className="text-hog-red">.</span>
          </h2>

          <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {TRIBUTES.map((tribute, i) => (
              <TributeCard key={i} text={tribute.text} tone={tribute.tone} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ---- Close ---- */}
      <section data-act="hog" className="act-hog relative border-t-[3px] border-ink">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:py-28">
          <h2 className="display-md text-foreground">
            The summary is not written yet
            <span className="text-hog-red">.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Every generation gets described by the one before it, usually too early and usually
            wrong. This page deliberately stops short of a verdict. Come back in twenty years and it
            will still be here, still unfinished, which is the only honest way to end a tribute to
            people who are mostly still in their twenties.
          </p>
          <p className="mt-10 font-hand text-2xl text-hog-red">— from one of them</p>
        </div>
      </section>
    </>
  );
}

/* --------------------------------------------------------------------------
 * A panel
 *
 * The art drifts against the text at a different rate, so the two separate as
 * the panel crosses the viewport. The effect is small on purpose: a page that
 * throws its illustrations around is exhausting by the third one.
 * ------------------------------------------------------------------------ */

function PanelSection({
  panel,
  index,
  reduced,
}: {
  panel: Panel;
  index: number;
  reduced: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const artY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [70, -70]);
  const artRotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-7, 7]);
  const textY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [30, -30]);

  const flipped = index % 2 === 1;

  return (
    <section
      ref={ref}
      data-act="hog"
      className="act-hog relative overflow-hidden border-b-[3px] border-ink"
      style={{ background: panel.tint, color: panel.ink }}
    >
      <div
        className={cn(
          "mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-16",
          flipped && "lg:[&>*:first-child]:order-2",
        )}
      >
        <motion.div style={{ y: textY }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] opacity-70">
            {String(index + 1).padStart(2, "0")} · {panel.kicker}
          </p>
          <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[0.95] tracking-tight">
            {panel.title}
          </h2>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed opacity-85">{panel.body}</p>
        </motion.div>

        <motion.div
          style={{ y: artY, rotate: artRotate }}
          className="mx-auto w-full max-w-sm"
          aria-hidden={false}
        >
          <panel.Art className="h-auto w-full" />
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
 * A tribute card
 *
 * Fires once on entry and then stays put. A card that re-animates every time
 * it re-enters the viewport turns a wall into a strobe.
 * ------------------------------------------------------------------------ */

function TributeCard({ text, tone, index }: { text: string; tone: string; index: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${(index % 6) * 70}ms`,
        borderLeftColor: tone,
      }}
      className={cn(
        "mb-4 break-inside-avoid rounded-md border border-border border-l-[3px] bg-card/60 p-5 transition-all duration-700",
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      )}
    >
      <p className="font-story text-[17px] leading-relaxed text-foreground">{text}</p>
    </div>
  );
}
