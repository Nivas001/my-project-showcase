## Easter egg: `/surprise`

Remove the hero portrait from the home page and move it behind a secret, unlinked route where the user smashes a frame to reveal it.

### Home page
- Delete `<HeroPortrait />` from `src/routes/index.tsx`; hero returns to a single full-width column (drop the `lg:grid-cols-[1.15fr_0.85fr]` split and the `order-*` wrappers).
- Keep everything else (terminal intro, stats, selected work) untouched.

### New route `/surprise`
Not linked anywhere in nav, footer, or sitemap. `head()` sets a neutral title plus `robots: noindex, nofollow` so it stays a secret.

```text
+--------------------------------------------+
|            // access: restricted           |
|                                            |
|        +------------------------+          |
|        |                        |          |
|        |   dark covered frame   |   <- click to hit
|        |     (cracks build)     |          |
|        +------------------------+          |
|                                            |
|      [ hammer follows cursor ]             |
|   drag the hammer... then strike           |
+--------------------------------------------+
```

### Interaction (Leo interval-scene style)
1. A hammer rests at the bottom of the screen with a mono hint: `pick up the hammer`.
2. Clicking/tapping the hammer picks it up — it then follows the cursor (on touch, follows finger), tilted, with a subtle idle sway.
3. Left-clicking the frame swings the hammer down, plays an impact: screen shake, radial shockwave ring, indigo spark particles from the impact point, and a crack that spreads from where you hit.
4. Three hits total. Each hit adds more cracks and brightens what's behind the glass; the frame's cover gets progressively more shattered.
5. On the third hit the cover shatters — glass shards fly outward and fall with gravity while the portrait fades/scales in behind them with an indigo glow bloom, and a typed line appears: `it's me.`
6. After the reveal, a mono `// reset` button lets you smash it again.

Everything is keyboard-accessible too: the frame is a real button, Enter/Space counts as a hit, and the whole sequence respects `prefers-reduced-motion` (instant crack stages, no shake or particles).

### Styling
All indigo/midnight tokens already in `src/styles.css` — glow, scanlines, grid lines, mono labels. No new colors, no purple. No new dependencies; cracks are inline SVG paths, shards and sparks are CSS-transformed divs.

### Technical notes
- New files: `src/routes/surprise.tsx` (route + `createFileRoute("/surprise")`) and `src/components/SmashFrame.tsx` (all interaction state).
- `src/components/HeroPortrait.tsx` is deleted; the portrait asset pointer `src/assets/portrait.png.asset.json` is reused by the reveal, and the existing wave/bubble animation plays after the shatter.
- New keyframes (shake, shard-fly, spark, shockwave, reveal-bloom) get appended to `src/styles.css` next to the existing hero keyframes.
- Shards are generated as CSS `clip-path` polygons over a copy of the cover, so no image slicing is needed.
