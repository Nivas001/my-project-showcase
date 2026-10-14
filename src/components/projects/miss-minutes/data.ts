import type { Mood } from "./Character";

/**
 * Content for the Miss Minutes case study: scripted turns for the demo,
 * the pipeline and the assistant spec. Skill names, routes and timings come
 * from the assistant's own repo (model/Modelfile, router.py, latency checks),
 * so the demo walks the same path the real request would.
 */

export type Tier = "rules" | "local" | "cloud";

export const TIERS: Record<
  Tier,
  { name: string; engine: string; when: string; speed: string; tone: string }
> = {
  rules: {
    name: "Rules",
    engine: "regex router · router.py",
    when: "Time, date, timers, volume, apps — anything with a fixed shape",
    speed: "≈ 0.01 s measured",
    tone: "#30d158",
  },
  local: {
    name: "Local brain",
    engine: "Qwen3-1.7B on Ollama · GPU",
    when: "Loose phrasing that still maps to a skill, and small talk",
    speed: "under a second when warm",
    tone: "#ffb347",
  },
  cloud: {
    name: "Cloud brain",
    engine: "Gemini via Antigravity CLI",
    when: "Anything that needs knowledge, writing, or memory of you",
    speed: "≈ 4 s warm · 16 s cold, measured",
    tone: "#8ab4ff",
  },
};

export type Turn = {
  id: string;
  /** What you say. */
  heard: string;
  tier: Tier;
  /** Skill call(s) the brain picks, as they'd appear in its JSON. */
  actions?: string[];
  /** What she says back. A function gets fresh values (e.g. the clock). */
  reply: string | (() => string);
  /** A shell command that needs approval first. */
  confirm?: string;
  /** Pose while the action runs. */
  doing?: Mood;
  /** A short note on why this tier handled it. */
  why: string;
};

const clock = () =>
  new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s/g, " ");

export const TURNS: Turn[] = [
  {
    id: "time",
    heard: "Hey Minutes, what's the time?",
    tier: "rules",
    actions: ["tell_time()"],
    reply: () => `It's ${clock()}, hon. Right on time.`,
    doing: "acting",
    why: "A fixed-shape question. The regex router answers it before any model wakes up.",
  },
  {
    id: "tunes",
    heard: "Crank the tunes up a bit",
    tier: "local",
    actions: ['volume("up")'],
    reply: "Turned it up for ya!",
    doing: "acting",
    why: "No rule says “crank the tunes”. The local model maps it to the volume skill and returns JSON.",
  },
  {
    id: "anirudh",
    heard: "Throw on some Anirudh",
    tier: "local",
    actions: ['play_artist("anirudh")'],
    reply: "Playing Anirudh on Spotify. Enjoy!",
    doing: "acting",
    why: "Casual wording, clear intent. The local brain picks play_artist with the name from your words.",
  },
  {
    id: "focus",
    heard: "Start a 25 minute focus session",
    tier: "rules",
    actions: ['start_focus("25")'],
    reply: "Focus is on. Notifications are quiet for 25 minutes. You've got this.",
    doing: "acting",
    why: "A rule with a number in it. Do Not Disturb turns on through KDE, and a countdown appears on the widget.",
  },
  {
    id: "combo",
    heard: "Kill Spotify and lock the screen",
    tier: "local",
    actions: ['close_app("spotify")', "lock_screen()"],
    reply: "Spotify's closed, and I'm locking up. See you soon!",
    doing: "acting",
    why: "Two requests joined by “and”. The local brain returns both skill calls, in order.",
  },
  {
    id: "sky",
    heard: "Why is the sky blue?",
    tier: "cloud",
    reply:
      "Sunlight scatters off air molecules, and blue light scatters the most because its wavelength is short. So blue reaches your eyes from every direction.",
    why: "It needs knowledge, not a skill. The local brain hands it to Gemini, through a warm Antigravity session.",
  },
  {
    id: "remember",
    heard: "My brother Arun loves cricket",
    tier: "cloud",
    reply: "Noted! Arun's a cricket fan. I'll remember that.",
    why: "Personal facts go to the cloud brain, which extracts them into the local memory file.",
  },
  {
    id: "shell",
    heard: "Clear out my Downloads folder",
    tier: "cloud",
    confirm: "rm -rf ~/Downloads/*",
    reply: "",
    why: "No skill does this, so the cloud brain proposes a shell command. It never runs without an explicit yes.",
  },
];

/** A tiny, honest stand-in for the router, for whatever you type. */
export function routeTyped(text: string): Turn {
  const t = text.toLowerCase();
  const base = { id: `typed-${Date.now()}`, heard: text.trim() };
  if (/\b(time|o'?clock)\b/.test(t)) return { ...TURNS[0]!, ...base };
  if (/\b(date|today|day is it)\b/.test(t))
    return {
      ...base,
      tier: "rules",
      actions: ["tell_date()"],
      doing: "acting",
      reply: () =>
        `Today's ${new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}.`,
      why: "“What is today?” and its variants are routed locally. They used to fall through to the cloud, which was slow.",
    };
  if (/\b(louder|volume|quieter|mute)\b/.test(t))
    return {
      ...TURNS[1]!,
      ...base,
      actions: [
        /quiet|down|lower/.test(t)
          ? 'volume("down")'
          : /mute/.test(t)
            ? 'volume("mute")'
            : 'volume("up")',
      ],
    };
  if (/\b(play|song|music|spotify)\b/.test(t))
    return {
      ...base,
      tier: "local",
      actions: [
        `play_song("${text.replace(/.*\b(play|put on)\s+/i, "").slice(0, 40) || "liked songs"}")`,
      ],
      doing: "acting",
      reply: "Coming right up on Spotify!",
      why: "Music requests map to the Spotify skills. The local brain pulls the title out of your words.",
    };
  if (/\b(joke|laugh|funny)\b/.test(t))
    return {
      ...base,
      tier: "local",
      actions: ["joke()"],
      doing: "acting",
      reply: "Why did the clock get sent to the principal? It tocked too much in class!",
      why: "“Make me laugh” has no fixed shape. The local brain picks the joke skill.",
    };
  if (/\b(remind|timer)\b/.test(t))
    return {
      ...base,
      tier: "rules",
      actions: [
        'remind("10 minutes|' + (text.replace(/.*\bto\s+/i, "").slice(0, 30) || "that") + '")',
      ],
      doing: "acting",
      reply: "Reminder set. I'll give you a nudge.",
      why: "Reminders are saved to disk, so they survive a reboot.",
    };
  if (/^(hi|hey|hello|yo|thanks|thank you)\b/.test(t))
    return {
      ...base,
      tier: "local",
      reply: "Well hey there! Just tickin' along. What can I do for ya?",
      why: "Small talk is the local brain's job. It answers in character, without calling the cloud.",
    };
  return {
    ...base,
    tier: "cloud",
    reply:
      "That one's for my cloud brain. This page can't reach it, but on the desktop I'd look it up and answer in a few seconds.",
    why: "Anything that needs facts, writing or reasoning goes to Gemini. This page is a demo, so it stops here honestly.",
  };
}

/** What she says about each part of the page, for the companion who follows you down it. */
export const SECTION_LINES: Record<string, { line: string; mood: Mood }> = {
  meet: { line: "Go on, tap a request. I'll show you what happens.", mood: "speaking" },
  how: { line: "This is how I think. Three brains, actually!", mood: "thinking" },
  assistant: { line: "Everything under my hood, hon.", mood: "speaking" },
  overview: { line: "The long version, for the readers.", mood: "idle" },
  features: { line: "My favourite party tricks.", mood: "acting" },
  decisions: { line: "The tough calls Srinivas made building me.", mood: "confirm" },
  screens: { line: "My good side. All eight moods of it.", mood: "speaking" },
};

export const QUIPS = [
  "Tick-tock! That tickles.",
  "I'm a clock, sugar. Pokin' me won't make time go faster.",
  "Careful, I bruise like a peach.",
  "Right on schedule!",
  "Say “Hey Minutes” on Srinivas's desktop and I'll answer for real.",
];

export const STATUS: Record<Mood, string> = {
  idle: "Ready when you are",
  listening: "Listening to you",
  thinking: "Putting it together",
  speaking: "A little something for you",
  acting: "Making it happen",
  confirm: "Your approval needed",
  sad: "That didn't go to plan",
  sleeping: "Taking a little rest",
};

export const BUBBLE_LABEL: Partial<Record<Mood, string>> = {
  listening: "Listening",
  thinking: "Thinking",
  confirm: "Your call",
};
