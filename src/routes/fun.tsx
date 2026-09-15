import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bug, Gamepad2, Ghost, Keyboard, Skull, Timer, Zap } from "lucide-react";
import { GAMES, type GameId } from "@/lib/games";
import { PageHero, SectionLabel, SplitLines, Sticker } from "@/components/kit";
import { BugHunt } from "@/components/games/BugHunt";
import { SnakeByte } from "@/components/games/SnakeByte";
import { MemoryStack } from "@/components/games/MemoryStack";
import { CodeSprint } from "@/components/games/CodeSprint";
import { ReactionTime } from "@/components/games/ReactionTime";
import { LeaderboardPanel } from "@/components/games/LeaderboardPanel";
import { RoastBot } from "@/components/games/RoastBot";
import { roastScore, IDLE_TAUNTS, pick } from "@/lib/taunts";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/fun")({
  head: () => ({
    meta: [
      { title: "The Arcade — Srinivas M" },
      {
        name: "description",
        content:
          "Five browser mini-games with a public leaderboard: Bug Hunt, Snake Byte, Memory Stack, Code Sprint and Reaction Time.",
      },
      { property: "og:title", content: "The Arcade — Srinivas M" },
      {
        property: "og:description",
        content: "Five browser mini-games with a public leaderboard, built for no good reason.",
      },
    ],
  }),
  component: FunPage,
});

const GAME_ICONS: Record<GameId, typeof Bug> = {
  "bug-hunt": Bug,
  "snake-byte": Ghost,
  "memory-stack": Zap,
  "code-sprint": Keyboard,
  "reaction-time": Timer,
};

export function FunPage() {
  const [active, setActive] = useState<GameId>("bug-hunt");
  const [lastScore, setLastScore] = useState<number | undefined>(undefined);
  const [roast, setRoast] = useState<{ tier: string; line: string } | null>(null);
  const [idle, setIdle] = useState<string>(IDLE_TAUNTS[0]!);

  useEffect(() => {
    setIdle(pick(IDLE_TAUNTS));
    const id = window.setInterval(() => setIdle(pick(IDLE_TAUNTS)), 9000);
    return () => window.clearInterval(id);
  }, []);

  const handleGameOver = (score: number) => {
    setLastScore(score);
    setRoast(roastScore(active, score));
  };

  const handleTabChange = (gameId: GameId) => {
    setActive(gameId);
    setLastScore(undefined);
    setRoast(null);
  };

  return (
    <>
      <PageHero
        index="01"
        label="The arcade"
        lines={["Five games.", "One leaderboard."]}
        lede="A tiny arcade wired into the portfolio, because a CV should be able to waste your time too. Pick a game, chase a score, put your name up."
      >
        <Sticker tone="hog-red" rotate={-3}>
          Scores are public
        </Sticker>
      </PageHero>

      <section
        data-act="noir"
        className="act-noir grain relative overflow-hidden border-t border-border"
      >
        <div
          aria-hidden
          className="hairline-grid pointer-events-none absolute inset-0 opacity-40"
        />

        <div className="relative mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-16">
          <Reveal>
            <div className="flex flex-wrap justify-center gap-2">
              {GAMES.map((game, i) => {
                const Icon = GAME_ICONS[game.id];
                const isActive = active === game.id;
                return (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleTabChange(game.id)}
                    className={`inline-flex items-center gap-2 rounded-md border-2 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 ${
                      isActive
                        ? "border-hog-red-deep bg-hog-red-deep text-white"
                        : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{game.label}</span>
                    <span className="sm:hidden">{game.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 rounded-lg border border-border bg-card/70 p-6 sm:p-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-md border-2 border-border bg-hog-red-deep">
                  {(() => {
                    const Icon = GAME_ICONS[active];
                    return <Icon className="h-5 w-5 text-white" />;
                  })()}
                </div>
                <div className="min-w-0">
                  <h2 className="display-sm text-foreground">
                    {GAMES.find((g) => g.id === active)?.label}
                  </h2>
                  <p className="font-mono text-xs text-muted-foreground">
                    {GAMES.find((g) => g.id === active)?.description}
                  </p>
                </div>
              </div>

              <p
                key={idle}
                className="mb-6 animate-fade-in font-mono text-[11px] italic text-muted-foreground"
              >
                glitch-9000 says: “{idle}”
              </p>

              {active === "bug-hunt" && <BugHunt onGameOver={handleGameOver} />}
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
                  <p className="font-mono text-xs leading-relaxed text-foreground">{roast.line}</p>
                </div>
              )}

              <LeaderboardPanel gameId={active} lastScore={lastScore} />
            </div>
          </Reveal>

          <Reveal delay={250}>
            <div className="mt-12">
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
                    ? `context: the user just scored ${lastScore} in ${GAMES.find((g) => g.id === active)?.label}`
                    : undefined
                }
              />
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-14 text-center font-mono text-xs text-muted-foreground">
              <p className="inline-flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-hog-red" />
                Scores are public. Come back any time to beat your best.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
