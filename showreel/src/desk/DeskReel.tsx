import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import tl from "./timeline.json";
import { K } from "./theme";
import { Grain, MenuBar } from "./ui";
import { prog } from "../ease";
import { LIVE } from "./data";
import { Boot } from "./scenes/Boot";
import { Title } from "./scenes/Title";
import { Statement } from "./scenes/Statement";
import { Index } from "./scenes/Index";
import { Project } from "./scenes/Project";
import { Desk } from "./scenes/Desk";
import { Research } from "./scenes/Research";
import { Orbit } from "./scenes/Orbit";
import { Outro } from "./scenes/Outro";

const S = tl.scenes;
const span = ([a, b]: number[]) => ({ from: a!, durationInFrames: b! - a! });
const OV = tl.projectOverlap;

/** The OS menu bar stays put while project sheets and the desk slide under it. */
const Chrome = () => {
  const f = useCurrentFrame();
  const a = S.projects[0]! - OV;
  const b = S.desk[1]!;
  if (f < a || f >= b) return null;
  const i = Math.floor((f - S.projects[0]!) / tl.projectLen);
  const label =
    f < S.projects[0]! ? "Index" : f < S.desk[0]! ? `Projects — ${LIVE[Math.min(i, LIVE.length - 1)]!.name}` : "Desktop — after hours";
  const o = prog(f, a, 30) * (1 - prog(f, b - 40, 30));
  return <MenuBar label={label} minute={Math.floor((f - a) / 420)} opacity={o} />;
};

export const DeskReel = ({ withAudio = true }: { withAudio?: boolean }) => (
  <AbsoluteFill style={{ background: K.paper }}>
    <Sequence {...span(S.boot)}>
      <Boot />
    </Sequence>
    <Sequence {...span(S.title)}>
      <Title />
    </Sequence>
    <Sequence {...span(S.statement)}>
      <Statement />
    </Sequence>
    <Sequence {...span(S.index)}>
      <Index />
    </Sequence>
    {LIVE.map((p, i) => (
      <Sequence key={p.slug} from={S.projects[0]! + i * tl.projectLen - OV} durationInFrames={tl.projectLen + OV * 2}>
        <Project p={p} index={i} total={LIVE.length} />
      </Sequence>
    ))}
    <Sequence from={S.desk[0]! - OV} durationInFrames={S.desk[1]! - S.desk[0]! + OV * 2}>
      <Desk />
    </Sequence>
    <Sequence from={S.research[0]! - OV} durationInFrames={S.research[1]! - S.research[0]! + OV}>
      <Research />
    </Sequence>
    <Sequence {...span(S.orbit)}>
      <Orbit />
    </Sequence>
    <Sequence {...span(S.outro)}>
      <Outro />
    </Sequence>
    <Chrome />
    <Grain />
    {withAudio ? <Audio src={staticFile("audio/score-desk.wav")} /> : null}
  </AbsoluteFill>
);
