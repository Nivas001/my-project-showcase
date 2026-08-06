# Horror choice timing + mobile nav menu

## 1. More time to choose in horror stories

Right now each choice uses a short per-story countdown (6-12s) and it starts the moment the choice appears, so it can run down while the text is still revealing.

Changes in the story reader:
- Every choice gets a 3 minute (180s) window instead of the short story-defined timers.
- The countdown only starts once the text beats for that scene have finished appearing, so reading time never eats into decision time.
- The thin red bar keeps working, plus a small mm:ss readout so it's clear how long is left.
- Timing out still auto-picks the first option and spikes fear, as today.

## 2. Mobile / tablet navbar

The header currently prints all six links inline, which cramps and overflows on phones and tablets.

- Below the `lg` breakpoint the links collapse into a hamburger (three-line) button on the right.
- Tapping it opens a full-width menu panel that slides/fades down under the header, with the links staggering in one by one.
- The icon morphs between hamburger and X; the panel closes on link tap, on Escape, and when the route changes. Background scroll locks while it's open.
- Desktop (`lg` and up) keeps the exact inline nav it has now. The command palette button stays reachable in both layouts.

## Technical notes

- `src/routes/horror.$slug.tsx`: add a `CHOICE_SECONDS = 180` constant used in place of `choice.timer` for both the interval and the bar width; gate the countdown effect on a "beats finished" flag already tracked by the player loop.
- `src/routes/__root.tsx`: extract nav rendering in `SiteHeader`, add `open` state, mobile panel markup with existing `animate-fade-in` / stagger delays, `lg:hidden` / `hidden lg:flex` switching.
