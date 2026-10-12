import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Play, Volume2 } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const SRC_1080 = "/media/showreel/showreel-1080p.mp4";
const SRC_720 = "/media/showreel/showreel-720p.mp4";
const POSTER = "/media/showreel/showreel-poster.jpg";

/**
 * The showreel: 75 seconds of the work, cut to its own score. Nothing is
 * fetched until someone presses play (preload="none"), and it plays with
 * sound on that click, since the sound design is half of it.
 */
export function Showreel() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  const start = () => {
    setPlaying(true);
    const v = videoRef.current;
    if (v) {
      v.muted = false;
      void v.play();
    }
  };

  return (
    <section id="showreel" data-act="noir" className="act-noir relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-6 sm:px-8 sm:pb-32">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--hog-red)]">
              Showreel · 2026
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Five products, one research model, seventy-five seconds.
            </h2>
          </div>
          <p className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <Volume2 className="h-3.5 w-3.5" aria-hidden />
            Best with sound
          </p>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.94, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ duration: 1.1, ease: EASE }}
          className="overflow-hidden rounded-3xl border border-border bg-[#14161b]"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[11px] text-white/60">
            <span>showreel-2026.mp4</span>
            <span className="hidden sm:inline">1:15 · 1080p60 · original score</span>
          </div>
          <div className="relative aspect-video w-full bg-black">
            <video
              ref={videoRef}
              poster={POSTER}
              preload="none"
              playsInline
              controls={playing}
              onEnded={() => setPlaying(false)}
              className="absolute inset-0 h-full w-full object-contain"
              aria-label="Showreel: Srinivas M's projects, 75 seconds"
            >
              <source src={SRC_720} type="video/mp4" media="(max-width: 767px)" />
              <source src={SRC_1080} type="video/mp4" />
            </video>
            {!playing ? (
              <button
                type="button"
                onClick={start}
                data-cursor="Play"
                className="group absolute inset-0 grid place-items-center bg-black/35 transition-colors duration-500 hover:bg-black/20"
                aria-label="Play the showreel with sound"
              >
                <span className="relative grid h-20 w-20 place-items-center rounded-full bg-[#f08a3c] text-[#14161b] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 sm:h-24 sm:w-24">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#f08a3c]/40 [animation-duration:2.4s]" />
                  <Play className="relative ml-1 h-8 w-8 fill-current" />
                </span>
              </button>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
