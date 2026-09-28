import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { EASE } from "./fx";

/**
 * Line illustrations for the four capabilities. Each one draws itself when it
 * arrives, then keeps one small loop running — the thing the capability is
 * actually about: a commit travelling to production, a network firing, data
 * syncing to a phone, a dashboard someone is using.
 *
 * Strokes are currentColor (the muted ink) with the accent reserved for the
 * one moving part, so four of them side by side still read as one system.
 * Loops are CSS keyframes (see `illo-*` in styles.css) and stop under
 * prefers-reduced-motion.
 */

const draw = (i: number): Variants => ({
  out: { pathLength: 0, opacity: 0 },
  in: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.2, ease: EASE, delay: 0.1 + i * 0.12 },
      opacity: { duration: 0.2, delay: 0.1 + i * 0.12 },
    },
  },
});

const pop = (i: number): Variants => ({
  out: { opacity: 0, scale: 0.6 },
  in: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE, delay: 0.5 + i * 0.1 } },
});

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <motion.svg
      role="img"
      aria-label={label}
      viewBox="0 0 240 140"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-auto w-full text-muted-foreground"
      initial="out"
      whileInView="in"
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
    >
      {children}
    </motion.svg>
  );
}

const MONO = { fontFamily: "var(--ui-mono)", fontSize: 7, letterSpacing: "0.12em" } as const;

/** 01 — Ship: repo → build → live, with a commit travelling the line. */
export function ShipIllo() {
  return (
    <Frame label="A commit travelling from repository through build to a live site">
      <motion.path d="M40 70 H200" stroke="currentColor" strokeWidth="1" variants={draw(0)} />
      <motion.circle
        cx="40"
        cy="70"
        r="14"
        stroke="currentColor"
        strokeWidth="1.2"
        variants={draw(1)}
      />
      <motion.path
        d="M34 70 h12 M40 64 v12"
        stroke="currentColor"
        strokeWidth="1.2"
        variants={draw(2)}
      />
      <motion.rect
        x="106"
        y="56"
        width="28"
        height="28"
        rx="6"
        stroke="currentColor"
        strokeWidth="1.2"
        variants={draw(2)}
      />
      <motion.path
        d="M113 70 l5 5 l9 -10"
        stroke="currentColor"
        strokeWidth="1.2"
        variants={draw(3)}
      />
      <motion.circle
        cx="200"
        cy="70"
        r="14"
        stroke="currentColor"
        strokeWidth="1.2"
        variants={draw(3)}
      />
      <motion.path
        d="M186 70 H214 M200 56 C193 62 193 78 200 84 M200 56 C207 62 207 78 200 84"
        stroke="currentColor"
        strokeWidth="0.9"
        variants={draw(4)}
      />
      <motion.g variants={pop(0)}>
        <circle className="illo-travel" cx="0" cy="70" r="3.2" fill="var(--accent)" />
        <circle
          className="illo-ping"
          cx="200"
          cy="70"
          r="14"
          stroke="var(--accent)"
          strokeWidth="1"
        />
      </motion.g>
      <motion.g variants={pop(1)} fill="currentColor" style={MONO}>
        <text x="40" y="104" textAnchor="middle">
          REPO
        </text>
        <text x="120" y="104" textAnchor="middle">
          BUILD
        </text>
        <text x="200" y="104" textAnchor="middle">
          LIVE
        </text>
      </motion.g>
    </Frame>
  );
}

const LAYERS = [
  [40, 70, 100],
  [30, 55, 85, 110],
  [45, 70, 95],
] as const;
const LX = [80, 120, 160] as const;

/** 02 — Model: tokens in, a small network firing, a summary out. */
export function ModelIllo() {
  const edges: string[] = [];
  LAYERS.slice(0, -1).forEach((layer, li) => {
    layer.forEach((y1) => {
      LAYERS[li + 1]!.forEach((y2) => edges.push(`M${LX[li]} ${y1} L${LX[li + 1]} ${y2}`));
    });
  });
  return (
    <Frame label="Tokens flowing through a small neural network into a summary">
      {[48, 64, 80, 96].map((y, i) => (
        <motion.rect
          key={y}
          x="22"
          y={y - 4}
          width={i % 2 ? 26 : 34}
          height="6"
          rx="3"
          stroke="currentColor"
          strokeWidth="1"
          variants={draw(i * 0.3)}
        />
      ))}
      <motion.path
        d={edges.join(" ")}
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.55"
        variants={draw(1)}
      />
      {LAYERS.map((layer, li) =>
        layer.map((y, ni) => (
          <motion.circle
            key={`${li}-${ni}`}
            cx={LX[li]}
            cy={y}
            r="5"
            fill="var(--background)"
            stroke="currentColor"
            strokeWidth="1.1"
            variants={pop(li + ni * 0.2)}
          />
        )),
      )}
      {LAYERS.map((layer, li) => (
        <motion.g key={`fire-${li}`} variants={pop(3)}>
          {layer.map((y, ni) => (
            <circle
              key={ni}
              className="illo-fire"
              style={{ animationDelay: `${li * 0.35 + ni * 0.08}s` }}
              cx={LX[li]}
              cy={y}
              r="2.4"
              fill="var(--accent)"
            />
          ))}
        </motion.g>
      ))}
      <motion.rect
        x="190"
        y="58"
        width="30"
        height="24"
        rx="5"
        stroke="var(--accent)"
        strokeWidth="1.2"
        variants={draw(3)}
      />
      <motion.path
        d="M196 66 h18 M196 71 h12 M196 76 h15"
        stroke="currentColor"
        strokeWidth="1"
        variants={draw(4)}
      />
      <motion.g variants={pop(3)}>
        <path
          className="illo-flow"
          d="M166 70 H188"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="2 3"
        />
      </motion.g>
      <motion.g variants={pop(4)} fill="currentColor" style={MONO}>
        <text x="36" y="120" textAnchor="middle">
          TAMIL
        </text>
        <text x="120" y="130" textAnchor="middle">
          mT5 + NER
        </text>
        <text x="205" y="104" textAnchor="middle">
          SUMMARY
        </text>
      </motion.g>
    </Frame>
  );
}

/** 03 — Mobile: a phone and its backend, data flowing both ways. */
export function MobileIllo() {
  return (
    <Frame label="A phone app syncing data with its backend in both directions">
      <motion.rect
        x="42"
        y="18"
        width="58"
        height="106"
        rx="12"
        stroke="currentColor"
        strokeWidth="1.2"
        variants={draw(0)}
      />
      <motion.path d="M62 26 h18" stroke="currentColor" strokeWidth="1.2" variants={draw(1)} />
      <motion.rect
        x="52"
        y="40"
        width="38"
        height="22"
        rx="4"
        stroke="currentColor"
        strokeWidth="1"
        variants={draw(1)}
      />
      <motion.path
        d="M52 72 h38 M52 80 h28 M52 88 h34"
        stroke="currentColor"
        strokeWidth="1"
        variants={draw(2)}
      />
      <motion.rect
        className="illo-blink"
        x="52"
        y="98"
        width="38"
        height="12"
        rx="6"
        stroke="var(--accent)"
        strokeWidth="1.1"
        variants={draw(3)}
      />
      <motion.path
        d="M168 44 c0 -6 40 -6 40 0 v52 c0 6 -40 6 -40 0 z M168 44 c0 6 40 6 40 0 M168 62 c0 6 40 6 40 0 M168 80 c0 6 40 6 40 0"
        stroke="currentColor"
        strokeWidth="1.1"
        variants={draw(1.5)}
      />
      <motion.g variants={pop(2)}>
        <path
          className="illo-flow"
          d="M104 58 H162"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        <path
          className="illo-flow"
          d="M162 84 H104"
          stroke="var(--accent)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
      </motion.g>
      <motion.path
        d="M156 53 l6 5 l-6 5 M110 79 l-6 5 l6 5"
        stroke="currentColor"
        strokeWidth="1"
        variants={draw(3.5)}
      />
      <motion.g variants={pop(3)} fill="currentColor" style={MONO}>
        <text x="71" y="136" textAnchor="middle">
          FLUTTER
        </text>
        <text x="188" y="118" textAnchor="middle">
          FIRESTORE
        </text>
      </motion.g>
    </Frame>
  );
}

/** 04 — Operate: an admin panel in use — bars updating, a card being moved. */
export function OperateIllo() {
  return (
    <Frame label="An admin dashboard in use, with charts updating and a card being reordered">
      <motion.rect
        x="20"
        y="16"
        width="200"
        height="110"
        rx="10"
        stroke="currentColor"
        strokeWidth="1.2"
        variants={draw(0)}
      />
      <motion.path
        d="M20 34 H220 M62 34 V126"
        stroke="currentColor"
        strokeWidth="0.9"
        variants={draw(1)}
      />
      <motion.path
        d="M30 48 h22 M30 58 h16 M30 68 h20 M30 78 h14"
        stroke="currentColor"
        strokeWidth="1"
        variants={draw(1.5)}
      />
      <motion.circle
        cx="30"
        cy="25"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1"
        variants={draw(1)}
      />
      <motion.g variants={pop(1)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            className="illo-bar"
            style={{ animationDelay: `${i * 0.25}s` }}
            x={76 + i * 14}
            y="62"
            width="8"
            height="44"
            rx="2"
            fill={i === 3 ? "var(--accent)" : "currentColor"}
            fillOpacity={i === 3 ? 0.9 : 0.35}
          />
        ))}
      </motion.g>
      <motion.path d="M72 106 H148" stroke="currentColor" strokeWidth="0.9" variants={draw(2)} />
      <motion.rect
        x="160"
        y="46"
        width="48"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1"
        variants={draw(2)}
      />
      <motion.rect
        x="160"
        y="90"
        width="48"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="1"
        variants={draw(2.5)}
      />
      <motion.g variants={pop(2)}>
        <g className="illo-drag">
          <rect
            x="160"
            y="68"
            width="48"
            height="16"
            rx="3"
            fill="var(--background)"
            stroke="var(--accent)"
            strokeWidth="1.2"
          />
          <path d="M165 73 v6 M168 73 v6" stroke="var(--accent)" strokeWidth="1" />
          <path d="M196 80 l7 4 l-3 1 l2 4 l-2 1 l-2 -4 l-2 2 z" fill="currentColor" />
        </g>
      </motion.g>
      <motion.g variants={pop(3)} fill="currentColor" style={MONO}>
        <text x="120" y="118" textAnchor="middle">
          REVENUE
        </text>
        <text x="184" y="118" textAnchor="middle">
          MEDIA
        </text>
      </motion.g>
    </Frame>
  );
}

export const CAPABILITY_ILLOS = {
  ship: ShipIllo,
  model: ModelIllo,
  mobile: MobileIllo,
  operate: OperateIllo,
} as const;
