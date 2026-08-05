import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

const COLS = 16;
const ROWS = 16;
const CELL = 22;
const INITIAL_SPEED = 180;

export function SnakeByte({ onGameOver }: { onGameOver: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const stateRef = useRef({
    snake: [{ x: 8, y: 8 }],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 12, y: 8 },
    score: 0,
    speed: INITIAL_SPEED,
  });
  const loopRef = useRef<number | null>(null);

  const reset = () => {
    stateRef.current = {
      snake: [{ x: 8, y: 8 }],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: { x: 12, y: 8 },
      score: 0,
      speed: INITIAL_SPEED,
    };
    setScore(0);
  };

  const placeFood = useCallback((snake: { x: number; y: number }[]) => {
    let pos: { x: number; y: number };
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#191536";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(120,110,220,0.12)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(COLS * CELL, y * CELL);
      ctx.stroke();
    }

    const { snake, food } = stateRef.current;
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#6366f1" : "#a5a2f5";
      ctx.shadowColor = "#8b8bff";
      ctx.shadowBlur = i === 0 ? 12 : 0;
      ctx.fillRect(seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4);
      ctx.shadowBlur = 0;
    });

    ctx.fillStyle = "#34d399";
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const tick = useCallback(() => {
    const state = stateRef.current;
    state.dir = state.nextDir;
    const head = state.snake[0]!;
    const newHead = { x: head.x + state.dir.x, y: head.y + state.dir.y };

    if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
      setStatus("over");
      onGameOver(state.score);
      return;
    }
    if (state.snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      setStatus("over");
      onGameOver(state.score);
      return;
    }

    state.snake.unshift(newHead);
    if (newHead.x === state.food.x && newHead.y === state.food.y) {
      state.score += 1;
      state.speed = Math.max(90, state.speed - 3);
      state.food = placeFood(state.snake);
      setScore(state.score);
    } else {
      state.snake.pop();
    }
    draw();
    loopRef.current = window.setTimeout(tick, state.speed);
  }, [draw, onGameOver, placeFood]);

  useEffect(() => {
    if (status !== "playing") {
      if (loopRef.current) clearTimeout(loopRef.current);
      return;
    }
    tick();
    return () => {
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, [status, tick]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (status !== "playing") return;
      const state = stateRef.current;
      switch (e.key) {
        case "ArrowUp":
          if (state.dir.y === 0) state.nextDir = { x: 0, y: -1 };
          break;
        case "ArrowDown":
          if (state.dir.y === 0) state.nextDir = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
          if (state.dir.x === 0) state.nextDir = { x: -1, y: 0 };
          break;
        case "ArrowRight":
          if (state.dir.x === 0) state.nextDir = { x: 1, y: 0 };
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [status]);

  const start = () => {
    reset();
    setStatus("playing");
  };

  const setDir = (dx: number, dy: number) => {
    const state = stateRef.current;
    if (status !== "playing") return;
    if (dx !== 0 && state.dir.x === 0) state.nextDir = { x: dx, y: 0 };
    if (dy !== 0 && state.dir.y === 0) state.nextDir = { x: 0, y: dy };
  };

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span>score: {score}</span>
        <span className="text-[11px]">arrows or D-pad</span>
      </div>

      <canvas
        ref={canvasRef}
        width={COLS * CELL}
        height={ROWS * CELL}
        className="mt-4 w-full rounded-md border border-border bg-surface-raised"
        style={{ aspectRatio: "1/1" }}
      />

      <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
        <span />
        <button type="button" onClick={() => setDir(0, -1)} className="rounded-md border border-border p-2 active:bg-accent/20">
          <ArrowUp className="mx-auto h-4 w-4" />
        </button>
        <span />
        <button type="button" onClick={() => setDir(-1, 0)} className="rounded-md border border-border p-2 active:bg-accent/20">
          <ArrowLeft className="mx-auto h-4 w-4" />
        </button>
        <button type="button" onClick={() => setDir(0, 1)} className="rounded-md border border-border p-2 active:bg-accent/20">
          <ArrowDown className="mx-auto h-4 w-4" />
        </button>
        <button type="button" onClick={() => setDir(1, 0)} className="rounded-md border border-border p-2 active:bg-accent/20">
          <ArrowRight className="mx-auto h-4 w-4" />
        </button>
      </div>

      {status !== "playing" && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={start}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {status === "over" ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {status === "over" ? "Play again" : "Start"}
          </button>
        </div>
      )}
    </div>
  );
}
