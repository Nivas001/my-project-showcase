import type { ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import tl from "../timeline.json";
import { K, mono, pixel, sans, serif, tamil } from "../theme";
import { inOut, mix, prog } from "../../ease";
import { MaskLine, Rise } from "../../components/Reveal";
import { Kicker, Sticker, Win } from "../ui";

const R = tl.research;
const OV = tl.projectOverlap;

type Tok = { t: string; ent?: "ORG" | "LOC" };
// "ISRO successfully launched a new weather satellite from Sriharikota today."
const SOURCE: Tok[] = [
  { t: "இஸ்ரோ", ent: "ORG" },
  { t: "நிறுவனம்" },
  { t: "இன்று" },
  { t: "ஸ்ரீஹரிகோட்டாவில்", ent: "LOC" },
  { t: "இருந்து" },
  { t: "புதிய" },
  { t: "வானிலை" },
  { t: "செயற்கைக்கோளை" },
  { t: "வெற்றிகரமாக" },
  { t: "விண்ணில்" },
  { t: "ஏவியது." },
];
const SUMMARY: Tok[] = [
  { t: "இஸ்ரோ", ent: "ORG" },
  { t: "ஸ்ரீஹரிகோட்டாவில்", ent: "LOC" },
  { t: "இருந்து" },
  { t: "வானிலை" },
  { t: "செயற்கைக்கோளை" },
  { t: "ஏவியது." },
];
const ENT = { ORG: K.blue, LOC: K.red } as const;

const Word = ({ tok, g, at, entAt, check }: { tok: Tok; g: number; at: number; entAt?: number; check?: boolean }) => {
  const p = prog(g, at, 20);
  const e = entAt === undefined ? 0 : prog(g, entAt, 22, inOut);
  const col = tok.ent ? ENT[tok.ent] : K.ink;
  return (
    <span style={{ position: "relative", display: "inline-block", marginRight: "0.3em", opacity: p, transform: `translateY(${mix(14, 0, p)}px)` }}>
      {tok.ent && (
        <span
          style={{
            position: "absolute",
            inset: "-0.02em -0.14em",
            border: `3px solid ${col}`,
            background: `color-mix(in oklab, ${col} 12%, transparent)`,
            clipPath: `inset(-20px ${mix(100, 0, e)}% -20px -20px)`,
          }}
        />
      )}
      <span style={{ position: "relative", color: tok.ent && e > 0.5 ? col : K.ink }}>{tok.t}</span>
      {tok.ent && (
        <span
          style={{
            position: "absolute",
            right: "-0.3em",
            top: "-0.7em",
            fontFamily: pixel,
            fontSize: 14,
            padding: "2px 6px",
            background: col,
            color: "#fff",
            opacity: e,
          }}
        >
          {check ? "✓ " : ""}
          {tok.ent}
        </span>
      )}
    </span>
  );
};

/** Bordered mono panel with its label set into the top rule, like the reference's ALERT box. */
const Box = ({ label, children, w }: { label: string; children: ReactNode; w: number }) => (
  <div style={{ position: "relative", width: w, border: `3px solid ${K.ink}`, padding: "44px 34px 34px", background: "rgba(255,255,255,0.55)" }}>
    <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", padding: "0 14px", background: K.paperCool, fontFamily: pixel, fontSize: 19, letterSpacing: 2, color: K.ink, whiteSpace: "nowrap" }}>
      {label}
    </div>
    {children}
  </div>
);

export const Research = () => {
  const f = useCurrentFrame();
  const g = f - OV;
  const sheet = prog(f, 0, OV, inOut);
  const space = prog(g, R.space, 70, inOut);
  const modelP = prog(g, R.model, 26);
  const pulse = 0.5 + 0.5 * Math.sin((g - R.model) / 6);
  let ei = 0;
  let si = 0;

  return (
    <AbsoluteFill style={{ transform: `translateY(${mix(1100, 0, sheet)}px)`, boxShadow: "0 -30px 70px rgba(40,30,10,0.28)", overflow: "hidden", background: K.paperCool }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(23,22,15,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(23,22,15,0.07) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          transform: `translateY(${-g * 0.15}px)`,
        }}
      />
      <div style={{ position: "absolute", left: 130, top: 104 }}>
        <Rise at={OV + 4} dist={10}>
          <Kicker color={K.blue}>Research · MCA, Pondicherry University · 2025</Kicker>
        </Rise>
        <MaskLine at={OV + 12} dur={36} style={{ marginTop: 16 }}>
          <div style={{ fontFamily: serif, fontSize: 104, letterSpacing: -2, lineHeight: 1, color: K.ink }}>
            Tamil summaries that <span style={{ fontStyle: "italic", color: K.blue }}>keep the names.</span>
          </div>
        </MaskLine>
      </div>

      {/* the pipeline */}
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 352,
          display: "flex",
          alignItems: "center",
          gap: 34,
          opacity: 1 - space,
          transform: `translateY(${mix(0, -120, space)}px) scale(${mix(1, 0.9, space)})`,
          transformOrigin: "50% 0%",
        }}
      >
        <div>
          <Box label="INPUT · NEWS" w={760}>
            <div style={{ fontFamily: tamil, fontSize: 40, lineHeight: 2.0 }}>
              {SOURCE.map((tok, i) => (
                <Word key={i} tok={tok} g={g} at={R.words + i * R.wordStep} entAt={tok.ent ? R.ents[ei++] : undefined} />
              ))}
            </div>
          </Box>
          <div style={{ fontFamily: sans, fontStyle: "italic", fontSize: 21, color: K.ink2, marginTop: 18, opacity: prog(g, R.words + 70, 24) }}>
            “ISRO successfully launched a new weather satellite from Sriharikota today.”
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: modelP, transform: `scale(${mix(0.85, 1, modelP)})`, marginTop: -40 }}>
          <svg width="180" height="26" viewBox="0 0 180 26">
            <line x1="2" y1="13" x2={2 + 160 * prog(g, R.model + 4, 34)} y2="13" stroke={K.ink} strokeWidth="3" strokeDasharray="8 7" strokeDashoffset={-g * 1.4} />
            <path d="M162 3 L176 13 L162 23" fill="none" stroke={K.ink} strokeWidth="3" opacity={prog(g, R.model + 34, 10)} />
          </svg>
          <div
            style={{
              fontFamily: pixel,
              fontSize: 20,
              letterSpacing: 2,
              color: "#fff",
              background: K.ink,
              padding: "20px 22px",
              textAlign: "center",
              lineHeight: 1.6,
              boxShadow: `0 0 0 ${3 + 5 * pulse}px rgba(43,55,214,${0.15 + 0.2 * pulse})`,
            }}
          >
            MT5 + PEFT
            <br />
            <span style={{ color: K.lime }}>+ NER LOCK</span>
          </div>
        </div>

        <div style={{ opacity: prog(g, R.summary - 12, 20) }}>
          <Box label="SUMMARY · ENTITIES KEPT" w={620}>
            <div style={{ fontFamily: tamil, fontSize: 40, lineHeight: 2.0 }}>
              {SUMMARY.map((tok, i) => (
                <Word key={i} tok={tok} g={g} at={R.summary + i * R.summaryStep} entAt={tok.ent ? R.summary + 18 + si++ * 12 : undefined} check />
              ))}
            </div>
          </Box>
          <div style={{ fontFamily: mono, fontSize: 19, color: K.ink2, marginTop: 18, opacity: prog(g, R.summary + 60, 24) }}>2 / 2 entities kept</div>
        </div>
      </div>

      {/* the public Space, tilted like a device on the desk */}
      <div
        style={{
          position: "absolute",
          left: 330,
          top: 340,
          perspective: 2200,
          opacity: space,
          transform: `translateY(${mix(700, 0, space)}px)`,
        }}
      >
        <div style={{ transform: `rotateX(${mix(30, 16, space)}deg) rotateZ(${mix(-12, -5, space) + interpolate(g, [R.space, 720], [0, 1.5])}deg)` }}>
          <Win url="huggingface.co/spaces/…/tamil-ner-summarizer" width={1260} h={2.4}>
            <Img src={staticFile("media/tamil-ner-summarizer/screen-02-summary.webp")} style={{ width: 1260, height: 700, objectFit: "cover", objectPosition: "top", display: "block" }} />
          </Win>
        </div>
      </div>
      <div style={{ position: "absolute", left: 1380, top: 330 }}>
        <Sticker at={R.space + 54 + OV} rotate={7} bg={K.lime} fg={K.ink} size={30}>
          public on Hugging Face
        </Sticker>
      </div>
      <div style={{ position: "absolute", left: 230, bottom: 70, opacity: prog(g, R.space + 70, 24) }}>
        <Sticker at={R.space + 66 + OV} rotate={-4} bg={K.ink} size={22} font={mono} weight={500} pad="10px 20px">
          Python · TensorFlow · spaCy · mT5
        </Sticker>
      </div>
    </AbsoluteFill>
  );
};
