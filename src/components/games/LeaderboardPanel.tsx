import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Crown, Loader2, Medal, RefreshCw, Trophy } from "lucide-react";
import { leaderboardQuery } from "@/lib/queries";
import { GAMES, GAME_CONFIG, type GameId, formatScore } from "@/lib/games";
import { submitScore } from "@/lib/games.functions";
import { SUBMIT_TAUNTS, pick } from "@/lib/taunts";
import { useArcadeAudio } from "@/lib/arcade/use-arcade-audio";

/* ==========================================================================
 * LEADERBOARD
 *
 * Reads the top ten for a game from Supabase and writes a run back to it.
 *
 * The one thing it now does that it did not before: it tells you where your
 * run would have landed BEFORE you type a nickname. "You'd be 4th" is the
 * reason to submit; "submit score" on its own is a form.
 * ======================================================================== */

const NICK_KEY = "arcade.nickname";

export function LeaderboardPanel({
  gameId,
  lastScore,
}: {
  gameId: GameId;
  lastScore?: number | undefined;
}) {
  const audio = useArcadeAudio();
  const { data, isLoading, error, refetch, isFetching } = useQuery(leaderboardQuery(gameId));
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const game = GAMES.find((g) => g.id === gameId)!;
  const cfg = GAME_CONFIG[gameId];

  // A nickname typed once is remembered, so a second submission is one click.
  useEffect(() => {
    try {
      setNickname(window.localStorage.getItem(NICK_KEY) ?? "");
    } catch {
      /* storage blocked */
    }
  }, []);

  // A fresh run is a fresh submission — clear the previous confirmation.
  useEffect(() => {
    setSubmitted(null);
    setSubmitError(null);
  }, [lastScore, gameId]);

  /** 1-based position this score would take in the current top ten. */
  const wouldRank = (() => {
    if (lastScore === undefined || !data) return null;
    const better = data.filter((row) =>
      cfg.ascending ? row.score <= lastScore : row.score >= lastScore,
    ).length;
    return better + 1;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lastScore === undefined) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitScore({ data: { game: gameId, nickname: nickname.trim(), score: lastScore } });
      try {
        window.localStorage.setItem(NICK_KEY, nickname.trim());
      } catch {
        /* storage blocked */
      }
      setSubmitted(pick(SUBMIT_TAUNTS));
      audio.play("highscore");
      void refetch();
    } catch (err) {
      audio.play("error");
      setSubmitError(err instanceof Error ? err.message : "Could not submit score.");
    } finally {
      setSubmitting(false);
    }
  };

  const rankMark = (i: number) => {
    if (i === 0) return <Crown className="h-3.5 w-3.5 text-hog-yellow" />;
    if (i === 1) return <Medal className="h-3.5 w-3.5 text-foreground/60" />;
    if (i === 2) return <Medal className="h-3.5 w-3.5 text-hog-orange" />;
    return <span className="tabular-nums opacity-50">{i + 1}</span>;
  };

  return (
    <div className="mt-8 rounded-lg border-2 border-border bg-card/70 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-hog-red">
          <Trophy className="h-4 w-4" /> {game.label} — world top 10
        </h3>
        <button
          type="button"
          onClick={() => void refetch()}
          aria-label="Refresh leaderboard"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading scores…
        </div>
      )}

      {error && !isLoading && (
        <div className="mt-4 flex items-start gap-2 font-mono text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Could not reach the leaderboard. Your score is safe locally.
        </div>
      )}

      {!isLoading && !error && (
        <ol className="mt-4 space-y-px overflow-hidden rounded-md border border-border">
          {(data?.length ?? 0) === 0 ? (
            <li className="bg-surface-raised px-4 py-6 text-center font-mono text-xs text-muted-foreground">
              Nobody has played this one yet. The first score is the record.
            </li>
          ) : (
            data?.map((row, i) => (
              <li
                key={row.id}
                className={`flex items-center gap-3 px-4 py-2.5 font-mono text-sm ${
                  i === 0 ? "bg-hog-yellow/10" : "bg-surface-raised"
                }`}
              >
                <span className="grid w-5 shrink-0 place-items-center text-xs">{rankMark(i)}</span>
                <span className="min-w-0 flex-1 truncate text-foreground">{row.nickname}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {formatScore(gameId, row.score)}
                </span>
              </li>
            ))
          )}
        </ol>
      )}

      {lastScore !== undefined && !submitted && (
        <form onSubmit={handleSubmit} className="mt-5 border-t-2 border-border/40 pt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              your run:{" "}
              <span className="font-bold text-foreground">{formatScore(gameId, lastScore)}</span>
            </p>
            {wouldRank !== null ? (
              <p className="font-mono text-[11px] text-hog-red">
                {wouldRank <= 10
                  ? `that's #${wouldRank} on the board`
                  : "not a top-ten run — put it up anyway"}
              </p>
            ) : null}
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="nickname"
              aria-label="Nickname for the leaderboard"
              className="flex-1 rounded-sm border-2 border-border bg-background px-3 py-2.5 font-mono text-sm outline-none transition-colors focus:border-hog-red"
            />
            <button
              type="submit"
              disabled={!nickname.trim() || submitting}
              className="rounded-sm bg-hog-red-deep px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
            >
              {submitting ? "Saving…" : "Put it up"}
            </button>
          </div>
        </form>
      )}

      {submitError && <p className="mt-2 font-mono text-xs text-destructive">{submitError}</p>}

      {submitted && (
        <p className="mt-5 animate-fade-in border-t-2 border-border/40 pt-5 font-mono text-xs text-game-go">
          On the board. {submitted}
        </p>
      )}
    </div>
  );
}
