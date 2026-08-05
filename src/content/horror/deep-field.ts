import type { Story } from "@/lib/horror/types";

export const deepField: Story = {
  slug: "deep-field",
  title: "Deep Field",
  hook: "A flooded quarry, forty metres down, one torch. There is a village at the bottom, and its lights are on.",
  tags: ["underwater", "drowned village", "claustrophobia"],
  fear: 5,
  minutes: "6-8 min",
  ambience: "silence",
  endings: 3,
  nodes: {
    start: [
      { t: "text", s: "The quarry flooded in 1961 and took a village with it. Divers go for the church spire, which is at twenty-two metres.", amb: "silence", fear: 8 },
      { t: "text", s: "You have done this dive nine times. Your buddy, Ravi, has done it thirty.", fear: 6 },
      { t: "text", s: "At eighteen metres the water goes from green to brown to nothing.", sfx: "breath", fear: 14 },
      { t: "text", s: "At twenty-two metres your torch finds the spire. And behind it, further down, a light that is not yours.", slow: true, sfx: "sting", fear: 22 },
      {
        t: "choice",
        prompt: "Ravi taps your arm and points up. Your gauge says you have eleven minutes.",
        timer: 12,
        options: [
          { label: "Signal down. Go look.", go: "down", fear: 20 },
          { label: "Agree. Ascend.", go: "ascend", fear: 12 },
          { label: "Signal Ravi to wait and go alone.", go: "alone", fear: 24 },
        ],
      },
    ],

    ascend: [
      { t: "text", s: "You start up. Discipline. Good practice. Nobody ever died of going home.", fear: -8 },
      { t: "text", s: "At fifteen metres you look down out of habit.", slow: true, fear: 14 },
      { t: "text", s: "The light is at twenty-two metres now, at the spire, where you were. It is following at exactly your speed.", sfx: "sting", shake: true, fear: 26 },
      {
        t: "choice",
        timer: 8,
        options: [
          { label: "Keep ascending, controlled.", go: "controlled", fear: 18 },
          { label: "Shine your torch at it.", go: "shine", fear: 24 },
        ],
      },
    ],

    shine: [
      { t: "text", s: "You point your torch down. The beam goes three metres and stops, as though it hit glass.", fear: 24 },
      { t: "text", s: "On the other side of that boundary, a man in a 1950s diving helmet raises a hand in greeting.", slow: true, sfx: "sting", shake: true, fear: 32 },
      { t: "text", s: "There is no air line. There has not been an air line for sixty-four years.", fear: 30 },
      { t: "goto", go: "controlled" },
    ],

    controlled: [
      { t: "text", s: "You do your safety stop at five metres because you are a professional and because panicking at depth kills you.", fear: 20 },
      { t: "text", s: "Three minutes. Longest three minutes of anyone's life. The light stays four metres below you the whole time, patient.", sfx: "breath", fear: 26 },
      { t: "text", s: "At the surface, it stops. Under the boat there is a soft glow for another forty seconds, then nothing.", slow: true, fear: -14, amb: "rain" },
      {
        t: "ending",
        id: "surfaced",
        outcome: "survived",
        title: "Safety Stop",
        lines: [
          "Ravi surfaced two minutes after you and would not talk about it in the boat, or in the car, or ever.",
          "You both stopped diving the quarry. You did not stop diving.",
          "In any water deeper than twenty metres, you now always look down before you go up. You do not know what you would do if you saw it again.",
        ],
      },
    ],

    alone: [
      { t: "text", s: "You wave Ravi off and go down. This is the decision. Everything after this is just the consequence.", fear: 24 },
      { t: "goto", go: "down" },
    ],

    down: [
      { t: "text", s: "Twenty-eight metres. Thirty. The silt is so fine here that your fins raise clouds that never settle.", fear: 22 },
      { t: "text", s: "The village comes out of the dark all at once: a street, a wall, a doorway, a gatepost with a number on it.", slow: true, fear: 26 },
      { t: "text", s: "The lights are on in the windows. Warm ones. Not phosphorescence. The colour of a bulb.", sfx: "sting", fear: 30 },
      {
        t: "choice",
        prompt: "Six minutes of air. Your gauge is the only honest thing down here.",
        timer: 9,
        options: [
          { label: "Look in a window.", go: "window", fear: 26 },
          { label: "Turn back now.", go: "turnBack", fear: 18 },
          { label: "Swim down the street to the church.", go: "church", fear: 28 },
        ],
      },
    ],

    turnBack: [
      { t: "text", s: "You turn. Behind you the street is longer than it was, and the lights have gone out in the houses you passed.", fear: 24 },
      { t: "text", s: "They come back on ahead of you, one by one, showing you a way that is not the way you came.", slow: true, sfx: "whisper", fear: 28 },
      {
        t: "choice",
        timer: 7,
        options: [
          { label: "Follow the lit route.", go: "church", fear: 26 },
          { label: "Ignore them. Swim straight up.", go: "straightUp", fear: 22 },
        ],
      },
    ],

    straightUp: [
      { t: "text", s: "You dump the street and go vertical. Textbook. Slow. Bubbles above you like a ladder.", fear: 20 },
      { t: "text", s: "Something takes hold of your fin at thirty metres. Not violently. The way a parent takes a child's hand at a road.", slow: true, sfx: "sting", shake: true, fear: 32 },
      {
        t: "choice",
        timer: 6,
        options: [
          { label: "Kick free.", go: "kick", fear: 26 },
          { label: "Look down.", go: "lookDown", fear: 30 },
        ],
      },
    ],

    kick: [
      { t: "text", s: "You kick. It lets go instantly, apologetically, and you feel obscurely rude.", fear: 22 },
      { t: "text", s: "You surface hot and fast and wrong and Ravi hauls you into the boat swearing in two languages.", fear: -10, amb: "rain" },
      { t: "goto", go: "boat" },
    ],

    lookDown: [
      { t: "text", s: "You look down the length of your own body.", slow: true, sfx: "breath", fear: 30 },
      { t: "text", s: "A child, in a school uniform from 1961, is holding your fin with both hands and floating there quite comfortably.", sfx: "sting", shake: true, fear: 34 },
      { t: "text", s: "She points at the village and shakes her head. Then she points up and nods, and lets go.", slow: true, fear: 24 },
      { t: "text", s: "You go up. Your gauge says two minutes. It takes four. You do not know how.", fear: 20 },
      { t: "goto", go: "boat" },
    ],

    window: [
      { t: "text", s: "You put your mask to a window that has had no glass since 1961.", fear: 26 },
      { t: "text", s: "Inside: a kitchen table, four chairs, a lamp on. Dry. Absolutely dry, on the other side of the frame.", slow: true, sfx: "sting", fear: 32 },
      { t: "text", s: "A woman at the table looks up and sees you and puts her hand over her mouth in the universal gesture of oh God, there's someone at the window.", shake: true, fear: 34 },
      {
        t: "choice",
        prompt: "She is getting up. She is coming to open the door for you.",
        timer: 7,
        options: [
          { label: "Swim. Now.", go: "straightUp", fear: 26 },
          { label: "Wait for the door.", go: "guest", fear: 32 },
        ],
      },
    ],

    guest: [
      { t: "text", s: "The door opens. Warm light comes out into thirty metres of black water and does not disperse.", slow: true, sfx: "door", fear: 32 },
      { t: "text", s: "She says something. Underwater, forty metres down, you hear it perfectly: \"Come in, you must be freezing.\"", sfx: "whisper", fear: 34 },
      {
        t: "ending",
        id: "guest",
        outcome: "worst",
        title: "You Must Be Freezing",
        lines: [
          "You take your mask off. That should be the end of you and it is not, and that is the part Ravi will never be told.",
          "The recovery team finds your kit at thirty-one metres, neatly stacked outside a doorway, weights and all.",
          "The lights in the village are on. They are always on. The divers who mention it are quietly moved to other sites.",
        ],
      },
    ],

    church: [
      { t: "text", s: "You follow the street to the church. The spire you came to see is directly above you, twenty-two metres up.", fear: 26 },
      { t: "text", s: "The doors are open. Inside, sixty pews, all of them occupied, all of them facing the altar, all of them still.", slow: true, sfx: "sting", fear: 32 },
      { t: "text", s: "Your gauge says two minutes. Two minutes is not enough to get to the surface from here.", sfx: "breath", shake: true, fear: 34 },
      {
        t: "choice",
        prompt: "Every head in the church turns to the door, politely, together.",
        timer: 6,
        options: [
          { label: "Go in and sit down.", go: "pew", fear: 30 },
          { label: "Buddy-breathe on hope and run for the surface.", go: "hope", fear: 28 },
        ],
      },
    ],

    hope: [
      { t: "text", s: "You go up the outside of the spire with an empty tank and one lungful of nothing.", fear: 30 },
      { t: "text", s: "Twenty metres. Fifteen. Your vision goes grey at the edges and then grey in the middle.", slow: true, sfx: "breath", fear: 32 },
      { t: "text", s: "At eight metres a hand you never see puts a regulator in your mouth and holds your jaw shut around it.", sfx: "sting", shake: true, fear: 28 },
      { t: "goto", go: "boat" },
    ],

    pew: [
      { t: "text", s: "You sit down at the back, because you have manners, because your air is gone, because there is nowhere else.", slow: true, fear: 30 },
      {
        t: "ending",
        id: "congregation",
        outcome: "doomed",
        title: "Congregation",
        lines: [
          "The service has been going since 1961 and nobody has ever been rude enough to leave.",
          "It is warm. It is not frightening after the first hour, which is the worst thing about it.",
          "Divers say the church is at twenty-two metres. The pews are at forty. Almost nobody goes down that far, and everyone who does comes back one short.",
        ],
      },
    ],

    boat: [
      { t: "text", s: "You come up under the boat, and the sky is the most stupid, beautiful, ordinary grey you have ever seen.", amb: "rain", fear: -25 },
      { t: "text", s: "Ravi is shouting. The engine is running. The quarry surface is flat as a table.", fear: -18 },
      { t: "text", s: "Your torch, clipped to your BCD, is still on, and its beam is pointing straight down, and it does not go out for six hours.", slow: true, fear: 10 },
      {
        t: "ending",
        id: "hauled",
        outcome: "survived",
        title: "Hauled Out",
        lines: [
          "Your tank is measured at empty. The dive computer logs eleven minutes you cannot account for.",
          "You never dive the quarry again, and you never dive alone, and you never dive at night.",
          "Once a year, on the anniversary, you drive up and stand at the water's edge, and you do not know why, and you do not stay after dark.",
        ],
      },
    ],
  },
};
