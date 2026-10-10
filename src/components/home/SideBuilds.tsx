import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow, RiseWords } from "./fx";

type Build = {
  to: "/fun" | "/horror" | "/apps" | "/wall" | "/how-to-be-smarter-than-an-ai" | "/genz";
  title: string;
  body: string;
  meta: string;
  preview: () => ReactNode;
};

const BUILDS: Build[] = [
  {
    to: "/fun",
    title: "The Arcade",
    body: "Six browser games with synthesised sound and a public leaderboard.",
    meta: "6 games · Web Audio · Supabase",
    preview: ArcadePreview,
  },
  {
    to: "/horror",
    title: "The Dark Room",
    body: "Branching and narrated horror in English, Tamil and Tanglish — timed choices, multiple endings.",
    meta: "23 stories · 3 languages · TTS",
    preview: HorrorPreview,
  },
  {
    to: "/apps",
    title: "The Playground",
    body: "Thirteen apps that run in the browser — Paint, Notes, a terminal, a tycoon game.",
    meta: "13 apps · window manager",
    preview: PlaygroundPreview,
  },
  {
    to: "/wall",
    title: "The Paint Wall",
    body: "Everything visitors draw in the Paint app lands here, rated by everyone else.",
    meta: "Canvas · realtime · ratings",
    preview: PaintPreview,
  },
  {
    to: "/how-to-be-smarter-than-an-ai",
    title: "Beat an AI",
    body: "Ask GLITCH-9000 ten questions. It will not answer them. It will prescribe homework.",
    meta: "a joke with a state machine",
    preview: ChatPreview,
  },
  {
    to: "/genz",
    title: "Gen Z",
    body: "A scroll-led, illustrated tribute to the generation that learned to build on a phone.",
    meta: "scroll storytelling",
    preview: FeedPreview,
  },
];

/**
 * The smaller builds, as a gallery that moves sideways while the page scrolls
 * down. Desktop pins the row and translates it; phones get an ordinary
 * swipeable strip, which is what a thumb expects anyway.
 */
export function SideBuilds() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(0);
  const [desktop, setDesktop] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      setDesktop(mq.matches);
      const track = trackRef.current;
      if (track) setOverflow(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const pinned = desktop && !reduced && overflow > 0;
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -overflow]);
  useMotionValueEvent(scrollYProgress, "change", (p) =>
    setIndex(Math.min(BUILDS.length - 1, Math.floor(p * BUILDS.length))),
  );

  return (
    <section data-act="noir" data-rail="Side builds" className="act-noir relative">
      <div
        ref={wrapRef}
        className="relative"
        style={pinned ? { height: `calc(100svh + ${overflow}px)` } : {}}
      >
        <div
          className={
            pinned ? "sticky top-0 flex h-svh flex-col justify-center overflow-hidden" : ""
          }
        >
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <Eyebrow index="04">Side builds</Eyebrow>
            <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
              <RiseWords
                text="Smaller things,"
                muted="built for the fun of it."
                className="max-w-[20ch] font-display text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-foreground"
              />
              <p
                className={`font-mono text-[11px] tabular-nums text-muted-foreground ${pinned ? "" : "hidden"}`}
              >
                <span className="text-foreground">{String(index + 1).padStart(2, "0")}</span> /{" "}
                {String(BUILDS.length).padStart(2, "0")}
              </p>
            </div>
          </div>

          <div className={pinned ? "mt-12" : "mt-12 overflow-x-auto pb-6 [scrollbar-width:none]"}>
            <motion.div
              ref={trackRef}
              style={pinned ? { x } : {}}
              className="flex w-max snap-x snap-mandatory gap-5 px-5 sm:px-8 lg:gap-6 lg:pl-[max(2rem,calc((100vw-72rem)/2+2rem))] lg:pr-[max(2rem,calc((100vw-72rem)/2+2rem))]"
            >
              {BUILDS.map((build, i) => (
                <Card key={build.to} build={build} index={i} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      <div className="h-28 sm:h-40" />
    </section>
  );
}

function Card({ build, index }: { build: Build; index: number }) {
  const Preview = build.preview;
  return (
    <Link
      to={build.to}
      data-cursor="Open"
      className="group relative flex w-[78vw] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors duration-500 hover:border-foreground/25 sm:w-[24rem] lg:w-[26rem]"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-secondary/50">
        <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]">
          <Preview />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
          <span>
            <span className="text-accent">{String(index + 1).padStart(2, "0")}</span>
            <span className="mx-2 text-border">/</span>
            {build.meta}
          </span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </p>
        <h3 className="font-display text-[1.6rem] font-semibold tracking-[-0.03em] text-foreground">
          {build.title}
        </h3>
        <p className="text-[14.5px] leading-relaxed text-muted-foreground">{build.body}</p>
      </div>
    </Link>
  );
}

/* ---- Previews: each one a few shapes and a loop ------------------------- */

function ArcadePreview() {
  return (
    <div className="absolute inset-0 bg-[#0d1117]">
      <svg viewBox="0 0 160 120" className="h-full w-full" aria-hidden>
        <defs>
          <pattern id="arcade-grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M8 0H0V8" fill="none" stroke="#1f2a3a" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="160" height="120" fill="url(#arcade-grid)" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            className="sb-snake"
            style={{ animationDelay: `${(4 - i) * -0.17}s` }}
            x="0"
            y="56"
            width="7"
            height="7"
            fill={i === 0 ? "#f08a3c" : "#59a869"}
          />
        ))}
        <rect className="sb-blink" x="120" y="56" width="7" height="7" fill="#e0527a" />
        <text x="10" y="18" fill="#8b949e" style={{ font: "7px 'Press Start 2P', monospace" }}>
          SCORE 0420
        </text>
        <text x="108" y="18" fill="#f08a3c" style={{ font: "7px 'Press Start 2P', monospace" }}>
          HI 9001
        </text>
      </svg>
    </div>
  );
}

function HorrorPreview() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-5 bg-[#0a0707] px-8">
      <p className="sb-flicker font-story text-[1.35rem] italic leading-snug text-[#e9dcd0]">
        The lift stopped between floors. Somebody knocked — from inside the shaft.
      </p>
      <div className="flex gap-2 font-mono text-[10px] uppercase tracking-widest">
        <span className="rounded-full border border-[#e9dcd0]/40 px-3 py-1.5 text-[#e9dcd0]">
          Answer
        </span>
        <span className="rounded-full border border-[#b3261e] px-3 py-1.5 text-[#ff6b5e] sb-blink">
          Stay silent · 0:07
        </span>
      </div>
    </div>
  );
}

function PlaygroundPreview() {
  const win = (x: number, y: number, w: number, h: number, delay: number, body: ReactNode) => (
    <g className="sb-float" style={{ animationDelay: `${delay}s` }}>
      <rect x={x} y={y} width={w} height={h} rx="4" fill="var(--card)" stroke="var(--border)" />
      <rect x={x} y={y} width={w} height="9" rx="4" fill="var(--secondary)" />
      <circle cx={x + 6} cy={y + 4.5} r="1.6" fill="var(--muted-foreground)" />
      <circle cx={x + 11} cy={y + 4.5} r="1.6" fill="var(--muted-foreground)" opacity="0.6" />
      {body}
    </g>
  );
  return (
    <svg viewBox="0 0 160 120" className="absolute inset-0 h-full w-full" aria-hidden>
      {win(
        14,
        22,
        70,
        56,
        0,
        <>
          <path
            className="sb-draw"
            d="M22 60 C34 40 44 70 58 48 S74 52 78 42"
            stroke="#e0527a"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="30" cy="42" r="5" fill="#f3c14b" />
        </>,
      )}
      {win(
        70,
        14,
        76,
        46,
        -1.3,
        <>
          <text x="75" y="34" fill="var(--accent)" style={{ font: "6px var(--ui-mono)" }}>
            $ neofetch
          </text>
          <text x="75" y="44" fill="var(--muted-foreground)" style={{ font: "6px var(--ui-mono)" }}>
            13 apps · 0 bugs*
          </text>
        </>,
      )}
      {win(
        60,
        66,
        80,
        42,
        -2.1,
        <>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={68 + i * 17}
              y={98 - (i + 1) * 5}
              width="10"
              height={(i + 1) * 5}
              fill={i === 3 ? "var(--accent)" : "var(--muted-foreground)"}
              opacity={i === 3 ? 1 : 0.4}
            />
          ))}
        </>,
      )}
    </svg>
  );
}

function PaintPreview() {
  const strokes = [
    ["M18 90 C40 30 70 110 96 50 S134 40 146 70", "#2447c9", 0],
    ["M20 40 C48 60 62 20 90 36", "#f08a3c", 0.6],
    ["M60 100 C80 80 110 104 140 92", "#59a869", 1.2],
    ["M112 20 l8 16 l-16 0 z", "#e0527a", 1.8],
  ] as const;
  return (
    <svg viewBox="0 0 160 120" className="absolute inset-0 h-full w-full bg-[#fbf8f1]" aria-hidden>
      {strokes.map(([d, c, delay]) => (
        <path
          key={d}
          className="sb-paint"
          style={{ animationDelay: `${delay}s` }}
          d={d}
          stroke={c}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
        />
      ))}
      <text x="12" y="112" fill="#8a8272" style={{ font: "6px var(--ui-mono)" }}>
        ★★★★☆ · drawn by a visitor
      </text>
    </svg>
  );
}

function ChatPreview() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-3 px-7">
      <p className="sb-pop ml-auto max-w-[75%] rounded-2xl rounded-br-sm bg-foreground px-4 py-2.5 text-[13px] text-background">
        What is 7 × 8?
      </p>
      <p
        className="sb-pop max-w-[80%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2.5 text-[13px] text-foreground"
        style={{ animationDelay: "0.9s" }}
      >
        <span className="font-mono text-[10px] text-accent">GLITCH-9000</span>
        <br />
        Before I answer, please read chapters 1–4 of “Numbers”.
      </p>
      <p
        className="sb-pop flex w-14 gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3"
        style={{ animationDelay: "1.8s" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="sb-dot h-1.5 w-1.5 rounded-full bg-muted-foreground"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </p>
    </div>
  );
}

function FeedPreview() {
  const tiles = [
    "#2447c9",
    "#f08a3c",
    "#59a869",
    "#e0527a",
    "#f3c14b",
    "#2447c9",
    "#f08a3c",
    "#59a869",
  ];
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative h-[82%] w-[34%] overflow-hidden rounded-[1.4rem] border-4 border-foreground/80 bg-card">
        <div className="sb-feed flex flex-col gap-2 p-2">
          {[...tiles, ...tiles].map((c, i) => (
            <div
              key={i}
              className="shrink-0 rounded-lg"
              style={{ background: c, height: i % 3 === 0 ? 64 : 40, opacity: 0.85 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
