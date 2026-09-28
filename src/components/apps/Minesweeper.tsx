import { useCallback, useEffect, useMemo, useState } from "react";
import { Flag, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * MINESWEEPER
 * ============================================================================
 *
 * Nine by nine, ten mines. Written from the rules rather than ported, so a few
 * details are worth stating:
 *
 * The board is generated AFTER the first click, with a guaranteed-safe pocket
 * around wherever that click landed. Losing on move one is the single worst
 * thing this game can do to a player, and it is entirely avoidable.
 *
 * Revealing an empty cell flood-fills its region iteratively. A recursive
 * version is prettier and blows the stack on a large empty board.
 */

const SIZE = 9;
const MINES = 10;

type Cell = {
  mine: boolean;
  /** Adjacent mine count, 0-8. */
  near: number;
  open: boolean;
  flag: boolean;
};

type Status = "idle" | "playing" | "won" | "lost";

const NUMBER_INK = [
  "",
  "oklch(0.62 0.2 255)",
  "oklch(0.55 0.16 150)",
  "oklch(0.62 0.22 25)",
  "oklch(0.52 0.2 300)",
  "oklch(0.55 0.15 40)",
  "oklch(0.58 0.14 200)",
  "oklch(0.45 0 0)",
  "oklch(0.6 0 0)",
];

const blank = (): Cell[] =>
  Array.from({ length: SIZE * SIZE }, () => ({ mine: false, near: 0, open: false, flag: false }));

const neighbours = (i: number): number[] => {
  const x = i % SIZE;
  const y = Math.floor(i / SIZE);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) continue;
      out.push(ny * SIZE + nx);
    }
  }
  return out;
};

/** Lays mines anywhere except `safe` and its neighbours. */
function generate(safe: number): Cell[] {
  const cells = blank();
  const forbidden = new Set([safe, ...neighbours(safe)]);
  const candidates = cells.map((_, i) => i).filter((i) => !forbidden.has(i));

  for (let placed = 0; placed < MINES && candidates.length > 0; placed++) {
    const pick = Math.floor(Math.random() * candidates.length);
    const [index] = candidates.splice(pick, 1);
    cells[index!]!.mine = true;
  }
  for (let i = 0; i < cells.length; i++) {
    cells[i]!.near = neighbours(i).filter((n) => cells[n]!.mine).length;
  }
  return cells;
}

export function Minesweeper() {
  const [cells, setCells] = useState<Cell[]>(blank);
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (status !== "playing") return;
    const id = window.setInterval(() => setSeconds((s) => Math.min(999, s + 1)), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const reset = useCallback(() => {
    setCells(blank());
    setStatus("idle");
    setSeconds(0);
  }, []);

  const flagged = useMemo(() => cells.filter((c) => c.flag).length, [cells]);

  const reveal = (from: Cell[], start: number): Cell[] => {
    const next = from.map((c) => ({ ...c }));
    const queue = [start];
    const seen = new Set<number>();

    while (queue.length) {
      const i = queue.pop()!;
      if (seen.has(i)) continue;
      seen.add(i);
      const cell = next[i]!;
      if (cell.open || cell.flag) continue;
      cell.open = true;
      // Only a zero opens its neighbours; a number is the wall of the region.
      if (cell.near === 0 && !cell.mine) queue.push(...neighbours(i));
    }
    return next;
  };

  const onOpen = (i: number) => {
    if (status === "won" || status === "lost") return;

    let board = cells;
    if (status === "idle") {
      board = generate(i);
      setStatus("playing");
    }
    if (board[i]!.flag) return;

    if (board[i]!.mine) {
      setCells(board.map((c) => (c.mine ? { ...c, open: true } : c)));
      setStatus("lost");
      return;
    }

    const next = reveal(board, i);
    setCells(next);

    // Won when every non-mine cell is open. Flags are irrelevant to the win
    // condition, which is what the original does and what players expect.
    if (next.every((c) => c.mine || c.open)) setStatus("won");
  };

  const onFlag = (event: React.MouseEvent, i: number) => {
    event.preventDefault();
    if (status === "won" || status === "lost" || cells[i]!.open) return;
    setCells((board) => board.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)));
  };

  const face = status === "lost" ? "✖" : status === "won" ? "★" : "◆";

  return (
    <div className="flex h-full flex-col gap-2 bg-background p-2.5">
      <div className="flex items-center justify-between rounded-[var(--os-radius-ctl)] bg-foreground/8 px-2.5 py-1.5">
        <span className="flex items-center gap-1 font-mono text-[13px] tabular-nums text-foreground">
          <Flag className="h-3.5 w-3.5" />
          {String(Math.max(0, MINES - flagged)).padStart(2, "0")}
        </span>

        <button
          type="button"
          onClick={reset}
          aria-label="New game"
          className="grid h-7 w-7 place-items-center rounded-[var(--os-radius-ctl)] bg-foreground/10 text-[13px] text-foreground transition-colors hover:bg-foreground/20"
        >
          {status === "idle" ? <RotateCcw className="h-3.5 w-3.5" /> : face}
        </button>

        <span className="font-mono text-[13px] tabular-nums text-foreground">
          {String(seconds).padStart(3, "0")}
        </span>
      </div>

      <div
        role="grid"
        aria-label="Minefield"
        className="grid flex-1 gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
      >
        {cells.map((cell, i) => (
          <button
            key={i}
            type="button"
            role="gridcell"
            onClick={() => onOpen(i)}
            onContextMenu={(e) => onFlag(e, i)}
            aria-label={
              cell.open
                ? cell.mine
                  ? "Mine"
                  : `${cell.near} adjacent mines`
                : cell.flag
                  ? "Flagged"
                  : "Hidden cell"
            }
            className={cn(
              "grid aspect-square place-items-center rounded-[2px] text-[13px] font-bold tabular-nums transition-colors",
              cell.open
                ? cell.mine
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-foreground/6"
                : "bg-foreground/18 hover:bg-foreground/26",
            )}
            style={
              cell.open && !cell.mine && cell.near > 0
                ? { color: NUMBER_INK[cell.near] }
                : undefined
            }
          >
            {cell.open ? (cell.mine ? "✱" : cell.near || "") : cell.flag ? "⚑" : ""}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="text-center text-[11.5px] text-muted-foreground">
        {status === "won"
          ? `Cleared in ${seconds}s. Nothing exploded.`
          : status === "lost"
            ? "That one was a mine. Hit the button."
            : "Click to open. Right-click to flag. The first click is always safe."}
      </p>
    </div>
  );
}
