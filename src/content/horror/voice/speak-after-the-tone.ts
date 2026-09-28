import type { VoiceStory } from "@/lib/horror/voice";

/**
 * English · voicemail · the call is coming from inside the number
 *
 * The engine of this one is a rule the listener works out before the narrator
 * does: every message arrives a few hours before the thing it describes. Once
 * that lands, the last message stops being information and becomes a deadline.
 */
export const speakAfterTheTone: VoiceStory = {
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
  script: [
    { s: "I want to say first that I am not a nervous person.", amb: "static" },
    {
      s: "I mention it because of what I am about to tell you, and because by the end of this you will have decided one way or the other anyway.",
    },
    {
      s: "On Sunday night I turned my phone off and put it in a drawer. That part matters. Hold on to it.",
      fear: 4,
    },
    { s: "On Wednesday morning I turned it back on. Nineteen voicemails.", fear: 6, sfx: "phone" },
    { s: "All nineteen from the same number.", hold: 400 },
    { s: "My number.", fear: 8, hold: 900, rate: 0.85 },

    {
      s: "I want to be precise here, because precision is the only thing I have left. Not a number that looked like mine. Not one digit off.",
    },
    { s: "Mine. The one I have had for eleven years. The one I give to couriers." },
    {
      s: "I played the first message standing in the kitchen with my coat still on.",
      fear: 5,
      amb: "corridor",
    },

    {
      s: "Hello. It's me. The kettle is going to click off in about four seconds, and I need you to listen to the whole thing.",
      speaker: "voice",
      fear: 7,
      sfx: "whisper",
    },
    { s: "The kettle clicked off.", fear: 9, sfx: "sting", shake: true, hold: 700 },

    {
      s: "I want to tell you I dropped the phone. I didn't. I stood very still and let it finish, the way you do when a doctor is saying a word you have not heard before.",
    },
    { s: "The message was ninety seconds long. It described the next four minutes of my life." },
    { s: "The post through the door. Two envelopes and a card for a takeaway. Correct." },
    {
      s: "The neighbour's dog starting, then stopping, then starting again. Correct.",
      sfx: "steps",
    },
    {
      s: "A plate in the sink that I would put down too hard and crack. I put it down gently. It cracked anyway.",
      fear: 8,
      sfx: "glass",
      shake: true,
    },

    { s: "Message two was from Tuesday afternoon.", amb: "hospital", fear: 4 },
    {
      s: "It described Tuesday evening. Message three was from Tuesday evening, and described Wednesday morning: a man in a kitchen with his coat on, listening to a voicemail, going pale.",
    },
    {
      s: "I played them in order. That was my mistake. I should have started from the end.",
      fear: 7,
      rate: 0.9,
    },

    {
      s: "By message eleven the voice had stopped explaining itself. It had worked out that I was listening, and it started leaving things out.",
      fear: 6,
    },
    {
      s: "Not lying. Just — leaving gaps. The way you do when you know the other person will fill them in.",
      hold: 500,
    },

    { s: "Message fourteen was eleven seconds of a room I recognised.", sfx: "breath", fear: 8 },
    {
      s: "Not the sound of a room. The sound of somebody in a room, deciding not to move.",
      rate: 0.85,
      hold: 800,
    },

    { s: "Message seventeen said: you're going to check the drawer.", speaker: "voice", fear: 9 },
    { s: "I checked the drawer.", fear: 6, sfx: "door", hold: 600 },
    {
      s: "My phone was in it. Switched off. Cold, the way a thing is when it has not run for three days.",
      fear: 10,
      rate: 0.85,
    },
    { s: "I was holding my phone.", fear: 12, sfx: "sting", shake: true, hold: 1100, rate: 0.8 },

    { s: "I have spent two days on the sensible explanations. I want you to know I did the work." },
    {
      s: "A cloned SIM. A recording app. Somebody in the flat. A brother I don't have. A breakdown, which I would honestly take at this point.",
      rate: 1.05,
    },
    {
      s: "None of them explain the timestamps, and the timestamps are the only part that is not a matter of opinion.",
      fear: 5,
    },

    { s: "Which brings me to message nineteen.", hold: 700, fear: 8, amb: "silence" },
    { s: "It is forty-one minutes long. I have listened to the first nine.", rate: 0.9 },
    {
      s: "It is me describing the rest of tonight. Calmly. With the kind of detail you only have about a thing you have already been through.",
      fear: 7,
    },

    {
      s: "Nine minutes in, the voice says: this is the part where you stop listening and go and tell someone.",
      speaker: "voice",
      fear: 9,
      sfx: "whisper",
    },
    { s: "So here I am. Telling someone.", hold: 800 },
    {
      s: "Which means the voice was right about this too, and I have thirty-two minutes of it left, and I already know how it ends, because it is my voice and I am not a good enough liar to fake calm.",
      fear: 10,
      rate: 0.95,
    },
    { s: "And the voice is very calm.", fear: 12, rate: 0.8, hold: 1200, sfx: "flatline" },

    { s: "There is one more thing.", amb: "static", fear: 6, hold: 500 },
    {
      s: "I checked the sent items on the phone in the drawer. Three days off. No signal, no battery, nothing.",
      rate: 0.9,
    },
    { s: "Nineteen outgoing calls.", fear: 9, sfx: "sting", shake: true },
    {
      s: "The twentieth is in progress.",
      speaker: "other",
      fear: 14,
      rate: 0.72,
      pitch: 0.85,
      hold: 1400,
    },
    {
      s: "It has been in progress for six hours.",
      speaker: "other",
      fear: 10,
      rate: 0.72,
      pitch: 0.85,
      hold: 900,
    },

    {
      s: "If you are hearing this, it is because I finally worked out what the nineteen messages were for.",
      fear: 6,
      amb: "silence",
      rate: 0.9,
    },
    {
      s: "They were not warnings. They were not a haunting. They were rehearsals.",
      fear: 10,
      rate: 0.85,
      hold: 700,
    },
    {
      s: "Somebody was learning to sound exactly like me.",
      fear: 14,
      rate: 0.78,
      hold: 1500,
      sfx: "reverse",
    },
    { s: "Speak after the tone.", speaker: "other", fear: 8, rate: 0.7, pitch: 0.8, hold: 1800 },
  ],
};
