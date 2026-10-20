import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import tl from "../timeline.json";
import { K, grotesk, lift, mono } from "../theme";
import { inOut, inQuint, mix, prog } from "../../ease";
import { TECH } from "../data";
import { Kicker, StripeWipe, useSlap } from "../ui";

const O = tl.orbit;

type Tile = { t?: string; bg: string; fg: string; img?: string };
const TILES: Tile[] = [
  ...TECH.slice(0, 5),
  { bg: K.blue, fg: "#fff", img: "media/portrait.png" },
  ...TECH.slice(5, 10),
  { bg: "#000", fg: "#fff", img: "media/miss-minutes/screen-01-cover.webp" },
  ...TECH.slice(10, 14),
  { bg: "#000", fg: "#fff", img: "media/anibakes/screen-01-home.webp" },
  ...TECH.slice(14),
  { bg: "#000", fg: "#fff", img: "media/suganniya-construction/screen-07-b3d-dusk.webp" },
];
const N = TILES.length;
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const STATS = [
  { v: 6, d: 0, pad: 2, label: "products live" },
  { v: 18, d: 0, pad: 2, label: "markets served" },
  { v: 281, d: 0, pad: 3, label: "passing tests" },
  { v: 8.79, d: 2, pad: 1, label: "MCA GPA / 10" },
];

const Slider = ({ f, l, r, phase }: { f: number; l: string; r: string; phase: number }) => {
  const x = 0.5 + 0.38 * Math.sin(f / 34 + phase);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: mono, fontSize: 15, color: K.dim }}>
      <span style={{ width: 84, textAlign: "right" }}>{l}</span>
      <div style={{ position: "relative", width: 220, height: 2, background: "rgba(23,22,15,0.15)" }}>
        <div style={{ position: "absolute", top: -7, left: `calc(${x * 100}% - 16px)`, width: 32, height: 16, borderRadius: 16, background: K.ink }} />
      </div>
      <span style={{ width: 84 }}>{r}</span>
    </div>
  );
};

export const Orbit = () => {
  const f = useCurrentFrame();
  const open = prog(f, 0, 50);
  const theta = f * 0.0085 + 0.4;
  const stamp = useSlap(O.stamp, 11, 200);
  const sliders = prog(f, O.sliders, 30) * (1 - prog(f, O.collapse - 20, 24));

  return (
    <AbsoluteFill style={{ background: "#EDEDEA", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 130, top: 104, opacity: open * (1 - prog(f, O.collapse, 30)) }}>
        <Kicker>The stack, in production</Kicker>
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: sliders }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <Slider f={f} l="Web" r="Mobile" phase={0} />
          <Slider f={f} l="Server" r="Client" phase={2.1} />
          <Slider f={f} l="Research" r="Product" phase={4.2} />
        </div>
      </AbsoluteFill>

      {TILES.map((tile, i) => {
        const a = theta + (i / N) * Math.PI * 2;
        const d = (1 + Math.cos(a)) / 2;
        const size = mix(44, 176, Math.pow(d, 1.5));
        const R = 410 * open;
        const ox = 960 + R * Math.cos(a) * 1.05;
        const oy = 540 + R * Math.sin(a);
        const c = prog(f, O.collapse + i * 1.6, 44, inOut);
        const cx = 1330 + (rnd(i, 1) - 0.5) * 620;
        const cy = 560 + (rnd(i, 2) - 0.5) * 560;
        const cs = mix(150, 250, rnd(i, 3));
        const x = mix(ox, cx, c);
        const y = mix(oy, cy, c);
        const s = mix(size, cs, c);
        const rot = mix(0, (rnd(i, 4) - 0.5) * 18, c);
        const out = prog(f, O.exit - 30, 40, inQuint);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - s / 2,
              top: y - s / 2,
              width: s,
              height: s,
              zIndex: c > 0.5 ? 10 + i : Math.round(d * 100),
              borderRadius: s * 0.1,
              overflow: "hidden",
              background: tile.bg,
              color: tile.fg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: grotesk,
              fontWeight: 800,
              fontSize: s * 0.19,
              letterSpacing: -s * 0.006,
              boxShadow: tile.bg === "#fff" ? `0 0 0 1px ${K.line}, ${lift(0.4 + d * 0.6)}` : lift(0.4 + d * 0.6),
              transform: `rotate(${rot}deg) translateY(${out * 900 * (0.6 + rnd(i, 5))}px)`,
              opacity: open,
            }}
          >
            {tile.img ? <Img src={staticFile(tile.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : tile.t}
          </div>
        );
      })}

      {/* the stamp */}
      <div
        style={{
          position: "absolute",
          left: 1330 - 380,
          top: 560 - 190,
          width: 760,
          height: 380,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          boxShadow: lift(mix(5, 1.6, Math.min(1, stamp))),
          opacity: f >= O.stamp ? 1 - prog(f, O.exit - 26, 30) : 0,
          transform: `rotate(${mix(-14, -4, stamp)}deg) scale(${mix(1.9, 1, stamp)})`,
        }}
      >
        <span style={{ fontFamily: grotesk, fontWeight: 900, fontSize: 300, letterSpacing: -16, color: K.red, lineHeight: 1, marginTop: -20 }}>SHIP.</span>
      </div>

      {/* numbers */}
      <div style={{ position: "absolute", left: 130, top: 170, zIndex: 300, display: "flex", flexDirection: "column", gap: 10 }}>
        {STATS.map((s, i) => {
          const at = O.stats + i * O.statStep;
          const p = prog(f, at, 26);
          const out = prog(f, O.exit - 30 + i * 3, 30, inQuint);
          const n = interpolate(f, [at, at + 60], [0, s.v], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });
          return (
            <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 24, opacity: p * (1 - out), transform: `translateX(${mix(-40, 0, p) + mix(0, -200, out)}px)` }}>
              <span style={{ fontFamily: grotesk, fontWeight: 800, fontSize: 132, letterSpacing: -5, color: K.ink, lineHeight: 1.02, fontVariantNumeric: "tabular-nums", minWidth: 300 }}>
                {s.d ? n.toFixed(s.d) : String(Math.round(n)).padStart(s.pad, "0")}
              </span>
              <span style={{ fontFamily: mono, fontSize: 20, letterSpacing: 3, textTransform: "uppercase", color: K.ink2 }}>
                <span style={{ display: "inline-block", width: 26, height: 4, background: [K.blue, K.red, K.orange, K.ink][i], marginRight: 14, verticalAlign: "middle" }} />
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <StripeWipe at={O.exit - 12} dur={36} dir="in" />
    </AbsoluteFill>
  );
};
