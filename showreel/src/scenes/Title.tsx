import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { hero, mono, sans } from "../fonts";
import { prog, mix, inQuint } from "../ease";
import { MaskLetters, MaskLine, Rise } from "../components/Reveal";
import { DotGrid, Label, Squiggle } from "../components/Bits";

export const Title = () => {
  const f = useCurrentFrame();
  // Exposure kick on the impact: the frame lands bright and settles.
  const kick = interpolate(f, [0, 3, 26], [1.9, 1.5, 1], { extrapolateRight: "clamp" });
  const drift = interpolate(f, [0, 330], [0, -40]);
  const portraitIn = prog(f, 6, 60);
  const exit = prog(f, 296, 34, inQuint);

  return (
    <AbsoluteFill style={{ background: C.bg, filter: `brightness(${kick})` }}>
      <DotGrid opacity={0.35 * portraitIn} shift={drift * 0.3} />
      <AbsoluteFill
        style={{
          transform: `translateY(${mix(0, -120, exit)}px)`,
          opacity: 1 - exit,
          filter: `blur(${exit * 10}px)`,
        }}
      >
        {/* Portrait, right. Already a blue duotone — sits in the noir palette as-is. */}
        <div
          style={{
            position: "absolute",
            right: 10,
            bottom: 0,
            width: 820,
            opacity: portraitIn,
            transform: `translateY(${mix(80, 0, portraitIn) + drift * 0.5}px) scale(${mix(1.08, 1, portraitIn)})`,
            transformOrigin: "50% 100%",
            WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
          }}
        >
          <Img src={staticFile("media/portrait.png")} style={{ width: "100%", display: "block" }} />
        </div>

        <div style={{ position: "absolute", left: 130, top: 210, transform: `translateY(${drift * 0.2}px)` }}>
          <Rise at={4} dist={12}>
            <Label color={C.red}>
              <span style={{ display: "inline-block", width: 44, height: 2, background: C.red, verticalAlign: "middle", marginRight: 18 }} />
              Showreel · 2026
            </Label>
          </Rise>
          <MaskLetters
            text="Srinivas M"
            at={2}
            stagger={2}
            dur={46}
            style={{ fontFamily: hero, fontWeight: 800, fontSize: 196, letterSpacing: -6, color: C.ink, lineHeight: 1, marginTop: 26 }}
          />
          <MaskLine at={34} style={{ marginTop: 22 }}>
            <div style={{ fontFamily: mono, fontSize: 28, color: C.muted, letterSpacing: 1 }}>
              Full-stack engineer <span style={{ color: C.dim }}>·</span> Web <span style={{ color: C.dim }}>·</span> Mobile{" "}
              <span style={{ color: C.dim }}>·</span> Applied NLP
            </div>
          </MaskLine>
          <Rise at={52} dist={10}>
            <div style={{ fontFamily: mono, fontSize: 21, color: C.dim, marginTop: 14, letterSpacing: 1 }}>
              Pondicherry, India — 11.93°N 79.83°E
            </div>
          </Rise>

          <div style={{ marginTop: 92, fontFamily: sans, fontWeight: 500, fontSize: 50, lineHeight: 1.22, color: C.ink, letterSpacing: -0.8 }}>
            <MaskLine at={104}>I build production software end to end —</MaskLine>
            <MaskLine at={116}>
              <span>
                and I <span style={{ color: C.red }}>ship it.</span>
              </span>
            </MaskLine>
            <div style={{ marginLeft: 170, marginTop: -6 }}>
              <Squiggle at={148} width={190} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
