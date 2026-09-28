import { useEffect } from "react";
import { useTheme } from "@/lib/os/theme";

/**
 * ============================================================================
 * THE FUN EFFECTS RUNTIME
 * ============================================================================
 *
 * Three of the Settings toggles need JavaScript rather than a CSS class. This
 * mounts once at the root and does nothing at all until one of them is on.
 *
 * Everything is written directly to the DOM — no state, no re-renders. A
 * cursor trail that re-rendered the app on every pointermove would be a
 * genuinely impressive way to make a site unusable.
 *
 * Reduced motion switches the two animated ones off entirely. Someone who has
 * asked their operating system for less movement did not mean "unless it is
 * funny".
 */

const CONFETTI_COLOURS = [
  "var(--hog-red)",
  "var(--hog-yellow)",
  "var(--hog-blue)",
  "var(--hog-green)",
  "var(--hog-purple)",
];

/** What the interface actually means, according to the interface. */
const HONEST: Record<string, string> = {
  "Hire me": "Please",
  "Get in touch": "Please",
  "View project": "Read a thing I wrote about a thing I made",
  "All projects": "The whole pile",
  "Read more": "There is more",
  "Learn more": "There is more",
  "Download résumé": "A PDF that took four days to typeset",
  Submit: "Commit to this",
  Save: "Trust me with it",
  Cancel: "Escape",
  Play: "Waste eight minutes",
  Listen: "Waste eight minutes with headphones on",
  Settings: "Break things safely",
  Reset: "Undo everything, including the good bits",
};

export function FunFx() {
  const { flags } = useTheme();
  const trail = Boolean(flags.trail);
  const confetti = Boolean(flags.confetti);
  const honest = Boolean(flags.honest);

  /* ---- Cursor comet ---------------------------------------------------- */
  useEffect(() => {
    if (!trail) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = document.createElement("div");
    dot.className = "cursor-comet";
    document.body.appendChild(dot);

    // Eased toward the pointer rather than pinned to it: a dot exactly under
    // the cursor is invisible, and the lag is the entire effect.
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const tick = () => {
      x += (targetX - x) * 0.18;
      y += (targetY - y) * 0.18;
      dot.style.transform = `translate3d(${x - 7}px, ${y - 7}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      dot.remove();
    };
  }, [trail]);

  /* ---- Applause -------------------------------------------------------- */
  useEffect(() => {
    if (!confetti) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onClick = (event: MouseEvent) => {
      const pieces = 14;
      for (let i = 0; i < pieces; i++) {
        const bit = document.createElement("span");
        bit.className = "confetto";
        bit.style.left = `${event.clientX}px`;
        bit.style.top = `${event.clientY}px`;
        bit.style.background = CONFETTI_COLOURS[i % CONFETTI_COLOURS.length]!;
        const angle = (i / pieces) * Math.PI * 2 + Math.random();
        const distance = 40 + Math.random() * 90;
        bit.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
        // Biased downward, because confetti falls.
        bit.style.setProperty("--dy", `${Math.sin(angle) * distance + 90}px`);
        bit.style.setProperty("--dr", `${Math.random() * 720 - 360}deg`);
        document.body.appendChild(bit);
        // Matches the animation length in styles.css. An animationend listener
        // would be tidier but never fires if the tab is backgrounded mid-flight,
        // and the leak is unbounded.
        window.setTimeout(() => bit.remove(), 1200);
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [confetti]);

  /* ---- Honest labels ---------------------------------------------------
   * Rewrites the text of buttons and links whose label is in the table, and
   * puts it back on the way out. The original is parked on the element so a
   * re-render between switching on and off cannot lose it.
   * -------------------------------------------------------------------- */
  useEffect(() => {
    if (!honest) return;

    const touched = new Set<HTMLElement>();

    const rewrite = () => {
      const nodes = document.querySelectorAll<HTMLElement>("a, button");
      for (const node of nodes) {
        const label = node.textContent?.trim();
        if (!label) continue;
        const replacement = HONEST[label];
        if (!replacement) continue;
        if (node.dataset["honestOriginal"] !== undefined) continue;
        node.dataset["honestOriginal"] = label;
        node.textContent = replacement;
        touched.add(node);
      }
    };

    rewrite();
    // Route changes swap the whole page out, so the pass has to run again on
    // whatever arrives.
    const observer = new MutationObserver(rewrite);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      for (const node of touched) {
        const original = node.dataset["honestOriginal"];
        if (original !== undefined) {
          node.textContent = original;
          delete node.dataset["honestOriginal"];
        }
      }
    };
  }, [honest]);

  return null;
}
