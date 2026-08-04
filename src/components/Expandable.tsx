import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Collapses its children to `collapsedLines` worth of height and reveals the
 * rest with a smooth measured-height transition.
 */
export function Expandable({
  children,
  collapsedLines = 3,
  lineHeight = 26,
  moreLabel = "read more",
  lessLabel = "show less",
}: {
  children: React.ReactNode;
  collapsedLines?: number;
  lineHeight?: number;
  moreLabel?: string;
  lessLabel?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);

  const collapsedHeight = collapsedLines * lineHeight;

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setFullHeight(el.scrollHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [children]);

  const overflows = fullHeight > collapsedHeight + 8;
  const isCollapsed = overflows && !expanded;

  return (
    <div>
      <div
        className="relative overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          maxHeight: overflows
            ? isCollapsed
              ? `${collapsedHeight}px`
              : `${fullHeight}px`
            : undefined,
        }}
      >
        <div ref={contentRef}>{children}</div>
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background via-background/80 to-transparent transition-opacity duration-300 ${
            isCollapsed ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {overflows ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="group mt-3 inline-flex items-center gap-1.5 rounded-sm border border-border/70 bg-surface-raised/60 px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-accent"
        >
          {expanded ? lessLabel : moreLabel}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-300 ${
              expanded ? "rotate-180" : "group-hover:translate-y-0.5"
            }`}
          />
        </button>
      ) : null}
    </div>
  );
}
