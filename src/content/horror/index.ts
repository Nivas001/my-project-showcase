import type { Story, StoryKind, StoryLang } from "@/lib/horror/types";
import { lastTrain } from "./last-train";
import { threeThirtyThree } from "./three-thirty-three";
import { tenantBelow } from "./tenant-below";
import { peiKadhai } from "./pei-kadhai";
import { signalLost } from "./signal-lost";
import { wardNine } from "./ward-nine";
import { roomFourOhFour } from "./room-404";
import { nineOclockTape } from "./nine-oclock-tape";
import { deepField } from "./deep-field";
import { theSubstitute } from "./the-substitute";
import { nightShift } from "./night-shift";
import { thirteenSteps } from "./thirteen-steps";
import { hostelBlockC } from "./hostel-block-c";
import { nallaNeram } from "./nalla-neram";
import { tapeCorridor3B } from "./tape-corridor-3b";
import { tapeKadaloram } from "./tape-kadaloram";

/**
 * Ordered for the library page: the two tapes and the two Tanglish stories sit
 * near the top, because they are the things a visitor has not seen on another
 * horror site. The original ten follow.
 */
export const STORIES: Story[] = [
  tapeCorridor3B,
  hostelBlockC,
  nightShift,
  tapeKadaloram,
  nallaNeram,
  thirteenSteps,
  lastTrain,
  peiKadhai,
  threeThirtyThree,
  wardNine,
  tenantBelow,
  roomFourOhFour,
  signalLost,
  nineOclockTape,
  deepField,
  theSubstitute,
];

export function getStory(slug: string): Story | undefined {
  return STORIES.find((s) => s.slug === slug);
}

/** Stories default to an English read; only the newer ones declare otherwise. */
export function storyLang(story: Story): StoryLang {
  return story.lang ?? "english";
}

export function storyKind(story: Story): StoryKind {
  return story.kind ?? "read";
}

/**
 * Nothing in the app imports this module at runtime — the pages read
 * `manifest.ts` and fetch one story at a time. It exists so the metadata in the
 * manifest can be checked against the stories themselves, which is the price of
 * keeping the two apart.
 *
 * Run `checkManifest()` from a dev console, or just read the warning it logs
 * when this module is imported during development.
 */
export function checkManifest(index: { slug: string; title: string; endings: number }[]) {
  const problems: string[] = [];
  for (const story of STORIES) {
    const entry = index.find((e) => e.slug === story.slug);
    if (!entry) {
      problems.push(`${story.slug}: missing from manifest.ts`);
      continue;
    }
    if (entry.title !== story.title)
      problems.push(`${story.slug}: title differs ("${entry.title}" vs "${story.title}")`);
    if (entry.endings !== story.endings)
      problems.push(`${story.slug}: endings differ (${entry.endings} vs ${story.endings})`);
  }
  for (const entry of index) {
    if (!STORIES.some((s) => s.slug === entry.slug))
      problems.push(`${entry.slug}: in manifest.ts but no such story`);
  }
  return problems;
}
