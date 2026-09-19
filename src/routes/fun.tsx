import { createFileRoute } from "@tanstack/react-router";
import { canonical } from "@/lib/site";
import { useEffect, useMemo, useState } from "react";
import {
  Bug,
  Gamepad2,
  Ghost,
  Keyboard,
  Lightbulb,
  Music,
  Rocket,
  Skull,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { GAMES, type GameId } from "@/lib/games";
import { PageHero, SectionLabel, SplitLines, Sticker } from "@/components/kit";
import { BugHunt } from "@/components/games/BugHunt";
import { DeployDash } from "@/components/games/DeployDash";
import { SnakeByte } from "@/components/games/SnakeByte";
import { MemoryStack } from "@/components/games/MemoryStack";
import { CodeSprint } from "@/components/games/CodeSprint";
import { ReactionTime } from "@/components/games/ReactionTime";
import { LeaderboardPanel } from "@/components/games/LeaderboardPanel";
import { RoastBot } from "@/components/games/RoastBot";
import { roastScore, IDLE_TAUNTS, pick } from "@/lib/taunts";
import { Reveal } from "@/components/Reveal";
import { ArcadeAudioProvider, useArcadeAudio } from "@/lib/arcade/use-arcade-audio";
import { bumpPlays, readBests, readPlays, type Bests } from "@/lib/arcade/best";
import { GAME_CONFIG } from "@/lib/games";

const TITLE = "The Arcade — Srinivas M";
const DESCRIPTION =
  "Six browser mini-games with synthesised sound and a public leaderboard: Bug Hunt, Deploy Dash, Snake Byte, Memory Stack, Code Sprint and Reaction Time.";

export const Route = createFileRoute("/fun")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [canonical("/fun")],
  }),
  component: FunPage,
});

const GAME_ICONS: Record<GameId, typeof Bug> = {
  "bug-hunt": Bug,
  "deploy-dash": Rocket,
  "snake-byte": Ghost,
  "memory-stack": Zap,
  "code-sprint": Keyboard,
  "reaction-time": Timer,
};

export function FunPage() {
  return (
    <ArcadeAudioProvider>
      <Arcade />
    </ArcadeAudioProvider>
  );
}

/* ==========================================================================
 * THE CABINET
 *
 * The games all used to sit in the same flat card, which made six different
 * things feel like six tabs of one thing. They now live inside an arcade
 * cabinet: a marquee that names the game, a bezelled screen with a CRT wash
 * over it, and a control deck underneath carrying sound and your personal best.
 *
 * The frame is not only decoration — it is what makes a page of mini-games
 * read as somewhere you visit rather than a widget you scroll past.
 * ======================================================================== */

function Arcade() {
  const audio = useArcadeAudio();
  const [active, setActive] = useState<GameId>("bug-hunt");
  const [lastScore, setLastScore] = useState<number | undefined>(undefined);
  const [roast, setRoast] = useState<{ tier: string; line: string } | null>(null);
  const [idle, setIdle] = useState<string>(IDLE_TAUNTS[0]!);
  const [bests, setBests] = useState<Bests>({});
  const [plays, setPlays] = useState<Record<string, number>>({});

  const game = useMemo(() => GAMES.find((g) => g.id === active)!, [active]);

  useEffect(() => {
    setIdle(pick(IDLE_TAUNTS));
    const id = window.setInterval(() => setIdle(pick(IDLE_TAUNTS)), 9000);
    return () => window.clearInterval(id);
  }, []);

  // localStorage is not available during SSR, so bests arrive after mount and
  // again after every run.
  useEffect(() => {
    setBests(readBests());
    setPlays(readPlays());
  }, []);

  const handleGameOver = (score: number) => {
    setLastScore(score);
    setRoast(roastScore(active, score));
    bumpPlays(active);
    setBests(readBests());
    setPlays(readPlays());
  };

  const handleTabChange = (gameId: GameId) => {
    if (gameId === active) return;
    audio.play("select");
    setActive(gameId);
    setLastScore(undefined);
    setRoast(null);
  };

  const totalPlays = Object.values(plays).reduce((a, b) => a + b, 0);
  const played = Object.keys(bests).length;

  return (
    <>
      <PageHero
        index="01"
        label="The arcade"
        lines={["Six games.", "One leaderboard."]}
        lede="A real arcade wired into a CV. Every sound on this page is synthesised in your browser — no audio files, no autoplay, nothing starts until you press Start."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Sticker tone="hog-red" rotate={-3}>
            Scores are public
          </Sticker>
          {played > 0 ? (
            <span className="font-mono text-[11px] text-muted-foreground">
              <span className="font-bold text-foreground">{played}</span>/{GAMES.length} played ·{" "}
              <span className="font-bold text-foreground">{totalPlays}</span> runs on this device
            </span>
          ) : null}
        </div>
      </PageHero>

      <section
        data-act="noir"
        className="act-noir grain relative overflow-hidden border-t border-border"
      >
        <div aria-hidden className="hairline-grid pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-16">
          {/* ---- Cartridge selector ---- */}
          <Reveal>
            <div className="flex flex-wrap justify-center gap-2">
              {GAMES.map((g) => {
                const Icon = GAME_ICONS[g.id];
                const on = active === g.id;
                const best = bests[g.id];
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleTabChange(g.id)}
                    aria-pressed={on}
                    className={`group relative inline-flex items-center gap-2 rounded-md border-2 px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-all duration-150 hover:-translate-y-0.5 sm:px-4 ${
                      on
                        ? "border-hog-red-deep bg-hog-red-deep text-white shadow-[0_0_24px_-6px_var(--hog-red)]"
                        : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{g.label}</span>
                    <span className="sm:hidden">{g.label.split(" ")[0]}</span>
                    {best !== undefined ? (
                      <span
                        className={`ml-0.5 rounded-sm px-1.5 py-0.5 text-[9px] tabular-nums ${
                          on ? "bg-white/20 text-white" : "bg-secondary text-foreground/70"
                        }`}
                        title="Your personal best"
                      >
                        {best}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* ---- The cabinet ---- */}
          <Reveal delay={180}>
            <div className="arcade-cabinet mt-8">
              {/* Marquee */}
              <div className="arcade-marquee">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border-2 border-black/30 bg-hog-red-deep">
                    {(() => {
                      const Icon = GAME_ICONS[active];
                      return <Icon className="h-5 w-5 text-white" />;
                    })()}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-pixel truncate text-[13px] leading-tight text-foreground sm:text-[15px]">
                      {game.label}
                    </h2>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      {game.description}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => audio.setMusic(!audio.music)}
                    aria-pressed={audio.music}
                    title={audio.music ? "Stop the background loop" : "Play a background loop"}
                    className={`grid h-8 w-8 place-items-center rounded-md border-2 transition-colors ${
                      audio.music
                        ? "border-hog-red bg-hog-red/20 text-hog-red"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    <Music className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => audio.setMuted(!audio.muted)}
                    aria-pressed={audio.muted}
                    title={audio.muted ? "Unmute" : "Mute"}
                    className="grid h-8 w-8 place-items-center rounded-md border-2 border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {audio.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Screen */}
              <div className="arcade-screen">
                <div aria-hidden className="arcade-scanlines" />
                <div className="relative z-10">
                  <p
                    key={idle}
                    className="mb-5 animate-fade-in text-center font-mono text-[11px] italic text-muted-foreground"
                  >
                    glitch-9000 says: “{idle}”
                  </p>

                  {active === "bug-hunt" && <BugHunt onGameOver={handleGameOver} />}
                  {active === "deploy-dash" && <DeployDash onGameOver={handleGameOver} />}
                  {active === "snake-byte" && <SnakeByte onGameOver={handleGameOver} />}
                  {active === "memory-stack" && <MemoryStack onGameOver={handleGameOver} />}
                  {active === "code-sprint" && <CodeSprint onGameOver={handleGameOver} />}
                  {active === "reaction-time" && <ReactionTime onGameOver={handleGameOver} />}

                  {roast && (
                    <div
                      key={roast.line}
                      className={`mt-6 flex animate-scale-in items-start gap-3 rounded-md border p-4 ${
                        roast.tier === "good"
                          ? "border-game-go/40 bg-game-go/10"
                          : roast.tier === "mid"
                            ? "border-game-warn/40 bg-game-warn/10"
                            : "border-destructive/40 bg-destructive/10"
                      }`}
                    >
                      <Skull className="mt-0.5 h-4 w-4 shrink-0 text-hog-red" />
                      <p className="font-mono text-xs leading-relaxed text-foreground">
                        {roast.line}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Control deck */}
              <div className="arcade-deck">
                <p className="flex min-w-0 items-start gap-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-hog-yellow" />
                  <span className="min-w-0">{game.tip}</span>
                </p>
                <p className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  {bests[active] !== undefined ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5 text-hog-yellow" />
                      your best{" "}
                      <span className="font-bold text-foreground">
                        {bests[active]} {GAME_CONFIG[active].unit}
                      </span>
                    </span>
                  ) : (
                    "no personal best yet"
                  )}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={220}>
            <LeaderboardPanel gameId={active} lastScore={lastScore} />
          </Reveal>

          {/* ---- The bot ---- */}
          <Reveal delay={260}>
            <div className="mt-16">
              <div className="mb-6 text-center">
                <SectionLabel index="02" rule={false} className="justify-center">
                  Talk to the machine
                </SectionLabel>
                <SplitLines
                  as="h2"
                  onView
                  lines={["GLITCH-9000 will", "judge you."]}
                  className="display-md mt-4 text-foreground"
                />
                <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                  A bot with zero manners and strong opinions about your reflexes. Ask it anything.
                  Regret it.
                </p>
              </div>
              <RoastBot
                context={
                  lastScore !== undefined
                    ? `context: the user just scored ${lastScore} in ${game.label}`
                    : undefined
                }
              />
            </div>
          </Reveal>

          <Reveal delay={300}>
            <p className="mt-14 text-center font-mono text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-hog-red" />
                Scores are public. Personal bests stay on your device.
              </span>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
