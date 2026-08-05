import type { Story } from "@/lib/horror/types";

export const threeThirtyThree: Story = {
  slug: "three-thirty-three",
  title: "3:33",
  hook: "You wake at the same minute every night. Something is counting down.",
  tags: ["sleep", "possession", "countdown"],
  fear: 5,
  minutes: "6-8 min",
  ambience: "hospital",
  endings: 3,
  nodes: {
    start: [
      { t: "text", s: "Night one, you woke at 3:33 and thought nothing of it.", amb: "hospital", fear: 4 },
      { t: "text", s: "Night four, you noticed the wardrobe door was open by exactly the same amount as the night before.", fear: 8 },
      { t: "text", s: "Tonight is night eleven. Your eyes open before the clock flips.", slow: true, fear: 12 },
      { t: "text", s: "3:32. You watch the last minute of safety burn down.", sfx: "breath", fear: 14 },
      { t: "text", s: "3:33. Somewhere in the flat, a chair takes weight.", sfx: "knock", shake: true, fear: 18 },
      {
        t: "choice",
        prompt: "You are awake. Whatever it is knows that.",
        timer: 14,
        options: [
          { label: "Lie still. Pretend to be asleep.", go: "still", fear: 10 },
          { label: "Turn on the lamp.", go: "lamp", fear: 8 },
          { label: "Get up and check the flat.", go: "check", fear: 16 },
        ],
      },
    ],

    still: [
      { t: "text", s: "You keep your breathing slow. In four, out six. You have practised this without meaning to.", fear: 8 },
      { t: "text", s: "The floor creaks at the doorway. Then at the foot of the bed. Then it stops.", sfx: "scrape", fear: 18 },
      { t: "text", s: "The mattress dips near your feet. Not much. The weight of a large cat, or a small child, or a hand.", slow: true, fear: 22 },
      { t: "text", s: "A voice, very close, very polite: \"You're not asleep. I can hear you counting.\"", sfx: "whisper", fear: 24 },
      {
        t: "choice",
        options: [
          { label: "Answer it.", go: "answer", fear: 14 },
          { label: "Keep pretending. Say nothing.", go: "keep", fear: 18 },
        ],
      },
    ],

    keep: [
      { t: "text", s: "You do not answer. You count instead. One. Two. Three.", fear: 16 },
      { t: "text", s: "It counts with you. It is one number ahead each time.", slow: true, sfx: "whisper", fear: 22 },
      { t: "text", s: "When it reaches thirty-three it stops, and so does everything else — the fridge, the traffic, your heart.", sfx: "sting", shake: true, fear: 28 },
      { t: "text", s: "Then the fridge starts again. And the traffic.", hold: 900, fear: 20 },
      { t: "goto", go: "morning" },
    ],

    answer: [
      { t: "text", s: "\"What do you want,\" you whisper, and hate how thin it sounds.", fear: 16 },
      { t: "text", s: "\"The same as last time,\" it says. \"You never remember agreeing. That's the kindness in it.\"", sfx: "whisper", fear: 22 },
      { t: "text", s: "You find you cannot remember any night before night one. Not one single evening.", slow: true, fear: 26 },
      {
        t: "choice",
        prompt: "It is waiting for the answer you always give.",
        timer: 12,
        options: [
          { label: "\"Yes. Take it.\"", go: "yes", fear: 20 },
          { label: "\"No. Not this time.\"", go: "no", fear: 24 },
        ],
      },
    ],

    yes: [
      { t: "text", s: "The weight lifts. The wardrobe door settles to exactly its usual gap.", fear: -14 },
      { t: "text", s: "You sleep beautifully. Ten hours. You have not slept like that in years.", fear: -20, amb: "rain" },
      {
        t: "ending",
        id: "agreed",
        outcome: "doomed",
        title: "The Arrangement",
        lines: [
          "You wake up rested and cannot remember your mother's maiden name.",
          "Next week it will be the street you grew up on. Then her face.",
          "You will keep saying yes, because you will never remember what it costs.",
        ],
      },
    ],

    no: [
      { t: "text", s: "The room gets very cold, very fast, in the way rooms do not.", sfx: "drop", fear: 20 },
      { t: "text", s: "\"Then you keep all of it,\" it says. \"Every single thing. Nothing thrown away. Are you sure.\"", fear: 22 },
      { t: "text", s: "It leaves. The clock says 3:34 for the first time in eleven nights.", slow: true, sfx: "bell", fear: -10 },
      { t: "goto", go: "morning" },
    ],

    lamp: [
      { t: "text", s: "You reach for the lamp. Your hand finds another hand already on the switch.", sfx: "sting", shake: true, fear: 26 },
      { t: "text", s: "It is warm. It is patient. It lets go politely, the way a shop assistant does.", fear: 20 },
      { t: "text", s: "The lamp comes on. Nobody. The bulb is warm on the wrong side, as if it has been on for hours.", fear: 18 },
      {
        t: "choice",
        options: [
          { label: "Check under the bed.", go: "under", fear: 18 },
          { label: "Go back under the covers.", go: "still", fear: 10 },
        ],
      },
    ],

    under: [
      { t: "text", s: "You lower your head over the edge of the mattress. The blood rushes. The floor is very close.", sfx: "breath", fear: 20 },
      { t: "text", s: "There is nothing under the bed except an old phone charger and eleven small scratch marks in the paint.", fear: 14 },
      { t: "text", s: "You count them twice to be sure. Eleven. One for each night.", slow: true, fear: 22 },
      { t: "text", s: "As you watch, the paint peels in a twelfth thin line, from the inside.", sfx: "scrape", shake: true, fear: 26 },
      { t: "goto", go: "check" },
    ],

    check: [
      { t: "text", s: "You get up. The hallway is longer at night; every house does this and every house denies it.", amb: "corridor", fear: 14 },
      { t: "text", s: "The kitchen chair is pulled out. There is a glass of water on the table that you did not pour.", fear: 18 },
      { t: "text", s: "It is still cold. There is a lip print on the rim.", sfx: "whisper", fear: 22 },
      { t: "text", s: "Your phone, face-down on the counter, buzzes once. A photo from your own camera roll. Taken at 3:31.", slow: true, fear: 24 },
      { t: "text", s: "It is you, asleep, taken from the ceiling.", sfx: "sting", shake: true, fear: 30 },
      {
        t: "choice",
        prompt: "The hallway light behind you clicks off.",
        timer: 10,
        options: [
          { label: "Look up.", go: "up", fear: 26 },
          { label: "Leave the flat right now, barefoot.", go: "leave", fear: 14 },
          { label: "Drink the water.", go: "drink", fear: 24 },
        ],
      },
    ],

    drink: [
      { t: "text", s: "You do not decide to drink it. Your arm does. Your hand does. Your mouth does.", fear: 22 },
      { t: "text", s: "It tastes like a coin held under the tongue all day.", sfx: "drop", fear: 24 },
      { t: "text", s: "Somewhere behind your eyes, something says: thank you, that was the last part.", slow: true, sfx: "whisper", fear: 30 },
      {
        t: "ending",
        id: "invited",
        outcome: "worst",
        title: "Invited",
        lines: [
          "In the morning you make breakfast for two out of habit you do not have.",
          "You are perfectly happy. You use your own name comfortably.",
          "At 3:33 tonight you will pull out a chair and pour a glass of water and wait for the new one to wake up.",
        ],
      },
    ],

    up: [
      { t: "text", s: "You look up.", slow: true, sfx: "breath", fear: 28 },
      { t: "text", s: "The ceiling is where ceilings are. The paint is the colour paint is. There is nothing there.", fear: 18 },
      { t: "text", s: "Then the water in the glass ripples, twice, in time with breathing that is not yours.", sfx: "sting", shake: true, fear: 28 },
      { t: "text", s: "You run.", slow: true },
      { t: "goto", go: "leave" },
    ],

    leave: [
      { t: "text", s: "You are on the stairwell in a t-shirt at 3:41. Concrete under bare feet. Sensor lights snapping on ahead of you.", amb: "corridor", fear: 16 },
      { t: "text", s: "They snap on ahead of you. That is the wrong order. They should follow.", slow: true, fear: 22 },
      { t: "text", s: "Something is walking down in front of you at exactly your pace, one flight below, out of sight.", sfx: "knock", fear: 26 },
      {
        t: "choice",
        prompt: "Two more flights to the street.",
        timer: 9,
        options: [
          { label: "Keep going down.", go: "down", fear: 20 },
          { label: "Stop dead and let it get ahead.", go: "stop", fear: 16 },
        ],
      },
    ],

    stop: [
      { t: "text", s: "You stop. The lights below stop too. Whatever it is, it is patient enough to wait forever, and you are not.", fear: 20 },
      { t: "text", s: "You sit on the step until 6am, when a neighbour finds you and walks you down without asking questions.", fear: -16, amb: "rain" },
      {
        t: "ending",
        id: "outwaited",
        outcome: "survived",
        title: "Outwaited",
        lines: [
          "You move out that week. You never sleep in a flat with a wardrobe again.",
          "Sometimes you wake at 3:33 and lie perfectly still until 3:34.",
          "It has never come back. You are almost certain it just lost interest.",
        ],
      },
    ],

    down: [
      { t: "text", s: "You take the last flights three steps at a time and burst into the street.", fear: 14 },
      { t: "text", s: "Cold air. Real orange streetlight. A taxi at the corner with its engine running and its light on.", sfx: "bell", fear: -12, amb: "rain" },
      { t: "text", s: "The driver leans over and opens the door for you before you touch it.", fear: 10 },
      { t: "text", s: "The dashboard clock says 3:33.", slow: true, sfx: "sting", shake: true, fear: 26 },
      {
        t: "ending",
        id: "taxi",
        outcome: "doomed",
        title: "Fare",
        lines: [
          "\"Long night?\" the driver asks, and does not wait for the address.",
          "You watch your own building slide past the window, again, and again, and again.",
          "Every lap, the meter goes up by one minute. 3:33. 3:33. 3:33.",
        ],
      },
    ],

    morning: [
      { t: "text", s: "Somehow it is 7am and light is coming through badly-closed curtains.", amb: "rain", fear: -20 },
      { t: "text", s: "You are exhausted in the particular way of someone who has been awake in a locked room with a stranger.", fear: -6 },
      { t: "text", s: "The wardrobe door is shut properly. It has never been shut properly before.", slow: true, fear: 8 },
      {
        t: "ending",
        id: "refused",
        outcome: "survived",
        title: "Night Twelve Never Came",
        lines: [
          "You keep every memory. All of them. Including the ones you would have paid to lose.",
          "That turns out to be its own kind of haunting, but it is yours.",
          "You sleep with the lamp on for a year, and then you don't have to.",
        ],
      },
    ],
  },
};
