import { useEffect, useRef, useState } from "react";
import { Download, Mail, RotateCcw } from "lucide-react";
import { aboutDrafts, aboutNotes, site } from "@/lib/site";
import {
  HandNote,
  HardLink,
  Marked,
  PortraitMatrix,
  ScribbleArrow,
  SectionLabel,
  StarMark,
  StatusDot,
} from "@/components/kit";

/* ==========================================================================
 * THE ABOUT HERO
 *
 * A page being edited rather than a page being read: line numbers down the
 * gutter, the bio typing itself out one line at a time, a caret blinking on
 * the line currently being written, and handwritten notes pinned into the
 * margin as each annotated line lands.
 *
 * Three drafts of the same person sit behind a tab strip — a visitor in a
 * hurry and a visitor who wants the whole thing are different readers, and
 * one paragraph cannot serve both.
 *
 * Under prefers-reduced-motion the typing is skipped and every line (and note)
 * is present from the first frame.
 * ======================================================================== */

const LINE_MS = 520;

export function AboutHero() {
  const [draftIndex, setDraftIndex] = useState(1);
  const [typed, setTyped] = useState(0);
  const timers = useRef<number[]>([]);
  const draft = aboutDrafts[draftIndex] ?? aboutDrafts[0]!;

  // Type the selected draft out, one line per tick. Restarting cancels the
  // previous run so switching drafts quickly cannot interleave two timelines.
  useEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];

    if (reduced) {
      setTyped(draft.lines.length);
      return;
    }

    setTyped(0);
    for (let i = 1; i <= draft.lines.length; i += 1) {
      timers.current.push(window.setTimeout(() => setTyped(i), i * LINE_MS));
    }

    return () => {
      for (const id of timers.current) window.clearTimeout(id);
      timers.current = [];
    };
  }, [draft]);

  const done = typed >= draft.lines.length;

  return (
    <section data-act="noir" className="act-noir grain relative overflow-hidden">
      <div aria-hidden className="hairline-grid pointer-events-none absolute inset-0 opacity-50" />
      <div
        aria-hidden
        className="wallpaper-drift pointer-events-none absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle, var(--signature) 0%, transparent 70%)",
          opacity: 0.14,
        }}
      />
      <div
        aria-hidden
        className="wallpaper-drift pointer-events-none absolute -right-28 bottom-0 h-[26rem] w-[26rem] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle, var(--hog-blue) 0%, transparent 70%)",
          opacity: 0.12,
          animationDelay: "-9s",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
        <SectionLabel index="01" className="max-w-sm">
          About — {site.fullName}
        </SectionLabel>

        <h1 className="hero-xl mt-6 text-foreground">
          <span className="line-mask">
            <span
              className="line-rise block"
              style={{ "--line-delay": "100ms" } as React.CSSProperties}
            >
              The <span className="signature-name">long</span>
            </span>
          </span>
          {/* No mask on this line: the circle overshoots its box on purpose. */}
          <span
            className="fade-rise block"
            style={{ "--line-delay": "260ms" } as React.CSSProperties}
          >
            <Marked kind="oval" tone="hog-red" delay={1100} duration={950} immediate>
              version
            </Marked>
            <span className="text-hog-red">.</span>
          </span>
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          {/* ---- The document being edited ---- */}
          <div className="min-w-0">
            <div
              className="fade-rise flex flex-wrap items-center gap-1.5"
              style={{ "--line-delay": "420ms" } as React.CSSProperties}
              role="tablist"
              aria-label="Which version of the bio"
            >
              <span className="micro mr-1 text-muted-foreground">Read</span>
              {aboutDrafts.map((item, i) => {
                const on = i === draftIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setDraftIndex(i)}
                    className={`rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 ${
                      on
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/70 text-muted-foreground hover:border-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div
              className="fade-rise relative mt-4 rounded-lg border border-border bg-card/55 backdrop-blur-sm"
              style={{ "--line-delay": "480ms" } as React.CSSProperties}
            >
              {/* Editor chrome */}
              <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-2.5">
                <span className="flex items-center gap-1.5">
                  {["mac-close", "mac-min", "mac-max"].map((token) => (
                    <span
                      key={token}
                      aria-hidden
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: `var(--${token})` }}
                    />
                  ))}
                  <span className="ml-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    about-me.txt
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="sticker scale-90" style={{ transform: "rotate(-6deg)" }}>
                    {draft.stamp}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDraftIndex((v) => v)}
                    onPointerDown={() => setTyped(0)}
                    aria-label="Retype this draft"
                    title="Retype"
                    className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>

              {/* The page. The full text is in the DOM from the first frame and
                  exposed to assistive tech; only opacity is animated, so a
                  screen reader never waits for a typing effect. */}
              <div className="px-2 py-4 sm:px-3">
                <p className="sr-only">{draft.lines.map((line) => line.text).join(" ")}</p>
                <ol aria-hidden className="space-y-1.5">
                  {draft.lines.map((line, i) => {
                    const shown = i < typed;
                    const current = i === typed - 1 && !done;
                    return (
                      <li key={line.text} className="flex items-start gap-3">
                        <span className="w-6 shrink-0 select-none pt-0.5 text-right font-mono text-[10px] text-muted-foreground/45">
                          {i + 1}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span
                            className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-foreground transition-opacity duration-300 sm:text-sm"
                            style={{ opacity: shown ? 1 : 0 }}
                          >
                            {line.text}
                            {current ? (
                              <span className="caret ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.12em] bg-hog-red" />
                            ) : null}
                          </span>
                          {line.note && shown ? (
                            <HandNote tone="hog-yellow" rotate={-3} size="sm">
                              {line.note}
                            </HandNote>
                          ) : null}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Status line, like an editor's */}
              <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>
                  {Math.min(typed, draft.lines.length)} / {draft.lines.length} lines
                </span>
                <span className="flex items-center gap-2">
                  <StatusDot tone={done ? "hog-green" : "hog-yellow"} />
                  {done ? "saved" : "writing…"}
                </span>
              </div>
            </div>

            <div
              className="fade-rise mt-7 flex flex-wrap items-center gap-3"
              style={{ "--line-delay": "560ms" } as React.CSSProperties}
            >
              <HardLink href={site.resumeUrl} download variant="invert" size="md">
                <Download className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                Download résumé
              </HardLink>
              <HardLink href={`mailto:${site.email}`} variant="ghost" size="md">
                <Mail className="h-4 w-4" />
                Get in touch
              </HardLink>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                <StatusDot />
                Available for work
              </span>
            </div>
          </div>

          {/* ---- Portrait and the notes stuck around it ---- */}
          <div
            className="fade-rise relative min-w-0"
            style={{ "--line-delay": "620ms" } as React.CSSProperties}
          >
            <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
              {/* Tape corners, so the portrait reads as pinned to the page. */}
              {[
                "-left-3 -top-3 rotate-[-18deg]",
                "-right-3 -top-3 rotate-[16deg]",
                "-bottom-3 -left-3 rotate-[14deg]",
                "-bottom-3 -right-3 rotate-[-15deg]",
              ].map((place) => (
                <span
                  key={place}
                  aria-hidden
                  className={`absolute z-10 h-5 w-12 bg-foreground/15 backdrop-blur-sm ${place}`}
                />
              ))}

              <div className="rounded-sm border border-border bg-card/40 p-3">
                <PortraitMatrix
                  src="/portrait.png"
                  mode="photo"
                  alt={`Portrait of ${site.fullName}`}
                  className="h-[clamp(13rem,34vh,20rem)] w-full"
                />
                <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {site.fullName} — {site.locationShort}
                </p>
              </div>

              <span className="pointer-events-none absolute -left-6 top-1/3 hidden lg:block">
                <ScribbleArrow kind="swoop" tone="hog-blue" className="h-8 w-14" delay={1600} />
              </span>
            </div>

            {/* The notes. */}
            <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-3 lg:justify-start">
              {aboutNotes.map((note, i) => (
                <li key={note.text} className="flex items-center gap-1.5">
                  <StarMark tone={note.tone} className="h-3.5 w-3.5" delay={900 + i * 180} />
                  <HandNote tone={note.tone} rotate={note.rotate} size="sm">
                    {note.text}
                  </HandNote>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
