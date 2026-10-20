import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import tl from "../timeline.json";
import { K, grotesk, hand, lift, mono, sans, serif } from "../theme";
import { inOut, mix, prog } from "../../ease";
import { DESK } from "../data";
import { Kicker, Sticky, Win, useSlap } from "../ui";

const D = tl.desk;
const OV = tl.projectOverlap;
const OVERVIEW = { x: 2100, y: 1200, z: 0.44 };

/** Camera stops on the canvas. The copy card sits bottom-left, so aim right of centre. */
const CAMS = DESK.map((d) => ({ x: d.cam.x - 300 / d.cam.z, y: d.cam.y + 40, z: d.cam.z * 0.9 }));

const camAt = (g: number) => {
  const keys: { t: number; c: typeof OVERVIEW }[] = [{ t: 0, c: OVERVIEW }, { t: D.stops[0]! - 70, c: OVERVIEW }];
  D.stops.forEach((s, k) => {
    keys.push({ t: s, c: CAMS[k]! });
    const next = D.stops[k + 1];
    keys.push({ t: next !== undefined ? next - 64 : D.out, c: CAMS[k]! });
  });
  keys.push({ t: D.out + 54, c: OVERVIEW });
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]!;
    const b = keys[i + 1]!;
    if (g <= b.t) {
      const p = Math.min(1, Math.max(0, (g - a.t) / Math.max(1, b.t - a.t)));
      const e = inOut(p);
      const dip = a.c === b.c ? 0 : 0.22 * Math.sin(Math.PI * p);
      return {
        x: mix(a.c.x, b.c.x, e),
        y: mix(a.c.y, b.c.y, e),
        z: Math.exp(mix(Math.log(a.c.z), Math.log(b.c.z), e)) * (1 - dip),
      };
    }
  }
  return OVERVIEW;
};

/** Something placed on the canvas that pops in with the overview. */
const Item = ({ x, y, at, r = 0, children }: { x: number; y: number; at: number; r?: number; children: ReactNode }) => {
  const f = useCurrentFrame();
  const s = useSlap(at, 14, 170);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: f >= at ? 1 : 0, transform: `scale(${mix(0.7, 1, s)}) rotate(${r}deg)`, transformOrigin: "50% 50%" }}>
      {children}
    </div>
  );
};

const Shot = ({ src, w, ratio, url, dark }: { src: string; w: number; ratio: number; url?: string; dark?: boolean }) => (
  <Win url={url} width={w} dark={dark} h={1.6}>
    <Img src={staticFile(src)} style={{ width: w, height: w / ratio, display: "block", objectFit: "cover", objectPosition: "top" }} />
  </Win>
);

/** Little text card, after the reference's paper notes. */
const Note = ({ title, body, w = 300, style }: { title: string; body: string; w?: number; style?: CSSProperties }) => (
  <div style={{ width: w, padding: "26px 26px 30px", borderRadius: 14, background: K.card, boxShadow: `0 0 0 1px ${K.lineSoft}, ${lift(1)}`, ...style }}>
    <div style={{ fontFamily: grotesk, fontWeight: 800, fontSize: 30, lineHeight: 1.05, letterSpacing: -0.8, color: K.ink }}>{title}</div>
    <div style={{ fontFamily: sans, fontSize: 17, lineHeight: 1.45, color: K.ink2, marginTop: 14 }}>{body}</div>
  </div>
);

/* ------------------------------------------------- Plasma widget cluster --- */

const Ring = ({ pct, color, label, grow }: { pct: number; color: string; label: string; grow: number }) => {
  const R = 46;
  const C = 2 * Math.PI * R;
  const v = pct * grow;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="11" />
        <circle cx="60" cy="60" r={R} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" strokeDasharray={`${C * v} ${C}`} transform="rotate(-90 60 60)" />
        <text x="60" y="68" textAnchor="middle" fontFamily={grotesk} fontWeight="800" fontSize="26" fill="#fff">
          {Math.round(v * 100)}%
        </text>
      </svg>
      <div style={{ fontFamily: sans, fontSize: 17, color: "rgba(255,255,255,0.75)" }}>{label}</div>
    </div>
  );
};

const Panel = ({ children, w, title, style }: { children: ReactNode; w: number; title: string; style?: CSSProperties }) => (
  <div style={{ width: w, padding: 26, borderRadius: 26, background: "#202126", boxShadow: `0 0 0 1px rgba(255,255,255,0.06) inset, ${lift(1.4)}`, ...style }}>
    <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 18, color: "rgba(255,255,255,0.55)", marginBottom: 20, letterSpacing: 0.3 }}>{title}</div>
    {children}
  </div>
);

const Plasma = ({ grow }: { grow: number }) => {
  const tiles = [
    { t: "Wi-Fi", s: "home-5G", on: true },
    { t: "Bluetooth", s: "JBuds Lux", on: true },
    { t: "Do not disturb", s: "focus", on: false },
    { t: "Night light", s: "auto", on: true },
    { t: "Screenshot", s: "region", on: false },
    { t: "Miss Minutes", s: "listening", on: true },
  ];
  return (
    <div style={{ position: "relative", width: 1000, height: 700 }}>
      <Panel w={470} title="AI Usage" style={{ position: "absolute", left: 0, top: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Ring pct={0.62} color="#E8875A" label="Claude" grow={grow} />
          <Ring pct={0.38} color="#8EA2FF" label="Codex" grow={grow} />
          <Ring pct={0.21} color="#7BE38E" label="Antigravity" grow={grow} />
        </div>
      </Panel>
      <Panel w={500} title="Quick Settings · Material You" style={{ position: "absolute", left: 500, top: 30 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {tiles.map((x) => (
            <div key={x.t} style={{ padding: "16px 18px", borderRadius: 18, background: x.on ? "#C9C3FF" : "#34343C", color: x.on ? "#1A1747" : "rgba(255,255,255,0.8)" }}>
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 18 }}>{x.t}</div>
              <div style={{ fontFamily: sans, fontSize: 14, opacity: 0.7, marginTop: 3 }}>{x.s}</div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel w={470} title="Vercel · Dev servers" style={{ position: "absolute", left: 0, top: 300 }}>
        <div style={{ fontFamily: mono, fontSize: 18, lineHeight: 1.9, color: "rgba(255,255,255,0.85)" }}>
          <div>
            <span style={{ color: "#FEBC2E" }}>●</span> nivas.tech — building
          </div>
          <div>
            <span style={{ color: "#28C840" }}>●</span> :3000 next dev
          </div>
          <div>
            <span style={{ color: "#28C840" }}>●</span> :5173 vite
          </div>
        </div>
      </Panel>
      <div style={{ position: "absolute", left: 520, top: 420, width: 470, borderRadius: 22, overflow: "hidden", boxShadow: lift(1.6), background: "#202126" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", fontFamily: sans, fontSize: 16, color: "rgba(255,255,255,0.7)" }}>
          <span>Quick Look — estate-home.webp</span>
          <span style={{ fontFamily: mono, fontSize: 14, padding: "3px 9px", borderRadius: 6, background: "rgba(255,255,255,0.12)" }}>Ctrl + Space</span>
        </div>
        <Img src={staticFile("media/estate-ulagam/screen-01-home.webp")} style={{ width: 470, height: 230, objectFit: "cover", display: "block" }} />
      </div>
    </div>
  );
};

/* ----------------------------------------------------------- copy card --- */

const Caption = ({ g }: { g: number }) => {
  let k = -1;
  D.stops.forEach((s, i) => {
    if (g >= s - 16) k = i;
  });
  if (k < 0) return null;
  const d = DESK[k]!;
  const start = D.stops[k]! - 16;
  const next = D.stops[k + 1];
  const end = next !== undefined ? next - 64 : D.out;
  const p = prog(g, start, 30);
  const q = prog(g, end - 6, 22, inOut);
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        bottom: 70,
        width: 560,
        padding: "34px 38px 38px",
        borderRadius: 22,
        background: K.card,
        boxShadow: `0 0 0 1px ${K.lineSoft}, ${lift(1.8)}`,
        opacity: p * (1 - q),
        transform: `translateY(${mix(40, 0, p) + mix(0, 30, q)}px) rotate(${mix(-2, 0, p)}deg)`,
      }}
    >
      <Kicker style={{ fontSize: 15, letterSpacing: 2.4 }}>
        <span style={{ color: K.blue }}>0{k + 1}</span> · {d.kicker}
      </Kicker>
      <div style={{ fontFamily: grotesk, fontWeight: 800, fontSize: d.name.length > 16 ? 54 : 66, letterSpacing: -2.4, lineHeight: 1, color: K.ink, marginTop: 18 }}>{d.name}</div>
      <div style={{ fontFamily: sans, fontSize: 24, lineHeight: 1.45, color: K.ink2, marginTop: 18 }}>{d.line}</div>
    </div>
  );
};

/* --------------------------------------------------------------- scene --- */

export const Desk = () => {
  const f = useCurrentFrame();
  const g = f - OV;
  const sheet = prog(f, 0, OV, inOut);
  const cam = camAt(g);
  const P = (i: number) => D.pop + i * D.popStep;
  const plasmaGrow = prog(g, D.stops[4]! - 30, 70, inOut);
  const head = prog(g, 6, 30) * (1 - prog(g, D.stops[0]! - 96, 24));

  return (
    <AbsoluteFill style={{ transform: `translateX(${mix(1990, 0, sheet)}px)`, boxShadow: "-30px 0 70px rgba(40,30,10,0.28)", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "#E4E4E0" }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 4200,
          height: 2400,
          transformOrigin: "0 0",
          transform: `translate(${960 - cam.x * cam.z}px, ${540 - cam.y * cam.z}px) scale(${cam.z})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -400,
            backgroundImage: "radial-gradient(rgba(23,22,15,0.2) 2px, transparent 2.4px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* A — Jobtrail */}
        <Item x={190} y={300} at={P(0)} r={-1}>
          <Shot src="media/jobtrail/screen-02-board.webp" w={1180} ratio={1.6} url="localhost:3000/board" dark />
        </Item>
        <Item x={1100} y={1000} at={P(1)} r={4}>
          <Sticky at={P(1)} color={K.sticky.yellow} rotate={4} w={280} hgt={170} size={36}>
            stops before Submit. always.
          </Sticky>
        </Item>
        <Item x={60} y={130} at={P(2)} r={-2}>
          <div style={{ fontFamily: mono, fontSize: 22, padding: "12px 18px", borderRadius: 10, background: K.ink, color: "#fff", boxShadow: lift(1) }}>
            helper → 127.0.0.1:4777 · no API key
          </div>
        </Item>

        {/* B — Through Vacations */}
        <Item x={1580} y={240} at={P(3)} r={1}>
          <Shot src="media/through-vacations/screen-01-home.webp" w={1080} ratio={1.6} url="through-vacations — preview" />
        </Item>
        <Item x={1700} y={1010} at={P(4)} r={-3}>
          <Note title="17 trips." body="Kashmir to the Maldives. A departure board for destinations, and a trip shaper that scores effort, not price." w={330} />
        </Item>

        {/* C — Miss Minutes */}
        <Item x={2870} y={353} at={P(5)} r={-1}>
          <Shot src="media/miss-minutes/screen-01-cover.webp" w={1100} ratio={1.6} dark />
        </Item>
        <Item x={3720} y={150} at={P(6)} r={5}>
          <div style={{ padding: "18px 26px", borderRadius: "26px 26px 26px 6px", background: K.blue, color: "#fff", fontFamily: hand, fontWeight: 700, fontSize: 46, boxShadow: lift(1.2) }}>
            “Hey Minutes…”
          </div>
        </Item>
        <Item x={2700} y={1040} at={P(7)} r={-4}>
          <Sticky at={P(7)} color={K.sticky.mint} rotate={-4} w={250} hgt={150} size={38}>
            281 tests, all green
          </Sticky>
        </Item>

        {/* D — JLab Buds */}
        <Item x={330} y={1414} at={P(8)} r={1}>
          <Shot src="media/jlab-buds-linux/screen-01-sound.webp" w={980} ratio={1500 / 1050} dark />
        </Item>
        <Item x={900} y={2200} at={P(9)} r={-1}>
          <div style={{ fontFamily: mono, fontSize: 24, padding: "14px 22px", borderRadius: 10, background: K.card, color: K.ink, boxShadow: `0 0 0 1px ${K.line}, ${lift(1)}` }}>
            FE DC BA | flags | opcode | len | body | EF
          </div>
        </Item>

        {/* E — Plasma widgets */}
        <Item x={1610} y={1410} at={P(10)}>
          <Plasma grow={Math.max(plasmaGrow, prog(g, P(10), 60) * 0.4)} />
        </Item>

        {/* F — Arcade */}
        <Item x={2880} y={1505} at={P(11)} r={-1.5}>
          <Shot src="media/arcade/ship-it.jpg" w={1040} ratio={1600 / 900} url="nivas.tech/arcade" />
        </Item>
        <Item x={3700} y={1380} at={P(12)} r={6}>
          <Sticky at={P(12)} color={K.sticky.pink} rotate={6} w={250} hgt={150} size={36}>
            + 7 arcade games
          </Sticky>
        </Item>
      </div>

      {/* heading over the overview */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: head }}>
        <div
          style={{
            padding: "36px 56px",
            borderRadius: 26,
            background: "rgba(252,251,248,0.92)",
            boxShadow: lift(2),
            textAlign: "center",
            transform: `translateY(${mix(30, 0, prog(g, 6, 30))}px)`,
          }}
        >
          <Kicker style={{ fontSize: 17 }}>Off the clock</Kicker>
          <div style={{ fontFamily: serif, fontSize: 104, lineHeight: 1, letterSpacing: -2, color: K.ink, marginTop: 12 }}>
            I build my <span style={{ fontStyle: "italic", color: K.blue }}>own tools.</span>
          </div>
        </div>
      </AbsoluteFill>

      {/* toolbar + dock, after the reference */}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 64,
          display: "flex",
          gap: 26,
          padding: "14px 24px",
          borderRadius: 18,
          background: "#26262B",
          boxShadow: lift(1),
          opacity: prog(g, 20, 30),
        }}
      >
        {["☰", "#", "✓"].map((c) => (
          <span key={c} style={{ fontFamily: sans, fontSize: 22, color: "rgba(255,255,255,0.8)", width: 22, textAlign: "center" }}>
            {c}
          </span>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          right: 50,
          bottom: 46,
          display: "flex",
          gap: 12,
          padding: 12,
          borderRadius: 22,
          background: "rgba(252,251,248,0.8)",
          boxShadow: `0 0 0 1px ${K.lineSoft}, ${lift(1)}`,
          opacity: prog(g, 30, 30),
        }}
      >
        {["#2B37D6", "#E5352B", "#D9F36B", "#17160F", "#F7C5D9", "#DD6B3D"].map((c, i) => {
          const active = i === Math.max(0, D.stops.findIndex((s, k) => g >= s - 16 && (D.stops[k + 1] === undefined || g < D.stops[k + 1]! - 16)));
          return (
            <span
              key={c}
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: c,
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
                transform: `translateY(${active && g >= D.stops[0]! - 16 ? -10 : 0}px)`,
              }}
            />
          );
        })}
      </div>

      <Caption g={g} />
    </AbsoluteFill>
  );
};
