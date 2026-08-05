import type { Story } from "@/lib/horror/types";

export const lastTrain: Story = {
  slug: "last-train",
  title: "The Last Train from Nowhere",
  hook: "You board the 11:52. It never reaches a station.",
  tags: ["liminal", "night travel", "slow dread"],
  fear: 4,
  minutes: "6-8 min",
  ambience: "engine",
  endings: 3,
  nodes: {
    start: [
      { t: "text", s: "The platform clock says 11:52. It has said 11:52 for eleven minutes.", amb: "engine", fear: 5 },
      { t: "text", s: "You are the only one waiting. The vending machine hums like something breathing through a straw." },
      { t: "text", s: "Then the train arrives without a sound. No brakes. No announcement. The doors simply are open.", sfx: "door", fear: 8 },
      { t: "text", s: "Coach 4 is lit. Every other coach is dark.", hold: 700 },
      {
        t: "choice",
        prompt: "The doors will close in a moment.",
        timer: 12,
        options: [
          { label: "Board coach 4. Light is light.", go: "coach4", fear: 6 },
          { label: "Board a dark coach. Stay unseen.", go: "dark", fear: 14 },
          { label: "Stay on the platform. Wait for a normal train.", go: "platform", fear: 10 },
        ],
      },
    ],

    platform: [
      { t: "text", s: "The doors close. The train slides away without wind, without noise.", fear: 6 },
      { t: "text", s: "The clock still says 11:52.", slow: true, fear: 10 },
      { t: "text", s: "Behind you, the platform bench now has someone sitting on it. It did not a second ago.", sfx: "whisper", fear: 18 },
      { t: "text", s: "He is wearing your jacket. He is holding your ticket. He does not look up.", fear: 14 },
      { t: "text", s: "\"You missed it,\" he says, in your voice. \"Now we both have to wait.\"", sfx: "sting", shake: true, fear: 20 },
      {
        t: "choice",
        options: [
          { label: "Run for the stairs.", go: "stairs", fear: 12 },
          { label: "Sit down next to him.", go: "sit", fear: 20 },
        ],
      },
    ],

    stairs: [
      { t: "text", s: "You take the stairs three at a time. They end at another platform.", fear: 12 },
      { t: "text", s: "The clock says 11:52. The bench has two figures on it now.", slow: true, fear: 18 },
      { t: "text", s: "One of them waves.", sfx: "sting", shake: true },
      {
        t: "ending",
        id: "loop",
        outcome: "doomed",
        title: "11:52",
        lines: [
          "You will take the stairs eleven thousand more times.",
          "Each time, the bench is fuller.",
          "Each time, one of them is wearing your face a little better than you are.",
        ],
      },
    ],

    sit: [
      { t: "text", s: "You sit. The cold of the bench goes through your spine like a needle.", fear: 14 },
      { t: "text", s: "He tells you the rules. There is only ever one seat that is really yours.", sfx: "breath" },
      { t: "text", s: "When the next train comes, only one of you will be allowed to want it.", fear: 16 },
      { t: "text", s: "The headlight appears down the tunnel.", sfx: "drop", fear: 20, hold: 900 },
      {
        t: "choice",
        prompt: "The train is thirty seconds away.",
        timer: 8,
        options: [
          { label: "Give him the ticket. Let him go.", go: "gave", fear: -10 },
          { label: "Take the ticket back.", go: "took", fear: 20 },
        ],
      },
    ],

    gave: [
      { t: "text", s: "He boards. He does not thank you. The doors close on the hem of your jacket and tear it.", fear: 8 },
      { t: "text", s: "The clock ticks. 11:53.", slow: true, sfx: "bell", fear: -20, amb: "rain" },
      {
        t: "ending",
        id: "traded",
        outcome: "survived",
        title: "11:53",
        lines: [
          "You walk out of the station at midnight, into ordinary rain.",
          "You get home. You sleep.",
          "For the rest of your life you avoid trains after eleven, and you never explain why.",
        ],
      },
    ],

    took: [
      { t: "text", s: "You snatch the ticket. He does not fight. He smiles like he has been waiting for exactly this.", fear: 16 },
      { t: "text", s: "\"Good,\" he says. \"I was so tired of being the one who wants it.\"", sfx: "sting", shake: true, fear: 22 },
      {
        t: "ending",
        id: "seat",
        outcome: "worst",
        title: "The One Seat",
        lines: [
          "The train arrives. You board. It never stops again.",
          "Somewhere behind you a man in your jacket walks out into the rain and lives your whole life.",
          "He is better at it than you were.",
        ],
      },
    ],

    dark: [
      { t: "text", s: "You step into coach 3. It smells like a cupboard nobody has opened since a funeral.", amb: "corridor", fear: 12 },
      { t: "text", s: "The seats are full. Everyone is sitting perfectly upright, facing forward, in the dark.", sfx: "breath", fear: 16 },
      { t: "text", s: "Nobody is breathing. You count. Twenty-two people and one set of lungs — yours.", slow: true, fear: 20 },
      { t: "text", s: "The train starts moving. Every head turns to the window, in unison, to watch the tunnel.", sfx: "scrape", fear: 14 },
      {
        t: "choice",
        options: [
          { label: "Look out the window too.", go: "window", fear: 12 },
          { label: "Walk forward into the lit coach.", go: "coach4", fear: 6 },
          { label: "Sit down and copy them exactly.", go: "copy", fear: 18 },
        ],
      },
    ],

    copy: [
      { t: "text", s: "You sit. You face forward. You stop blinking. You get very good at it.", fear: 10 },
      { t: "text", s: "Hours pass, or minutes. Your reflection in the glass stops moving before you do.", sfx: "whisper", fear: 18 },
      { t: "text", s: "At some point you realise you have also stopped breathing, and that it is fine.", slow: true, fear: 22 },
      {
        t: "ending",
        id: "passenger",
        outcome: "worst",
        title: "Passenger 23",
        lines: [
          "The next person who boards coach 3 in the dark will count twenty-three.",
          "They will notice one set of lungs.",
          "It will not be yours.",
        ],
      },
    ],

    window: [
      { t: "text", s: "Outside the tunnel wall there are people standing in the dark, spaced exactly one metre apart.", fear: 18 },
      { t: "text", s: "At the speed you are going, you should see them as a blur. You see each face clearly.", sfx: "sting", shake: true, fear: 20 },
      { t: "text", s: "They are all watching your window. They all know which seat you are in.", fear: 14 },
      { t: "goto", go: "coach4" },
    ],

    coach4: [
      { t: "text", s: "Coach 4 is warm and too bright. The seats are red. There is one other passenger.", amb: "engine", fear: -6 },
      { t: "text", s: "An old woman with a shopping bag on her lap. She smiles like a relative you cannot place.", fear: 4 },
      { t: "text", s: "\"First time?\" she asks. \"Don't worry. It only asks one question.\"", sfx: "whisper", fear: 10 },
      { t: "text", s: "The train has been moving for forty minutes. Your stop was nine minutes away.", slow: true, fear: 14 },
      {
        t: "choice",
        prompt: "The next station sign slides past unreadable.",
        options: [
          { label: "Ask her what the question is.", go: "question", fear: 8 },
          { label: "Pull the emergency handle.", go: "handle", fear: 14 },
          { label: "Look in her shopping bag.", go: "bag", fear: 20 },
        ],
      },
    ],

    bag: [
      { t: "text", s: "You lean over. She does not stop you. That is the worst part — she wants you to look.", fear: 16 },
      { t: "text", s: "Inside the bag: wallets. Dozens. Bus passes. A child's shoe. Your library card.", sfx: "sting", shake: true, fear: 24 },
      { t: "text", s: "\"You dropped that in 2016,\" she says pleasantly. \"I've been keeping it warm.\"", fear: 18 },
      { t: "goto", go: "question" },
    ],

    handle: [
      { t: "text", s: "You pull. Something above you clunks. The train does not slow.", sfx: "knock", fear: 14 },
      { t: "text", s: "The old woman keeps knitting. \"There's no driver, love. There's only appetite.\"", sfx: "whisper", fear: 18 },
      { t: "text", s: "The lights dim to the colour of old blood.", fear: 12, amb: "corridor" },
      { t: "goto", go: "question" },
    ],

    question: [
      { t: "text", s: "The intercom crackles. A voice that has never had a throat says:", sfx: "static" as never, fear: 16 },
      { t: "text", s: "\"WHO IS GETTING OFF.\"", slow: true, sfx: "sting", shake: true, fear: 26 },
      { t: "text", s: "The old woman looks at you and mouths, very carefully: say her name.", fear: 20 },
      { t: "text", s: "You realise you have never asked her name. You also realise she has been saying yours all night.", fear: 22, hold: 800 },
      {
        t: "choice",
        prompt: "The train is slowing. For the first time. For one of you.",
        timer: 15,
        options: [
          { label: "Say your own name.", go: "own", fear: 10 },
          { label: "Say nothing at all.", go: "silent", fear: 16 },
          { label: "Say \"her\".", go: "her", fear: 24 },
        ],
      },
    ],

    own: [
      { t: "text", s: "You say your name. The train opens its doors onto a platform that is real, and lit, and cold.", fear: -20, amb: "rain" },
      { t: "text", s: "Behind you the old woman waves without looking up.", sfx: "bell" },
      {
        t: "ending",
        id: "off",
        outcome: "survived",
        title: "You Got Off",
        lines: [
          "You step down onto real concrete. A real cat runs under a real bench.",
          "The 11:52 leaves without a sound.",
          "You take buses now. You have made your peace with buses.",
        ],
      },
    ],

    her: [
      { t: "text", s: "\"Her,\" you say. The word tastes like a coin.", fear: 18 },
      { t: "text", s: "The old woman stands up so fast her knitting spills. She is not surprised. She is furious.", sfx: "scream", shake: true, fear: 26 },
      { t: "text", s: "\"Forty years,\" she hisses, \"and it's a coward that ends me.\"", fear: 20 },
      { t: "text", s: "The doors take her. The train continues. You are the only passenger now. There is knitting on the floor.", slow: true, fear: 22 },
      {
        t: "ending",
        id: "knitter",
        outcome: "doomed",
        title: "Her Seat",
        lines: [
          "You pick up the needles because your hands are cold and there is nothing else to hold.",
          "Someone will board eventually. Frightened. Alone. First time.",
          "You already know what you will tell them: don't worry, it only asks one question.",
        ],
      },
    ],

    silent: [
      { t: "text", s: "You say nothing. Silence, you think, is not a lie.", fear: 14 },
      { t: "text", s: "The intercom waits. The train waits. The old woman stops knitting and closes her eyes, praying.", sfx: "breath", fear: 20 },
      { t: "text", s: "\"NEITHER,\" the voice decides.", slow: true, sfx: "sting", shake: true, fear: 28 },
      {
        t: "ending",
        id: "neither",
        outcome: "worst",
        title: "Neither",
        lines: [
          "The lights go out in coach 4 and they do not come back on.",
          "Two people ride in the dark, upright, facing forward, not breathing.",
          "The count in coach 3 is twenty-four now.",
        ],
      },
    ],
  },
};
