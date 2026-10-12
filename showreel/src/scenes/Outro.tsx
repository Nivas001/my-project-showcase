import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { hero, mono } from "../fonts";
import { prog, mix, inOut } from "../ease";
import { MaskLetters, Rise } from "../components/Reveal";
import { DotGrid, HandNote, Squiggle } from "../components/Bits";

export const O = { title: 0, links: 70, linkStep: 10, note: 130, fade: 440 };

export const Outro = () => {
  const f = useCurrentFrame();
  const kick = interpolate(f, [0, 3, 30], [1.7, 1.4, 1], { extrapolateRight: "clamp" });
  const fade = prog(f, O.fade, 90, inOut);
  const push = interpolate(f, [0, 540], [1, 1.05]);
  const links = [
    { k: "web", v: "nivas.tech", big: true },
    { k: "mail", v: "nivassri183@gmail.com" },
    { k: "code", v: "github.com/Nivas001" },
  ];
  return (
    <AbsoluteFill style={{ background: C.bg, filter: `brightness(${kick})` }}>
      <DotGrid opacity={0.3 * (1 - fade)} shift={-f * 0.2} />
      <AbsoluteFill style={{ padding: "0 130px", justifyContent: "center", transform: `scale(${push})`, transformOrigin: "20% 50%" }}>
        <div style={{ opacity: 1 - fade }}>
          <MaskLetters
            text="Let’s build yours."
            at={O.title}
            stagger={2}
            dur={44}
            style={{ fontFamily: hero, fontWeight: 800, fontSize: 190, letterSpacing: -7, color: C.ink, lineHeight: 1 }}
          />
          <div style={{ marginLeft: 830, marginTop: -4 }}>
            <Squiggle at={44} width={400} color={C.red} dur={30} />
          </div>
        </div>
        <div style={{ marginTop: 70, display: "flex", flexDirection: "column", gap: 14 }}>
          {links.map((l, i) => (
            <Rise key={l.k} at={O.links + i * O.linkStep} dist={16}>
              <div
                style={{
                  display: "flex",
                  gap: 30,
                  alignItems: "baseline",
                  fontFamily: mono,
                  opacity: l.big ? 1 : 1 - fade,
                }}
              >
                <span style={{ width: 90, fontSize: 20, color: C.dim, letterSpacing: 3, textTransform: "uppercase", opacity: 1 - fade }}>{l.k}</span>
                <span style={{ fontSize: l.big ? 56 : 34, color: l.big ? C.red : C.ink, fontWeight: l.big ? 700 : 400 }}>{l.v}</span>
              </div>
            </Rise>
          ))}
        </div>
        <div style={{ position: "absolute", right: 170, bottom: 190, opacity: 1 - fade }}>
          <HandNote at={O.note} rotate={-5} size={58}>
            replies within a day ✓
          </HandNote>
          <div style={{ fontFamily: mono, fontSize: 19, color: C.dim, marginTop: 12, textAlign: "right", opacity: prog(f, O.note + 20, 30) }}>
            open to full-stack &amp; Python roles
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "black", opacity: interpolate(f, [500, 540], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};
