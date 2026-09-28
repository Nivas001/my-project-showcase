import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Play } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Where the studio's last shot lands: the centre monitor, full width, now a
 * real video. The Google Drive player is heavy, so it only loads when asked
 * for — until then this is a poster that matches the one on the 3D screen.
 */
export function VideoScreening({ src, direct }: { src: string; direct: boolean }) {
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();

  return (
    <section id="video" data-act="noir" className="act-noir relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8 sm:pb-32">
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.94, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ duration: 1.1, ease: EASE }}
          className="overflow-hidden rounded-3xl border border-border bg-[#14161b]"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[11px] text-white/60">
            <span>video-resume.mp4</span>
            <span className="hidden sm:inline">Srinivas M · in his own words</span>
          </div>
          <div className="relative aspect-video w-full">
            {playing ? (
              direct ? (
                <video
                  src={src}
                  controls
                  autoPlay
                  className="absolute inset-0 h-full w-full object-contain"
                />
              ) : (
                <iframe
                  src={src}
                  title="Video résumé from Srinivas M"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              )
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                data-cursor="Play"
                className="group absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_center,#23262e,#14161b_70%)]"
                aria-label="Play the video résumé"
              >
                <span className="flex flex-col items-center gap-6">
                  <span className="relative grid h-24 w-24 place-items-center rounded-full bg-[#f08a3c] text-[#14161b] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 sm:h-28 sm:w-28">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#f08a3c]/40 [animation-duration:2.4s]" />
                    <Play className="relative ml-1 h-9 w-9 fill-current" />
                  </span>
                  <span className="text-center">
                    <span className="block font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      Video résumé
                    </span>
                    <span className="mt-1 block text-sm text-white/60">
                      Plays from Google Drive
                    </span>
                  </span>
                </span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
