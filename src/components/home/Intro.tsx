import type { Project } from "@/lib/projects";
import { toAbsoluteUrl } from "@/lib/site";
import { Eyebrow, LitParagraph, SectionGlow } from "./fx";
import { GitHubStrip } from "./GitHubStrip";

const WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
];

/**
 * The bridge between the hero and the evidence. One paragraph, set large, that
 * brightens as it is read — the job the three pinned full-screen statements
 * used to do across three and a half viewports.
 */
export function Intro({ projects }: { projects: Project[] }) {
  const live = projects.filter(
    (p) => toAbsoluteUrl(p.live_url) && p.category !== "Research",
  ).length;
  const count = WORDS[live] ?? String(live);

  return (
    <section data-act="noir" data-rail="Intro" className="act-noir tone-amber relative">
      <SectionGlow side="right" />
      <div className="relative mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-40">
        <Eyebrow index="01">The work</Eyebrow>

        <LitParagraph
          className="mt-12 max-w-[26ch] text-balance font-display text-[clamp(1.75rem,3.6vw,3.1rem)] font-medium leading-[1.14] tracking-[-0.03em] text-foreground sm:max-w-[30ch]"
          emphasis={["ship.", "alone.", "Tamil"]}
          text={`I build things that ship. ${count} products are live right now — real users, real payments, real uptime — each one designed, built and deployed alone. Alongside them sits research-grade NLP: a summarisation model for Tamil that keeps the names in the story.`}
        />

        <GitHubStrip />
      </div>
    </section>
  );
}
