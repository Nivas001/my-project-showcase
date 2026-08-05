import type { Story } from "@/lib/horror/types";

export const wardNine: Story = {
  slug: "ward-nine",
  title: "Ward Nine",
  hook: "Night duty on a closed ward. Nine beds. Nine charts. Ten patients.",
  tags: ["hospital", "night duty", "counting"],
  fear: 5,
  minutes: "6-8 min",
  ambience: "hospital",
  endings: 3,
  nodes: {
    start: [
      { t: "text", s: "Ward Nine closed in 2019 and reopened last winter because the hospital ran out of anywhere else to put people.", amb: "hospital", fear: 6 },
      { t: "text", s: "Nine beds down one long room. Curtain rails. That green nobody has chosen on purpose since 1974.", fear: 8 },
      { t: "text", s: "You do rounds at 00:00, 02:00 and 04:00. Count the beds, check the charts, sign the sheet.", fear: 6 },
      { t: "text", s: "At 02:00 you count ten sleeping shapes and nine charts.", slow: true, sfx: "sting", fear: 22 },
      {
        t: "choice",
        prompt: "You count again from the other end. Ten.",
        timer: 12,
        options: [
          { label: "Walk the row and check every face.", go: "faces", fear: 20 },
          { label: "Call the night sister.", go: "sister", fear: 12 },
          { label: "Turn the lights on. All of them.", go: "lights", fear: 16 },
        ],
      },
    ],

    lights: [
      { t: "text", s: "You hit the bank of switches. The fluorescents come on in a stutter down the length of the ward.", sfx: "drop", fear: 14 },
      { t: "text", s: "Nine beds. Nine patients. Nobody wakes up, which is itself strange under that much light.", fear: 18 },
      { t: "text", s: "Bed 10 does not exist. There is a bed-shaped gap in the dust on the floor where it was standing.", slow: true, fear: 24 },
      { t: "goto", go: "faces" },
    ],

    sister: [
      { t: "text", s: "The internal phone rings a long time. When it picks up there is only breathing, unhurried.", sfx: "breath", fear: 20 },
      { t: "text", s: "\"Ward Nine,\" you say. \"I've got a count discrepancy.\"", fear: 18 },
      { t: "text", s: "\"Yes,\" says the night sister. \"We've had that on Nine since 2019. Don't check the faces.\"", slow: true, sfx: "whisper", fear: 26 },
      { t: "text", s: "The line goes dead. The switchboard log will later show no call was made from Ward Nine that night.", fear: 24 },
      {
        t: "choice",
        prompt: "Don't check the faces.",
        timer: 10,
        options: [
          { label: "Check the faces.", go: "faces", fear: 24 },
          { label: "Sit at the desk until 04:00.", go: "desk", fear: 16 },
        ],
      },
    ],

    desk: [
      { t: "text", s: "You sit. You do paperwork you already did. You do not look up for ninety minutes, which is a skill you did not know you had.", fear: 16 },
      { t: "text", s: "At 03:51 someone in the ward starts crying, very quietly, the way adults cry when they don't want to be heard.", sfx: "whisper", fear: 24 },
      {
        t: "choice",
        timer: 9,
        options: [
          { label: "Go to them. You're a nurse.", go: "crying", fear: 22 },
          { label: "Stay at the desk. Nine minutes to go.", go: "hold", fear: 18 },
        ],
      },
    ],

    hold: [
      { t: "text", s: "You stay. The crying stops at 03:58 in the middle of a breath.", slow: true, fear: 22 },
      { t: "text", s: "At 04:00 you do the round. Nine beds, nine charts, nine patients, all asleep, all fine.", fear: -14 },
      { t: "text", s: "One of them has been crying. You can see it on her face. She has been unconscious for three weeks.", sfx: "sting", fear: 24 },
      { t: "goto", go: "dawn" },
    ],

    crying: [
      { t: "text", s: "You follow the sound to bed seven and pull the curtain.", sfx: "scrape", fear: 22 },
      { t: "text", s: "Mrs Aravindan, eighty-one, unconscious for three weeks, is sitting up straight with dry eyes and a dry face.", slow: true, fear: 26 },
      { t: "text", s: "\"It's in the tenth bed,\" she says, in a young man's voice. \"It's been very good. It's waited all night.\"", sfx: "whisper", shake: true, fear: 30 },
      { t: "text", s: "She lies back down. Her monitor never registered that she moved.", fear: 28 },
      { t: "goto", go: "tenth" },
    ],

    faces: [
      { t: "text", s: "You start at bed one and work down with your penlight, checking each face against each chart.", fear: 20 },
      { t: "text", s: "One: correct. Two: correct. Three, four, five, six, seven, eight: correct.", fear: 18 },
      { t: "text", s: "Nine: correct. And past nine, in the dark at the end of the ward, there is a tenth bed with the curtain drawn.", slow: true, sfx: "sting", fear: 28 },
      { t: "goto", go: "tenth" },
    ],

    tenth: [
      { t: "text", s: "The curtain around bed ten is closed. Behind it, someone is breathing at exactly your rate.", sfx: "breath", fear: 26 },
      { t: "text", s: "When you slow your breathing, so does it. When you hold your breath, the ward is completely silent.", slow: true, fear: 30 },
      {
        t: "choice",
        prompt: "Your hand is six inches from the curtain.",
        timer: 8,
        options: [
          { label: "Open the curtain.", go: "openCurtain", fear: 28 },
          { label: "Walk away and finish the shift.", go: "walkAway", fear: 18 },
          { label: "Say: \"I know you're not a patient.\"", go: "speak", fear: 24 },
        ],
      },
    ],

    speak: [
      { t: "text", s: "\"I know you're not a patient.\"", fear: 24 },
      { t: "text", s: "\"No,\" says the curtain, agreeably. \"I'm staff. I've been on nights here for a very long time.\"", sfx: "whisper", fear: 28 },
      { t: "text", s: "\"Nine beds is the rule,\" it says. \"There's always a tenth. Somebody has to be in it. You're the one still standing up.\"", slow: true, sfx: "sting", shake: true, fear: 32 },
      {
        t: "choice",
        timer: 7,
        options: [
          { label: "Run for the ward doors.", go: "run", fear: 24 },
          { label: "Lie down in the tenth bed.", go: "lie", fear: 30 },
        ],
      },
    ],

    lie: [
      { t: "text", s: "You are so tired. You have been so tired since 2019, which is strange, because you started in March.", slow: true, fear: 30 },
      { t: "text", s: "The sheets are cold and clean and they fit you as though someone measured.", fear: 28 },
      {
        t: "ending",
        id: "tenth-bed",
        outcome: "worst",
        title: "The Tenth Bed",
        lines: [
          "The 04:00 round is done by someone. Nine beds, nine charts. The count is correct again.",
          "You are extremely comfortable. You cannot get up, but you have not wanted to for hours.",
          "In a few months a new nurse will count ten shapes and nine charts, and you will breathe at exactly their rate, and wait.",
        ],
      },
    ],

    openCurtain: [
      { t: "text", s: "You pull the curtain back in one movement, because slow would be worse.", sfx: "scrape", fear: 28 },
      { t: "text", s: "The bed is made. Hospital corners. Empty.", hold: 1000, fear: 22 },
      { t: "text", s: "The pillow has a deep, fresh dent in it, and the mattress is warm at body temperature.", slow: true, sfx: "sting", shake: true, fear: 30 },
      { t: "text", s: "Behind you, down the ward, nine curtains close one after another, in order, quickly.", sfx: "scrape", fear: 32 },
      { t: "goto", go: "run" },
    ],

    run: [
      { t: "text", s: "You run the length of Ward Nine. It is longer than it was. Wards do this at night; every nurse knows it and none of them say it.", amb: "corridor", fear: 26 },
      { t: "text", s: "You get to the doors. They open. The corridor outside is Ward Nine again, from the other end.", slow: true, sfx: "door", fear: 30 },
      {
        t: "choice",
        prompt: "Nine beds. Ten shapes.",
        timer: 7,
        options: [
          { label: "Keep running. Do it again.", go: "again", fear: 24 },
          { label: "Stop. Do the 04:00 round properly.", go: "round", fear: 20 },
        ],
      },
    ],

    again: [
      { t: "text", s: "You run it eleven times. Each time the ward is a little shorter and the tenth bed is a little closer to the doors.", fear: 30 },
      { t: "text", s: "On the twelfth run the tenth bed is in the doorway, and you are too tired to go around it.", slow: true, fear: 32 },
      { t: "goto", go: "lie" },
    ],

    round: [
      { t: "text", s: "You stop. You take out the charts. You do the round properly, at 04:00, out loud, by name.", fear: 16 },
      { t: "text", s: "\"Bed one, Mr Fernandes, stable. Bed two, Mrs Kaur, stable.\" Naming them seems to hold the room in place.", sfx: "bell", fear: -12 },
      { t: "text", s: "At bed ten you say, clearly: \"No patient. Bed unoccupied. Ward Nine has nine beds.\"", slow: true, fear: -18 },
      { t: "text", s: "Something exhales, disappointed but professional, and the ward is the correct length again.", fear: -20, amb: "rain" },
      { t: "goto", go: "dawn" },
    ],

    walkAway: [
      { t: "text", s: "You walk away. It takes everything you have not to look back, and you do not look back.", fear: 18 },
      { t: "text", s: "You sign the sheet at 04:00: nine beds, nine charts, all correct. You mean it as a spell, not a lie.", fear: -10 },
      { t: "goto", go: "dawn" },
    ],

    dawn: [
      { t: "text", s: "The day staff arrive at 07:00 with coffee and complaints about parking.", amb: "rain", fear: -22 },
      { t: "text", s: "Nobody mentions a tenth bed. There is no tenth bed. There is a bed-shaped gap in the dust at the end of the ward.", fear: -10 },
      {
        t: "ending",
        id: "handover",
        outcome: "survived",
        title: "Handover",
        lines: [
          "You do four more nights on Nine and then transfer to A&E, where at least the horror is the ordinary kind.",
          "You always count beds twice now. Every ward. Every hospital. Every time.",
          "Once, in a different city, in a different building, you counted one too many. You went home sick and never went back to that ward.",
        ],
      },
    ],
  },
};
