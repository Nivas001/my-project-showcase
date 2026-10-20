import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import tl from "../timeline.json";
import { K, mono, sans } from "../theme";
import { inOut, inQuint, mix, prog } from "../../ease";
import { CATEGORIES, INDEX, INDEX_LIFT } from "../data";
import { Kicker, Paper } from "../ui";

const I = tl.index;
const CW = 400;
const CH = 250;

/** A card's place on the diagonal conveyor, `t` cards from the front. */
const slot = (t: number) => ({
  x: -520 + t * 132,
  y: 330 - t * 88,
  z: -t * 70,
  ry: -38,
});

export const Index = () => {
  const f = useCurrentFrame();
  const scroll = f * 0.016 - 1.2;
  const enter = prog(f, 0, 70);
  const lift = prog(f, I.lift, 56, inOut);
  const dive = prog(f, I.dive, 60, inQuint);
  const liftCard = INDEX[INDEX_LIFT]!;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Paper tint={K.paperCool} />

      {/* the stack */}
      <AbsoluteFill style={{ perspective: 2000, perspectiveOrigin: "50% 45%" }}>
        <div
          style={{
            position: "absolute",
            left: 960,
            top: 540,
            transformStyle: "preserve-3d",
            transform: `translateX(${mix(400, 140, enter)}px) translateY(${mix(200, 0, enter)}px)`,
          }}
        >
          {INDEX.map((c, i) => {
            const isLift = i === INDEX_LIFT;
            const t = i - scroll;
            const s = slot(t);
            const fade = Math.min(1, Math.max(0, (t + 2.2) / 1.2)) * Math.min(1, Math.max(0, (16 - t) / 2));
            const k = isLift ? lift : 0;
            const x = mix(s.x, -140, k);
            const y = mix(s.y, -70, k);
            const z = mix(s.z, 420, k) + (isLift ? dive * 1300 : 0);
            const ry = mix(s.ry, 0, k);
            const gone = isLift ? 1 : 1 - lift * 0.9 - dive;
            return (
              <div
                key={c.src + i}
                style={{
                  position: "absolute",
                  left: -CW / 2,
                  top: -CH / 2,
                  width: CW,
                  height: CH,
                  transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg)`,
                  opacity: fade * Math.max(0, gone) * (isLift ? 1 - prog(f, I.dive + 34, 20) : 1),
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "#fff",
                  boxShadow: "0 0 0 1px rgba(23,22,15,0.12), 18px 24px 40px -18px rgba(40,30,10,0.45)",
                }}
              >
                <Img src={staticFile(c.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* caption under the lifted card */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 690,
          textAlign: "center",
          opacity: prog(f, I.lift + 30, 24) * (1 - prog(f, I.dive, 16)),
          transform: `translateX(${0}px)`,
        }}
      >
        <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 34, color: K.ink, letterSpacing: -0.5 }}>{liftCard.name}</div>
        <div style={{ fontFamily: mono, fontSize: 17, color: K.ink2, marginTop: 8, letterSpacing: 1 }}>( {liftCard.tags} )</div>
      </div>

      {/* category index, top left */}
      <div style={{ position: "absolute", left: 92, top: 96 }}>
        {CATEGORIES.map((c, i) => {
          const p = prog(f, I.list + i * I.listStep, 26);
          return (
            <div
              key={c.k}
              style={{
                fontFamily: sans,
                fontWeight: 500,
                fontSize: 40,
                lineHeight: 1.26,
                letterSpacing: -0.8,
                color: K.ink,
                opacity: p * (1 - dive),
                transform: `translateY(${mix(18, 0, p)}px)`,
              }}
            >
              {c.k}
              <sup style={{ fontFamily: mono, fontSize: 17, color: K.blue, marginLeft: 4, verticalAlign: "0.9em" }}>{c.n}</sup>
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", right: 92, top: 104, textAlign: "right", opacity: prog(f, 30, 30) * (1 - dive) }}>
        <Kicker>Index · 2025 — 2026</Kicker>
        <div style={{ fontFamily: mono, fontSize: 17, color: K.dim, marginTop: 10 }}>everything here was built solo</div>
      </div>

      {/* bottom-right marks, after the reference */}
      <div style={{ position: "absolute", right: 92, bottom: 80, display: "flex", gap: 10, alignItems: "center", opacity: (1 - dive) * prog(f, 40, 30) }}>
        <span style={{ width: 30, height: 30, borderRadius: 30, border: `2.5px solid ${K.ink}` }} />
        <svg width="34" height="34" viewBox="-17 -17 34 34" style={{ transform: `rotate(${f * 0.8}deg)` }}>
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={-2} y={-16} width={4} height={14} rx={2} fill={K.orange} transform={`rotate(${i * 30})`} />
          ))}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
