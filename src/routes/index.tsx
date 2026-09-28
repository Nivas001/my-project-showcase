import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { site, canonical } from "@/lib/site";
import { projectsQuery, skillGroupsQuery } from "@/lib/queries";
import { Gate } from "@/components/home/Gate";
import { Intro } from "@/components/home/Intro";
import { Capabilities } from "@/components/home/Capabilities";
import { SelectedWork } from "@/components/home/SelectedWork";
import { SpecSheet } from "@/components/home/SpecSheet";
import { Anatomy } from "@/components/home/Anatomy";
import { SideBuilds } from "@/components/home/SideBuilds";
import { SectionRail } from "@/components/home/SectionRail";
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
 * The homepage is one continuous scroll on a single ground:
 *
 *   Hero → 01 The work (+ GitHub) → 02 What I do → 03 Selected work
 *        → 04 Side builds → 05 Under the hood → 06 Technical depth
 *        → 07 How I work → 08 Contact
 *
 * Each section says one thing and gets out of the way. The macOS desktop, the
 * pinned statement screens and the two-act colour change are gone; the
 * portrait, the arcade, the horror room and the app playground all remain.
 */
function Home() {
  const { data: projects } = useSuspenseQuery(projectsQuery);
  const { data: skillGroups } = useQuery(skillGroupsQuery);

  const groups = skillGroups?.map((group) => ({ group: group.name, items: group.items }));

  return (
    <>
      <Gate projects={projects} />
      <Intro projects={projects} />
      <Capabilities />
      <SelectedWork projects={projects} />
      <SideBuilds />
      <Anatomy />
      <SpecSheet projects={projects} groups={groups} />
      <HowIWork />
      <HireCTA />
      <SectionRail />
    </>
  );
}
