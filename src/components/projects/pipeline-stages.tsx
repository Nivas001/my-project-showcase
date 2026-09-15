import type { TechId } from "@/components/kit/TechMark";

/* ==========================================================================
 * THE STAGES
 *
 * The seven passes every project here goes through, from a conversation to a
 * URL someone can open. Content lives apart from the scroll machinery so the
 * copy can be edited without touching any of the 3D maths.
 * ======================================================================== */

export type Stage = {
  id: string;
  index: string;
  title: string;
  kicker: string;
  body: string;
  /** Three or four concrete things that actually happen in this pass. */
  beats: readonly string[];
  tools: readonly TechId[];
  accent: string;
  /** Handwritten aside pinned to the card. */
  note?: string;
  illustration: React.ReactNode;
};

/* --------------------------------------------------------------------------
 * Illustrations. One scene each, drawn in a 160x120 box, monochrome in
 * `currentColor` so every one inherits its stage accent.
 * ------------------------------------------------------------------------ */

const Requirements = (
  <svg viewBox="0 0 160 120" fill="none" aria-hidden className="h-full w-full">
    <rect x="30" y="14" width="76" height="94" rx="6" fill="currentColor" opacity="0.1" />
    <rect
      x="30"
      y="14"
      width="76"
      height="94"
      rx="6"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path d="M30 32h76" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
    {[46, 62, 78, 94].map((y, i) => (
      <g key={y}>
        <rect
          x="40"
          y={y - 7}
          width="12"
          height="12"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.8"
          fill={i < 2 ? "currentColor" : "none"}
          fillOpacity={i < 2 ? 0.35 : 0}
        />
        {i < 2 ? (
          <path
            d={`M43 ${y - 1}l3 3 5-6`}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        <path
          d={`M58 ${y - 1}h${i === 3 ? 22 : 38}`}
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.45"
        />
      </g>
    ))}
    {/* pencil */}
    <g transform="rotate(38 124 58)">
      <rect x="118" y="22" width="12" height="52" rx="3" fill="currentColor" opacity="0.28" />
      <path d="M118 74h12l-6 12-6-12Z" fill="currentColor" />
      <path d="M118 30h12" stroke="currentColor" strokeWidth="2" opacity="0.6" />
    </g>
  </svg>
);

const Design = (
  <svg viewBox="0 0 160 120" fill="none" aria-hidden className="h-full w-full">
    <rect x="14" y="16" width="60" height="44" rx="5" fill="currentColor" opacity="0.14" />
    <rect x="14" y="16" width="60" height="44" rx="5" stroke="currentColor" strokeWidth="2" />
    <rect
      x="86"
      y="16"
      width="60"
      height="44"
      rx="5"
      stroke="currentColor"
      strokeWidth="2"
      opacity="0.5"
    />
    <rect
      x="14"
      y="70"
      width="60"
      height="38"
      rx="5"
      stroke="currentColor"
      strokeWidth="2"
      opacity="0.5"
    />
    <rect x="86" y="70" width="60" height="38" rx="5" fill="currentColor" opacity="0.2" />
    <rect x="86" y="70" width="60" height="38" rx="5" stroke="currentColor" strokeWidth="2" />
    <path
      d="M22 30h30M22 40h44M22 50h20"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      opacity="0.5"
    />
    <circle cx="116" cy="84" r="9" stroke="currentColor" strokeWidth="2" />
    <path
      d="M94 100h44"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      opacity="0.5"
    />
    {/* cursor */}
    <path d="M100 44l16 22-7 1-3 8-6-31Z" fill="currentColor" />
  </svg>
);

const Coding = (
  <svg viewBox="0 0 160 120" fill="none" aria-hidden className="h-full w-full">
    <rect x="12" y="14" width="136" height="92" rx="7" fill="currentColor" opacity="0.1" />
    <rect x="12" y="14" width="136" height="92" rx="7" stroke="currentColor" strokeWidth="2" />
    <path d="M12 32h136" stroke="currentColor" strokeWidth="1.8" opacity="0.5" />
    <circle cx="24" cy="23" r="3" fill="currentColor" opacity="0.6" />
    <circle cx="34" cy="23" r="3" fill="currentColor" opacity="0.4" />
    <circle cx="44" cy="23" r="3" fill="currentColor" opacity="0.25" />
    <path
      d="M28 44h14"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.35"
    />
    <path
      d="M48 44h46"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.65"
    />
    <path
      d="M36 58h20"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.35"
    />
    <path d="M62 58h54" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    <path
      d="M36 72h38"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.65"
    />
    <path
      d="M28 86h30"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.35"
    />
    <rect x="64" y="82" width="4" height="9" fill="currentColor" />
  </svg>
);

const Debugging = (
  <svg viewBox="0 0 160 120" fill="none" aria-hidden className="h-full w-full">
    <rect
      x="12"
      y="20"
      width="98"
      height="82"
      rx="6"
      stroke="currentColor"
      strokeWidth="2"
      fill="currentColor"
      fillOpacity="0.08"
    />
    <path
      d="M22 38h58M22 50h44M22 62h66M22 74h32"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      opacity="0.35"
    />
    <path d="M22 50h44" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    {/* bug */}
    <g transform="translate(96 44)">
      <ellipse cx="18" cy="20" rx="12" ry="14" fill="currentColor" opacity="0.28" />
      <ellipse cx="18" cy="20" rx="12" ry="14" stroke="currentColor" strokeWidth="2" />
      <path
        d="M18 6v28M2 14h8M26 14h8M3 26h7M26 26h8M9 6l5 4M27 6l-5 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
    {/* magnifier */}
    <circle cx="112" cy="62" r="24" stroke="currentColor" strokeWidth="3" opacity="0.6" />
    <path
      d="M129 79l16 16"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

const Testing = (
  <svg viewBox="0 0 160 120" fill="none" aria-hidden className="h-full w-full">
    <rect
      x="18"
      y="14"
      width="124"
      height="92"
      rx="6"
      stroke="currentColor"
      strokeWidth="2"
      fill="currentColor"
      fillOpacity="0.08"
    />
    {[34, 52, 70, 88].map((y, i) => (
      <g key={y}>
        <circle
          cx="38"
          cy={y}
          r="8"
          fill="currentColor"
          fillOpacity={i === 3 ? 0.12 : 0.3}
          stroke="currentColor"
          strokeWidth="2"
        />
        {i < 3 ? (
          <path
            d={`M34 ${y}l3 3 6-7`}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d={`M35 ${y - 3}l6 6M41 ${y - 3}l-6 6`}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}
        <path
          d={`M54 ${y}h${[62, 48, 70, 40][i]}`}
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          opacity="0.4"
        />
      </g>
    ))}
  </svg>
);

const Security = (
  <svg viewBox="0 0 160 120" fill="none" aria-hidden className="h-full w-full">
    <path
      d="M80 8 30 26v34c0 26 20 46 50 54 30-8 50-28 50-54V26L80 8Z"
      fill="currentColor"
      opacity="0.14"
    />
    <path
      d="M80 8 30 26v34c0 26 20 46 50 54 30-8 50-28 50-54V26L80 8Z"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    <rect x="62" y="56" width="36" height="28" rx="5" fill="currentColor" opacity="0.32" />
    <rect x="62" y="56" width="36" height="28" rx="5" stroke="currentColor" strokeWidth="2.2" />
    <path d="M69 56v-8a11 11 0 0 1 22 0v8" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="80" cy="69" r="4" fill="currentColor" />
  </svg>
);

const Hosting = (
  <svg viewBox="0 0 160 120" fill="none" aria-hidden className="h-full w-full">
    <circle
      cx="80"
      cy="62"
      r="40"
      stroke="currentColor"
      strokeWidth="2.4"
      fill="currentColor"
      fillOpacity="0.08"
    />
    <ellipse
      cx="80"
      cy="62"
      rx="18"
      ry="40"
      stroke="currentColor"
      strokeWidth="1.8"
      opacity="0.5"
    />
    <path d="M42 48h76M42 76h76" stroke="currentColor" strokeWidth="1.8" opacity="0.5" />
    <path d="M80 22v80" stroke="currentColor" strokeWidth="1.8" opacity="0.35" />
    {/* deploy arrow */}
    <path d="M118 42l22-22" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
    <path
      d="M124 20h16v16"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const STAGES: readonly Stage[] = [
  {
    id: "requirements",
    index: "01",
    title: "Work out what it actually needs",
    kicker: "Requirements",
    body: "Before a line of code: what does this thing have to do, for whom, and what breaks if it does not? Most of what people ask for is a solution to something they have not described yet.",
    beats: [
      "Sit with the owner and write down the real job",
      "Cut the scope to what a first release must carry",
      "Sketch the data model — everything else follows it",
    ],
    tools: ["notebook", "figma"],
    accent: "hog-blue",
    note: "half the work is here",
    illustration: Requirements,
  },
  {
    id: "design",
    index: "02",
    title: "Draw it before building it",
    kicker: "Design",
    body: "Screens, states and the unglamorous ones — empty, loading, error, too much data. Deciding these on a canvas costs minutes; deciding them in React costs days.",
    beats: [
      "Every screen, including the ugly states",
      "One type scale, one spacing scale, one palette",
      "An admin surface the owner can actually run",
    ],
    tools: ["figma", "tailwind"],
    accent: "hog-purple",
    illustration: Design,
  },
  {
    id: "coding",
    index: "03",
    title: "Build it end to end",
    kicker: "Coding",
    body: "Schema, server, client, admin. I write the whole vertical slice rather than a layer of it, because the interesting bugs live exactly on the seams between layers.",
    beats: [
      "Typed from the database row to the rendered prop",
      "Server-rendered so the first paint is real content",
      "Mobile builds in Flutter when native is the honest answer",
    ],
    tools: ["typescript", "react", "python", "flutter", "node"],
    accent: "hog-red",
    note: "the fun part",
    illustration: Coding,
  },
  {
    id: "debugging",
    index: "04",
    title: "Find out what is lying to you",
    kicker: "Debugging",
    body: "The bug is rarely where the stack trace points. I reproduce it, shrink it until it is boring, then fix the cause rather than the symptom that showed up in the console.",
    beats: [
      "Reproduce it before touching anything",
      "Shrink the failing case until it is obvious",
      "Fix the cause, then leave a note about why",
    ],
    tools: ["bug", "console"],
    accent: "hog-orange",
    illustration: Debugging,
  },
  {
    id: "testing",
    index: "05",
    title: "Try to break it on purpose",
    kicker: "Testing",
    body: "Real devices, bad networks, wrong inputs, double-clicks on the pay button. Anything a user can do by accident, I do on purpose first.",
    beats: [
      "The unhappy paths, not just the demo route",
      "Payments and uploads under a flaky connection",
      "Real phones, not only a desktop viewport",
    ],
    tools: ["flask", "console"],
    accent: "hog-green",
    note: "double-click everything",
    illustration: Testing,
  },
  {
    id: "security",
    index: "06",
    title: "Lock it down before anyone else does",
    kicker: "Security",
    body: "Row-level security on every table, signed URLs for private files, roles checked on the server and never only in the UI. A hidden button is not a permission.",
    beats: [
      "Row-level security on every table, no exceptions",
      "Role checks on the server, never only in the client",
      "Secrets in the environment, never in the repository",
    ],
    tools: ["shield", "lock", "postgres"],
    accent: "hog-yellow",
    illustration: Security,
  },
  {
    id: "hosting",
    index: "07",
    title: "Put it somewhere real",
    kicker: "Shipping",
    body: "A domain, a build pipeline, a database that gets backed up, and an owner who can change the content without calling me. That last one is what makes it finished.",
    beats: [
      "Deploys on push, with previews on every branch",
      "Managed Postgres, storage and auth behind it",
      "Handover: the owner edits it themselves from day one",
    ],
    tools: ["vercel", "cloudflare", "supabase", "firebase", "github"],
    accent: "hog-green",
    note: "live URL or it didn't happen",
    illustration: Hosting,
  },
] as const;

/** Everything the pipeline touches, for the marquee under the section. */
export const PIPELINE_TOOLS: readonly TechId[] = [
  "typescript",
  "react",
  "python",
  "flutter",
  "node",
  "postgres",
  "supabase",
  "firebase",
  "vercel",
  "cloudflare",
  "tailwind",
  "github",
  "huggingface",
  "tensorflow",
  "prisma",
  "figma",
];
