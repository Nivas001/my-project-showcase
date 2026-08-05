import type { Story } from "@/lib/horror/types";

export const roomFourOhFour: Story = {
  slug: "room-404",
  title: "Room 404",
  hook: "The hotel has no fourth floor. Your key card says 404.",
  tags: ["hotel", "liminal", "lost"],
  fear: 4,
  minutes: "5-7 min",
  ambience: "corridor",
  endings: 3,
  nodes: {
    start: [
      { t: "text", s: "You check in at 11:40pm after a delayed flight and a taxi driver who wouldn't speak.", amb: "corridor", fear: 5 },
      { t: "text", s: "The receptionist hands you a card in a paper sleeve. 404. She does not look up.", fear: 10 },
      { t: "text", s: "In the lift, the buttons go 1, 2, 3, 5, 6. There is a small clean rectangle where 4 should be.", slow: true, fear: 18 },
      {
        t: "choice",
        prompt: "The lift is waiting for a floor.",
        timer: 12,
        options: [
          { label: "Press 3 and take the stairs up.", go: "stairs", fear: 14 },
          { label: "Press 5 and take the stairs down.", go: "stairs", fear: 14 },
          { label: "Go back to reception and ask.", go: "reception", fear: 10 },
        ],
      },
    ],

    reception: [
      { t: "text", s: "The lobby is the same except the flowers, which were lilies and are now something dried.", fear: 14 },
      { t: "text", s: "\"There's no fourth floor,\" you say. \"My key says 404.\"", fear: 12 },
      { t: "text", s: "She looks up for the first time. She has the pleasant, blank face of someone who has answered this exact question for years.", slow: true, fear: 20 },
      { t: "text", s: "\"It's between three and five,\" she says. \"Most guests find it. Don't use the lift, it doesn't stop there.\"", sfx: "whisper", fear: 24 },
      { t: "goto", go: "stairs" },
    ],

    stairs: [
      { t: "text", s: "The stairwell is concrete and smells of new carpet and old cigarettes.", amb: "corridor", fear: 14 },
      { t: "text", s: "Three. Then a landing with no number and a fire door propped open with a folded room-service menu.", fear: 20 },
      { t: "text", s: "Through the door, a corridor exactly like every other corridor in the hotel, except that it is longer than the building.", slow: true, sfx: "door", fear: 26 },
      {
        t: "choice",
        prompt: "Doors run away from you in both directions. 401. 402. 403.",
        timer: 11,
        options: [
          { label: "Walk to 404.", go: "walk", fear: 18 },
          { label: "Go back down and sleep in the lobby.", go: "lobby", fear: 12 },
        ],
      },
    ],

    lobby: [
      { t: "text", s: "You go back down. Three. Two. One. The stairwell delivers you to a landing with no number and a fire door.", slow: true, sfx: "door", fear: 26 },
      { t: "text", s: "It is the fourth floor again. It has been the fourth floor for three flights.", sfx: "sting", shake: true, fear: 30 },
      { t: "goto", go: "walk" },
    ],

    walk: [
      { t: "text", s: "You walk. The numbers rise correctly, which is somehow worse than if they didn't.", fear: 20 },
      { t: "text", s: "Behind 402, a television is playing the hotel welcome loop. Behind 403, someone is dragging a suitcase in a slow circle.", sfx: "scrape", fear: 24 },
      { t: "text", s: "404 has a Do Not Disturb tag on the handle. In your handwriting.", slow: true, sfx: "sting", fear: 28 },
      {
        t: "choice",
        prompt: "Your card is warm in your hand.",
        timer: 9,
        options: [
          { label: "Tap the card and go in.", go: "enter", fear: 24 },
          { label: "Knock first.", go: "knock", fear: 26 },
          { label: "Keep walking. See where the corridor ends.", go: "keepWalking", fear: 22 },
        ],
      },
    ],

    knock: [
      { t: "text", s: "You knock on your own door. It feels ridiculous right up until it isn't.", sfx: "knock", fear: 24 },
      { t: "text", s: "Footsteps inside. The peephole darkens. Someone on the other side is looking at you through your own door.", slow: true, sfx: "breath", fear: 30 },
      { t: "text", s: "\"Who is it?\" they ask, and it is your voice, tired from the same flight.", sfx: "whisper", shake: true, fear: 32 },
      {
        t: "choice",
        timer: 7,
        options: [
          { label: "Answer honestly.", go: "honest", fear: 26 },
          { label: "Walk away fast.", go: "keepWalking", fear: 20 },
        ],
      },
    ],

    honest: [
      { t: "text", s: "\"It's me,\" you say. \"I think this is my room.\"", fear: 26 },
      { t: "text", s: "A long pause. Then, kindly: \"Yeah. It was. Don't come in — one of us has to still be out there.\"", slow: true, sfx: "whisper", fear: 30 },
      { t: "text", s: "The peephole lightens. The footsteps go away. The corridor lights dim by one setting, politely, like closing time.", fear: 24 },
      { t: "goto", go: "keepWalking" },
    ],

    enter: [
      { t: "text", s: "The lock clicks green. The room is your room: your bag on the rack, unpacked in the way you unpack.", fear: 22 },
      { t: "text", s: "The bed has been slept in. The shower is running. The mirror is fogged and has writing on it.", sfx: "drop", fear: 28 },
      { t: "text", s: "DON'T CHECK OUT — you'll be the one in the corridor.", slow: true, sfx: "sting", shake: true, fear: 32 },
      {
        t: "choice",
        timer: 8,
        options: [
          { label: "Turn off the shower and look.", go: "shower", fear: 30 },
          { label: "Get out of the room.", go: "keepWalking", fear: 22 },
          { label: "Get in the bed and sleep.", go: "sleep", fear: 26 },
        ],
      },
    ],

    shower: [
      { t: "text", s: "You push the bathroom door. Steam rolls out at body temperature.", sfx: "door", fear: 28 },
      { t: "text", s: "The water is running over an empty tub. There is no drain in it. There is no plughole at all.", slow: true, fear: 30 },
      { t: "text", s: "The water is going somewhere. It has been going there for a long time.", sfx: "sting", shake: true, fear: 32 },
      { t: "goto", go: "sleep" },
    ],

    sleep: [
      { t: "text", s: "You are so tired that the fear becomes a kind of blanket. You get in. The sheets are warm on one side.", slow: true, fear: 28 },
      {
        t: "ending",
        id: "checked-in",
        outcome: "worst",
        title: "Checked In",
        lines: [
          "You wake at 11:40pm with a delayed flight behind you and a paper sleeve in your hand.",
          "The lift buttons go 1, 2, 3, 5, 6.",
          "You have done this eleven times. The card still feels warm. It always does.",
        ],
      },
    ],

    keepWalking: [
      { t: "text", s: "You keep walking. 405. 410. 428. 460. The carpet pattern repeats every eleven metres and the doors never stop.", fear: 22 },
      { t: "text", s: "At 499 the corridor turns. Around the corner is a fire door, propped open with a folded room-service menu.", slow: true, fear: 26 },
      {
        t: "choice",
        prompt: "The stairwell is right there.",
        timer: 8,
        options: [
          { label: "Take the stairs down two floors and don't stop.", go: "down", fear: 18 },
          { label: "Take the menu. It's the only object here that isn't part of the hotel.", go: "menu", fear: 22 },
        ],
      },
    ],

    menu: [
      { t: "text", s: "You pick up the folded menu. The fire door swings shut behind you with the softness of money.", sfx: "door", fear: 24 },
      { t: "text", s: "The menu has one item on it. \"Room 404 — available. All night. Every night.\"", slow: true, fear: 26 },
      { t: "text", s: "Under it, a list of names in different handwriting. Twelve of them. The last one is yours, half-written.", sfx: "sting", shake: true, fear: 30 },
      {
        t: "choice",
        timer: 6,
        options: [
          { label: "Finish writing your name.", go: "sign", fear: 28 },
          { label: "Tear the menu in half.", go: "tear", fear: 22 },
        ],
      },
    ],

    sign: [
      { t: "text", s: "Your hand finishes it neatly. You have always had good handwriting; people comment on it.", slow: true, fear: 30 },
      {
        t: "ending",
        id: "signed",
        outcome: "doomed",
        title: "Signature",
        lines: [
          "The corridor lights come up warm. Somewhere, a lift arrives at a floor it does not stop at.",
          "You are staff now. You will prop the door open for the next one, and you will be very kind about it.",
          "The receptionist downstairs does not look up. She hasn't for years. She knows what happens to people who look up.",
        ],
      },
    ],

    tear: [
      { t: "text", s: "You tear it in half. The fire door bangs open. The corridor lights go out one by one, coming towards you.", sfx: "sting", shake: true, fear: 28 },
      { t: "text", s: "You get into the stairwell in the last two metres of light.", fear: 24 },
      { t: "goto", go: "down" },
    ],

    down: [
      { t: "text", s: "You go down. Three. Two. One. The stairwell delivers you into the lobby at 4:02am.", amb: "rain", fear: -14 },
      { t: "text", s: "The night porter is asleep at the desk. Real. Snoring. Human.", fear: -20 },
      { t: "text", s: "You put the key card on the counter. It says 304. It has always said 304.", slow: true, sfx: "bell", fear: -10 },
      {
        t: "ending",
        id: "checked-out",
        outcome: "survived",
        title: "Early Checkout",
        lines: [
          "You sit in the lobby with your coat on until the sun comes up, and you leave without going upstairs.",
          "The invoice, emailed later, lists one night in room 404. You do not query it.",
          "Every hotel since, you take the stairs, and you count the floors on the way up and on the way down.",
        ],
      },
    ],
  },
};
