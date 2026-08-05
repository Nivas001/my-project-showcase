# Horror Stories — interactive scare section

A new `/horror` section: 10 branching horror stories, each 5-10 minutes, told line by line with sound, choices and multiple endings. It gets its own visual language — blood-dark, decayed, film-grain — deliberately different from the rest of the site, and it stays walled off from the portfolio's clean look.

## The experience

1. **Entry gate** — before the library loads, a full-screen warning: "This page contains sudden sounds and disturbing imagery. Headphones recommended. Continue?" Two buttons: "I'm ready" and "Take me back". This doubles as the browser's audio-unlock gesture, so ambience can start the moment they enter.
2. **Story library** — a grid of 10 cards on a black, grainy backdrop. Each card shows title, a one-line hook, tags (possession, found footage, sleep paralysis…), fear rating in skulls, read time, endings collected (e.g. 1/3), and a global survival rate pulled from the backend. Cards breathe, flicker and shudder slightly on hover; one card occasionally glitches on its own.
3. **The reader** — the page goes near-black and the story types itself out one paragraph at a time, at a pace you can't skip past too fast. Sound rises underneath. At decision points the text stops, the ambience thins out, and 2-3 choices fade in — some with a countdown timer, so hesitating *is* a choice. Reaching an ending triggers a full-screen ending card: SURVIVED / DOOMED / WORST, what happened to you, how many others got this ending, and buttons to retry from the last decision or return to the library.

## The scare toolkit (used across all stories)

- **Typewriter pacing** with per-story rhythm; some lines land one. word. at. a. time.
- **Heartbeat** that speeds up as danger rises, and cuts to silence right before a jolt — silence is the real weapon.
- **Whisper layer**: faint, barely audible voices panned left/right at tension peaks.
- **Jump-scare stings**: screen flash, hard shake, a distorted stab of sound. Rationed — no more than 2-3 per story so they still work.
- **Breathing darkness**: a vignette that tightens as fear rises; the page literally closes in on you.
- **Flicker and grain**: CRT scanlines, film grain, occasional single-frame glyph flashes.
- **Fear meter** in the corner that climbs with your choices and drives the intensity of everything above.
- **Personal touches**: the story addresses you by the nickname you enter, references your local time ("it's 12:47am where you are"), and reacts if you switch tabs mid-story ("you looked away. it moved.").
- **Panic button** always present — kills all audio and effects instantly.

## The 10 stories

Original stories, written in the spirit of the horror that works best on the page — found footage, folk horror, possession, sleep paralysis, haunted tech, and Indian/Tamil ghost-lore. Each has 4-5 decision points and 3 endings.

1. The Last Train from Nowhere — a night train that never reaches a station.
2. 3:33 — you wake up at the same minute every night, and something is counting.
3. The Tenant Below — footsteps in an empty flat downstairs.
4. Pei Kadhai — a village road, a woman asking for a lift, an old rule you break.
5. Signal Lost — a livestream where the viewer count keeps rising after you go offline.
6. The Sleep Study — paralysis, a clipboard, and a doctor who never blinks.
7. Room 404 — a hotel floor that isn't in the elevator.
8. Backup — a photo folder filling with pictures of you asleep.
9. Well of Names — a dry well, a family list, and your name freshly carved.
10. The Sixth Passenger — a car with five seats and six shadows.

## Sound

Both approaches, combined:
- **Generated audio files** — one ambience bed per mood (rain, corridor drone, forest at night, hospital hum, static) plus a small set of stings, whispers and impacts, generated once and stored as CDN assets.
- **Web Audio synthesis** — heartbeat, breathing, low-frequency dread swells and the silence-then-stab timing, generated live so it can react instantly to fear level and choices.

A single audio engine crossfades ambience, ducks it before jolts, and respects a global mute.

## Backend

New tables:
- `horror_stories` — the story catalogue: slug, title, hook, tags, fear rating, read time, sort order. (Optional: manageable from the admin panel later.)
- `horror_endings` — an aggregate row per story+ending recording how many people reached it, so cards can show "68% did not survive".
- `horror_runs` — one row per completed run: story, ending id, nickname, choices taken, duration.

Reads are public; writes go through a public server function that validates the story/ending pair and rate-limits by IP, matching how the arcade leaderboard already works. Personal progress (endings collected, current story position) is also mirrored in localStorage so the library shows your own progress instantly.

## Technical notes

- Route `src/routes/horror.tsx` (library) and `src/routes/horror.$slug.tsx` (reader), with per-route head metadata.
- Story content lives in typed data files under `src/content/horror/*.ts` — a node graph of `text`, `pause`, `sfx`, `shake`, `choice` and `ending` beats. This keeps stories editable without touching engine code.
- `src/lib/horror/engine.ts` walks the node graph and exposes the current beat, fear level and available choices.
- `src/lib/horror/audio.ts` owns the Web Audio graph and asset playback; it is loaded client-side only.
- Horror theme is scoped to a `.horror-scope` wrapper with its own CSS variables in `src/styles.css`, so the site's Midnight Indigo tokens stay untouched everywhere else. New keyframes for grain, flicker, shudder, vignette pulse.
- Server functions in `src/lib/horror.functions.ts`: `getStoryStats`, `recordRun`.
- Full keyboard and touch support; the reader is single-column and mobile-first. `prefers-reduced-motion` disables shake and flicker, and audio never autoplays without the entry-gate click.
- Nav gets a `horror` link (styled slightly wrong on purpose).

## Build order

1. Migration for the three tables.
2. Horror theme tokens + entry gate + library page with placeholder stats.
3. Story engine, reader page, choices, endings, fear meter.
4. Audio engine (synth first), then generated ambience/sting assets.
5. Write all 10 stories.
6. Backend stats wiring and localStorage progress.

## Out of scope

- Voice narration of full stories.
- User accounts or saved profiles (nickname + local progress only).
- Images or video inside stories — text, darkness and sound only.
