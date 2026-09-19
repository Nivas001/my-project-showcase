import type { Story } from "@/lib/horror/types";

/**
 * A house story built on one rule, stated in the first thirty seconds and never
 * explained: the staircase has twelve steps, and after midnight it has more.
 *
 * Every branch is a different way of testing the rule. None of them is safe,
 * but the two that survive are the ones where the reader stops testing.
 */
export const thirteenSteps: Story = {
  slug: "thirteen-steps",
  title: "Thirteen Steps",
  hook: "Your grandmother's staircase has twelve steps. You have counted them your whole life. Tonight you are on the thirteenth.",
  tags: ["house", "counting", "slow dread"],
  fear: 5,
  minutes: "7-9 min",
  ambience: "rain",
  lang: "english",
  kind: "read",
  endings: 4,
  nodes: {
    start: [
      { t: "text", s: "The house is ninety years old and everything in it announces itself. The gate. The third floorboard. The tap that will not stop after you close it.", amb: "rain", fear: 4 },
      { t: "text", s: "The staircase has twelve steps. You know because you counted them every night for eleven years, out loud, going up, because your grandmother liked the sound of it.", fear: 6 },
      { t: "text", s: "She has been gone two years. The house is yours to clear out. You are doing it alone because doing it with family would mean talking.", fear: 8 },
      { t: "text", s: "It is 00:40 and you are going up to bed, and you are counting, because some habits are just the shape of a house.", fear: 10 },
      { t: "text", s: "Nine. Ten. Eleven. Twelve.", slow: true, fear: 12 },
      { t: "text", s: "Thirteen.", slow: true, sfx: "sting", hold: 1200, fear: 22 },
      { t: "text", s: "Your foot is on a step that is not there in daylight. The landing is still above you. You are not at the top.", fear: 26 },
      {
        t: "choice",
        prompt: "The rain has got louder, or the house has got quieter.",
        timer: 180,
        options: [
          { label: "Keep going up. Count.", go: "up", fear: 14 },
          { label: "Go back down. Count.", go: "down", fear: 12 },
          { label: "Stand still and do not count.", go: "still", fear: 8 },
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    up: [
      { t: "text", s: "Fourteen. Fifteen.", slow: true, sfx: "steps", fear: 18 },
      { t: "text", s: "Sixteen. The wallpaper is the wallpaper. The rail is the rail. The landing light is still exactly as far away.", fear: 24 },
      { t: "text", s: "Nineteen. Twenty-two. You stop counting at thirty-one because the number has started to feel like a thing you are feeding.", sfx: "whisper", fear: 30 },
      { t: "text", s: "Below you, somewhere down in the dark you climbed out of, someone else starts counting.", slow: true, sfx: "sting", shake: true, fear: 36 },
      { t: "text", s: "\"…nine. Ten. Eleven. Twelve.\"", as: "voice", fear: 34 },
      { t: "text", s: "It is her voice. It is exactly her voice, down to the way she never quite finished the word twelve.", fear: 38 },
      {
        t: "choice",
        timer: 180,
        options: [
          { label: "Answer her.", go: "answer", fear: 22 },
          { label: "Keep climbing. Do not answer.", go: "climb", fear: 20 },
          { label: "Go down towards the voice.", go: "towards", fear: 26 },
        ],
      },
    ],

    down: [
      { t: "text", s: "You turn and go back down, and you count down, which is the sensible way to undo a thing.", fear: 10 },
      { t: "text", s: "Twelve. Eleven. Ten. Nine. Eight. Seven. Six. Five. Four. Three. Two. One.", fear: 12 },
      { t: "text", s: "You step off onto the hall floor. It is cold under your foot. It is the right floor. You are down.", fear: -8 },
      { t: "text", s: "You look up the stairs and count them from the bottom, the way you would check a sum.", fear: 10 },
      { t: "text", s: "Twelve. Twelve steps. Of course twelve.", fear: -6 },
      { t: "text", s: "The landing light is off. You did not turn it off. You were never at the landing.", slow: true, sfx: "knock", fear: 24 },
      {
        t: "choice",
        prompt: "Somewhere above, a door you have not opened in two years opens.",
        timer: 180,
        options: [
          { label: "Sleep on the sofa. Deal with it in daylight.", go: "sofa", fear: 6 },
          { label: "Go back up and shut the door.", go: "shut", fear: 20 },
          { label: "Leave the house. Now.", go: "leavehouse", fear: 10 },
        ],
      },
    ],

    still: [
      { t: "text", s: "You stop. You do not count. You put your hand on the rail and you breathe and you let the number go.", amb: "rain", fear: -6 },
      { t: "text", s: "The rain fills up the gap where the counting was. It is an old sound and it is on your side.", fear: -10 },
      { t: "text", s: "After a while — a minute, four, you genuinely do not know — your foot is on the landing and the light is on and you have no memory of the last few steps.", fear: 8 },
      { t: "text", s: "You do not check how many there were. This turns out to matter more than anything else you do tonight.", slow: true, fear: 12 },
      {
        t: "choice",
        prompt: "Her door is at the end of the landing. It is closed, the way you left it.",
        timer: 180,
        options: [
          { label: "Go to bed. Do not open it.", go: "bed", fear: 4 },
          { label: "Open it. She's your grandmother.", go: "herroom", fear: 22 },
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    answer: [
      { t: "text", s: "\"Paati?\" you say, down into the dark, and your voice sounds nine years old.", as: "voice", fear: 24 },
      { t: "text", s: "The counting stops.", slow: true, hold: 1200, amb: "silence", fear: 30 },
      { t: "text", s: "Then it starts again from one, and it is closer, and it is coming up.", amb: "rain", sfx: "steps", shake: true, fear: 38 },
      { t: "text", s: "\"One. Two. Three—\"", as: "voice", fear: 36 },
      { t: "text", s: "It reaches twelve much too quickly and does not stop at twelve.", slow: true, sfx: "sting", fear: 42 },
      {
        t: "choice",
        prompt: "It will be on your step in four more numbers.",
        timer: 180,
        options: [
          { label: "Say her name properly. All of it.", go: "fullname", fear: 20 },
          { label: "Run for the landing.", go: "climb", fear: 24 },
          { label: "Sit down on the step and wait for her.", go: "sit", fear: 28 },
        ],
      },
    ],

    fullname: [
      { t: "text", s: "You say her whole name. The one on the ration card, the one nobody used, the one she complained about.", fear: 20 },
      { t: "text", s: "The counting stops at seventeen.", amb: "silence", slow: true, hold: 1400, fear: 26 },
      { t: "text", s: "\"Nobody's called me that since your grandfather,\" says the dark, quite close, and sounds tired rather than hungry.", as: "voice", fear: 22 },
      { t: "text", s: "\"Go up, kanna. Don't count on the way. Counting is how it gets in.\"", as: "voice", slow: true, fear: 18 },
      { t: "text", s: "You go up. You do not count. It takes four steps, or four hundred, and you do not look.", amb: "rain", fear: 10 },
      { t: "text", s: "The landing light is on. The house is ninety years old and everything in it announces itself, and right now all of it is quiet.", fear: -12 },
      {
        t: "ending",
        id: "her-name",
        outcome: "survived",
        title: "The Name Nobody Used",
        lines: [
          "You sleep badly and you wake up in a house with twelve steps in it.",
          "You clear it out in three days, and on the last night you go up without counting, out of respect rather than fear.",
          "You sell the house to a young couple. You tell them about the tap and the third floorboard. You do not tell them about the stairs, because the rule only bites people who test it, and they have no reason to.",
        ],
      },
    ],

    sit: [
      { t: "text", s: "You sit down on the step, which is the most frightening thing you have ever chosen to do, and you put your hands in your lap.", fear: 28 },
      { t: "text", s: "The counting arrives. Twenty-one. Twenty-two. Twenty-three.", sfx: "steps", fear: 34 },
      { t: "text", s: "It stops on the step below yours. The stair takes a weight. The rail moves under a hand that is not yours.", sfx: "breath", slow: true, shake: true, fear: 42 },
      { t: "text", s: "Nothing touches you. Something very old sits down beside you, the way she used to when your knees hurt from growing.", fear: 38 },
      { t: "text", s: "\"You never could get past twelve without help,\" it says, fondly, and it is not fond, and it is not her.", as: "voice", sfx: "sting", fear: 46 },
      {
        t: "ending",
        id: "sat-down-with-it",
        outcome: "worst",
        title: "You Sat Down With It",
        lines: [
          "Your cousin finds the house open and the lights on four days later.",
          "You are on the stairs, sitting, perfectly well, and you have been counting continuously for long enough that your voice has gone.",
          "In the hospital you count. At home you count. You are fine in every measurable way, and you have not been able to stop at twelve since, and everyone has learned not to interrupt because of what happens to your face when the number is lost.",
        ],
      },
    ],

    climb: [
      { t: "text", s: "You climb. You do not count and you do not look down and the landing does not get closer, and then all at once it does.", sfx: "steps", fear: 28 },
      { t: "text", s: "You are on the landing. The light is on. The rain is on the window. Below you, the counting stops mid-number.", amb: "rain", fear: 18 },
      { t: "text", s: "You look back down the stairs.", slow: true, fear: 24 },
      { t: "text", s: "Twelve steps. Just twelve. A perfectly ordinary staircase in a perfectly ordinary house at one in the morning.", fear: -10 },
      { t: "text", s: "At the bottom of them, in the hall, something is standing with its face turned up towards you, and it is patient, and it is not going to come up, because it does not have to.", sfx: "sting", shake: true, fear: 34 },
      {
        t: "choice",
        prompt: "You have to come down eventually. It knows that.",
        timer: 180,
        options: [
          { label: "Go to bed. It can wait; so can you.", go: "bed", fear: 16 },
          { label: "Go down and face it.", go: "face", fear: 26 },
          { label: "Climb out of the landing window.", go: "window", fear: 20 },
        ],
      },
    ],

    towards: [
      { t: "text", s: "You go down towards the voice, because it is her voice and because you did not get to say anything at the end.", fear: 26 },
      { t: "text", s: "Down. Down. Down. The counting comes up past you and keeps going, and you keep going, and you pass each other somewhere in the dark without touching.", slow: true, sfx: "whisper", fear: 34 },
      { t: "text", s: "You reach the hall. The counting reaches the landing. You each stop.", amb: "silence", hold: 1100, fear: 32 },
      { t: "text", s: "You turn around and look up.", fear: 34 },
      { t: "text", s: "You are looking at yourself, standing on the landing, one hand on the rail, looking down.", slow: true, sfx: "sting", shake: true, amb: "rain", fear: 44 },
      { t: "text", s: "It looks relieved.", hold: 900, fear: 46 },
      {
        t: "ending",
        id: "passed-in-the-dark",
        outcome: "worst",
        title: "You Passed Each Other",
        lines: [
          "The house is cleared out on schedule. Everything is done properly: the paperwork, the donations, the keys handed over.",
          "You do all of it. You are calm and organised and everyone says how well you are coping.",
          "The only thing that anyone notices is that you will not use a staircase with someone else on it, and if pressed you say, perfectly reasonably, that you would rather wait until it's empty.",
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    sofa: [
      { t: "text", s: "You take a blanket off the back of the chair she never let anyone sit in and you lie down in the front room with the light on.", fear: -8 },
      { t: "text", s: "The rain keeps going. The tap drips. The third floorboard creaks once, twice, on its own, the way old wood does when a house is cooling.", fear: 10 },
      { t: "text", s: "You sleep. You do not dream about the stairs, which is worse, because it means part of you has already filed them as normal.", slow: true, fear: 14 },
      { t: "text", s: "At 04:00 you wake up because something in the house is counting, very quietly, and it has got to sixty-eight.", sfx: "whisper", fear: 30 },
      {
        t: "choice",
        prompt: "It is not on the stairs. It is in the room with you.",
        timer: 180,
        options: [
          { label: "Keep your eyes shut. Let it finish.", go: "letfinish", fear: 18 },
          { label: "Open your eyes.", go: "openeyes", fear: 28 },
        ],
      },
    ],

    letfinish: [
      { t: "text", s: "You keep your eyes shut. This is the hardest thing you have ever done with your face.", fear: 24 },
      { t: "text", s: "Seventy. Eighty. It gets to a hundred and starts again at one, and the second time through it is slower, and the third time it is nearly asleep.", sfx: "breath", fear: 26 },
      { t: "text", s: "At some point it stops. At some point after that, so do you.", amb: "silence", hold: 1200, fear: 12 },
      { t: "text", s: "You wake to sun through a window that has not been cleaned in two years, and twelve steps, and a tap you can finally hear properly.", amb: "rain", fear: -20 },
      {
        t: "ending",
        id: "let-it-finish",
        outcome: "survived",
        title: "You Let It Finish",
        lines: [
          "You finish clearing the house in daylight, every day, and you are out by six each evening.",
          "It is not bravery and you never pretend it is. You simply worked out the only rule that has ever held in that house: it wants to be counted, and it will take whoever answers.",
          "You never answered. That is the whole of it.",
        ],
      },
    ],

    openeyes: [
      { t: "text", s: "You open your eyes.", slow: true, sfx: "reverse", hold: 900, fear: 32 },
      { t: "text", s: "The front room. The light on. The chair nobody sat in, occupied.", fear: 38 },
      { t: "text", s: "It is counting on its fingers, and it has more fingers than the count has reached, and it is nowhere near finished.", slow: true, sfx: "sting", shake: true, fear: 46 },
      { t: "text", s: "It looks up, pleased to have company, and starts again from one so that you can follow along.", sfx: "laugh", fear: 48 },
      {
        t: "ending",
        id: "started-again-from-one",
        outcome: "doomed",
        title: "From One, For You",
        lines: [
          "The house sells. The couple are lovely. The tap gets fixed in the first month.",
          "You are fine. You are entirely fine, and you hold down your job, and you see your friends.",
          "It is only that you cannot be in a room where someone is counting anything out loud — change, reps, beats, steps — because when you hear it your mouth begins at one, and you have learned that it is much easier to leave the room than to explain why.",
        ],
      },
    ],

    shut: [
      { t: "text", s: "You go back up. Twelve steps, exactly twelve, quick and ordinary and infuriating.", fear: 14 },
      { t: "text", s: "Her door is open. The room beyond it is dark and smells of the powder she used and has not been opened since the funeral.", sfx: "door", fear: 24 },
      { t: "text", s: "You reach in to pull the handle and your hand passes through the space where the handle is, twice, before it finds it.", slow: true, sfx: "scrape", fear: 32 },
      {
        t: "choice",
        timer: 180,
        options: [
          { label: "Shut it and go to bed.", go: "bed", fear: 12 },
          { label: "Turn the light on and look.", go: "herroom", fear: 24 },
        ],
      },
    ],

    herroom: [
      { t: "text", s: "You turn the light on. Her bed. Her comb. The calendar still on the month she died in.", fear: 20 },
      { t: "text", s: "On the wall beside the door, in pencil, in her handwriting, there is a tally. Five bars and a cross. Hundreds of them. Thousands.", slow: true, fear: 30 },
      { t: "text", s: "Underneath, in a hand that is much older and much shakier than the hand that wrote your birthday cards, it says:", fear: 32 },
      { t: "text", s: "\"Don't count them. I counted them.\"", as: "sign", sfx: "sting", shake: true, fear: 40 },
      { t: "text", s: "The light goes out. The landing light goes out. Every light in the house goes out at once, and the rain stops, which is the worst thing that has happened all night.", amb: "silence", sfx: "drop", fear: 44 },
      {
        t: "choice",
        prompt: "Somewhere below, one step takes a weight.",
        timer: 180,
        options: [
          { label: "Get into her bed and pull the sheet over you.", go: "hersbed", fear: 20 },
          { label: "Go to the stairs and count down. Fast.", go: "countdown", fear: 30 },
        ],
      },
    ],

    hersbed: [
      { t: "text", s: "You get into your grandmother's bed like a child, and you pull the sheet up, and you are forty-one years old.", fear: 26 },
      { t: "text", s: "The stairs take a weight. Then another. It is not counting. It is much worse than counting, because you have to do it yourself now, in your head, and you cannot stop.", slow: true, sfx: "steps", fear: 38 },
      { t: "text", s: "Eleven. Twelve. Thirteen. Fourteen.", fear: 42 },
      { t: "text", s: "It reaches the landing on twenty-six and stops outside the door, and waits, and does not come in, because it is not allowed to. Her room. Her rules. Still.", slow: true, hold: 1600, fear: 34 },
      { t: "text", s: "You lie in the dark until the rain starts again, and when it does, the weight goes back down the stairs, and you count it down with your eyes shut, and at twelve it stops.", amb: "rain", fear: -16 },
      {
        t: "ending",
        id: "her-room-her-rules",
        outcome: "survived",
        title: "Her Room, Her Rules",
        lines: [
          "You sleep in her bed for the three nights it takes to finish, and nothing comes through that door, and you do not once find out what would happen if it could.",
          "You take the comb and the calendar and you leave the tally on the wall, and when the couple ask about the pencil marks you say it was where she measured the grandchildren.",
          "It is a lie, and it is a kindness, and you have made your peace with both.",
        ],
      },
    ],

    countdown: [
      { t: "text", s: "You run at the stairs in the dark and you count down as fast as you can say the numbers, because down is out and out is a road and a road is anywhere but here.", sfx: "steps", fear: 36 },
      { t: "text", s: "Twelve. Eleven. Ten. Nine.", fear: 38 },
      { t: "text", s: "Eight. Seven. Six.", fear: 40 },
      { t: "text", s: "Five. Four. Three. Two.", slow: true, fear: 42 },
      { t: "text", s: "One.", slow: true, hold: 1000, sfx: "knock", fear: 44 },
      { t: "text", s: "Zero.", slow: true, hold: 1200, sfx: "sting", shake: true, fear: 48 },
      { t: "text", s: "There is a step below one. There has always been a step below one. It is what the house was built on top of, and it goes down a long way, and you have a great deal of counting left to do.", slow: true, sfx: "riser", hold: 2200, fear: 54 },
      {
        t: "ending",
        id: "below-one",
        outcome: "worst",
        title: "Below One",
        lines: [
          "The front door is found open. The lights are found off. The house is found empty and immaculate, and your car is on the road outside with the keys in it.",
          "The new owners fill in the cellar in their second year, because of the draught.",
          "The staircase has twelve steps. It has always had twelve steps. Everyone who has ever lived there will tell you so, and every one of them will tell you, without being asked, that they never count them.",
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    bed: [
      { t: "text", s: "You go to bed in the small room that was yours at nine years old, and the bed is too short, and that is oddly the most comforting thing about it.", fear: -6 },
      { t: "text", s: "You do not sleep for a long time. Nothing comes. Nothing counts. The rain does what rain does.", amb: "rain", fear: -10 },
      { t: "text", s: "In the morning there are twelve steps and a great deal of work to do.", fear: -14 },
      {
        t: "ending",
        id: "went-to-bed",
        outcome: "survived",
        title: "You Went to Bed",
        lines: [
          "Nothing else happens. That is genuinely the whole ending.",
          "You clear the house, you sell it, you keep her comb, and once a year or so the number thirteen makes the back of your neck cold for no reason you can defend.",
          "A house that has been waiting ninety years can wait one more night. You are the first person in your family to work that out, and the only one to act on it.",
        ],
      },
    ],

    face: [
      { t: "text", s: "You go down. Twelve steps, and you count them, because at this point the counting feels like the only honest thing left.", sfx: "steps", fear: 30 },
      { t: "text", s: "The hall is empty. Of course it is. The front door is shut and bolted from the inside, the way you left it.", fear: 20 },
      { t: "text", s: "You stand where the shape was standing and you look up the stairs, because you want to know what it was looking at.", slow: true, fear: 28 },
      { t: "text", s: "From down here, you can see there is a step between the eleventh and the twelfth that you have never used. Worn smooth. Worn by something.", sfx: "scrape", slow: true, fear: 38 },
      { t: "text", s: "It has been there your whole life. You have stepped over it every single night for eleven years without ever once looking down.", sfx: "sting", shake: true, fear: 44 },
      {
        t: "ending",
        id: "the-step-between",
        outcome: "doomed",
        title: "The Step Between",
        lines: [
          "You leave that night. You do not go back for the rest of the clearance; a company does it, and they are very reasonable about the short notice.",
          "The house sells to a young couple. You tell them about the tap and the floorboard.",
          "You also tell them, in the car park, in a rush, not really meaning to, that if they ever find themselves counting the stairs they should stop at eleven and step long. They laugh. You laugh too. Neither of you means it, and you both remember it for years.",
        ],
      },
    ],

    window: [
      { t: "text", s: "The landing window opens onto the porch roof. You went out of it at fourteen to meet someone your grandmother disapproved of, and you are going out of it now for better reasons.", fear: 18 },
      { t: "text", s: "The tiles are wet and cold and absolutely real, which after the last ten minutes is close to a religious experience.", amb: "rain", fear: -8 },
      { t: "text", s: "You drop into the front garden. You do not look back at the house. You get in the car.", fear: -12 },
      { t: "text", s: "In the mirror, the landing light is on, and the front room light, and the hall — every light in the house, one after another, the way they come on for somebody who is going up to bed.", slow: true, sfx: "sting", fear: 24 },
      { t: "text", s: "You drive. The lights get smaller. Somewhere behind you, something finishes counting to twelve, and then keeps going, and it will be doing that whether or not you are in the building.", fear: 20 },
      {
        t: "ending",
        id: "out-the-window",
        outcome: "survived",
        title: "Out the Window",
        lines: [
          "You do not go back. A house-clearance firm does it for a fee you can afford and a conversation you cannot.",
          "The foreman calls you once, to ask about the pencil tally on the bedroom wall — whether to paint over it.",
          "You say yes, paint over it. He says it'll take a few coats, marks like that always come back through. You say do it anyway, and you hang up before he can tell you how many there were.",
        ],
      },
    ],

    leavehouse: [
      { t: "text", s: "You put your coat on over your night clothes and you walk out of the front door at ten to one in the morning in the rain.", amb: "rain", fear: 6 },
      { t: "text", s: "The gate announces you. The road is empty. The car starts first time, which it never does.", fear: -8 },
      { t: "text", s: "You sleep in a hotel by the bypass and pay too much for it, and it is the best money you have ever spent.", fear: -16 },
      {
        t: "ending",
        id: "just-left",
        outcome: "survived",
        title: "You Just Left",
        lines: [
          "Nothing chased you. Nothing ever does, in that house; it does not have to, because everyone who lives there eventually starts counting on their own.",
          "You go back in daylight with two cousins and a van and you get the job done in a day and a half with the radio on.",
          "None of you go upstairs alone, and none of you say why, and the house is sold by the end of the month.",
        ],
      },
    ],
  },
};
