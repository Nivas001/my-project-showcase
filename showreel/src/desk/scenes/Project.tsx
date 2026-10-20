import type { ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import tl from "../timeline.json";
import { K, grotesk, mono, pixel, sans, serif } from "../theme";
import { inOut, mix, prog } from "../../ease";
import { MaskLine, Rise } from "../../components/Reveal";
import type { Live } from "../data";
import { Kicker, Sticker, Sticky, Tag, Win, useSlap } from "../ui";

const P = tl.project;
const LEN = tl.projectLen;
const OV = tl.projectOverlap;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------------------------------------------------------------- media --- */

const ScrollMedia = ({ p, mirror }: { p: Live; mirror: boolean }) => {
  const f = useCurrentFrame();
  if (p.media.kind !== "scroll") return null;
  const W = 1000;
  const VH = 560;
  const imgH = p.media.page.h * (W / 1200);
  const scroll = interpolate(f, [70, LEN], [0, Math.min(imgH - VH, 2100)], { ...clamp, easing: inOut });
  const fl = useSlap(P.float, 15, 150);
  const fw = 470;
  return (
    <div style={{ position: "relative", width: W }}>
      <Win url={p.url} width={W}>
        <div style={{ height: VH, overflow: "hidden" }}>
          <Img src={staticFile(p.media.page.src)} style={{ width: W, display: "block", transform: `translateY(${-scroll}px)` }} />
        </div>
      </Win>
      <div
        style={{
          position: "absolute",
          left: mirror ? W - fw + 70 : -80,
          top: VH - 110,
          opacity: f >= P.float ? 1 : 0,
          transform: `translateY(${mix(160, 0, fl) + interpolate(f, [P.float, LEN], [0, -24], clamp)}px) rotate(${mix(mirror ? 9 : -9, mirror ? 2.5 : -2.5, fl)}deg)`,
        }}
      >
        <Win width={fw} bar={34} h={2.2}>
          <Img src={staticFile(p.media.float.src)} style={{ width: fw, height: fw / p.media.float.ratio, display: "block", objectFit: "cover" }} />
        </Win>
      </div>
    </div>
  );
};

const FanMedia = ({ p }: { p: Live }) => {
  const f = useCurrentFrame();
  if (p.media.kind !== "fan") return null;
  const fan = prog(f, 40, 64, inOut);
  const front = prog(f, 236, 60, inOut);
  const W = 720;
  const spread = [
    { r: -10, x: -230, y: 30 },
    { r: -1, x: 0, y: -26 },
    { r: 8, x: 240, y: 40 },
  ];
  return (
    <div style={{ position: "relative", width: 1000, height: 620 }}>
      {p.media.shots.map((src, j) => {
        const s = spread[j]!;
        const isFront = j === 2;
        const k = isFront ? front : 0;
        const enter = prog(f, 16 + j * 8, 40);
        return (
          <div
            key={src}
            style={{
              position: "absolute",
              left: 140,
              top: 90,
              opacity: enter,
              transform: `translate(${mix(s.x * fan, -40, k)}px, ${mix(s.y * fan + mix(80, 0, enter), -10, k)}px) rotate(${mix(s.r * fan, 0, k)}deg) scale(${mix(1, 1.18, k)})`,
            }}
          >
            <Win url={j === 2 ? "vaaram.ca/editions/latest" : j === 0 ? "vaaram.ca/archives" : "vaaram.ca"} width={W} bar={38}>
              <Img src={staticFile(src)} style={{ width: W, height: W / 1.6, display: "block", objectFit: "cover", objectPosition: "top" }} />
            </Win>
          </div>
        );
      })}
    </div>
  );
};

const GridMedia = ({ p }: { p: Live }) => {
  const f = useCurrentFrame();
  if (p.media.kind !== "grid") return null;
  const W = 492;
  const gap = 28;
  const H = W / 1.6 + 32;
  const urls = ["anibakes.app", "anibakes.app/shop/…", "anibakes.app/checkout", "anibakes.app/admin"];
  return (
    <div style={{ position: "relative", width: W * 2 + gap, height: H * 2 + gap }}>
      {p.media.shots.map((src, j) => (
        <GridCell key={src} at={26 + j * 12} x={(j % 2) * (W + gap)} y={Math.floor(j / 2) * (H + gap)} r={[-2, 1.5, 1, -1.5][j]!}>
          <Win url={urls[j]} width={W} bar={32}>
            <Img src={staticFile(src)} style={{ width: W, height: W / 1.6, display: "block", objectFit: "cover", objectPosition: "top" }} />
          </Win>
        </GridCell>
      ))}
    </div>
  );
};

const GridCell = ({ at, x, y, r, children }: { at: number; x: number; y: number; r: number; children: ReactNode }) => {
  const f = useCurrentFrame();
  const s = useSlap(at, 14, 180);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: f >= at ? 1 : 0,
        transform: `scale(${mix(0.6, 1, s)}) rotate(${mix(r * 4, r, s)}deg) translateY(${interpolate(f, [at, LEN], [0, -10 * Math.sign(r)], clamp)}px)`,
      }}
    >
      {children}
    </div>
  );
};

const FlipMedia = ({ p }: { p: Live }) => {
  const f = useCurrentFrame();
  if (p.media.kind !== "flip") return null;
  const W = 1000;
  const VH = 625;
  const shots = p.media.shots;
  const t0 = 50;
  const step = 84;
  const idx = Math.min(shots.length - 1, Math.max(0, Math.floor((f - t0) / step)));
  // the month counter rolls between shots
  const mPrev = shots[Math.max(0, idx - 1)]!.month;
  const mNow = shots[idx]!.month;
  const roll = prog(f, t0 + idx * step - 4, 30);
  const month = Math.round(idx === 0 ? mNow : mix(mPrev, mNow, roll));
  return (
    <div style={{ position: "relative", width: W }}>
      <Win url={p.url + "/build"} width={W}>
        <div style={{ height: VH, position: "relative", overflow: "hidden", background: "#111" }}>
          {shots.map((s, j) => {
            const a = t0 + j * step;
            const o = j === 0 ? 1 : prog(f, a - 8, 16);
            const z = interpolate(f, [a - 10, a + step + 20], [1.0, 1.07], clamp);
            return (
              <Img
                key={s.src}
                src={staticFile(s.src)}
                style={{ position: "absolute", inset: 0, width: W, height: VH, objectFit: "cover", opacity: o, transform: `scale(${z})` }}
              />
            );
          })}
        </div>
      </Win>
      {/* month counter, like the site's own build HUD */}
      <div
        style={{
          position: "absolute",
          left: -40,
          bottom: -54,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "14px 22px",
          background: "#fff",
          border: `3px solid ${K.ink}`,
          boxShadow: `6px 6px 0 ${K.ink}`,
          transform: "rotate(-2deg)",
          opacity: prog(f, t0, 20),
        }}
      >
        <div style={{ fontFamily: pixel, fontSize: 15, color: K.ink2, lineHeight: 1.1 }}>
          MONTH
          <br />
          OF 24
        </div>
        <div style={{ fontFamily: grotesk, fontWeight: 900, fontSize: 64, color: K.ink, lineHeight: 0.9, fontVariantNumeric: "tabular-nums" }}>
          {String(month).padStart(2, "0")}
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i} style={{ width: 8, height: 26, background: i < month ? "#F2C230" : "rgba(23,22,15,0.12)", border: `1.5px solid ${K.ink}` }} />
          ))}
        </div>
        <div style={{ fontFamily: mono, fontSize: 18, color: K.ink, marginLeft: 6, minWidth: 120 }}>{shots[idx]!.label}</div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- scene --- */

export const Project = ({ p, index, total }: { p: Live; index: number; total: number }) => {
  const f = useCurrentFrame();
  const mirror = index % 2 === 1;
  const sheet = prog(f, 0, OV, inOut);
  const leave = prog(f, LEN, OV, inOut);
  const tilt = (mirror ? 1 : -1) * (mix(16, 7, prog(f, 0, 90)) + interpolate(f, [90, LEN], [0, 3], clamp));
  const mediaIn = prog(f, P.media, 60);

  const copyLeft = mirror ? 1150 : 120;
  const mediaLeft = mirror ? 70 : 800;
  const longName = p.name.length > 14;

  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${mix(1990, 0, sheet) + mix(0, -260, leave)}px)`,
        boxShadow: "-30px 0 70px rgba(40,30,10,0.28)",
        background: p.tint,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 28% 22%, rgba(255,255,255,0.5), transparent 62%), radial-gradient(ellipse 90% 80% at 80% 110%, rgba(120,95,50,0.10), transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -80,
          opacity: 0.32,
          backgroundImage: "radial-gradient(rgba(23,22,15,0.24) 1.3px, transparent 1.6px)",
          backgroundSize: "32px 32px",
          transform: `translateY(${-f * 0.22}px)`,
        }}
      />
      {/* giant index numeral behind everything */}
      <div
        style={{
          position: "absolute",
          [mirror ? "right" : "left"]: mirror ? 40 : 60,
          bottom: -150,
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 620,
          lineHeight: 1,
          color: p.tint2,
          opacity: 0.32 * prog(f, 10, 50),
          transform: `translateY(${interpolate(f, [0, LEN], [30, -30])}px)`,
        }}
      >
        0{index + 1}
      </div>

      {/* copy */}
      <div
        style={{
          position: "absolute",
          left: copyLeft,
          top: 40,
          bottom: 0,
          width: 670,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Rise at={P.name - 12} dist={10}>
          <Kicker>
            <span style={{ display: "inline-block", width: 14, height: 14, background: p.accent, marginRight: 14, verticalAlign: "-1px" }} />
            <span style={{ color: K.ink }}>0{index + 1}</span>
            <span style={{ color: K.dim }}> / 0{total}</span>
            <span style={{ color: K.dim }}>{"  —  "}</span>
            {p.kind}
          </Kicker>
        </Rise>
        <MaskLine at={P.name} dur={38} style={{ marginTop: 22 }}>
          <div style={{ fontFamily: grotesk, fontWeight: 800, fontSize: longName ? 96 : 124, letterSpacing: longName ? -3.5 : -5, lineHeight: 0.94, color: K.ink }}>
            {p.name}
          </div>
        </MaskLine>
        <Rise at={P.name + 16} dist={10}>
          <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 38, color: K.ink2, marginTop: 16 }}>
            ( {p.url.replace(/\.vercel\.app$/, "")}, {p.year} )
          </div>
        </Rise>
        <Rise at={P.name + 26} dist={14}>
          <div style={{ fontFamily: sans, fontSize: 30, lineHeight: 1.42, color: K.ink2, marginTop: 26, letterSpacing: -0.3, maxWidth: 640 }}>{p.line}</div>
        </Rise>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 34 }}>
          {p.stack.map((s, i) => (
            <Tag key={s} at={P.chips + i * P.chipStep} dot={p.accent}>
              {s}
            </Tag>
          ))}
        </div>
      </div>

      {/* media, slightly turned toward the copy */}
      <div
        style={{
          position: "absolute",
          left: mediaLeft,
          top: 0,
          bottom: 0,
          width: 1060,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: 2400,
        }}
      >
        <div
          style={{
            position: "relative",
            transform: `translateX(${mix(mirror ? -160 : 160, 0, mediaIn)}px) rotateY(${tilt}deg) scale(${interpolate(f, [0, LEN], [0.96, 1.02])})`,
            opacity: mediaIn,
          }}
        >
          {p.media.kind === "scroll" && <ScrollMedia p={p} mirror={mirror} />}
          {p.media.kind === "fan" && <FanMedia p={p} />}
          {p.media.kind === "grid" && <GridMedia p={p} />}
          {p.media.kind === "flip" && <FlipMedia p={p} />}

          <div style={{ position: "absolute", [mirror ? "left" : "right"]: -40, top: -96 }}>
            <Sticky at={P.note} color={p.sticky} rotate={mirror ? -5 : 5} w={270} hgt={150} size={38}>
              {p.note}
            </Sticky>
          </div>
          <div style={{ position: "absolute", [mirror ? "right" : "left"]: -30, top: -30 }}>
            <Sticker at={P.sticker} bg={K.ink} rotate={mirror ? 6 : -7} size={22} font={mono} weight={500} pad="9px 18px">
              <span style={{ width: 11, height: 11, borderRadius: 11, background: K.phosphor, boxShadow: `0 0 0 ${2 + 3 * Math.abs(Math.sin(f / 16))}px rgba(82,240,106,0.3)` }} />
              LIVE
            </Sticker>
          </div>
        </div>
      </div>

      {/* hold a little shade as the next sheet covers this one */}
      <AbsoluteFill style={{ background: "rgba(30,24,12,1)", opacity: leave * 0.18 }} />
    </AbsoluteFill>
  );
};
