import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import type { Studio } from "./studio/scene";
import { CHAPTER_COUNT, insetsAt, shownChapter, textSide } from "./studio/timeline";
import { site } from "@/lib/site";
import { LocalClock } from "@/components/kit";

const EASE = [0.16, 1, 0.3, 1] as const;

type Chapter = { tag: string; title: string; body: string };

const CHAPTERS: Chapter[] = [
  {
    tag: "about — the long version",
    title: "Built at one desk.",
    body: "Scroll, and I'll walk you round it — every screen on it, and what leaves it.",
  },
  {
    tag: "① the web, in VS Code",
    title: "React, TanStack, TypeScript.",
    body: "Most days start here: server-rendered React on TanStack Start, typed from the database to the button, shipped to the edge.",
  },
  {
    tag: "② the phone, in Android Studio",
    title: "Flutter, when it has to be native.",
    body: "Dart and Flutter with a real backend behind it — live data, offline sync, and a release pipeline that actually reaches a store build.",
  },
  {
    tag: "③ the research, in PyCharm",
    title: "Python for the hard NLP.",
    body: "My postgraduate work: mT5 fine-tuned with PEFT and NER wired in, so a Tamil summary keeps the names that make the story mean anything. JetBrains tools for the big codebases.",
  },
  {
    tag: "④ home is a Linux shell",
    title: "Fedora, KDE, a terminal.",
    body: "Everything ends in a terminal — commits, builds, deploys. I live on Linux, write my own desktop widgets, and yes, the penguin stays on the desk.",
  },
  {
    tag: "⑤ then it leaves the screen",
    title: "…and becomes a product.",
    body: "Six products are live right now — the site, the app, the database, the admin panel someone uses every day — each one built and deployed alone.",
  },
  {
    tag: "⑥ in person",
    title: "Or hear it from me.",
    body: "The centre screen is my video résumé. Keep scrolling and press play.",
  },
];

function useMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return mobile;
}

/**
 * The About page opens as a 3D illustration you scroll through: a developer's
 * desk drawn in paper and cobalt, the camera flying from screen to screen
 * while each chapter's words take the side of the frame the scene gives up.
 *
 * WebGL is loaded on the client only, after the page is interactive. If it is
 * unavailable the chapters render as plain text, so nothing is lost.
 */
export function StudioStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const studioRef = useRef<Studio | null>(null);
  const reduced = useReducedMotion() ?? false;
  const mobile = useMobile();
  const mobileRef = useRef(mobile);
  mobileRef.current = mobile;

  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const clip = useTransform(scrollYProgress, (p) => {
    const [t, r, b, l] = insetsAt(p, mobileRef.current);
    return `inset(${(t * 100).toFixed(3)}% ${(r * 100).toFixed(3)}% ${(b * 100).toFixed(3)}% ${(l * 100).toFixed(3)}% round 20px)`;
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    studioRef.current?.setProgress(p);
    setChapter(shownChapter(p));
  });

  // Boot the scene.
  useEffect(() => {
    let cancelled = false;
    let studio: Studio | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let visibility: IntersectionObserver | null = null;

    (async () => {
      try {
        const test = document.createElement("canvas");
        if (!test.getContext("webgl2") && !test.getContext("webgl")) throw new Error("no webgl");
        await document.fonts?.ready;
        const { createStudio } = await import("./studio/scene");
        if (cancelled || !canvasRef.current || !stageRef.current) return;
        studio = createStudio(canvasRef.current, { reducedMotion: reduced });
        studioRef.current = studio;
        studio.setProgress(scrollYProgress.get());

        const stage = stageRef.current;
        const size = () => studio?.resize(stage.clientWidth, stage.clientHeight, mobileRef.current);
        size();
        resizeObserver = new ResizeObserver(size);
        resizeObserver.observe(stage);

        visibility = new IntersectionObserver(([entry]) => {
          if (entry?.isIntersecting) studio?.start();
          else studio?.stop();
        });
        if (sectionRef.current) visibility.observe(sectionRef.current);
        setReady(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      visibility?.disconnect();
      studio?.dispose();
      studioRef.current = null;
    };
    // The scene is built once; progress and size are pushed in imperatively.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // Re-fit when the layout switches between phone and desktop framing.
  useEffect(() => {
    const stage = stageRef.current;
    if (stage) studioRef.current?.resize(stage.clientWidth, stage.clientHeight, mobile);
  }, [mobile]);

  const onPointer = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    studioRef.current?.setPointer(x, y);
    setCoords({ x, y });
  };

  if (failed) return <FallbackStory />;

  const current = chapter >= 0 ? CHAPTERS[chapter] : undefined;
  const side = textSide(Math.max(0, chapter), mobile);

  return (
    <section
      ref={sectionRef}
      data-act="noir"
      className="act-noir relative"
      style={{ height: `${CHAPTER_COUNT * 95 + 20}vh` }}
      aria-label="About Srinivas, told as a walk around his desk"
    >
      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden" onPointerMove={onPointer}>
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          <canvas
            ref={canvasRef}
            aria-hidden
            className={`h-full w-full transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
          />
          {!ready ? (
            <div className="absolute inset-0 grid place-items-center bg-[#ece5d3]">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#2447c9]">
                Setting up the desk…
              </span>
            </div>
          ) : null}
        </motion.div>

        {/* Desk coordinates & IST clock read-out */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-5 top-20 hidden font-mono text-[10px] leading-4 text-muted-foreground sm:block"
        >
          <p>
            X {coords.x.toFixed(2)} · Y {coords.y.toFixed(2)}
          </p>
          <p className="text-muted-foreground/80">
            {site.locationShort} · <LocalClock timeZone={site.timezone} className="tabular-nums" />
          </p>
        </div>

        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={chapter}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -16, filter: "blur(6px)" }}
              transition={{ duration: 0.7, ease: EASE }}
              className={PANEL[side]}
            >
              {chapter === 0 ? (
                <Title chapter={current} />
              ) : (
                <ChapterCopy chapter={current} last={chapter === CHAPTERS.length - 1} />
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Chapter ticks. */}
        <div className="pointer-events-none absolute bottom-5 right-6 hidden items-center gap-2 md:flex">
          {CHAPTERS.map((c, i) => (
            <span
              key={c.tag}
              className={`h-px transition-all duration-500 ${
                i === chapter ? "w-8 bg-accent" : "w-3 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const PANEL = {
  top: "absolute inset-x-5 top-[4.5rem] flex h-[calc(40%-4.5rem)] flex-col items-center justify-center text-center md:top-16 md:h-[calc(33%-4rem)]",
  right: "absolute right-[3%] top-1/2 w-[33%] -translate-y-1/2",
  left: "absolute left-[3%] top-1/2 w-[33%] -translate-y-1/2",
  bottom:
    "absolute inset-x-5 bottom-0 flex h-[40%] flex-col justify-center md:inset-x-[3%] md:h-[24%] md:flex-row md:items-center md:gap-12",
} as const;

function Title({ chapter }: { chapter: Chapter }) {
  return (
    <>
      <p className="hand text-lg text-accent sm:text-xl">{chapter.tag}</p>
      <h1 className="mt-2 font-display text-[clamp(2.4rem,6vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-foreground">
        {chapter.title}
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-base">
        {chapter.body}
      </p>
    </>
  );
}

function ChapterCopy({ chapter, last }: { chapter: Chapter; last: boolean }) {
  return (
    <>
      <div className="md:max-w-md">
        <p className="hand text-lg text-accent sm:text-xl">{chapter.tag}</p>
        <h2 className="mt-2 font-display text-[clamp(1.9rem,3.4vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground">
          {chapter.title}
        </h2>
      </div>
      <div className="md:max-w-md">
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground md:mt-4">
          {chapter.body}
        </p>
        {last ? (
          <a
            href="#video"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            Play the video résumé ↓
          </a>
        ) : null}
      </div>
    </>
  );
}

/** No WebGL: the same story, as words. */
function FallbackStory() {
  return (
    <section data-act="noir" className="act-noir relative">
      <div className="mx-auto max-w-4xl px-5 pb-16 pt-32 sm:px-8 sm:pt-40">
        <Title chapter={CHAPTERS[0]!} />
        <ol className="mt-16 space-y-10">
          {CHAPTERS.slice(1).map((c) => (
            <li key={c.tag} className="border-t border-border pt-6">
              <ChapterCopy chapter={c} last={false} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
