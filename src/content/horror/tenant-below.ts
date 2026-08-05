import type { Story } from "@/lib/horror/types";

export const tenantBelow: Story = {
  slug: "tenant-below",
  title: "The Tenant Below",
  hook: "The flat downstairs has been empty for two years. Someone is moving furniture at night.",
  tags: ["apartment", "slow build", "neighbour"],
  fear: 4,
  minutes: "5-7 min",
  ambience: "corridor",
  endings: 3,
  nodes: {
    start: [
      { t: "text", s: "It starts as scraping. Furniture, you tell yourself. Someone moving a wardrobe at 2am.", amb: "corridor", fear: 6 },
      { t: "text", s: "It happens again the next night. And the next. Always the same route across the ceiling below your floor.", sfx: "scrape", fear: 10 },
      { t: "text", s: "You check with the building manager. Flat 4B has been empty since the previous tenant died in it.", slow: true, fear: 16 },
      { t: "text", s: "\"Nothing in there,\" he says. \"Not even a bed. We stripped it.\"", fear: 14 },
      {
        t: "choice",
        prompt: "2:04am. It has started again.",
        timer: 13,
        options: [
          { label: "Bang on the floor.", go: "bang", fear: 12 },
          { label: "Record it on your phone.", go: "record", fear: 10 },
          { label: "Go down and knock on 4B.", go: "knock", fear: 18 },
        ],
      },
    ],

    bang: [
      { t: "text", s: "You slam the heel of your hand into the floorboards three times.", sfx: "knock", fear: 10 },
      { t: "text", s: "The scraping stops instantly.", hold: 1200, fear: 14 },
      { t: "text", s: "Three knocks come back. From directly beneath your hand.", sfx: "knock", shake: true, fear: 22 },
      { t: "text", s: "Then three more, further along the floor. Then three at the wall by your head.", slow: true, fear: 24 },
      {
        t: "choice",
        options: [
          { label: "Knock back. Four times, deliberately.", go: "four", fear: 16 },
          { label: "Stop. Go to bed. Ignore it.", go: "ignore", fear: 12 },
        ],
      },
    ],

    four: [
      { t: "text", s: "You knock four. There is a long pause, like something checking a rule book.", fear: 18 },
      { t: "text", s: "Then four knocks — but from inside your flat. From the hallway cupboard.", sfx: "sting", shake: true, fear: 28 },
      { t: "goto", go: "cupboard" },
    ],

    cupboard: [
      { t: "text", s: "The cupboard is where you keep the hoover and a box of your father's things.", fear: 20 },
      { t: "text", s: "The door is closed. The knocking is coming from behind it, at the height of a knee.", sfx: "knock", fear: 24 },
      {
        t: "choice",
        prompt: "It is knocking politely. That is the worst detail.",
        timer: 10,
        options: [
          { label: "Open the cupboard.", go: "open", fear: 26 },
          { label: "Push the sofa against it and leave the flat.", go: "flee", fear: 16 },
        ],
      },
    ],

    open: [
      { t: "text", s: "You open it. The hoover. The box. A smell of dust and cold brick.", fear: 16 },
      { t: "text", s: "And in the back wall, where there should be plaster, a rectangle of darkness the shape of a doorway.", slow: true, sfx: "door", fear: 26 },
      { t: "text", s: "Cold air comes out of it, carrying the smell of a flat nobody has aired in two years.", sfx: "breath", fear: 24 },
      {
        t: "choice",
        options: [
          { label: "Go through.", go: "through", fear: 24 },
          { label: "Close the door and never open it again.", go: "sealed", fear: 10 },
        ],
      },
    ],

    through: [
      { t: "text", s: "You duck through into 4B. Bare boards. No furniture. Exactly as promised.", amb: "silence", fear: 22 },
      { t: "text", s: "Except for the drag marks. Hundreds of them, in every direction, worn into the wood.", sfx: "scrape", fear: 26 },
      { t: "text", s: "And in the middle of the room, on the floor, a shape made of the marks: a diagram of your flat upstairs.", slow: true, fear: 28 },
      { t: "text", s: "There is an X in your bedroom. There is a second X, newer, in the cupboard you just came from.", sfx: "sting", shake: true, fear: 32 },
      {
        t: "ending",
        id: "measured",
        outcome: "worst",
        title: "Measured",
        lines: [
          "Behind you, the doorway is plaster again. Solid. Painted. Old.",
          "The scraping starts on the ceiling above you. Someone is moving furniture in your flat.",
          "In a few weeks the new tenant will complain about the noise from 4B.",
        ],
      },
    ],

    sealed: [
      { t: "text", s: "You close it. You screw a bracket across it at 3am with a screwdriver and shaking hands.", fear: -10 },
      { t: "text", s: "The knocking continues for six more nights, then stops, the way rain stops.", fear: -16, amb: "rain" },
      {
        t: "ending",
        id: "bracket",
        outcome: "survived",
        title: "Six More Nights",
        lines: [
          "You live there another year. You never store anything in that cupboard again.",
          "When you move out you do not mention the bracket, and the letting agent does not ask.",
          "Somebody lives there now. You hope they are heavy sleepers.",
        ],
      },
    ],

    flee: [
      { t: "text", s: "You shove the sofa across, grab keys, and get out into the stairwell.", fear: 14 },
      { t: "text", s: "You make it two flights before you notice the door of 4B is standing open, and the light inside is on.", sfx: "door", fear: 24 },
      { t: "goto", go: "insideFlat" },
    ],

    ignore: [
      { t: "text", s: "You go to bed. Miraculously, you sleep.", fear: -8 },
      { t: "text", s: "In the morning there is a fine layer of plaster dust on your bedroom floor, in a line, like a path.", slow: true, fear: 18 },
      { t: "text", s: "It leads from the cupboard to the side of your bed and stops where you sleep.", sfx: "whisper", fear: 24 },
      { t: "goto", go: "knock" },
    ],

    record: [
      { t: "text", s: "You put the phone face-down on the floor and hit record. Eleven minutes of scraping.", fear: 10 },
      { t: "text", s: "You listen back with headphones at noon, in daylight, feeling foolish.", fear: 6 },
      { t: "text", s: "Under the scraping there is a voice. Slow, patient, reading a list.", sfx: "whisper", fear: 20 },
      { t: "text", s: "It is reading the names of everyone who has ever lived in your flat. Yours is last. Yours is repeated.", slow: true, sfx: "sting", shake: true, fear: 26 },
      { t: "goto", go: "knock" },
    ],

    knock: [
      { t: "text", s: "You go down one flight. The door of 4B is painted the same tired green as every other door.", amb: "corridor", fear: 16 },
      { t: "text", s: "You knock. The sound goes into the flat and does not come back out. No echo. Nothing.", sfx: "knock", fear: 20 },
      { t: "text", s: "The handle turns from the inside.", slow: true, sfx: "door", shake: true, fear: 26 },
      {
        t: "choice",
        prompt: "The door swings in six inches. It is dark in there.",
        timer: 10,
        options: [
          { label: "Go inside.", go: "insideFlat", fear: 22 },
          { label: "Say hello.", go: "hello", fear: 18 },
          { label: "Walk away and call the police in the morning.", go: "police", fear: 12 },
        ],
      },
    ],

    hello: [
      { t: "text", s: "\"Hello?\" you say, into the gap.", fear: 18 },
      { t: "text", s: "\"Hello?\" the flat says back — in your voice, at your volume, one half-second later. Not an echo. A copy.", sfx: "whisper", shake: true, fear: 28 },
      { t: "text", s: "\"Come in,\" it adds, in your voice, sounding delighted with itself.", fear: 26 },
      { t: "goto", go: "insideFlat" },
    ],

    police: [
      { t: "text", s: "You go back up. You lock your door and put a chair under the handle like a child.", fear: 10 },
      { t: "text", s: "At 3:40 the scraping starts again, but it is no longer below you.", slow: true, sfx: "scrape", fear: 24 },
      { t: "text", s: "It is in the hall. Something is dragging furniture into a shape outside your bedroom door.", sfx: "sting", shake: true, fear: 30 },
      {
        t: "ending",
        id: "arranged",
        outcome: "doomed",
        title: "Rearranged",
        lines: [
          "In the morning your furniture has been moved into a perfect diagram of the flat below.",
          "You call the police. They find nothing, and they look at you the way people look at the tired.",
          "Every night since, you wake to the sound of your own things being rearranged, and every morning they are exactly where you left them.",
        ],
      },
    ],

    insideFlat: [
      { t: "text", s: "You step in. Bare boards. No furniture. Cold as a fridge.", amb: "silence", fear: 22 },
      { t: "text", s: "In the middle of the empty living room there is a single kitchen chair facing the window.", fear: 24 },
      { t: "text", s: "Someone is sitting in it, very still, with their back to you.", sfx: "breath", slow: true, fear: 28 },
      {
        t: "choice",
        prompt: "They have not moved. They may never have moved.",
        timer: 8,
        options: [
          { label: "Walk around to see the face.", go: "face", fear: 26 },
          { label: "Back out slowly.", go: "back", fear: 16 },
        ],
      },
    ],

    back: [
      { t: "text", s: "You step backwards. The chair does not turn. You keep it in sight the whole way to the door.", fear: 18 },
      { t: "text", s: "As you cross the threshold, the front door of 4B closes itself gently, like someone being considerate.", sfx: "door", fear: 14 },
      { t: "text", s: "The scraping never happens again.", slow: true, fear: -20, amb: "rain" },
      {
        t: "ending",
        id: "declined",
        outcome: "survived",
        title: "Politely Declined",
        lines: [
          "You never learn who was in the chair, and that is the only reason you can still sleep.",
          "Two years later a family moves into 4B and you say nothing at all.",
          "You do sometimes hear a chair being pulled out, upstairs, in a flat with nobody in it.",
        ],
      },
    ],

    face: [
      { t: "text", s: "You walk around the chair. Your shoes are loud. The room lets them be loud.", fear: 24 },
      { t: "text", s: "The figure is wearing your coat. Your shoes. Your watch, on the wrong wrist.", sfx: "sting", shake: true, fear: 30 },
      { t: "text", s: "It opens its eyes without turning its head and says: \"Finally. I've been holding it for you.\"", slow: true, sfx: "whisper", fear: 32 },
      {
        t: "ending",
        id: "swapped",
        outcome: "worst",
        title: "Holding It For You",
        lines: [
          "It stands up. You sit down. Neither of you decides to do this.",
          "You hear your own footsteps go up one flight and let themselves into your flat.",
          "You face the window. You are extremely patient now. In two years, someone upstairs will start complaining about the scraping.",
        ],
      },
    ],
  },
};
