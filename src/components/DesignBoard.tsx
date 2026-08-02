import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Move, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 6;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Figma-style board: every page design laid out on one zoomable, pannable canvas. */
export function DesignBoard({ images, title }: { images: string[]; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.5);
  const [offset, setOffset] = useState({ x: 40, y: 40 });
  const [dragging, setDragging] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const stateRef = useRef({ zoom, offset });
  stateRef.current = { zoom, offset };

  const zoomAt = useCallback((nextZoomRaw: number, px: number, py: number) => {
    const { zoom: current, offset: currentOffset } = stateRef.current;
    const next = clamp(nextZoomRaw, MIN_ZOOM, MAX_ZOOM);
    const k = next / current;
    setZoom(next);
    setOffset({
      x: px - (px - currentOffset.x) * k,
      y: py - (py - currentOffset.y) * k,
    });
  }, []);

  const wheelRef = useRef<(event: WheelEvent) => void>(() => {});
  wheelRef.current = (event: WheelEvent) => {
    const element = containerRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const dy = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
    const factor = Math.exp(-dy * (event.ctrlKey ? 0.01 : 0.0015));
    zoomAt(stateRef.current.zoom * factor, event.clientX - rect.left, event.clientY - rect.top);
  };

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      wheelRef.current(event);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  function zoomFromCenter(factor: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    zoomAt(stateRef.current.zoom * factor, (rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2);
  }

  function reset() {
    setZoom(0.5);
    setOffset({ x: 40, y: 40 });
  }

  const controlClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-background/85 text-muted-foreground transition-colors hover:border-primary hover:text-foreground";

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-background p-4"
          : "relative overflow-hidden rounded-md border border-border bg-surface-raised"
      }
    >
      <div
        ref={containerRef}
        onPointerDown={(event) => {
          (event.target as Element).setPointerCapture?.(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (!dragging) return;
          setOffset((current) => ({
            x: current.x + event.movementX,
            y: current.y + event.movementY,
          }));
        }}
        onPointerUp={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--border) 45%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--border) 45%, transparent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}

        className={`relative flex-1 touch-none overflow-hidden ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        } ${fullscreen ? "rounded-md border border-border" : "h-[62vh] max-h-[720px] min-h-[360px]"}`}

      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
          className="absolute left-0 top-0 flex items-start gap-10"
        >
          {images.map((src, index) => (
            <figure key={src} className="w-max">
              <img
                src={src}
                alt={`${title} design page ${index + 1}`}
                draggable={false}
                className="max-w-[1400px] rounded-md border border-border bg-card shadow-lg"
              />
              <figcaption className="mt-2 font-mono text-[13px] text-muted-foreground">
                page {String(index + 1).padStart(2, "0")}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
        <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-sm border border-border bg-background/85 px-2 py-1 font-mono text-[11px] text-muted-foreground">
          <Move className="h-3 w-3" /> drag to pan · scroll to zoom
        </span>
        <div className="pointer-events-auto flex items-center gap-1.5">
          <span className="rounded-sm border border-border bg-background/85 px-2 py-1 font-mono text-[11px] text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button type="button" onClick={() => zoomFromCenter(1 / 1.25)} className={controlClass} aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => zoomFromCenter(1.25)} className={controlClass} aria-label="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button type="button" onClick={reset} className={controlClass} aria-label="Reset view">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setFullscreen((value) => !value)}
            className={controlClass}
            aria-label={fullscreen ? "Exit full screen" : "Full screen"}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
