import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * CALCULATOR
 * ============================================================================
 *
 * A working four-function calculator with the behaviour people actually expect
 * from the ones shipped with an OS — which is subtler than it looks:
 *
 *   · typing an operator twice replaces it rather than applying it twice
 *   · `=` repeats the last operation with the last operand ("5 + 3 = = =")
 *   · a pending operator applies before the next one, left to right
 *   · division by zero says so instead of printing Infinity
 *
 * State is three values, the same three a pocket calculator has: what is on the
 * display, what is held in the accumulator, and which operator is waiting.
 */

type Op = "+" | "-" | "×" | "÷";

const KEYS: { label: string; kind: "digit" | "op" | "fn" | "eq"; span?: boolean }[] = [
  { label: "AC", kind: "fn" },
  { label: "±", kind: "fn" },
  { label: "%", kind: "fn" },
  { label: "÷", kind: "op" },
  { label: "7", kind: "digit" },
  { label: "8", kind: "digit" },
  { label: "9", kind: "digit" },
  { label: "×", kind: "op" },
  { label: "4", kind: "digit" },
  { label: "5", kind: "digit" },
  { label: "6", kind: "digit" },
  { label: "-", kind: "op" },
  { label: "1", kind: "digit" },
  { label: "2", kind: "digit" },
  { label: "3", kind: "digit" },
  { label: "+", kind: "op" },
  { label: "0", kind: "digit", span: true },
  { label: ".", kind: "digit" },
  { label: "=", kind: "eq" },
];

function apply(a: number, b: number, op: Op): number | null {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? null : a / b;
  }
}

/** Twelve significant figures, then trim the float noise 0.1 + 0.2 leaves. */
function show(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  const rounded = Number(n.toPrecision(12));
  return String(rounded);
}

export function Calculator() {
  const [display, setDisplay] = useState("0");
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  /** True when the next digit should start a fresh number. */
  const [fresh, setFresh] = useState(true);
  /** The last (operator, operand) pair, so `=` can repeat. */
  const [repeat, setRepeat] = useState<{ op: Op; operand: number } | null>(null);

  const press = useCallback(
    (label: string) => {
      const isDigit = /^[0-9]$/.test(label);

      if (isDigit) {
        setDisplay((d) => (fresh || d === "0" ? label : d.length < 14 ? d + label : d));
        setFresh(false);
        return;
      }

      if (label === ".") {
        setDisplay((d) => (fresh ? "0." : d.includes(".") ? d : d + "."));
        setFresh(false);
        return;
      }

      if (label === "AC") {
        setDisplay("0");
        setAcc(null);
        setOp(null);
        setRepeat(null);
        setFresh(true);
        return;
      }

      if (label === "±") {
        setDisplay((d) => (d.startsWith("-") ? d.slice(1) : d === "0" ? d : "-" + d));
        return;
      }

      if (label === "%") {
        setDisplay((d) => show(Number(d) / 100));
        setFresh(true);
        return;
      }

      if (label === "=") {
        const current = Number(display);

        // Repeating: `5 + 3 =` then `=` again applies "+3" to the result.
        if (op === null && repeat) {
          const out = apply(current, repeat.operand, repeat.op);
          setDisplay(out === null ? "Cannot divide by zero" : show(out));
          setFresh(true);
          return;
        }

        if (op === null || acc === null) {
          setFresh(true);
          return;
        }

        const out = apply(acc, current, op);
        setRepeat({ op, operand: current });
        setDisplay(out === null ? "Cannot divide by zero" : show(out));
        setAcc(null);
        setOp(null);
        setFresh(true);
        return;
      }

      // An operator.
      const next = label as Op;
      const current = Number(display);

      // Two operators in a row: the second one replaces the first rather than
      // folding the display into the accumulator a second time.
      if (op !== null && fresh) {
        setOp(next);
        return;
      }

      if (op !== null && acc !== null) {
        const out = apply(acc, current, op);
        if (out === null) {
          setDisplay("Cannot divide by zero");
          setAcc(null);
          setOp(null);
          setFresh(true);
          return;
        }
        setAcc(out);
        setDisplay(show(out));
      } else {
        setAcc(current);
      }

      setOp(next);
      setRepeat(null);
      setFresh(true);
    },
    [display, acc, op, fresh, repeat],
  );

  /* The keyboard is how anyone actually uses a calculator. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const k = event.key;
      const map: Record<string, string> = {
        "*": "×",
        x: "×",
        "/": "÷",
        Enter: "=",
        "=": "=",
        Escape: "AC",
        c: "AC",
        Backspace: "⌫",
      };
      const label = /^[0-9.]$/.test(k) ? k : k === "+" || k === "-" ? k : map[k];
      if (!label) return;
      event.preventDefault();
      // Escape is mapped to clear, so it must not also close the window.
      event.stopPropagation();

      if (label === "⌫") {
        setDisplay((d) =>
          d.length <= 1 || (d.length === 2 && d.startsWith("-")) ? "0" : d.slice(0, -1),
        );
        return;
      }
      press(label);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  const error = display.startsWith("Cannot");

  return (
    <div className="flex h-full flex-col bg-background p-2">
      <output
        aria-live="polite"
        className={cn(
          "mb-2 block truncate rounded-[var(--os-radius-ctl)] bg-foreground/5 px-3 py-4 text-right font-mono tabular-nums text-foreground",
          error ? "text-[13px] text-destructive" : "text-[30px]",
        )}
      >
        {display}
      </output>

      <div className="grid flex-1 grid-cols-4 gap-1.5">
        {KEYS.map((key) => (
          <button
            key={key.label}
            type="button"
            onClick={() => press(key.label)}
            aria-label={key.label}
            className={cn(
              "rounded-[var(--os-radius-ctl)] py-3 text-[15px] font-medium transition-colors active:scale-[0.97]",
              key.span && "col-span-2",
              key.kind === "digit" && "bg-foreground/8 text-foreground hover:bg-foreground/14",
              key.kind === "fn" && "bg-foreground/15 text-foreground hover:bg-foreground/22",
              (key.kind === "op" || key.kind === "eq") && "font-semibold",
              op === key.label && fresh ? "ring-2 ring-inset ring-foreground/60" : "",
            )}
            style={
              key.kind === "op" || key.kind === "eq"
                ? { background: "var(--os-accent)", color: "var(--os-accent-ink)" }
                : undefined
            }
          >
            {key.label}
          </button>
        ))}
      </div>
    </div>
  );
}
