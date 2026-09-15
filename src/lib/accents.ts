/**
 * The brand accent rotation.
 *
 * Grids of cards cycle through these so a row never reads as monotone. Kept in
 * its own module rather than alongside a component: exporting a helper from a
 * component file breaks React Fast Refresh for that file.
 */
export const ACCENTS = ["hog-red", "hog-blue", "hog-yellow", "hog-green", "hog-purple"] as const;

export type Accent = (typeof ACCENTS)[number];

export function accentFor(index: number): Accent {
  return ACCENTS[index % ACCENTS.length]!;
}

/**
 * Decorative use — a colour bar, a dot, a squiggle, a marker. Nothing sits on
 * top of it, so the brightest version of the colour is the right one.
 */
export function accentVar(accent: string): string {
  return `var(--${accent})`;
}

/**
 * Filled use — a swatch, icon tile or badge that carries text or an icon.
 *
 * The bright brand colours do not all clear 4.5:1 against white: red manages
 * only 3.4:1, yellow 2.1:1, green 2.5:1. So a filled surface gets a slightly
 * deeper red, and each accent is paired with whichever foreground actually
 * passes on it — white for the dark accents, ink for the light ones.
 */
const SURFACE: Record<Accent, { background: string; color: string }> = {
  // 4.6:1 on white
  "hog-red": { background: "var(--hog-red-deep)", color: "oklch(0.99 0 0)" },
  // 5.9:1 on white
  "hog-blue": { background: "var(--hog-blue)", color: "oklch(0.99 0 0)" },
  // 5.1:1 on white
  "hog-purple": { background: "var(--hog-purple)", color: "oklch(0.99 0 0)" },
  // 7.6:1 on ink
  "hog-yellow": { background: "var(--hog-yellow)", color: "var(--ink)" },
  // 6.3:1 on ink
  "hog-green": { background: "var(--hog-green)", color: "var(--ink)" },
};

export function accentSurface(accent: string): { background: string; color: string } {
  return SURFACE[accent as Accent] ?? SURFACE["hog-red"];
}
