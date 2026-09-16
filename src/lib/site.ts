export const site = {
  name: "Srinivas",
  /** Canonical origin. No trailing slash — everything else appends a path. */
  url: "https://nivas.tech",
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
  /* Served from public/. The previous value was a Lovable-only asset path
     (/__l5e/assets-v1/...) which 404s anywhere else — every "Download résumé"
     button on the site was dead outside the Lovable preview. */
  resumeUrl: "/Srinivas-M-Resume.pdf",

  /** One line. Used in the hero, under the name. */
  tagline: "I build production software end to end — and I ship it.",

  /** Two or three sentences. Used on the homepage and /about. */
  summary:
    "I ship production software. Five products are live right now — a cross-border property platform reviewing listings across 18 markets, a weekly magazine publishing in Canada, an artisanal commerce platform with slot scheduling and payments, an industrial supply storefront, and a streaming client — all built and deployed solo. Alongside that I wrote a research-grade Tamil summarisation model that preserves named entities, and put it on Hugging Face where anyone can run it.",

  /** The longer version, for /about. */
  bio: [
    "I'm a full-stack engineer based in Pondicherry. I like the whole arc of a product: the schema, the server, the interface, the deploy, and the unglamorous admin panel someone has to use every day.",
    "Most of what I've built, I've built alone — which means I've had to be decisive about architecture and honest about trade-offs. Ani Bakes runs React 19 on TanStack Start with Appwrite and Razorpay. AARRKKAA runs Prisma and Postgres behind the same stack. Velocity is a Node service with a Flutter client on top.",
    "The other half of my work is applied NLP. My postgraduate research tackled abstractive summarisation in Tamil, a low-resource language where off-the-shelf models lose the names that make a news story mean anything. I fine-tuned mT5 with PEFT and wired NER in to hold those entities in place.",
  ],
} as const;

/**
 * The canonical <link> for a page.
 *
 * Without one, every alternate host the app answers on — the Vercel preview
 * domain, the Lovable preview, www vs apex, a URL carrying a `?utm_*` tail —
 * is a separate page as far as a crawler is concerned, and the ranking for the
 * real one is split across all of them.
 *
 * Pass the path only, with a leading slash. Query strings never belong here.
 */
export function canonical(path: string): { rel: "canonical"; href: string } {
  return { rel: "canonical", href: path === "/" ? `${site.url}/` : `${site.url}${path}` };
}

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

/**
 * The hero's one-line answer to "who is this?", said four different ways.
 *
 * A visitor arrives with a job in mind, not a person in mind. Letting them
 * pick the job and answering in their own terms beats a single paragraph that
 * tries to be all four at once.
 */
export const needs = [
  {
    id: "product",
    label: "A whole product",
    answer:
      "I take it from an empty repo to a live domain — schema, server, interface, payments, admin panel, deploy. No handoffs, no missing half.",
    proof: "5 live in production",
    stack: ["TanStack Start", "React 19", "PostgreSQL", "Razorpay", "Vercel"],
    accent: "hog-red",
  },
  {
    id: "mobile",
    label: "A mobile app",
    answer:
      "Flutter on the front, a real backend behind it: auth, live sync, offline-first storage, and a release pipeline that reaches an actual store build.",
    proof: "Android released",
    stack: ["Flutter", "Dart", "Firebase", "Node.js"],
    accent: "hog-blue",
  },
  {
    id: "nlp",
    label: "An NLP model",
    answer:
      "Postgraduate research on Tamil summarisation: mT5 fine-tuned with PEFT and NER wired in so named entities survive. Public and reproducible.",
    proof: "Published on Hugging Face",
    stack: ["Python", "mT5 + PEFT", "spaCy", "TensorFlow", "Hugging Face"],
    accent: "hog-purple",
  },
  {
    id: "panel",
    label: "The boring admin panel",
    answer:
      "The CMS nobody wants to build and everybody needs: drag-to-reorder media, signed uploads, role-gated access, row-level security. The owner runs it without me.",
    proof: "Ships with every build",
    stack: ["Supabase", "Row-level security", "Signed URLs", "Drag & drop"],
    accent: "hog-green",
  },
] as const;

/**
 * /about's hero is a page being edited: the bio types itself out, line by
 * line, with notes pinned in the margin. Three drafts of the same person, so
 * a visitor in a hurry and a visitor who wants the whole thing both get served.
 *
 * `lines` are typed in order. A line with a `note` gets a handwritten aside
 * pinned beside it once it lands.
 */
export const aboutDrafts = [
  {
    id: "short",
    label: "30 seconds",
    stamp: "draft 1",
    lines: [
      { text: "Full-stack engineer. Pondicherry, India.", note: null },
      { text: "Five products live in production.", note: "all shipped solo" },
      { text: "One published NLP model on Hugging Face.", note: null },
      { text: "MCA, Pondicherry University — 8.79 / 10.", note: null },
      { text: "Available for work. Replies within a day.", note: "yes, really" },
    ],
  },
  {
    id: "long",
    label: "The long version",
    stamp: "draft 3",
    lines: [
      { text: "I like the whole arc of a product —", note: null },
      { text: "the schema, the server, the interface,", note: null },
      { text: "the deploy, and the unglamorous admin", note: "especially this one" },
      { text: "panel someone has to use every day.", note: null },
      { text: "Most of it I have built alone, which", note: null },
      { text: "means being decisive about architecture", note: null },
      { text: "and honest about the trade-offs.", note: "both are learnable" },
    ],
  },
  {
    id: "facts",
    label: "Just the facts",
    stamp: "final",
    lines: [
      { text: "Web:     React 19 · TanStack Start · SSR", note: null },
      { text: "Mobile:  Flutter · Dart · Firebase", note: null },
      { text: "Data:    PostgreSQL · Supabase · Prisma", note: null },
      { text: "ML:      Python · mT5 + PEFT · spaCy", note: "the research half" },
      { text: "Ship:    Vercel · Cloudflare · GitHub CI", note: null },
    ],
  },
] as const;

/** Pinned to the /about hero like notes stuck to a monitor. */
export const aboutNotes = [
  { text: "built the admin panel too", tone: "hog-green", rotate: -4 },
  { text: "reads the Postgres docs for fun", tone: "hog-blue", rotate: 3 },
  { text: "will argue about naming", tone: "hog-red", rotate: -2 },
] as const;

/** Rotates under the name. Short enough to read in one glance. */
export const roleRotation = [
  "ships whole products",
  "writes the schema too",
  "builds the admin panel",
  "publishes the research",
  "deploys it himself",
];

/**
 * Act I statement panels. One per full-height pinned screen.
 *
 * `evidence` is the part that stops each claim being a slogan: three checkable
 * facts sitting directly under it. `scene` selects the illustration that plays
 * behind the panel (see Statements.tsx).
 */
export const statements = [
  {
    index: "01",
    kicker: "What I do",
    line: ["I build things", "that ship."],
    body: "Not prototypes. Five products are in production with real users, real payments and real uptime. I own them end to end — schema to deploy.",
    note: "all three are live right now",
    accent: "hog-red",
    scene: "deploy",
    evidence: [
      { value: "5", label: "live in production" },
      { value: "0", label: "handoffs required" },
      { value: "100%", label: "built solo" },
    ],
  },
  {
    index: "02",
    kicker: "How I think",
    line: ["Research-grade", "when it earns it."],
    body: "My postgraduate work solved abstractive summarisation for Tamil, a low-resource language. mT5 fine-tuned with PEFT, NER wired in to keep names intact. It's public on Hugging Face.",
    note: "names survive the summary",
    accent: "hog-blue",
    scene: "model",
    evidence: [
      { value: "mT5", label: "fine-tuned with PEFT" },
      { value: "NER", label: "entities preserved" },
      { value: "8.79", label: "MCA GPA / 10" },
    ],
  },
  {
    index: "03",
    kicker: "Where I work",
    line: ["Web, mobile,", "and the messy", "bits between."],
    body: "React and TanStack on the front. Node, Postgres, Supabase and Appwrite behind it. Flutter when it needs to be native. Plus every admin panel nobody else wants to build.",
    note: "including the boring half",
    accent: "hog-green",
    scene: "devices",
    evidence: [
      { value: "Web", label: "React · TanStack · SSR" },
      { value: "Mobile", label: "Flutter · Firebase" },
      { value: "Backend", label: "Postgres · Supabase" },
    ],
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
    date: "Sep 2026",
    tag: "Shipped",
    accent: "hog-blue",
    title: "Vaaram Magazine publishes its first edition",
    body: "A weekly advertising and classifieds magazine for readers across Canada — PDF editions, a full archive, sponsored banner slots and a one-email-per-edition list. Next.js and Supabase.",
    slug: "vaaram-magazine",
  },
  {
    date: "Sep 2026",
    tag: "Building",
    accent: "hog-purple",
    title: "Estate Ulagam opens across 18 markets",
    body: "Review-gated property discovery spanning South Asia, the Middle East, Europe, the Americas and Asia-Pacific. Multi-currency pricing, curated collections, mobile clients planned.",
    slug: "estate-ulagam",
  },
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
export const shippingNow = [
  "Estate Ulagam",
  "Vaaram Magazine",
  "Ani Bakes",
  "AARRKKAA",
  "Velocity",
];

/** The tech ticker under the hero. */
export const tickerItems = [
  "React 19",
  "TanStack Start",
  "Next.js",
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
