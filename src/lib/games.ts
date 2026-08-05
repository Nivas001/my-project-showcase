export const GAMES = [
  { id: "bug-hunt", label: "Bug Hunt", description: "Squash the bugs before they hide again." },
  { id: "snake-byte", label: "Snake Byte", description: "Classic snake: collect data, avoid walls." },
  { id: "memory-stack", label: "Memory Stack", description: "Repeat the glowing pattern." },
  { id: "code-sprint", label: "Code Sprint", description: "Type the sentence as fast as you can." },
  { id: "reaction-time", label: "Reaction Time", description: "Click the moment it turns green." },
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
