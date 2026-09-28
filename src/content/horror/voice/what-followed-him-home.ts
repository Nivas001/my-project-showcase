import type { VoiceStory } from "@/lib/horror/voice";

/**
 * English · possession · a recording of a man asleep
 *
 * Written in the tradition Turkish and South Asian possession horror draws on —
 * the old folklore of the djinn, of ruined places that are already occupied,
 * and of the rule that you must not answer something that calls you by name.
 * The plot, the family and the recordings are invented; only the folklore is
 * borrowed, and folklore belongs to everyone.
 *
 * Structurally it is a found-recording story told by the wrong person: the
 * cousin holding the camera, who spends the whole account explaining why he is
 * not frightened, in a tone that gets less convincing every paragraph.
 */
export const whatFollowedHimHome: VoiceStory = {
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
  script: [
    {
      s: "I want to start with the boring part, because the boring part is the only part anybody can check.",
      amb: "silence",
      rate: 0.98,
    },
    {
      s: "My cousin Emre is thirty-one. He is a quantity surveyor. He has never in his life had an interesting thought about the supernatural, which I mention because people will ask.",
    },

    {
      s: "In March he went out to a village two hours east to value a property for a client. A farmhouse, empty maybe forty years, roof half gone.",
      fear: 3,
      amb: "forest",
    },
    {
      s: "His car would not start. No signal. So he slept in it, in the yard of that house, with the windows up.",
    },
    {
      s: "That is the whole incident. That is all that happened. Remember that, because everything after this is just a man being tired.",
      rate: 1.02,
      hold: 500,
    },

    { s: "The tiredness started about a week later.", fear: 4, amb: "corridor" },
    {
      s: "Eleven hours a night. Twelve. He would go to bed at ten and wake at eleven the next morning with the specific grey exhaustion of a man who has not slept at all.",
    },
    {
      s: "Bloods came back clean. Sleep clinic put it down to stress. His mother put it down to something else and started leaving salt on the windowsills, and he laughed at her, and so did I.",
      fear: 4,
    },

    { s: "It was my idea to film him. I want that on the record too.", fear: 5, hold: 400 },
    {
      s: "A phone on a tripod, an infrared lamp, a cheap microphone taped to the headboard. I told him we would prove he was sleeping fine and he could stop worrying.",
      amb: "hospital",
    },

    { s: "Night one, nothing. Eight hours of a man not moving.", rate: 1.05 },
    { s: "Night two, nothing.", rate: 1.05 },
    {
      s: "Night three he sat up at ten past four, faced the wall for about ninety seconds, and lay back down.",
      fear: 6,
      sfx: "crawl",
      rate: 0.92,
    },
    {
      s: "People do that. I looked it up. People sit up in their sleep all the time.",
      rate: 1.05,
      hold: 400,
    },
    {
      s: "He did not blink for the ninety seconds. I have counted the frames.",
      fear: 8,
      rate: 0.85,
      hold: 800,
    },

    { s: "Night four is the one.", fear: 6, amb: "silence", hold: 600 },

    {
      s: "At three fifty-one in the morning the room goes very quiet. Not silent — the microphone floor is still there — but the small sounds stop. The clock, the pipes, the road.",
      fear: 7,
      sfx: "breath",
    },
    {
      s: "And in that quiet, Emre says: I am not going to tell you.",
      speaker: "voice",
      fear: 9,
      sfx: "whisper",
      rate: 0.88,
    },
    {
      s: "Clear. Awake. Conversational. In his own voice, in the middle of a sentence, as if he had been talking for a while and the microphone had only just caught up.",
      fear: 7,
    },

    { s: "There is a gap of about four seconds.", hold: 700, fear: 5 },
    {
      s: "Then he says: because you already know it, and you are only asking to hear me say it.",
      speaker: "voice",
      fear: 10,
      rate: 0.85,
      hold: 700,
    },

    { s: "This goes on for nineteen minutes.", fear: 8, rate: 0.9 },
    {
      s: "One side of a conversation. Gaps of three or four seconds where the other side would be. He argues. He refuses things. Twice he laughs, and it is his laugh, and it is the worst sound in the whole recording.",
      fear: 9,
      sfx: "laugh",
      shake: true,
    },

    {
      s: "We took it to his mother's imam, because at that point you take it to whoever will listen.",
      fear: 5,
      amb: "temple",
    },
    { s: "He was a kind man and an unsurprised one, which I did not enjoy.", rate: 0.98 },
    {
      s: "He asked one question. He asked whether Emre had answered anything, that night in the yard. Whether anything had called out, and whether he had said yes, or what, or who is that.",
      fear: 8,
      rate: 0.9,
      hold: 600,
    },

    {
      s: "The old rule is that a place can already be occupied. Not haunted — occupied, by something that was there first and has as much right to the dark as you do.",
      fear: 6,
      rate: 0.92,
    },
    {
      s: "You may share the night with it. What you must not do is answer it. Answering is not a greeting. It is a consent.",
      fear: 9,
      rate: 0.85,
      hold: 900,
    },

    { s: "Emre said he did not remember anyone calling.", fear: 5 },
    {
      s: "Then he went quiet for a long moment and said that something had knocked on the roof of the car, twice, and that he had said: I'm in here.",
      speaker: "voice",
      fear: 12,
      sfx: "knock",
      shake: true,
      rate: 0.85,
      hold: 1100,
    },

    {
      s: "I have listened to the nineteen minutes more times than I should have.",
      fear: 6,
      amb: "static",
      rate: 0.95,
    },
    {
      s: "I have run it through everything. Noise reduction. Spectral repair. A friend at a studio who does forensic work for lawyers and who stopped returning my calls.",
      fear: 5,
    },

    {
      s: "There is no second voice. I need you to understand that I have proved this properly. In the gaps there is nothing at all — not a whisper, not a breath, not a hum. The gaps are cleaner than the rest of the tape.",
      fear: 8,
      rate: 0.9,
    },
    { s: "Which is the part that finally got to me.", hold: 700 },
    {
      s: "Because a room with two people in it is never that quiet. Something in that room was not making a sound. Deliberately.",
      fear: 11,
      rate: 0.82,
      sfx: "reverse",
      hold: 1200,
    },

    {
      s: "Emre is fine. I want to say that, and I want it to be true.",
      fear: 4,
      amb: "corridor",
      rate: 1.0,
    },
    {
      s: "They did what they do — the recitation, the water, three nights of it, all of it very calm and very ordinary and nothing like a film. He sleeps seven hours now. He has put on weight. He is going back to work in the spring.",
      rate: 1.02,
    },
    { s: "And I am the one who cannot sleep, which everybody finds very funny.", hold: 500 },

    { s: "Here is why.", fear: 7, amb: "silence", rate: 0.9, hold: 600 },

    {
      s: "On the last night, at the end of the nineteen minutes, there is one more line. It is quiet, and it took me three months and a good pair of headphones to find it.",
      fear: 8,
      rate: 0.88,
    },
    {
      s: "Emre says: he can't hear you, he's just holding the camera.",
      speaker: "voice",
      fear: 13,
      sfx: "sting",
      shake: true,
      rate: 0.82,
      hold: 1300,
    },

    { s: "I was not in the room.", fear: 10, rate: 0.85, hold: 900 },
    {
      s: "The camera was on a tripod. It had been on a tripod for four nights. I was asleep at the other end of the house.",
      fear: 12,
      rate: 0.8,
      hold: 1000,
    },

    {
      s: "So either my cousin was lying in his sleep — which is a sentence I have actually said out loud to a doctor —",
      rate: 0.95,
      fear: 6,
    },
    {
      s: "— or something in that room spent four nights being told that the man holding the camera could not hear it.",
      fear: 14,
      rate: 0.78,
      sfx: "riser",
      hold: 1400,
    },
    {
      s: "And has spent every night since finding out whether that is still true.",
      speaker: "other",
      fear: 16,
      rate: 0.7,
      pitch: 0.82,
      shake: true,
      hold: 1800,
    },

    { s: "I have not set the camera up again.", fear: 8, amb: "silence", rate: 0.9, hold: 500 },
    {
      s: "I am not going to. I know exactly what I would find, and it is not a shape in the corner, and it is not a face.",
      fear: 9,
      rate: 0.85,
    },
    {
      s: "It is me, sitting up at ten past four, facing the wall, not blinking.",
      fear: 14,
      rate: 0.75,
      sfx: "flatline",
      hold: 1600,
    },
    { s: "Having a conversation.", speaker: "other", fear: 12, rate: 0.68, pitch: 0.8, hold: 2000 },
  ],
};
