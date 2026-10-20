import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import tl from "../timeline.json";
import { K, grotesk, mono, vt } from "../theme";
import { inOut, inQuint, mix, outExpo, prog } from "../../ease";
import { MAC, RetroMac, SCREEN_C } from "../RetroMac";
import { Guides, Paper, PixelPrompt, Sticky } from "../ui";

const O = tl.outro;
const G = K.phosphor;
const GD = "rgba(82, 240, 106, 0.55)";
const HEAD = "Let’s build yours.";
const LINKS = ["nivas.tech", "nivassri183@gmail.com", "github.com/Nivas001"];

const Screen = ({ f }: { f: number }) => {
  const n = Math.max(0, Math.min(HEAD.length, Math.floor((f - O.type) / 2.2)));
  const blink = Math.floor(f / 30) % 2 === 0;
  // power-off: squash to a line, then to a dot
  const sq = prog(f, O.off, 12, inQuint);
  const dot = prog(f, O.off + 12, 14, inQuint);
  const glow = prog(f, O.off, 6) * (1 - prog(f, O.off + 24, 20));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "50px 34px",
          fontFamily: vt,
          color: G,
          textShadow: `0 0 8px ${GD}, 0 0 1px ${G}`,
          transform: `scaleY(${mix(1, 0.006, sq)}) scaleX(${mix(1, 0.01, dot)})`,
          filter: `brightness(${1 + sq * 3})`,
          background: sq > 0 ? `rgba(220,255,225,${sq})` : "transparent",
        }}
      >
        <div style={{ fontSize: 50, lineHeight: 1 }}>
          {HEAD.slice(0, n)}
          {f < O.links && <span style={{ display: "inline-block", width: "0.45em", height: "0.85em", background: blink || n < HEAD.length ? G : "transparent", transform: "translateY(0.1em)" }} />}
        </div>
        <div style={{ marginTop: 34, fontSize: 28, lineHeight: 1.35 }}>
          {LINKS.map((l, i) =>
            f >= O.links + i * O.linkStep ? (
              <div key={l} style={{ color: i === 0 ? "#DFFFE4" : G }}>
                <span style={{ color: GD }}>&gt; </span>
                {l}
              </div>
            ) : null,
          )}
          {f >= O.links + 3 * O.linkStep && (
            <div>
              <span style={{ color: GD }}>&gt; </span>
              <span style={{ display: "inline-block", width: "0.45em", height: "0.85em", background: blink ? G : "transparent", transform: "translateY(0.1em)" }} />
            </div>
          )}
        </div>
      </div>
      <div style={{ width: 10, height: 10, borderRadius: 10, background: "#EFFFF1", boxShadow: "0 0 24px 8px rgba(200,255,210,0.8)", opacity: glow * dot }} />
    </AbsoluteFill>
  );
};

export const Outro = () => {
  const f = useCurrentFrame();

  // Reverse of the opening plunge: out of the tube, back to the desk.
  const pull = prog(f, O.pull, 140, outExpo);
  const s = mix(7.2, 1.04, pull) * interpolate(f, [140, O.card], [1, 1.04], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const c = mix(1, 0, pull);
  const left = 960 - MAC.W / 2;
  const top = 96;
  const tx = (960 - (left + SCREEN_C.x)) * c;
  const ty = (540 - (top + SCREEN_C.y)) * c;
  const blue = 1 - prog(f, 6, 34, inOut);
  const macOut = prog(f, O.card - 30, 40, inOut);
  const card = prog(f, O.card, 50);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Paper />
      <AbsoluteFill style={{ opacity: 1 - macOut, transform: `scale(${mix(1, 0.94, macOut)})` }}>
        <div
          style={{
            position: "absolute",
            left,
            top,
            width: MAC.W,
            height: MAC.H,
            transformOrigin: `${SCREEN_C.x}px ${SCREEN_C.y}px`,
            transform: `translate(${tx}px, ${ty}px) scale(${s})`,
          }}
        >
          <RetroMac
            led={f < O.off + 20 ? 1 : 0}
            screen={
              <>
                <Screen f={f} />
                <AbsoluteFill style={{ background: K.blue, opacity: blue }} />
              </>
            }
          >
            <Sticky at={-40} color={K.sticky.pink} rotate={-9} w={118} size={23} style={{ position: "absolute", left: 82, top: 424 }}>
              fix the 404
            </Sticky>
            <Sticky at={-40} color={K.sticky.blue} rotate={5} w={118} size={23} style={{ position: "absolute", left: 186, top: 402 }}>
              write tests
            </Sticky>
            <Sticky at={-40} color={K.sticky.mint} rotate={-4} w={128} size={23} style={{ position: "absolute", left: 398, top: 418 }}>
              review PR #12
            </Sticky>
            <Sticky at={-40} color={K.sticky.yellow} rotate={8} w={120} size={25} style={{ position: "absolute", left: 532, top: 346 }}>
              <s>ship v1.0!</s> shipped
            </Sticky>
          </RetroMac>
        </div>
        <div style={{ position: "absolute", left: 210, top: 330 }}>
          <Sticky at={O.notes[0]!} color={K.sticky.yellow} rotate={-6} w={300} hgt={190} size={44}>
            replies within a day ✓
          </Sticky>
        </div>
        <div style={{ position: "absolute", left: 1420, top: 380 }}>
          <Sticky at={O.notes[1]!} color={K.sticky.mint} rotate={5} w={310} hgt={190} size={40}>
            open to full-stack &amp; Python roles
          </Sticky>
        </div>
      </AbsoluteFill>

      {/* end card: the wordmark, on its construction grid */}
      <AbsoluteFill style={{ opacity: card }}>
        <Guides
          lines={[
            { y: 430, from: 360, to: 1560, at: O.card + 4, label: "16%" },
            { y: 650, from: 360, to: 1560, at: O.card + 10, label: "16%" },
            { x: 440, from: 330, to: 750, at: O.card + 6, label: "40%" },
            { x: 1480, from: 330, to: 750, at: O.card + 12, label: "40%" },
          ]}
        />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 40, transform: `translateY(${mix(24, 0, prog(f, O.card + 14, 50))}px)` }}>
            <div style={{ width: 150, height: 150, borderRadius: 34, background: K.ink, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${mix(0.5, 1, prog(f, O.card + 10, 40))})` }}>
              <PixelPrompt size={10} color={K.phosphor} cursor={Math.floor(f / 24) % 2 === 0} />
            </div>
            <div style={{ fontFamily: grotesk, fontWeight: 800, fontSize: 168, letterSpacing: -7, color: K.ink, lineHeight: 1 }}>
              nivas<span style={{ color: K.blue }}>.</span>tech
            </div>
          </div>
          <div style={{ fontFamily: mono, fontSize: 22, color: K.ink2, marginTop: 58, letterSpacing: 2, opacity: prog(f, O.card + 40, 30) }}>
            SRINIVAS M — FULL-STACK ENGINEER — PONDICHERRY, IN
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      <AbsoluteFill style={{ background: "#0b0a08", opacity: interpolate(f, [O.black, 720], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};
