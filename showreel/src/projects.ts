import { C } from "./theme";

export type Project = {
  slug: string;
  name: string;
  kind: string;
  year: string;
  url: string;
  line: string;
  stack: string[];
  note: string;
  accent: string;
  /** Full-page capture that scrolls inside the browser. */
  page: { src: string; h: number };
  /** Second screen that floats in front. */
  float: { src: string; ratio: number };
};

// Copy taken from nivas.tech and src/lib/site.ts in my-project-showcase.
export const PROJECTS: Project[] = [
  {
    slug: "estate-ulagam",
    name: "Estate Ulagam",
    kind: "Property platform",
    year: "2026",
    url: "estate-ulagam.vercel.app",
    line: "Property discovery across 18 markets — every listing reviewed before it goes live.",
    stack: ["React", "TanStack Router", "TanStack Query", "TypeScript", "Vite"],
    note: "18 markets, one review queue",
    accent: C.yellow,
    page: { src: "media/estate-ulagam/design-01-home.webp", h: 7200 },
    float: { src: "media/estate-ulagam/screen-04-property-detail.webp", ratio: 1440 / 900 },
  },
  {
    slug: "vaaram-magazine",
    name: "Vaaram Magazine",
    kind: "Weekly magazine",
    year: "2026",
    url: "vaaram.ca",
    line: "A weekly advertising magazine for readers across Canada — PDF editions, a full archive, sponsored slots.",
    stack: ["Next.js", "Server Components", "TypeScript", "Supabase", "PostgreSQL"],
    note: "a new edition, every week",
    accent: C.red,
    page: { src: "media/vaaram-magazine/design-01-home.webp", h: 7077 },
    float: { src: "media/vaaram-magazine/screen-03-edition-reader.webp", ratio: 1440 / 900 },
  },
  {
    slug: "anibakes",
    name: "Ani Bakes",
    kind: "Commerce",
    year: "2025",
    url: "anibakes.app",
    line: "Commerce for a boutique bakery — slot scheduling, custom cakes, Razorpay checkout, and the admin hub that runs the kitchen.",
    stack: ["React 19", "TanStack Start", "SSR", "Appwrite", "Razorpay"],
    note: "the admin panel they use daily",
    accent: "oklch(0.72 0.17 0)",
    page: { src: "media/anibakes/design-01-home.webp", h: 4908 },
    float: { src: "media/anibakes/screen-11-admin-analytics.webp", ratio: 1440 / 900 },
  },
  {
    slug: "aarrkkaa-international",
    name: "AARRKKAA International",
    kind: "Industrial storefront",
    year: "2026",
    url: "aarrkkaa.com",
    line: "An industrial supply storefront for a Hosur distributor of pumps, seals and precision parts.",
    stack: ["TanStack Start", "Prisma", "PostgreSQL", "TypeScript"],
    note: "find-my-seal, in four questions",
    accent: C.orange,
    page: { src: "media/aarrkkaa-international/design-01-home.webp", h: 4574 },
    float: { src: "media/aarrkkaa-international/screen-05-find-my-seal-wizard.webp", ratio: 1440 / 710 },
  },
  {
    slug: "velocity",
    name: "Velocity",
    kind: "Streaming client",
    year: "2026",
    url: "velocitybox.app",
    line: "An open-source streaming client — a Node service, a React web app, and a Flutter client on top.",
    stack: ["Node.js", "Express", "React", "Flutter", "Dart"],
    note: "one backend, two clients",
    accent: C.blueSoft,
    page: { src: "media/velocity/design-03-architecture.webp", h: 1945 },
    float: { src: "media/velocity/screen-02-premium.webp", ratio: 1440 / 900 },
  },
];
