import { Composition } from "remotion";
import { Reel } from "./Reel";
import tl from "./timeline.json";
import { DeskReel } from "./desk/DeskReel";
import dtl from "./desk/timeline.json";

export const Root = () => (
  <>
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={tl.duration}
      fps={tl.fps}
      width={tl.width}
      height={tl.height}
    />
    {/* The second reel: the "Desk OS" cut, light paper theme. */}
    <Composition
      id="DeskReel"
      component={DeskReel}
      durationInFrames={dtl.duration}
      fps={dtl.fps}
      width={dtl.width}
      height={dtl.height}
    />
  </>
);
