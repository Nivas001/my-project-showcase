import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RotateCcw } from "lucide-react";
import { Character, type CharacterHandle, type Mood } from "./Character";
import { QUIPS } from "./data";
import { MM } from "./theme";

/**
 * The title-card entrance: a TVA time door tears open, Miss Minutes
 * materialises through it, hops, waves and introduces herself, and the door
 * seals behind her. Tap her afterwards and she answers back.
 *
 * Reduced motion skips straight to the last frame: her standing there, saying
 * hello.
 */

type Beat = { at: number; mood: Mood; say: string | null; door: boolean; appear?: boolean };

const SCRIPT: Beat[] = [
  { at: 0, mood: "sleeping", say: null, door: false },
  { at: 350, mood: "sleeping", say: null, door: true },
  { at: 1050, mood: "acting", say: null, door: true, appear: true },
  { at: 1900, mood: "speaking", say: "Well hey there, sugar! I'm Miss Minutes.", door: true },
  {
    at: 4300,
    mood: "speaking",
    say: "I run Srinivas's whole desktop. Scroll down and I'll show you how.",
    door: false,
  },
  { at: 7600, mood: "idle", say: "Tap me anytime.", door: false },
];

export function MissMinutesEntrance() {
  const reduced = useReducedMotion();
  const character = useRef<CharacterHandle>(null);
  const timers = useRef<number[]>([]);
  const [beat, setBeat] = useState<Beat>(reduced ? SCRIPT[SCRIPT.length - 1]! : SCRIPT[0]!);
  const [shown, setShown] = useState(Boolean(reduced));
  const [quip, setQuip] = useState<string | null>(null);

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setQuip(null);
    if (reduced) {
      setShown(true);
      setBeat(SCRIPT[SCRIPT.length - 1]!);
      return;
    }
    setShown(false);
    for (const b of SCRIPT) {
      timers.current.push(
        window.setTimeout(() => {
          setBeat(b);
          if (b.appear) {
            setShown(true);
            // Let the element mount before asking it to materialise.
            requestAnimationFrame(() => character.current?.appear());
          }
        }, b.at),
      );
    }
  }, [reduced]);

  useEffect(() => {
    play();
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, [play]);

  const poke = () => {
    if (!shown || beat.at < 7600) return;
    setQuip(QUIPS[Math.floor(Math.random() * QUIPS.length)]!);
    setBeat((b) => ({ ...b, mood: "speaking" }));
    timers.current.push(window.setTimeout(() => setBeat((b) => ({ ...b, mood: "idle" })), 2200));
  };

  const say = quip ?? beat.say;

  return (
    <div
      id="mm-hero-stage"
      className="relative mx-auto aspect-[4/5] w-full max-w-[26rem] select-none sm:aspect-[5/6]"
    >
      {/* warm backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[32px] border"
        style={{
          borderColor: MM.border,
          background:
            "radial-gradient(120% 80% at 50% 70%, rgba(242,138,46,0.22) 0%, rgba(30,24,20,0.0) 60%), linear-gradient(180deg, #221c18 0%, #15120f 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-[32px] opacity-[0.07]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, #ffb46b 0 1px, transparent 1px 4px)",
        }}
      />

      {/* the time door */}
      <AnimatePresence>
        {beat.door ? (
          <motion.div
            key="door"
            aria-hidden
            className="absolute left-1/2 top-[56%] h-[62%] w-[56%] -translate-x-1/2 -translate-y-1/2"
            initial={{ scaleY: 0.02, scaleX: 0.15, opacity: 0 }}
            animate={{ scaleY: 1, scaleX: 1, opacity: 1 }}
            exit={{ scaleY: 0.02, scaleX: 0.3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 16 }}
          >
            <div
              className="absolute inset-0 rounded-[50%]"
              style={{
                background:
                  "radial-gradient(closest-side, #0e0a07 0%, #2a1408 55%, rgba(255,140,40,0.55) 86%, rgba(255,200,120,0.9) 96%, transparent 100%)",
                boxShadow:
                  "0 0 60px 10px rgba(255,140,40,0.45), inset 0 0 40px rgba(255,170,90,0.5)",
              }}
            />
            <motion.div
              className="absolute inset-[6%] rounded-[50%] opacity-60 mix-blend-screen"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent, rgba(255,170,80,0.5), transparent 30%, rgba(255,120,30,0.4), transparent 60%, rgba(255,210,150,0.4), transparent)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            />
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-[50%] border-2"
                style={{ borderColor: i === 0 ? "#ffc56b" : "#ff9a3c" }}
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.55, opacity: 0 }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* her */}
      <div className="absolute inset-x-[12%] bottom-[5%] top-[24%]">
        {shown ? (
          <Character
            handle={character}
            mood={beat.mood}
            animate={!reduced}
            onPress={poke}
            className="h-full w-full drop-shadow-[0_20px_40px_rgba(255,120,30,0.25)]"
          />
        ) : null}
      </div>

      {/* speech */}
      <div className="absolute inset-x-5 top-5" aria-live="polite">
        <AnimatePresence mode="wait">
          {say ? (
            <motion.div
              key={say}
              initial={{ opacity: 0, y: 10, scale: 0.94, rotate: -1.5 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
              className="relative rounded-2xl border px-4 py-3"
              style={{
                background: "rgba(43,36,32,0.92)",
                borderColor: "rgba(255,255,255,0.12)",
                color: MM.text,
              }}
            >
              <p
                className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em]"
                style={{ color: MM.amber }}
              >
                <span className="h-1 w-1 rounded-full" style={{ background: MM.amber }} />
                Miss Minutes
              </p>
              <p className="mt-1.5 text-[15px] font-semibold leading-snug">{say}</p>
              <span
                aria-hidden
                className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r"
                style={{ background: "#2b2420", borderColor: "rgba(255,255,255,0.12)" }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {!reduced ? (
        <button
          type="button"
          onClick={play}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors hover:bg-white/5"
          style={{ borderColor: "rgba(255,255,255,0.14)", color: MM.muted }}
        >
          <RotateCcw className="h-3 w-3" /> Replay
        </button>
      ) : null}
    </div>
  );
}
