import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { EASE, Eyebrow, FadeIn, RiseWords, SectionGlow } from "./fx";

/**
 * "Under the hood" — the anatomy of a product, as a system diagram that
 * assembles while you scroll. It says the same thing the stack list says,
 * but as the thing a hiring engineer actually wants to see: how the pieces
 * connect, and that one person understands every connection.
 *
 * Desktop pins the diagram and walks six steps down the scroll. Phones and
 * reduced-motion visitors get the finished diagram with the steps listed
 * under it.
 */

type NodeId = "visitor" | "edge" | "ci" | "payments" | "api" | "db" | "admin" | "storage";

const W = 124;
const H = 46;

const NODES: Record<NodeId, { x: number; y: number; title: string; sub: string }> = {
  visitor: { x: 80, y: 70, title: "Visitor", sub: "browser · phone" },
  edge: { x: 280, y: 70, title: "Edge SSR", sub: "TanStack Start" },
  ci: { x: 480, y: 70, title: "CI / CD", sub: "GitHub → Vercel" },
  payments: { x: 80, y: 200, title: "Payments", sub: "Razorpay" },
  api: { x: 280, y: 200, title: "Server fns", sub: "typed · validated" },
  db: { x: 480, y: 200, title: "Postgres", sub: "Supabase · RLS" },
  admin: { x: 280, y: 330, title: "Admin panel", sub: "role-gated CMS" },
  storage: { x: 480, y: 330, title: "Storage", sub: "signed URLs" },
};

const EDGES = {
  request: "M142 70 H218",
  server: "M280 93 V177",
  query: "M342 200 H418",
  pay: "M218 200 H142",
  manage: "M280 307 V223",
  upload: "M342 330 H418",
  deploy: "M418 70 H342",
} as const;
type EdgeId = keyof typeof EDGES;

const STEPS: { title: string; body: string; edges: EdgeId[]; nodes: NodeId[] }[] = [
  {
    title: "A visitor asks",
    body: "Every page is server-rendered at the edge, so the first paint is real HTML — not a spinner waiting on an API.",
    edges: ["request"],
    nodes: ["visitor", "edge"],
  },
  {
    title: "The server answers",
    body: "Typed server functions instead of a hand-rolled REST layer. Client and server share one set of types, validated at the boundary.",
    edges: ["server"],
    nodes: ["edge", "api"],
  },
  {
    title: "The data holds",
    body: "Postgres behind Supabase or Prisma, with row-level security — the database, not the UI, decides who sees what.",
    edges: ["query"],
    nodes: ["api", "db"],
  },
  {
    title: "Money moves",
    body: "Checkout through Razorpay with signatures verified on the server. Nothing trusts the browser about a price.",
    edges: ["pay"],
    nodes: ["api", "payments"],
  },
  {
    title: "The owner runs it",
    body: "A role-gated admin with drag-to-reorder media and signed uploads, so the business changes its own site without me.",
    edges: ["manage", "upload"],
    nodes: ["admin", "api", "storage"],
  },
  {
    title: "It ships itself",
    body: "Push to main, CI builds, the edge deploys. Every branch gets a preview URL before anything reaches production.",
    edges: ["deploy"],
    nodes: ["ci", "edge"],
  },
];

export function Anatomy() {
  const reduced = useReducedMotion();

  return (
    <section
      data-act="noir"
      data-rail="Anatomy"
      className="act-noir tone-violet relative pb-28 sm:pb-40 lg:pb-24"
    >
      <SectionGlow side="right" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Eyebrow index="05">Under the hood</Eyebrow>
        <RiseWords
          text="The anatomy of a product,"
          muted="from first request to deploy."
          className="mt-10 max-w-[22ch] text-balance font-display text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-foreground"
        />
      </div>

      {reduced ? <StaticAnatomy /> : <PinnedAnatomy />}
      {!reduced ? (
        <div className="lg:hidden">
          <StaticAnatomy />
        </div>
      ) : null}
    </section>
  );
}

function PinnedAnatomy() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [step, setStep] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setStep(Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length))));
  });

  return (
    <div
      ref={ref}
      className="relative hidden lg:block"
      style={{ height: `${STEPS.length * 70}vh` }}
    >
      <div className="sticky top-0 flex h-svh items-center">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-12 items-center gap-12 px-8">
          <ol className="col-span-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t border-border py-4 last:border-b">
                <p
                  className={`flex items-baseline gap-4 text-[1.05rem] font-medium tracking-tight transition-colors duration-500 ${
                    i === step ? "text-foreground" : "text-muted-foreground/60"
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] tabular-nums transition-colors duration-500 ${
                      i === step ? "text-accent" : ""
                    }`}
                  >
                    0{i + 1}
                  </span>
                  {s.title}
                </p>
                <AnimatePresence initial={false}>
                  {i === step ? (
                    <motion.p
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="overflow-hidden pl-9 text-[14px] leading-relaxed text-muted-foreground"
                    >
                      <span className="block pt-2">{s.body}</span>
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </li>
            ))}
          </ol>

          <div className="col-span-8">
            <Diagram step={step} progress={scrollYProgress} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StaticAnatomy() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-8 pt-12 sm:px-8">
      <FadeIn>
        {/* Below ~520px the labels would shrink past legibility, so the
            drawing keeps its size and swipes sideways instead. */}
        <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <div className="min-w-[520px]">
            <Diagram step={STEPS.length} />
          </div>
        </div>
      </FadeIn>
      <ol className="mt-10 grid gap-x-10 sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <FadeIn as="li" key={s.title} delay={i * 0.04} className="border-t border-border py-5">
            <p className="flex items-baseline gap-3 text-[1.05rem] font-medium tracking-tight text-foreground">
              <span className="font-mono text-[11px] tabular-nums text-accent">0{i + 1}</span>
              {s.title}
            </p>
            <p className="mt-2 pl-8 text-[14px] leading-relaxed text-muted-foreground">{s.body}</p>
          </FadeIn>
        ))}
      </ol>
    </div>
  );
}

/**
 * The drawing. `step` is the active step (STEPS.length means "all done").
 * With `progress`, each step's wires draw in as its slice of the scroll passes.
 */
function Diagram({ step, progress }: { step: number; progress?: MotionValue<number> }) {
  const current = STEPS[step];
  const doneEdges = new Set(STEPS.slice(0, step).flatMap((s) => s.edges));
  const doneNodes = new Set(STEPS.slice(0, step + 1).flatMap((s) => s.nodes));

  return (
    <svg
      viewBox="0 0 560 400"
      className="h-auto w-full"
      role="img"
      aria-label="System diagram: visitor, edge rendering, server functions, Postgres, payments, admin panel, storage and CI/CD, and how they connect"
    >
      <defs>
        <pattern id="anatomy-dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="currentColor" className="text-border" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="560" height="400" rx="20" fill="url(#anatomy-dots)" opacity="0.6" />

      {(Object.keys(EDGES) as EdgeId[]).map((id) => (
        <path
          key={`base-${id}`}
          d={EDGES[id]}
          stroke="var(--border)"
          strokeWidth="1.2"
          strokeDasharray="3 5"
          fill="none"
        />
      ))}

      {STEPS.map((s, i) =>
        s.edges.map((id) =>
          progress ? (
            <ScrollWire key={`wire-${id}`} d={EDGES[id]} progress={progress} index={i} />
          ) : (
            <path
              key={`wire-${id}`}
              d={EDGES[id]}
              stroke="var(--foreground)"
              strokeOpacity="0.55"
              strokeWidth="1.4"
              fill="none"
            />
          ),
        ),
      )}

      {(current ? current.edges : [...doneEdges]).map((id) => (
        <circle key={`packet-${id}-${step}`} r="3.6" fill="var(--accent)">
          <animateMotion dur="1.8s" repeatCount="indefinite" path={EDGES[id]} />
        </circle>
      ))}

      {(Object.keys(NODES) as NodeId[]).map((id) => {
        const n = NODES[id];
        const isCurrent = current?.nodes.includes(id) ?? false;
        const seen = doneNodes.has(id) || step >= STEPS.length;
        return (
          <g key={id} style={{ transition: "opacity 500ms ease" }} opacity={seen ? 1 : 0.45}>
            <rect
              x={n.x - W / 2}
              y={n.y - H / 2}
              width={W}
              height={H}
              rx="11"
              fill="var(--card)"
              stroke={isCurrent ? "var(--accent)" : "var(--border)"}
              strokeWidth={isCurrent ? 1.5 : 1}
              style={{ transition: "stroke 400ms ease" }}
            />
            <text
              x={n.x}
              y={n.y - 2}
              textAnchor="middle"
              fill="var(--foreground)"
              style={{ fontFamily: "var(--ui-sans)", fontSize: 12.5, fontWeight: 500 }}
            >
              {n.title}
            </text>
            <text
              x={n.x}
              y={n.y + 13}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              style={{ fontFamily: "var(--ui-mono)", fontSize: 8.5, letterSpacing: "0.04em" }}
            >
              {n.sub}
            </text>
            {isCurrent ? (
              <circle cx={n.x + W / 2 - 10} cy={n.y - H / 2 + 10} r="2.6" fill="var(--accent)" />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function ScrollWire({
  d,
  progress,
  index,
}: {
  d: string;
  progress: MotionValue<number>;
  index: number;
}) {
  const slice = 1 / STEPS.length;
  const pathLength = useTransform(progress, [index * slice, index * slice + slice * 0.55], [0, 1], {
    clamp: true,
  });
  return (
    <motion.path
      d={d}
      stroke="var(--foreground)"
      strokeOpacity="0.6"
      strokeWidth="1.4"
      fill="none"
      style={{ pathLength }}
    />
  );
}
