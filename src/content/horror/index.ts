import type { Story } from "@/lib/horror/types";
import { lastTrain } from "./last-train";
import { threeThirtyThree } from "./three-thirty-three";
import { tenantBelow } from "./tenant-below";
import { peiKadhai } from "./pei-kadhai";

export const STORIES: Story[] = [lastTrain, threeThirtyThree, tenantBelow, peiKadhai];

export function getStory(slug: string): Story | undefined {
  return STORIES.find((s) => s.slug === slug);
}
