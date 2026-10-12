import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import tl from "../timeline.json";
import { C } from "../theme";
import { mono } from "../fonts";
import { prog, mix, inQuint } from "../ease";

const [L1, L2] = tl.typing.lines;
const typed = (line: typeof L1, f: number) => line.text.slice(0, line.frames.filter((t) => t <= f).length);

// What `npm run ship` prints, line by line, after the second Enter.
const SHIP = [
  { at: L2.enter + 10, k: "build ", v: "compiled 214 modules", ok: "1.9s" },
  { at: L2.enter + 20, k: "deploy", v: "pushed to the edge", ok: "ok" },
  { at: L2.enter + 30, k: "live  ", v: "https://nivas.tech", ok: "200", live: true },
];

const Prompt = () => (
  <span>
    <span style={{ color: C.green }}>srinivas</span>
    <span style={{ color: C.dim }}>@</span>
    <span style={{ color: C.blueSoft }}>pondy</span>
    <span style={{ color: C.dim }}> ~ </span>
    <span style={{ color: C.red }}>❯ </span>
  </span>
);

export const ColdOpen = () => {
  const f = useCurrentFrame();
  const typingNow = (line: typeof L1) => f >= line.frames[0] - 2 && f <= line.enter;
  const blink = Math.floor(f / 30) % 2 === 0;
  const cursor = (show: boolean) => (
    <span
      style={{
        display: "inline-block",
        width: "0.6em",
        height: "1.15em",
        transform: "translateY(0.2em)",
        background: show ? C.ink : "transparent",
        marginLeft: 2,
      }}
    />
  );

  // Fade up from black, slow push in, then a fast punch-in before the cut.
  const fadeIn = prog(f, 0, 40);
  const push = interpolate(f, [0, 330], [1, 1.07]);
  const punch = prog(f, 302, 28, inQuint);
  const scale = push * mix(1, 2.4, punch);
  const out = 1 - prog(f, 314, 16, inQuint);
  const l1done = f >= L1.enter;
  const l2on = f >= L2.frames[0] - 26;

  return (
    <AbsoluteFill style={{ background: "oklch(0.1 0 0)", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 1340,
          fontFamily: mono,
          fontSize: 40,
          lineHeight: 1.7,
          color: C.ink,
          opacity: fadeIn * out,
          transform: `scale(${scale})`,
          transformOrigin: "30% 60%",
          filter: `blur(${punch * 6}px)`,
        }}
      >
        <div style={{ color: C.dim, fontSize: 22, letterSpacing: 2, marginBottom: 26 }}>zsh — 120×32</div>
        <div>
          <Prompt />
          {typed(L1, f)}
          {!l1done && cursor(typingNow(L1) || blink)}
        </div>
        {l1done && (
          <div style={{ color: C.muted, fontSize: 32 }}>Initialized empty Git repository in ~/new-idea/.git/</div>
        )}
        {l2on && (
          <div>
            <Prompt />
            {typed(L2, f)}
            {f < L2.enter && cursor(typingNow(L2) || blink)}
          </div>
        )}
        {SHIP.map((s) =>
          f >= s.at ? (
            <div key={s.k} style={{ fontSize: 32, display: "flex", gap: 28 }}>
              <span style={{ color: C.dim, whiteSpace: "pre" }}>{s.k}</span>
              <span style={{ color: s.live ? C.ink : C.muted, flex: 1 }}>{s.v}</span>
              <span style={{ color: C.green }}>✓ {s.ok}</span>
            </div>
          ) : null,
        )}
        {f >= SHIP[2].at + 8 && (
          <div>
            <Prompt />
            {cursor(blink)}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
