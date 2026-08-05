import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Loader2, AlertCircle } from "lucide-react";
import { leaderboardQuery } from "@/lib/queries";
import { GAMES, type GameId, formatScore } from "@/lib/games";
import { submitScore } from "@/lib/games.functions";
import { SUBMIT_TAUNTS, pick } from "@/lib/taunts";

export function LeaderboardPanel({ gameId, lastScore }: { gameId: GameId; lastScore?: number | undefined }) {
  const { data, isLoading, error, refetch } = useQuery(leaderboardQuery(gameId));
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const game = GAMES.find((g) => g.id === gameId)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lastScore === undefined) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitScore({ data: { game: gameId, nickname: nickname.trim(), score: lastScore } });
      setSubmitted(pick(SUBMIT_TAUNTS));
      setNickname("");
      refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit score.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 rounded-md border border-border bg-card p-5">
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent">
        <Trophy className="h-4 w-4" /> {game.label} leaderboard
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading scores...
        </div>
      )}

      {error && !isLoading && (
        <div className="mt-4 flex items-start gap-2 font-mono text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> Could not load leaderboard.
        </div>
      )}

      {!isLoading && !error && (
        <div className="mt-4 overflow-hidden rounded-md border border-border">
          <table className="w-full text-left font-mono text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Nick</th>
                <th className="px-3 py-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {(data?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-xs text-muted-foreground">
                    No scores yet. Be the first!
                  </td>
                </tr>
              ) : (
                data?.map((row, i) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-3 py-2 text-accent">{i + 1}</td>
                    <td className="px-3 py-2">{row.nickname}</td>
                    <td className="px-3 py-2 text-right">{formatScore(gameId, row.score)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {lastScore !== undefined && !submitted && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Your last score: {formatScore(gameId, lastScore)}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="nickname"
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={!nickname.trim() || submitting}
            className="rounded-sm bg-primary px-4 py-2 font-mono text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Submit score"}
          </button>
        </form>
      )}

      {submitError && (
        <p className="mt-2 font-mono text-xs text-destructive">{submitError}</p>
      )}

      {submitted && (
        <p className="mt-2 animate-fade-in font-mono text-xs text-accent">Score saved. {submitted}</p>
      )}
    </div>
  );
}
