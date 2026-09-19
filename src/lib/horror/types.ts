export type Ambience =
  | "rain"
  | "corridor"
  | "forest"
  | "hospital"
  | "static"
  | "engine"
  | "silence"
  /** Stone, distance, a bell that stopped ringing a long time ago. */
  | "temple"
  /** Concrete block, ceiling fan, four hundred people asleep. */
  | "hostel"
  /** Down a shaft. Everything arrives late and wet. */
  | "well"
  /** Surf under wind. Wide and indifferent. */
  | "sea"
  /** Tape hiss and transport whine — the bed under found footage. */
  | "tape"
  /** Night traffic heard from inside a moving vehicle. */
  | "street";

export type Sfx =
  | "sting"
  | "whisper"
  | "knock"
  | "breath"
  | "door"
  | "scrape"
  | "drop"
  | "bell"
  | "scream"
  /** Additions for the second-generation stories. */
  | "steps" //  someone walking, panned across you
  | "water" //  a splash, or something surfacing
  | "phone" //  a ring that should not be happening
  | "glass" //  something breaking
  | "wind" //  a gust through a gap
  | "chant" //  many voices, one syllable
  | "laugh" //  a child, wrong speed
  | "crawl" //  weight dragging on a floor
  | "radio" //  a tuner finding something
  | "riser" //  ten seconds of rising dread
  | "reverse" //  a sound played backwards, which the ear reads as wrong
  | "flatline" //  the heartbeat stops
  | "crack" //  bone, wood, or a knuckle
  | "whoosh"; //  a camera swung fast enough to hear

/** Visual cue for tape stories. Ignored by ordinary read-mode stories. */
export type TapeFx =
  | "static" //  signal loss
  | "glitch" //  tracking tears
  | "figure" //  something standing at the end of the frame
  | "approach" //  the figure gets closer
  | "face" //  a single frame you were not supposed to see
  | "flash" //  a white frame
  | "dark" //  the camera light dies
  | "rewind"; //  the tape scrubs backwards

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
  /**
   * How the line is set. `voice` is someone speaking, `sign` is written text
   * inside the story (a note, a sign, a screen), `sms` is a message. Read mode
   * styles them differently; tape mode renders them as subtitles either way.
   */
  as?: "voice" | "sign" | "sms";
  /** Tape-mode visual. */
  fx?: TapeFx;
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

/**
 * `read` is prose on a black page. `tape` plays the same beat graph inside a
 * simulated camcorder: the text becomes subtitles and each beat can drive the
 * picture through `fx`.
 */
export type StoryKind = "read" | "tape";

/**
 * `tanglish` is Tamil-English as it is actually spoken and typed in Chennai and
 * Pondicherry — Tamil words in Latin script, mixed into English sentences. It
 * is tagged so the library can filter, and so a reader who will not enjoy it is
 * never surprised by it.
 */
export type StoryLang = "english" | "tanglish";

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
  lang?: StoryLang;
  kind?: StoryKind;
  /** Shown on the entry gate for tape stories: "REC 04:12 · 1998". */
  tapeLabel?: string;
  /** Which world the camcorder is in. Defaults to the corridor. */
  tapeScene?: "corridor" | "shore";
  nodes: Record<string, Beat[]>;
};

export type StoryStat = {
  story: string;
  ending: string;
  outcome: string;
  count: number;
};
