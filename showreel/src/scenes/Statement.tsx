import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { display, mono } from "../fonts";
import { prog, mix, inQuint } from "../ease";
import { MaskLine } from "../components/Reveal";
import { HandNote } from "../components/Bits";
import { PROJECTS } from "../projects";

// Beats at 120bpm = every 30 frames. Lines land on beats 0, 1, 2.
export const STATEMENT_BEATS = [0, 30, 60];
export const LIST_AT = 150;
export const LIST_STEP = 12;
export const STATEMENT_EXIT = 262;

export const Statement = () => {
  const f = useCurrentFrame();
  const up = prog(f, 132, 40);
  const exit = prog(f, STATEMENT_EXIT, 38, inQuint);
  const big = { fontFamily: display, fontWeight: 800, fontSize: 164, letterSpacing: -3.5, lineHeight: 0.98 } as const;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          padding: "0 130px",
          justifyContent: "center",
          transform: `translateX(${mix(0, -1500, exit)}px)`,
          filter: `blur(${exit * 14}px)`,
        }}
      >
        <div style={{ transform: `translateY(${mix(0, -150, up)}px) scale(${mix(1, 0.62, up)})`, transformOrigin: "0% 50%" }}>
          <MaskLine at={STATEMENT_BEATS[0]} dur={28}>
            <div style={{ ...big, color: C.ink }}>Five products.</div>
          </MaskLine>
          <MaskLine at={STATEMENT_BEATS[1]} dur={28}>
            <div style={{ ...big, color: C.muted }}>Live right now.</div>
          </MaskLine>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 40 }}>
            <MaskLine at={STATEMENT_BEATS[2]} dur={28}>
              <div style={{ ...big, color: C.red }}>Built alone.</div>
            </MaskLine>
            <HandNote at={84} rotate={-6} size={62} style={{ marginBottom: 26 }}>
              schema → server → UI → deploy
            </HandNote>
          </div>
        </div>
        <div style={{ position: "absolute", left: 130, right: 130, bottom: 150, display: "flex", gap: 0 }}>
          {PROJECTS.map((p, i) => {
            const q = prog(f, LIST_AT + i * LIST_STEP, 26);
            return (
              <div
                key={p.slug}
                style={{
                  flex: 1,
                  borderTop: `1px solid ${C.hairline}`,
                  paddingTop: 20,
                  opacity: q,
                  transform: `translateY(${mix(30, 0, q)}px)`,
                }}
              >
                <div style={{ fontFamily: mono, fontSize: 18, color: p.accent, letterSpacing: 2 }}>0{i + 1}</div>
                <div style={{ fontFamily: display, fontWeight: 600, fontSize: 32, color: C.ink, marginTop: 8, letterSpacing: -0.5 }}>
                  {p.name}
                </div>
                <div style={{ fontFamily: mono, fontSize: 18, color: C.muted, marginTop: 6 }}>{p.kind}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
