import { Reveal } from "@/components/Reveal";
import type { FlowStep } from "@/content/static-projects";
import { accentFor, accentSurface } from "@/lib/accents";

/**
 * A system's request path as a numbered timeline, one step per row, joined by
 * a rail so the order reads at a glance.
 */
export function HowItWorks({ steps }: { steps: FlowStep[] }) {
  return (
    <ol className="relative space-y-3">
      <span aria-hidden className="absolute bottom-6 left-[15px] top-6 w-0.5 bg-border/40" />
      {steps.map((step, i) => (
        <Reveal as="li" key={step.title} delay={i * 80} className="relative flex gap-4">
          <span
            aria-hidden
            className="relative z-10 mt-4 grid h-8 w-8 shrink-0 place-items-center rounded-md font-mono text-[11px] font-bold"
            style={accentSurface(accentFor(i))}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="hog-card hog-card-hover min-w-0 flex-1 p-4 sm:flex sm:items-start sm:gap-6">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-foreground">{step.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
                {step.detail}
              </p>
            </div>
            <p className="mt-2 shrink-0 font-mono text-[11px] text-foreground/70 sm:mt-0.5 sm:max-w-[11rem] sm:text-right">
              {step.tech}
            </p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
