import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { display, mono, sans, tamil } from "../fonts";
import { prog, mix, inQuint } from "../ease";
import { MaskLine, Rise } from "../components/Reveal";
import { Label } from "../components/Bits";

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

export const R = {
  words: 70,
  wordStep: 6,
  ents: [150, 174],
  model: 214,
  summary: 262,
  summaryStep: 7,
  exit: 446,
};

const ENT_COLOR = { ORG: C.blueSoft, LOC: C.yellow } as const;

const Word = ({ tok, at, entAt }: { tok: Tok; at: number; entAt?: number }) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 22);
  const e = entAt === undefined ? 0 : prog(f, entAt, 26);
  const col = tok.ent ? ENT_COLOR[tok.ent] : C.ink;
  return (
    <span style={{ position: "relative", display: "inline-block", marginRight: "0.32em", opacity: p, transform: `translateY(${mix(16, 0, p)}px)` }}>
      {tok.ent && (
        <>
          <span
            style={{
              position: "absolute",
              inset: "-0.06em -0.16em",
              borderRadius: 10,
              border: `2px solid ${col}`,
              background: `color-mix(in oklab, ${col} 16%, transparent)`,
              clipPath: `inset(0 ${mix(100, 0, e)}% 0 0)`,
            }}
          />
        </>
      )}
      <span style={{ position: "relative", color: tok.ent && e > 0.5 ? col : C.ink }}>{tok.t}</span>
      {tok.ent && (
        <span
          style={{
            position: "relative",
            display: "inline-block",
            marginLeft: 12,
            verticalAlign: "0.35em",
            fontFamily: mono,
            fontSize: 15,
            letterSpacing: 2,
            color: col,
            opacity: e,
            width: mix(0, 42, e),
            overflow: "hidden",
          }}
        >
          {tok.ent}
        </span>
      )}
    </span>
  );
};

export const Research = () => {
  const f = useCurrentFrame();
  const exit = prog(f, R.exit, 34, inQuint);
  const modelP = prog(f, R.model, 30);
  const pulse = 0.5 + 0.5 * Math.sin((f - R.model) / 7);
  let ei = 0;
  let si = 0;

  return (
    <AbsoluteFill style={{ background: "oklch(0.12 0.012 266)", opacity: prog(f, 0, 24) }}>
      <AbsoluteFill
        style={{
          padding: "0 130px",
          justifyContent: "center",
          opacity: 1 - exit,
          transform: `scale(${mix(1, 0.94, exit)}) translateY(${interpolate(f, [0, 480], [20, -20])}px)`,
          filter: `blur(${exit * 10}px)`,
        }}
      >
        <Rise at={4} dist={10}>
          <Label color={C.blueSoft}>Research · MCA, Pondicherry University</Label>
        </Rise>
        <MaskLine at={12} dur={36} style={{ marginTop: 20 }}>
          <div style={{ fontFamily: display, fontWeight: 800, fontSize: 92, letterSpacing: -3, color: C.ink, lineHeight: 1 }}>
            Tamil summaries that keep the names.
          </div>
        </MaskLine>

        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 230px 1fr", alignItems: "center", gap: 40, marginTop: 76 }}>
          <div>
            <Label style={{ fontSize: 17 }}>input · news</Label>
            <div style={{ fontFamily: tamil, fontSize: 42, lineHeight: 2.05, marginTop: 34 }}>
              {SOURCE.map((tok, i) => (
                <Word key={i} tok={tok} at={R.words + i * R.wordStep} entAt={tok.ent ? R.ents[ei++] : undefined} />
              ))}
            </div>
            <Rise at={R.words + 70} dist={6}>
              <div style={{ fontFamily: sans, fontSize: 22, color: C.muted, marginTop: 18, fontStyle: "italic" }}>
                “ISRO successfully launched a new weather satellite from Sriharikota today.”
              </div>
            </Rise>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: modelP, transform: `scale(${mix(0.85, 1, modelP)})` }}>
            <svg width="220" height="30" viewBox="0 0 220 30">
              <line x1="4" y1="15" x2={4 + 200 * prog(f, R.model + 6, 40)} y2="15" stroke={C.blueSoft} strokeWidth="3" strokeDasharray="10 8" strokeDashoffset={-f * 1.5} />
              <path d="M200 5 L214 15 L200 25" fill="none" stroke={C.blueSoft} strokeWidth="3" opacity={prog(f, R.model + 38, 10)} />
            </svg>
            <div
              style={{
                fontFamily: mono,
                fontSize: 21,
                color: C.ink,
                textAlign: "center",
                padding: "16px 20px",
                borderRadius: 14,
                border: `1px solid color-mix(in oklab, ${C.blueSoft} ${40 + 40 * pulse}%, transparent)`,
                background: "oklch(1 0 0 / 4%)",
                lineHeight: 1.5,
              }}
            >
              mT5 + PEFT
              <br />
              <span style={{ color: C.blueSoft }}>+ NER lock</span>
            </div>
          </div>

          <div>
            <Rise at={R.summary - 10} dist={6}>
              <Label style={{ fontSize: 17 }}>summary · entities kept</Label>
            </Rise>
            <div style={{ fontFamily: tamil, fontSize: 42, lineHeight: 2.05, marginTop: 34 }}>
              {SUMMARY.map((tok, i) => (
                <Word key={i} tok={tok} at={R.summary + i * R.summaryStep} entAt={tok.ent ? R.summary + 16 + si++ * 12 : undefined} />
              ))}
            </div>
          </div>
        </div>

        <Rise at={R.summary + 70} dist={10}>
          <div style={{ marginTop: 70, fontFamily: mono, fontSize: 21, color: C.muted, display: "flex", gap: 22 }}>
            <span>Public on Hugging Face</span>
            <span style={{ color: C.dim }}>·</span>
            <span>Python · TensorFlow · spaCy</span>
          </div>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
