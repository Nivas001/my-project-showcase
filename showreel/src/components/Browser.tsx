import type { CSSProperties, ReactNode } from "react";
import { C } from "../theme";
import { mono } from "../fonts";

/** Matches the site's BrowserFrame: hairline border, centred mono URL, no traffic lights. */
export const Browser = ({
  url,
  width,
  children,
  style,
}: {
  url: string;
  width: number;
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      width,
      borderRadius: 18,
      overflow: "hidden",
      background: C.bgRaised,
      border: `1px solid ${C.hairline}`,
      boxShadow:
        "0 1px 0 oklch(1 0 0 / 6%) inset, 0 40px 80px -20px oklch(0 0 0 / 70%), 0 18px 30px -12px oklch(0 0 0 / 60%)",
      ...style,
    }}
  >
    <div
      style={{
        height: 46,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: `1px solid ${C.hairline}`,
        fontFamily: mono,
        fontSize: 17,
        color: C.muted,
        letterSpacing: 0.2,
      }}
    >
      {url}
    </div>
    <div style={{ position: "relative", overflow: "hidden" }}>{children}</div>
  </div>
);
