import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import type { Project } from "../projects";
import { C } from "../theme";
import { hero, mono, sans } from "../fonts";
import { prog, mix, inOut, inQuint } from "../ease";
import { Browser } from "../components/Browser";
import { Chip, DotGrid, HandNote, Label } from "../components/Bits";
import { MaskLine, Rise } from "../components/Reveal";

/** Local frame offsets inside one project's 420-frame slot (+30 overlap). */
export const P = {
  enter: 0,
  name: 18,
  chips: 64,
  chipStep: 6,
  float: 96,
  note: 150,
  exit: 412,
  len: 450,
};

const BW = 1060;
const VIEW_H = 640;

export const ProjectScene = ({ p, index, total }: { p: Project; index: number; total: number }) => {
  const f = useCurrentFrame();

  // Enter: swing in from the right. Exit: whip off to the left.
  const inP = prog(f, P.enter, 46);
  const outP = prog(f, P.exit, 38, inQuint);
  const whip = mix(1500, 0, inP) + mix(0, -1900, outP);
  const blurIn = (1 - inP) * 14 + outP * 18;

  // Browser camera: rotateY settles, then drifts while the page scrolls.
  const rotY = mix(-28, -9, inP) + interpolate(f, [40, 420], [0, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rotX = mix(6, 3, inP);
  const scale = interpolate(f, [0, 420], [0.98, 1.05]);

  const imgH = p.page.h * (BW / 1200);
  const maxScroll = Math.max(0, imgH - VIEW_H);
  const scrollTo = Math.min(maxScroll, 2100);
  const scroll = interpolate(f, [60, 400], [0, scrollTo], { easing: inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const floatP = prog(f, P.float, 54);
  const floatW = 520;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 70% at 72% 50%, color-mix(in oklab, ${p.accent} 16%, transparent), transparent 70%)`,
          opacity: inP * (1 - outP),
        }}
      />
      <DotGrid opacity={0.28} shift={-f * 0.25} />

      {/* Copy column */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 0,
          bottom: 0,
          width: 640,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transform: `translateX(${mix(0, -900, outP)}px)`,
          filter: `blur(${outP * 12}px)`,
          opacity: 1 - outP,
        }}
      >
        <Rise at={P.name - 8} dist={10}>
          <Label>
            <span style={{ color: p.accent }}>0{index + 1}</span>
            <span style={{ color: C.dim }}> / 0{total}</span>
            <span style={{ color: C.dim }}>{"   ·   "}</span>
            {p.kind}
          </Label>
        </Rise>
        <MaskLine at={P.name} dur={40} style={{ marginTop: 22 }}>
          <div
            style={{
              fontFamily: hero,
              fontWeight: 800,
              fontSize: p.name.length > 14 ? 92 : 118,
              letterSpacing: -4,
              lineHeight: 0.98,
              color: C.ink,
            }}
          >
            {p.name}
          </div>
        </MaskLine>
        <Rise at={P.name + 18} dist={10}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 22, fontFamily: mono, fontSize: 20, color: C.muted }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 9, color: C.green }}>
              <span style={{ width: 9, height: 9, borderRadius: 9, background: C.green, boxShadow: `0 0 0 ${2 + 3 * Math.abs(Math.sin(f / 18))}px color-mix(in oklab, ${C.green} 25%, transparent)` }} />
              Live
            </span>
            <span style={{ color: C.dim }}>·</span>
            {p.year}
            <span style={{ color: C.dim }}>·</span>
            <span>{p.url}</span>
          </div>
        </Rise>
        <Rise at={P.name + 28} dist={14}>
          <div style={{ fontFamily: sans, fontSize: 32, lineHeight: 1.38, color: "oklch(0.86 0 0)", marginTop: 34, letterSpacing: -0.2 }}>
            {p.line}
          </div>
        </Rise>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 38 }}>
          {p.stack.map((s, i) => (
            <Chip key={s} at={P.chips + i * P.chipStep} accent={p.accent}>
              {s}
            </Chip>
          ))}
        </div>
      </div>

      {/* Browser + floating screen, in 3D */}
      <div
        style={{
          position: "absolute",
          left: 790,
          top: 0,
          bottom: 0,
          width: 1200,
          display: "flex",
          alignItems: "center",
          perspective: 2200,
          transform: `translateX(${whip}px)`,
          filter: `blur(${blurIn}px)`,
        }}
      >
        <div
          style={{
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`,
            transformOrigin: "0% 50%",
          }}
        >
          <Browser url={p.url} width={BW}>
            <div style={{ height: VIEW_H, overflow: "hidden" }}>
              <Img
                src={staticFile(p.page.src)}
                style={{ width: BW, display: "block", transform: `translateY(${-scroll}px)` }}
              />
            </div>
            {/* glass reflection sweeping across */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(105deg, transparent 35%, oklch(1 0 0 / 7%) 45%, transparent 55%)",
                transform: `translateX(${interpolate(f, [30, 330], [-110, 110])}%)`,
              }}
            />
          </Browser>

          <div
            style={{
              position: "absolute",
              left: 330,
              bottom: -120,
              width: floatW,
              borderRadius: 14,
              overflow: "hidden",
              border: `1px solid ${C.hairline}`,
              boxShadow: "0 50px 90px -24px oklch(0 0 0 / 80%), 0 0 0 1px oklch(0 0 0 / 40%)",
              opacity: floatP,
              transform: `translateZ(${mix(0, 160, floatP)}px) translateY(${mix(140, 0, floatP) + interpolate(f, [100, 420], [0, -30])}px) rotateZ(${mix(-5, -1.5, floatP)}deg)`,
            }}
          >
            <Img src={staticFile(p.float.src)} style={{ width: floatW, height: floatW / p.float.ratio, display: "block", objectFit: "cover" }} />
          </div>

          <div style={{ position: "absolute", left: 40, top: -92, transform: "translateZ(80px)" }}>
            <HandNote at={P.note} color={p.accent} rotate={-4} size={50}>
              ↓ {p.note}
            </HandNote>
          </div>
        </div>
      </div>

      {/* wipe line on exit, in the project's colour */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 6,
          left: `${mix(105, -5, prog(f, P.exit + 6, 30, inOut))}%`,
          background: p.accent,
          opacity: f > P.exit ? 0.9 : 0,
          boxShadow: `0 0 60px 10px color-mix(in oklab, ${p.accent} 45%, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};
