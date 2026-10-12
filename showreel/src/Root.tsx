import { Composition } from "remotion";
import { Reel } from "./Reel";
import tl from "./timeline.json";

export const Root = () => (
  <Composition
    id="Reel"
    component={Reel}
    durationInFrames={tl.duration}
    fps={tl.fps}
    width={tl.width}
    height={tl.height}
  />
);
