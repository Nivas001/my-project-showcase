import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Brush,
  Circle,
  Download,
  Droplet,
  Eraser,
  Minus,
  Redo2,
  Send,
  Space,
  Square,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { savePainting } from "@/lib/paint.functions";
import { MAX_IMAGE_CHARS, MAX_NAME, MAX_TITLE, validatePainting } from "@/lib/paint";

/**
 * ============================================================================
 * PAINT
 * ============================================================================
 *
 * A real drawing surface, not a toy: pressure-independent smoothing, a flood
 * fill that works on the actual pixel buffer, and an undo stack.
 *
 * Two things are worth knowing before changing anything here.
 *
 * The canvas is stored at a FIXED backing size (`W` x `H`) and stretched to fit
 * whatever room the window gives it. Every pointer position is mapped back into
 * that fixed space. This is what makes a drawing look identical on a laptop and
 * on a 4K monitor, and it is why the save path never has to think about device
 * pixel ratio.
 *
 * Undo is a stack of data URLs rather than ImageData. ImageData for a canvas
 * this size is 1.6MB per snapshot, and twenty of those is a tab crash; a PNG
 * data URL of a mostly-white canvas is a few kilobytes. The cost is that undo
 * is asynchronous — hence `restoring`, which blocks drawing while an image
 * decodes so a stroke cannot land on a frame that is about to be replaced.
 */

const W = 1000;
const H = 620;
const UNDO_DEPTH = 24;

type Tool = "brush" | "eraser" | "line" | "rect" | "ellipse" | "fill" | "spray";

const TOOLS: { id: Tool; label: string; Icon: typeof Brush }[] = [
  { id: "brush", label: "Brush", Icon: Brush },
  { id: "eraser", label: "Eraser", Icon: Eraser },
  { id: "line", label: "Line", Icon: Minus },
  { id: "rect", label: "Rectangle", Icon: Square },
  { id: "ellipse", label: "Ellipse", Icon: Circle },
  { id: "fill", label: "Fill", Icon: Droplet },
  { id: "spray", label: "Spray", Icon: Space },
];

/* A palette that behaves on both a white canvas and a dark UI. */
const SWATCHES = [
  "#111111",
  "#6b7280",
  "#ffffff",
  "#e11d48",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#7c2d12",
];

export function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Holds the committed picture while a shape is being dragged over it. */
  const previewRef = useRef<ImageData | null>(null);

  const [tool, setTool] = useState<Tool>("brush");
  const [colour, setColour] = useState("#111111");
  const [size, setSize] = useState(6);
  const [undo, setUndo] = useState<string[]>([]);
  const [redo, setRedo] = useState<string[]>([]);
  const [restoring, setRestoring] = useState(false);
  const [dirty, setDirty] = useState(false);

  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const strokes = useRef(0);
  const began = useRef<number>(Date.now());

  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const ctx = () => canvasRef.current?.getContext("2d", { willReadFrequently: true }) ?? null;

  /* ---- Setup: a white ground, once. ------------------------------------ */
  useEffect(() => {
    const c = ctx();
    if (!c) return;
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, W, H);
    c.lineCap = "round";
    c.lineJoin = "round";
    // The name and email are the two fields a returning visitor should never
    // have to type twice. The drawing itself is not kept — that is what the
    // wall is for.
    try {
      setName(localStorage.getItem("nivas.guest.name") ?? "");
      setEmail(localStorage.getItem("nivas.guest.email") ?? "");
    } catch {
      /* storage blocked — the fields just start empty */
    }
  }, []);

  const snapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    setUndo((stack) => [...stack.slice(-(UNDO_DEPTH - 1)), url]);
    setRedo([]);
  }, []);

  const restore = useCallback((url: string) => {
    const c = ctx();
    if (!c) return;
    setRestoring(true);
    const img = new Image();
    img.onload = () => {
      c.clearRect(0, 0, W, H);
      c.drawImage(img, 0, 0, W, H);
      setRestoring(false);
    };
    img.onerror = () => setRestoring(false);
    img.src = url;
  }, []);

  const doUndo = useCallback(() => {
    setUndo((stack) => {
      if (stack.length === 0) return stack;
      const canvas = canvasRef.current;
      if (canvas) setRedo((r) => [...r, canvas.toDataURL("image/png")]);
      const target = stack[stack.length - 1]!;
      restore(target);
      return stack.slice(0, -1);
    });
  }, [restore]);

  const doRedo = useCallback(() => {
    setRedo((stack) => {
      if (stack.length === 0) return stack;
      const canvas = canvasRef.current;
      if (canvas) setUndo((u) => [...u, canvas.toDataURL("image/png")]);
      const target = stack[stack.length - 1]!;
      restore(target);
      return stack.slice(0, -1);
    });
  }, [restore]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() !== "z") return;
      // The window closes on a bare Escape; an undo must not also bubble out
      // and take the app down with it.
      event.preventDefault();
      event.stopPropagation();
      if (event.shiftKey) doRedo();
      else doUndo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doUndo, doRedo]);

  /* ---- Pointer → canvas space ------------------------------------------ */

  const at = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H,
    };
  };

  /* ---- Flood fill -------------------------------------------------------
   * A scanline fill over the raw buffer. The tolerance matters: anti-aliased
   * brush edges mean an exact-match fill leaves a visible halo of half-tone
   * pixels around every shape it pours into.
   * --------------------------------------------------------------------- */

  const flood = (sx: number, sy: number, hex: string) => {
    const c = ctx();
    if (!c) return;
    const img = c.getImageData(0, 0, W, H);
    const px = img.data;
    const idx = (x: number, y: number) => (y * W + x) * 4;

    const x0 = Math.floor(sx);
    const y0 = Math.floor(sy);
    if (x0 < 0 || y0 < 0 || x0 >= W || y0 >= H) return;

    const base = idx(x0, y0);
    const target = [px[base]!, px[base + 1]!, px[base + 2]!, px[base + 3]!];

    const to = hexToRgb(hex);
    if (
      Math.abs(target[0]! - to[0]) < 4 &&
      Math.abs(target[1]! - to[1]) < 4 &&
      Math.abs(target[2]! - to[2]) < 4
    ) {
      return; // already that colour — a no-op fill would still cost an undo slot
    }

    const TOL = 42;
    const matches = (i: number) =>
      Math.abs(px[i]! - target[0]!) +
        Math.abs(px[i + 1]! - target[1]!) +
        Math.abs(px[i + 2]! - target[2]!) +
        Math.abs(px[i + 3]! - target[3]!) <
      TOL;

    const stack: [number, number][] = [[x0, y0]];
    while (stack.length) {
      const [x, y] = stack.pop()!;
      let left = x;
      while (left >= 0 && matches(idx(left, y))) left--;
      left++;
      let right = x;
      while (right < W && matches(idx(right, y))) right++;
      right--;

      let spanUp = false;
      let spanDown = false;
      for (let i = left; i <= right; i++) {
        const p = idx(i, y);
        px[p] = to[0];
        px[p + 1] = to[1];
        px[p + 2] = to[2];
        px[p + 3] = 255;

        if (y > 0) {
          const up = matches(idx(i, y - 1));
          if (up && !spanUp) {
            stack.push([i, y - 1]);
            spanUp = true;
          } else if (!up) spanUp = false;
        }
        if (y < H - 1) {
          const down = matches(idx(i, y + 1));
          if (down && !spanDown) {
            stack.push([i, y + 1]);
            spanDown = true;
          } else if (!down) spanDown = false;
        }
      }
    }
    c.putImageData(img, 0, 0);
  };

  /* ---- Drawing --------------------------------------------------------- */

  const onDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (restoring) return;
    const c = ctx();
    if (!c) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    snapshot();
    setDirty(true);
    strokes.current += 1;

    const p = at(event);
    start.current = p;
    last.current = p;

    if (tool === "fill") {
      flood(p.x, p.y, colour);
      return;
    }
    if (tool === "line" || tool === "rect" || tool === "ellipse") {
      previewRef.current = c.getImageData(0, 0, W, H);
      return;
    }

    drawing.current = true;
    if (tool === "spray") {
      spray(c, p.x, p.y, size, colour);
      return;
    }
    // A dot, so a single click with the brush marks the page.
    c.beginPath();
    c.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
    c.fillStyle = tool === "eraser" ? "#ffffff" : colour;
    c.fill();
  };

  const onMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ctx();
    if (!c || !start.current) return;
    const p = at(event);

    if (tool === "line" || tool === "rect" || tool === "ellipse") {
      const base = previewRef.current;
      if (!base) return;
      c.putImageData(base, 0, 0);
      c.strokeStyle = colour;
      c.lineWidth = size;
      c.beginPath();
      const s = start.current;
      if (tool === "line") {
        c.moveTo(s.x, s.y);
        c.lineTo(p.x, p.y);
      } else if (tool === "rect") {
        c.rect(s.x, s.y, p.x - s.x, p.y - s.y);
      } else {
        c.ellipse(
          (s.x + p.x) / 2,
          (s.y + p.y) / 2,
          Math.abs(p.x - s.x) / 2,
          Math.abs(p.y - s.y) / 2,
          0,
          0,
          Math.PI * 2,
        );
      }
      c.stroke();
      return;
    }

    if (!drawing.current || !last.current) return;

    if (tool === "spray") {
      spray(c, p.x, p.y, size, colour);
      last.current = p;
      return;
    }

    // A quadratic through the midpoint of the last two samples. Straight
    // segments between raw pointer samples are visibly faceted on a fast
    // stroke; this costs nothing and removes all of it.
    const mid = { x: (last.current.x + p.x) / 2, y: (last.current.y + p.y) / 2 };
    c.strokeStyle = tool === "eraser" ? "#ffffff" : colour;
    c.lineWidth = size;
    c.beginPath();
    c.moveTo(last.current.x, last.current.y);
    c.quadraticCurveTo(last.current.x, last.current.y, mid.x, mid.y);
    c.stroke();
    last.current = p;
  };

  const onUp = () => {
    drawing.current = false;
    last.current = null;
    start.current = null;
    previewRef.current = null;
  };

  const clear = () => {
    const c = ctx();
    if (!c) return;
    snapshot();
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, W, H);
    setDirty(false);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `${(title.trim() || "painting").replace(/[^\w-]+/g, "-").toLowerCase()}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  /* ---- Saving ---------------------------------------------------------- */

  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: async () => {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("No canvas.");
      const check = validatePainting({ name, email, title });
      if (!check.ok) throw new Error(check.error);

      const image = canvas.toDataURL("image/png");
      if (image.length > MAX_IMAGE_CHARS) {
        throw new Error("That drawing is too detailed to save. Try clearing some of it.");
      }

      return savePainting({
        data: {
          name: name.trim(),
          email: email.trim(),
          title: title.trim(),
          image,
          width: W,
          height: H,
          strokes: strokes.current,
          seconds: Math.round((Date.now() - began.current) / 1000),
        },
      });
    },
    onSuccess: () => {
      try {
        localStorage.setItem("nivas.guest.name", name.trim());
        localStorage.setItem("nivas.guest.email", email.trim());
      } catch {
        /* storage blocked */
      }
      void queryClient.invalidateQueries({ queryKey: ["paint-wall"] });
      toast.success("On the wall.", {
        description: "It shows up straight away. A rating turns up whenever I next look.",
      });
    },
    onError: (error: Error) => toast.error("Could not save", { description: error.message }),
  });

  const toolBtn =
    "grid h-8 w-8 place-items-center rounded-[var(--os-radius-ctl)] transition-colors";

  return (
    <div className="flex h-full flex-col bg-background">
      {/* ---- Toolbar ---- */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-3 py-2">
        <div className="flex items-center gap-1">
          {TOOLS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTool(id)}
              title={label}
              aria-label={label}
              aria-pressed={tool === id}
              className={cn(
                toolBtn,
                tool === id
                  ? "text-[var(--os-accent-ink)]"
                  : "text-foreground/70 hover:bg-foreground/10 hover:text-foreground",
              )}
              style={tool === id ? { background: "var(--os-accent)" } : undefined}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <span aria-hidden className="h-6 w-px bg-border" />

        <div className="flex items-center gap-1">
          {SWATCHES.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => setColour(hex)}
              aria-label={`Colour ${hex}`}
              aria-pressed={colour === hex}
              className={cn(
                "h-6 w-6 rounded-[var(--os-radius-ctl)] border transition-transform hover:scale-110",
                colour === hex ? "scale-110 border-foreground" : "border-black/20",
              )}
              style={{ background: hex }}
            />
          ))}
          <label className="ml-1 cursor-pointer" title="Custom colour">
            <span className="sr-only">Custom colour</span>
            <input
              type="color"
              value={colour}
              onChange={(e) => setColour(e.target.value)}
              className="h-6 w-8 cursor-pointer rounded-[var(--os-radius-ctl)] border border-border bg-transparent p-0"
            />
          </label>
        </div>

        <span aria-hidden className="h-6 w-px bg-border" />

        <label className="flex items-center gap-2">
          <span className="micro text-muted-foreground">Size</span>
          <input
            type="range"
            min={1}
            max={64}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-24 accent-[var(--os-accent)]"
          />
          <span className="w-6 font-mono text-[11px] tabular-nums text-foreground">{size}</span>
        </label>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={doUndo}
            disabled={undo.length === 0 || restoring}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className={cn(toolBtn, "text-foreground/70 hover:bg-foreground/10 disabled:opacity-30")}
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={doRedo}
            disabled={redo.length === 0 || restoring}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            className={cn(toolBtn, "text-foreground/70 hover:bg-foreground/10 disabled:opacity-30")}
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={clear}
            title="Clear the canvas"
            aria-label="Clear the canvas"
            className={cn(
              toolBtn,
              "text-foreground/70 hover:bg-destructive/20 hover:text-destructive",
            )}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={download}
            title="Download a PNG"
            aria-label="Download a PNG"
            className={cn(toolBtn, "text-foreground/70 hover:bg-foreground/10")}
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ---- Canvas ---- */}
      <div className="grid min-h-0 flex-1 place-items-center overflow-hidden bg-foreground/5 p-3">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-label="Drawing canvas"
          className="h-auto max-h-full w-full max-w-full touch-none rounded-[var(--os-radius-ctl)] shadow-[0_10px_30px_-12px_oklch(0_0_0/45%)]"
          style={{
            aspectRatio: `${W} / ${H}`,
            cursor: tool === "fill" ? "crosshair" : "crosshair",
          }}
        />
      </div>

      {/* ---- Save bar ---- */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="flex flex-wrap items-center gap-2 border-t border-border/60 px-3 py-2"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_TITLE}
          placeholder="Title"
          aria-label="Painting title"
          className="min-w-0 flex-1 rounded-[var(--os-radius-ctl)] border border-border bg-card px-2.5 py-1.5 text-[13px] text-foreground outline-none focus:border-[var(--os-accent)]"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_NAME}
          placeholder="Your name"
          aria-label="Your name"
          className="w-36 rounded-[var(--os-radius-ctl)] border border-border bg-card px-2.5 py-1.5 text-[13px] text-foreground outline-none focus:border-[var(--os-accent)]"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Your email"
          aria-label="Your email"
          className="w-44 rounded-[var(--os-radius-ctl)] border border-border bg-card px-2.5 py-1.5 text-[13px] text-foreground outline-none focus:border-[var(--os-accent)]"
        />
        <button
          type="submit"
          disabled={save.isPending || !dirty}
          className="flex items-center gap-1.5 rounded-[var(--os-radius-ctl)] px-3 py-1.5 text-[13px] font-semibold transition-opacity disabled:opacity-40"
          style={{ background: "var(--os-accent)", color: "var(--os-accent-ink)" }}
        >
          <Send className="h-3.5 w-3.5" />
          {save.isPending ? "Sending…" : "Put it on the wall"}
        </button>
      </form>

      <p className="border-t border-border/60 px-3 py-1.5 text-[11px] text-muted-foreground">
        The wall is public — your name and the drawing show up there. Your email is only so I can
        reach you, and it is never displayed.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */

function spray(c: CanvasRenderingContext2D, x: number, y: number, size: number, colour: string) {
  const radius = size * 1.6;
  const dots = Math.max(6, Math.round(size * 1.8));
  c.fillStyle = colour;
  for (let i = 0; i < dots; i++) {
    // Square-rooting the radius gives an even area distribution; without it
    // every spray has a hard dark core and nothing at the edge.
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radius;
    c.fillRect(x + Math.cos(angle) * r, y + Math.sin(angle) * r, 1, 1);
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : clean;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
