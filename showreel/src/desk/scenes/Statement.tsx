import { AbsoluteFill, useCurrentFrame } from "remotion";
import tl from "../timeline.json";
import { K, grotesk, serif } from "../theme";
import { inQuint, mix, prog } from "../../ease";
import { MaskLine } from "../../components/Reveal";
import { Folder, Paper, Sticky } from "../ui";
import { LIVE } from "../data";

const St = tl.statement;

export const Statement = () => {
  const f = useCurrentFrame();
  const exit = prog(f, St.exit, 40, inQuint);
  const big = { fontFamily: grotesk, fontWeight: 800, fontSize: 176, letterSpacing: -7, lineHeight: 0.96 } as const;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Paper dots={0.3} shift={-f * 0.2} />
      <AbsoluteFill
        style={{
          padding: "0 130px",
          justifyContent: "center",
          transform: `translateX(${mix(0, -260, exit)}px)`,
          opacity: 1 - exit,
        }}
      >
        <div style={{ marginTop: -150 }}>
          <MaskLine at={St.beats[0]!} dur={26}>
            <div style={{ ...big, color: K.ink }}>Six products,</div>
          </MaskLine>
          <MaskLine at={St.beats[1]!} dur={26}>
            <div style={{ ...big, color: K.ink }}>
              <span style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 400, fontSize: 200, letterSpacing: -4, color: K.blue }}>live </span>
              right now.
            </div>
          </MaskLine>
          <div style={{ display: "flex", alignItems: "center", gap: 46 }}>
            <MaskLine at={St.beats[2]!} dur={26}>
              <div style={{ ...big, color: K.red }}>Built alone.</div>
            </MaskLine>
            <Sticky at={St.note} rotate={-5} w={330} hgt={150} size={40} color={K.sticky.yellow}>
              schema → server → UI → deploy
            </Sticky>
          </div>
        </div>
      </AbsoluteFill>

      {/* the six live builds, as folders on the desktop */}
      <div style={{ position: "absolute", left: 110, right: 110, bottom: 70, display: "flex", justifyContent: "space-between" }}>
        {LIVE.map((p, i) => {
          const at = 140 + i * 9;
          const q = prog(f, at, 26);
          const out = prog(f, St.exit - 10 + i * 4, 34, inQuint);
          return (
            <div
              key={p.slug}
              style={{
                opacity: q * (1 - out),
                transform: `translateY(${mix(40, 0, q) + mix(0, 120, out)}px) scale(${mix(0.8, 1, q)})`,
              }}
            >
              <Folder color={p.tint2} label={p.short} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
