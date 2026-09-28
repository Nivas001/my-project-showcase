import { PIPELINE_TOOLS } from "./pipeline-stages";
import { TechGlyph, techLabel } from "@/components/kit/TechMark";
import { cn } from "@/lib/utils";

/**
 * Everything the work below was built with, on one slow belt. It used to sit
 * at the foot of the build pipeline; it now stands on its own between the
 * pinned project and the freight story, as the manifest for what ships.
 */
export function ToolMarquee({ className }: { className?: string }) {
  return (
    <section
      aria-label="Tools used across these projects"
      className={cn(
        "relative overflow-hidden border-t border-border bg-background py-6",
        "[mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]",
        className,
      )}
    >
      <div className="marquee-track" style={{ "--marquee-duration": "44s" } as React.CSSProperties}>
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center gap-8 pr-8"
          >
            {PIPELINE_TOOLS.map((tool) => (
              <span key={`${copy}-${tool}`} className="flex shrink-0 items-center gap-2.5">
                <TechGlyph id={tool} className="h-6 w-6" />
                <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                  {techLabel(tool)}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
