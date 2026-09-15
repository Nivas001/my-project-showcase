import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type MatrixMode = "dots" | "ascii" | "photo";

/** Light to dark. Picked by luminance in ASCII mode. */
const RAMP = " .:-=+*o%#@";

/** Cells are skipped below this alpha, which is what carves out the silhouette. */
const ALPHA_FLOOR = 24;

/** Radius around the pointer that pushes cells aside and lights them up. */
const POINTER_RADIUS = 110;
const POINTER_FORCE = 26;

type Cell = {
  /** Resting position, in CSS pixels relative to the canvas. */
  hx: number;
  hy: number;
  /** Current position. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0–1 luminance of the source pixel. */
  lum: number;
  char: string;
  /** Staggers the assemble-in so the portrait resolves rather than snapping. */
  delay: number;
};

/**
 * An interactive dot-matrix rendering of a portrait.
 *
 * The image is sampled onto a grid; every opaque cell becomes a particle that
 * springs back to its resting position after the pointer shoves it away.
 * Luminance drives dot size, so the lit side of the face reads as dense and the
 * shadows as sparse — with a floor under it so the silhouette never breaks up.
 *
 * Nothing here runs on the server, the loop parks itself when the canvas is off
 * screen or the tab is hidden, and `prefers-reduced-motion` gets a static render.
 */
export function PortraitMatrix({
  src,
  mode = "dots",
  className,
  alt = "",
  onReady,
}: {
  src: string;
  mode?: MatrixMode;
  className?: string;
  alt?: string;
  onReady?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Mutable render state, deliberately outside React: this changes every frame.
  const cells = useRef<Cell[]>([]);
  const pointer = useRef({ x: -9999, y: -9999, active: false });
  const image = useRef<HTMLImageElement | null>(null);
  const modeRef = useRef<MatrixMode>(mode);
  const sizeRef = useRef({ w: 0, h: 0, cell: 12 });

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  /** Re-sample the source image onto a grid sized for the current canvas. */
  const build = useCallback(() => {
    const canvas = canvasRef.current;
    const img = image.current;
    if (!canvas || !img) return;

    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));

    // Denser on big screens, coarser on small ones — a fixed column count would
    // either shimmer on phones or look blocky on a desktop.
    const columns = Math.round(Math.min(78, Math.max(32, w / 8)));
    const cell = w / columns;
    const rows = Math.max(1, Math.floor(h / cell));
    sizeRef.current = { w, h, cell };

    // Letterbox the portrait into the grid, preserving its aspect ratio.
    const scale = Math.min((columns * cell) / img.width, (rows * cell) / img.height);
    const drawW = Math.max(1, Math.round(img.width * scale));
    const drawH = Math.max(1, Math.round(img.height * scale));
    const offsetX = (w - drawW) / 2;
    const offsetY = (h - drawH) / 2;

    // Sample at grid resolution rather than full resolution: one getImageData on
    // a tiny canvas, then a straight lookup per cell.
    const sampleW = Math.max(1, Math.round(drawW / cell));
    const sampleH = Math.max(1, Math.round(drawH / cell));
    const off = document.createElement("canvas");
    off.width = sampleW;
    off.height = sampleH;
    const octx = off.getContext("2d", { willReadFrequently: true });
    if (!octx) return;
    octx.clearRect(0, 0, sampleW, sampleH);
    octx.drawImage(img, 0, 0, sampleW, sampleH);

    let data: Uint8ClampedArray;
    try {
      data = octx.getImageData(0, 0, sampleW, sampleH).data;
    } catch {
      // Tainted canvas (the image came from another origin without CORS).
      setFailed(true);
      return;
    }

    const next: Cell[] = [];
    const cx = w / 2;
    const cy = h / 2;
    const maxDist = Math.hypot(cx, cy) || 1;

    for (let row = 0; row < sampleH; row += 1) {
      for (let col = 0; col < sampleW; col += 1) {
        const i = (row * sampleW + col) * 4;
        const a = data[i + 3]!;
        if (a < ALPHA_FLOOR) continue;

        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

        const hx = offsetX + (col + 0.5) * cell;
        const hy = offsetY + (row + 0.5) * cell;

        next.push({
          hx,
          hy,
          x: hx,
          y: hy,
          vx: 0,
          vy: 0,
          lum,
          char: RAMP[Math.min(RAMP.length - 1, Math.round(lum * (RAMP.length - 1)))]!,
          // Assemble outward from the centre.
          delay: (Math.hypot(hx - cx, hy - cy) / maxDist) * 0.45,
        });
      }
    }

    cells.current = next;
  }, []);

  // ---- Load the source image --------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (cancelled) return;
      image.current = img;
      build();
      setLoaded(true);
      onReady?.();
    };
    img.onerror = () => {
      if (!cancelled) setFailed(true);
    };
    img.src = src;
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [src, build, onReady]);

  // ---- Render loop -------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !loaded || failed) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    let visible = true;
    let start = 0;
    // Last CSS box we sized for, so a ResizeObserver callback triggered by our
    // own backing-store write does not rebuild the grid in a loop.
    let lastW = 0;
    let lastH = 0;
    let firstSizing = true;

    /** Canvas needs a concrete colour string; CSS custom properties are not one. */
    const readColours = () => {
      const styles = getComputedStyle(canvas);
      return {
        base: styles.color || "rgb(250,250,250)",
        hot: styles.getPropertyValue("--matrix-hot").trim() || "rgb(245,78,0)",
      };
    };
    let colours = readColours();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      colours = readColours();
      build();

      // Play the assemble once, on arrival. A later resize re-homes the cells
      // but should not replay the whole introduction.
      if (firstSizing) {
        firstSizing = false;
        start = 0;
      } else {
        start = performance.now() - 5000;
      }
    };

    resize();

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (!visible) return;
      if (!start) start = now;

      const elapsed = (now - start) / 1000;
      const { w, h, cell } = sizeRef.current;
      const list = cells.current;
      const active = modeRef.current;
      const p = pointer.current;

      ctx.clearRect(0, 0, w, h);
      if (list.length === 0) return;

      const maxR = cell * 0.46;
      const isAscii = active === "ascii";
      if (isAscii) {
        ctx.font = `${cell * 1.08}px "JetBrains Mono", ui-monospace, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
      }

      // Two batched passes — one fill for resting cells, one for cells the
      // pointer is touching. Batching keeps a few thousand dots cheap.
      const hot: Cell[] = [];
      if (!isAscii) ctx.beginPath();
      ctx.fillStyle = colours.base;

      for (const c of list) {
        // Assemble-in: cells ease from the centre outward on first paint.
        let intro = 1;
        if (!reduced) {
          intro = Math.min(1, Math.max(0, (elapsed - c.delay) / 0.85));
          intro = 1 - Math.pow(1 - intro, 3);
          if (intro <= 0) continue;
        }

        let heat = 0;
        if (!reduced) {
          if (p.active) {
            const dx = c.x - p.x;
            const dy = c.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < POINTER_RADIUS && dist > 0.01) {
              const push = (1 - dist / POINTER_RADIUS) ** 2;
              heat = push;
              c.vx += (dx / dist) * push * POINTER_FORCE;
              c.vy += (dy / dist) * push * POINTER_FORCE;
            }
          }
          // Spring home, with enough damping that it settles rather than jitters.
          c.vx += (c.hx - c.x) * 0.12;
          c.vy += (c.hy - c.y) * 0.12;
          c.vx *= 0.76;
          c.vy *= 0.76;
          c.x += c.vx;
          c.y += c.vy;
        }

        // Luminance sets the weight; the floor keeps the silhouette continuous
        // even where the hoodie is nearly black.
        const weight = 0.2 + 0.8 * c.lum;
        const drawX = reduced ? c.hx : c.x;
        const drawY = reduced ? c.hy : c.y;

        if (heat > 0.08) {
          hot.push({ ...c, x: drawX, y: drawY, lum: weight * intro * (1 + heat) });
          continue;
        }

        if (isAscii) {
          ctx.globalAlpha = Math.min(1, 0.25 + weight * 0.85) * intro;
          ctx.fillText(c.char, drawX, drawY);
        } else {
          const r = maxR * weight * intro;
          if (r > 0.18) {
            ctx.moveTo(drawX + r, drawY);
            ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
          }
        }
      }

      if (!isAscii) {
        ctx.globalAlpha = 1;
        ctx.fill();
      }

      // Pass two: everything the pointer is currently disturbing.
      if (hot.length > 0) {
        ctx.fillStyle = colours.hot;
        if (isAscii) {
          for (const c of hot) {
            ctx.globalAlpha = Math.min(1, c.lum);
            ctx.fillText(c.char, c.x, c.y);
          }
        } else {
          ctx.globalAlpha = 1;
          ctx.beginPath();
          for (const c of hot) {
            const r = Math.min(maxR * 1.5, maxR * c.lum);
            if (r > 0.18) {
              ctx.moveTo(c.x + r, c.y);
              ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
            }
          }
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    frame = requestAnimationFrame(draw);

    // ---- Input ----
    const toLocal = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current.x = clientX - rect.left;
      pointer.current.y = clientY - rect.top;
      pointer.current.active = true;
    };
    const onPointerMove = (e: PointerEvent) => toLocal(e.clientX, e.clientY);
    const onPointerLeave = () => {
      pointer.current.active = false;
      pointer.current.x = -9999;
      pointer.current.y = -9999;
    };

    wrap.addEventListener("pointermove", onPointerMove);
    wrap.addEventListener("pointerleave", onPointerLeave);
    wrap.addEventListener("pointercancel", onPointerLeave);

    // ---- Lifecycle: never animate an invisible canvas ----
    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver((entries) => {
            visible = entries.some((entry) => entry.isIntersecting);
          })
        : null;
    observer?.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) visible = false;
      else if (observer === null) visible = true;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => resize()) : null;
    resizeObserver?.observe(canvas);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      wrap.removeEventListener("pointermove", onPointerMove);
      wrap.removeEventListener("pointerleave", onPointerLeave);
      wrap.removeEventListener("pointercancel", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      observer?.disconnect();
      resizeObserver?.disconnect();
    };
  }, [loaded, failed, build]);

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {/* The plain image, cross-faded in for "photo" mode and used as the
          fallback if the canvas can never be drawn. */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "absolute inset-0 h-full w-full object-contain transition-opacity duration-500",
          mode === "photo" || failed ? "opacity-100" : "opacity-0",
        )}
      />
      {!failed ? (
        <canvas
          ref={canvasRef}
          aria-hidden
          className={cn(
            "relative h-full w-full text-foreground transition-opacity duration-500",
            mode === "photo" ? "opacity-0" : "opacity-100",
          )}
          style={{ "--matrix-hot": "oklch(0.63 0.225 33)" } as React.CSSProperties}
        />
      ) : null}
    </div>
  );
}
