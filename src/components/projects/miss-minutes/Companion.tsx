import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { Character, type CharacterHandle, type Mood } from "./Character";
import { QUIPS, SECTION_LINES } from "./data";
import { MM } from "./theme";

/**
 * Once the title card scrolls away, a small Miss Minutes steps out of a time
 * door in the corner and keeps you company down the page, with a line for
 * each section you reach. Like her desktop overlay, she parks bottom-right and
 * stays out of the way; one tap on × and she waves goodbye for the visit.
 */
export function MissMinutesCompanion() {
  const reduced = useReducedMotion();
  const character = useRef<CharacterHandle>(null);
  const [heroGone, setHeroGone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [mood, setMood] = useState<Mood>("idle");
  const [say, setSay] = useState<string | null>(null);
  const section = useRef("");
  const hush = useRef<number>(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("mm-companion") === "bye") setDismissed(true);
    } catch {
      /* storage blocked: she just shows up again */
    }
  }, []);

  // Visible once the hero stage is out of view.
  useEffect(() => {
    const stage = document.getElementById("mm-hero-stage");
    if (!stage) return;
    const io = new IntersectionObserver(([entry]) => setHeroGone(!entry!.isIntersecting), {
      threshold: 0,
    });
    io.observe(stage);
    return () => io.disconnect();
  }, []);

  const show = (line: string, m: Mood, ms = 4200) => {
    window.clearTimeout(hush.current);
    setSay(line);
    setMood(m);
    if (m === "acting") character.current?.hop();
    hush.current = window.setTimeout(() => {
      setSay(null);
      setMood("idle");
    }, ms);
  };

  // React to the section under the reading line.
  useEffect(() => {
    if (!heroGone || dismissed) return;
    const ids = Object.keys(SECTION_LINES).filter((id) => document.getElementById(id));
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      if (current && current !== section.current) {
        section.current = current;
        const entry = SECTION_LINES[current]!;
        show(entry.line, entry.mood);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [heroGone, dismissed]);

  useEffect(() => () => window.clearTimeout(hush.current), []);

  const bye = () => {
    window.clearTimeout(hush.current);
    setSay("Bye now! Come back anytime.");
    setMood("acting");
    character.current?.hop();
    setLeaving(true);
    window.setTimeout(() => {
      setDismissed(true);
      try {
        sessionStorage.setItem("mm-companion", "bye");
      } catch {
        /* fine */
      }
    }, 1500);
  };

  const visible = heroGone && !dismissed;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="companion"
          className="pointer-events-none fixed bottom-3 right-3 z-50 flex items-end gap-1 sm:bottom-5 sm:right-5"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.2, y: 40, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.1, y: 30, rotate: 18 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          style={{ transformOrigin: "bottom right" }}
          onAnimationComplete={() => {
            if (!leaving && !reduced) character.current?.appear();
          }}
        >
          <AnimatePresence>
            {say ? (
              <motion.p
                key={say}
                initial={{ opacity: 0, x: 12, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="pointer-events-auto mb-16 max-w-[12.5rem] rounded-2xl rounded-br-sm border px-3 py-2 text-[12.5px] font-semibold leading-snug shadow-lg sm:max-w-[15rem] sm:text-[13px]"
                style={{
                  background: "rgba(43,36,32,0.96)",
                  borderColor: MM.border,
                  color: MM.text,
                }}
                aria-live="polite"
              >
                {say}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <div className="pointer-events-auto relative">
            {/* mini time door behind her */}
            <motion.span
              aria-hidden
              className="absolute bottom-1 left-1/2 h-24 w-20 -translate-x-1/2 rounded-[50%] sm:h-28 sm:w-24"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(255,140,40,0.0) 55%, rgba(255,150,60,0.55) 85%, transparent 100%)",
              }}
              animate={
                reduced
                  ? { opacity: 0.5 }
                  : { opacity: [0.35, 0.8, 0.35], scale: [0.96, 1.04, 0.96] }
              }
              transition={{ duration: 3, repeat: Infinity }}
            />
            <Character
              handle={character}
              mood={mood}
              animate={!reduced}
              onPress={() =>
                show(QUIPS[Math.floor(Math.random() * QUIPS.length)]!, "speaking", 2600)
              }
              title="Miss Minutes, your guide"
              className="relative h-[98px] w-[86px] sm:h-[124px] sm:w-[110px]"
            />
            {!leaving ? (
              <button
                type="button"
                onClick={bye}
                aria-label="Dismiss Miss Minutes"
                className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border shadow"
                style={{ background: "#2b2420", borderColor: MM.border, color: MM.text }}
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
