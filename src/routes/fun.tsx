import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bug, Gamepad2, Ghost, Keyboard, Skull, Timer, Zap } from "lucide-react";
import { GAMES, type GameId } from "@/lib/games";
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
      { title: "Fun & Games — Srinivas M" },
      { name: "description", content: "Take a break with browser mini-games: Bug Hunt, Snake Byte, Memory Stack, Code Sprint and Reaction Time." },
      { property: "og:title", content: "Fun & Games — Srinivas M" },
      { property: "og:description", content: "Take a break with browser mini-games built by a developer, for developers." },
      { name: "twitter:card", content: "summary" },
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
    <div className="mx-auto max-w-5xl px-5 py-12 sm:py-20">
      <Reveal>
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">// break time</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Have some fun</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            A tiny arcade built into the portfolio. Pick a mini-game, chase a high score, and add your name to the leaderboard.
          </p>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {GAMES.map((game, i) => {
            const Icon = GAME_ICONS[game.id];
            const isActive = active === game.id;
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => handleTabChange(game.id)}
                className={`inline-flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-xs transition-all hover:-translate-y-0.5 ${
                  isActive
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
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
        <div className="mt-8 rounded-md border border-border bg-card p-6 sm:p-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-surface-raised">
              {(() => {
                const Icon = GAME_ICONS[active];
                return <Icon className="h-5 w-5 text-accent" />;
              })()}
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                {GAMES.find((g) => g.id === active)?.label}
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                {GAMES.find((g) => g.id === active)?.description}
              </p>
            </div>
          </div>

          <p key={idle} className="mb-6 animate-fade-in font-mono text-[11px] italic text-muted-foreground">
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
              <Skull className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p className="font-mono text-xs leading-relaxed text-foreground">{roast.line}</p>
            </div>
          )}

          <LeaderboardPanel gameId={active} lastScore={lastScore} />
        </div>
      </Reveal>

      <Reveal delay={250}>
        <div className="mt-12">
          <div className="mb-4 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">// talk to the machine</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">GLITCH-9000 will judge you</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              An AI robot with zero manners and strong opinions about your reflexes. Ask it anything. Regret it.
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
        <div className="mt-12 text-center font-mono text-xs text-muted-foreground">
          <p className="inline-flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-accent" />
            Scores are public. Come back any time to beat your best.
          </p>
        </div>
      </Reveal>

    </div>
  );
}
