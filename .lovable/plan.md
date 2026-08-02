## Which photo fits better

**The Batman-hoodie photo (`20210711085659_IMG_7302_Custom.jpg`)** is the better fit.

- Black hoodie sits naturally on the Midnight Indigo dark background; the beach photo's red shirt + white trousers + bright sky fight the palette.
- It's a chest-up, friendly, front-facing pose — ideal for a hero portrait crop.
- The beach shot is a full-body wide frame; cut out, the figure would be tiny or need heavy cropping.

The pink-flower background gets removed, so only the subject remains.

## What I'll build

Turn the home hero into a two-column layout on desktop, single column on mobile.

```text
desktop (lg+)                    mobile
+---------------------+------+   +-------------+
| whoami / terminal   |      |   |  portrait   |
| Srinivas M.         | PIC  |   +-------------+
| role + summary      |      |   | terminal    |
| buttons + links     |      |   | text, etc.  |
+---------------------+------+   +-------------+
```

Treatment of the portrait so it reads as part of the theme, not a pasted snapshot:
- Background removed → transparent PNG.
- Slight indigo/accent color grade so skin and hoodie sit in the palette.
- Soft radial indigo glow behind the figure, plus the same faint grid/scanline texture used elsewhere.
- Thin bordered frame with a mono corner label (e.g. `./srinivas.png`) matching the terminal aesthetic.
- Fades out at the bottom into the background rather than a hard cut.

Nothing else on the page changes — stats, selected work, footer stay as they are.

## Technical notes

- Run the uploaded image through background removal into a transparent PNG, register it via `lovable-assets`, import the pointer in `src/routes/index.tsx`.
- Hero `<section>` becomes `grid lg:grid-cols-[1.2fr_0.8fr]`; existing content moves into the first column unchanged.
- Glow/grade uses existing tokens (`--glow`, `--shadow-glow`, `scanlines`) — no hardcoded colors.
- Image gets descriptive `alt` text and `fetchpriority="high"`; no new dependencies.
