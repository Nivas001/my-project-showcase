import { useEffect, useState } from "react";
import portraitAsset from "@/assets/portrait.png.asset.json";

const LINE = "it's me!";

export function HeroPortrait() {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let index = 0;
    let typing: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      typing = setInterval(() => {
        index += 1;
        setTyped(LINE.slice(0, index));
        if (index >= LINE.length) clearInterval(typing);
      }, 85);
    }, 1100);
    return () => {
      clearTimeout(start);
      clearInterval(typing);
    };
  }, []);

  return (
    <div className="hero-anim relative order-1 mx-auto w-full max-w-[280px] lg:order-2 lg:max-w-none">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle at 50% 45%, var(--glow) 0%, transparent 65%)",
          opacity: 0.28,
        }}
      />

      {/* comic speech bubble */}
      <div
        className="absolute left-0 top-2 z-10 sm:top-4 lg:left-4"
        style={{ animation: "hero-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.8s both" }}
      >
        <div style={{ animation: "hero-bubble-bob 4s ease-in-out 1.4s infinite" }}>
          <div className="relative rounded-2xl border-2 border-primary bg-surface-raised px-3 py-2 shadow-[var(--shadow-glow)]">
            <span className="font-mono text-sm font-semibold text-foreground sm:text-base">
              hey — {typed}
              <span
                className="text-accent"
                style={{ animation: "hero-caret 1s step-end infinite" }}
              >
                _
              </span>
            </span>
            <span
              aria-hidden
              className="absolute -bottom-2 left-6 h-3 w-3 rotate-45 border-b-2 border-r-2 border-primary bg-surface-raised"
            />
          </div>
        </div>
      </div>

      {/* waving hand */}
      <div
        aria-hidden
        className="absolute right-2 top-24 z-10 text-4xl sm:top-32 sm:text-5xl lg:right-8 lg:top-40"
        style={{
          transformOrigin: "70% 80%",
          animation: "hero-wave 2.4s ease-in-out 0.6s infinite",
        }}
      >
        👋
      </div>

      <img
        src={portraitAsset.url}
        alt="Illustrated portrait of Srinivas, Python and full stack developer"
        fetchPriority="high"
        className="relative mx-auto h-[300px] w-full object-contain object-center sm:h-[380px] lg:h-[460px]"
        style={{ animation: "hero-float 6s ease-in-out infinite" }}
      />
    </div>
  );
}
