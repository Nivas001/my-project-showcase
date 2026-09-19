import type { Story } from "@/lib/horror/types";

/**
 * A Tanglish tape. Night shoot on a Tamil Nadu beach, a phone camera, and a
 * rule that fishermen give tourists in one sentence and never expand on.
 */
export const tapeKadaloram: Story = {
  slug: "tape-kadaloram",
  title: "Tape 19 — Kadaloram",
  hook: "Night shoot. Empty beach. Oru meenavar warning kuduthaaru — 'thanni-kitta poga koodadhu'. Camera-la rendu per irundhaanga.",
  tags: ["tanglish", "found footage", "coast"],
  fear: 5,
  minutes: "6-8 min",
  ambience: "tape",
  lang: "tanglish",
  kind: "tape",
  tapeLabel: "KDL-19 · 03:58 · REC",
  tapeScene: "shore",
  endings: 4,
  nodes: {
    start: [
      { t: "text", s: "Short film shoot. Budget: zero. Crew: two. Location: a beach forty minutes past Mahabalipuram with no lights on it.", amb: "tape", fx: "static", fear: 4 },
      { t: "text", s: "Phone on a tripod, torch taped to the side. That is the whole rig.", fear: 6 },
      { t: "text", s: "First thirty seconds of the file: Deepak setting up, complaining, sand in everything.", fx: "glitch", fear: 8 },
      { t: "text", s: "At 00:41 a fisherman walks into frame from the right. Lungi, torch, no boat.", sfx: "steps", fear: 14 },
      { t: "text", s: "\"Thambi. Ipdi night-la inga irukka koodadhu.\"", as: "voice", fear: 18 },
      { t: "text", s: "\"Shoot saar, ten minutes-la mudichuduven.\"", as: "voice", fear: 14 },
      { t: "text", s: "He looks at the sea. Not at them. At the sea, for four full seconds, which is a long time on a tape.", slow: true, fx: "figure", fear: 24 },
      { t: "text", s: "\"Shoot pannunga. Aana thanni-kitta poga koodadhu. Kooptaalum poga koodadhu.\"", as: "voice", slow: true, sfx: "sting", fear: 30 },
      { t: "text", s: "Then he walks out of frame to the left and the tape never sees him again.", fx: "glitch", fear: 26 },
      {
        t: "choice",
        prompt: "Kooptaalum. Even if it calls you.",
        timer: 180,
        options: [
          { label: "Ask him what he means. Follow him.", go: "follow", fear: 16 },
          { label: "Ignore it. Shoot the scene.", go: "shoot", fear: 18 },
          { label: "Pack up. Shoot tomorrow in daylight.", go: "packup", fear: 8 },
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    follow: [
      { t: "text", s: "The phone comes off the tripod. Handheld. Torch swinging. Sand.", fx: "glitch", sfx: "steps", fear: 20 },
      { t: "text", s: "\"Saar! Saar, enna sollreenga?\"", as: "voice", fear: 22 },
      { t: "text", s: "The beach to the left is empty for two hundred metres. It is flat, it is open, and there is nobody on it.", slow: true, fx: "static", fear: 30 },
      { t: "text", s: "There are also no footprints except two sets, and both of them belong to the crew.", sfx: "wind", fear: 36 },
      { t: "text", s: "Deepak, off camera: \"Machi, avaru enga poranaaru?\"", as: "voice", fear: 34 },
      { t: "text", s: "On the audio, from the direction of the water, somebody answers.", slow: true, sfx: "whisper", fx: "figure", shake: true, fear: 42 },
      { t: "text", s: "\"Inga da.\"", as: "voice", fear: 44 },
      {
        t: "choice",
        prompt: "It is the fisherman's voice and it is coming from the sea.",
        timer: 180,
        options: [
          { label: "Point the camera at the water.", go: "atwater", fear: 26 },
          { label: "Get in the car. Leave.", go: "leave", fear: 16 },
          { label: "Answer him.", go: "answer", fear: 32 },
        ],
      },
    ],

    shoot: [
      { t: "text", s: "They shoot. Four takes of a man walking towards the sea and stopping, which is the entire short film.", fx: "figure", fear: 16 },
      { t: "text", s: "Take one: fine. Take two: fine. Take three: Deepak walks out of frame to the right by mistake and comes back laughing.", fear: 14 },
      { t: "text", s: "Take four is the one everybody has seen.", slow: true, fx: "glitch", fear: 24 },
      { t: "text", s: "Deepak walks towards the water. He stops on the mark. He turns around to deliver the line.", fear: 26 },
      { t: "text", s: "Behind him, between him and the sea, at the edge of what the torch reaches, somebody is standing in the water up to the knees.", slow: true, sfx: "sting", fx: "approach", shake: true, fear: 38 },
      { t: "text", s: "Deepak delivers the line perfectly. It is the best take. He has said so, in public, more than once, with a straight face.", fear: 34 },
      {
        t: "choice",
        prompt: "He cannot see behind himself. You can.",
        timer: 180,
        options: [
          { label: "Shout. Tell him to come back.", go: "shout", fear: 26 },
          { label: "Keep rolling. Do not stop the take.", go: "keeprolling", fear: 30 },
          { label: "Zoom past him. Get the shot.", go: "zoompast", fear: 32 },
        ],
      },
    ],

    packup: [
      { t: "text", s: "\"Seri da, naaliki morning varalaam.\"", as: "voice", fear: 6 },
      { t: "text", s: "The tape shows a tripod coming down, a bag zipping, two people walking up the beach towards a road.", sfx: "steps", fear: 8 },
      { t: "text", s: "At 02:14 the camera is still recording in the bag — the stop button was never pressed. Forty seconds of fabric and footsteps.", fx: "dark", fear: 14 },
      { t: "text", s: "At 02:54 the footsteps stop. Somebody says, quite clearly, from very close to the bag:", slow: true, sfx: "whisper", fear: 28 },
      { t: "text", s: "\"Nalla mudivu.\"", as: "voice", sfx: "sting", shake: true, fear: 34 },
      { t: "text", s: "Neither of them said it. The audio has both of their voices in the same forty seconds, and the vowels do not match either.", fear: 32 },
      {
        t: "choice",
        prompt: "Good decision, it said.",
        timer: 180,
        options: [
          { label: "Take the camera out. Look behind you.", go: "lookbehind", fear: 24 },
          { label: "Keep walking. Do not stop.", go: "keepwalking", fear: 14 },
        ],
      },
    ],

    keepwalking: [
      { t: "text", s: "The footsteps resume. Nobody takes the camera out of the bag.", fx: "dark", sfx: "steps", fear: 18 },
      { t: "text", s: "Ninety seconds of fabric noise, a car door, an engine, and a radio coming on halfway through a song.", fear: 10 },
      { t: "text", s: "The file ends when the battery does, forty minutes later, on a highway.", fx: "static", fear: 6 },
      {
        t: "ending",
        id: "nalla-mudivu",
        outcome: "survived",
        title: "Nalla Mudivu",
        lines: [
          "The short film was shot the following Sunday at 7 AM and it is fine. It got eleven hundred views.",
          "Neither of them noticed the line in the audio until three years later, when Deepak was scrubbing the old files for a showreel.",
          "They have both listened to it perhaps two hundred times between them. It is the only thing on the recording. It is warm, and it is approving, and it is standing right next to a bag on a man's shoulder on an empty beach, and it is glad they were leaving.",
        ],
      },
    ],

    lookbehind: [
      { t: "text", s: "The camera comes out of the bag. Torch swings back down the beach.", fx: "glitch", sfx: "whoosh", fear: 26 },
      { t: "text", s: "Two hundred metres of sand. Their own footprints going back to the tripod marks.", fx: "static", fear: 24 },
      { t: "text", s: "Two sets of prints leaving. Two sets arriving.", fear: 22 },
      { t: "text", s: "And one more set, arriving, in step with theirs, from the water to the road, that stops exactly where the camera came out of the bag.", slow: true, sfx: "sting", fx: "figure", shake: true, fear: 42 },
      {
        t: "choice",
        prompt: "It walked up the beach with them.",
        timer: 180,
        options: [
          { label: "Get to the car. Run.", go: "runcar", fear: 28 },
          { label: "Follow the prints back to the water.", go: "followprints", fear: 34 },
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    shout: [
      { t: "text", s: "\"DEEPAK. VAA DA. IPPO.\"", as: "voice", sfx: "scream", fear: 30 },
      { t: "text", s: "He comes. He is annoyed about the take. He walks up the beach towards the camera and does not look behind him once, which is the entire reason this story has an ending anyone can live with.", sfx: "steps", fear: 26 },
      { t: "text", s: "The figure in the water does not move. It is in frame for another eleven seconds as he walks away from it.", slow: true, fx: "figure", fear: 34 },
      { t: "text", s: "At 03:11 the torch battery goes and the frame drops to grain.", fx: "dark", sfx: "drop", fear: 38 },
      { t: "text", s: "In the four seconds of near-black before the phone auto-exposes, the water is much closer to the camera than it was.", slow: true, sfx: "water", shake: true, fear: 44 },
      {
        t: "choice",
        prompt: "Tide-a? Or vera edho?",
        timer: 180,
        options: [
          { label: "Both of you run for the car.", go: "runcar", fear: 24 },
          { label: "Point the camera at the water one more time.", go: "atwater", fear: 34 },
        ],
      },
    ],

    keeprolling: [
      { t: "text", s: "The operator does not shout. The take runs.", fx: "approach", fear: 32 },
      { t: "text", s: "Deepak finishes the line. He holds. He waits for the cut that does not come.", fear: 34 },
      { t: "text", s: "Behind him, the thing in the water comes up onto the sand. On the tape it takes four steps and they are all in the same frame-time as one of Deepak's breaths.", slow: true, sfx: "sting", fx: "approach", shake: true, fear: 48 },
      { t: "text", s: "\"Cut sollu da,\" says Deepak.", as: "voice", fear: 46 },
      { t: "text", s: "\"Cut sollu da,\" says the thing standing behind him, in the same voice, at the same moment.", as: "voice", slow: true, sfx: "reverse", fear: 54 },
      {
        t: "ending",
        id: "cut-sollu-da",
        outcome: "worst",
        title: "Cut Sollu Da",
        lines: [
          "The file is 03:58 long and the last eleven seconds are the phone lying in the sand filming a tripod leg.",
          "Both of them walked off that beach. Both of them got in the car. Both of them are on the audio, talking normally, all the way to the highway.",
          "Deepak has watched take four once. He will not do the film any more — not shorts, not anything — and when people ask he says he got busy with work, and that is true, and it is not the reason.",
        ],
      },
    ],

    zoompast: [
      { t: "text", s: "The phone zooms. Digital. Grain becomes squares becomes nothing.", fx: "glitch", fear: 34 },
      { t: "text", s: "For two seconds, at maximum zoom, past Deepak's shoulder, the frame resolves.", slow: true, fear: 40 },
      { t: "text", s: "It is standing in water up to the knees. It is facing the beach. It is wearing a lungi.", fx: "face", sfx: "sting", shake: true, fear: 50 },
      { t: "text", s: "It is the fisherman.", slow: true, hold: 1200, fear: 52 },
      { t: "text", s: "He walked off to the left at 01:02. He is in the water at 02:48. The beach between those two points is flat and empty and in frame the entire time.", fear: 50 },
      {
        t: "choice",
        prompt: "Avaru enna sonnaaru? Thanni-kitta poga koodadhu.",
        timer: 180,
        options: [
          { label: "Call out to him. Use 'saar'.", go: "callsaar", fear: 30 },
          { label: "Get Deepak. Leave without looking again.", go: "runcar", fear: 24 },
        ],
      },
    ],

    callsaar: [
      { t: "text", s: "\"Saar! Neenga thaana?\"", as: "voice", fear: 34 },
      { t: "text", s: "The figure in the water raises one arm. Not a wave. A beckon — the Tamil one, palm down, fingers folded in.", slow: true, fx: "approach", sfx: "whisper", fear: 44 },
      { t: "text", s: "\"Vaanga thambi.\"", as: "voice", fear: 46 },
      { t: "text", s: "On the tape, Deepak starts walking towards the water.", slow: true, sfx: "steps", shake: true, fear: 52 },
      {
        t: "choice",
        prompt: "He is not being pulled. He is walking normally, the way you walk to somebody who called you.",
        timer: 180,
        options: [
          { label: "Grab him.", go: "grabhim", fear: 34 },
          { label: "Say the fisherman's warning back, loudly.", go: "saywarning", fear: 26 },
          { label: "Keep filming.", go: "keeprolling", fear: 40 },
        ],
      },
    ],

    saywarning: [
      { t: "text", s: "\"THANNI-KITTA POGA KOODADHU. KOOPTAALUM POGA KOODADHU.\"", as: "voice", sfx: "scream", fear: 32 },
      { t: "text", s: "Deepak stops mid-step. On the tape it is instant — one frame walking, the next frame not.", slow: true, fx: "glitch", fear: 36 },
      { t: "text", s: "\"Enna da?\" he says. He has no idea why he is thirty metres down the beach.", as: "voice", fear: 34 },
      { t: "text", s: "In the water, the figure lowers its arm.", fx: "figure", fear: 38 },
      { t: "text", s: "Then it says, flatly, without any of the warmth it had a moment ago: \"Unakku theriyum.\"", as: "voice", slow: true, sfx: "reverse", fear: 44 },
      { t: "text", s: "And it goes under. Not walks — goes under, straight down, in water that the tape shows is knee-deep for another sixty metres.", sfx: "water", shake: true, fear: 48 },
      {
        t: "ending",
        id: "you-knew",
        outcome: "survived",
        title: "Unakku Theriyum",
        lines: [
          "Both of them in the car by 03:20. Both of them alive. The file is 03:58 and the last thirty-eight seconds are a car park and two people not talking.",
          "The rule works because it is a rule. It does not need to be understood and it does not need to be believed; it needs to be said out loud, at volume, by somebody who is not in the water.",
          "Deepak has no memory of walking down the beach and has never watched that section. The operator has watched it perhaps forty times, and has never once been able to see anything at all in the frame that would explain why he started walking.",
        ],
      },
    ],

    grabhim: [
      { t: "text", s: "The phone drops. The frame becomes sand and sky at a diagonal.", fx: "glitch", sfx: "drop", shake: true, fear: 38 },
      { t: "text", s: "Audio only from here. Two men, one of them shouting, one of them not.", sfx: "scream", fear: 42 },
      { t: "text", s: "Struggling. Water. More water.", sfx: "water", fear: 46 },
      { t: "text", s: "At 03:30 the shouting stops. At 03:34 somebody walks past the phone, out of the water, up the beach, unhurried, dripping.", slow: true, sfx: "steps", fx: "dark", fear: 52 },
      { t: "text", s: "At 03:51 a car starts.", hold: 1300, fear: 50 },
      {
        t: "ending",
        id: "one-car-two-doors",
        outcome: "worst",
        title: "Oru Car, Rendu Door",
        lines: [
          "The phone was found by a fisherman on a Tuesday and handed to a police station, where it sat for five months.",
          "Both men are alive. Both men were in Chennai the following morning. Both men have given consistent accounts.",
          "The audio at 03:34 has one set of footsteps leaving the water. The audio at 03:48 has two car doors. Nobody has ever satisfactorily explained the gap, and both of them get very quiet when it is raised, and neither of them has ever raised it with the other.",
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    atwater: [
      { t: "text", s: "The torch swings to the sea.", fx: "glitch", sfx: "whoosh", fear: 30 },
      { t: "text", s: "Flat water. No wind. A beach at three in the morning with no surf at all, which is the first genuinely wrong thing on the tape.", slow: true, amb: "sea", fear: 36 },
      { t: "text", s: "Sixty metres out, standing, up to the waist.", fx: "figure", fear: 38 },
      { t: "text", s: "Forty metres, standing, up to the waist.", fear: 42 },
      { t: "text", s: "Twenty metres. Up to the waist. The sea is not that deep twenty metres out and it is not that shallow sixty metres out.", slow: true, sfx: "sting", fx: "approach", shake: true, amb: "tape", fear: 50 },
      {
        t: "choice",
        prompt: "It is keeping the water at the same height on itself.",
        timer: 180,
        options: [
          { label: "Run.", go: "runcar", fear: 30 },
          { label: "Stand still. Do not go to the water.", go: "standstill", fear: 34 },
          { label: "Walk backwards, keep filming.", go: "backwards", fear: 32 },
        ],
      },
    ],

    standstill: [
      { t: "text", s: "The operator does not move. The rule was about going to the water. Nobody said anything about the water coming to you.", fear: 36 },
      { t: "text", s: "Ten metres. Five.", fx: "approach", sfx: "water", fear: 44 },
      { t: "text", s: "At the waterline it stops, and it is exactly as tall as a man, and the sea is exactly at its waist, and there is no more sea for it to stand in.", slow: true, hold: 1500, sfx: "breath", fear: 50 },
      { t: "text", s: "It does not come out onto the sand.", slow: true, fear: 46 },
      { t: "text", s: "It waits there for the remaining ninety-one seconds of the recording, patient, at the edge, in frame the entire time.", fx: "figure", fear: 44 },
      {
        t: "ending",
        id: "the-waterline",
        outcome: "survived",
        title: "Thanni Varai Mattum",
        lines: [
          "It could not come out. That is the whole of the discovery, and it is on the tape, in focus, for ninety-one seconds.",
          "Both of them walked backwards up the beach to the road without turning round and drove home with the interior light on.",
          "The short film was never finished. The footage has been up on a private link for years and shown to perhaps thirty people, and the only note anyone ever gives is the same one: it never blinks, and it never once looks at the camera, and it is looking at the sand.",
        ],
      },
    ],

    backwards: [
      { t: "text", s: "The operator walks backwards up the beach with the phone held out, which is the hardest way to cover two hundred metres of sand.", sfx: "steps", fx: "figure", fear: 34 },
      { t: "text", s: "The figure stays at the waterline. It does not follow.", fear: 30 },
      { t: "text", s: "At 03:20 the frame catches the tripod, abandoned, and the bag, and Deepak's slippers.", slow: true, fx: "glitch", fear: 38 },
      { t: "text", s: "Deepak is not in the frame and has not been in the frame since 02:12.", slow: true, sfx: "sting", shake: true, fear: 48 },
      { t: "text", s: "On the audio he has been talking the whole time.", slow: true, hold: 1400, sfx: "whisper", fear: 54 },
      {
        t: "ending",
        id: "talking-the-whole-time",
        outcome: "worst",
        title: "Pesitte Irundhaan",
        lines: [
          "Deepak is on the audio from 02:12 to 03:58, continuously, answering questions, making jokes, complaining about sand.",
          "He is not in the frame at any point after 02:12, on a flat open beach, with a torch, beside a man holding a camera.",
          "He walked to the car. He drove home. He is fine. He has watched the tape and he agrees that he is talking and he agrees that he is not there, and the only thing he has ever said about it is that he remembers the conversation, and that he remembers it from further away than he should.",
        ],
      },
    ],

    answer: [
      { t: "text", s: "\"Saar? Enga saar irukkenga?\"", as: "voice", fear: 32 },
      { t: "text", s: "\"Inga da. Thanni-la.\"", as: "voice", sfx: "whisper", fear: 38 },
      { t: "text", s: "The torch goes to the water. Nothing in it. Flat, black, and closer to the camera than it was a minute ago.", fx: "static", sfx: "water", fear: 42 },
      { t: "text", s: "\"Neenga thaan sonneenga saar — thanni-kitta poga koodadhu-nu.\"", as: "voice", fear: 40 },
      { t: "text", s: "A long pause. Eleven seconds, which on a tape of this length is enormous.", slow: true, amb: "silence", hold: 1500, fear: 44 },
      { t: "text", s: "\"Aamaam,\" it says. \"Enakkum yaaro sonnaanga. Naan kekkala.\"", as: "voice", amb: "tape", sfx: "sting", shake: true, fear: 52 },
      {
        t: "choice",
        prompt: "Somebody told him too. He did not listen.",
        timer: 180,
        options: [
          { label: "Leave. Right now. Don't say goodbye.", go: "runcar", fear: 26 },
          { label: "Ask him how long he's been there.", go: "howlong", fear: 36 },
        ],
      },
    ],

    howlong: [
      { t: "text", s: "\"Evvalavu naala saar inga irukkeenga?\"", as: "voice", fear: 38 },
      { t: "text", s: "The answer takes a long time to come and when it does it is not a number.", slow: true, fear: 42 },
      { t: "text", s: "\"Konjam per varuvaanga. Naan sollven. Kelaadhavanga thanni-kitta varuvaanga.\"", as: "voice", sfx: "whisper", fear: 46 },
      { t: "text", s: "\"Appuram naanum oru thadava sollven. Appuram avanga sollvaanga.\"", as: "voice", slow: true, sfx: "reverse", fx: "approach", shake: true, fear: 52 },
      { t: "text", s: "The warning is not a warning. It is a handover, and it has been running for a very long time, and it only works on the person who gives it once.", slow: true, fear: 54 },
      {
        t: "ending",
        id: "the-handover",
        outcome: "doomed",
        title: "Appuram Neenga Solluveenga",
        lines: [
          "Both of them left the beach. Both of them are alive. Neither of them went near the water.",
          "The operator has been back to that stretch of coast eleven times in six years, always at night, always alone, and has never been able to explain to anybody — including themselves — what they are doing there.",
          "Twice they have warned tourists. Both times the words came out in the fisherman's exact phrasing, which they have never consciously memorised, and both times they walked away before the tourists could ask what it meant.",
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    runcar: [
      { t: "text", s: "The frame becomes sand and sky and a torch beam going everywhere.", fx: "glitch", sfx: "steps", shake: true, fear: 32 },
      { t: "text", s: "Two hundred metres of beach at a run. A road. A car.", fear: 26 },
      { t: "text", s: "Doors. Two of them, in quick succession, which is the detail every single person who watches this tape counts.", sfx: "door", fear: 22 },
      { t: "text", s: "The engine. The headlights. The beach in the rear window for about four seconds.", fx: "flash", fear: 18 },
      { t: "text", s: "Nothing on it.", slow: true, fx: "static", fear: -10 },
      {
        t: "ending",
        id: "two-doors",
        outcome: "survived",
        title: "Rendu Door",
        lines: [
          "They left the tripod. It cost more than the short film ever earned and neither of them has ever suggested going back for it.",
          "The file is 03:58 and ends on a highway. Both of them are in the car, both on audio, both on camera when the interior light comes on.",
          "The only thing that has ever bothered either of them is the fisherman: he walked into frame from the right at 00:41 and out to the left at 01:02, onto two hundred metres of flat empty sand, and there is no cut, and the beach is in shot for the next ninety seconds, and he is not on it.",
        ],
      },
    ],

    leave: [
      { t: "text", s: "\"Podhum da. Kelambalaam.\"", as: "voice", fear: 14 },
      { t: "text", s: "The tripod comes down properly. The bag gets zipped. Nobody runs.", sfx: "steps", fear: 12 },
      { t: "text", s: "At the road, the operator turns the camera back on the beach for one last shot, because that is what people with cameras do.", fx: "figure", fear: 22 },
      { t: "text", s: "Two hundred metres of sand, lit by a phone torch, which reaches about nine metres and suggests the rest.", fear: 26 },
      { t: "text", s: "At the waterline, at the very limit of what the torch suggests, somebody is standing facing the beach, and they are not in the water, and they are not on the sand.", slow: true, sfx: "sting", fx: "figure", shake: true, fear: 40 },
      {
        t: "ending",
        id: "one-last-shot",
        outcome: "survived",
        title: "Kadaisi Shot",
        lines: [
          "They drove home. They finished the film somewhere else, in daylight, with a better camera and no fishermen in it.",
          "The last shot is eleven seconds long and has been stabilised, brightened and enlarged by four different people, and all four agree on the same thing: the figure is at the waterline, and the tide is going out, and across eleven seconds the water moves and the figure does not.",
          "It stays exactly where the water was when the fisherman gave his warning. Whatever the rule is measuring, it is not measuring the sea.",
        ],
      },
    ],

    followprints: [
      { t: "text", s: "The torch follows the third set of prints back down the beach. They are bare feet. They are deep — a heavy person, or a slow one.", fx: "glitch", sfx: "steps", fear: 34 },
      { t: "text", s: "Two hundred metres. The tripod marks. The takes. Past all of it.", fear: 36 },
      { t: "text", s: "The prints go into the water, and they do not come out of the water, and they start at the waterline facing inland.", slow: true, sfx: "water", fear: 44 },
      { t: "text", s: "There is one set. It walked up the beach with them and it did not walk down the beach to meet them.", slow: true, sfx: "sting", fx: "approach", shake: true, fear: 50 },
      { t: "text", s: "The torch goes to the water on its own, the way a torch does when a hand shakes.", fx: "face", fear: 54 },
      {
        t: "ending",
        id: "one-way-prints",
        outcome: "doomed",
        title: "Oru Pakkam Mattum",
        lines: [
          "The file ends at 03:58 with the torch on flat water and both men breathing.",
          "They got to the car. They are both fine. The prints were photographed the next morning by a local reporter and were gone by the afternoon tide, which is what tides do.",
          "The thing nobody has ever been able to move past is the direction. It walked up the beach beside them from the water, and the only way that is possible is if it was already on the sand when they arrived, and the warning at 00:41 was not about what was in the sea. It was about what was behind them.",
        ],
      },
    ],
  },
};
