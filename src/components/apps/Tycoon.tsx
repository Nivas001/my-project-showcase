import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * SHIP IT TYCOON
 * ============================================================================
 *
 * You run a software studio. Hire people, they write code, code becomes
 * revenue, revenue buys more people. Bugs turn up and eat your income until
 * somebody fixes them.
 *
 * ARCHITECTURE — the part worth reading before changing anything.
 *
 * The simulation lives in a ref and is stepped inside one requestAnimationFrame
 * loop that also draws the canvas. React never re-renders on a tick. A HUD
 * snapshot is copied into state four times a second, which is faster than
 * anyone can read a number and roughly sixty times cheaper than re-rendering
 * the tree every frame.
 *
 * All motion is delta-timed. A background tab throttles rAF to about one frame
 * a second, and a per-frame economy would quietly pay out sixty times less to
 * anyone who switched tabs — so the step clamps dt and multiplies by it.
 *
 * Everything is drawn from primitives. There are no sprite sheets to load, so
 * the game starts on the first frame and the whole app is a few kilobytes.
 */

/* --------------------------------------------------------------------------
 * Economy
 * ------------------------------------------------------------------------ */

type RoleId = "intern" | "engineer" | "designer" | "sre" | "pm";

type Role = {
  id: RoleId;
  name: string;
  /** Lines of code per second, per head. */
  loc: number;
  baseCost: number;
  /** Each hire raises the next one's price by this factor. */
  growth: number;
  blurb: string;
  /** Body colour on the office floor. */
  tint: string;
};

const ROLES: Role[] = [
  {
    id: "intern",
    name: "Intern",
    loc: 0.6,
    baseCost: 15,
    growth: 1.12,
    blurb: "Enthusiastic. Occasionally pushes to main.",
    tint: "oklch(0.72 0.16 145)",
  },
  {
    id: "engineer",
    name: "Engineer",
    loc: 3.4,
    baseCost: 120,
    growth: 1.14,
    blurb: "Writes the thing. Then rewrites the thing.",
    tint: "oklch(0.66 0.18 255)",
  },
  {
    id: "designer",
    name: "Designer",
    loc: 2.1,
    baseCost: 95,
    growth: 1.15,
    blurb: "Halves the lines and doubles what they are worth.",
    tint: "oklch(0.7 0.2 320)",
  },
  {
    id: "sre",
    name: "SRE",
    loc: 1.2,
    baseCost: 400,
    growth: 1.18,
    blurb: "Fixes bugs automatically. Sleeps with a pager.",
    tint: "oklch(0.75 0.17 60)",
  },
  {
    id: "pm",
    name: "PM",
    loc: 0,
    baseCost: 900,
    growth: 1.22,
    blurb: "Writes no code. Raises the value of everyone else's by 12%.",
    tint: "oklch(0.7 0.16 25)",
  },
];

type UpgradeId = "ci" | "types" | "tests" | "cache" | "oncall";

type Upgrade = {
  id: UpgradeId;
  name: string;
  cost: number;
  blurb: string;
};

const UPGRADES: Upgrade[] = [
  {
    id: "ci",
    name: "Continuous integration",
    cost: 250,
    blurb: "+35% output. Red builds stop reaching production.",
  },
  {
    id: "types",
    name: "Static types",
    cost: 800,
    blurb: "+50% output. Whole categories of bug stop existing.",
  },
  { id: "tests", name: "A real test suite", cost: 2500, blurb: "Bugs arrive half as often." },
  { id: "cache", name: "An edge cache", cost: 6000, blurb: "×2 revenue per shipped feature." },
  {
    id: "oncall",
    name: "Follow-the-sun on-call",
    cost: 18000,
    blurb: "Bugs cost you half as much.",
  },
];

/** 1000 lines of code makes one shippable feature. */
const LOC_PER_FEATURE = 1000;
const BASE_FEATURE_VALUE = 26;

type Game = {
  cash: number;
  loc: number;
  shipped: number;
  staff: Record<RoleId, number>;
  upgrades: Record<UpgradeId, boolean>;
  bugs: number;
  /** Seconds until the next bug rolls in. */
  nextBug: number;
  elapsed: number;
};

const freshGame = (): Game => ({
  cash: 25,
  loc: 0,
  shipped: 0,
  staff: { intern: 0, engineer: 0, designer: 0, sre: 0, pm: 0 },
  upgrades: { ci: false, types: false, tests: false, cache: false, oncall: false },
  bugs: 0,
  nextBug: 45,
  elapsed: 0,
});

const SAVE_KEY = "nivas.tycoon.v1";

/* --- Derived values. Pure functions of the state, never stored. ---------- */

function hireCost(role: Role, owned: number): number {
  return Math.ceil(role.baseCost * Math.pow(role.growth, owned));
}

function multiplier(game: Game): number {
  let m = 1;
  if (game.upgrades.ci) m *= 1.35;
  if (game.upgrades.types) m *= 1.5;
  // Each PM lifts everyone else. Capped so a PM-only studio is not a strategy.
  m *= 1 + Math.min(game.staff.pm, 12) * 0.12;
  return m;
}

function locPerSecond(game: Game): number {
  let raw = 0;
  for (const role of ROLES) raw += role.loc * game.staff[role.id];
  const slowed = Math.max(0.15, 1 - game.bugs * (game.upgrades.oncall ? 0.02 : 0.04));
  return raw * multiplier(game) * slowed;
}

function featureValue(game: Game): number {
  return BASE_FEATURE_VALUE * (game.upgrades.cache ? 2 : 1) * (1 + game.shipped * 0.0012);
}

function money(n: number): string {
  if (n >= 1e9) return `₹${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `₹${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${Math.floor(n)}`;
}

/* --------------------------------------------------------------------------
 * Drawing
 * ------------------------------------------------------------------------ */

type Worker = {
  role: RoleId;
  /** Desk index, which fixes where this worker sits. */
  desk: number;
  /** Typing phase, so the whole office is not in lockstep. */
  phase: number;
};

type Particle = { x: number; y: number; vy: number; life: number; text: string; tint: string };

const CANVAS_W = 880;
const CANVAS_H = 320;

/** Desk positions on a shallow isometric grid. */
function deskAt(i: number): { x: number; y: number } {
  const cols = 9;
  const col = i % cols;
  const row = Math.floor(i / cols);
  return {
    x: 70 + col * 88 + row * 26,
    y: 96 + row * 62,
  };
}

export function Tycoon() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game>(freshGame());
  const workers = useRef<Worker[]>([]);
  const particles = useRef<Particle[]>([]);
  const [hud, setHud] = useState<Game>(game.current);
  const [running, setRunning] = useState(true);

  /* ---- Save / restore -------------------------------------------------- */

  const rebuildWorkers = useCallback(() => {
    const out: Worker[] = [];
    let desk = 0;
    for (const role of ROLES) {
      for (let i = 0; i < game.current.staff[role.id]; i++) {
        // The floor holds 27 desks. Beyond that the studio is "remote" and the
        // headcount only shows in the HUD — an office that overflows its own
        // canvas looks like a rendering bug rather than success.
        if (desk >= 27) break;
        out.push({ role: role.id, desk: desk++, phase: Math.random() * Math.PI * 2 });
      }
    }
    workers.current = out;
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Game>;
        // Merged onto a fresh game rather than trusted wholesale: a save from
        // an older build is missing whichever fields were added since.
        game.current = {
          ...freshGame(),
          ...saved,
          staff: { ...freshGame().staff, ...saved.staff },
          upgrades: { ...freshGame().upgrades, ...saved.upgrades },
        };
        rebuildWorkers();
        setHud({ ...game.current });
      }
    } catch {
      /* corrupt or blocked — start fresh */
    }
  }, [rebuildWorkers]);

  useEffect(() => {
    const id = window.setInterval(() => {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(game.current));
      } catch {
        /* storage blocked */
      }
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  /* ---- Actions --------------------------------------------------------- */

  const pop = (text: string, tint: string) => {
    particles.current.push({
      x: 120 + Math.random() * (CANVAS_W - 240),
      y: 150 + Math.random() * 80,
      vy: -38 - Math.random() * 20,
      life: 1,
      text,
      tint,
    });
    if (particles.current.length > 40) particles.current.shift();
  };

  const commit = () => {
    const g = game.current;
    // A manual commit is worth more once there is a team, or clicking becomes
    // pointless within a minute of starting.
    g.loc += 12 * multiplier(g);
    pop("+commit", "oklch(0.78 0.14 145)");
    setHud({ ...g });
  };

  const hire = (role: Role) => {
    const g = game.current;
    const cost = hireCost(role, g.staff[role.id]);
    if (g.cash < cost) {
      toast.error("Not enough runway.", { description: `${role.name} costs ${money(cost)}.` });
      return;
    }
    g.cash -= cost;
    g.staff[role.id] += 1;
    rebuildWorkers();
    pop(`+1 ${role.name}`, role.tint);
    setHud({ ...g });
  };

  const buy = (upgrade: Upgrade) => {
    const g = game.current;
    if (g.upgrades[upgrade.id]) return;
    if (g.cash < upgrade.cost) {
      toast.error("Not enough runway.", {
        description: `${upgrade.name} costs ${money(upgrade.cost)}.`,
      });
      return;
    }
    g.cash -= upgrade.cost;
    g.upgrades[upgrade.id] = true;
    toast.success(upgrade.name, { description: upgrade.blurb });
    setHud({ ...g });
  };

  const squash = () => {
    const g = game.current;
    if (g.bugs === 0) return;
    g.bugs -= 1;
    pop("bug squashed", "oklch(0.72 0.18 25)");
    setHud({ ...g });
  };

  const reset = () => {
    game.current = freshGame();
    workers.current = [];
    particles.current = [];
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* storage blocked */
    }
    setHud({ ...game.current });
    toast("Studio closed. Starting again.");
  };

  /* ---- The loop -------------------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let frame = 0;
    let last = performance.now();
    let hudAt = 0;

    const step = (now: number) => {
      // Clamped: a tab that has been in the background for a minute must not
      // pay out sixty seconds of revenue in one step.
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const g = game.current;

      if (running) {
        g.elapsed += dt;
        g.loc += locPerSecond(g) * dt;

        while (g.loc >= LOC_PER_FEATURE) {
          g.loc -= LOC_PER_FEATURE;
          g.shipped += 1;
          g.cash += featureValue(g);
          if (Math.random() < 0.5) pop(`+${money(featureValue(g))}`, "oklch(0.8 0.15 95)");
        }

        // Bugs only arrive once there is something to break.
        if (g.staff.engineer + g.staff.intern > 0) {
          g.nextBug -= dt;
          if (g.nextBug <= 0) {
            g.bugs += 1;
            g.nextBug = (g.upgrades.tests ? 90 : 45) + Math.random() * 40;
          }
        }

        // SREs clear the backlog on their own.
        if (g.bugs > 0 && g.staff.sre > 0 && Math.random() < g.staff.sre * dt * 0.09) {
          g.bugs -= 1;
        }
      }

      draw(ctx, g, workers.current, particles.current, now / 1000);

      for (const p of particles.current) {
        p.y += p.vy * dt;
        p.life -= dt * 0.75;
      }
      particles.current = particles.current.filter((p) => p.life > 0);

      if (now - hudAt > 250) {
        hudAt = now;
        setHud({ ...g });
      }
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const lps = locPerSecond(hud);
  const income = (lps / LOC_PER_FEATURE) * featureValue(hud);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* ---- HUD ---- */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 border-b border-border/60 px-3 py-2">
        <Stat label="Cash" value={money(hud.cash)} />
        <Stat label="Per second" value={`${money(income)}/s`} />
        <Stat label="Shipped" value={String(hud.shipped)} />
        <Stat label="Writing" value={`${lps.toFixed(1)} loc/s`} />
        <Stat
          label="Bugs"
          value={String(hud.bugs)}
          tone={hud.bugs > 0 ? "text-destructive" : undefined}
        />

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={squash}
            disabled={hud.bugs === 0}
            className="rounded-[var(--os-radius-ctl)] border border-border px-2.5 py-1 text-[12px] text-foreground transition-colors hover:bg-foreground/10 disabled:opacity-35"
          >
            Squash a bug
          </button>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="rounded-[var(--os-radius-ctl)] border border-border px-2.5 py-1 text-[12px] text-foreground transition-colors hover:bg-foreground/10"
          >
            {running ? "Pause" : "Resume"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-[var(--os-radius-ctl)] border border-border px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ---- The floor ---- */}
      <button
        type="button"
        onClick={commit}
        aria-label="Write a commit yourself"
        className="relative block shrink-0 cursor-pointer overflow-hidden border-b border-border/60"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block h-auto w-full"
        />
        <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white/85 backdrop-blur-sm">
          click the floor to write a commit yourself
        </span>
      </button>

      {/* ---- Shop ---- */}
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto p-3">
        <section>
          <h3 className="micro mb-1.5 text-muted-foreground">Hire</h3>
          <div className="space-y-1">
            {ROLES.map((role) => {
              const cost = hireCost(role, hud.staff[role.id]);
              const can = hud.cash >= cost;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => hire(role)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[var(--os-radius-ctl)] border border-border bg-card p-2 text-left transition-colors",
                    can ? "hover:border-foreground/35" : "opacity-55",
                  )}
                >
                  <span
                    aria-hidden
                    className="h-7 w-7 shrink-0 rounded-[var(--os-radius-ctl)]"
                    style={{ background: role.tint }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-1.5">
                      <span className="text-[13px] font-semibold text-foreground">{role.name}</span>
                      <span className="font-mono text-[10.5px] text-muted-foreground">
                        ×{hud.staff[role.id]}
                      </span>
                    </span>
                    <span className="block truncate text-[11.5px] text-muted-foreground">
                      {role.blurb}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-mono text-[12px] tabular-nums",
                      can ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {money(cost)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="micro mb-1.5 text-muted-foreground">Invest</h3>
          <div className="space-y-1">
            {UPGRADES.map((upgrade) => {
              const owned = hud.upgrades[upgrade.id];
              const can = hud.cash >= upgrade.cost;
              return (
                <button
                  key={upgrade.id}
                  type="button"
                  onClick={() => buy(upgrade)}
                  disabled={owned}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[var(--os-radius-ctl)] border p-2 text-left transition-colors",
                    owned
                      ? "border-[var(--os-accent)] bg-card"
                      : can
                        ? "border-border bg-card hover:border-foreground/35"
                        : "border-border bg-card opacity-55",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-foreground">
                      {upgrade.name}
                    </span>
                    <span className="block text-[11.5px] leading-snug text-muted-foreground">
                      {upgrade.blurb}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[12px] tabular-nums text-foreground">
                    {owned ? "owned" : money(upgrade.cost)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string | undefined }) {
  return (
    <span className="flex flex-col leading-tight">
      <span className="micro text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-[13px] tabular-nums text-foreground", tone)}>
        {value}
      </span>
    </span>
  );
}

/* --------------------------------------------------------------------------
 * The renderer
 *
 * Everything is primitives, so the office scales with the studio rather than
 * with an asset budget. A worker is a rounded body, a head, and two arms whose
 * vertical offset is a sine wave — which reads unmistakably as typing, and
 * costs two multiplications a frame.
 * ------------------------------------------------------------------------ */

function draw(
  ctx: CanvasRenderingContext2D,
  game: Game,
  workers: Worker[],
  particles: Particle[],
  time: number,
) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // Floor
  const floor = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  floor.addColorStop(0, "oklch(0.24 0.02 250)");
  floor.addColorStop(1, "oklch(0.16 0.015 250)");
  ctx.fillStyle = floor;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Floor grid, skewed to suggest depth.
  ctx.strokeStyle = "oklch(1 0 0 / 5%)";
  ctx.lineWidth = 1;
  for (let i = -6; i < 24; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 60, 0);
    ctx.lineTo(i * 60 + 160, CANVAS_H);
    ctx.stroke();
  }
  for (let y = 40; y < CANVAS_H; y += 46) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
    ctx.stroke();
  }

  // Windows along the back wall, with a slow day/night wash.
  const night = (Math.sin(game.elapsed * 0.05) + 1) / 2;
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `oklch(${0.35 + night * 0.25} 0.09 ${230 - night * 60} / 55%)`;
    ctx.fillRect(40 + i * 140, 12, 96, 44);
    ctx.strokeStyle = "oklch(1 0 0 / 12%)";
    ctx.strokeRect(40 + i * 140, 12, 96, 44);
  }

  if (workers.length === 0) {
    ctx.fillStyle = "oklch(0.72 0 0 / 80%)";
    ctx.font = "500 15px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("An empty floor and a quarter of a lakh in the bank.", CANVAS_W / 2, 150);
    ctx.font = "400 12px Inter, system-ui, sans-serif";
    ctx.fillStyle = "oklch(0.6 0 0 / 80%)";
    ctx.fillText(
      "Click here to write the first commit yourself. Then hire an intern.",
      CANVAS_W / 2,
      172,
    );
    ctx.textAlign = "left";
  }

  // Workers, back row first so the front row overlaps correctly.
  const sorted = [...workers].sort((a, b) => deskAt(a.desk).y - deskAt(b.desk).y);
  for (const worker of sorted) {
    const { x, y } = deskAt(worker.desk);
    const role = ROLES.find((r) => r.id === worker.role)!;
    const busy = Math.sin(time * 7 + worker.phase);

    // Desk
    ctx.fillStyle = "oklch(0.3 0.015 250)";
    ctx.fillRect(x - 24, y + 6, 48, 16);
    ctx.fillStyle = "oklch(0.22 0.015 250)";
    ctx.fillRect(x - 24, y + 22, 48, 4);

    // Monitor, lit by whatever is on it
    ctx.fillStyle = "oklch(0.14 0.01 250)";
    ctx.fillRect(x - 15, y - 12, 30, 20);
    ctx.fillStyle = game.bugs > 0 ? "oklch(0.55 0.2 25 / 70%)" : "oklch(0.55 0.15 220 / 70%)";
    ctx.fillRect(x - 13, y - 10, 26, 16);
    // Two lines of "code" that shuffle as they type
    ctx.fillStyle = "oklch(0.9 0.1 145 / 60%)";
    ctx.fillRect(x - 11, y - 7, 8 + ((worker.phase * 7 + time * 3) % 10), 2);
    ctx.fillRect(x - 11, y - 3, 6 + ((worker.phase * 5 + time * 2) % 12), 2);

    // Body
    ctx.fillStyle = role.tint;
    ctx.beginPath();
    ctx.roundRect(x - 9, y + 2, 18, 18, 6);
    ctx.fill();

    // Head
    ctx.fillStyle = "oklch(0.82 0.04 60)";
    ctx.beginPath();
    ctx.arc(x, y - 2, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Arms — the typing tell
    ctx.strokeStyle = role.tint;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 7, y + 8);
    ctx.lineTo(x - 12, y + 12 + busy * 1.6);
    ctx.moveTo(x + 7, y + 8);
    ctx.lineTo(x + 12, y + 12 - busy * 1.6);
    ctx.stroke();
  }

  // Bugs crawl across the floor. Deterministic paths, so they do not jitter.
  for (let i = 0; i < Math.min(game.bugs, 12); i++) {
    const t = time * 0.55 + i * 1.7;
    const x = ((t * 60) % (CANVAS_W + 80)) - 40;
    const y = 240 + Math.sin(t * 2.2) * 26 + (i % 3) * 18;
    ctx.fillStyle = "oklch(0.62 0.22 25)";
    ctx.beginPath();
    ctx.ellipse(x, y, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "oklch(0.62 0.22 25)";
    ctx.lineWidth = 1.5;
    for (const side of [-1, 1]) {
      for (let leg = -1; leg <= 1; leg++) {
        ctx.beginPath();
        ctx.moveTo(x + leg * 3, y);
        ctx.lineTo(x + leg * 4, y + side * (6 + Math.sin(t * 9 + leg) * 1.5));
        ctx.stroke();
      }
    }
  }

  // Floating numbers
  ctx.textAlign = "center";
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    ctx.fillStyle = p.tint;
    ctx.font = "700 13px 'JetBrains Mono', ui-monospace, monospace";
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";

  // Progress toward the next shippable feature
  const pct = game.loc / LOC_PER_FEATURE;
  ctx.fillStyle = "oklch(1 0 0 / 10%)";
  ctx.fillRect(0, CANVAS_H - 6, CANVAS_W, 6);
  ctx.fillStyle = "oklch(0.72 0.17 145)";
  ctx.fillRect(0, CANVAS_H - 6, CANVAS_W * pct, 6);
}
