import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import tl from "../timeline.json";
import { K, grotesk, lift, mono, sans, serif } from "../theme";
import { inOut, inQuint, mix, prog } from "../../ease";
import { MaskLetters, MaskLine, Rise } from "../../components/Reveal";
import { Guides, Kicker, Marker, Paper, PixelPrompt, Sticker, StripeWipe, useSlap } from "../ui";

const T = tl.title;

export const Title = () => {
  const f = useCurrentFrame();
  const exit = prog(f, T.exit, 44, inQuint);
  const drift = interpolate(f, [0, 600], [0, -26]);
  const slap = useSlap(T.portrait, 14, 170);
  const guidesFade = 1 - prog(f, 300, 80);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Paper dots={0.35} shift={drift * 0.4} />
      <Guides
        opacity={guidesFade * (1 - exit)}
        lines={[
          { y: 238, from: 60, to: 1860, at: T.lines, label: "cap · 22%" },
          { y: 486, from: 60, to: 1860, at: T.lines + 6, label: "base · 45%" },
          { y: 760, from: 60, to: 1860, at: T.lines + 12, label: "70%" },
          { x: 130, from: 40, to: 1040, at: T.lines + 4, label: "x · 7%" },
          { x: 1130, from: 40, to: 1040, at: T.lines + 10, label: "59%" },
        ]}
      />

      <AbsoluteFill style={{ transform: `translateY(${mix(0, -180, exit) + drift}px)`, opacity: 1 - exit }}>
        {/* portrait as a die-cut sticker */}
        <div
          style={{
            position: "absolute",
            left: 1196,
            top: 150,
            width: 600,
            padding: 14,
            borderRadius: 34,
            background: "#fff",
            boxShadow: lift(mix(5, 1.2, Math.min(slap, 1))),
            opacity: f >= T.portrait ? 1 : 0,
            transform: `rotate(${mix(-12, 3.5, slap)}deg) scale(${mix(1.4, 1, slap)})`,
          }}
        >
          <div style={{ borderRadius: 22, overflow: "hidden", background: K.blue }}>
            <Img src={staticFile("media/portrait.png")} style={{ width: "100%", display: "block" }} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 1150, top: 610 }}>
          <Sticker at={T.stickers[0]!} rotate={-8} size={34}>
            ships it ✓
          </Sticker>
        </div>
        <div style={{ position: "absolute", left: 1620, top: 108 }}>
          <Sticker at={T.stickers[1]!} rotate={7} bg={K.sticky.yellow} fg={K.ink} font={mono} weight={500} size={22} radius={10} pad="10px 18px">
            Pondicherry · 11.93°N
          </Sticker>
        </div>
        <div style={{ position: "absolute", left: 1530, top: 640 }}>
          <Sticker at={T.stickers[2]!} rotate={-3} bg={K.sticky.pink} fg={K.ink} size={28}>
            web · mobile · NLP
          </Sticker>
        </div>

        <div style={{ position: "absolute", left: 130, top: 140 }}>
          <Rise at={6} dist={10}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <PixelPrompt size={4} color={K.blue} />
              <Kicker color={K.ink2}>Showreel Nº 02 — 2026</Kicker>
            </div>
          </Rise>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 6 }}>
            <MaskLetters
              text="Srinivas"
              at={T.name}
              stagger={2}
              dur={46}
              style={{ fontFamily: serif, fontSize: 290, letterSpacing: -6, color: K.ink, lineHeight: 1.02 }}
            />
            <MaskLetters
              text=" M."
              at={T.name + 16}
              stagger={3}
              dur={46}
              style={{ fontFamily: serif, fontStyle: "italic", fontSize: 290, letterSpacing: -4, color: K.blue, lineHeight: 1.02 }}
            />
          </div>
          <MaskLine at={T.name + 26} dur={36}>
            <div style={{ fontFamily: grotesk, fontWeight: 800, fontSize: 78, letterSpacing: -2.6, color: K.ink, lineHeight: 1 }}>
              Full-stack engineer.
            </div>
          </MaskLine>
          <Rise at={T.name + 44} dist={10}>
            <div style={{ fontFamily: mono, fontSize: 23, color: K.ink2, marginTop: 22, letterSpacing: 0.5 }}>
              Web <span style={{ color: K.dim }}>·</span> Mobile <span style={{ color: K.dim }}>·</span> Applied NLP{" "}
              <span style={{ color: K.dim }}>—</span> builds it, then ships it
            </div>
          </Rise>
          <div style={{ marginTop: 92, fontFamily: sans, fontWeight: 500, fontSize: 48, lineHeight: 1.24, color: K.ink, letterSpacing: -0.9 }}>
            <MaskLine at={T.tagline}>I build production software end to end —</MaskLine>
            <MaskLine at={T.tagline + 12}>
              <span>
                and I <Marker at={T.marker}>ship it.</Marker>
              </span>
            </MaskLine>
          </div>
        </div>
      </AbsoluteFill>

      <StripeWipe at={T.wipe} dir="out" dur={58} />
      {/* the next sheet is coming: a quick paper flash between scenes */}
      <AbsoluteFill style={{ background: K.paper, opacity: prog(f, T.exit + 24, 20, inOut) }} />
    </AbsoluteFill>
  );
};
