import type { Story } from "@/lib/horror/types";

export const theSubstitute: Story = {
  slug: "the-substitute",
  title: "The Substitute",
  hook: "Detention, 6pm, an empty school. The teacher supervising you retired in 1997.",
  tags: ["school", "after hours", "wrong adult"],
  fear: 4,
  minutes: "5-7 min",
  ambience: "corridor",
  endings: 3,
  nodes: {
    start: [
      { t: "text", s: "Detention runs until 6. By 5:50 the school is empty in the way only schools get empty.", amb: "corridor", fear: 6 },
      { t: "text", s: "There are three of you in Room 12 and one teacher at the front marking a stack of books.", fear: 8 },
      { t: "text", s: "You don't know him. Grey cardigan. Neat parting. He has not turned a page in twenty minutes.", slow: true, fear: 16 },
      { t: "text", s: "At 5:58 he says, without looking up: \"Nobody leaves at six. That's not when it ends.\"", sfx: "whisper", fear: 22 },
      {
        t: "choice",
        prompt: "Priya, next to you, has already picked up her bag.",
        timer: 12,
        options: [
          { label: "Leave with her at six.", go: "leave", fear: 18 },
          { label: "Stay in your seat.", go: "stay", fear: 16 },
          { label: "Ask him his name.", go: "name", fear: 20 },
        ],
      },
    ],

    name: [
      { t: "text", s: "\"Sir — sorry — which department are you?\"", fear: 18 },
      { t: "text", s: "He looks up. His face is entirely normal, and it does not move at all while he speaks.", slow: true, fear: 26 },
      { t: "text", s: "\"Mr Colliss. I took Year 9 English. I retired in 1997 and I have been extremely bored.\"", sfx: "sting", fear: 30 },
      { t: "text", s: "In the corridor there is a memorial photo board. You have walked past it every day for three years. You know the name.", fear: 28 },
      { t: "goto", go: "stay" },
    ],

    leave: [
      { t: "text", s: "Priya gets to the door first. The handle turns. The door opens onto Room 12.", slow: true, sfx: "door", fear: 26 },
      { t: "text", s: "Same desks. Same three chairs. Same man at the front, marking, in the same cardigan.", sfx: "sting", shake: true, fear: 30 },
      { t: "text", s: "She closes it very carefully and comes back and sits down without a word.", fear: 24 },
      { t: "goto", go: "stay" },
    ],

    stay: [
      { t: "text", s: "Six o'clock passes. The heating clicks off. The corridor lights outside go to their overnight setting.", fear: 18 },
      { t: "text", s: "\"Right,\" says Mr Colliss. \"Register. When I say your name, say yes sir.\"", fear: 22 },
      { t: "text", s: "He reads four names. There are three of you.", slow: true, sfx: "whisper", fear: 28 },
      {
        t: "choice",
        prompt: "The fourth name is read twice. Nobody answers it.",
        timer: 10,
        options: [
          { label: "Answer for the fourth name.", go: "answerFourth", fear: 26 },
          { label: "Say nothing.", go: "silent", fear: 22 },
          { label: "Ask who the fourth is.", go: "askFourth", fear: 24 },
        ],
      },
    ],

    askFourth: [
      { t: "text", s: "\"Sir, who's Daniel Okafor? There's nobody called that in our year.\"", fear: 24 },
      { t: "text", s: "\"No,\" he agrees pleasantly. \"There's nobody called that in any year. Not since he stopped answering.\"", slow: true, sfx: "whisper", fear: 30 },
      { t: "text", s: "At the back of the room, a chair that nobody is sitting on slides in neatly under a desk.", sfx: "scrape", shake: true, fear: 32 },
      { t: "goto", go: "silent" },
    ],

    answerFourth: [
      { t: "text", s: "\"Yes sir,\" you say, for a name that isn't yours, because the silence was unbearable.", fear: 26 },
      { t: "text", s: "He ticks the register. He looks up. \"Thank you, Daniel. Everyone else, you can go.\"", slow: true, sfx: "sting", shake: true, fear: 32 },
      { t: "text", s: "The door opens onto the actual corridor. Priya doesn't move. She is looking at you like she's already at your funeral.", fear: 30 },
      {
        t: "choice",
        timer: 6,
        options: [
          { label: "Take it back. \"That's not my name.\"", go: "takeBack", fear: 26 },
          { label: "Let them go. Stay.", go: "stayBack", fear: 30 },
        ],
      },
    ],

    takeBack: [
      { t: "text", s: "\"That's not my name, sir.\"", fear: 26 },
      { t: "text", s: "The room gets very cold. He puts down his pen for the first time in an hour.", sfx: "drop", fear: 28 },
      { t: "text", s: "\"No,\" he says. \"But you said yes to it. That counts. It's always counted. Ask Daniel.\"", slow: true, sfx: "whisper", fear: 32 },
      { t: "goto", go: "corridorRun" },
    ],

    stayBack: [
      { t: "text", s: "You nod them out. Priya cries silently the whole way to the door and still goes through it, which is the honest thing.", fear: 28 },
      { t: "text", s: "The door shuts. The register is closed. Mr Colliss starts a new page and asks you to read aloud from the top.", slow: true, fear: 30 },
      {
        t: "ending",
        id: "daniel",
        outcome: "worst",
        title: "Present, Sir",
        lines: [
          "The school records list one detention that evening, three names, all signed out at 18:02.",
          "Your family reports you missing at nine. Priya tells them everything and is not believed, and eventually stops saying it.",
          "Every Thursday at six, in Room 12, the register is read. There are five names on it now.",
        ],
      },
    ],

    silent: [
      { t: "text", s: "Nobody answers. Mr Colliss waits with the patience of chalk dust.", fear: 22 },
      { t: "text", s: "\"Fine,\" he says. \"Then we do the lesson. Sixty minutes. Nobody leaves early. That's the whole rule and it has never once been broken.\"", fear: 24 },
      { t: "text", s: "He writes the date on the board. 14th November 1997.", slow: true, sfx: "sting", fear: 30 },
      {
        t: "choice",
        prompt: "Priya mouths: window.",
        timer: 9,
        options: [
          { label: "Go for the window.", go: "window", fear: 26 },
          { label: "Sit through the hour.", go: "hour", fear: 24 },
          { label: "Run for the corridor together.", go: "corridorRun", fear: 26 },
        ],
      },
    ],

    window: [
      { t: "text", s: "Ground floor. Old sash windows, painted shut every summer, never quite sealed.", fear: 24 },
      { t: "text", s: "Two of you get it up eight inches. Cold real air comes in and it smells like November and freedom.", sfx: "scrape", fear: -8 },
      { t: "text", s: "Outside the window it is the school field, at night, in the rain, and there are three children standing on it in uniform, watching the window.", slow: true, sfx: "sting", shake: true, fear: 32 },
      { t: "text", s: "They are wearing the old uniform. The one they changed in 1998.", fear: 30 },
      {
        t: "choice",
        timer: 6,
        options: [
          { label: "Climb out anyway.", go: "field", fear: 28 },
          { label: "Shut the window.", go: "hour", fear: 22 },
        ],
      },
    ],

    field: [
      { t: "text", s: "You go out first, one leg, then the other, onto wet grass.", fear: 28 },
      { t: "text", s: "The three on the field do not come closer. One of them shakes his head, slowly, and points back at the window.", slow: true, fear: 30 },
      { t: "text", s: "Behind you, in the classroom, Priya is putting her hand up to answer a question.", sfx: "whisper", fear: 30 },
      {
        t: "choice",
        prompt: "The field gate is forty metres away and open.",
        timer: 6,
        options: [
          { label: "Run for the gate.", go: "gate", fear: 24 },
          { label: "Climb back in for Priya.", go: "backIn", fear: 28 },
        ],
      },
    ],

    backIn: [
      { t: "text", s: "You go back in. You grab her wrist mid-answer and haul her over the sill and you both hit the grass hard.", fear: 26 },
      { t: "text", s: "Behind you, Mr Colliss does not shout. He says, mildly: \"Well. That's a first.\"", slow: true, sfx: "whisper", fear: 24 },
      { t: "goto", go: "gate" },
    ],

    gate: [
      { t: "text", s: "You run. The field is longer than a field. The gate stays forty metres away for what feels like a full minute.", fear: 26 },
      { t: "text", s: "Then it is right there, and you are through it, and you are on a pavement under a streetlight at 7:04pm.", sfx: "bell", fear: -24, amb: "rain" },
      {
        t: "ending",
        id: "gate",
        outcome: "survived",
        title: "Out Before The Bell",
        lines: [
          "Nobody at school will discuss Room 12, and the door is kept locked \"for storage\".",
          "You look up Mr Colliss. He retired in 1997 and died in the November of that year, in the building, during a Thursday detention.",
          "You finish school. You never stay past five. You are not the last one out of any building, ever again.",
        ],
      },
    ],

    corridorRun: [
      { t: "text", s: "You go for the corridor. All three of you, chairs over, bags left behind.", fear: 26 },
      { t: "text", s: "The corridor is the right corridor and the wrong length. The memorial photo board slides past you again and again.", slow: true, sfx: "scrape", fear: 30 },
      { t: "text", s: "On the fourth pass you see your own photo on it, and the date under it is this year.", sfx: "sting", shake: true, fear: 34 },
      {
        t: "choice",
        timer: 6,
        options: [
          { label: "Take your photo off the board.", go: "photo", fear: 28 },
          { label: "Keep running for the doors.", go: "gate", fear: 24 },
        ],
      },
    ],

    photo: [
      { t: "text", s: "You take it down. The pin goes into your thumb. The corridor stops being infinite immediately.", fear: -14 },
      { t: "text", s: "Behind you, Room 12 is dark and locked and dusty, the way it has apparently been for years.", slow: true, fear: -18, amb: "rain" },
      {
        t: "ending",
        id: "photo",
        outcome: "survived",
        title: "Off The Board",
        lines: [
          "The photo is in your wallet. It has been for years. You have never once been able to throw it away.",
          "There is a small pale rectangle on the memorial board where it used to be, and nobody has ever filled it.",
          "Priya and the third boy do not remember any of it. You have stopped bringing it up.",
        ],
      },
    ],

    hour: [
      { t: "text", s: "You sit through it. Sixty minutes of Mr Colliss teaching a 1997 English lesson to three children in the dark.", fear: 24 },
      { t: "text", s: "He is, and this is the strangest part, an extremely good teacher. You will remember the poem for the rest of your life.", slow: true, fear: 18 },
      { t: "text", s: "At 7:00 exactly he closes the book. \"That's the hour. Off you go. Straight home, no dawdling.\"", sfx: "bell", fear: -20 },
      { t: "text", s: "The door opens onto the actual corridor. The lights are on. Somewhere a caretaker is whistling.", fear: -22, amb: "rain" },
      {
        t: "ending",
        id: "detention-served",
        outcome: "doomed",
        title: "Detention Served",
        lines: [
          "You are not harmed. You are not followed. You go home and eat dinner and nobody notices anything.",
          "But you were marked present, in a register, in a room, in 1997.",
          "Every few years — a new job, a new city, a Thursday — a door opens onto Room 12 instead of where it should go, and someone says your name, and you have to answer.",
        ],
      },
    ],
  },
};
