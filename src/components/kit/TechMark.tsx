import { cn } from "@/lib/utils";

/* ==========================================================================
 * TECH MARKS
 *
 * Simplified geometric glyphs for the tools in the stack, each in its own
 * brand colour. These are stylised marks for a diagram, not reproductions of
 * anyone's logo — every one is a plain shape drawn to read at 24px, and the
 * name is always printed alongside so nothing depends on recognising a mark.
 * ======================================================================== */

export type TechId =
  | "figma"
  | "notebook"
  | "typescript"
  | "react"
  | "python"
  | "flutter"
  | "node"
  | "tailwind"
  | "bug"
  | "console"
  | "flask"
  | "shield"
  | "lock"
  | "postgres"
  | "supabase"
  | "firebase"
  | "vercel"
  | "cloudflare"
  | "github"
  | "huggingface"
  | "tensorflow"
  | "prisma";

type Spec = {
  label: string;
  /** Brand-ish colour. Used for the glyph and a faint tile wash. */
  color: string;
  glyph: React.ReactNode;
};

const S = 24;

/* Every path below is drawn in a 24x24 box so the marks share an optical size. */
const SPECS: Record<TechId, Spec> = {
  figma: {
    label: "Figma",
    color: "oklch(0.68 0.2 25)",
    glyph: (
      <>
        <path d="M12 2H8.5a3.5 3.5 0 1 0 0 7H12V2Z" fill="oklch(0.68 0.2 25)" />
        <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2Z" fill="oklch(0.74 0.17 60)" />
        <path d="M12 9H8.5a3.5 3.5 0 1 0 0 7H12V9Z" fill="oklch(0.62 0.2 300)" />
        <path d="M12 16H8.5a3.5 3.5 0 1 0 3.5 3.5V16Z" fill="oklch(0.68 0.16 150)" />
        <circle cx="15.5" cy="12.5" r="3.5" fill="oklch(0.62 0.19 250)" />
      </>
    ),
  },
  notebook: {
    label: "Requirements",
    color: "oklch(0.72 0.16 250)",
    glyph: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor" opacity="0.16" />
        <rect
          x="4"
          y="3"
          width="16"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
        <path
          d="M8 8h8M8 12h8M8 16h5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </>
    ),
  },
  typescript: {
    label: "TypeScript",
    color: "oklch(0.55 0.17 250)",
    glyph: (
      <>
        <rect x="2.5" y="2.5" width="19" height="19" rx="3" fill="currentColor" />
        <path
          d="M7 11h6M10 11v7"
          stroke="oklch(0.99 0 0)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M20 12.2c-.7-.8-1.6-1.2-2.6-1.2-1.3 0-2.2.7-2.2 1.7 0 2.3 4.8 1.4 4.8 4.1 0 1.3-1.2 2.2-2.8 2.2-1.2 0-2.2-.4-2.9-1.2"
          stroke="oklch(0.99 0 0)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </>
    ),
  },
  react: {
    label: "React",
    color: "oklch(0.78 0.12 210)",
    glyph: (
      <>
        <circle cx="12" cy="12" r="2.1" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.3" fill="none">
          <ellipse cx="12" cy="12" rx="10" ry="4.2" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
        </g>
      </>
    ),
  },
  python: {
    label: "Python",
    color: "oklch(0.6 0.14 250)",
    glyph: (
      <>
        <path
          d="M11.9 2c-2.6 0-4.4.9-4.4 3v2.3h4.6v.8H5.7C3.6 8.1 2 9.4 2 12s1.5 3.9 3.5 3.9h1.7v-2.6c0-2.1 1.7-3.6 3.8-3.6h4.3c1.8 0 3.2-1.4 3.2-3.2V5c0-1.9-1.7-3-4.3-3h-2.3Z"
          fill="oklch(0.6 0.14 250)"
        />
        <circle cx="9.3" cy="5.2" r="1.05" fill="oklch(0.99 0 0)" />
        <path
          d="M12.1 22c2.6 0 4.4-.9 4.4-3v-2.3h-4.6v-.8h6.4c2.1 0 3.7-1.3 3.7-3.9s-1.5-3.9-3.5-3.9h-1.7v2.6c0 2.1-1.7 3.6-3.8 3.6H8.7c-1.8 0-3.2 1.4-3.2 3.2V19c0 1.9 1.7 3 4.3 3h2.3Z"
          fill="oklch(0.82 0.15 90)"
        />
        <circle cx="14.7" cy="18.8" r="1.05" fill="oklch(0.99 0 0)" />
      </>
    ),
  },
  flutter: {
    label: "Flutter",
    color: "oklch(0.7 0.14 230)",
    glyph: (
      <>
        <path d="M14.4 1.6 4 12l3.2 3.2L20.8 1.6h-6.4Z" fill="oklch(0.72 0.13 232)" />
        <path d="M14.4 11.1 8.6 16.9l3.2 3.2 3.2-3.2h5.8l-6.4-5.8Z" fill="oklch(0.78 0.12 226)" />
        <path d="M11.8 20.1 15 23.3h5.8l-5.8-6.4-3.2 3.2Z" fill="oklch(0.62 0.13 240)" />
      </>
    ),
  },
  node: {
    label: "Node.js",
    color: "oklch(0.68 0.17 145)",
    glyph: (
      <>
        <path
          d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"
          fill="currentColor"
          opacity="0.18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M15.5 9.8c0-1.1-1.1-1.8-3.1-1.8-2.2 0-3.2.7-3.2 2 0 2.7 6.4.9 6.4 3.9 0 1.4-1.2 2.2-3.4 2.2-2.1 0-3.3-.7-3.3-2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </>
    ),
  },
  tailwind: {
    label: "Tailwind",
    color: "oklch(0.75 0.13 205)",
    glyph: (
      <path
        d="M12 6c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.8 2 1.5 1.1 1.1 2.3 2.4 5 2.4 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.3-.8-2-1.5C15.9 7.3 14.7 6 12 6ZM7 12c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.8 2 1.5 1.1 1.1 2.3 2.4 5 2.4 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.3-.8-2-1.5-1.1-1.1-2.3-2.4-5-2.4Z"
        fill="currentColor"
      />
    ),
  },
  bug: {
    label: "Debugging",
    color: "oklch(0.7 0.19 35)",
    glyph: (
      <>
        <rect x="7" y="8" width="10" height="11" rx="5" fill="currentColor" opacity="0.2" />
        <rect
          x="7"
          y="8"
          width="10"
          height="11"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
        <path
          d="M9.5 8a2.5 2.5 0 0 1 5 0M2.8 11h4.4M16.8 11h4.4M3.4 17h3.8M16.8 17h3.8M12 8v11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    ),
  },
  console: {
    label: "Logs",
    color: "oklch(0.72 0 0)",
    glyph: (
      <>
        <rect
          x="2.5"
          y="4"
          width="19"
          height="16"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="currentColor"
          fillOpacity="0.12"
        />
        <path
          d="m6.5 9.5 2.8 2.5-2.8 2.5M12.5 15h5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </>
    ),
  },
  flask: {
    label: "Testing",
    color: "oklch(0.72 0.16 165)",
    glyph: (
      <>
        <path
          d="M9.5 2.5v6L4.2 18a2 2 0 0 0 1.7 3h12.2a2 2 0 0 0 1.7-3l-5.3-9.5v-6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M6.6 14.5h10.8L20 19.6a2 2 0 0 1-1.8 1.4H5.8A2 2 0 0 1 4 19.6l2.6-5.1Z"
          fill="currentColor"
          opacity="0.28"
        />
        <path d="M8 2.5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  },
  shield: {
    label: "Security",
    color: "oklch(0.66 0.17 145)",
    glyph: (
      <>
        <path
          d="M12 2.5 4.5 5.4v6c0 4.7 3.2 8.4 7.5 10.1 4.3-1.7 7.5-5.4 7.5-10.1v-6L12 2.5Z"
          fill="currentColor"
          opacity="0.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="m8.6 12 2.4 2.4 4.4-4.6"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </>
    ),
  },
  lock: {
    label: "Row-level security",
    color: "oklch(0.74 0.15 85)",
    glyph: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2.5" fill="currentColor" opacity="0.22" />
        <rect
          x="4"
          y="10"
          width="16"
          height="11"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
        <path
          d="M8 10V7.5a4 4 0 0 1 8 0V10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="12" cy="15.5" r="1.6" fill="currentColor" />
      </>
    ),
  },
  postgres: {
    label: "PostgreSQL",
    color: "oklch(0.55 0.13 250)",
    glyph: (
      <>
        <ellipse cx="12" cy="5.5" rx="8" ry="3.2" fill="currentColor" opacity="0.28" />
        <path
          d="M4 5.5v13c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2v-13"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
        <ellipse
          cx="12"
          cy="5.5"
          rx="8"
          ry="3.2"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
        <path
          d="M4 12c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
      </>
    ),
  },
  supabase: {
    label: "Supabase",
    color: "oklch(0.72 0.18 155)",
    glyph: (
      <>
        <path d="M12.6 1.4 3 13.3h8.3v9.3L21 10.7h-8.4V1.4Z" fill="currentColor" />
        <path d="M12.6 1.4 3 13.3h8.3V1.4h1.3Z" fill="currentColor" opacity="0.55" />
      </>
    ),
  },
  firebase: {
    label: "Firebase",
    color: "oklch(0.78 0.16 75)",
    glyph: (
      <>
        <path
          d="M4.2 18.2 6.6 2.8c.2-1 1.5-1.2 2-.3l2.5 4.6-6.9 11.1Z"
          fill="oklch(0.82 0.15 85)"
        />
        <path
          d="M4.2 18.2 14.2 4.4c.6-.8 1.8-.4 1.9.6l1.7 13.2-13.6 0Z"
          fill="oklch(0.75 0.17 60)"
        />
        <path d="m4.2 18.2 7.8 4.4c.5.3 1.2.3 1.7 0l6.1-3.4-15.6-1Z" fill="oklch(0.68 0.15 45)" />
      </>
    ),
  },
  vercel: {
    label: "Vercel",
    color: "oklch(0.2 0 0)",
    glyph: <path d="M12 2.5 22.5 21H1.5L12 2.5Z" fill="currentColor" />,
  },
  cloudflare: {
    label: "Cloudflare",
    color: "oklch(0.72 0.17 55)",
    glyph: (
      <>
        <path
          d="M17.6 17H6.4a3.6 3.6 0 0 1-.5-7.2 5.4 5.4 0 0 1 10.1-1.6 3.1 3.1 0 0 1 4.3 2.9c0 .4-.1.8-.2 1.2A2.6 2.6 0 0 1 17.6 17Z"
          fill="currentColor"
          opacity="0.24"
        />
        <path
          d="M17.6 17H6.4a3.6 3.6 0 0 1-.5-7.2 5.4 5.4 0 0 1 10.1-1.6 3.1 3.1 0 0 1 4.3 2.9c0 .4-.1.8-.2 1.2A2.6 2.6 0 0 1 17.6 17Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
      </>
    ),
  },
  github: {
    label: "GitHub",
    color: "oklch(0.3 0 0)",
    glyph: (
      <path
        d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"
        fill="currentColor"
      />
    ),
  },
  huggingface: {
    label: "Hugging Face",
    color: "oklch(0.82 0.16 85)",
    glyph: (
      <>
        <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.9" />
        <circle cx="9" cy="10.5" r="1.3" fill="oklch(0.2 0 0)" />
        <circle cx="15" cy="10.5" r="1.3" fill="oklch(0.2 0 0)" />
        <path
          d="M8.4 14.6a4.4 4.4 0 0 0 7.2 0"
          stroke="oklch(0.2 0 0)"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </>
    ),
  },
  tensorflow: {
    label: "TensorFlow",
    color: "oklch(0.72 0.18 55)",
    glyph: (
      <>
        <path d="M12 1.6 2.8 6.9v10.2L7.4 14V9.6L12 6.9V1.6Z" fill="currentColor" opacity="0.55" />
        <path d="M12 1.6v5.3l4.6 2.7v4.4l4.6-2.7V6.9L12 1.6Z" fill="currentColor" />
        <path d="M9.7 11v11.4l4.6-2.7V13.7L9.7 11Z" fill="currentColor" opacity="0.8" />
      </>
    ),
  },
  prisma: {
    label: "Prisma",
    color: "oklch(0.45 0.05 250)",
    glyph: (
      <path
        d="M5.2 15.6 12.6 1.9c.4-.7 1.4-.6 1.7.1l5.3 15.2c.2.6-.2 1.3-.9 1.4l-12.6 2c-.9.2-1.5-.8-.9-1.6Z"
        fill="currentColor"
      />
    ),
  },
};

export function techLabel(id: TechId): string {
  return SPECS[id].label;
}

export function techColor(id: TechId): string {
  return SPECS[id].color;
}

/** Just the glyph, sized by the parent. */
export function TechGlyph({ id, className }: { id: TechId; className?: string }) {
  const spec = SPECS[id];
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${S} ${S}`}
      fill="none"
      className={cn("h-6 w-6", className)}
      style={{ color: spec.color }}
    >
      {spec.glyph}
    </svg>
  );
}

/**
 * A glyph on a bordered tile — the form the pipeline and the stack rows use.
 * The label is rendered for assistive tech even when `showLabel` is false, so
 * the diagram is never a wall of unnamed shapes.
 */
export function TechChip({
  id,
  showLabel = true,
  size = "md",
  className,
}: {
  id: TechId;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const spec = SPECS[id];
  const tile = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-12 w-12" }[size];
  const glyph = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7" }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2",
        showLabel && "rounded-full border-2 border-border bg-card py-1 pl-1 pr-3 hard-shadow",
        className,
      )}
    >
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-[26%] border-2 border-border",
          tile,
        )}
        style={{ background: `color-mix(in oklab, ${spec.color} 22%, var(--card))` }}
      >
        <TechGlyph id={id} className={glyph} />
      </span>
      {showLabel ? (
        <span className="whitespace-nowrap font-mono text-[11px] font-bold tracking-tight text-foreground">
          {spec.label}
        </span>
      ) : (
        <span className="sr-only">{spec.label}</span>
      )}
    </span>
  );
}
