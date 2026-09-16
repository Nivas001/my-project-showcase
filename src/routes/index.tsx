import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { site, canonical } from "@/lib/site";
import { projectsQuery, skillGroupsQuery } from "@/lib/queries";
import { Gate } from "@/components/home/Gate";
import { Statements } from "@/components/home/Statements";
import { Opener } from "@/components/home/Opener";
import { SelectedWork } from "@/components/home/SelectedWork";
import { SpecSheet } from "@/components/home/SpecSheet";
import { HowIWork } from "@/components/home/HowIWork";
import { HireCTA } from "@/components/home/HireCTA";

const TITLE = "Srinivas M — Full-stack engineer, Flutter & applied NLP";
const DESCRIPTION =
  "Full-stack engineer in Pondicherry with five products live in production and a published Tamil NLP summarisation model. React, TanStack, Next.js, Python, Flutter, PostgreSQL.";

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
    links: [canonical("/")],
  }),
  component: Home,
});

/**
 * The homepage is one story in two acts.
 *
 *   Act I  (noir)  Gate → Statements
 *   Act II (hog)   Opener → Work → Spec sheet → Principles → Close
 *
 * Each section carries `data-act` so the sticky header can invert itself as
 * the ground changes underneath it (see useSectionAct in __root.tsx).
 *
 * It ran to eleven sections and roughly thirteen viewports, and said the same
 * few things repeatedly: "three live, built solo" appeared five times, the
 * four-capability grid twice, the stack three times. Four sections are gone:
 *
 *   ActWipe   1.6 viewports of scroll to deliver one headline
 *   Pillars   merged into Opener, which had a weaker copy of the same grid
 *   Toolbox   merged into SpecSheet, which already listed the stack
 *   Changelog moved to the changelog.log window on the desktop
 */
function Home() {
  const { data: projects } = useSuspenseQuery(projectsQuery);
  const { data: skillGroups } = useQuery(skillGroupsQuery);

  const groups = skillGroups?.map((group) => ({ group: group.name, items: group.items }));

  return (
    <>
      <Gate projects={projects} />
      <Statements />

      <Opener projects={projects} />
      <SelectedWork projects={projects} />
      <SpecSheet projects={projects} groups={groups} />
      <HowIWork />
      <HireCTA />
    </>
  );
}
