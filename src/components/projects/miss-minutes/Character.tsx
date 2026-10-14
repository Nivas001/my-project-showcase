import { useEffect, useId, useImperativeHandle, useRef, useState, type Ref } from "react";

/**
 * Miss Minutes, drawn in SVG.
 *
 * A port of qml/Character.qml from the assistant itself: the same 300×340
 * canvas, the same geometry and the same eight moods, so the character on this
 * page is the one that lives on the desktop rather than a lookalike. QML drives
 * her with property animations; here one requestAnimationFrame loop derives
 * every value from the clock, and the pose eases toward each mood's targets
 * with a slight overshoot (QML used OutBack for the same transition).
 */

export type Mood =
  "idle" | "listening" | "thinking" | "speaking" | "acting" | "confirm" | "sad" | "sleeping";

export type CharacterHandle = {
  /** The hop + flash + time-door rings she does when an action runs. */
  hop: () => void;
  /** Materialise like a TVA hologram (scale up with a flicker and rings). */
  appear: () => void;
  /** Squash on press. */
  squish: () => void;
};

const C = {
  orange: "#f28a2e",
  orangeHi: "#f9a54f",
  orangeLo: "#e2721f",
  ink: "#552209",
  tick: "#6a2b0d",
  glow: "#ffe2a4",
  cream: "#fffaf2",
  mouthInside: "#3a1405",
};

type Pose = {
  smile: number;
  mouthBase: number;
  lidPos: number;
  lookX: number;
  lookY: number;
  tilt: number;
  sink: number;
  lhx: number;
  lhy: number;
  lcx: number;
  lcy: number;
  rhx: number;
  rhy: number;
  rcx: number;
  rcy: number;
};
type Hand = "open" | "fist" | "point";

const REST: Pose = {
  smile: 0.85,
  mouthBase: 0,
  lidPos: 0,
  lookX: 0,
  lookY: 0,
  tilt: 0,
  sink: 0,
  lhx: 34,
  lhy: 250,
  lcx: 24,
  lcy: 208,
  rhx: 244,
  rhy: 238,
  rcx: 292,
  rcy: 214,
};

// The `states:` block of Character.qml, value for value.
const POSES: Record<Mood, { pose: Partial<Pose>; left?: Hand; right?: Hand }> = {
  idle: { pose: {} },
  listening: {
    pose: {
      smile: 0.55,
      mouthBase: 0.12,
      lookX: 3,
      lookY: -3,
      tilt: 5,
      rhx: 262,
      rhy: 124,
      rcx: 296,
      rcy: 176,
    },
    right: "open",
  },
  thinking: {
    pose: { smile: 0.15, lookX: 5, lookY: -8, tilt: -4, lhx: 112, lhy: 240, lcx: 30, lcy: 262 },
    left: "fist",
  },
  speaking: { pose: { smile: 0.75, rhx: 266, rhy: 166, rcx: 294, rcy: 214 }, right: "open" },
  acting: {
    pose: {
      smile: 1,
      mouthBase: 0.5,
      lookX: 3,
      tilt: -3,
      rhx: 266,
      rhy: 84,
      rcx: 298,
      rcy: 150,
      lhx: 30,
      lhy: 214,
      lcx: 14,
      lcy: 196,
    },
    right: "open",
  },
  confirm: {
    pose: { smile: 0.4, lookX: -2, lookY: -4, tilt: 4, rhx: 258, rhy: 104, rcx: 294, rcy: 166 },
    right: "point",
  },
  sad: {
    pose: {
      smile: -0.75,
      lidPos: 0.42,
      lookY: 6,
      sink: 6,
      lhx: 58,
      lhy: 274,
      lcx: 44,
      lcy: 236,
      rhx: 242,
      rhy: 274,
      rcx: 256,
      rcy: 236,
    },
    right: "open",
  },
  sleeping: {
    pose: {
      smile: 0.35,
      lidPos: 1,
      sink: 3,
      lhx: 44,
      lhy: 262,
      lcx: 30,
      lcy: 224,
      rhx: 256,
      rhy: 262,
      rcx: 270,
      rcy: 224,
    },
    right: "open",
  },
};

const TALKING: Mood[] = ["speaking", "acting", "confirm", "sad"];
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
const easeInQuad = (t: number) => t * t;
const easeOutBack = (t: number, s = 1.70158) => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;

/** Blend two hex colours. */
function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i]! - v) * t)).join(",")})`;
}

/** Piecewise timeline helper: progress of [start, start+dur] at time t, or null outside. */
const seg = (t: number, start: number, dur: number) =>
  t < start || t > start + dur ? null : (t - start) / dur;

export function Character({
  mood,
  level,
  className,
  title = "Miss Minutes",
  animate = true,
  onPress,
  handle,
}: {
  mood: Mood;
  /** 0..1 mic level while listening or voice level while talking. Omit to synthesise one. */
  level?: number;
  className?: string;
  title?: string;
  animate?: boolean;
  onPress?: (() => void) | undefined;
  handle?: Ref<CharacterHandle> | undefined;
}) {
  const uid = useId().replace(/:/g, "");
  const [, setFrame] = useState(0);
  const now = useRef(0);
  const pose = useRef<Pose>({ ...REST, ...POSES[mood].pose });
  const vel = useRef<Record<string, number>>({});
  const events = useRef({
    hop: -1e9,
    appear: -1e9,
    squish: -1e9,
    blink: 1200,
    glanceAt: 4000,
    glanceBack: 0,
  });
  const glance = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const talkSmooth = useRef(0);
  const moodRef = useRef(mood);
  const moodSince = useRef(0);

  useImperativeHandle(handle, () => ({
    hop: () => {
      events.current.hop = now.current;
    },
    appear: () => {
      events.current.appear = now.current;
    },
    squish: () => {
      events.current.squish = now.current;
    },
  }));

  useEffect(() => {
    if (moodRef.current !== mood) {
      // Waking from sleep re-materialises her; starting an action hops.
      if (moodRef.current === "sleeping") events.current.appear = now.current;
      if (mood === "acting") events.current.hop = now.current;
      moodRef.current = mood;
      moodSince.current = now.current;
    }
  }, [mood]);

  // Without animation the pose snaps to the mood.
  useEffect(() => {
    if (animate) return;
    pose.current = { ...REST, ...POSES[mood].pose };
    setFrame((f) => f + 1);
  }, [animate, mood]);

  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    let last = performance.now();
    const start = last - now.current;
    const tick = (ts: number) => {
      const dt = Math.min(50, ts - last) / 1000;
      last = ts;
      now.current = ts - start;

      // Spring every pose value toward the current mood's target.
      const target = { ...REST, ...POSES[moodRef.current].pose };
      const p = pose.current;
      for (const key of Object.keys(target) as (keyof Pose)[]) {
        const v = vel.current[key] ?? 0;
        const force = (target[key] - p[key]) * 180 - v * 19;
        vel.current[key] = v + force * dt;
        p[key] += vel.current[key]! * dt;
      }
      setFrame((f) => (f + 1) % 1e6);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  // ---------------------------------------------------------------------------
  // Everything below derives from the clock (`t`, ms) and the eased pose.
  const t = now.current;
  const m = mood;
  const p = pose.current;
  const ev = events.current;
  const leftHand = POSES[m].left ?? "open";
  const rightHand = POSES[m].right ?? "fist";

  const phase = (t / (m === "sleeping" ? 4200 : 2400)) % 1;
  const bob = animate ? Math.sin(phase * 2 * Math.PI) * (m === "sleeping" ? 2.5 : 4) : 0;

  // Blink every 2.4–6 s (70 ms down, 130 ms up), never while asleep.
  if (animate && t > ev.blink + 200 && m !== "sleeping") ev.blink = t + 2400 + Math.random() * 3600;
  const bt = t - ev.blink;
  const blinkOpen =
    bt < 0 || bt > 200 ? 1 : bt < 70 ? 1 - easeInQuad(bt / 70) : easeOutQuad((bt - 70) / 130);

  // Idle glances, back to centre after 1.3 s.
  const g = glance.current;
  if (animate && m === "idle" && t > ev.glanceAt) {
    g.tx = (Math.random() - 0.5) * 9;
    g.ty = (Math.random() - 0.5) * 5;
    ev.glanceBack = t + 1300;
    ev.glanceAt = t + 5000 + Math.random() * 7000;
  }
  if (t > ev.glanceBack || m !== "idle") {
    g.tx = 0;
    g.ty = 0;
  }
  g.x += (g.tx - g.x) * 0.18;
  g.y += (g.ty - g.y) * 0.18;

  // Voice / mic level: supplied, or synthesised as a talking-ish wobble.
  const talking = TALKING.includes(m);
  const synth =
    0.45 + 0.35 * Math.sin(t / 47) * Math.sin(t / 113) + 0.2 * Math.abs(Math.sin(t / 71));
  const lvl = clamp(level ?? (talking || m === "listening" ? synth : 0));
  const talkTarget = talking && m !== "sad" ? Math.min(1, lvl * 1.5) : m === "sad" ? lvl * 0.4 : 0;
  talkSmooth.current += (talkTarget - talkSmooth.current) * 0.35;
  const talk = animate ? talkSmooth.current : 0;

  // Waving arm while acting / speaking.
  const wavePeriod = m === "acting" ? 480 : 1300;
  const wave =
    animate && (m === "acting" || m === "speaking") ? Math.sin((t / wavePeriod) * 2 * Math.PI) : 0;
  const waveX = wave * (m === "acting" ? 7 : m === "speaking" ? 3 : 0);
  const waveY = -Math.abs(wave) * (m === "acting" ? 4 : 2);
  const waveA = wave * (m === "acting" ? 26 : m === "speaking" ? 8 : 0);

  const spin = ((t / 1100) * 12) % 12;
  const glitchCycle = (t - moodSince.current) % 1590;
  const glitch =
    animate && m === "thinking" && glitchCycle > 1400
      ? glitchCycle < 1440
        ? 4
        : glitchCycle < 1490
          ? -3
          : glitchCycle < 1530
            ? 2
            : 0
      : 0;

  // Hop: squash, jump 20 px, land, squash again with a springy recovery.
  const h = t - ev.hop;
  let hop = 0;
  let land = 0;
  let s: number | null;
  if ((s = seg(h, 0, 90)) !== null) land = easeOutQuad(s);
  else if ((s = seg(h, 90, 190)) !== null) {
    hop = 20 * easeOutQuad(s);
    land = 1 - clamp(s * (190 / 120));
  } else if ((s = seg(h, 280, 190)) !== null) hop = 20 * (1 - easeInQuad(s));
  else if ((s = seg(h, 470, 70)) !== null) land = 0.8 * s;
  else if ((s = seg(h, 540, 260)) !== null) land = 0.8 * (1 - easeOutBack(s, 3));
  // Press squash.
  const q = t - ev.squish;
  if ((s = seg(q, 0, 80)) !== null) land = Math.max(land, 0.7 * s);
  else if ((s = seg(q, 80, 300)) !== null) land = 0.7 * (1 - easeOutBack(s, 3));

  const fl = seg(h, 0, 840);
  const flash =
    fl === null ? 0 : fl < 140 / 840 ? fl / (140 / 840) : 1 - easeInQuad((fl * 840 - 140) / 700);

  // Materialise: scale with overshoot, a hologram flicker, and the rings.
  const a = t - ev.appear;
  const appear = a < 0 || a > 420 ? 1 : easeOutBack(a / 420, 2.2);
  const flicker =
    a < 0 || a > 240
      ? 1
      : a < 50
        ? 1 - 0.65 * (a / 50)
        : a < 110
          ? 0.35 + 0.65 * ((a - 50) / 60)
          : a < 150
            ? 1 - 0.45 * ((a - 110) / 40)
            : 0.55 + 0.45 * ((a - 150) / 90);
  const rippleT = Math.max(seg(h, 0, 1100) ?? -1, seg(a, 0, 1100) ?? -1);
  const ripple = rippleT < 0 ? 1 : 1 - (1 - rippleT) ** 3;

  // Scan band every ~6.3 s.
  const sw = (t % 6300) - 5200;
  const sweep =
    animate && m !== "sleeping" && sw > 0
      ? -1 + 2 * (0.5 - Math.cos((sw / 1100) * Math.PI) / 2)
      : -1;

  // ---------------------------------------------------------------------------
  const tickGlow = (i: number) => {
    if (m === "listening") return i < Math.round(Math.min(1, lvl * 1.5) * 12) ? 1 : 0.1;
    if (m === "thinking") return Math.max(0, 1 - ((spin - i + 12) % 12) / 4);
    if (m === "speaking") return talk * 0.35;
    return flash;
  };
  const armAngle = (cx: number, cy: number, hx: number, hy: number) =>
    (Math.atan2(hx - cx, -(hy - cy)) * 180) / Math.PI;

  const yBody = bob + p.sink;
  const xs = 1 + land * 0.07 + bob * 0.003;
  const ys = 1 - land * 0.09 - bob * 0.004 + talk * 0.02;
  const mouthOpen = Math.min(1, p.mouthBase + (talking ? talk * (m === "acting" ? 0.6 : 1) : 0));
  const haloOpacity =
    m === "sleeping" ? 0.18 : m === "listening" ? 0.5 + lvl * 0.5 : m === "acting" ? 0.75 : 0.45;

  return (
    <svg
      viewBox="0 0 300 340"
      className={className}
      role="img"
      aria-label={`${title}, ${m}`}
      onPointerDown={() => {
        events.current.squish = now.current;
      }}
      onClick={() => {
        events.current.hop = now.current;
        onPress?.();
      }}
      style={{ overflow: "visible", cursor: onPress ? "pointer" : undefined }}
    >
      <defs>
        <radialGradient id={`floor-${uid}`}>
          <stop offset="0" stopColor="rgba(255,140,38,0.45)" />
          <stop offset="1" stopColor="rgba(255,140,38,0)" />
        </radialGradient>
        <radialGradient id={`halo-${uid}`}>
          <stop offset="0.6" stopColor="rgba(255,143,41,0.55)" />
          <stop offset="1" stopColor="rgba(255,143,41,0)" />
        </radialGradient>
        <radialGradient
          id={`face-${uid}`}
          gradientUnits="userSpaceOnUse"
          cx="140"
          cy="132"
          r="112"
          fx="136"
          fy="124"
        >
          <stop offset="0" stopColor={C.orangeHi} />
          <stop offset="0.75" stopColor={C.orange} />
          <stop offset="1" stopColor={C.orangeLo} />
        </radialGradient>
      </defs>

      {/* projector glow on the floor */}
      <ellipse
        cx="150"
        cy="329"
        rx={90 * (1 - hop / 60)}
        ry={11 * (1 - hop / 60)}
        fill={`url(#floor-${uid})`}
        opacity={(m === "sleeping" ? 0.35 : 0.8) * (1 - hop / 50)}
      />

      <g
        opacity={flicker * (m === "sleeping" ? 0.8 : 1)}
        transform={`translate(${glitch} ${-hop}) translate(150 340) scale(${0.55 + 0.45 * appear}) translate(-150 -340)`}
      >
        {/* halo */}
        <circle
          cx="150"
          cy={150 + yBody}
          r="150"
          fill={`url(#halo-${uid})`}
          opacity={haloOpacity}
        />

        {/* time-door rings */}
        {ripple < 1
          ? [0, 1, 2].map((i) => {
              const r = 100 + Math.max(0, ripple * 170 - i * 34);
              if (r <= 101) return null;
              return (
                <ellipse
                  key={i}
                  cx="150"
                  cy={150 + yBody}
                  rx={r}
                  ry={r * 1.12}
                  fill="none"
                  stroke={i === 0 ? "#ffc56b" : "#ff9a3c"}
                  strokeWidth={3 - i * 0.6}
                  opacity={(1 - ripple) * (0.85 - i * 0.2)}
                />
              );
            })
          : null}

        {/* time motes drifting up while she listens / talks */}
        {animate && (m === "listening" || m === "speaking" || m === "acting")
          ? [
              [70, 0, 3.5],
              [228, 450, 3],
              [104, 900, 2.5],
              [196, 1300, 4],
              [44, 1700, 2.5],
              [256, 2100, 3],
            ].map(([x, delay, r], i) => {
              const mt = ((t - moodSince.current - delay! + 2600 * 10) % 2600) / 2600;
              if (t - moodSince.current < delay!) return null;
              return (
                <circle
                  key={i}
                  cx={x! + Math.sin(mt * 9 + delay!) * 8 + r!}
                  cy={250 - mt * 210 + r!}
                  r={r}
                  fill="#ffd59a"
                  opacity={Math.sin(mt * Math.PI) * 0.8}
                />
              );
            })
          : null}

        {/* legs */}
        <line
          x1="137"
          y1={244 + yBody}
          x2="128"
          y2="322"
          stroke={C.ink}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line
          x1="163"
          y1={244 + yBody}
          x2="172"
          y2="322"
          stroke={C.ink}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <Shoe footX={128} footY={322} toeLeft />
        <Shoe footX={172} footY={322} toeLeft={false} />

        {/* body: disc, face, arms */}
        <g
          transform={`translate(0 ${yBody - talk * 3}) translate(150 250) rotate(${p.tilt}) scale(${xs} ${ys}) translate(-150 -250)`}
        >
          <Arm sx={58} sy={186} cx={p.lcx} cy={p.lcy} hx={p.lhx} hy={p.lhy} />
          <Arm sx={242} sy={186} cx={p.rcx} cy={p.rcy} hx={p.rhx + waveX} hy={p.rhy + waveY} />

          <circle
            cx="150"
            cy="150"
            r="101"
            fill="none"
            stroke="rgba(255,191,102,0.35)"
            strokeWidth="10"
          />
          <circle
            cx="150"
            cy="150"
            r="100"
            fill={`url(#face-${uid})`}
            stroke={C.ink}
            strokeWidth="3.5"
          />
          <circle
            cx="150"
            cy="150"
            r="93"
            fill="none"
            stroke="rgba(191,84,18,0.45)"
            strokeWidth="2.5"
          />

          {/* hour ticks: a mic meter while listening, a chase while thinking */}
          {Array.from({ length: 12 }, (_, i) => {
            const major = i % 3 === 0;
            const gl = tickGlow(i);
            const w = major ? 6.5 : 5.5;
            const gw = major ? 13 : 11;
            return (
              <g key={i} transform={`rotate(${i * 30} 150 150)`}>
                {gl > 0.05 ? (
                  <rect
                    x={150 - gw / 2}
                    y={150 - 91}
                    width={gw}
                    height={major ? 24 : 18}
                    rx={gw / 2}
                    fill={C.glow}
                    opacity={gl * 0.55}
                  />
                ) : null}
                <rect
                  x={150 - w / 2}
                  y={150 - 88}
                  width={w}
                  height={major ? 19 : 13}
                  rx={w / 2}
                  fill={mix(C.tick, "#ffe6a6", gl)}
                />
              </g>
            );
          })}

          <Eye
            uid={`${uid}l`}
            cx={116 + p.lookX * 0.5}
            cy={133 + p.lookY * 0.3}
            side={-1}
            shut={Math.max(p.lidPos, 1 - blinkOpen)}
            px={p.lookX + g.x}
            py={p.lookY + g.y}
          />
          <Eye
            uid={`${uid}r`}
            cx={184 + p.lookX * 0.5}
            cy={133 + p.lookY * 0.3}
            side={1}
            shut={Math.max(p.lidPos, 1 - blinkOpen)}
            px={p.lookX + g.x}
            py={p.lookY + g.y}
          />
          <circle cx={150 + p.lookX * 0.7} cy={160 + p.lookY * 0.3} r="5" fill={C.ink} />
          <Mouth
            cx={150 + p.lookX * 0.65}
            cy={192 + p.lookY * 0.2}
            smile={p.smile}
            open={mouthOpen}
          />

          {/* hologram scanlines, each the width of its chord */}
          {Array.from({ length: 19 }, (_, i) => {
            const dy = -90 + i * 10;
            const w = 2 * Math.sqrt(Math.max(0, 97 * 97 - dy * dy));
            return (
              <rect
                key={i}
                x={150 - w / 2}
                y={150 + dy}
                width={w}
                height="1.6"
                fill="rgba(89,26,0,0.07)"
              />
            );
          })}
          {sweep > -1 && sweep < 1
            ? (() => {
                const dy = sweep * 92;
                const w = 2 * Math.sqrt(Math.max(0, 96 * 96 - dy * dy));
                return (
                  <rect
                    x={150 - w / 2}
                    y={150 + dy - 7}
                    width={w}
                    height="14"
                    rx="7"
                    fill="rgba(255,237,191,0.16)"
                  />
                );
              })()
            : null}

          <Glove
            x={p.lhx}
            y={p.lhy}
            kind={leftHand}
            mirror={1}
            angle={armAngle(p.lcx, p.lcy, p.lhx, p.lhy)}
          />
          <Glove
            x={p.rhx + waveX}
            y={p.rhy + waveY}
            kind={rightHand}
            mirror={-1}
            angle={armAngle(p.rcx, p.rcy, p.rhx, p.rhy) + waveA}
          />
        </g>

        {/* sparkles when she does something */}
        {m === "acting"
          ? [
              [34, 64, 0],
              [262, 46, 120],
              [278, 196, 240],
              [18, 168, 360],
            ].map(([x, y, d], i) => {
              const c = (t - moodSince.current) % 1020;
              const sc =
                c < d!
                  ? 0
                  : c < d! + 220
                    ? 1.1 * easeOutBack((c - d!) / 220)
                    : c < d! + 540
                      ? 1.1 * (1 - easeInQuad((c - d! - 220) / 320))
                      : 0;
              return (
                <path
                  key={i}
                  transform={`translate(${x! + 8} ${y! + 8}) scale(${Math.max(0, sc)}) translate(-8 -8)`}
                  d="M8 0 Q9 7 16 8 Q9 9 8 16 Q7 9 0 8 Q7 7 8 0Z"
                  fill="#fff1c8"
                />
              );
            })
          : null}

        {/* Zzz */}
        {m === "sleeping" && animate
          ? [0, 1, 2].map((i) => {
              const zt = ((t + i * 860) % 2600) / 2600;
              return (
                <text
                  key={i}
                  x={236 + i * 14 + Math.sin(zt * 6.28) * 4}
                  y={70 - i * 20 - zt * 18 + 16}
                  fill="#ffd59a"
                  fontWeight="900"
                  fontSize={16 + i * 6}
                  opacity={1 - zt}
                  fontFamily="var(--font-display, system-ui)"
                >
                  z
                </text>
              );
            })
          : null}
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------- parts --- */

function Arm(props: { sx: number; sy: number; cx: number; cy: number; hx: number; hy: number }) {
  const d = `M${props.sx} ${props.sy} Q${props.cx} ${props.cy} ${props.hx} ${props.hy}`;
  return (
    <>
      <path d={d} fill="none" stroke={C.ink} strokeWidth="11" strokeLinecap="round" />
      <path d={d} fill="none" stroke={C.orange} strokeWidth="6" strokeLinecap="round" />
    </>
  );
}

function Shoe({ footX, footY, toeLeft }: { footX: number; footY: number; toeLeft: boolean }) {
  const x = footX + (toeLeft ? -26 : -12);
  const y = footY - 9;
  const ox = toeLeft ? 38 : 0;
  const stroke = { stroke: C.ink, strokeWidth: 2.5 };
  return (
    <g transform={`translate(${x + ox} ${y + 18}) scale(1.2) translate(${-ox} -18)`}>
      <rect x={toeLeft ? 0 : 12} y="0" width="26" height="17" rx="8.5" fill={C.cream} {...stroke} />
      <rect x={toeLeft ? 20 : 4} y="4" width="14" height="13" rx="5" fill={C.cream} {...stroke} />
      <rect x={toeLeft ? 18 : 10} y="6.5" width="10" height="8" fill={C.cream} />
      <rect x="2" y="15" width="34" height="3" rx="1.5" fill={C.ink} />
    </g>
  );
}

function Eye({
  uid,
  cx,
  cy,
  side,
  shut,
  px,
  py,
}: {
  uid: string;
  cx: number;
  cy: number;
  side: -1 | 1;
  shut: number;
  px: number;
  py: number;
}) {
  const a = 22;
  const b = 33;
  const ex = cx - a;
  const ey = cy - b;

  if (shut >= 0.97) {
    const d = [
      `M${ex + 2} ${ey + b + 6} Q${ex + a} ${ey + b + 20} ${ex + 2 * a - 2} ${ey + b + 6}`,
      `M${ex + (side < 0 ? 6 : 2 * a - 6)} ${ey + b + 10} L${ex + (side < 0 ? -3 : 2 * a + 3)} ${ey + b + 16}`,
      `M${ex + (side < 0 ? 12 : 2 * a - 12)} ${ey + b + 14} L${ex + (side < 0 ? 6 : 2 * a - 6)} ${ey + b + 22}`,
    ].join(" ");
    return <path d={d} fill="none" stroke={C.ink} strokeWidth="3.2" strokeLinecap="round" />;
  }

  const lash = (k: number) => {
    const deg = side < 0 ? [104, 124, 144][k]! : [76, 56, 36][k]!;
    const th = (deg * Math.PI) / 180;
    const x0 = cx + a * Math.cos(th);
    const y0 = cy - b * Math.sin(th);
    const nx = Math.cos(th) / a;
    const ny = -Math.sin(th) / b;
    const n = Math.hypot(nx, ny);
    const len = k === 1 ? 11 : 9;
    return `M${x0} ${y0} L${x0 + (nx / n) * len} ${y0 + (ny / n) * len}`;
  };

  // Pupils look toward the nose and a little down, like hers.
  const pcx = cx - side * 6 + px;
  const pcy = cy + 9 + py;
  const lidY = -b + 2 * b * Math.min(1, shut);
  const lidHalf = a * Math.sqrt(Math.max(0, 1 - (lidY / b) ** 2));

  return (
    <g>
      <clipPath id={`eye-${uid}`}>
        <ellipse cx={cx} cy={cy} rx={a} ry={b} />
      </clipPath>
      <ellipse cx={cx} cy={cy} rx={a} ry={b} fill={C.cream} stroke={C.ink} strokeWidth="3" />
      <path
        d={`${lash(0)} ${lash(1)} ${lash(2)}`}
        stroke={C.ink}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <g clipPath={`url(#eye-${uid})`}>
        <ellipse cx={pcx} cy={pcy} rx="12" ry="17" fill="#1c0b03" />
        <circle cx={pcx - 4} cy={pcy - 7} r="4" fill="white" />
        <circle cx={pcx + 3.75} cy={pcy + 4.75} r="1.75" fill="white" opacity="0.85" />
      </g>
      {shut > 0.03 ? (
        <path
          d={`M${cx - lidHalf} ${cy + lidY} A${a} ${b} 0 ${lidY > 0 ? 1 : 0} 1 ${cx + lidHalf} ${cy + lidY} Q${cx} ${cy + lidY + 4} ${cx - lidHalf} ${cy + lidY}Z`}
          fill={C.orange}
          stroke={C.ink}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      ) : null}
    </g>
  );
}

function Mouth({ cx, cy, smile, open }: { cx: number; cy: number; smile: number; open: number }) {
  const w = 54 + Math.max(0, smile) * 10 - open * 8;
  const lx = cx - w / 2;
  const rx = cx + w / 2;
  const cornerY = cy - smile * 5;
  const topY = cy + smile * 1.5 - open * 4;
  const botY = topY + 2 + Math.max(0, smile) * 8 + open * 34;
  const midBot = 0.25 * cornerY + 0.75 * botY;
  const teeth = clamp((open - 0.3) / 0.3) * 7;
  const tongue = open * 13;
  const outline = `M${lx} ${cornerY} C${lx + w * 0.3} ${topY} ${rx - w * 0.3} ${topY} ${rx} ${cornerY} C${rx - w * 0.15} ${botY} ${lx + w * 0.15} ${botY} ${lx} ${cornerY}Z`;
  return (
    <g>
      <path d={outline} fill={C.mouthInside} />
      {open > 0.15 ? (
        <path
          d={`M${cx - w * 0.21} ${midBot - tongue * 0.35} Q${cx} ${midBot - tongue * 1.3} ${cx + w * 0.21} ${midBot - tongue * 0.35} Q${cx} ${midBot} ${cx - w * 0.21} ${midBot - tongue * 0.35}Z`}
          fill="#e0584a"
        />
      ) : null}
      {teeth > 0.5 ? (
        <path
          d={`M${lx + 3} ${cornerY + 0.5} C${lx + w * 0.3} ${topY} ${rx - w * 0.3} ${topY} ${rx - 3} ${cornerY + 0.5} C${rx - w * 0.3} ${topY + teeth * 1.6} ${lx + w * 0.3} ${topY + teeth * 1.6} ${lx + 3} ${cornerY + 0.5}Z`}
          fill={C.cream}
        />
      ) : null}
      <path
        d={outline}
        fill="none"
        stroke={C.ink}
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </g>
  );
}

function Glove({
  x,
  y,
  kind,
  mirror,
  angle,
}: {
  x: number;
  y: number;
  kind: Hand;
  mirror: 1 | -1;
  angle: number;
}) {
  const stroke = { stroke: C.ink, strokeWidth: 2.5, fill: C.cream };
  const fingers = kind === "open" ? [-28, -9, 10] : kind === "point" ? [-4] : [];
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(1.25)`}>
      {fingers.map((deg) => (
        <rect
          key={deg}
          transform={`rotate(${deg * mirror} 0 -15)`}
          x="-5.25"
          y={kind === "point" ? -47 : -43}
          width="10.5"
          height={kind === "point" ? 22 : 19}
          rx="5.25"
          {...stroke}
        />
      ))}
      <rect
        transform={`rotate(${(kind === "open" ? 64 : 38) * mirror} 0 -15)`}
        x="-4.75"
        y="-36"
        width="9.5"
        height="14"
        rx="4.75"
        {...stroke}
      />
      <circle cx="0" cy="-15.5" r="12.5" {...stroke} />
      {kind !== "open"
        ? [0, 1, 2].map((i) => (
            <rect
              key={i}
              x={-6 + i * 5}
              y="-22"
              width="1.8"
              height="8"
              rx="0.9"
              fill={C.ink}
              opacity="0.6"
            />
          ))
        : null}
      <rect x="-11" y="-6" width="22" height="9" rx="3.5" {...stroke} />
      <rect x="-7" y="-2" width="14" height="1.6" fill={C.ink} opacity="0.5" />
    </g>
  );
}
