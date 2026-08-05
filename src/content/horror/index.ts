import type { Story } from "@/lib/horror/types";
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

export const STORIES: Story[] = [
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
