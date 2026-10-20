# Showreel

The 75-second video on `/about` (the Showreel section), built as code with
[Remotion](https://remotion.dev). All sound design and the score are synthesised by
`audio/build.py`, with no samples or stock audio. Every cue comes from `src/timeline.json`,
the same file that times the scenes, so picture and sound stay in sync.

This is a separate project from the site. It has its own `package.json` and is not part of the site build.

## Setup

```sh
cd showreel
npm install
python3 -m venv .venv && .venv/bin/pip install numpy scipy
```

## Edit

- Project copy, screenshots and stack: `src/projects.ts` (images in `public/media/`)
- Scenes: `src/scenes/*`. If you change a scene's local timing constants, mirror them at the top of `audio/build.py`.
- Preview in the browser: `npm run studio`

## Render and publish to the site

```sh
.venv/bin/python audio/build.py                      # -> public/audio/score.wav (-16 LUFS)
npx remotion render Reel out/reel-master.mp4 --audio-codec=aac --audio-bitrate=256k

# Web encodes. Fedora's system ffmpeg has no libx264, so use the one Remotion bundles.
export LD_LIBRARY_PATH=$PWD/node_modules/@remotion/compositor-linux-x64-gnu
FF=$LD_LIBRARY_PATH/ffmpeg; D=../public/media/showreel
$FF -y -i out/reel-master.mp4 -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 192k $D/showreel-1080p.mp4
$FF -y -i out/reel-master.mp4 -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 160k $D/showreel-720p.mp4
$FF -y -ss 9.2 -i out/reel-master.mp4 -frames:v 1 -vf scale=1600:-1 -q:v 3 $D/showreel-poster.jpg
```

## The "Desk OS" cut (`DeskReel`)

A second, 2:12 reel in a light paper theme: a beige retro Mac boots and ships, a blue stripe
wipe opens the title, the six live products slide in as paper sheets under a macOS menu bar,
the side builds sit on a desk canvas the camera pans across, then research, the stack, and a
sign-off back on the Mac.

- Source: `src/desk/` (timing in `src/desk/timeline.json`, copy in `src/desk/data.ts`)
- Score and sound: `audio/build_desk.py` (reuses the DSP in `audio/build.py`)

```sh
.venv/bin/python audio/build_desk.py                 # -> public/audio/score-desk.wav
npx remotion render DeskReel out/reel-desk.mp4 --audio-codec=aac --audio-bitrate=256k
```
