import { GAME_CONFIG, type GameId } from "@/lib/games";

/**
 * Personal bests, kept in localStorage.
 *
 * The Supabase leaderboard answers "am I good?" — this answers "am I getting
 * better?", which is the question that actually makes someone press Play again.
 * It is deliberately local: no nickname, no network, no reason to hesitate.
 */

const KEY = "arcade.best.v1";

export type Bests = Partial<Record<GameId, number>>;

export function readBests(): Bests {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Bests;
  } catch {
    return {};
  }
}

export function readBest(game: GameId): number | undefined {
  return readBests()[game];
}

/** Returns true when the score is a new personal best. */
export function recordBest(game: GameId, score: number): boolean {
  if (typeof window === "undefined") return false;
  const all = readBests();
  const prev = all[game];
  const ascending = GAME_CONFIG[game].ascending; // lower is better (reaction time)
  const better = prev === undefined || (ascending ? score < prev : score > prev);
  if (!better) return false;
  all[game] = score;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage full or blocked */
  }
  return true;
}

const PLAYS_KEY = "arcade.plays.v1";

export function bumpPlays(game: GameId): number {
  if (typeof window === "undefined") return 0;
  try {
    const all = JSON.parse(window.localStorage.getItem(PLAYS_KEY) ?? "{}") as Record<string, number>;
    const next = (all[game] ?? 0) + 1;
    all[game] = next;
    window.localStorage.setItem(PLAYS_KEY, JSON.stringify(all));
    return next;
  } catch {
    return 0;
  }
}

export function readPlays(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(PLAYS_KEY) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}
