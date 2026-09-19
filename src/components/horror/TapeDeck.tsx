import { useEffect, useRef } from "react";
import type { TapeFx } from "@/lib/horror/types";

/* ==========================================================================
 * THE TAPE DECK
 *
 * Found footage, synthesised. There is no video file here and there never will
 * be: a real one would be tens of megabytes, would need a poster frame, would
 * autoplay-block on iOS, and would play the same eighty seconds every time.
 *
 * Instead the picture is generated per frame on a canvas — a handheld camera
 * walking a corridor — and the branching story drives it. When the story says
 * something is standing at the end of the hall, something is standing at the
 * end of the hall, and it is closer on the next branch because the reader chose
 * to keep walking.
 *
 * The parts that make it read as tape rather than as a demo:
 *
 *   grain         a pre-rendered noise tile, re-sampled and re-offset each
 *                 frame. Generating noise per pixel per frame costs a phone its
 *                 whole frame budget; a tile costs nothing and looks the same.
 *   chroma        the red and blue channels are drawn offset by a pixel or two.
 *                 Every consumer camcorder did this and every viewer recognises
 *                 it without being able to say what it is.
 *   tracking      a soft horizontal band that drifts down the frame, tearing
 *                 the scanlines as it passes.
 *   handheld      the camera never sits still. Perlin-ish drift on position and
 *                 a slow breath on the roll angle.
 *   the figure    rendered at a distance, always slightly too tall, never
 *                 explained. It approaches only when the story moves it.
 * ======================================================================== */

const W = 640;
const H = 360;

export type TapeState = {
  /** 0..1 — how close the figure is. 0 hides it entirely. */
  figure: number;
  /** One-shot effects, consumed by the renderer. */
  fx: TapeFx | null;
  /** 0..100, drives grain, chroma and how hard the camera shakes. */
  fear: number;
  /** Seconds of recorded time, shown in the timecode. */
  seconds: number;
};

function makeNoiseTile(size = 160) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + Math.random() * 165;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function timecode(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const f = Math.floor((sec % 1) * 25);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(s)}:${p(f)}`;
}

/**
 * Which world the camera is in. A corridor story rendered on a beach (or the
 * reverse) undoes everything the rest of the presentation is doing, so a tape
 * declares its own.
 */
export type TapeScene = "corridor" | "shore";

export function TapeDeck({
  state,
  label,
  scene: sceneKind = "corridor",
  className,
}: {
  state: React.RefObject<TapeState>;
  label: string;
  scene?: TapeScene;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HTMLCanvasElement | null>(null);
  const noiseRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // The scene is composed on an offscreen canvas, then stamped onto the
    // visible one three times with channel offsets. Doing the chroma split on
    // the final image is what keeps it cheap.
    if (!sceneRef.current) {
      const s = document.createElement("canvas");
      s.width = W;
      s.height = H;
      sceneRef.current = s;
    }
    if (!noiseRef.current) noiseRef.current = makeNoiseTile();

    const scene = sceneRef.current;
    const sctx = scene.getContext("2d")!;
    const noise = noiseRef.current;

    // One-shot effects need a lifetime; the story sets `fx` and the renderer
    // owns how long it lasts.
    let fxKind: TapeFx | null = null;
    let fxUntil = 0;
    let tracking = Math.random() * H;
    let t0 = performance.now();

    const drawScene = (now: number, s: TapeState) => {
      const time = (now - t0) / 1000;
      const fear = s.fear / 100;

      // Handheld drift: two sine pairs at incommensurable rates never repeat in
      // a way the eye can lock on to.
      const bobX = Math.sin(time * 1.13) * 4 + Math.sin(time * 0.37) * 7;
      const bobY = Math.cos(time * 0.91) * 3 + Math.sin(time * 0.23) * 5;
      const roll = Math.sin(time * 0.41) * 0.012 + (fear > 0.6 ? (Math.random() - 0.5) * 0.02 : 0);
      const panic = fxKind === "approach" || fear > 0.75 ? (Math.random() - 0.5) * 6 * fear : 0;

      const cx = W / 2 + bobX + panic;
      const cy = H / 2 + bobY;

      sctx.setTransform(1, 0, 0, 1, 0, 0);
      sctx.fillStyle = "#07070a";
      sctx.fillRect(0, 0, W, H);

      sctx.save();
      sctx.translate(W / 2, H / 2);
      sctx.rotate(roll);
      sctx.translate(-W / 2, -H / 2);

      /* ---- The world ---- */

      if (sceneKind === "shore") {
        /* Night beach. Three bands: sky, sea, wet sand — with the only light in
         * the frame coming off the water, because on a real unlit beach the sea
         * is the brightest thing there is and everything else is a silhouette.
         */
        const horizon = cy - 18;
        const seaDepth = H - horizon;
        const breakY = horizon + seaDepth * 0.72;

        // Sky.
        const sky = sctx.createLinearGradient(0, -40, 0, horizon);
        sky.addColorStop(0, "#040408");
        sky.addColorStop(1, "#11141d");
        sctx.fillStyle = sky;
        sctx.fillRect(-40, -40, W + 80, horizon + 40);

        // The moon, off to one side and behind haze. Everything else in this
        // frame is read against it: without one bright thing the whole scene is
        // an unreadable smear of near-black.
        const moonX = W * 0.68;
        const moonY = horizon - 74;
        const glow = sctx.createRadialGradient(moonX, moonY, 2, moonX, moonY, 150);
        glow.addColorStop(0, "rgba(226,232,240,0.5)");
        glow.addColorStop(0.18, "rgba(186,200,220,0.16)");
        glow.addColorStop(1, "rgba(120,140,170,0)");
        sctx.fillStyle = glow;
        sctx.fillRect(moonX - 160, moonY - 160, 320, 320);
        sctx.fillStyle = "rgba(232,238,248,0.72)";
        sctx.beginPath();
        sctx.arc(moonX, moonY, 11, 0, Math.PI * 2);
        sctx.fill();

        // Sea. Bands rather than a gradient, because a flat gradient is calm
        // and this needs to be moving. Each band drifts at its own rate and
        // carries its own brightness wobble, so no two frames line up.
        const BANDS = 18;
        for (let b = 0; b < BANDS; b++) {
          const k = b / BANDS;
          const y = horizon + Math.pow(k, 1.9) * (breakY - horizon);
          const h = Math.max(1.5, Math.pow(k, 1.9) * 26 + 1.5);
          const drift = Math.sin(time * (0.3 + k * 0.55) + b * 1.7) * (1 + k * 30);
          // Bright at the horizon (where the moon is), dark in the trough.
          const swell = 0.72 + Math.sin(time * (0.8 + k) + b * 2.1) * 0.28;
          const lum = Math.round((58 * (1 - k * 0.72) + 8) * swell);
          sctx.fillStyle = `rgb(${lum},${lum + 5},${lum + 14})`;
          sctx.fillRect(-40 + drift, y, W + 80, h);
        }

        // Moon path: a column of broken reflection running from the moon down
        // the water toward the camera. The single strongest cue that this is
        // a sea and not a stack of grey rectangles.
        for (let i = 0; i < 26; i++) {
          const k = i / 26;
          const y = horizon + Math.pow(k, 1.9) * (breakY - horizon);
          const spread = 8 + k * 88;
          const wob = Math.sin(time * 2.1 + i * 1.9) * (3 + k * 16);
          sctx.fillStyle = `rgba(214,226,242,${0.2 * (1 - k * 0.7) * (0.5 + Math.abs(Math.sin(time * 1.4 + i)) * 0.5)})`;
          sctx.fillRect(moonX - spread / 2 + wob, y, spread, Math.max(1, k * 5 + 1));
        }

        // The break. Two lines of foam sweeping up the sand and back.
        const surf = Math.sin(time * 0.42) * 10;
        const surf2 = Math.sin(time * 0.42 - 0.9) * 10;
        sctx.fillStyle = "rgba(206,220,236,0.3)";
        sctx.fillRect(-40, breakY + surf, W + 80, 3);
        sctx.fillStyle = "rgba(206,220,236,0.14)";
        sctx.fillRect(-40, breakY + surf2 - 9, W + 80, 2);

        // Wet sand. A sheen where the last wave reached, dry and black nearer
        // the camera.
        const sand = sctx.createLinearGradient(0, breakY, 0, H);
        sand.addColorStop(0, "#22232b");
        sand.addColorStop(0.18, "#16171d");
        sand.addColorStop(1, "#07070a");
        sctx.fillStyle = sand;
        sctx.fillRect(-40, breakY + surf, W + 80, H - breakY + 40);

        sctx.fillStyle = "rgba(190,206,226,0.05)";
        sctx.fillRect(moonX - 80, breakY + surf, 160, 26);
      } else {
      /* ---- Corridor, in one-point perspective ----
       *
       * Built from surfaces, not lines. An earlier pass drew the rungs as
       * wireframe rectangles with four corner lines through the middle, and the
       * result read as a tunnel in a 1983 vector game rather than a hallway.
       *
       * Each pair of adjacent rungs encloses one segment of corridor: four
       * trapezoids (left wall, right wall, ceiling, floor). They are filled
       * back-to-front so the near ones occlude, and the fill brightness falls
       * off with depth, which is what actually creates the sense of distance.
       */
      const RUNGS = 15;
      const WALL_W = 34;
      const WALL_H = 22;
      const walk = (time * 0.4) % 1;

      // Depth of rung i, as a fraction: 0 at the camera, 1 at the far end.
      const depthAt = (i: number) => (i - walk) / RUNGS;
      const rect = (k: number) => ({
        hw: (WALL_W / k) * 1,
        hh: (WALL_H / k) * 1,
      });

      for (let i = RUNGS - 1; i >= 1; i--) {
        const kFar = depthAt(i + 1);
        const kNear = depthAt(i);
        if (kNear <= 0.045) continue;

        const far = rect(kFar);
        const near = rect(kNear);

        // Brightness by depth, with a gentle alternation so successive segments
        // are distinguishable and movement through them is legible.
        const lit = Math.max(0, 1 - kNear) ** 1.6;
        const band = i % 2 === 0 ? 1 : 0.86;

        const quad = (pts: [number, number][], fill: string) => {
          sctx.beginPath();
          sctx.moveTo(pts[0]![0], pts[0]![1]);
          for (let p = 1; p < pts.length; p++) sctx.lineTo(pts[p]![0], pts[p]![1]);
          sctx.closePath();
          sctx.fillStyle = fill;
          sctx.fill();
        };

        // Walls catch the camera light most; ceiling is darkest, floor sits
        // between the two. Those three values are the whole lighting model.
        const wall = `rgba(${Math.round(96 * lit * band)},${Math.round(101 * lit * band)},${Math.round(112 * lit * band)},1)`;
        const ceil = `rgba(${Math.round(44 * lit)},${Math.round(46 * lit)},${Math.round(54 * lit)},1)`;
        const floor = `rgba(${Math.round(68 * lit)},${Math.round(66 * lit)},${Math.round(70 * lit)},1)`;

        // left wall
        quad(
          [
            [cx - near.hw, cy - near.hh],
            [cx - far.hw, cy - far.hh],
            [cx - far.hw, cy + far.hh],
            [cx - near.hw, cy + near.hh],
          ],
          wall,
        );
        // right wall
        quad(
          [
            [cx + near.hw, cy - near.hh],
            [cx + far.hw, cy - far.hh],
            [cx + far.hw, cy + far.hh],
            [cx + near.hw, cy + near.hh],
          ],
          wall,
        );
        // ceiling
        quad(
          [
            [cx - near.hw, cy - near.hh],
            [cx - far.hw, cy - far.hh],
            [cx + far.hw, cy - far.hh],
            [cx + near.hw, cy - near.hh],
          ],
          ceil,
        );
        // floor
        quad(
          [
            [cx - near.hw, cy + near.hh],
            [cx - far.hw, cy + far.hh],
            [cx + far.hw, cy + far.hh],
            [cx + near.hw, cy + near.hh],
          ],
          floor,
        );

        // Seam between segments — a skirting line that sells the scale.
        sctx.strokeStyle = `rgba(190,196,208,${0.16 * lit})`;
        sctx.lineWidth = 1;
        sctx.strokeRect(cx - far.hw, cy - far.hh, far.hw * 2, far.hh * 2);

        // Doorways, every third segment, alternating sides.
        if (i % 3 === 0) {
          const side = (i / 3) % 2 === 0 ? -1 : 1;
          const dTop = cy - far.hh * 0.42;
          const dBot = cy + far.hh * 0.92;
          const nTop = cy - near.hh * 0.42;
          const nBot = cy + near.hh * 0.92;
          quad(
            [
              [cx + side * near.hw, nTop],
              [cx + side * far.hw, dTop],
              [cx + side * far.hw, dBot],
              [cx + side * near.hw, nBot],
            ],
            `rgba(0,0,0,${0.55 + 0.4 * lit})`,
          );
        }

        // A strip light in the ceiling every fourth segment: the only source of
        // light in the scene that is not the camera.
        if (i % 4 === 0) {
          quad(
            [
              [cx - near.hw * 0.16, cy - near.hh],
              [cx - far.hw * 0.16, cy - far.hh],
              [cx + far.hw * 0.16, cy - far.hh],
              [cx + near.hw * 0.16, cy - near.hh],
            ],
            `rgba(210,218,232,${0.1 * lit})`,
          );
        }
      }
      }

      /* ---- The figure ---- */

      if (s.figure > 0.01) {
        // `figure` 0..1 is how close it is. In the corridor that maps to the
        // perspective depth; on the shore it maps to a point between the
        // horizon and the surf line, and the water hides its legs.
        let height: number;
        let footY: number;
        if (sceneKind === "shore") {
          const horizon = cy - 18;
          const breakY = horizon + (H - horizon) * 0.72;
          const t = Math.pow(s.figure, 0.8);
          footY = horizon + (breakY - horizon) * t + 6;
          height = 12 + t * 210;
        } else {
          const depth = 0.72 - s.figure * 0.66;
          const inv = 1 / Math.max(0.06, depth);
          height = 26 * inv;
          footY = cy + 22 * inv * 0.98;
        }
        const width = height * 0.26;
        const sway = Math.sin(time * 0.9) * width * 0.06;

        sctx.fillStyle = "#000";
        sctx.globalAlpha = Math.min(1, 0.35 + s.figure);
        // Body: a tapering column. Deliberately too tall for the doorway rungs.
        sctx.beginPath();
        sctx.moveTo(cx - width * 0.5 + sway, footY);
        sctx.lineTo(cx - width * 0.34 + sway, footY - height * 0.82);
        sctx.lineTo(cx + sway, footY - height);
        sctx.lineTo(cx + width * 0.34 + sway, footY - height * 0.82);
        sctx.lineTo(cx + width * 0.5 + sway, footY);
        sctx.closePath();
        sctx.fill();
        // Head.
        sctx.beginPath();
        sctx.ellipse(cx + sway, footY - height * 0.95, width * 0.3, width * 0.36, 0, 0, Math.PI * 2);
        sctx.fill();
        sctx.globalAlpha = 1;

        // Close up, two points of reflected light where eyes would be.
        if (s.figure > 0.55) {
          sctx.fillStyle = `rgba(215,225,235,${(s.figure - 0.55) * 1.4})`;
          const ew = width * 0.075;
          sctx.fillRect(cx + sway - width * 0.13, footY - height * 0.97, ew, ew * 0.7);
          sctx.fillRect(cx + sway + width * 0.055, footY - height * 0.97, ew, ew * 0.7);
        }
      }

      /* ---- Camera light: everything past the cone is not there ---- */

      // Indoors the torch is the only light and the falloff is brutal. On the
      // shore the moon lights the whole frame, so the same cone would black out
      // the one thing worth seeing.
      const coneInner = sceneKind === "shore" ? 0.14 : 0.35 + fear * 0.2;
      const coneOuter = sceneKind === "shore" ? 0.72 : 0.97;
      const cone = sctx.createRadialGradient(cx, cy, 10, cx, cy, W * 0.62);
      cone.addColorStop(0, "rgba(0,0,0,0)");
      cone.addColorStop(0.52, `rgba(0,0,0,${coneInner})`);
      cone.addColorStop(1, `rgba(0,0,0,${coneOuter})`);
      sctx.fillStyle = cone;
      sctx.fillRect(0, 0, W, H);

      sctx.restore();

      /* ---- One-shot effects ---- */

      if (fxKind === "face" && now < fxUntil) {
        // A single frame you were not supposed to catch. Rendered flat and
        // enormous, gone before the eye resolves it.
        sctx.save();
        sctx.globalAlpha = 0.9;
        sctx.fillStyle = "#0a0a0a";
        sctx.fillRect(0, 0, W, H);
        sctx.fillStyle = "#c9c9c4";
        sctx.beginPath();
        sctx.ellipse(W / 2, H / 2 + 14, 118, 152, 0, 0, Math.PI * 2);
        sctx.fill();
        sctx.fillStyle = "#08080a";
        sctx.beginPath();
        sctx.ellipse(W / 2 - 42, H / 2 - 18, 21, 27, 0, 0, Math.PI * 2);
        sctx.ellipse(W / 2 + 42, H / 2 - 18, 21, 27, 0, 0, Math.PI * 2);
        sctx.fill();
        sctx.beginPath();
        sctx.ellipse(W / 2, H / 2 + 76, 34, 15, 0, 0, Math.PI * 2);
        sctx.fill();
        sctx.restore();
      }

      if (fxKind === "flash" && now < fxUntil) {
        sctx.fillStyle = `rgba(255,255,255,${(fxUntil - now) / 120})`;
        sctx.fillRect(0, 0, W, H);
      }

      if (fxKind === "dark" && now < fxUntil) {
        sctx.fillStyle = `rgba(0,0,0,${Math.min(0.96, 1 - (fxUntil - now) / 2200)})`;
        sctx.fillRect(0, 0, W, H);
      }
    };

    const frame = (now: number) => {
      const s = state.current;
      if (!s) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      // Pick up a new one-shot.
      if (s.fx && s.fx !== fxKind) {
        fxKind = s.fx;
        const lifetimes: Record<TapeFx, number> = {
          static: 1400,
          glitch: 900,
          figure: 0,
          approach: 1600,
          face: 110,
          flash: 120,
          dark: 2200,
          rewind: 1400,
        };
        fxUntil = now + lifetimes[s.fx];
        s.fx = null;
      }
      if (fxKind && now > fxUntil) fxKind = null;

      const fear = s.fear / 100;
      drawScene(now, s);

      /* ---- Composite: chroma split, grain, scanlines, tracking ---- */

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      const torn = fxKind === "glitch" || fxKind === "rewind";
      const shift = 1 + fear * 1.6 + (torn ? 4 : 0);

      ctx.globalCompositeOperation = "lighter";
      // Red left, blue right, green centre — the classic tape chroma error.
      ctx.globalAlpha = 1;
      ctx.drawImage(scene, -shift, 0);
      ctx.globalAlpha = 0.85;
      ctx.drawImage(scene, 0, 0);
      ctx.globalAlpha = 0.6;
      ctx.drawImage(scene, shift, torn ? 1 : 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // Tearing: a handful of horizontal slices displaced sideways.
      if (torn) {
        for (let i = 0; i < 7; i++) {
          const y = Math.random() * H;
          const h = 4 + Math.random() * 22;
          const dx = (Math.random() - 0.5) * (fxKind === "rewind" ? 90 : 46);
          ctx.drawImage(scene, 0, y, W, h, dx, y, W, h);
        }
      }

      // Grain.
      ctx.globalAlpha = 0.1 + fear * 0.13 + (fxKind === "static" ? 0.55 : 0);
      ctx.globalCompositeOperation = "overlay";
      const nx = -Math.random() * 160;
      const ny = -Math.random() * 160;
      for (let x = nx; x < W; x += 160) {
        for (let y = ny; y < H; y += 160) ctx.drawImage(noise, x, y);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // Scanlines.
      ctx.fillStyle = "rgba(0,0,0,0.26)";
      for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

      // Tracking band.
      tracking = (tracking + 0.9 + fear * 1.4) % (H + 120);
      const band = ctx.createLinearGradient(0, tracking - 40, 0, tracking + 40);
      band.addColorStop(0, "rgba(255,255,255,0)");
      band.addColorStop(0.5, `rgba(255,255,255,${0.05 + fear * 0.05})`);
      band.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = band;
      ctx.fillRect(0, tracking - 40, W, 80);

      // Vignette.
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, W * 0.72);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.85)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      /* ---- Camcorder OSD ---- */

      ctx.font = "16px 'Special Elite', monospace";
      ctx.fillStyle = "rgba(235,235,230,0.82)";
      ctx.textBaseline = "top";

      // REC, blinking at 1Hz.
      if (Math.floor(now / 700) % 2 === 0) {
        ctx.fillStyle = "rgba(225,60,45,0.95)";
        ctx.beginPath();
        ctx.arc(30, 30, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(235,235,230,0.82)";
      ctx.fillText("REC", 44, 22);
      ctx.fillText(label, 44, H - 42);

      ctx.textAlign = "right";
      ctx.fillText(timecode(s.seconds), W - 26, 22);
      ctx.font = "13px 'Special Elite', monospace";
      ctx.fillText(fxKind === "static" ? "TRACKING" : "SP", W - 26, H - 40);
      ctx.textAlign = "left";

      // Battery, draining with fear because a dying camera is a clock.
      const bx = W - 92;
      ctx.strokeStyle = "rgba(235,235,230,0.55)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, H - 62, 40, 14);
      ctx.fillRect(bx + 40, H - 58, 3, 6);
      ctx.fillStyle = fear > 0.7 ? "rgba(225,60,45,0.85)" : "rgba(235,235,230,0.6)";
      ctx.fillRect(bx + 2, H - 60, Math.max(2, 36 * (1 - fear * 0.75)), 10);

      rafRef.current = requestAnimationFrame(frame);
    };

    t0 = performance.now();
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [state, label, sceneKind]);

  return (
    <div className={`relative overflow-hidden rounded-md border-2 border-border bg-black ${className ?? ""}`}>
      <canvas ref={canvasRef} width={W} height={H} className="block w-full" style={{ aspectRatio: `${W}/${H}` }} />
    </div>
  );
}
