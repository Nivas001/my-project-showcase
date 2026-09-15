import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { site } from "@/lib/site";
import { projectsQuery, skillGroupsQuery } from "@/lib/queries";
import { Gate } from "@/components/home/Gate";
import { Statements } from "@/components/home/Statements";
import { ActWipe } from "@/components/home/ActWipe";
import { Opener } from "@/components/home/Opener";
import { Pillars } from "@/components/home/Pillars";
import { SelectedWork } from "@/components/home/SelectedWork";
import { Toolbox } from "@/components/home/Toolbox";
import { SpecSheet } from "@/components/home/SpecSheet";
import { HowIWork } from "@/components/home/HowIWork";
import { Changelog } from "@/components/home/Changelog";
import { HireCTA } from "@/components/home/HireCTA";

const TITLE = "Srinivas M — Full-stack engineer, Flutter & applied NLP";
const DESCRIPTION =
  "Full-stack engineer in Pondicherry with three products live in production and a published Tamil NLP summarisation model. React, TanStack, Python, Flutter, PostgreSQL.";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQuery),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Srinivas M",
          jobTitle: "Full-stack Engineer",
          email: `mailto:${site.email}`,
          telephone: site.phone,
          url: "https://nivas.tech",
          sameAs: [site.github, site.linkedin],
          address: {
            "@type": "PostalAddress",
            addressLocality: "Pondicherry",
            addressCountry: "IN",
          },
          alumniOf: {
            "@type": "CollegeOrUniversity",
            name: "Pondicherry University",
          },
          knowsAbout: [
            "Full-stack development",
            "React",
            "TypeScript",
            "Python",
            "Flutter",
            "Natural language processing",
          ],
        }),
      },
    ],
  }),
  component: Home,
});

/**
 * The homepage is one story in two acts.
 *
 *   Act I  (noir)  Gate → Statements → the turn
 *   Act II (hog)   Opener → Pillars → Work → Stack → Numbers → Principles →
 *                  Changelog → Close
 *
 * Each section carries `data-act` so the sticky header can invert itself as
 * the ground changes underneath it (see useSectionAct in __root.tsx).
 */
function Home() {
  const { data: projects } = useSuspenseQuery(projectsQuery);
  const { data: skillGroups } = useQuery(skillGroupsQuery);

  const groups = skillGroups?.map((group) => ({ group: group.name, items: group.items }));

  return (
    <>
      <Gate projects={projects} />
      <Statements />
      <ActWipe />

      <Opener projects={projects} />
      <Pillars />
      <SelectedWork projects={projects} />
      <Toolbox groups={groups} />
      <SpecSheet projects={projects} />
      <HowIWork />
      <Changelog />
      <HireCTA />
    </>
  );
}
