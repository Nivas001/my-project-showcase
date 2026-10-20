// Copy taken from nivas.tech: src/lib/site.ts and src/content/static-projects.ts.

export type Variant =
  | { kind: "scroll"; page: { src: string; h: number }; float: { src: string; ratio: number } }
  | { kind: "fan"; shots: string[] }
  | { kind: "grid"; shots: string[] }
  | { kind: "flip"; shots: { src: string; month: number; label: string }[] };

export type Live = {
  slug: string;
  name: string;
  short: string;
  kind: string;
  year: string;
  url: string;
  line: string;
  stack: string[];
  note: string;
  /** Sheet colour (pale) and the project's own pastel (folders, dots). */
  tint: string;
  tint2: string;
  accent: string;
  sticky: string;
  media: Variant;
};

export const LIVE: Live[] = [
  {
    slug: "estate-ulagam",
    name: "Estate Ulagam",
    short: "Estate Ulagam",
    kind: "Property platform",
    year: "2026",
    url: "estate-ulagam.vercel.app",
    line: "Property discovery across 18 markets — every listing reviewed before it goes live.",
    stack: ["React", "TanStack Router", "TanStack Query", "TypeScript", "Vite"],
    note: "18 markets, one review queue",
    tint: "#F2EAD2",
    tint2: "#F0C95A",
    accent: "#B8860B",
    sticky: "#FAE57C",
    media: {
      kind: "scroll",
      page: { src: "media/estate-ulagam/design-01-home.webp", h: 7200 },
      float: { src: "media/estate-ulagam/screen-04-property-detail.webp", ratio: 1440 / 900 },
    },
  },
  {
    slug: "vaaram-magazine",
    name: "Vaaram Magazine",
    short: "Vaaram",
    kind: "Weekly magazine",
    year: "2026",
    url: "vaaram.ca",
    line: "A weekly advertising magazine for readers across Canada — PDF editions, a full archive, sponsored slots.",
    stack: ["Next.js", "Server Components", "TypeScript", "Supabase", "PostgreSQL"],
    note: "a new edition, every week",
    tint: "#F3DFD9",
    tint2: "#EE8A78",
    accent: "#C8372D",
    sticky: "#F7C5D9",
    media: {
      kind: "fan",
      shots: [
        "media/vaaram-magazine/screen-02-archives.webp",
        "media/vaaram-magazine/screen-01-home.webp",
        "media/vaaram-magazine/screen-03-edition-reader.webp",
      ],
    },
  },
  {
    slug: "anibakes",
    name: "Ani Bakes",
    short: "Ani Bakes",
    kind: "Commerce",
    year: "2025",
    url: "anibakes.app",
    line: "Commerce for a boutique bakery — slot scheduling, custom cakes, Razorpay checkout, and the admin hub that runs the kitchen.",
    stack: ["React 19", "TanStack Start", "SSR", "Appwrite", "Razorpay"],
    note: "the admin panel they use daily",
    tint: "#F5E0EA",
    tint2: "#F09ABF",
    accent: "#D2477F",
    sticky: "#C8EFD4",
    media: {
      kind: "grid",
      shots: [
        "media/anibakes/screen-01-home.webp",
        "media/anibakes/screen-04-product-detail.webp",
        "media/anibakes/screen-06-checkout-slot-booking.webp",
        "media/anibakes/screen-11-admin-analytics.webp",
      ],
    },
  },
  {
    slug: "aarrkkaa-international",
    name: "AARRKKAA International",
    short: "AARRKKAA",
    kind: "Industrial storefront",
    year: "2026",
    url: "aarrkkaa.com",
    line: "An industrial supply storefront for a Hosur distributor of pumps, seals and precision parts.",
    stack: ["TanStack Start", "Prisma", "PostgreSQL", "TypeScript"],
    note: "find-my-seal, in four questions",
    tint: "#F3E2D0",
    tint2: "#EE9B62",
    accent: "#C9561F",
    sticky: "#CFDFFA",
    media: {
      kind: "scroll",
      page: { src: "media/aarrkkaa-international/design-01-home.webp", h: 4574 },
      float: { src: "media/aarrkkaa-international/screen-05-find-my-seal-wizard.webp", ratio: 1440 / 710 },
    },
  },
  {
    slug: "velocity",
    name: "Velocity",
    short: "Velocity",
    kind: "Streaming client",
    year: "2026",
    url: "velocitybox.app",
    line: "An open-source streaming client — a Node service, a React web app, and a Flutter client on top.",
    stack: ["Node.js", "Express", "React", "Flutter", "Dart"],
    note: "one backend, two clients",
    tint: "#DFE3F3",
    tint2: "#8E9BEA",
    accent: "#2B37D6",
    sticky: "#FAE57C",
    media: {
      kind: "scroll",
      page: { src: "media/velocity/design-03-architecture.webp", h: 1945 },
      float: { src: "media/velocity/screen-02-premium.webp", ratio: 1440 / 900 },
    },
  },
  {
    slug: "suganniya-construction",
    name: "Suganniya Construction",
    short: "Suganniya",
    kind: "Builder website",
    year: "2026",
    url: "suganniya-construction-nivas01.vercel.app",
    line: "Fourteen static pages for a Trichy builder, a cost estimator, and a scroll-driven 3D story of a building going up.",
    stack: ["Three.js", "Vanilla JS", "esbuild", "Supabase", "Vercel"],
    note: "a building, modelled in code",
    tint: "#ECE8DC",
    tint2: "#F2C230",
    accent: "#B88A00",
    sticky: "#FAE57C",
    media: {
      kind: "flip",
      shots: [
        { src: "media/suganniya-construction/screen-03-b3d-blueprint.webp", month: 1, label: "blueprint" },
        { src: "media/suganniya-construction/screen-04-b3d-foundation.webp", month: 4, label: "foundation" },
        { src: "media/suganniya-construction/screen-05-b3d-frame.webp", month: 11, label: "frame" },
        { src: "media/suganniya-construction/screen-06-b3d-interiors.webp", month: 19, label: "interiors" },
        { src: "media/suganniya-construction/screen-07-b3d-dusk.webp", month: 23, label: "handover" },
      ],
    },
  },
];

/** Every build, for the index stack. Index order = stack order (near → far). */
export const INDEX = [
  { src: "media/arcade/ship-it.jpg", name: "Ship It Inc.", tags: "Arcade, Three.js" },
  { src: "media/jlab-buds-linux/screen-01-sound.webp", name: "JLab Buds", tags: "Desktop, Linux" },
  { src: "media/through-vacations/screen-01-home.webp", name: "Through Vacations", tags: "Web, Travel" },
  { src: "media/miss-minutes/screen-01-cover.webp", name: "Miss Minutes", tags: "Desktop, Voice" },
  { src: "media/velocity/screen-01-home.webp", name: "Velocity", tags: "Web, Streaming" },
  { src: "media/anibakes/screen-01-home.webp", name: "Ani Bakes", tags: "Web, Commerce" },
  { src: "media/estate-ulagam/screen-01-home.webp", name: "Estate Ulagam", tags: "Web, Property" },
  { src: "media/vaaram-magazine/screen-01-home.webp", name: "Vaaram Magazine", tags: "Web, Publishing" },
  { src: "media/jobtrail/screen-02-board.webp", name: "Jobtrail", tags: "Web, AI" },
  { src: "media/suganniya-construction/screen-01-home.webp", name: "Suganniya", tags: "Web, Three.js" },
  { src: "media/aarrkkaa-international/screen-01-home.webp", name: "AARRKKAA", tags: "Web, Commerce" },
  { src: "media/tamil-ner-summarizer/screen-01-input.webp", name: "Tamil NER Summariser", tags: "Research, NLP" },
  { src: "media/suganniya-construction/screen-07-b3d-dusk.webp", name: "Build 3D", tags: "Web, Three.js" },
  { src: "media/jobtrail/screen-01-dashboard.webp", name: "Jobtrail dashboard", tags: "Web, AI" },
  { src: "media/through-vacations/screen-02-destinations.webp", name: "Departure board", tags: "Web, Travel" },
  { src: "media/anibakes/screen-11-admin-analytics.webp", name: "Ani Bakes admin", tags: "Web, Admin" },
];
/** The card that lifts out of the stack and leads into the projects. */
export const INDEX_LIFT = 6;

export const CATEGORIES = [
  { k: "Web", n: 8 },
  { k: "Desktop", n: 3 },
  { k: "Research", n: 1 },
  { k: "Arcade", n: 7 },
  { k: "Browser apps", n: 13 },
  { k: "Live", n: 6 },
  { k: "Open source", n: 2 },
];

export type DeskItem = {
  id: string;
  kicker: string;
  name: string;
  line: string;
  /** Camera target on the canvas: centre and zoom. */
  cam: { x: number; y: number; z: number };
};

export const DESK: DeskItem[] = [
  {
    id: "jobtrail",
    kicker: "Web · Next.js 16 · Appwrite · open source",
    name: "Jobtrail",
    line: "An AI job tracker. Picks the resume to send, scores the fit, fills the form — and stops before Submit.",
    cam: { x: 780, y: 690, z: 1.05 },
  },
  {
    id: "through",
    kicker: "Web · Next.js 16 · React 19 · Motion",
    name: "Through Vacations",
    line: "A Pondicherry travel agency, off Instagram: 17 trips, a postcard hero you can throw, a trip shaper.",
    cam: { x: 2120, y: 600, z: 1.05 },
  },
  {
    id: "minutes",
    kicker: "Desktop · Python · QML · local AI",
    name: "Miss Minutes",
    line: "A voice assistant on my KDE desktop. A three-tier brain, about fifty skills and 281 passing tests.",
    cam: { x: 3420, y: 720, z: 1.0 },
  },
  {
    id: "jlab",
    kicker: "Desktop · reverse engineering · BlueZ",
    name: "JLab Buds for Linux",
    line: "Decompiled the Android app, emulated its ARM64 auth library, rebuilt the protocol in Python.",
    cam: { x: 820, y: 1780, z: 1.05 },
  },
  {
    id: "plasma",
    kicker: "Desktop · QML · KDE Plasma 6",
    name: "Plasma Desktop Toolkit",
    line: "My own widgets: a Material You control center, Quick Look for Dolphin, AI-limit rings, deploys.",
    cam: { x: 2110, y: 1760, z: 1.1 },
  },
  {
    id: "arcade",
    kicker: "On nivas.tech · Three.js · canvas",
    name: "Ship It Inc.",
    line: "A 3D tycoon game about shipping — plus seven arcade games and thirteen apps that run in the browser.",
    cam: { x: 3400, y: 1820, z: 1.0 },
  },
];

export const TECH = [
  { t: "React 19", bg: "#2B37D6", fg: "#fff" },
  { t: "TanStack", bg: "#D9F36B", fg: "#17160F" },
  { t: "Postgres", bg: "#17160F", fg: "#fff" },
  { t: "Flutter", bg: "#fff", fg: "#2B37D6" },
  { t: "Supabase", bg: "#BDBCB5", fg: "#17160F" },
  { t: "Python", bg: "#E5352B", fg: "#fff" },
  { t: "TypeScript", bg: "#17160F", fg: "#D9F36B" },
  { t: "Node.js", bg: "#fff", fg: "#17160F" },
  { t: "Prisma", bg: "#2B37D6", fg: "#D9F36B" },
  { t: "Next.js", bg: "#fff", fg: "#17160F" },
  { t: "Three.js", bg: "#D9F36B", fg: "#17160F" },
  { t: "Appwrite", bg: "#F7C5D9", fg: "#17160F" },
  { t: "PySide6", bg: "#17160F", fg: "#fff" },
  { t: "TensorFlow", bg: "#DD6B3D", fg: "#fff" },
  { t: "spaCy", bg: "#fff", fg: "#E5352B" },
  { t: "Vercel", bg: "#17160F", fg: "#fff" },
  { t: "Dart", bg: "#CFDFFA", fg: "#17160F" },
  { t: "QML", bg: "#FAE57C", fg: "#17160F" },
];
