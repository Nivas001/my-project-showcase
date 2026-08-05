import type { Story } from "@/lib/horror/types";

export const nineOclockTape: Story = {
  slug: "nine-oclock-tape",
  title: "The Nine O'Clock Tape",
  hook: "A VHS in a house clearance. Forty minutes of your childhood living room, filmed while you slept.",
  tags: ["found footage", "family", "childhood"],
  fear: 5,
  minutes: "6-8 min",
  ambience: "static",
  endings: 3,
  nodes: {
    start: [
      { t: "text", s: "House clearance. Your mother's place. Forty years of things in eleven bin bags.", amb: "static", fear: 5 },
      { t: "text", s: "At the back of the airing cupboard: a VHS in a sleeve, labelled in biro. 9:00.", fear: 12 },
      { t: "text", s: "You borrow a player from a man on the internet for twelve pounds and set it up in the empty living room.", fear: 10 },
      { t: "text", s: "The tape is your childhood living room, filmed from the corner by the door, at night.", slow: true, sfx: "static", fear: 20 },
      { t: "text", s: "The timestamp reads 21:00. Nothing happens for six minutes.", fear: 16 },
      {
        t: "choice",
        prompt: "The counter says 00:06:14. There are 39 minutes left.",
        timer: 12,
        options: [
          { label: "Fast forward.", go: "ff", fear: 16 },
          { label: "Watch it properly.", go: "watch", fear: 20 },
          { label: "Turn it off and call your brother.", go: "brother", fear: 14 },
        ],
      },
    ],

    brother: [
      { t: "text", s: "\"Nine o'clock,\" he says immediately. \"Don't watch that.\"", fear: 20 },
      { t: "text", s: "\"You know about it?\"", fear: 18 },
      { t: "text", s: "\"Mum filmed it every night for about a year. After the thing with your sleepwalking.\" A pause. \"You don't remember sleepwalking.\"", slow: true, sfx: "whisper", fear: 26 },
      { t: "text", s: "You do not have a sister. You had a sister. Both of those feel true, one after the other, in the same second.", sfx: "sting", shake: true, fear: 30 },
      { t: "goto", go: "watch" },
    ],

    ff: [
      { t: "text", s: "You spool forward. Streaked static, the sofa jerking, the window jumping.", sfx: "scrape", fear: 18 },
      { t: "text", s: "At 00:22:00 there is a shape standing in the middle of the room that is not there at 00:21:59 or 00:22:01.", slow: true, sfx: "sting", fear: 26 },
      { t: "text", s: "You rewind. You go frame by frame. It is there in one frame only, and it is looking at the camera.", fear: 28 },
      { t: "goto", go: "watch" },
    ],

    watch: [
      { t: "text", s: "You let it run. 21:14. The living room door opens and a small child walks in, asleep, arms down.", sfx: "door", fear: 22 },
      { t: "text", s: "It is you. Six years old. You stand in the middle of the carpet facing the corner where the camera is.", fear: 24 },
      { t: "text", s: "You stand there for eleven minutes without moving. The tape hiss is the only sound.", slow: true, sfx: "breath", fear: 26 },
      { t: "text", s: "At 21:25 the child says, clearly, in an adult's voice: \"She's still awake. Tell her to stop filming.\"", sfx: "whisper", shake: true, fear: 30 },
      {
        t: "choice",
        prompt: "Behind the child, the door to the hall is opening again.",
        timer: 10,
        options: [
          { label: "Keep watching.", go: "keep", fear: 26 },
          { label: "Stop the tape.", go: "stop", fear: 20 },
          { label: "Look at the corner of your actual room.", go: "corner", fear: 28 },
        ],
      },
    ],

    corner: [
      { t: "text", s: "You look at the corner by the door. The empty living room. The place the camera stood.", slow: true, fear: 28 },
      { t: "text", s: "There is a rectangle in the dust on the shelf, exactly tripod-sized, and it is not old dust.", sfx: "sting", fear: 30 },
      { t: "text", s: "On the screen, from that exact angle, something breathes on the lens and fogs it.", sfx: "breath", shake: true, fear: 32 },
      { t: "goto", go: "keep" },
    ],

    stop: [
      { t: "text", s: "You hit stop. The screen goes to blue. The room is very quiet and very empty and it is 1:40am.", amb: "silence", fear: 22 },
      { t: "text", s: "The player whirs and starts playing again on its own. The counter reads 00:21:26.", slow: true, sfx: "sting", fear: 28 },
      { t: "text", s: "It will not eject. The button gives, physically, and nothing happens.", fear: 26 },
      {
        t: "choice",
        timer: 8,
        options: [
          { label: "Unplug the player at the wall.", go: "unplug", fear: 22 },
          { label: "Sit down and watch to the end.", go: "keep", fear: 26 },
        ],
      },
    ],

    unplug: [
      { t: "text", s: "You pull the plug. The picture holds on the screen for four full seconds after the power goes.", slow: true, sfx: "drop", fear: 30 },
      { t: "text", s: "In those four seconds, the child on the tape turns and looks at where you are sitting, in the present, in an empty house.", sfx: "sting", shake: true, fear: 34 },
      { t: "goto", go: "night" },
    ],

    keep: [
      { t: "text", s: "21:26. Your mother comes into frame from behind the camera, kneels in front of the child, and holds its face.", fear: 24 },
      { t: "text", s: "\"You're not hers,\" she says, calmly, on tape, thirty-one years ago. \"You come back at nine and you take him back with you.\"", sfx: "whisper", fear: 30 },
      { t: "text", s: "The child says: \"He likes it here.\"", slow: true, sfx: "sting", shake: true, fear: 32 },
      { t: "text", s: "The tape cuts to static at 21:27 and runs static for the remaining thirty-two minutes.", amb: "static", fear: 26 },
      {
        t: "choice",
        prompt: "There is one more label on the sleeve, on the inside, in the same biro: 'if he ever watches this'.",
        timer: 9,
        options: [
          { label: "Read the rest of the note.", go: "note", fear: 24 },
          { label: "Burn the tape in the garden.", go: "burn", fear: 18 },
        ],
      },
    ],

    note: [
      { t: "text", s: "You unfold the sleeve. Her handwriting, small, careful, the hand of a woman writing at 3am.", fear: 22 },
      { t: "text", s: "\"If he ever watches this — he was six. He came back on the eleventh night. I don't know which one came back.\"", slow: true, sfx: "whisper", fear: 30 },
      { t: "text", s: "\"I loved him anyway. I want that on the record. I loved whichever one it was.\"", fear: 28 },
      {
        t: "choice",
        timer: 8,
        options: [
          { label: "Look at your reflection in the dead screen.", go: "reflection", fear: 28 },
          { label: "Put the tape and the note back in the cupboard and leave the house.", go: "leave", fear: 18 },
        ],
      },
    ],

    reflection: [
      { t: "text", s: "The blue screen dies to black and gives you back your own face at the correct size and the correct distance.", slow: true, fear: 26 },
      { t: "text", s: "Behind your reflection, in the corner by the door, a six-year-old is standing with its arms down, asleep, facing you.", sfx: "sting", shake: true, fear: 34 },
      { t: "text", s: "It has been there since 21:14, thirty-one years ago.", slow: true, fear: 32 },
      {
        t: "ending",
        id: "eleventh-night",
        outcome: "worst",
        title: "The Eleventh Night",
        lines: [
          "\"You're late,\" it says, in the adult voice, from the child's mouth.",
          "You do not remember driving home, and you have not needed to sleep since.",
          "Every night at nine you stand in the middle of a room and face a corner, and something very old finally gets to rest.",
        ],
      },
    ],

    burn: [
      { t: "text", s: "Garden. Bin lid. Lighter fluid from the shed that has been there since she was alive.", amb: "rain", fear: 16 },
      { t: "text", s: "The tape burns badly, the way plastic does, and the smoke smells like a hot television.", sfx: "drop", fear: 14 },
      { t: "text", s: "In the smoke, briefly, at the height of a six-year-old, there is a shape. Then rain, and then nothing.", slow: true, fear: 20 },
      { t: "goto", go: "night" },
    ],

    leave: [
      { t: "text", s: "You put it back in the airing cupboard where she left it and you shut the door.", fear: 16 },
      { t: "text", s: "You post the keys through the letterbox at 2am and drive home too fast.", amb: "rain", fear: -14 },
      { t: "goto", go: "night" },
    ],

    night: [
      { t: "text", s: "You sleep in your own bed with the light on, like an adult who has decided to allow it.", amb: "rain", fear: -20 },
      { t: "text", s: "You wake at 9:00pm the following evening standing in your living room, facing the corner by the door.", slow: true, sfx: "sting", fear: 24 },
      {
        t: "ending",
        id: "nine-oclock",
        outcome: "survived",
        title: "Nine O'Clock",
        lines: [
          "It happens twice more that month, and then it stops, and then you are fine for eleven years.",
          "You never sleepwalk again, and you never once mention it to your brother.",
          "You do not own a television that can be watched from the corner by the door. That is not superstition. That is furniture.",
        ],
      },
    ],
  },
};
