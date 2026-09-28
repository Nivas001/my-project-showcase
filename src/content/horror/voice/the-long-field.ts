import type { VoiceStory } from "@/lib/horror/voice";

/**
 * English · field recording · something under the silence
 *
 * Written for the medium. The listener is wearing headphones and has just
 * agreed to pay close attention to sound, so the story is about a man who
 * pays close attention to sound and is punished for it. Every scare is
 * something heard rather than seen, which is the one advantage a narrated
 * story has over a written one, and it should be spent.
 */
export const theLongField: VoiceStory = {
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
  script: [
    { s: "My job is to record nothing.", amb: "forest", rate: 0.95 },
    {
      s: "That is not a joke about the industry. It is the actual work. A film needs the sound of a room with nobody in it, and somebody has to go and get it.",
    },
    {
      s: "The trade calls it room tone. I call it the long field, because that is where I get most of mine.",
    },

    {
      s: "Forty minutes out of town there is a field that is thirty acres of nothing. No road, no pylons, no flight path. The nearest house is a mile and a half away and has been empty since before I started.",
      fear: 3,
    },
    {
      s: "I have recorded there eleven times in six years. It is the quietest place I have ever put a microphone.",
      hold: 400,
    },

    {
      s: "On the twelfth I left the rig out overnight. Eight hours, two mics, a battery the size of a brick.",
      fear: 4,
      sfx: "wind",
    },
    {
      s: "I slept in the car with the window down. Nothing happened. I want to be clear about that, because of what comes next.",
    },
    { s: "Nothing happened. I was there. I would have heard it.", rate: 0.9, hold: 600 },

    {
      s: "Back home I put the eight hours on and did what you do — scrub through at speed, listening for a plane or a dog to cut around.",
      amb: "static",
      fear: 3,
    },
    { s: "It was clean. Beautifully clean. The best tone I had ever taken.", hold: 400 },

    { s: "The client bounced it. Said there was a hum.", fear: 5 },
    { s: "There was no hum. I checked on monitors that cost more than my car.", rate: 1.05 },
    {
      s: "So I did the thing you do when a client is wrong and you want to prove it: I lifted the gain forty decibels and listened to the noise floor itself.",
      fear: 6,
      hold: 500,
    },

    { s: "Under the silence there was a voice.", fear: 9, sfx: "whisper", rate: 0.85, hold: 900 },

    {
      s: "Not words. Not at first. A rhythm, right down at the bottom of what the microphone could hold, steady as a metronome and slightly slower than a heartbeat.",
      fear: 6,
      amb: "well",
    },
    { s: "It ran for all eight hours. It did not pause. It did not vary." },
    {
      s: "I normalised it, cleaned it, and put it through the same filter I use to pull dialogue out of a crowd.",
      fear: 5,
    },

    { s: "It was counting.", fear: 10, sfx: "sting", shake: true, hold: 900, rate: 0.85 },

    {
      s: "Down. From a number I could not make out at the start of the recording, at roughly one every eleven seconds, for eight hours and four minutes.",
      rate: 0.92,
    },
    { s: "I did the arithmetic three times because I did not like it.", fear: 4 },
    { s: "Two thousand six hundred and forty-nine.", speaker: "text", fear: 7, hold: 600 },
    { s: "That is where it started. That is what the first number was.", fear: 6 },

    { s: "I have been back to the field four times since.", amb: "forest", fear: 5, rate: 0.95 },
    {
      s: "Each time I record an hour. Each time I lift the floor. Each time it is there, and each time it has gone down by exactly the number of seconds that have passed since the last recording, divided by eleven.",
      fear: 7,
    },
    {
      s: "It has not stopped. It did not start when I arrived and it does not stop when I leave. It has simply been counting, in an empty field, for however long it has been counting.",
      fear: 8,
      rate: 0.9,
      hold: 700,
    },

    {
      s: "Last Tuesday I sat in the middle of that field at three in the morning with eight thousand pounds of microphone in my lap and my own ears wide open, and I heard absolutely nothing.",
      fear: 7,
      amb: "silence",
      sfx: "breath",
    },
    { s: "Total, complete, thirty-acre nothing.", hold: 500 },
    {
      s: "And forty decibels under that nothing, on the tape, in the same place, at the same rate, it kept going.",
      fear: 9,
      sfx: "whisper",
      rate: 0.88,
    },

    {
      s: "So it is not a sound in the field. It is a sound in the recording of the field. Those are different things, and I have spent two months trying to find a third explanation and I cannot.",
      fear: 6,
    },

    { s: "The last session I did something I am not proud of.", fear: 5, hold: 500, rate: 0.92 },
    { s: "I spoke to it. Out loud. Into the field.", fear: 7, sfx: "wind" },
    { s: "I said: what happens at zero.", speaker: "voice", fear: 8, rate: 0.85, hold: 800 },

    {
      s: "Nothing answered. Of course nothing answered. I stood there feeling like a fool and drove home.",
      rate: 1.02,
    },
    { s: "Then I lifted the floor.", fear: 9, hold: 700, rate: 0.85 },

    { s: "The count had stopped.", fear: 11, sfx: "flatline", shake: true, hold: 1200, rate: 0.8 },
    {
      s: "For eleven seconds. One beat. The only break in eight months of recordings.",
      fear: 8,
      rate: 0.9,
    },
    {
      s: "And in the gap where the number should have been, in the same flat voice, at the same level, it said:",
      fear: 10,
      rate: 0.85,
      hold: 600,
    },
    {
      s: "You do.",
      speaker: "other",
      fear: 15,
      rate: 0.68,
      pitch: 0.82,
      sfx: "reverse",
      shake: true,
      hold: 1600,
    },

    {
      s: "Then it picked the count back up, exactly where it had left it, as though it had merely been polite enough to answer a question.",
      fear: 7,
      amb: "well",
      rate: 0.9,
    },

    {
      s: "I am not going back. That is not bravery, it is arithmetic. I have run the numbers and I know when it reaches zero, and it is soon enough that going back would be a decision rather than an accident.",
      fear: 6,
    },
    { s: "But I want to tell you the part that actually keeps me up.", hold: 600, rate: 0.9 },
    {
      s: "I have a recording of an empty field from six years ago. My first session there. Two hours, before I owned anything good.",
      fear: 5,
      amb: "static",
    },
    { s: "I lifted the floor on it last night.", fear: 8, hold: 800, rate: 0.85 },
    { s: "The count is on it. Same voice. Same rate.", fear: 10, sfx: "sting", shake: true },
    {
      s: "And the number it is on, six years ago, is lower than the number it is on now.",
      fear: 14,
      rate: 0.75,
      hold: 1500,
    },
    {
      s: "It is not counting down.",
      speaker: "other",
      fear: 12,
      rate: 0.7,
      pitch: 0.85,
      hold: 1400,
    },
    {
      s: "It is counting the people who have heard it.",
      speaker: "other",
      fear: 16,
      rate: 0.68,
      pitch: 0.82,
      sfx: "riser",
      hold: 2000,
    },
  ],
};
