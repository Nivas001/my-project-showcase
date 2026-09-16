import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { ProjectDecision } from "@/lib/projects";
import { accentFor, accentSurface, accentVar } from "@/lib/accents";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

/**
 * The decision log.
 *
 * Every other section of a project page describes the artefact. This one
 * describes the engineer: what had to be chosen, what lost, and — the part
 * almost nobody writes down — what the winning option cost.
 *
 * The rejected options stay visible on purpose. A list of things you picked
 * reads as a stack; a list of things you picked *over something else* reads as
 * judgement, and judgement is the thing being assessed.
 *
 * One entry is expanded at a time. The problem and the call are always visible;
 * the reasoning and the cost open on demand, so the section scans in five
 * seconds and still rewards reading it properly.
 */
export function DecisionLog({ decisions }: { decisions: ProjectDecision[] }) {
  const [open, setOpen] = useState(0);

  if (decisions.length === 0) return null;

  return (
    <ol className="space-y-3">
      {decisions.map((decision, index) => {
        const accent = accentFor(index);
        const expanded = open === index;
        // `options` holds only the alternatives that lost — see the type
        // comment on ProjectDecision. Rendering it directly (rather than
        // filtering `chose` out of a combined list) means a `chose` label
        // that's a shortened paraphrase of the full option text, which is the
        // normal case, can never make the winner reappear in its own "over" row.
        const rejected = decision.options;

        return (
          <Reveal as="li" key={`${decision.problem}-${index}`} delay={index * 70}>
            <div
              className={cn(
                "hog-card overflow-hidden",
                expanded ? "hard-shadow-lg" : "hog-card-hover",
              )}
            >
              <h3>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`decision-body-${index}`}
                  onClick={() => setOpen(expanded ? -1 : index)}
                  className="flex w-full items-start gap-4 p-4 text-left sm:p-5"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-sm font-mono text-[10px] font-bold"
                    style={accentSurface(accent)}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="micro block text-muted-foreground">The problem</span>
                    <span className="mt-1.5 block text-[15px] font-semibold leading-snug text-foreground">
                      {decision.problem}
                    </span>
                  </span>

                  <ChevronDown
                    aria-hidden
                    className={cn(
                      "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      expanded && "rotate-180",
                    )}
                  />
                </button>
              </h3>

              {/* The verdict sits outside the collapsible region: a reader
                  skimming the whole log should get every call without opening
                  anything. Only the reasoning is hidden. */}
              <div className="flex flex-wrap items-center gap-2 px-4 pb-4 sm:px-5 sm:pb-5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[11px] font-bold"
                  style={accentSurface(accent)}
                >
                  <Check aria-hidden className="h-3 w-3" />
                  {decision.chose}
                </span>

                {rejected.length > 0 ? (
                  <>
                    <span className="micro text-muted-foreground">over</span>
                    {rejected.map((option) => (
                      <span
                        key={option}
                        className="rounded-sm border border-border/70 px-2 py-1 font-mono text-[11px] text-muted-foreground line-through decoration-1"
                      >
                        {option}
                      </span>
                    ))}
                  </>
                ) : null}
              </div>

              <div
                id={`decision-body-${index}`}
                hidden={!expanded}
                className="border-t-2 border-border"
              >
                <div className="space-y-4 p-4 sm:p-5">
                  <div>
                    <span className="micro block text-muted-foreground">Because</span>
                    <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
                      {decision.because}
                    </p>
                  </div>

                  {decision.cost ? (
                    <div
                      className="border-l-2 pl-4"
                      style={{ borderColor: accentVar("hog-yellow") }}
                    >
                      <span className="micro block" style={{ color: accentVar("hog-yellow") }}>
                        What it cost
                      </span>
                      <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
                        {decision.cost}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}
