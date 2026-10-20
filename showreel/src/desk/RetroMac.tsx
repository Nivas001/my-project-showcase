import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { K } from "./theme";

/**
 * A beige all-in-one, drawn in CSS. Everything is laid out in its own 760×860
 * box so scenes can aim a camera at the screen: SCREEN is the CRT rectangle
 * in that box.
 */
export const MAC = { W: 760, H: 860 };
export const SCREEN = { x: 136, y: 62, w: 432, h: 324 };
export const SCREEN_C = { x: SCREEN.x + SCREEN.w / 2, y: SCREEN.y + SCREEN.h / 2 };

const BODY = { x: 70, y: 0, w: 560, h: 600 };
const ROWS = ["`1234567890-=", "qwertyuiop[]", "asdfghjkl;'", "zxcvbnm,./"];

/** Phosphor CRT: scanlines, curvature shading, glass glare, a little flicker. */
export const Crt = ({ children, on = 1, bg = K.crt }: { children?: ReactNode; on?: number; bg?: string }) => {
  const f = useCurrentFrame();
  const flicker = 1 - 0.035 * Math.abs(Math.sin(f * 1.7) * Math.sin(f * 0.37));
  return (
    <div
      style={{
        position: "absolute",
        left: SCREEN.x,
        top: SCREEN.y,
        width: SCREEN.w,
        height: SCREEN.h,
        borderRadius: "34px / 30px",
        overflow: "hidden",
        background: bg,
        boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.55), inset 0 0 40px 8px rgba(0,0,0,0.55)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, opacity: on * flicker }}>{children}</div>
      {/* scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "multiply",
        }}
      />
      {/* tube curvature: darker corners */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%)" }} />
      {/* glass glare */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 38% at 30% 14%, rgba(255,255,255,0.13), transparent 70%), linear-gradient(160deg, rgba(255,255,255,0.06) 0%, transparent 40%)",
        }}
      />
    </div>
  );
};

const Key = ({ w = 1, down = false }: { w?: number; down?: boolean }) => (
  <div
    style={{
      flex: w,
      height: 26,
      borderRadius: 4,
      background: down ? "#CFC6AF" : "linear-gradient(180deg, #F2ECDD 0%, #E4DCC8 100%)",
      boxShadow: down
        ? "0 1px 0 #B7AC90, inset 0 1px 2px rgba(0,0,0,0.15)"
        : "0 4px 0 #BDB295, 0 5px 3px rgba(60,45,20,0.25)",
      transform: `translateY(${down ? 3 : 0}px)`,
    }}
  />
);

/** Which key is down right now, from a list of (char, frame) presses. */
export const keyDown = (presses: { ch: string; at: number }[], f: number) => {
  for (const p of presses) if (f >= p.at && f < p.at + 5) return p.ch;
  return null;
};

export const RetroMac = ({
  screen,
  down = null,
  led = 1,
  children,
}: {
  screen: ReactNode;
  down?: string | null;
  led?: number;
  children?: ReactNode;
}) => {
  return (
    <div style={{ position: "relative", width: MAC.W, height: MAC.H }}>
      {/* contact shadow on the desk */}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 560,
          width: 720,
          height: 120,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(60,45,20,0.32), transparent 70%)",
          filter: "blur(8px)",
        }}
      />
      {/* side panel — gives the box its depth */}
      <div
        style={{
          position: "absolute",
          left: BODY.x + BODY.w - 4,
          top: BODY.y + 6,
          width: 74,
          height: BODY.h - 6,
          background: "linear-gradient(90deg, #D3C9B0 0%, #C3B89A 100%)",
          clipPath: "polygon(0 2%, 100% 0, 100% 97%, 0 100%)",
        }}
      />
      {/* front face */}
      <div
        style={{
          position: "absolute",
          left: BODY.x,
          top: BODY.y,
          width: BODY.w,
          height: BODY.h,
          borderRadius: "26px 26px 16px 16px",
          background: "linear-gradient(180deg, #F0EADB 0%, #E8E1CE 55%, #DDD4BE 100%)",
          boxShadow: "inset 0 2px 0 rgba(255,255,255,0.8), inset 0 -10px 18px rgba(120,100,60,0.16), inset -3px 0 0 rgba(150,130,90,0.18)",
        }}
      />
      {/* screen recess */}
      <div
        style={{
          position: "absolute",
          left: SCREEN.x - 22,
          top: SCREEN.y - 20,
          width: SCREEN.w + 44,
          height: SCREEN.h + 42,
          borderRadius: 30,
          background: "linear-gradient(180deg, #CEC5AD 0%, #DDD5C0 100%)",
          boxShadow: "inset 0 6px 12px rgba(80,65,35,0.35), inset 0 -2px 0 rgba(255,255,255,0.5)",
        }}
      />
      <Crt>{screen}</Crt>
      {/* badge, slot, LED, vents */}
      <div style={{ position: "absolute", left: BODY.x + 44, top: 470, display: "flex", gap: 1 }}>
        {["#E5352B", "#3BB44A", "#2B37D6"].map((c) => (
          <span key={c} style={{ width: 6, height: 14, background: c }} />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: BODY.x + 300,
          top: 470,
          width: 200,
          height: 16,
          borderRadius: 4,
          background: "#2A2823",
          boxShadow: "inset 0 3px 4px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.6)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: BODY.x + 440,
          top: 466,
          width: 56,
          height: 24,
          borderRadius: 4,
          background: "linear-gradient(180deg, #E2DAC6, #D2C9B1)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: BODY.x + 516,
          top: 474,
          width: 8,
          height: 8,
          borderRadius: 8,
          background: led > 0.5 ? K.phosphor : "#7d8a74",
          boxShadow: led > 0.5 ? `0 0 10px ${K.phosphor}` : "none",
        }}
      />
      <div style={{ position: "absolute", left: BODY.x + 420, top: 548, display: "flex", gap: 6 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} style={{ width: 14, height: 18, borderRadius: 2, background: "#3a362e", boxShadow: "inset 0 2px 2px rgba(0,0,0,0.6)" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: BODY.x + 40, top: 552, width: 26, height: 26, borderRadius: 26, border: `4px solid ${K.red}` }} />

      {/* keyboard, tilted toward camera */}
      <div style={{ position: "absolute", left: 40, top: 610, width: 620, perspective: 900 }}>
        <div
          style={{
            transform: "rotateX(38deg)",
            transformOrigin: "50% 0%",
            padding: "14px 16px 18px",
            borderRadius: 12,
            background: "linear-gradient(180deg, #EAE3D1 0%, #DDD4BD 100%)",
            boxShadow: "0 14px 0 #C5BA9D, 0 28px 30px rgba(60,45,20,0.3), inset 0 2px 0 rgba(255,255,255,0.7)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {ROWS.map((row, r) => (
            <div key={row} style={{ display: "flex", gap: 7, paddingLeft: r * 12 }}>
              {[...row].map((ch) => (
                <Key key={ch} down={down === ch} />
              ))}
              {r === 2 && <Key w={1.8} down={down === "\n"} />}
            </div>
          ))}
          <div style={{ display: "flex", gap: 7, padding: "0 90px" }}>
            <Key w={1.4} />
            <Key w={7} down={down === " "} />
            <Key w={1.4} />
          </div>
        </div>
      </div>
      {/* mouse + cable */}
      <svg style={{ position: "absolute", left: 600, top: 520, overflow: "visible" }} width="160" height="260">
        <path d="M 30 70 C 60 60, 120 90, 110 160" fill="none" stroke="#B9AE91" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 680,
          top: 690,
          width: 70,
          height: 52,
          borderRadius: "12px 12px 16px 16px",
          background: "linear-gradient(180deg, #F0E9D8, #D9D0B8)",
          boxShadow: "0 8px 0 #BFB497, 0 16px 18px rgba(60,45,20,0.28)",
          transform: "rotate(-6deg)",
        }}
      >
        <div style={{ margin: "8px 10px", height: 14, borderRadius: 3, background: "#2f2c26", opacity: 0.85 }} />
      </div>
      {children}
    </div>
  );
};
