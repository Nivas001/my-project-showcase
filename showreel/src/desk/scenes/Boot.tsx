import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import tl from "../timeline.json";
import { K, pixel, vt } from "../theme";
import { inOut, inQuint, mix, prog } from "../../ease";
import { MAC, RetroMac, SCREEN, SCREEN_C, keyDown } from "../RetroMac";
import { Paper, PixelPrompt, Sticky } from "../ui";

const B = tl.boot;
const [L1, L2] = tl.typing.lines;
const OUT = tl.typing.out;

const typed = (line: typeof L1, f: number) => line.text.slice(0, line.frames.filter((t) => t <= f).length);

const PRESSES = [
  ...L1.frames.map((at, i) => ({ ch: L1.text[i]!, at })),
  { ch: "\n", at: L1.enter },
  ...L2.frames.map((at, i) => ({ ch: L2.text[i]!, at })),
  { ch: "\n", at: L2.enter },
];

const G = K.phosphor;
const GD = "rgba(82, 240, 106, 0.55)";

const Prompt = () => (
  <span>
    <span style={{ color: GD }}>nivas</span>
    <span style={{ color: G }}> ~ $ </span>
  </span>
);

const SMPTE = ["#C9C9C9", "#C9C200", "#00C2C4", "#00C200", "#C400C2", "#C40000", "#0000C4"];

/** What the tube shows, frame by frame. */
const Screen = ({ f }: { f: number }) => {
  if (f < B.crtOn) return null;

  // 1. the beam: a dot that becomes a line that becomes a raster
  if (f < B.bars) {
    const wP = prog(f, B.crtOn, 8, inOut);
    const hP = prog(f, B.crtOn + 8, 20, inOut);
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: mix(4, SCREEN.w, wP),
            height: mix(3, SCREEN.h, hP),
            background: "#EAF7EC",
            opacity: mix(1, 0.85, hP),
            boxShadow: "0 0 30px 10px rgba(220,255,225,0.75)",
          }}
        />
      </AbsoluteFill>
    );
  }

  // 2. colour bars, rolling a little while the set warms up
  if (f < B.logo) {
    const roll = (f % 9) * 3 - 12;
    return (
      <AbsoluteFill style={{ transform: `translateY(${roll}px)`, opacity: 0.92 }}>
        <div style={{ display: "flex", height: "72%" }}>
          {SMPTE.map((c) => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <div style={{ display: "flex", height: "8%" }}>
          {["#0000C4", "#161616", "#C400C2", "#161616", "#00C2C4", "#161616", "#C9C9C9"].map((c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <div style={{ display: "flex", height: "20%" }}>
          {["#00214C", "#FFFFFF", "#32006A", "#131313", "#090909", "#131313", "#1D1D1D"].map((c, i) => (
            <div key={i} style={{ flex: i === 1 ? 1.4 : 1, background: c }} />
          ))}
        </div>
      </AbsoluteFill>
    );
  }

  // 3. boot logo
  if (f < B.terminal) {
    const p = prog(f, B.logo, 18);
    const blocks = Math.floor(interpolate(f, [B.logo + 10, B.terminal - 14], [0, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 26, opacity: p }}>
        <PixelPrompt size={13} glow cursor={Math.floor(f / 14) % 2 === 0} />
        <div style={{ fontFamily: pixel, fontSize: 15, color: G, letterSpacing: 2, textShadow: `0 0 8px ${GD}` }}>NIVAS.TECH OS · V26</div>
        <div style={{ display: "flex", gap: 4, padding: 4, border: `2px solid ${GD}` }}>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} style={{ width: 12, height: 12, background: i < blocks ? G : "transparent" }} />
          ))}
        </div>
      </AbsoluteFill>
    );
  }

  // 4. terminal
  const blink = Math.floor(f / 30) % 2 === 0;
  const typingNow = (line: typeof L1) => f >= line.frames[0]! - 2 && f <= line.enter;
  const cursor = (show: boolean) => (
    <span style={{ display: "inline-block", width: "0.5em", height: "0.9em", transform: "translateY(0.12em)", background: show ? G : "transparent", boxShadow: show ? `0 0 8px ${G}` : "none" }} />
  );
  const rows = [
    { k: "build ", v: "214 modules", ok: "1.9s" },
    { k: "deploy", v: "to the edge", ok: "ok" },
    { k: "live  ", v: "nivas.tech", ok: "200" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "24px 30px",
        fontFamily: vt,
        fontSize: 25,
        lineHeight: 1.18,
        color: G,
        textShadow: `0 0 6px ${GD}, 0 0 1px ${G}`,
        opacity: prog(f, B.terminal, 10),
      }}
    >
      <div style={{ color: GD, marginBottom: 6 }}>nivas.tech OS v26 — tty1</div>
      <div style={{ whiteSpace: "pre" }}>
        <Prompt />
        {typed(L1, f)}
        {f < L1.enter && cursor(typingNow(L1) || blink)}
      </div>
      {f >= L1.enter && <div style={{ color: GD, whiteSpace: "pre" }}>Initialized empty Git repo.</div>}
      {f >= L1.enter + 14 && (
        <div style={{ whiteSpace: "pre" }}>
          <Prompt />
          {typed(L2, f)}
          {f < L2.enter && cursor(typingNow(L2) || blink)}
        </div>
      )}
      {rows.map((r, i) =>
        f >= OUT[i]! ? (
          <div key={r.k} style={{ display: "flex", whiteSpace: "pre" }}>
            <span style={{ color: GD }}>{r.k}  </span>
            <span style={{ flex: 1, color: i === 2 ? "#D8FFDF" : G }}>{r.v}</span>
            <span>✓ {r.ok}</span>
          </div>
        ) : null,
      )}
      {f >= tl.typing.prompt && (
        <div style={{ whiteSpace: "pre" }}>
          <Prompt />
          {cursor(blink)}
        </div>
      )}
    </div>
  );
};

export const Boot = () => {
  const f = useCurrentFrame();

  // Camera: settle, push toward the screen while typing, then dive through it.
  const settle = prog(f, 0, 180);
  const push = prog(f, B.terminal - 10, 250, inOut);
  const dive = prog(f, B.plunge, B.blue + 16 - B.plunge, inQuint);
  const s = mix(0.97, 1.05, settle) * mix(1, 1.55, push) * mix(1, 4.4, dive);
  const c = mix(0, 0.5, push) + mix(0, 0.5, dive);

  const left = 960 - MAC.W / 2;
  const top = 108;
  const sx = left + SCREEN_C.x;
  const sy = top + SCREEN_C.y;
  const tx = (960 - sx) * c;
  const ty = (540 - sy) * c;

  const flood = prog(f, B.blue - 30, 26, inOut);
  const black = 1 - prog(f, 0, 50);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Paper />
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
          led={f >= B.power ? 1 : 0}
          down={keyDown(PRESSES, f)}
          screen={
            <>
              <Screen f={f} />
              <AbsoluteFill style={{ background: K.blue, opacity: flood }} />
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
            ship v1.0!
          </Sticky>
          <Sticky at={-40} color={K.sticky.peach} rotate={-3} w={190} hgt={84} size={22} tape={false} style={{ position: "absolute", left: 40, top: 790 }}>
            nivas.tech — 2026
          </Sticky>
        </RetroMac>
      </div>
      {/* once the tube fills the frame, hold pure blue for the wipe */}
      <AbsoluteFill style={{ background: K.blue, opacity: prog(f, B.blue + 8, 10) }} />
      <AbsoluteFill style={{ background: "#0b0a08", opacity: black }} />
    </AbsoluteFill>
  );
};

