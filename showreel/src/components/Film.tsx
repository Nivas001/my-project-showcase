import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * Animated film grain + lens vignette over everything. Re-seeded every two
 * frames so it reads as 30fps grain on a 60fps picture, like a real sensor.
 */
export const Film = ({ grain = 0.085 }: { grain?: number }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 97;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: grain, mixBlendMode: "overlay" }}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 45%, transparent 55%, oklch(0 0 0 / 0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
