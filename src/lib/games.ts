export const GAMES = [
  {
    id: "bug-hunt",
    label: "Bug Hunt",
    description: "Chain hits for a multiplier. Never swing at a prod deploy.",
    /** One line of "how do I get good", shown under the cabinet title. */
    tip: "Combos are worth more than speed — four in a row doubles every hit.",
  },
  {
    id: "deploy-dash",
    label: "Deploy Dash",
    description: "Run the pipeline. Jump failing tests, duck merge conflicts.",
    tip: "Holding duck in mid-air drops you fast. It is the only way out of a bad jump.",
  },
  {
    id: "snake-byte",
    label: "Snake Byte",
    description: "Collect bytes, dodge memory blocks, survive the speed-up.",
    tip: "Gold cache bytes are worth five and cut three segments off your tail.",
  },
  {
    id: "memory-stack",
    label: "Memory Stack",
    description: "Repeat the pattern. Every tile has its own note.",
    tip: "Close your eyes and learn the tune — it holds far longer than the picture.",
  },
  {
    id: "code-sprint",
    label: "Code Sprint",
    description: "Type real code against the clock. Scored on net WPM.",
    tip: "Accuracy beats speed: a wrong character is worth less than no character.",
  },
  {
    id: "reaction-time",
    label: "Reaction Time",
    description: "Five rounds. Tap the instant it turns green.",
    tip: "Jumping early replays the round, so there is no reason to guess.",
  },
] as const;

export type GameId = (typeof GAMES)[number]["id"];

export type GameScore = {
  id: string;
  game: string;
  nickname: string;
  score: number;
  created_at: string;
};

export function isGameId(value: string): value is GameId {
  return GAMES.some((game) => game.id === value);
}

export const GAME_CONFIG: Record<
  GameId,
  { unit: string; ascending: boolean; maxScore: number }
> = {
  "bug-hunt": { unit: "bugs", ascending: false, maxScore: 9999 },
  "deploy-dash": { unit: "pts", ascending: false, maxScore: 999999 },
  "snake-byte": { unit: "bytes", ascending: false, maxScore: 9999 },
  "memory-stack": { unit: "level", ascending: false, maxScore: 999 },
  "code-sprint": { unit: "wpm", ascending: false, maxScore: 9999 },
  "reaction-time": { unit: "ms", ascending: true, maxScore: 99999 },
};

export function formatScore(gameId: GameId, score: number) {
  const cfg = GAME_CONFIG[gameId];
  const prefix = gameId === "reaction-time" ? "" : "score: ";
  return `${prefix}${score}${cfg.unit ? ` ${cfg.unit}` : ""}`;
}
