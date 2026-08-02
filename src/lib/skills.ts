export type SkillGroup = {
  id: string;
  name: string;
  items: string[];
  sort_order: number;
};

export type SkillGroupInput = Omit<SkillGroup, "id"> & { id?: string };

export const SKILL_GROUP_COLUMNS = "id, name, items, sort_order";

export const emptySkillGroup: SkillGroupInput = {
  name: "",
  items: [],
  sort_order: 0,
};
