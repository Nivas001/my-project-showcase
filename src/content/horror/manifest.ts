import type { Ambience, Beat, Story, StoryKind, StoryLang } from "@/lib/horror/types";

/**
 * ============================================================================
 * THE STORY INDEX
 * ============================================================================
 *
 * Every story's metadata, and nothing else. No beats, no branches, no prose.
 *
 * This file exists because of where the prose was ending up. The reader route
 * resolved the story inside its `loader`, and a TanStack Start route splits its
 * component but not its loader — so `getStory()` pulled the whole library into
 * the part of the bundle that is not split, and every visitor to the homepage
 * downloaded sixteen horror stories they had not asked for. With six new
 * stories added that was over 200KB of prose on the first paint of every page.
 *
 * The split now is: metadata is eager and small enough to be free; a story's
 * branches are fetched when somebody opens that story, and only that one.
 *
 * `content/horror/index.ts` still imports every story eagerly. It is used by
 * nothing but a development-time consistency check, so it never reaches a
 * production bundle.
 */

export type StoryMeta = {
  slug: string;
  title: string;
  hook: string;
  tags: string[];
  /** 1-5 skulls */
  fear: number;
  minutes: string;
  ambience: Ambience;
  endings: number;
  lang: StoryLang;
  kind: StoryKind;
  tapeLabel?: string;
  tapeScene?: "corridor" | "shore";
};

export const STORY_INDEX: StoryMeta[] = [
  {
    slug: "tape-corridor-3b",
    title: "Tape 07 — Corridor 3B",
    hook: "Recovered footage from a decommissioned hospital wing. Four minutes of corridor. Three people went in.",
    tags: ["found footage", "hospital", "tape"],
    fear: 5,
    minutes: "6-8 min",
    ambience: "tape",
    endings: 4,
    lang: "english",
    kind: "tape",
    tapeLabel: "3B-07 · 04:11 · 1998",
  },
  {
    slug: "hostel-block-c",
    title: "Block C, Room 13",
    hook: "Hostel-la 3 AM-ku mela nobody walks in the corridor. Today somebody is. And they're counting doors.",
    tags: ["tanglish", "hostel", "college"],
    fear: 4,
    minutes: "8-10 min",
    ambience: "hostel",
    endings: 4,
    lang: "tanglish",
    kind: "read",
  },
  {
    slug: "night-shift",
    title: "The Night Shift",
    hook: "A rollback you didn't trigger. A commit you didn't write. You are the only one badged into the building.",
    tags: ["tech horror", "on-call", "one location"],
    fear: 4,
    minutes: "8-10 min",
    ambience: "corridor",
    endings: 4,
    lang: "english",
    kind: "read",
  },
  {
    slug: "tape-kadaloram",
    title: "Tape 19 — Kadaloram",
    hook: "Night shoot. Empty beach. Oru meenavar warning kuduthaaru — 'thanni-kitta poga koodadhu'. Camera-la rendu per irundhaanga.",
    tags: ["tanglish", "found footage", "coast"],
    fear: 5,
    minutes: "6-8 min",
    ambience: "tape",
    endings: 4,
    lang: "tanglish",
    kind: "tape",
    tapeLabel: "KDL-19 · 03:58 · REC",
    tapeScene: "shore",
  },
  {
    slug: "nalla-neram",
    title: "Nalla Neram",
    hook: "Auto-la night shift. 3 AM to 3:30 AM sawari eduka koodadhu — ellarukkum theriyum. Inniki oruthan kai kaatraan.",
    tags: ["tanglish", "night road", "chennai"],
    fear: 5,
    minutes: "7-9 min",
    ambience: "street",
    endings: 4,
    lang: "tanglish",
    kind: "read",
  },
  {
    slug: "thirteen-steps",
    title: "Thirteen Steps",
    hook: "Your grandmother's staircase has twelve steps. You have counted them your whole life. Tonight you are on the thirteenth.",
    tags: ["house", "counting", "slow dread"],
    fear: 5,
    minutes: "7-9 min",
    ambience: "rain",
    endings: 4,
    lang: "english",
    kind: "read",
  },
  {
    slug: "last-train",
    title: "The Last Train from Nowhere",
    hook: "You board the 11:52. It never reaches a station.",
    tags: ["liminal", "night travel", "slow dread"],
    fear: 4,
    minutes: "6-8 min",
    ambience: "engine",
    endings: 3,
    lang: "english",
    kind: "read",
  },
  {
    slug: "pei-kadhai",
    title: "Pei Kadhai",
    hook: "A village road at midnight. A woman asking for a lift. One old rule you were told never to break.",
    tags: ["folk horror", "roadside", "tamil ghost lore"],
    fear: 5,
    minutes: "6-8 min",
    ambience: "forest",
    endings: 3,
    lang: "english",
    kind: "read",
  },
  {
    slug: "three-thirty-three",
    title: "3:33",
    hook: "You wake at the same minute every night. Something is counting down.",
    tags: ["sleep", "possession", "countdown"],
    fear: 5,
    minutes: "6-8 min",
    ambience: "hospital",
    endings: 3,
    lang: "english",
    kind: "read",
  },
  {
    slug: "ward-nine",
    title: "Ward Nine",
    hook: "Night duty on a closed ward. Nine beds. Nine charts. Ten patients.",
    tags: ["hospital", "night duty", "counting"],
    fear: 5,
    minutes: "6-8 min",
    ambience: "hospital",
    endings: 3,
    lang: "english",
    kind: "read",
  },
  {
    slug: "tenant-below",
    title: "The Tenant Below",
    hook: "The flat downstairs has been empty for two years. Someone is moving furniture at night.",
    tags: ["apartment", "slow build", "neighbour"],
    fear: 4,
    minutes: "5-7 min",
    ambience: "corridor",
    endings: 3,
    lang: "english",
    kind: "read",
  },
  {
    slug: "room-404",
    title: "Room 404",
    hook: "The hotel has no fourth floor. Your key card says 404.",
    tags: ["hotel", "liminal", "lost"],
    fear: 4,
    minutes: "5-7 min",
    ambience: "corridor",
    endings: 3,
    lang: "english",
    kind: "read",
  },
  {
    slug: "signal-lost",
    title: "Signal Lost",
    hook: "You are the only operator at a relay station in the hills. At 1am, something starts answering.",
    tags: ["isolation", "radio", "night shift"],
    fear: 4,
    minutes: "5-7 min",
    ambience: "static",
    endings: 3,
    lang: "english",
    kind: "read",
  },
  {
    slug: "nine-oclock-tape",
    title: "The Nine O'Clock Tape",
    hook: "A VHS in a house clearance. Forty minutes of your childhood living room, filmed while you slept.",
    tags: ["found footage", "family", "childhood"],
    fear: 5,
    minutes: "6-8 min",
    ambience: "static",
    endings: 3,
    lang: "english",
    kind: "read",
  },
  {
    slug: "deep-field",
    title: "Deep Field",
    hook: "A flooded quarry, forty metres down, one torch. There is a village at the bottom, and its lights are on.",
    tags: ["underwater", "drowned village", "claustrophobia"],
    fear: 5,
    minutes: "6-8 min",
    ambience: "silence",
    endings: 3,
    lang: "english",
    kind: "read",
  },
  {
    slug: "the-substitute",
    title: "The Substitute",
    hook: "Detention, 6pm, an empty school. The teacher supervising you retired in 1997.",
    tags: ["school", "after hours", "wrong adult"],
    fear: 4,
    minutes: "5-7 min",
    ambience: "corridor",
    endings: 3,
    lang: "english",
    kind: "read",
  },
];

export const TOTAL_ENDINGS = STORY_INDEX.reduce((sum, s) => sum + s.endings, 0);

export function getStoryMeta(slug: string): StoryMeta | undefined {
  return STORY_INDEX.find((s) => s.slug === slug);
}

/**
 * One dynamic import per story, written out rather than built from a template
 * string: Vite can only pre-bundle and code-split an import it can read
 * statically, and a computed `import("./" + slug)` would defeat the entire
 * point of this file.
 */
const LOADERS: Record<string, () => Promise<Story>> = {
  "tape-corridor-3b": () => import("./tape-corridor-3b").then((m) => m.tapeCorridor3B),
  "hostel-block-c": () => import("./hostel-block-c").then((m) => m.hostelBlockC),
  "night-shift": () => import("./night-shift").then((m) => m.nightShift),
  "tape-kadaloram": () => import("./tape-kadaloram").then((m) => m.tapeKadaloram),
  "nalla-neram": () => import("./nalla-neram").then((m) => m.nallaNeram),
  "thirteen-steps": () => import("./thirteen-steps").then((m) => m.thirteenSteps),
  "last-train": () => import("./last-train").then((m) => m.lastTrain),
  "pei-kadhai": () => import("./pei-kadhai").then((m) => m.peiKadhai),
  "three-thirty-three": () => import("./three-thirty-three").then((m) => m.threeThirtyThree),
  "ward-nine": () => import("./ward-nine").then((m) => m.wardNine),
  "tenant-below": () => import("./tenant-below").then((m) => m.tenantBelow),
  "room-404": () => import("./room-404").then((m) => m.roomFourOhFour),
  "signal-lost": () => import("./signal-lost").then((m) => m.signalLost),
  "nine-oclock-tape": () => import("./nine-oclock-tape").then((m) => m.nineOclockTape),
  "deep-field": () => import("./deep-field").then((m) => m.deepField),
  "the-substitute": () => import("./the-substitute").then((m) => m.theSubstitute),
};

/** Fetches one story's branches. Rejects for an unknown slug. */
export async function loadStoryNodes(slug: string): Promise<Record<string, Beat[]>> {
  const load = LOADERS[slug];
  if (!load) throw new Error(`Unknown story: ${slug}`);
  const story = await load();
  return story.nodes;
}
