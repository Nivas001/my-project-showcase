import { TechGlyph } from "@/components/kit/TechMark";

/* ==========================================================================
 * STATEMENT SCENES
 *
 * One illustration per Act I statement. Each is a small animated diagram that
 * shows the claim rather than decorating it — a deploy pipeline, a summariser
 * keeping its entities, three form factors off one codebase.
 *
 * All motion is CSS (see the float/orbit/pulse/type utilities in styles.css),
 * so every scene stops dead under prefers-reduced-motion without any of them
 * needing to know that.
 * ======================================================================== */

export type SceneId = "deploy" | "model" | "devices";

/** 01 — three products going from repo to live URL. */
function DeployScene() {
  const products = [
    { name: "anibakes.app", tone: "hog-red", delay: "0s" },
    { name: "aarrkkaa.com", tone: "hog-yellow", delay: "-2s" },
    { name: "velocitybox.app", tone: "hog-green", delay: "-4s" },
  ];

  return (
    <div className="relative w-full">
      <div className="space-y-3">
        {products.map((product, i) => (
          <div
            key={product.name}
            className="float-slow flex items-center gap-3 rounded-lg border border-border/70 bg-card/60 p-3 backdrop-blur-sm"
            style={{ "--float-delay": product.delay, "--float-dur": "7s" } as React.CSSProperties}
          >
            {/* Repo → build → live */}
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border/70">
              <TechGlyph id="github" className="h-4 w-4" />
            </span>

            <span aria-hidden className="relative h-px flex-1 overflow-hidden bg-border">
              <span
                className="absolute inset-y-0 left-0 w-8 rail-pulse"
                style={
                  {
                    background: `linear-gradient(90deg, transparent, var(--${product.tone}))`,
                    "--pulse-dur": "2.6s",
                    "--pulse-delay": `${i * 0.5}s`,
                    // The rail runs horizontally here; the keyframe translates
                    // on Y, so it is rotated into place.
                    transform: "rotate(90deg)",
                    transformOrigin: "left center",
                  } as React.CSSProperties
                }
              />
            </span>

            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border/70"
              style={{ background: `color-mix(in oklab, var(--${product.tone}) 22%, transparent)` }}
            >
              <TechGlyph id={i === 2 ? "cloudflare" : "vercel"} className="h-4 w-4" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate font-mono text-[11px] text-foreground">
                {product.name}
              </span>
              <span className="mt-0.5 flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: `var(--${product.tone})` }}
                />
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  200 OK
                </span>
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 02 — a Tamil paragraph reduced to a summary with its names intact. */
function ModelScene() {
  return (
    <div className="w-full rounded-lg border border-border/70 bg-card/60 p-4 backdrop-blur-sm">
      <p className="micro text-muted-foreground">Input — Tamil news</p>
      <div className="mt-2 space-y-1.5" aria-hidden>
        {[100, 92, 78, 96, 64].map((w, i) => (
          <span
            key={w}
            className="block h-1.5 rounded-full bg-foreground/15"
            style={{ width: `${w}%` }}
          >
            {i === 1 ? null : null}
          </span>
        ))}
      </div>

      {/* The named entities that must survive. */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["சென்னை", "PERSON", "ORG"].map((entity, i) => (
          <span
            key={entity}
            className="rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest"
            style={{
              borderColor: "var(--hog-blue)",
              color: "var(--hog-blue)",
              background: "color-mix(in oklab, var(--hog-blue) 14%, transparent)",
              animationDelay: `${i * 120}ms`,
            }}
          >
            {entity}
          </span>
        ))}
      </div>

      {/* The model in the middle. */}
      <div className="my-4 flex items-center gap-3">
        <span aria-hidden className="h-px flex-1 bg-border" />
        <span className="flex items-center gap-2 rounded-full border border-border/70 px-3 py-1">
          <span
            className="orbit-spin h-3 w-3 rounded-full border-2 border-dashed"
            style={{ borderColor: "var(--hog-blue)", "--orbit-dur": "6s" } as React.CSSProperties}
          />
          <span className="font-mono text-[10px] text-foreground">mT5 + PEFT + NER</span>
        </span>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </div>

      <p className="micro text-muted-foreground">Output — summary</p>
      <div className="mt-2 space-y-1.5" aria-hidden>
        {[70, 44].map((w, i) => (
          <span
            key={w}
            className="type-in block h-1.5 rounded-full"
            style={
              {
                width: `${w}%`,
                background: "var(--hog-blue)",
                opacity: 0.7,
                "--type-dur": "1.1s",
                "--type-delay": `${400 + i * 300}ms`,
                "--type-steps": 24,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <p className="mt-3 font-mono text-[10px] text-hog-green">entities preserved ✓</p>
    </div>
  );
}

/** 03 — one codebase, three form factors. */
function DevicesScene() {
  return (
    <div className="flex w-full items-end justify-center gap-4">
      {/* Desktop */}
      <div className="float-slow flex-1" style={{ "--float-dur": "8s" } as React.CSSProperties}>
        <div className="rounded-md border border-border/70 bg-card/60 p-2 backdrop-blur-sm">
          <span aria-hidden className="mb-1.5 flex gap-1">
            {["hog-red", "hog-yellow", "hog-green"].map((tone) => (
              <span
                key={tone}
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: `var(--${tone})` }}
              />
            ))}
          </span>
          <span aria-hidden className="block h-16 rounded-sm bg-foreground/10 sm:h-20" />
        </div>
        <span aria-hidden className="mx-auto mt-1 block h-1.5 w-10 rounded-b bg-border" />
        <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground">Web</p>
      </div>

      {/* Tablet */}
      <div
        className="float-slow w-[22%]"
        style={{ "--float-dur": "7s", "--float-delay": "-2.5s" } as React.CSSProperties}
      >
        <div className="rounded-md border border-border/70 bg-card/60 p-1.5 backdrop-blur-sm">
          <span aria-hidden className="block h-16 rounded-sm bg-foreground/10 sm:h-[4.5rem]" />
        </div>
        <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground">Admin</p>
      </div>

      {/* Phone */}
      <div
        className="float-slow w-[16%]"
        style={{ "--float-dur": "6.4s", "--float-delay": "-4s" } as React.CSSProperties}
      >
        <div className="rounded-lg border border-border/70 bg-card/60 p-1 backdrop-blur-sm">
          <span aria-hidden className="block h-14 rounded-[4px] bg-foreground/10 sm:h-16" />
        </div>
        <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground">Flutter</p>
      </div>
    </div>
  );
}

const SCENES: Record<SceneId, () => React.ReactElement> = {
  deploy: DeployScene,
  model: ModelScene,
  devices: DevicesScene,
};

export function StatementScene({ id }: { id: SceneId }) {
  const Scene = SCENES[id];
  return (
    <div aria-hidden className="w-full">
      <Scene />
    </div>
  );
}
