import type { Story } from "@/lib/horror/types";

/**
 * A tape story. Same branching engine, different presentation: the reader is
 * watching a camcorder rather than reading a page, so every beat carries `fx`
 * to drive the picture and the choices are framed as the operator's decisions.
 *
 * Lines are kept short on purpose — they are subtitles, not prose, and a
 * subtitle that runs to four lines stops being footage and starts being a book.
 */
export const tapeCorridor3B: Story = {
  slug: "tape-corridor-3b",
  title: "Tape 07 — Corridor 3B",
  hook: "Recovered footage from a decommissioned hospital wing. Four minutes of corridor. Three people went in.",
  tags: ["found footage", "hospital", "tape"],
  fear: 5,
  minutes: "6-8 min",
  ambience: "tape",
  lang: "english",
  kind: "tape",
  tapeLabel: "3B-07 · 04:11 · 1998",
  endings: 4,
  nodes: {
    start: [
      { t: "text", s: "TAPE 07. The seventh of eleven recovered from the site.", amb: "tape", fx: "static", fear: 6 },
      { t: "text", s: "Camera comes on inside the building. Nobody filmed going in.", fx: "glitch", fear: 10 },
      { t: "text", s: "Corridor 3B. Old paediatric wing. Closed in 1991.", fear: 12 },
      { t: "text", s: "Three voices on the audio. Only one of them is ever on camera.", sfx: "whisper", fear: 16 },
      { t: "text", s: "\"Keep it on me. Keep it steady.\"", as: "voice", fear: 14 },
      { t: "text", s: "\"There's nothing down there, Priya. It's a corridor.\"", as: "voice", fear: 12 },
      { t: "text", s: "The camera light reaches about nine metres. After that it is only a suggestion.", fx: "figure", fear: 20 },
      { t: "text", s: "At the edge of the light, something is standing in the middle of the corridor.", slow: true, sfx: "sting", fx: "glitch", shake: true, fear: 28 },
      {
        t: "choice",
        prompt: "The operator has not noticed it yet.",
        timer: 180,
        options: [
          { label: "Zoom in.", go: "zoom", fear: 18 },
          { label: "Turn the light off. See if it's a reflection.", go: "lightoff", fear: 20 },
          { label: "Keep walking. Don't say anything.", go: "walk", fear: 16 },
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    zoom: [
      { t: "text", s: "Digital zoom. 1998 digital zoom: everything becomes squares.", fx: "glitch", fear: 20 },
      { t: "text", s: "The shape resolves into a shape. That is the most anyone has ever got out of this frame.", fear: 24 },
      { t: "text", s: "Too tall for the doorframe behind it. That part is measurable — the doorframe is standard, 2.03 metres.", slow: true, fear: 30 },
      { t: "text", s: "It has not moved in eleven seconds of footage.", fx: "figure", sfx: "breath", fear: 32 },
      { t: "text", s: "\"Are you getting this?\"", as: "voice", fear: 28 },
      { t: "text", s: "\"Getting what?\"", as: "voice", fear: 30 },
      { t: "text", s: "The second voice is standing next to the camera. The second voice cannot see it.", slow: true, sfx: "sting", fx: "face", shake: true, fear: 40 },
      {
        t: "choice",
        timer: 180,
        options: [
          { label: "Show them the viewfinder.", go: "viewfinder", fear: 22 },
          { label: "Keep filming. Don't tell them.", go: "dontell", fear: 26 },
          { label: "Call out to it.", go: "callto", fear: 30 },
        ],
      },
    ],

    lightoff: [
      { t: "text", s: "The light goes off. The frame goes to grain.", fx: "dark", sfx: "drop", fear: 26 },
      { t: "text", s: "Four seconds of nothing. The audio picks up three people breathing.", amb: "silence", sfx: "breath", fear: 30 },
      { t: "text", s: "Correction: four.", slow: true, sfx: "sting", fx: "glitch", shake: true, amb: "tape", fear: 40 },
      { t: "text", s: "\"Turn it back on. Turn it back on—\"", as: "voice", fear: 38 },
      { t: "text", s: "Light comes back. The corridor is empty all the way to the fire door.", fx: "flash", fear: 26 },
      { t: "text", s: "Nothing at nine metres. Nothing at twenty.", fear: 22 },
      { t: "text", s: "The audio still has four people breathing on it.", slow: true, sfx: "whisper", fear: 36 },
      {
        t: "choice",
        prompt: "One of them is very close to the microphone.",
        timer: 180,
        options: [
          { label: "Pan the camera across the group.", go: "pangroup", fear: 24 },
          { label: "Get out. Back to the stairwell.", go: "getout", fear: 20 },
          { label: "Point the camera at your own feet and walk forward.", go: "feet", fear: 22 },
        ],
      },
    ],

    walk: [
      { t: "text", s: "The operator keeps walking. The footsteps on the audio are unhurried.", sfx: "steps", fear: 18 },
      { t: "text", s: "Nine metres of light, moving forward at walking pace.", fx: "figure", fear: 22 },
      { t: "text", s: "The thing at the edge of it does not get closer.", slow: true, fear: 28 },
      { t: "text", s: "It is keeping distance. Exactly nine metres, for forty-one seconds, which means it is walking backwards at the operator's speed.", sfx: "scrape", fear: 34 },
      { t: "text", s: "\"Why are we still going forward?\"", as: "voice", fear: 30 },
      { t: "text", s: "\"Because it stops when we stop.\"", as: "voice", slow: true, fx: "approach", fear: 36 },
      {
        t: "choice",
        prompt: "That is not something the operator could know yet.",
        timer: 180,
        options: [
          { label: "Stop walking.", go: "stopwalking", fear: 26 },
          { label: "Run at it.", go: "runat", fear: 32 },
          { label: "Ask who said that.", go: "whosaid", fear: 28 },
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    viewfinder: [
      { t: "text", s: "The camera swings. For two frames it catches a face — Priya, twenty-six, first year of a documentary that was never finished.", fx: "glitch", fear: 22 },
      { t: "text", s: "She looks into the viewfinder.", fear: 26 },
      { t: "text", s: "Her expression does not change at all.", slow: true, hold: 900, fear: 32 },
      { t: "text", s: "\"There's nothing there,\" she says.", as: "voice", fear: 30 },
      { t: "text", s: "The camera swings back to the corridor. The corridor is empty.", fx: "static", fear: 26 },
      { t: "text", s: "Then it swings back to Priya, and behind her, in the two metres of light that reaches past her shoulder, it is standing.", slow: true, sfx: "sting", fx: "approach", shake: true, fear: 44 },
      {
        t: "choice",
        prompt: "It has closed nine metres in the time it took to look away twice.",
        timer: 180,
        options: [
          { label: "Tell her to walk towards the camera. Slowly.", go: "walktome", fear: 26 },
          { label: "Grab her and run.", go: "grabrun", fear: 30 },
          { label: "Keep the camera on it. Do not look away again.", go: "dontlookaway", fear: 34 },
        ],
      },
    ],

    dontell: [
      { t: "text", s: "The operator says nothing. The camera stays up. This is the decision the whole tape turns on.", fear: 26 },
      { t: "text", s: "For ninety seconds, three people walk down a corridor towards something that only one of them can see.", fx: "figure", sfx: "steps", fear: 32 },
      { t: "text", s: "At forty metres it is still the same size in frame.", fear: 34 },
      { t: "text", s: "At twenty metres it is still the same size in frame.", slow: true, fear: 38 },
      { t: "text", s: "It is not at the end of the corridor. It is nine metres away and it has always been nine metres away, and the corridor behind it is a picture of a corridor.", sfx: "reverse", fx: "glitch", shake: true, fear: 46 },
      {
        t: "choice",
        prompt: "Whatever the light is showing, it stopped being a room some time ago.",
        timer: 180,
        options: [
          { label: "Turn the camera around. Film behind you.", go: "behindyou", fear: 30 },
          { label: "Stop the tape.", go: "stoptape", fear: 22 },
          { label: "Tell them now.", go: "tellnow", fear: 26 },
        ],
      },
    ],

    callto: [
      { t: "text", s: "\"Hello?\"", as: "voice", fear: 28 },
      { t: "text", s: "The word goes down the corridor and does not come back. There is no echo on the audio at all, which for a forty-metre tiled corridor is not possible.", slow: true, sfx: "whisper", fear: 36 },
      { t: "text", s: "Nine metres away, the shape tilts its head — not the way a person does. The way a camera does when you rotate it.", fx: "glitch", fear: 40 },
      { t: "text", s: "\"Hello?\" it says back.", as: "voice", sfx: "sting", shake: true, fear: 46 },
      { t: "text", s: "The audio engineers who examined this tape in 2004 confirmed that the second \"hello\" is the first one, played back through a speaker.", slow: true, fear: 44 },
      {
        t: "choice",
        timer: 180,
        options: [
          { label: "Say something it can't record.", go: "cantrecord", fear: 26 },
          { label: "Go towards it.", go: "towards", fear: 34 },
          { label: "Stop the tape.", go: "stoptape", fear: 22 },
        ],
      },
    ],

    cantrecord: [
      { t: "text", s: "The operator says nothing out loud. On the tape there are eleven seconds of corridor and three people breathing.", amb: "silence", fear: 26 },
      { t: "text", s: "In frame, the shape waits. Then, faintly, it plays back eleven seconds of corridor and three people breathing.", slow: true, sfx: "reverse", amb: "tape", fear: 38 },
      { t: "text", s: "It only has what it is given. It cannot make anything new.", fear: 32 },
      { t: "text", s: "It is a recording. It is a recording of this corridor, standing in this corridor, playing itself back, and it has been doing it since 1991 with whatever walked past.", slow: true, fx: "static", fear: 36 },
      { t: "text", s: "\"Don't give it anything,\" says the operator, very quietly, to two people who cannot see it.", as: "voice", fear: 34 },
      {
        t: "choice",
        prompt: "The fire door is behind you. Nobody has spoken for nine seconds.",
        timer: 180,
        options: [
          { label: "Walk out backwards, in silence.", go: "backout", fear: 20 },
          { label: "Switch the camera off first.", go: "camoff", fear: 26 },
        ],
      },
    ],

    backout: [
      { t: "text", s: "The footage shows the corridor receding at walking pace. Nobody speaks. Nobody breathes loudly.", sfx: "steps", fear: 26 },
      { t: "text", s: "The shape does not follow. It does not need to; it has nothing new to play.", fx: "figure", fear: 24 },
      { t: "text", s: "The fire door. The stairwell. Three flights of concrete, filmed the whole way down, silently.", fear: 18 },
      { t: "text", s: "Daylight. The camera cuts.", fx: "flash", amb: "silence", fear: -14 },
      {
        t: "ending",
        id: "gave-it-nothing",
        outcome: "survived",
        title: "Gave It Nothing",
        lines: [
          "All three came out. The tape runs 04:11 and ends in a car park.",
          "The documentary was never finished. Priya works in television now and has never discussed this footage on record.",
          "The only analysis anyone agrees on is the silence: from 02:38 to 04:04 there is no speech on the tape at all, from three people in a dark building, walking backwards. Whatever they understood in that corridor, they understood it without saying it out loud, which is the single most frightening thing about Tape 07.",
        ],
      },
    ],

    camoff: [
      { t: "text", s: "The operator reaches for the switch.", fear: 28 },
      { t: "text", s: "The frame drops to black for four seconds. The audio continues; the microphone is on a separate circuit.", fx: "dark", amb: "tape", fear: 34 },
      { t: "text", s: "In those four seconds: a click. Three sets of footsteps stopping. And a fourth set carrying on for two more paces.", slow: true, sfx: "steps", fear: 44 },
      { t: "text", s: "The camera comes back on. The corridor is empty and the fire door behind them is shut.", fx: "static", shake: true, fear: 42 },
      { t: "text", s: "The fire door was propped open with a brick. The brick is in frame. It is four metres from the door.", slow: true, sfx: "sting", fear: 48 },
      {
        t: "ending",
        id: "the-brick",
        outcome: "doomed",
        title: "The Brick Moved",
        lines: [
          "Two people came out of Corridor 3B at 04:11. The tape has three voices on it until 03:52 and two after.",
          "Nobody involved has ever been able to agree on who the third was. Priya says a sound recordist called Faisal. Faisal, who is alive and working, says he was not in the building that night and has phone records to prove it.",
          "The camera operator has never given a statement. The camera operator is also the only person who ever saw the corridor through the viewfinder, and they returned the camera to the rental company the next morning with the tape still in it, which is how it survived.",
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    behindyou: [
      { t: "text", s: "The camera swings 180 degrees.", fx: "glitch", sfx: "whoosh", fear: 32 },
      { t: "text", s: "Corridor. Identical. Same doors, same tiles, same peeled notice board.", fear: 34 },
      { t: "text", s: "Nine metres away, at the edge of the light, something is standing.", slow: true, sfx: "sting", fx: "figure", shake: true, fear: 44 },
      { t: "text", s: "The fire door is not behind them any more. There is no fire door in either direction.", fear: 46 },
      { t: "text", s: "\"Which way did we come in?\"", as: "voice", fear: 42 },
      { t: "text", s: "Nobody answers. On the tape, nobody ever answers.", slow: true, hold: 1200, fear: 44 },
      {
        t: "choice",
        prompt: "Two directions. One shape in each.",
        timer: 180,
        options: [
          { label: "Try a side door.", go: "sidedoor", fear: 28 },
          { label: "Walk towards one of them.", go: "towards", fear: 34 },
          { label: "Sit down. Wait for the battery to die.", go: "battery", fear: 30 },
        ],
      },
    ],

    sidedoor: [
      { t: "text", s: "The camera goes to the nearest door. Ward 3B-4. The handle turns.", sfx: "door", fx: "glitch", fear: 28 },
      { t: "text", s: "Inside: a ward. Eleven beds. Eleven small beds, because this was the paediatric wing.", slow: true, fear: 36 },
      { t: "text", s: "All eleven are made. The corners are hospital corners. The sheets are white.", fear: 38 },
      { t: "text", s: "The building has been empty for seven years.", slow: true, sfx: "breath", fear: 42 },
      { t: "text", s: "In the last bed, under the sheet, something is the shape of a child, and it is not moving, and it is not a child.", fx: "approach", sfx: "sting", shake: true, fear: 50 },
      {
        t: "choice",
        prompt: "The sheet is very slightly too long at the bottom.",
        timer: 180,
        options: [
          { label: "Shut the door. Go back to the corridor.", go: "shutdoor", fear: 26 },
          { label: "Lift the sheet.", go: "sheet", fear: 40 },
        ],
      },
    ],

    sheet: [
      { t: "text", s: "The camera goes to the bed. The operator's hand enters frame.", fx: "approach", fear: 42 },
      { t: "text", s: "The sheet comes up.", slow: true, hold: 1400, sfx: "riser", fear: 50 },
      { t: "text", s: "The tape has 1.2 seconds of signal loss here. Every recovered copy has it. It is on the master.", fx: "static", fear: 48 },
      { t: "text", s: "When the picture returns, the camera is on the floor, filming the underside of a bed frame, and it films that for the remaining ninety-one seconds.", slow: true, fx: "dark", shake: true, fear: 52 },
      { t: "text", s: "In the last eleven seconds, something walks past, the wrong way up.", sfx: "crawl", fear: 56 },
      {
        t: "ending",
        id: "one-point-two-seconds",
        outcome: "worst",
        title: "1.2 Seconds",
        lines: [
          "The dropout is 1.2 seconds long and contains, on the master, thirty frames of nothing and one frame of something.",
          "The single frame has been published twice, both times heavily degraded, both times withdrawn within a week at the request of people who will not say who they are.",
          "Two of the three came out of the building. The camera was recovered by the site security firm four days later, from a ward on the third floor, made up with clean sheets.",
        ],
      },
    ],

    shutdoor: [
      { t: "text", s: "The door shuts. The camera goes back to the corridor.", sfx: "door", fear: 28 },
      { t: "text", s: "The corridor now has a fire door at the end of it, propped with a brick, exactly where it was at the start of the tape.", fx: "flash", fear: 22 },
      { t: "text", s: "Nothing is standing in it.", fear: 16 },
      { t: "text", s: "\"Go. Go, go—\"", as: "voice", sfx: "steps", fear: 24 },
      { t: "text", s: "The footage runs at a jog. Three flights. Daylight. Cut.", amb: "silence", fx: "flash", fear: -12 },
      {
        t: "ending",
        id: "shut-the-door",
        outcome: "survived",
        title: "Shut the Door",
        lines: [
          "04:11 of tape. Three voices at the start and three voices at the end, which makes Tape 07 the only one of the eleven that does.",
          "The ward footage is fourteen seconds long and shows eleven made beds in a building that had been stripped in 1992. The site inventory confirms the beds were removed. The site inventory is signed.",
          "Nobody in that group has ever gone back. Priya says the same sentence whenever anyone raises it, and has said it for twenty-eight years: we didn't look under the sheet.",
        ],
      },
    ],

    battery: [
      { t: "text", s: "The camera goes down on the floor, pointing along the corridor, still running. Three people sit against a wall.", fx: "dark", fear: 30 },
      { t: "text", s: "The frame is one corridor, one strip of light, and a battery indicator that has been on its last bar since 02:04.", fear: 32 },
      { t: "text", s: "For fifty-one seconds nothing happens. This is the longest still shot on any of the eleven tapes.", slow: true, amb: "silence", hold: 1600, fear: 36 },
      { t: "text", s: "At 03:40 the shape enters frame from the left, at walking pace, and passes the camera without looking at it.", sfx: "steps", fx: "approach", amb: "tape", shake: true, fear: 48 },
      { t: "text", s: "It is the height of a doorframe. It does not turn its head. It is going somewhere.", fear: 46 },
      { t: "text", s: "At 04:09 the battery dies. Nobody has spoken since 03:38.", slow: true, fx: "dark", hold: 1300, fear: 44 },
      {
        t: "ending",
        id: "let-it-pass",
        outcome: "survived",
        title: "You Let It Pass",
        lines: [
          "They came out at first light through the same fire door, which was where it had always been, propped with the same brick.",
          "The footage shows, unambiguously and in focus, something too tall walking down a hospital corridor. It is the clearest thing on any of the eleven tapes and nobody has ever been able to do anything with it, because it is also completely uninterested in the camera.",
          "That is the part that unsettles the people who study it. It walked past three human beings and a running camera and it did not stop, and it did not look, and whatever it was on its way to do was more important.",
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    stopwalking: [
      { t: "text", s: "The footsteps on the audio stop.", amb: "silence", fear: 28 },
      { t: "text", s: "In frame, at nine metres, the shape stops at the same instant. Not a half-second later. The same frame.", slow: true, fx: "figure", fear: 38 },
      { t: "text", s: "The operator takes one step backwards. It takes one step forwards.", sfx: "steps", fx: "approach", shake: true, fear: 44 },
      { t: "text", s: "Nine metres, maintained.", fear: 42 },
      { t: "text", s: "\"It's not following us,\" says the operator. \"It's holding position.\"", as: "voice", amb: "tape", fear: 40 },
      { t: "text", s: "\"From what?\"", as: "voice", slow: true, hold: 1200, fear: 44 },
      {
        t: "choice",
        prompt: "That question is the last thing said on the tape for ninety seconds.",
        timer: 180,
        options: [
          { label: "Turn the camera around.", go: "behindyou", fear: 30 },
          { label: "Back out slowly. Keep it in frame.", go: "backout", fear: 22 },
          { label: "Walk towards it.", go: "towards", fear: 34 },
        ],
      },
    ],

    runat: [
      { t: "text", s: "The frame goes to chaos. Ceiling, floor, wall, the operator's own shoe, a door number.", fx: "glitch", sfx: "whoosh", shake: true, fear: 40 },
      { t: "text", s: "Someone is shouting. It is not words.", sfx: "scream", fear: 46 },
      { t: "text", s: "The camera comes up on a corridor at eleven degrees off level. Empty.", fx: "static", fear: 38 },
      { t: "text", s: "The operator has run about thirty metres. The fire door is now forty metres behind.", fear: 40 },
      { t: "text", s: "There are two people back there in the dark and neither of them is making a sound.", slow: true, amb: "silence", sfx: "breath", fear: 48 },
      {
        t: "choice",
        prompt: "The camera light does not reach them.",
        timer: 180,
        options: [
          { label: "Go back for them.", go: "goback", fear: 32 },
          { label: "Call their names.", go: "callnames", fear: 30 },
          { label: "Keep going. Find another exit.", go: "otherexit", fear: 34 },
        ],
      },
    ],

    goback: [
      { t: "text", s: "The camera turns. The light goes back down the corridor at a run.", sfx: "steps", fx: "approach", fear: 36 },
      { t: "text", s: "Thirty metres. Twenty. Ten.", fear: 40 },
      { t: "text", s: "They are both standing exactly where they were left, facing away, perfectly still, at the edge of the light.", slow: true, fx: "figure", sfx: "sting", shake: true, fear: 50 },
      { t: "text", s: "Neither of them turns around. On the tape, neither of them ever turns around.", fear: 52 },
      { t: "text", s: "The operator says two names. The audio is clear. They are the names of people who are alive today.", slow: true, hold: 1200, fear: 48 },
      {
        t: "ending",
        id: "facing-away",
        outcome: "doomed",
        title: "Neither of Them Turned Around",
        lines: [
          "All three walked out. All three gave statements. Two of them describe a corridor, a shape, and running.",
          "Neither of the two has any memory of the ninety seconds in which they stood still facing a wall, and both become extremely distressed when shown the footage, and both stopped agreeing to be shown it in 2003.",
          "The operator has never been distressed by it. The operator is the only one who kept a copy.",
        ],
      },
    ],

    callnames: [
      { t: "text", s: "Two names, shouted down a dark corridor.", sfx: "scream", fear: 36 },
      { t: "text", s: "Two voices answer. Immediately. In unison. From about four metres away, which is far closer than either of them was.", slow: true, sfx: "whisper", fx: "glitch", shake: true, fear: 48 },
      { t: "text", s: "\"We're here.\"", as: "voice", fear: 46 },
      { t: "text", s: "The camera light reaches nine metres. There is nobody in the nine metres.", fx: "static", fear: 50 },
      {
        t: "choice",
        prompt: "They answered from inside the light.",
        timer: 180,
        options: [
          { label: "Answer them.", go: "answerthem", fear: 34 },
          { label: "Run. Do not answer.", go: "otherexit", fear: 30 },
        ],
      },
    ],

    answerthem: [
      { t: "text", s: "\"Where?\"", as: "voice", fear: 40 },
      { t: "text", s: "\"Here,\" say both voices, from four metres, from inside an empty stretch of lit corridor.", as: "voice", sfx: "sting", fx: "face", shake: true, fear: 52 },
      { t: "text", s: "\"Where are you?\" they say, in unison, with real fear in it, and it is their fear and it is genuine and it is two years old.", as: "voice", slow: true, fear: 56 },
      { t: "text", s: "The tape ends here. Not cut — ends. The remaining eighteen minutes of the cassette are blank and demagnetised.", fx: "static", hold: 1400, fear: 54 },
      {
        t: "ending",
        id: "two-years-old",
        outcome: "worst",
        title: "Two Years Old",
        lines: [
          "Tape 07 is dated 1998 by the cassette and 1996 by the audio, which carries a radio broadcast bleeding through the second channel that can be dated precisely.",
          "The two voices calling out at 03:58 are the same two voices, from the same two people, recorded two years before the night they entered the building.",
          "All three came out. None of them has ever been able to say who was calling, and one of them — the one who has never given a statement — walked back in the following week, alone, without a camera.",
        ],
      },
    ],

    otherexit: [
      { t: "text", s: "The camera keeps going. Corridor. Corridor. Fire door — locked. Corridor.", sfx: "steps", fx: "glitch", fear: 36 },
      { t: "text", s: "The building is a rectangle. There are only two ways out of 3B and the operator is running away from one of them.", fear: 38 },
      { t: "text", s: "At 03:44 the corridor ends in a window. Third floor. The glass is gone; the frame is not.", fx: "flash", fear: 34 },
      { t: "text", s: "Below it, a flat roof, one storey down. Survivable. Probably.", fear: 30 },
      {
        t: "choice",
        timer: 180,
        options: [
          { label: "Go out of the window.", go: "window", fear: 24 },
          { label: "Turn around and go back for them.", go: "goback", fear: 34 },
        ],
      },
    ],

    window: [
      { t: "text", s: "The camera goes out of the window first, filming, dropped onto the flat roof, still running.", fx: "glitch", sfx: "drop", fear: 30 },
      { t: "text", s: "It lands lens-up. Sky. Sodium glow. A gutter.", fx: "dark", fear: 22 },
      { t: "text", s: "For eleven seconds the frame is sky. Then the operator's silhouette comes over the sill and down.", fear: 20 },
      { t: "text", s: "For the last forty seconds of the tape, the camera films the window from below.", slow: true, amb: "tape", fear: 32 },
      { t: "text", s: "Two people are standing in it, looking down, not calling out, not climbing.", sfx: "sting", fx: "figure", shake: true, fear: 46 },
      { t: "text", s: "The tape runs out.", hold: 1400, fx: "static", fear: 44 },
      {
        t: "ending",
        id: "out-the-window",
        outcome: "doomed",
        title: "They Didn't Follow",
        lines: [
          "The operator reached the perimeter fence at 04:20 and flagged down a security patrol. Both other members of the crew were found at 06:50, on the third floor, unhurt, sitting in a stairwell, unable to explain why they had not used the window.",
          "Both of them say, separately and consistently, that there was no window at the end of that corridor.",
          "The site was demolished in 2006. The end wall of Corridor 3B, in the demolition survey photographs, is solid brick.",
        ],
      },
    ],

    whosaid: [
      { t: "text", s: "\"Who said that?\"", as: "voice", fear: 30 },
      { t: "text", s: "Silence on the tape. Four seconds.", amb: "silence", hold: 1000, fear: 34 },
      { t: "text", s: "\"You did,\" says the second voice.", as: "voice", amb: "tape", slow: true, sfx: "reverse", fear: 42 },
      { t: "text", s: "The audio analysis is not ambiguous. The line at 02:11 — \"because it stops when we stop\" — is in the operator's voice, recorded at the operator's distance from the microphone.", fear: 44 },
      { t: "text", s: "The operator's mouth is not on camera. The operator has always maintained they did not say it.", slow: true, fx: "glitch", fear: 46 },
      {
        t: "choice",
        prompt: "In frame, at nine metres, the shape has not moved.",
        timer: 180,
        options: [
          { label: "Stop the tape.", go: "stoptape", fear: 24 },
          { label: "Ask it a question.", go: "callto", fear: 32 },
          { label: "Back out slowly.", go: "backout", fear: 22 },
        ],
      },
    ],

    towards: [
      { t: "text", s: "The camera goes forward. Nine metres of light, closing.", fx: "approach", sfx: "steps", fear: 38 },
      { t: "text", s: "Eight. Seven. Six.", fear: 42 },
      { t: "text", s: "At six metres the autofocus finds it and, for the first and only time on any of the eleven tapes, locks.", slow: true, fx: "face", sfx: "sting", shake: true, fear: 52 },
      { t: "text", s: "Four frames. Four frames of something in focus.", fear: 54 },
      { t: "text", s: "Then the tape tears — physically tears, the master is spliced here — and resumes on an empty corridor and a camera lying on its side.", fx: "rewind", fear: 50 },
      {
        t: "ending",
        id: "four-frames",
        outcome: "worst",
        title: "Four Frames in Focus",
        lines: [
          "The splice in the master is physical and was made with a razor and tape, competently, by someone who knew what they were doing.",
          "Nobody has ever admitted to making it. Priya's original edit notes list a shot at 02:41 as \"unusable — do not print\".",
          "Two people left Corridor 3B that night. The third stayed in the building until morning and has never described what happened between 02:41 and sunrise, and when asked directly gives the same answer every time, which is that they got a very good shot of it and then they put the camera down.",
        ],
      },
    ],

    stoptape: [
      { t: "text", s: "The record light goes out.", fx: "dark", amb: "silence", fear: 22 },
      { t: "text", s: "Tape 07 ends at 02:31 with nine minutes of cassette unused.", fear: 16 },
      { t: "text", s: "All three walked out of the building. There is no footage of it.", fear: 10 },
      {
        t: "ending",
        id: "stopped-recording",
        outcome: "survived",
        title: "Stopped Recording",
        lines: [
          "This is the least interesting of the eleven tapes and the only one whose crew all went home.",
          "Everything anyone knows about Corridor 3B comes from tapes where somebody kept filming. Every single one of them.",
          "The people who study this material have a phrase for the pattern and they use it without smiling: the camera is not a witness, it is a participant. Tape 07 is the proof, and it is the proof because it is boring.",
        ],
      },
    ],

    pangroup: [
      { t: "text", s: "The camera pans across the group. Priya. Faisal. The wall.", fx: "glitch", fear: 26 },
      { t: "text", s: "Two people. Four sets of breathing on the audio, still, throughout the pan.", slow: true, sfx: "breath", fear: 38 },
      { t: "text", s: "The camera completes the circle and comes back to the corridor.", fx: "static", fear: 34 },
      { t: "text", s: "Priya is now nine metres down the corridor, at the edge of the light, with her back to the camera.", slow: true, sfx: "sting", fx: "figure", shake: true, fear: 48 },
      { t: "text", s: "She is in frame in the previous shot, half a second earlier, standing next to the lens.", fear: 50 },
      {
        t: "ending",
        id: "nine-metres",
        outcome: "doomed",
        title: "Nine Metres in Half a Second",
        lines: [
          "The pan is continuous. There is no cut. The frame count has been checked by three separate people and it is continuous.",
          "Priya walked out of the building at 04:11, on camera, in daylight, and is alive and working today.",
          "She has watched the pan. She agrees that it is her. She has one observation about it that she has repeated in every interview she has ever given on the subject, which is that in the shot at nine metres she is not wearing the same shoes.",
        ],
      },
    ],

    feet: [
      { t: "text", s: "The camera goes down. The frame is a pair of shoes and forty centimetres of tiled floor.", fx: "dark", fear: 24 },
      { t: "text", s: "It is the smartest thing anybody does on any of the eleven tapes: film only what is definitely there.", fear: 20 },
      { t: "text", s: "Footsteps. Three people's worth, walking.", sfx: "steps", fear: 26 },
      { t: "text", s: "At 02:50, a fourth pair of shoes enters the bottom of frame, walking alongside, in step.", slow: true, sfx: "sting", fx: "glitch", shake: true, fear: 44 },
      { t: "text", s: "They are children's shoes. They are the right size for the beds in Ward 3B-4.", fear: 48 },
      {
        t: "choice",
        prompt: "The camera does not come up.",
        timer: 180,
        options: [
          { label: "Keep filming the floor. Keep walking.", go: "keepfloor", fear: 28 },
          { label: "Raise the camera.", go: "raise", fear: 36 },
        ],
      },
    ],

    keepfloor: [
      { t: "text", s: "The operator does not look up. The frame stays on the floor for the remaining seventy-one seconds of the tape.", fear: 32 },
      { t: "text", s: "Four pairs of shoes walking in step. Then three. Then, for the last nine seconds, two.", slow: true, sfx: "steps", fear: 40 },
      { t: "text", s: "The last thing on the tape is a doorstep, a brick, and daylight.", fx: "flash", amb: "silence", fear: -8 },
      {
        t: "ending",
        id: "never-looked-up",
        outcome: "survived",
        title: "Never Looked Up",
        lines: [
          "Three people went into Corridor 3B and three people came out, which makes this the second of two good outcomes on Tape 07, and both of them involve somebody choosing not to look at something.",
          "The fourth pair of shoes is on the master from 02:50 to 03:44 and has never been explained. The angle is wrong for a reflection; the wear pattern is visible; they are real shoes with a real person's weight in them.",
          "The operator's only public statement on the tape is one line, given to a student magazine in 2011: \"We were three. I was very careful to only ever film three.\"",
        ],
      },
    ],

    raise: [
      { t: "text", s: "The camera comes up.", slow: true, sfx: "riser", fx: "approach", hold: 1200, fear: 46 },
      { t: "text", s: "There is 0.8 seconds of a face at lens distance.", fx: "face", sfx: "sting", shake: true, fear: 56 },
      { t: "text", s: "The remaining four minutes of Tape 07 are the ceiling of Corridor 3B, unmoving, in focus, with the camera light on.", fx: "dark", fear: 52 },
      { t: "text", s: "At 06:11 somebody picks the camera up, and the frame swings, and it is switched off correctly, by somebody who knew which button.", slow: true, fx: "static", hold: 1400, fear: 54 },
      {
        t: "ending",
        id: "someone-turned-it-off",
        outcome: "worst",
        title: "Someone Turned It Off",
        lines: [
          "Two people came out of Corridor 3B. The operator was found on the floor of the corridor at 06:50, conscious, uninjured, and unable to say anything for eleven hours.",
          "The camera was not on the floor. It was in the stairwell, on the landing, on its side, switched off correctly, with the lens cap on.",
          "Nobody put the lens cap on. The cap was in Priya's jacket pocket. It is in Priya's jacket pocket on the tape, at 00:41, when she takes it off.",
        ],
      },
    ],

    walktome: [
      { t: "text", s: "\"Priya. Walk towards me. Don't turn round. Just walk.\"", as: "voice", fear: 30 },
      { t: "text", s: "She walks. Four steps. Behind her, it does not follow; it stands exactly where it is and gets smaller as she gets bigger.", fx: "figure", sfx: "steps", fear: 36 },
      { t: "text", s: "She reaches the camera. She is fine. She is annoyed, which is the most reassuring thing on the whole tape.", fear: 22 },
      { t: "text", s: "\"What,\" she says.", as: "voice", fear: 20 },
      { t: "text", s: "\"We're going. Now. Don't look back down the corridor.\"", as: "voice", fear: 24 },
      { t: "text", s: "She does not look back. This is why she is alive, and she has said so, in those words, once, and never again.", slow: true, fear: 26 },
      {
        t: "ending",
        id: "she-didnt-look-back",
        outcome: "survived",
        title: "She Didn't Look Back",
        lines: [
          "All three out. 04:11 on the tape and a car park at the end of it.",
          "The footage between 02:20 and 02:44 shows a standing figure at the edge of the camera light behind a woman who is walking away from it and does not know it is there.",
          "It is the most-reproduced image in the whole eleven-tape set, and Priya has authorised its use exactly twice, and both times on the condition that it is printed with the caption she wrote: \"Nothing happened. That is the point of it.\"",
        ],
      },
    ],

    grabrun: [
      { t: "text", s: "The frame goes to nothing — a hand across the lens, a shoulder, the floor at forty degrees.", fx: "glitch", sfx: "whoosh", shake: true, fear: 40 },
      { t: "text", s: "Running. Shouting. A door.", sfx: "scream", fear: 44 },
      { t: "text", s: "The camera comes up in the stairwell. Two people on the landing. Both breathing hard.", fx: "static", fear: 30 },
      { t: "text", s: "Two.", slow: true, hold: 1200, sfx: "sting", fear: 44 },
      { t: "text", s: "\"Where's Faisal?\"", as: "voice", fear: 46 },
      {
        t: "choice",
        prompt: "Nobody grabbed Faisal.",
        timer: 180,
        options: [
          { label: "Go back up.", go: "goback", fear: 32 },
          { label: "Get out and call it in.", go: "callitin", fear: 26 },
        ],
      },
    ],

    callitin: [
      { t: "text", s: "The footage runs down three flights and out into a car park and stays on for another nine minutes.", fx: "flash", amb: "silence", fear: 24 },
      { t: "text", s: "Most of it is a woman on a phone and a man being sick against a fence.", fear: 18 },
      { t: "text", s: "At 12:40 Faisal walks out of the fire door on his own, unhurried, and asks why everyone is standing in the car park.", slow: true, sfx: "sting", amb: "tape", fear: 38 },
      { t: "text", s: "He has no memory of the corridor. He is perfectly well. He is, by every test anyone ran that year, Faisal.", fear: 36 },
      {
        t: "ending",
        id: "faisal-walked-out",
        outcome: "doomed",
        title: "Faisal Walked Out",
        lines: [
          "Three went in. Three came out. The tape is 13:02 long, which is the longest of the eleven, and most of it is a car park.",
          "Faisal is alive, well, and has a career, a family and a very clear account of that night which begins in the stairwell and ends in the car park, with nothing in the middle.",
          "He has also, every year since 1998, on the same date, taken the day off work. He does not know why. He books it eleven months in advance.",
        ],
      },
    ],

    dontlookaway: [
      { t: "text", s: "The camera stays on it. It does not move. The operator does not move.", fx: "figure", fear: 38 },
      { t: "text", s: "Forty-one seconds of a standing figure at two metres, in the light, in focus, in frame.", slow: true, hold: 1600, sfx: "breath", fear: 46 },
      { t: "text", s: "It does not approach while it is being watched. That is the whole rule and it is in the footage and nobody has ever needed to say it out loud.", fear: 40 },
      { t: "text", s: "At 03:22 Priya, off camera, says: \"The battery.\"", as: "voice", slow: true, sfx: "sting", fear: 50 },
      {
        t: "choice",
        prompt: "One bar. It has been one bar since 02:04.",
        timer: 180,
        options: [
          { label: "Keep filming until it dies.", go: "untildead", fear: 34 },
          { label: "Back out with it in frame.", go: "backout", fear: 24 },
        ],
      },
    ],

    untildead: [
      { t: "text", s: "The camera holds. Two metres. Forty seconds. Sixty.", fx: "figure", fear: 44 },
      { t: "text", s: "The battery indicator flashes at 03:58.", fear: 48 },
      { t: "text", s: "At 04:09 the picture goes.", slow: true, fx: "dark", hold: 1400, sfx: "drop", fear: 52 },
      { t: "text", s: "The audio runs for two more seconds on residual charge. In those two seconds there are three sets of footsteps, and one of them is very fast.", sfx: "steps", shake: true, fear: 56 },
      {
        t: "ending",
        id: "until-the-battery",
        outcome: "worst",
        title: "Until the Battery Died",
        lines: [
          "Tape 07 ends at 04:11. Two of the three were found at 06:50 in the third-floor stairwell, unhurt and uncommunicative.",
          "The third was found in the car park at 05:12 by a security patrol, standing, facing the building, and when asked what they were doing said they were waiting for the others.",
          "They were asked how they got out ahead of the others and they said they had come out first. The fire door alarm log records one activation that night, at 06:51.",
        ],
      },
    ],

    tellnow: [
      { t: "text", s: "\"There's something in the corridor. It's nine metres in front of us. It's been there since we came in.\"", as: "voice", fear: 32 },
      { t: "text", s: "Both of them stop walking. The audio catches it: two people stopping at once.", sfx: "steps", amb: "silence", fear: 36 },
      { t: "text", s: "\"Where,\" says Priya.", as: "voice", amb: "tape", fear: 34 },
      { t: "text", s: "\"Straight ahead. At the light.\"", as: "voice", fear: 36 },
      { t: "text", s: "\"There's nothing at the light,\" she says, and the camera can see her hand come into frame and point directly at it.", slow: true, sfx: "sting", fx: "glitch", shake: true, fear: 48 },
      { t: "text", s: "Her finger goes into it up to the second knuckle.", slow: true, hold: 1300, fear: 54 },
      {
        t: "ending",
        id: "up-to-the-knuckle",
        outcome: "worst",
        title: "Up to the Second Knuckle",
        lines: [
          "Priya's right hand has never been quite right since 1998. She wears a glove on it in winter, describes it as an old injury, and does not elaborate.",
          "In the footage, her hand enters the space where the figure is standing and the image of the hand is occluded, not blurred — something is in front of it.",
          "She has no memory of pointing. The tape shows her pointing for six seconds. She has watched it more times than anyone, and the only thing she has ever said about those six seconds is that she was pointing at nothing, and that she remembers exactly how cold nothing is.",
        ],
      },
    ],

    getout: [
      { t: "text", s: "\"Out. Now. Nobody talks.\"", as: "voice", fear: 24 },
      { t: "text", s: "The footage is a stairwell, filmed badly, at speed.", sfx: "steps", fx: "glitch", fear: 22 },
      { t: "text", s: "Three flights. The fire door. The brick. Daylight.", fx: "flash", fear: 14 },
      { t: "text", s: "The tape runs for another forty seconds in a car park and then cuts.", amb: "silence", fear: -10 },
      {
        t: "ending",
        id: "got-out",
        outcome: "survived",
        title: "Got Out",
        lines: [
          "Nothing on Tape 07 after 01:52 has ever been of any interest to anybody, and that is why all three of them are alive.",
          "The documentary was never made. The footage sat in a box for six years before anyone looked at it, and by then nobody could remember which of the three had been holding the camera.",
          "All three say it was one of the others. All three are certain. That is the only genuinely unexplained thing about this tape, and it is the one nobody writes about.",
        ],
      },
    ],
  },
};
