import type { Story } from "@/lib/horror/types";

export const signalLost: Story = {
  slug: "signal-lost",
  title: "Signal Lost",
  hook: "You are the only operator at a relay station in the hills. At 1am, something starts answering.",
  tags: ["isolation", "radio", "night shift"],
  fear: 4,
  minutes: "5-7 min",
  ambience: "static",
  endings: 3,
  nodes: {
    start: [
      { t: "text", s: "Relay 6 sits nine kilometres up a fire road, and nobody has been up to see you in eleven days.", amb: "static", fear: 6 },
      { t: "text", s: "The job is simple: log the hourly check, keep the generator fed, don't touch the emergency band.", fear: 8 },
      { t: "text", s: "At 01:00 you send the check. At 01:02 someone sends it back, word for word, in your own voice.", slow: true, sfx: "whisper", fear: 20 },
      {
        t: "choice",
        prompt: "The channel is open. The carrier tone is live.",
        timer: 12,
        options: [
          { label: "Ask who's transmitting.", go: "ask", fear: 14 },
          { label: "Say nothing. Log it as interference.", go: "log", fear: 10 },
          { label: "Kill the transmitter.", go: "kill", fear: 12 },
        ],
      },
    ],

    ask: [
      { t: "text", s: "\"Relay six, identify yourself.\"", fear: 14 },
      { t: "text", s: "\"Relay six,\" it says. \"Identify yourself.\" Perfect timing. Perfect intonation. Half a second behind.", sfx: "whisper", fear: 22 },
      { t: "text", s: "Then, unprompted: \"Your door is not locked.\"", slow: true, sfx: "sting", shake: true, fear: 28 },
      {
        t: "choice",
        options: [
          { label: "Go lock the door.", go: "door", fear: 20 },
          { label: "Stay at the desk and keep it talking.", go: "talk", fear: 22 },
        ],
      },
    ],

    talk: [
      { t: "text", s: "\"What do you want?\"", fear: 20 },
      { t: "text", s: "\"To be let in properly. Doors matter. That's the whole rule. That's the only rule I've got.\"", sfx: "whisper", fear: 24 },
      { t: "text", s: "You can hear, under its voice, the sound of a hand flat against sheet metal, moving.", sfx: "scrape", fear: 26 },
      { t: "goto", go: "door" },
    ],

    door: [
      { t: "text", s: "The station door is a metal slab with a bolt. The bolt is drawn back. You did not draw it back.", sfx: "door", fear: 24 },
      { t: "text", s: "Through the small wired-glass window there is only fog, moving the wrong way — towards the building.", fear: 22 },
      {
        t: "choice",
        prompt: "Your hand is on the bolt.",
        timer: 9,
        options: [
          { label: "Slam it home.", go: "bolted", fear: 14 },
          { label: "Look out of the window first.", go: "window", fear: 26 },
        ],
      },
    ],

    window: [
      { t: "text", s: "You put your eye to the wired glass.", slow: true, sfx: "breath", fear: 26 },
      { t: "text", s: "On the other side, an eye is already at the glass, at your exact height, waiting to be looked at.", sfx: "sting", shake: true, fear: 32 },
      { t: "text", s: "It blinks when you blink.", slow: true, fear: 30 },
      {
        t: "choice",
        timer: 6,
        options: [
          { label: "Bolt the door NOW.", go: "bolted", fear: 18 },
          { label: "Open it. It has your face.", go: "opened", fear: 30 },
        ],
      },
    ],

    opened: [
      { t: "text", s: "You open the door because it has your face and you have been alone for eleven days.", fear: 28 },
      { t: "text", s: "It comes in politely, wipes its feet, sits down at the desk, and sends the 02:00 check.", slow: true, sfx: "door", fear: 32 },
      {
        t: "ending",
        id: "relieved",
        outcome: "worst",
        title: "Relieved of Duty",
        lines: [
          "The log is complete for the rest of the month. Handwriting matches. Voice matches.",
          "When the resupply truck finally comes up the fire road, the operator waves from the doorway and asks for another eleven days.",
          "There is a lot of fog up there. There is enough for everyone.",
        ],
      },
    ],

    bolted: [
      { t: "text", s: "You slam the bolt. Something on the other side sighs, in exactly the way you sigh.", sfx: "breath", fear: 20 },
      { t: "text", s: "It walks around the building all night. You count laps to stay sane. Two hundred and six.", fear: 24 },
      { t: "text", s: "At 06:14 the sun comes over the ridge, and the two hundred and seventh lap does not finish.", sfx: "bell", fear: -22, amb: "rain" },
      {
        t: "ending",
        id: "bolted",
        outcome: "survived",
        title: "Two Hundred and Six",
        lines: [
          "You quit by radio at 06:20 and walk nine kilometres down a fire road in daylight.",
          "The relay is automated now. No operators. Company policy, they said, nothing to do with anything.",
          "Sometimes the automated 01:00 check comes through twice.",
        ],
      },
    ],

    log: [
      { t: "text", s: "You write \"01:02 — atmospheric duplication, no action\" and feel proud of the wording.", fear: 8 },
      { t: "text", s: "At 02:00 the duplicate arrives before you send yours.", slow: true, sfx: "sting", fear: 24 },
      { t: "text", s: "At 03:00 it sends a check you have not written yet, and then you write it, word for word, and cannot stop yourself.", fear: 28 },
      {
        t: "choice",
        prompt: "04:00 is in nine minutes.",
        timer: 10,
        options: [
          { label: "Break the pattern. Send nonsense.", go: "nonsense", fear: 20 },
          { label: "Send the check exactly as it dictated.", go: "obey", fear: 26 },
        ],
      },
    ],

    nonsense: [
      { t: "text", s: "You transmit forty seconds of the alphabet backwards, badly, laughing at yourself.", fear: 14 },
      { t: "text", s: "Silence. Real silence, for the first time in three hours. The static bed drops out entirely.", amb: "silence", fear: 18 },
      { t: "text", s: "Then, small and very far away, something in the hills starts reciting the alphabet backwards.", sfx: "whisper", slow: true, fear: 26 },
      { t: "text", s: "It gets it right. It is closer each time it starts again.", sfx: "sting", shake: true, fear: 30 },
      { t: "goto", go: "door" },
    ],

    obey: [
      { t: "text", s: "You send it exactly. It feels like relief. It feels like putting down something heavy.", fear: 18 },
      { t: "text", s: "At 05:00 it dictates again, and you send it, and by 06:00 you are not waiting to be told.", slow: true, fear: 26 },
      {
        t: "ending",
        id: "operator",
        outcome: "doomed",
        title: "Operator",
        lines: [
          "Head office notes that Relay 6's logs have become unusually consistent. They send a commendation.",
          "You have not eaten since Tuesday and you do not find this strange.",
          "01:00. Relay six, all nominal. 01:00. Relay six, all nominal. 01:00.",
        ],
      },
    ],

    kill: [
      { t: "text", s: "You cut the transmitter at the breaker. The carrier tone dies. The room goes quiet enough to hear the fridge.", amb: "silence", fear: 12 },
      { t: "text", s: "The speaker, with no power going to it, says: \"That was rude.\"", slow: true, sfx: "sting", shake: true, fear: 30 },
      {
        t: "choice",
        timer: 8,
        options: [
          { label: "Restore power and apologise.", go: "apologise", fear: 20 },
          { label: "Rip the speaker out of the rack.", go: "rip", fear: 22 },
        ],
      },
    ],

    apologise: [
      { t: "text", s: "\"Sorry,\" you say, to a rack of equipment, in an empty building in the hills.", fear: 20 },
      { t: "text", s: "\"Accepted,\" it says warmly. \"You'll be fine. Just don't look at the window at 04:00.\"", sfx: "whisper", fear: 26 },
      { t: "text", s: "At 03:58 you decide you are absolutely not going to look at the window.", slow: true, fear: 28 },
      { t: "goto", go: "window" },
    ],

    rip: [
      { t: "text", s: "You tear the speaker cable out with both hands. Copper. Plastic. Blood on your knuckles.", sfx: "scrape", fear: 22 },
      { t: "text", s: "The voice continues, unbothered, from the fire alarm. Then the kettle. Then your own teeth.", slow: true, sfx: "sting", shake: true, fear: 32 },
      { t: "text", s: "\"Doors,\" it says, from inside your jaw. \"Doors matter.\"", fear: 30 },
      {
        t: "ending",
        id: "conductor",
        outcome: "worst",
        title: "Conductor",
        lines: [
          "You walk down nine kilometres of fire road at 04:10 with your mouth shut as hard as you can hold it.",
          "You reach the village at dawn and knock on the first door you find, because doors matter.",
          "You do not remember opening your mouth to say good morning. You never do.",
        ],
      },
    ],
  },
};
