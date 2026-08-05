# Fun Page / Games Hub

Build a new `/fun` route that feels like a mini arcade hidden inside the portfolio. Keep the Midnight Indigo terminal aesthetic, but make the games accessible to anyone — no developer knowledge required. Add a backend leaderboard so visitors can leave their score with a nickname.

## What we build

1. **New route** `src/routes/fun.tsx` plus a **fun** nav link in `src/routes/__root.tsx`.
2. **Game hub landing**: choose from five mini games, each in its own card with a short description and best score preview.
3. **Five web-based games**:
   - **Bug Hunt** — Whack-a-bug style: bugs pop up on a grid; tap them before they disappear. Fastest 60 seconds wins.
   - **Snake Byte** — Classic snake with a keyboard / touch D-pad; collect glowing data packets and avoid the walls.
   - **Memory Stack** — Simon-style pattern memory: a grid of cells flashes in order; repeat the sequence. Each level adds one more step.
   - **Code Sprint** — Typing race. A random tech-agnostic sentence (not actual code) appears; type it as fast and accurately as possible. WPM + accuracy score.
   - **Reaction Time** — Screen turns from red to green; tap/click as fast as you can. Best of 5 attempts.
4. **Per-game scoring**:
   - Bug Hunt: bugs caught in 60 seconds.
   - Snake Byte: length / food eaten.
   - Memory Stack: highest level reached.
   - Code Sprint: WPM + accuracy combined score.
   - Reaction Time: average reaction time in milliseconds (lower is better).
5. **Leaderboard backend**:
   - New `public.game_scores` table: `id`, `game`, `nickname`, `score`, `created_at`.
   - Public SELECT policy so anyone can see top scores.
   - Score submission via a public `createServerFn` that validates the score, nickname, and game, then inserts with a service-role client after rate-limiting by IP (e.g., max 5 submissions per game per IP per day).
6. **Leaderboard UI** inside each game modal/page: top 10 scores for that game, nickname, score, and time.

## Database migration

Create `public.game_scores` with:

```sql
CREATE TABLE public.game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game text NOT NULL,
  nickname text NOT NULL,
  score integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.game_scores TO anon;
GRANT SELECT ON public.game_scores TO authenticated;
GRANT ALL ON public.game_scores TO service_role;

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game scores are publicly readable" ON public.game_scores
FOR SELECT TO public USING (true);
```

Score insertion is done through a server function to enforce rate limiting and score validation, so there is no direct INSERT policy for anon or authenticated.

## UI plan

- `/fun` hub: hero title, animated grid of game cards, one-click launch per game.
- Each game is rendered in a full-width panel inside `/fun` (no separate route needed for MVP). Use tabs or a picker to switch games.
- Game over overlay shows final score, leaderboard for that game, and a prompt to enter a nickname and submit.
- Mobile-first controls: on-screen D-pad for Snake, large touch targets for Bug Hunt and Memory, virtual keyboard for Code Sprint, full-screen tap for Reaction Time.
- Animations: use existing `Reveal`, `animate-fade-in-up`, `glow-card`, and `glare-swipe` utilities. Add game-specific keyframes (bug pop, snake pulse, memory flash) in `src/styles.css`.

## Server functions

- `getLeaderboard(game)` — returns top 10 scores for one game, ordered by score descending (or ascending for Reaction Time).
- `submitScore({ game, nickname, score })` — validates input, applies rate limit by `getRequestIP()`, and inserts the row using the admin client.

## Files to create / modify

- Create `src/routes/fun.tsx`
- Create `src/components/games/BugHunt.tsx`
- Create `src/components/games/SnakeByte.tsx`
- Create `src/components/games/MemoryStack.tsx`
- Create `src/components/games/CodeSprint.tsx`
- Create `src/components/games/ReactionTime.tsx`
- Create `src/lib/games.functions.ts`
- Create `src/lib/games.ts` (leaderboard query option)
- Update `src/routes/__root.tsx` navLinks
- Update `src/styles.css` with game keyframes
- Add database migration

## Out of scope

- Multiplayer / real-time battles.
- Persistent per-visitor profiles (anonymous scores only).
- Sound effects (can be added later).
- Game AI / progressive difficulty beyond built-in levels.

## Success criteria

- `/fun` is reachable from the nav.
- All five games are playable on desktop and mobile.
- Leaderboard displays top scores for each game.
- Score submission validates nickname length and prevents duplicate spam via IP rate limiting.
- Visual style matches the existing Midnight Indigo terminal theme.
