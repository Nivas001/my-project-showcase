import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import tl from "./timeline.json";
import "./fonts";
import { C } from "./theme";
import { Film } from "./components/Film";
import { ColdOpen } from "./scenes/ColdOpen";
import { Title } from "./scenes/Title";
import { Statement } from "./scenes/Statement";
import { ProjectScene, P } from "./scenes/ProjectScene";
import { Research } from "./scenes/Research";
import { Stack } from "./scenes/Stack";
import { Outro } from "./scenes/Outro";
import { PROJECTS } from "./projects";

const S = tl.scenes;
const span = ([a, b]: number[]) => ({ from: a, durationInFrames: b - a });

export const Reel = ({ withAudio = true }: { withAudio?: boolean }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence {...span(S.coldOpen)}>
      <ColdOpen />
    </Sequence>
    <Sequence {...span(S.title)}>
      <Title />
    </Sequence>
    <Sequence {...span(S.statement)}>
      <Statement />
    </Sequence>
    {PROJECTS.map((p, i) => {
      const from = S.projects[0] + i * tl.projectLen;
      return (
        // Each slot overlaps the next by 30 frames so the whip-out and the
        // swing-in share the same whoosh. The last one hands off to Research.
        <Sequence key={p.slug} from={from} durationInFrames={P.len}>
          <ProjectScene p={p} index={i} total={PROJECTS.length} />
        </Sequence>
      );
    })}
    <Sequence {...span(S.research)}>
      <Research />
    </Sequence>
    <Sequence {...span(S.stack)}>
      <Stack />
    </Sequence>
    <Sequence {...span(S.outro)}>
      <Outro />
    </Sequence>
    <Film />
    {withAudio ? <Audio src={staticFile("audio/score.wav")} /> : null}
  </AbsoluteFill>
);
