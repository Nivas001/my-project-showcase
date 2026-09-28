import type { VoiceStory, VoiceStoryMeta } from "@/lib/horror/voice";

/**
 * ============================================================================
 * THE NARRATED LIBRARY
 * ============================================================================
 *
 * Metadata eagerly, scripts lazily — the same split, and for the same reason,
 * as `content/horror/manifest.ts`.
 *
 * These scripts are large: seven stories of forty-odd lines each, with a
 * transliteration and a gloss on every Tamil line. Loading them all so the
 * library page can print seven titles would put roughly 90KB of horror prose
 * into the bundle of a page that shows none of it.
 */

export const VOICE_INDEX: VoiceStoryMeta[] = [
  {
    slug: "what-followed-him-home",
    title: "What Followed Him Home",
    hook: "He slept eleven hours a night and woke up exhausted. So we filmed him. On the fourth night, he answered a question nobody asked.",
    standfirst:
      "An old house, a night nobody should have spent there, and forty hours of a man sleeping. Told by the cousin who set the camera up, and who would like it on record that he does not believe in any of this.",
    note: "An original story written in the folklore of the djinn — the tradition Turkish and South Asian possession horror comes out of. No real family, and no real house.",
    lang: "english",
    fear: 5,
    minutes: "9-10 min",
    ambience: "silence",
    tags: ["possession", "djinn", "found recording", "folklore"],
  },
  {
    slug: "speak-after-the-tone",
    title: "Speak After the Tone",
    hook: "Nineteen voicemails from your own number. The first one is from Tuesday. You have not made a call since Sunday.",
    standfirst:
      "A voicemail box with nineteen messages in it. All of them are from your number. All of them are your voice. None of them have happened yet.",
    lang: "english",
    fear: 5,
    minutes: "8-9 min",
    ambience: "static",
    tags: ["voicemail", "loop", "slow dread"],
  },
  {
    slug: "the-long-field",
    title: "The Long Field",
    hook: "Eight hours of an empty field at night. On the fourth playback, under the silence, something is counting.",
    standfirst:
      "A sound recordist leaves a microphone in an empty field overnight. The field is empty. He has the eight hours of tape to prove it.",
    lang: "english",
    fear: 5,
    minutes: "8-9 min",
    ambience: "forest",
    tags: ["field recording", "sound", "counting"],
  },
  {
    slug: "mukkaadu",
    title: "முக்காடு",
    hook: "இரவு முழுக்க உடலோடு உட்கார்ந்திருக்கணும். முக்காட்டை எடுக்கக்கூடாது. பதில் சொல்லக்கூடாது.",
    standfirst:
      "A grandson sits the night watch beside his grandmother's body. Two rules: do not lift the veil, and whatever you hear, do not answer it.",
    note: "Narrated in Tamil. If your device has no Tamil voice installed, the story still runs as a timed reading with the full sound design — and the transliteration under each line carries you through.",
    lang: "tamil",
    fear: 5,
    minutes: "8-9 min",
    ambience: "rain",
    tags: ["tamil", "folk horror", "night watch"],
  },
  {
    slug: "padhinonnarai",
    title: "பதினொன்றரை",
    hook: "அந்த வீட்டில் இருக்கிற எல்லா கடிகாரமும் இரவு பதினொன்றரைக்கு நின்னுடும். ஒவ்வொரு நாளும்.",
    standfirst:
      "A rented house where every clock stops at half past eleven at night. The last tenant died at eleven. The story is about the thirty minutes in between.",
    note: "Narrated in Tamil. With no Tamil voice installed the story still runs — timed, scored, and glossed line by line.",
    lang: "tamil",
    fear: 5,
    minutes: "8-9 min",
    ambience: "hostel",
    tags: ["tamil", "house", "countdown"],
  },
  {
    slug: "terrace-la-yaaro",
    title: "Terrace-la Yaaro",
    hook: "Top floor flat. 2 AM. Mela yaaro nadakraanga. Terrace-ku key rendu thaan iruku — onnu en kitta.",
    standfirst:
      "A top-floor flat in Velachery, a locked terrace, and somebody walking up there every night at two. Told in Tanglish, the way it would actually be told.",
    lang: "tanglish",
    fear: 5,
    minutes: "7-8 min",
    ambience: "hostel",
    tags: ["tanglish", "chennai", "apartment"],
  },
  {
    slug: "group-la-oruthar",
    title: "Group-la Oruthar",
    hook: "Family WhatsApp group. 47 members. Onnu ezhudhitte irukaaru — rendu varusham munnaadi iranthavaru.",
    standfirst:
      "Every family has the group nobody leaves. Ours has forty-seven members. One of them died two years ago, and one of them is typing.",
    lang: "tanglish",
    fear: 5,
    minutes: "7-8 min",
    ambience: "street",
    tags: ["tanglish", "family", "phone"],
  },
];

export function getVoiceMeta(slug: string): VoiceStoryMeta | undefined {
  return VOICE_INDEX.find((story) => story.slug === slug);
}

/**
 * Written out one by one rather than built from a template string: Vite can
 * only split an import it can read statically, and a computed specifier would
 * pull every story into a single chunk and undo the point of this file.
 */
const LOADERS: Record<string, () => Promise<VoiceStory>> = {
  "what-followed-him-home": () =>
    import("./what-followed-him-home").then((m) => m.whatFollowedHimHome),
  "speak-after-the-tone": () => import("./speak-after-the-tone").then((m) => m.speakAfterTheTone),
  "the-long-field": () => import("./the-long-field").then((m) => m.theLongField),
  mukkaadu: () => import("./mukkaadu").then((m) => m.mukkaadu),
  padhinonnarai: () => import("./padhinonnarai").then((m) => m.padhinonnarai),
  "terrace-la-yaaro": () => import("./terrace-la-yaaro").then((m) => m.terraceLaYaaro),
  "group-la-oruthar": () => import("./group-la-oruthar").then((m) => m.groupLaOruthar),
};

export async function loadVoiceStory(slug: string): Promise<VoiceStory> {
  const load = LOADERS[slug];
  if (!load) throw new Error(`Unknown narrated story: ${slug}`);
  return load();
}

export const VOICE_LANG_LABEL: Record<VoiceStoryMeta["lang"], string> = {
  english: "English",
  tamil: "தமிழ்",
  tanglish: "Tanglish",
};
