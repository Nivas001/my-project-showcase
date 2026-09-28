/**
 * One timeline drives both the camera (in the WebGL scene) and the page around
 * it (the frame the scene is cut into, and which chapter's words are showing),
 * so the two can never drift apart.
 *
 * Scroll progress 0→1 is split into one slice per chapter. Each slice holds
 * still for its first part — reading time — then eases into the next.
 */

export const CHAPTER_COUNT = 7;
const HOLD = 0.42;

export function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Which chapter we are in, and how far through the move to the next one. */
export function locate(progress: number) {
  const t = Math.min(0.99999, Math.max(0, progress)) * CHAPTER_COUNT;
  const index = Math.floor(t);
  const local = t - index;
  const move =
    index >= CHAPTER_COUNT - 1 ? 0 : local < HOLD ? 0 : ease((local - HOLD) / (1 - HOLD));
  return { index, local, move };
}

/** The chapter whose words should be on screen, or -1 mid-move. */
export function shownChapter(progress: number) {
  const { index, local } = locate(progress);
  if (index >= CHAPTER_COUNT - 1) return index;
  if (local < HOLD + 0.12) return index;
  if (local > 0.9) return index + 1;
  return -1;
}

/** Frame insets as fractions of the viewport: [top, right, bottom, left]. */
type Insets = [number, number, number, number];

const DESKTOP: Insets[] = [
  [0.33, 0.02, 0.03, 0.02],
  [0.1, 0.4, 0.03, 0.02],
  [0.1, 0.02, 0.03, 0.4],
  [0.1, 0.4, 0.03, 0.02],
  [0.1, 0.02, 0.03, 0.4],
  [0.1, 0.02, 0.24, 0.02],
  [0.1, 0.02, 0.24, 0.02],
];

const MOBILE: Insets[] = [
  [0.4, 0.03, 0.03, 0.03],
  [0.09, 0.03, 0.4, 0.03],
  [0.09, 0.03, 0.4, 0.03],
  [0.09, 0.03, 0.4, 0.03],
  [0.09, 0.03, 0.4, 0.03],
  [0.09, 0.03, 0.4, 0.03],
  [0.09, 0.03, 0.4, 0.03],
];

export function insetsAt(progress: number, mobile: boolean): Insets {
  const table = mobile ? MOBILE : DESKTOP;
  const { index, move } = locate(progress);
  const a = table[index]!;
  const b = table[Math.min(index + 1, table.length - 1)]!;
  return a.map((v, i) => v + (b[i]! - v) * move) as Insets;
}

/** Where the words sit for a chapter, relative to the frame. */
export function textSide(index: number, mobile: boolean): "top" | "right" | "left" | "bottom" {
  if (index === 0) return "top";
  if (mobile || index >= 5) return "bottom";
  return index % 2 === 1 ? "right" : "left";
}
