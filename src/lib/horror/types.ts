export type Ambience = "rain" | "corridor" | "forest" | "hospital" | "static" | "engine" | "silence";

export type Sfx =
  | "sting"
  | "whisper"
  | "knock"
  | "breath"
  | "door"
  | "scrape"
  | "drop"
  | "bell"
  | "scream";

export type TextBeat = {
  t: "text";
  s: string;
  /** fear delta, -100..100 */
  fear?: number;
  /** render one word at a time */
  slow?: boolean;
  sfx?: Sfx;
  shake?: boolean;
  /** extra pause after the line, ms */
  hold?: number;
  /** switch ambience bed */
  amb?: Ambience;
};

export type ChoiceOption = {
  label: string;
  go: string;
  fear?: number;
};

export type ChoiceBeat = {
  t: "choice";
  prompt?: string;
  /** seconds; when it runs out the first option is taken for you */
  timer?: number;
  options: ChoiceOption[];
};

export type GotoBeat = { t: "goto"; go: string };

export type EndingBeat = {
  t: "ending";
  id: string;
  outcome: "survived" | "doomed" | "worst";
  title: string;
  lines: string[];
};

export type Beat = TextBeat | ChoiceBeat | GotoBeat | EndingBeat;

export type Story = {
  slug: string;
  title: string;
  hook: string;
  tags: string[];
  /** 1-5 skulls */
  fear: number;
  minutes: string;
  ambience: Ambience;
  endings: number;
  nodes: Record<string, Beat[]>;
};

export type StoryStat = {
  story: string;
  ending: string;
  outcome: string;
  count: number;
};
