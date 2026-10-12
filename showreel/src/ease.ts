import { Easing, interpolate } from "remotion";

// The site's motion curve: cubic-bezier(0.16, 1, 0.3, 1).
export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);
export const inQuint = Easing.bezier(0.64, 0, 0.78, 0);

/** 0→1 over [start, start+dur] with the site's ease. Clamped both sides. */
export const prog = (frame: number, start: number, dur: number, ease = outExpo) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
