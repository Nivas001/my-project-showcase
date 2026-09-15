import resumeAsset from "@/assets/resume.pdf.asset.json";

export const site = {
  name: "Srinivas",
  fullName: "Srinivas M",
  /** Three stacked lines for the homepage display type. Keep them short. */
  displayLines: ["Srinivas M", "Full-Stack", "Engineer"],
  role: "Full-stack engineer · Flutter · Applied NLP",
  shortRole: "Full-stack · Mobile · NLP",
  location: "Pondicherry, India",
  locationShort: "Pondicherry, IN",
  timezone: "Asia/Kolkata",
  email: "nivassri183@gmail.com",
  phone: "+91 7448724920",
  github: "https://github.com/Nivas001",
  linkedin: "https://www.linkedin.com/in/srinivas-m-734631259",
  videoResumeUrl:
    "https://drive.google.com/file/d/1U5qK7ywjGuswO9rOsc5f5an4AIRFWibx/view?usp=sharing",
  resumeUrl: resumeAsset.url,

  /** One line. Used in the hero, under the name. */
  tagline: "I build production software end to end — and I ship it.",

  /** Two or three sentences. Used on the homepage and /about. */
  summary:
    "I ship production software. Three products are live right now — an artisanal commerce platform with slot scheduling and payments, an industrial supply storefront, and a streaming client — all built and deployed solo. Alongside that I wrote a research-grade Tamil summarisation model that preserves named entities, and put it on Hugging Face where anyone can run it.",

  /** The longer version, for /about. */
  bio: [
    "I'm a full-stack engineer based in Pondicherry. I like the whole arc of a product: the schema, the server, the interface, the deploy, and the unglamorous admin panel someone has to use every day.",
    "Most of what I've built, I've built alone — which means I've had to be decisive about architecture and honest about trade-offs. Ani Bakes runs React 19 on TanStack Start with Appwrite and Razorpay. AARRKKAA runs Prisma and Postgres behind the same stack. Velocity is a Node service with a Flutter client on top.",
    "The other half of my work is applied NLP. My postgraduate research tackled abstractive summarisation in Tamil, a low-resource language where off-the-shelf models lose the names that make a news story mean anything. I fine-tuned mT5 with PEFT and wired NER in to hold those entities in place.",
  ],
} as const;

/** `aarrkkaa.com` and `velocitybox.app` are stored without a protocol, which
 *  makes them resolve as relative paths. Normalise before rendering any link. */
export function toAbsoluteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `https://${trimmed}`;
}

/**
 * "Ani Bakes - E-comerce Platform" -> "Ani Bakes".
 * Stored titles append a descriptor; the hero only wants the product name.
 */
export function shortTitle(title: string): string {
  return (title.split(/\s+[-–—:|]\s+/)[0] ?? title).trim();
}

/** Strip protocol and trailing slash for display: "https://x.com/" -> "x.com" */
export function prettyUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

/* -------------------------------------------------------------------------- */
/* Homepage content                                                            */
/* -------------------------------------------------------------------------- */

/** Act I statement panels. One per full-height pinned screen. */
export const statements = [
  {
    index: "01",
    kicker: "What I do",
    line: ["I build things", "that ship."],
    body: "Not prototypes. Three products are in production with real users, real payments and real uptime. I own them end to end — schema to deploy.",
  },
  {
    index: "02",
    kicker: "How I think",
    line: ["Research-grade", "when it earns it."],
    body: "My postgraduate work solved abstractive summarisation for Tamil, a low-resource language. mT5 fine-tuned with PEFT, NER wired in to keep names intact. It's public on Hugging Face.",
  },
  {
    index: "03",
    kicker: "Where I work",
    line: ["Web, mobile,", "and the messy", "bits between."],
    body: "React and TanStack on the front. Node, Postgres, Supabase and Appwrite behind it. Flutter when it needs to be native. Plus every admin panel nobody else wants to build.",
  },
] as const;

/** Act II capability cards. Four, to echo PostHog's feature grid. */
export const pillars = [
  {
    id: "ship",
    label: "Ship",
    title: "Full products, not features",
    body: "Auth, payments, scheduling, storage, admin, deploy. I take a product from an empty repo to a live domain without handing off the hard parts.",
    accent: "hog-red",
    items: [
      "TanStack Start (SSR)",
      "React 19 + TypeScript",
      "Razorpay checkout",
      "Cloudflare / Vercel",
    ],
  },
  {
    id: "model",
    label: "Model",
    title: "NLP that survives real text",
    body: "Fine-tuning, evaluation, and the unglamorous data cleaning that decides whether any of it works. Published and reproducible.",
    accent: "hog-blue",
    items: [
      "mT5 + PEFT fine-tuning",
      "Named entity recognition",
      "spaCy / NLTK / TensorFlow",
      "Hugging Face Spaces",
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    title: "Native when it has to be",
    body: "Flutter apps with real backends behind them — auth, live data sync, and a release pipeline that actually gets to a store build.",
    accent: "hog-yellow",
    items: ["Flutter + Dart", "Firebase / Firestore", "Offline-first sync", "Play Store releases"],
  },
  {
    id: "operate",
    label: "Operate",
    title: "The panel they use daily",
    body: "Every product I ship comes with a CMS its owner can actually run: drag-to-reorder media, role-gated access, signed uploads, no developer required.",
    accent: "hog-green",
    items: ["Role-gated admin", "Drag-and-drop media", "Signed storage URLs", "Row-level security"],
  },
] as const;

/** How-I-work principles. Deliberately opinionated. */
export const principles = [
  {
    title: "Ship it, then make it good",
    body: "A live v1 teaches you more in a week than a spec does in a month. I get something real in front of people early, then harden it against what actually broke.",
  },
  {
    title: "Own the whole stack",
    body: "Handoffs are where products die. I'd rather understand the schema, the server, the client and the deploy than be excellent at exactly one of them.",
  },
  {
    title: "Boring tech, interesting problems",
    body: "Postgres, TypeScript and server-rendered React solve almost everything. I save the novelty budget for the part of the problem that's genuinely new.",
  },
  {
    title: "Build the admin panel too",
    body: "Software that needs a developer to update it isn't finished. If the person who owns the product can't change it themselves, I haven't done my job.",
  },
] as const;

/** Milestones, newest first. `slug` links to a project; null links to /about. */
export const changelog = [
  {
    date: "Aug 2026",
    tag: "Shipped",
    accent: "hog-red",
    title: "AARRKKAA International goes live",
    body: "Industrial supply storefront for a Hosur-based distributor of pumps, seals and precision components. Prisma + Postgres behind TanStack Start.",
    slug: "aarrkkaa-international",
  },
  {
    date: "Jun 2026",
    tag: "Started",
    accent: "hog-purple",
    title: "Velocity enters development",
    body: "An open-source streaming client — Node and Express service, React web app, Flutter mobile client on top.",
    slug: "velocity",
  },
  {
    date: "Jul 2025",
    tag: "Building",
    accent: "hog-yellow",
    title: "Ani Bakes commerce platform",
    body: "Small-batch slot scheduling, bespoke cake customisation, multi-tier pricing and Razorpay checkout for a boutique bakery.",
    slug: "anibakes",
  },
  {
    date: "Jun 2025",
    tag: "Published",
    accent: "hog-blue",
    title: "Tamil summarisation model released",
    body: "Postgraduate research on entity-preserving abstractive summarisation, deployed as a public Hugging Face Space.",
    slug: "tamil-ner-summarizer",
  },
  {
    date: "Jun 2025",
    tag: "Graduated",
    accent: "hog-green",
    title: "MCA, Pondicherry University — 8.79/10",
    body: "Two years of computer applications, finished with a research project instead of a coursework one.",
    slug: null,
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Static fallbacks — used when the Supabase tables are empty                   */
/* -------------------------------------------------------------------------- */

export const skills = [
  { group: "Languages", items: ["Python", "TypeScript", "JavaScript", "Dart", "Java", "SQL", "C"] },
  {
    group: "Frameworks & Libraries",
    items: [
      "React 19",
      "TanStack Start",
      "Flutter",
      "Node.js",
      "Express",
      "TensorFlow",
      "spaCy",
      "NLTK",
    ],
  },
  {
    group: "Data & Infrastructure",
    items: [
      "PostgreSQL",
      "Supabase",
      "Appwrite",
      "Firebase",
      "Prisma",
      "Cloudflare Workers",
      "Vercel",
    ],
  },
  {
    group: "Concepts",
    items: [
      "NLP",
      "Named entity recognition",
      "Deep learning",
      "REST APIs",
      "SSR",
      "DBMS",
      "Data structures",
    ],
  },
];

export const education = [
  {
    degree: "Master of Computer Application (MCA)",
    school: "Pondicherry University",
    period: "2023 – 2025",
    score: "GPA 8.79 / 10",
    note: "Postgraduate research: Tamil abstractive summarisation with NER",
  },
  {
    degree: "Bachelor of Computer Application (BCA)",
    school: "Indira Gandhi College of Arts and Science",
    period: "2020 – 2023",
    score: "GPA 7.7 / 10",
    note: "Final year project: CENTAC admissions Android app — team lead",
  },
  {
    degree: "Higher Secondary (12th)",
    school: "Petit Seminaire, Pondicherry",
    period: "2019 – 2020",
    score: "74%",
    note: "",
  },
  {
    degree: "Secondary (10th)",
    school: "Petit Seminaire, Pondicherry",
    period: "2017 – 2018",
    score: "85%",
    note: "",
  },
];

export const certifications = [
  { title: "Python Bootcamp", issuer: "NPTEL & Udemy", year: "2025" },
  { title: "Ethical Hacking", issuer: "NPTEL & Udemy", year: "2025" },
  { title: "Web Development", issuer: "Udemy", year: "2025" },
  { title: "Android Development", issuer: "Udemy", year: "2023" },
  { title: "Cisco Packet Tracer Networking Workshop", issuer: "Cisco", year: "2022" },
];

/**
 * What the menu bar cycles through. A deliberate static mirror of the projects
 * marked live in the database: the chrome renders on every route, and a decorative
 * ticker is not worth a data fetch on pages that need nothing else from it.
 */
export const shippingNow = ["AARRKKAA", "Ani Bakes", "Velocity"];

/** The tech ticker under the hero. */
export const tickerItems = [
  "React 19",
  "TanStack Start",
  "TypeScript",
  "Python",
  "Flutter",
  "PostgreSQL",
  "Supabase",
  "Node.js",
  "TensorFlow",
  "Prisma",
  "Appwrite",
  "spaCy",
  "Razorpay",
  "Cloudflare",
  "Hugging Face",
];

/** Turn a YouTube or Google Drive share link into an embeddable URL. */
export function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (parsed.pathname.startsWith("/embed/")) return url;
    }
    if (parsed.hostname.includes("drive.google.com")) {
      const match = parsed.pathname.match(/\/d\/([^/]+)/);
      if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  } catch {
    return null;
  }
}
