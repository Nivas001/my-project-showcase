import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { ArrowDown } from "lucide-react";
import type { Freight, Telemetry } from "./freight/scene";
import { CHAPTERS, shownChapter } from "./freight/timeline";
import { STAGES, type Stage } from "./pipeline-stages";
import { TechChip, TechGlyph, techLabel } from "@/components/kit/TechMark";
import { SectionLabel } from "@/components/kit";

const EASE = [0.16, 1, 0.3, 1] as const;

/** One line per leg: what the machine is doing, and why it is that stage. */
const LEGS = [
  "Leg 01 · Yard — the spreader is sized to the box",
  "Leg 02 · Yard — four corners locked before it lifts",
  "Leg 03 · Yard → trailer — the whole box, not a layer of it",
  "Leg 04 · Road — nothing runs straight for long",
  "Leg 05 · Quay — weighed, checked, lifted aboard",
  "Leg 06 · Sea — lashed, sealed and locked",
  "Leg 07 · Air — live, and anywhere",
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
 * HOW A PROJECT SHIPS
 *
 * The build pipeline, told as freight. One orange container — the project —
 * is picked off a stack by a reach stacker, set on a trailer, driven to the
 * quay, craned aboard a feeder ship and sent to sea, and the story ends above
 * the clouds as a freighter crosses the frame. Each leg is one of the seven
 * passes every project here goes through.
 *
 * The scene is real-time three.js (freight/scene.ts), scrubbed by scroll. It
 * is only loaded once the section is close, and visitors who prefer reduced
 * motion — or have no WebGL — get the same seven stages as a plain list.
 */
export function FreightStory({ id = "how-it-ships" }: { id?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const freightRef = useRef<Freight | null>(null);
  const gaugeLabel = useRef<HTMLSpanElement>(null);
  const gaugeValue = useRef<HTMLSpanElement>(null);
  const gaugeUnit = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion() ?? false;
  const mobile = useMobile();
  const mobileRef = useRef(mobile);
  mobileRef.current = mobile;

  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [chapter, setChapter] = useState(0);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    freightRef.current?.setProgress(p);
    setChapter(shownChapter(p * CHAPTERS));
  });

  // Only start building the port when the reader is a screen or two away.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNear(true);
      },
      { rootMargin: "150% 0px 150% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  useEffect(() => {
    if (!near || reduced) return;
    let cancelled = false;
    let freight: Freight | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let visibility: IntersectionObserver | null = null;

    const onTelemetry = (t: Telemetry) => {
      if (gaugeLabel.current) gaugeLabel.current.textContent = t.label;
      if (gaugeUnit.current) gaugeUnit.current.textContent = t.unit;
      if (gaugeValue.current) {
        gaugeValue.current.textContent = String(t.value).padStart(t.value >= 100 ? 3 : 2, "0");
      }
    };

    (async () => {
      try {
        const test = document.createElement("canvas");
        if (!test.getContext("webgl2") && !test.getContext("webgl")) throw new Error("no webgl");
        await document.fonts?.ready;
        const { createFreight } = await import("./freight/scene");
        if (cancelled || !canvasRef.current || !stageRef.current) return;
        freight = createFreight(canvasRef.current, { reducedMotion: reduced, onTelemetry });
        freightRef.current = freight;
        freight.setProgress(scrollYProgress.get());

        const stage = stageRef.current;
        const size = () =>
          freight?.resize(stage.clientWidth, stage.clientHeight, mobileRef.current);
        size();
        resizeObserver = new ResizeObserver(size);
        resizeObserver.observe(stage);

        visibility = new IntersectionObserver(([entry]) => {
          if (entry?.isIntersecting) freight?.start();
          else freight?.stop();
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
      freight?.dispose();
      freightRef.current = null;
    };
    // The scene is built once; progress and size are pushed in imperatively.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near, reduced]);

  useEffect(() => {
    const stage = stageRef.current;
    if (stage) freightRef.current?.resize(stage.clientWidth, stage.clientHeight, mobile);
  }, [mobile]);

  const onPointer = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    freightRef.current?.setPointer(x, y);
  };

  if (reduced || failed) return <StaticStages id={id} />;

  const stage = chapter >= 1 ? STAGES[chapter - 1] : undefined;

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative border-t border-border bg-[#c9d6e1]"
      style={{ height: `${CHAPTERS * 100 + 100}vh` }}
      aria-label="How a project ships: seven stages told as a container's journey by road, sea and air"
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-svh overflow-hidden text-[#11151b]"
        onPointerMove={onPointer}
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
        {!ready ? (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-[#b7cce0] to-[#dfe6ea]">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#2b3a4a]">
              Opening the yard…
            </span>
          </div>
        ) : null}

        {/* Soft vignette so the words always have somewhere quiet to sit. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(10,20,30,0.28)_100%)]"
        />

        {/* Read-out: which machine has the box, and how fast it is moving. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-4 top-20 rounded-xl bg-white/75 px-3 py-2 shadow-sm ring-1 ring-black/5 backdrop-blur-md sm:left-6"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#56606b]">
            <span ref={gaugeLabel}>Reach stacker</span>
          </p>
          <p className="mt-0.5 flex items-baseline gap-1.5 font-mono tabular-nums">
            <span ref={gaugeValue} className="text-2xl font-semibold leading-none text-[#11151b]">
              00
            </span>
            <span ref={gaugeUnit} className="text-[10px] font-semibold text-[#56606b]">
              KM/H
            </span>
          </p>
          <p className="mt-1 font-mono text-[9px] tracking-[0.12em] text-[#c4581b]">
            NIVU 202609 7
          </p>
        </div>

        <a
          href="#all-projects"
          className="absolute right-4 top-20 inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#2b3a4a] shadow-sm ring-1 ring-black/5 backdrop-blur-md transition-colors hover:bg-white sm:right-6"
        >
          Skip to all projects <ArrowDown className="h-3 w-3" />
        </a>

        <AnimatePresence mode="wait">
          {chapter === 0 ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
              transition={{ duration: 0.7, ease: EASE }}
              className="pointer-events-none absolute inset-x-5 top-[10.5rem] flex flex-col items-center text-center md:top-[8.5rem]"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#c4581b]">
                02 · How a project ships
              </p>
              <h2 className="mt-3 max-w-[16ch] font-display text-[clamp(2.3rem,5.6vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[#0f141a]">
                From a conversation to a live URL.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#27313b] sm:text-base">
                Seven passes, one container. Keep scrolling — it leaves by road, crosses by sea and
                lands by air.
              </p>
              <p className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#27313b]">
                <ArrowDown className="h-3.5 w-3.5 animate-bounce text-[#c4581b]" />
                Scroll to ship it
              </p>
            </motion.div>
          ) : stage ? (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
              transition={{ duration: 0.6, ease: EASE }}
              className="absolute inset-x-3 bottom-3 md:inset-x-auto md:bottom-8 md:left-8 md:w-[24.5rem]"
            >
              <StagePanel stage={stage} leg={LEGS[chapter - 1] ?? ""} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Progress through the seven legs. */}
        <div className="pointer-events-none absolute bottom-6 right-8 hidden items-center gap-2 md:flex">
          {STAGES.map((s, i) => (
            <span
              key={s.id}
              className={`h-[3px] rounded-full transition-all duration-500 ${
                i + 1 === chapter
                  ? "w-9 bg-[#e97a2c]"
                  : i + 1 < chapter
                    ? "w-3 bg-white/90"
                    : "w-3 bg-white/45"
              }`}
            />
          ))}
        </div>
        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-[#e97a2c]"
          style={{ scaleX: scrollYProgress }}
        />
      </div>
    </section>
  );
}

function StagePanel({ stage, leg }: { stage: Stage; leg: string }) {
  return (
    <div className="rounded-2xl bg-white/85 p-5 shadow-[0_20px_60px_-24px_rgba(10,20,30,0.45)] ring-1 ring-black/5 backdrop-blur-xl sm:p-6">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#66707a]">{leg}</p>
      <p className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c4581b]">
        {stage.index} — {stage.kicker}
      </p>
      <h3 className="mt-1.5 font-display text-[clamp(1.5rem,2.6vw,2.2rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-[#0f141a]">
        {stage.title}
      </h3>
      <p className="mt-3 line-clamp-4 text-[14px] leading-relaxed text-[#39434d] md:line-clamp-none md:text-[15px]">
        {stage.body}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {stage.tools.map((tool) => (
          <span
            key={tool}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f2f3] py-1 pl-1.5 pr-2.5 ring-1 ring-black/5"
          >
            <TechGlyph id={tool} className="h-4 w-4" />
            <span className="font-mono text-[10.5px] font-semibold text-[#27313b]">
              {techLabel(tool)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Reduced motion, or no WebGL: the seven stages as a list, nothing lost. */
function StaticStages({ id }: { id: string }) {
  return (
    <section id={id} className="relative border-t border-border">
      <div className="relative mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-24">
        <SectionLabel index="02">How a project ships</SectionLabel>
        <h2 className="hero-md mt-6 text-foreground">From a conversation to a live URL.</h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          Every project below went through the same seven passes.
        </p>

        <ol className="mt-12 space-y-5">
          {STAGES.map((stage, i) => (
            <li
              key={stage.id}
              className="grid gap-6 rounded-xl border border-border bg-card/70 p-6 sm:grid-cols-[1fr_9rem]"
            >
              <div>
                <span className="micro text-accent">
                  {stage.index} — {stage.kicker}
                </span>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {LEGS[i]}
                </p>
                <h3 className="display-sm mt-3 text-foreground">{stage.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{stage.body}</p>
                <ul className="mt-4 space-y-1.5">
                  {stage.beats.map((beat) => (
                    <li key={beat} className="text-[13px] text-foreground/85">
                      — {beat}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  {stage.tools.map((tool) => (
                    <TechChip key={tool} id={tool} size="sm" />
                  ))}
                </div>
              </div>
              <div aria-hidden className="hidden h-28 text-accent sm:block">
                {stage.illustration}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
