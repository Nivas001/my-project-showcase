import { Link } from "@tanstack/react-router";
import { ArrowRight, Rocket } from "lucide-react";

/**
 * The big game does not fit in the cabinet: it is full-screen, has its own
 * HUD and wants both hands on a phone. So instead of a cartridge it gets a
 * poster above the cabinet that launches it on its own page.
 */
export function FeaturedSim() {
  return (
    <Link
      to="/play/ship-it"
      data-cursor="Play"
      className="group relative block overflow-hidden rounded-xl border-2 border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-hog-red hover:shadow-[0_0_48px_-14px_var(--hog-red)]"
    >
      <div className="grid md:grid-cols-[1.4fr_1fr]">
        <div className="relative aspect-[16/9] overflow-hidden md:aspect-auto md:min-h-[320px]">
          <img
            src="/media/arcade/ship-it.jpg"
            alt="Ship It Inc.: a low-poly garage office with design and frontend desks, a server rack with a launch pad, and clients queueing at reception"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/25" />
          <span className="absolute left-3 top-3 rounded-md bg-hog-red-deep px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white shadow">
            New · 3D sim
          </span>
        </div>

        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Featured cabinet
          </p>
          <h2 className="font-display text-[clamp(2rem,4vw,2.75rem)] font-extrabold leading-[0.95] tracking-tight text-foreground">
            Ship It Inc.
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Run a dev agency out of a garage. Carry client briefs from desk to desk, launch finished
            sites by rocket, and spend what they pay on upgrades. A full-screen 3D tycoon game,
            built entirely from code: no model files, no sound files.
          </p>
          <ul className="flex flex-wrap gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {["Low-poly 3D", "Phone + desktop", "Synth sound"].map((t) => (
              <li key={t} className="rounded-sm border border-border px-2 py-1">
                {t}
              </li>
            ))}
          </ul>
          <span className="mt-1 inline-flex w-fit items-center gap-2 rounded-md bg-hog-red-deep px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-white">
            <Rocket className="h-4 w-4" />
            Launch game
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
