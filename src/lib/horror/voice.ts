import type { Ambience, Sfx } from "./types";

/**
 * ============================================================================
 * NARRATED STORIES
 * ============================================================================
 *
 * A separate shape from the branching `Story`, on purpose.
 *
 * A branching story is a graph you walk. A narrated one is a performance you
 * sit through: it runs start to finish, the reader's only controls are the ones
 * on a tape deck, and the text on screen is a lyric sheet following a voice
 * rather than prose being read. Trying to express that as `Beat[]` meant every
 * field was either about branching or about narration and never both.
 *
 * The voice is the browser's own speech synthesiser. There is no audio file and
 * no API key — which has one honest consequence: the available voices are
 * whatever is installed on the listener's machine. English is universal. Tamil
 * is not, and the player says so rather than silently reading Tamil script with
 * an American English voice, which is both unintelligible and unintentionally
 * comic.
 */

export type VoiceLang = "english" | "tamil" | "tanglish";

/** Who is talking. Drives how the line is set, and which voice reads it. */
export type Speaker =
  /** The story's narrating voice. */
  | "narrator"
  /** Someone inside the story, quoted. Set in the story's own colour. */
  | "voice"
  /** Something that should not be talking. Slower, lower, and never rushed. */
  | "other"
  /** Written text inside the story — a sign, a screen, a message. Not spoken. */
  | "text";

export type VoiceLine = {
  /** What is shown, and what is spoken. */
  s: string;
  speaker?: Speaker;
  /** Fear delta, -100..100. Drives heart rate, the vignette, and the bed. */
  fear?: number;
  sfx?: Sfx;
  amb?: Ambience;
  /** Extra silence after the line, in ms. Silence is the instrument. */
  hold?: number;
  shake?: boolean;
  /**
   * Speech rate multiplier for this line, 0.5-1.4. Used sparingly: a line
   * delivered slower than the ones around it is the cheapest dread there is.
   */
  rate?: number;
  /** Pitch multiplier, 0.5-1.5. Mostly for `other`. */
  pitch?: number;
  /**
   * A translation or gloss, shown under the line. Tamil stories carry a
   * transliteration so a reader who does not read the script can still follow;
   * Tanglish stories gloss the handful of words that carry the scare.
   */
  gloss?: string;
};

export type VoiceStory = {
  slug: string;
  title: string;
  /** Shown in the library and on the entry gate. */
  hook: string;
  lang: VoiceLang;
  /** 1-5 skulls. */
  fear: number;
  minutes: string;
  ambience: Ambience;
  tags: string[];
  /** One line under the title on the gate — what you are about to hear. */
  standfirst: string;
  /** Where the story came from, when it came from somewhere. */
  note?: string;
  script: VoiceLine[];
};

export type VoiceStoryMeta = Omit<VoiceStory, "script">;

/**
 * BCP-47 tags to ask the synthesiser for, best first.
 *
 * Tanglish is Tamil words in Latin script inside English sentences, so it is
 * read by an English voice — an Indian English one first, because it is the
 * only family that puts the stress in the right place on a Tamil word.
 */
export const VOICE_TAGS: Record<VoiceLang, string[]> = {
  english: ["en-IN", "en-GB", "en-AU", "en-US", "en"],
  tamil: ["ta-IN", "ta-LK", "ta"],
  tanglish: ["en-IN", "en-GB", "en-US", "en"],
};

/**
 * Picks the best installed voice for a language.
 *
 * Preference order is deliberate: an exact tag match beats a prefix match,
 * a local voice beats a network one (network voices stall mid-sentence on a
 * bad connection, which ruins the timing of a scare), and a "male"/"female"
 * name hint is never used — voice naming is wildly inconsistent across
 * platforms and guessing produces worse results than taking the default.
 */
export function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: VoiceLang,
): SpeechSynthesisVoice | null {
  const tags = VOICE_TAGS[lang];

  for (const tag of tags) {
    const exact = voices.filter(
      (v) => v.lang.replace("_", "-").toLowerCase() === tag.toLowerCase(),
    );
    const local = exact.find((v) => v.localService);
    if (local) return local;
    if (exact[0]) return exact[0];
  }

  for (const tag of tags) {
    const prefix = tag.split("-")[0]!.toLowerCase();
    const near = voices.filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith(prefix));
    const local = near.find((v) => v.localService);
    if (local) return local;
    if (near[0]) return near[0];
  }

  return null;
}

/**
 * Splits a line into speakable word tokens with their character offsets.
 *
 * The offsets are what let the highlight follow the voice: the synthesiser
 * reports progress as a character index into the string it was given, and the
 * renderer has to map that back onto a token to light up. Whitespace is kept
 * as its own token so re-joining the array reproduces the line exactly.
 */
export type Token = { text: string; start: number; end: number; word: boolean };

export function tokenise(line: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /(\s+)|([^\s]+)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(line)) !== null) {
    tokens.push({
      text: match[0],
      start: match.index,
      end: match.index + match[0].length,
      word: Boolean(match[2]),
    });
  }
  return tokens;
}

/**
 * How long a line should take when there is no voice reading it.
 *
 * Used by the silent fallback and by the karaoke timer on browsers whose
 * synthesiser never fires boundary events. Tamil script packs more sound into
 * fewer characters than Latin, so it is timed per character with a slower
 * constant rather than per word.
 */
export function estimateMs(line: string, lang: VoiceLang, rate = 1): number {
  const base = lang === "tamil" ? line.length * 92 : line.trim().split(/\s+/).length * 340;
  return Math.max(900, base / Math.max(0.5, rate));
}
