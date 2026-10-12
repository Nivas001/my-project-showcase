import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { display, mono } from "../fonts";
import { prog, mix, inQuint } from "../ease";
import { Label } from "../components/Bits";

// Lands one per 8th note (15 frames @ 120bpm).
export const STACK = [
  "TypeScript", "React 19", "TanStack Start", "Next.js", "Node.js", "Flutter", "Dart",
  "PostgreSQL", "Supabase", "Prisma", "Python", "TensorFlow", "Cloudflare", "Vercel",
];
export const S = { first: 0, step: 15, stats: 236, statStep: 10, exit: 392 };

const STATS = [
  { v: 5, d: 0, suf: "", label: "Products live", c: C.red },
  { v: 8.79, d: 2, suf: "", label: "GPA / 10", c: C.blueSoft },
  { v: 4, d: 0, suf: "+", label: "Years building", c: C.yellow },
  { v: 12, d: 0, suf: "+", label: "Tech in prod", c: C.green },
];

export const Stack = () => {
  const f = useCurrentFrame();
  const exit = prog(f, S.exit, 28, inQuint);
  const statsP = prog(f, S.stats - 20, 40);
  const lit = Math.floor((f - S.first) / S.step);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ padding: "0 130px", justifyContent: "center", opacity: 1 - exit, filter: `blur(${exit * 12}px)` }}>
        <div style={{ transform: `translateY(${mix(0, -120, statsP)}px)` }}>
          <Label>The stack, in production</Label>
          <div style={{ display: "flex", flexWrap: "wrap", columnGap: 44, rowGap: 6, marginTop: 30, maxWidth: 1620 }}>
            {STACK.map((s, i) => {
              const at = S.first + i * S.step;
              const p = prog(f, at, 18);
              const current = i === lit && f < S.stats - 10;
              return (
                <span
                  key={s}
                  style={{
                    fontFamily: display,
                    fontWeight: 800,
                    fontSize: 104,
                    letterSpacing: -3.5,
                    lineHeight: 1.08,
                    color: current ? C.ink : i < lit ? "oklch(0.44 0 0)" : "oklch(0.2 0 0)",
                    opacity: p,
                    transform: `translateY(${mix(40, 0, p)}px)`,
                  }}
                >
                  {s}
                  {current && <span style={{ color: C.red }}>.</span>}
                </span>
              );
            })}
          </div>
        </div>
        <div style={{ position: "absolute", left: 130, right: 130, bottom: 120, display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {STATS.map((s, i) => {
            const at = S.stats + i * S.statStep;
            const p = prog(f, at, 26);
            const n = interpolate(f, [at, at + 50], [0, s.v], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });
            return (
              <div key={s.label} style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: 24, opacity: p, transform: `translateY(${mix(30, 0, p)}px)` }}>
                <div style={{ fontFamily: display, fontWeight: 800, fontSize: 96, color: C.ink, letterSpacing: -3, fontVariantNumeric: "tabular-nums" }}>
                  {n.toFixed(s.d)}
                  {s.suf}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: mono, fontSize: 19, letterSpacing: 3, color: C.muted, textTransform: "uppercase" }}>
                  <span style={{ width: 30, height: 4, borderRadius: 4, background: s.c }} />
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
