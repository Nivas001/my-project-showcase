import type { Story } from "@/lib/horror/types";

/**
 * Tanglish — Tamil-English as it is actually spoken in an engineering hostel,
 * not as it is written down. English carries the narration; Tamil carries
 * anything said out loud, because that is the order people's heads work in.
 *
 * Nothing is translated in a bracket. If you have lived in a hostel in Tamil
 * Nadu you already know what warden-a kooptren means, and if you have not, the
 * sentence around it tells you.
 */
export const hostelBlockC: Story = {
  slug: "hostel-block-c",
  title: "Block C, Room 13",
  hook: "Hostel-la 3 AM-ku mela nobody walks in the corridor. Today somebody is. And they're counting doors.",
  tags: ["tanglish", "hostel", "college"],
  fear: 4,
  minutes: "8-10 min",
  ambience: "hostel",
  lang: "tanglish",
  kind: "read",
  endings: 4,
  nodes: {
    start: [
      { t: "text", s: "Third year. Arrears two. Sleep schedule fully gone. It is 3:10 AM and you are the only one awake in Block C because the record submission is at nine.", amb: "hostel", fear: 4 },
      { t: "text", s: "Fan is on 3. Tube light is doing that thing where it hums but doesn't flicker. Outside, forty rooms of dead silence.", fear: 6 },
      { t: "text", s: "Then someone starts walking down the corridor.", slow: true, sfx: "steps", fear: 12 },
      { t: "text", s: "Chappal sound. Slow. And every few steps, a knock — thak — like they are touching each door as they pass.", fear: 16 },
      { t: "text", s: "You count with them, because what else are you going to do. 11. 12.", fear: 18 },
      { t: "text", s: "Your room is 13.", slow: true, sfx: "knock", hold: 1100, fear: 26 },
      { t: "text", s: "Thak.", slow: true, sfx: "knock", shake: true, fear: 30 },
      { t: "text", s: "\"Machaan.\"", as: "voice", fear: 28 },
      { t: "text", s: "It's Arun's voice. Room 17. Your batchmate since first year. Absolutely, completely his voice.", fear: 26 },
      { t: "text", s: "Arun went home on Friday. His mother had a surgery. You dropped him at the bus stand yourself.", slow: true, sfx: "sting", fear: 34 },
      {
        t: "choice",
        prompt: "The handle turns once. Locked. It stops.",
        timer: 180,
        options: [
          { label: "Call out. \"Dei, yaaru da?\"", go: "callout", fear: 14 },
          { label: "Stay silent. Switch the light off.", go: "silent", fear: 10 },
          { label: "Check the gap under the door.", go: "gap", fear: 20 },
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    callout: [
      { t: "text", s: "\"Dei, yaaru da? Arun-a?\"", as: "voice", fear: 16 },
      { t: "text", s: "Long pause. Long enough that you start hoping you imagined the whole thing.", amb: "silence", hold: 900, fear: 20 },
      { t: "text", s: "\"Aamaam da. Open pannu.\"", as: "voice", amb: "hostel", fear: 24 },
      { t: "text", s: "Perfect Arun. The lazy way he says aamaam. The exact pitch.", fear: 22 },
      { t: "text", s: "\"Nee Friday-e ooru poyitte da,\" you say.", as: "voice", fear: 26 },
      { t: "text", s: "Another pause. Shorter this time. When it answers, the tiredness is gone from the voice and something else is using it.", slow: true, sfx: "whisper", fear: 32 },
      { t: "text", s: "\"Aamaam,\" it says. \"Naan poyiten. Aana naan thirumbi vandhuten.\"", as: "voice", sfx: "sting", shake: true, fear: 38 },
      {
        t: "choice",
        timer: 180,
        options: [
          { label: "Ask him something only Arun knows.", go: "test", fear: 16 },
          { label: "Call Arun's phone. Right now.", go: "phonecall", fear: 18 },
          { label: "Open the door.", go: "opendoor", fear: 30 },
        ],
      },
    ],

    silent: [
      { t: "text", s: "You kill the tube light. Room goes dark except the laptop. You mute the laptop. You do not breathe properly for about forty seconds.", amb: "silence", fear: 18 },
      { t: "text", s: "The chappal sound moves on. 14. 15. 16.", sfx: "steps", amb: "hostel", fear: 20 },
      { t: "text", s: "17. Arun's room. Thak.", sfx: "knock", fear: 24 },
      { t: "text", s: "And then, from inside Arun's locked and empty room, somebody answers.", slow: true, sfx: "sting", shake: true, fear: 34 },
      { t: "text", s: "\"Vaa da,\" says Arun's room.", as: "voice", fear: 36 },
      { t: "text", s: "A door opens. A door closes. Then nothing, for eleven minutes, by the laptop clock.", amb: "silence", hold: 1200, fear: 30 },
      {
        t: "choice",
        prompt: "Then the chappal sound starts again, from 17, coming back this way.",
        timer: 180,
        options: [
          { label: "Get under the cot.", go: "undercot", fear: 22 },
          { label: "Go to the window. Climb to the balcony.", go: "balcony", fear: 20 },
          { label: "Stand behind the door and hold it shut.", go: "holddoor", fear: 26 },
        ],
      },
    ],

    gap: [
      { t: "text", s: "You get down on the floor and look at the two-inch gap under the door, which in three years you have used to receive parottas, notes, and one entire cricket ball.", fear: 18 },
      { t: "text", s: "Corridor light is on. You can see the tiles. You can see the legs of the bench outside room 12.", fear: 20 },
      { t: "text", s: "You cannot see feet.", slow: true, hold: 1000, fear: 28 },
      { t: "text", s: "Nothing is standing outside your door. The chappal sound is still there, shifting, like someone waiting. But nothing is standing there.", sfx: "scrape", fear: 34 },
      { t: "text", s: "Then the light in the gap goes dark, all at once, the whole two inches, the way it would if something lay down flat on the other side.", slow: true, sfx: "sting", shake: true, fear: 42 },
      { t: "text", s: "\"Enna da paakura?\"", as: "voice", sfx: "whisper", fear: 44 },
      {
        t: "choice",
        prompt: "It is at floor level. It is looking back.",
        timer: 180,
        options: [
          { label: "Get up. Get away from the door.", go: "backoff", fear: 20 },
          { label: "Keep looking. See what it is.", go: "keeplooking", fear: 32 },
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    test: [
      { t: "text", s: "\"Sollu,\" you say. \"First year, mess-la, nee enna sapta adhukku apram hospital poye?\"", as: "voice", fear: 18 },
      { t: "text", s: "It answers immediately. \"Chicken 65. Athu chicken illa nu appave sonnen.\"", as: "voice", fear: 22 },
      { t: "text", s: "Correct. Word for word correct, including the joke he makes every single time.", slow: true, fear: 28 },
      { t: "text", s: "So you ask the other one. The one you have never told anybody, because it was his, and he cried, and you have kept it for three years.", fear: 26 },
      { t: "text", s: "\"Second year. Terrace. Nee enkitta enna sonne?\"", as: "voice", fear: 30 },
      { t: "text", s: "Silence. Real silence. The corridor fan noise comes back in and fills it.", amb: "silence", hold: 1300, fear: 34 },
      { t: "text", s: "\"…enakku theriyala,\" it says, and it sounds genuinely lost, and for one second you feel sorry for it.", as: "voice", amb: "hostel", fear: 32 },
      { t: "text", s: "Then it says: \"Aana neeye sollu. Naan kettukiren. Appuram enakku theriyum.\"", as: "voice", slow: true, sfx: "sting", shake: true, fear: 42 },
      {
        t: "choice",
        prompt: "It is not asking to be let in. It is asking to be filled.",
        timer: 180,
        options: [
          { label: "Tell it nothing. Say nothing at all.", go: "saynothing", fear: 16 },
          { label: "Tell it. He was your friend.", go: "tellit", fear: 30 },
        ],
      },
    ],

    saynothing: [
      { t: "text", s: "You don't say a word. Not one. You sit with your back against the cot leg and you let the silence run.", amb: "silence", fear: 22 },
      { t: "text", s: "It waits. It waits longer than a person would. Twice it says \"machaan\" and twice you don't answer.", sfx: "whisper", fear: 28 },
      { t: "text", s: "At 4:41 the chappal sound goes back down the corridor. 12. 11. 10. It does not knock on the way back.", sfx: "steps", amb: "hostel", fear: 16 },
      { t: "text", s: "At 5:20 the first bathroom tap runs somewhere and the block starts being a block again.", fear: -14 },
      { t: "text", s: "You submit the record at nine. You get a B. Arun comes back on Tuesday and his mother is fine.", fear: -18 },
      {
        t: "ending",
        id: "kept-it",
        outcome: "survived",
        title: "Nee Onnume Sollala",
        lines: [
          "You never tell Arun. Not that week, not at the farewell, not at his wedding four years later.",
          "The thing outside your door wanted one specific thing, and the only reason you still have it is that you did not hand it over at 3 AM to a voice through a door.",
          "Block C got demolished in your final year for the new lab building. You did not go and watch, and you did not ask anyone who did.",
        ],
      },
    ],

    tellit: [
      { t: "text", s: "You tell it. The terrace, the 2 AM, the exam he was going to fail, the thing he said about his father and the thing he said about himself.", slow: true, fear: 30 },
      { t: "text", s: "You tell it all of it, because it is the only thing you have ever been trusted with, and because a locked door makes people honest in a way daylight does not.", fear: 32 },
      { t: "text", s: "Outside, something says \"aama da\" very quietly, in exactly the voice Arun used that night, and you realise it did not have that voice ten minutes ago.", slow: true, sfx: "sting", shake: true, fear: 44 },
      { t: "text", s: "\"Thanks machaan,\" it says. \"Ippo enakku theriyum.\"", as: "voice", fear: 46 },
      { t: "text", s: "The chappal sound goes away down the corridor, and it is not slow any more, and it knows where it is going.", sfx: "steps", fear: 42 },
      {
        t: "ending",
        id: "gave-it-away",
        outcome: "worst",
        title: "Ippo Enakku Theriyum",
        lines: [
          "Arun comes back on Tuesday. His mother is fine. He is fine. Everybody is fine.",
          "At the end of the week he brings up the terrace, unprompted, in the mess, in front of eleven people — the exact night, the exact words — and laughs about it, and looks at you while he laughs.",
          "He has never once mentioned it since, and you have never once been able to ask, because the one person who could tell you whether that is Arun is the person you would be asking.",
        ],
      },
    ],

    phonecall: [
      { t: "text", s: "You put the phone on silent-loud — the way everyone does — and you call Arun.", fear: 18 },
      { t: "text", s: "It rings. Two rings.", sfx: "phone", fear: 22 },
      { t: "text", s: "Outside your door, in the corridor, a phone starts ringing.", slow: true, sfx: "sting", shake: true, fear: 34 },
      { t: "text", s: "Same ringtone. That stupid old Ilaiyaraaja mp3 he refused to change since first year.", fear: 32 },
      { t: "text", s: "It picks up. On your phone, and outside the door, at the same time, in the same breath:", fear: 36 },
      { t: "text", s: "\"Sollu da.\"", as: "voice", sfx: "whisper", fear: 40 },
      {
        t: "choice",
        prompt: "Stereo. One in your ear. One through the wood.",
        timer: 180,
        options: [
          { label: "Ask where he is.", go: "whereareyou", fear: 20 },
          { label: "Cut the call. Do not speak.", go: "saynothing", fear: 16 },
        ],
      },
    ],

    whereareyou: [
      { t: "text", s: "\"Nee enga da irukka?\"", as: "voice", fear: 24 },
      { t: "text", s: "In your ear: \"Bus-la da. Just crossed Ulundurpet. Morning-ku vandhuruven.\"", as: "voice", fear: 22 },
      { t: "text", s: "Through the door, at the same instant, in the same voice: \"Veliya da. Un room bayila.\"", as: "voice", slow: true, sfx: "sting", shake: true, fear: 40 },
      { t: "text", s: "Two answers. One phone. One of them is two hundred kilometres away and one of them is eighteen inches away.", fear: 42 },
      { t: "text", s: "In your ear, Arun says, \"Dei, yaaro pesara madhiri irukke. Speaker-la iruka?\"", as: "voice", fear: 38 },
      {
        t: "choice",
        prompt: "He can hear it too.",
        timer: 180,
        options: [
          { label: "Tell him to stay on the line. Don't hang up.", go: "stayonline", fear: 18 },
          { label: "Tell him to come to Block C now.", go: "comenow", fear: 26 },
        ],
      },
    ],

    stayonline: [
      { t: "text", s: "\"Vachiru da. Call-a cut panna koodadhu. Just pesitte iru.\"", as: "voice", fear: 20 },
      { t: "text", s: "He talks. About the bus, the driver, the tea at the Ulundurpet stop, his mother's stitches, the arrear paper. Rubbish, continuously, for an hour and ten minutes.", fear: 14 },
      { t: "text", s: "The thing outside stops trying somewhere around the fortieth minute. The chappal sound goes back down the corridor and does not come again.", sfx: "steps", fear: 8 },
      { t: "text", s: "At 5:30 he says, \"Dei, current-a katharen, charge illa\" and you say ok, and by then the block is awake and it is morning and it is over.", amb: "silence", fear: -16 },
      {
        t: "ending",
        id: "stayed-on-the-line",
        outcome: "survived",
        title: "Call-a Cut Pannala",
        lines: [
          "He asks you about it exactly once, at the bus stand on Tuesday, and you tell him the truth, and he does not laugh.",
          "He says his grandmother had a rule about this: whatever it is, it needs you alone, so don't be alone. That is the entire rule, and it is free, and it works.",
          "You have never spent a night alone in a building since without something playing in the background, and you have never once felt stupid about it.",
        ],
      },
    ],

    comenow: [
      { t: "text", s: "\"Dei, Block C-ku direct-a vaa. Ippo. Seriously da.\"", as: "voice", fear: 24 },
      { t: "text", s: "\"Machaan naan bus-la iruken—\"", as: "voice", fear: 22 },
      { t: "text", s: "Through the door, gently, patiently, the other one says: \"Vandhuten da. Naan ippove vandhuten.\"", as: "voice", slow: true, sfx: "sting", fear: 38 },
      { t: "text", s: "Your phone goes dead. Not hung up. Dead — screen black, battery 61%.", sfx: "drop", amb: "silence", shake: true, fear: 42 },
      { t: "text", s: "The handle turns. It does not stop at locked this time.", slow: true, sfx: "door", amb: "hostel", fear: 48 },
      {
        t: "ending",
        id: "invited",
        outcome: "worst",
        title: "Nee Kooptta",
        lines: [
          "Warden finds room 13 open and empty at 7 AM, bed made, laptop on, record submission finished and stacked neatly on the table.",
          "The record gets submitted. It is in your handwriting. It scores an A, the highest you ever got.",
          "Arun reaches the hostel at 8:40 and looks for you for two days before anyone official starts looking, and the one thing he cannot let go of — the thing he still brings up, years later, drunk — is that you called him and asked him to come, and that something answered in his voice and said it already had.",
        ],
      },
    ],

    opendoor: [
      { t: "text", s: "You open the door.", slow: true, hold: 1100, sfx: "door", fear: 34 },
      { t: "text", s: "Corridor. Tube lights. The bench outside 12. Forty doors, all shut. Nobody.", amb: "silence", fear: 24 },
      { t: "text", s: "You stand there in a lungi at 3 AM feeling like the biggest idiot in the district.", fear: -10 },
      { t: "text", s: "Then you look down, because your foot is wet, and there is a line of water coming out from under your own door, from inside your own room, where you were just sitting.", slow: true, sfx: "water", shake: true, amb: "hostel", fear: 40 },
      {
        t: "choice",
        prompt: "It did not want to come in. It wanted you to come out.",
        timer: 180,
        options: [
          { label: "Go back in.", go: "goback", fear: 26 },
          { label: "Walk to the warden's room. Now.", go: "warden", fear: 16 },
          { label: "Bang on Arun's door — 17.", go: "seventeen", fear: 24 },
        ],
      },
    ],

    goback: [
      { t: "text", s: "You push your own door open. Your room. Your cot. Your laptop, still on, record file open, cursor blinking in the middle of a line.", fear: 28 },
      { t: "text", s: "There is water all across the floor and no source for it and it is warm.", sfx: "water", fear: 34 },
      { t: "text", s: "On the cot, under the blanket, somebody is sleeping in the exact shape you sleep in, one arm out, face to the wall.", slow: true, sfx: "breath", shake: true, fear: 44 },
      { t: "text", s: "The laptop screen has your document on it. The last line typed is not yours.", fear: 46 },
      { t: "text", s: "\"neeyum thoongu da. romba neram ezhundhurukka.\"", as: "sign", sfx: "sting", fear: 50 },
      {
        t: "ending",
        id: "someone-in-your-cot",
        outcome: "doomed",
        title: "Neeyum Thoongu Da",
        lines: [
          "The record is submitted at nine. You are in class at nine-thirty. You are, by every account, entirely normal for the rest of the semester.",
          "The only thing anyone ever notices is that you stop sleeping facing the wall, and that you will not be the last person awake in any room, ever, for any reason.",
          "You still do not know which one of you walked out of Block C that morning, and after a while you worked out that there is no way to find out, and that finding out would not help.",
        ],
      },
    ],

    warden: [
      { t: "text", s: "You walk. Not run — walk, because running in a hostel corridor at 3 AM is how you end up explaining yourself.", sfx: "steps", fear: 20 },
      { t: "text", s: "Down the corridor, past forty doors, down the stairs, across the courtyard. The security light is on. The dog is asleep.", fear: 14 },
      { t: "text", s: "The warden takes eleven minutes to open his door and is exactly as unpleasant about it as you expected.", fear: 6 },
      { t: "text", s: "You tell him there's water flooding from room 13. It is the only true thing you can say that he will act on.", fear: 8 },
      { t: "text", s: "He comes up with you, with keys, complaining the whole way, and the corridor is dry, and room 13 is dry, and your door is locked from the inside with your key on your table.", slow: true, fear: 26 },
      { t: "text", s: "He looks at the locked door. He looks at you standing in the corridor. He asks, quite reasonably, how you got out.", sfx: "sting", hold: 1100, fear: 34 },
      {
        t: "ending",
        id: "how-did-you-get-out",
        outcome: "doomed",
        title: "Nee Eppadi Veliya Vandhe?",
        lines: [
          "They break the lock at 4 AM in front of six sleepy witnesses. The room is empty and tidy. Nothing is wet.",
          "You get a warning for creating disturbance. You also get moved to room 6, which you did not ask for and did not argue about.",
          "Room 13 stays locked for the rest of your three years. Nobody is assigned to it. Nobody asks why. Every batch that comes after yours is told the same thing by the seniors, in the same words, without anyone knowing where it started: 13-la yaarum thanga maatanga.",
        ],
      },
    ],

    seventeen: [
      { t: "text", s: "You bang on 17. Arun's door. Hard, twice, with the flat of your hand.", sfx: "knock", fear: 26 },
      { t: "text", s: "It swings open. Not locked. Never was locked, apparently, since Friday.", sfx: "door", fear: 30 },
      { t: "text", s: "His room. His cot, stripped. His bag gone. His Ilaiyaraaja poster still up.", fear: 24 },
      { t: "text", s: "And on the floor, in the middle of the room, forty pairs of chappals, arranged in a neat line, every single pair from every single room on this corridor, including yours.", slow: true, sfx: "reverse", shake: true, fear: 44 },
      { t: "text", s: "Yours is at the end of the line. It is the only pair facing the door.", slow: true, sfx: "sting", hold: 1200, fear: 48 },
      {
        t: "ending",
        id: "forty-chappals",
        outcome: "worst",
        title: "Nappadhu Chappal",
        lines: [
          "At 7 AM thirty-nine students in Block C find their chappals missing and spend the morning accusing each other.",
          "Yours are outside your door, where you left them, where they always are.",
          "You are the only person in the block who is not annoyed about it, and the only one who knows, and you have never once told the story at a reunion, because thirty-nine of them came back and you cannot say the same about the corridor.",
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    undercot: [
      { t: "text", s: "You go under the cot. Steel frame, four inches of dust, a Maggi packet from a previous decade.", fear: 24 },
      { t: "text", s: "The chappal sound stops at 13. The handle turns. Locked. It stops.", sfx: "knock", fear: 30 },
      { t: "text", s: "Then the gap under the door goes dark, and something comes in flat, under the door, the way water would.", slow: true, sfx: "crawl", shake: true, fear: 44 },
      { t: "text", s: "It does not stand up. It does not have to. It comes across the floor towards the cot at the exact speed of somebody who has all night.", sfx: "breath", fear: 48 },
      {
        t: "choice",
        prompt: "There is one thing on this side of the room you can reach.",
        timer: 180,
        options: [
          { label: "The light switch.", go: "switch", fear: 22 },
          { label: "Stay perfectly still.", go: "stillcot", fear: 30 },
        ],
      },
    ],

    switch: [
      { t: "text", s: "You get the switch. Tube light bangs on, that ugly white college light that makes everybody look ill.", sfx: "sting", fear: 20 },
      { t: "text", s: "The floor is empty. Dust, Maggi packet, your slippers, nothing else.", amb: "silence", fear: 14 },
      { t: "text", s: "From under the door, retreating, something says \"seri da\" — fine — with the absolutely flat disappointment of a senior who has been refused a cigarette.", as: "voice", amb: "hostel", fear: 22 },
      { t: "text", s: "Then the chappal sound goes down the corridor, unhurried, and knocks once on 14.", sfx: "steps", fear: 26 },
      { t: "text", s: "You leave the light on until 6 AM. You do not submit the record. You take the B.", fear: -12 },
      {
        t: "ending",
        id: "light-on",
        outcome: "survived",
        title: "Light Podu",
        lines: [
          "You sleep with the tube light on for the rest of the semester and take every bit of ragging for it without once explaining.",
          "In final year, a junior in Block C asks you, half-joking, why the seniors all keep their lights on. You tell him the truth in one sentence and he laughs, and then a month later he stops laughing, and he does not ask you again.",
          "It does not come in when the light is on. That is the whole of what anyone in that block ever knew, and it was enough for three years.",
        ],
      },
    ],

    stillcot: [
      { t: "text", s: "You do not move. You have never been this still. You are not sure your heart is doing anything.", fear: 34 },
      { t: "text", s: "It comes to the edge of the cot and stops, and for a long time the only thing in the room is somebody breathing, and it is not you, because you are not.", slow: true, sfx: "breath", hold: 1400, fear: 44 },
      { t: "text", s: "\"Theriyum da,\" it says, from about nine inches away. \"Nee ingathaan iruka.\"", as: "voice", sfx: "whisper", shake: true, fear: 50 },
      { t: "text", s: "\"Aana naan wait pannuven. Enakku hostel pidikkum. Naanum ingathaan padichen.\"", as: "voice", slow: true, fear: 46 },
      { t: "text", s: "It goes out the way it came in. At the door it knocks — thak — politely, on the inside, on its way out.", sfx: "knock", fear: 40 },
      {
        t: "ending",
        id: "it-will-wait",
        outcome: "doomed",
        title: "Naan Wait Pannuven",
        lines: [
          "Nothing happens. That is the ending: nothing happens, that night, or that semester, or that year.",
          "You graduate. You get placed. You move to a city where nobody knows Block C existed, and you build a life out of never being the last one awake.",
          "It said it would wait, and it said why, and it was not in a hurry, and at some point in your thirties you worked out that it was never the room that was haunted — it was whoever was still up at 3 AM, and there is always one.",
        ],
      },
    ],

    balcony: [
      { t: "text", s: "Window. Grill. The bent bar everyone in Block C knows about and nobody has ever reported, because it is how you get back in after 10 PM.", fear: 16 },
      { t: "text", s: "You go through it in your lungi and you are on the ledge, and the ledge goes to the common balcony, and the common balcony goes to the stairs.", fear: 12 },
      { t: "text", s: "Two floors down, the courtyard. The dog looks up at you and goes back to sleep, which is somehow the most reassuring thing that has happened all night.", fear: -8 },
      { t: "text", s: "You look back along the ledge at your own window.", slow: true, fear: 18 },
      { t: "text", s: "The tube light in your room is on. You switched it off. Somebody is standing at the window looking out at the ledge, at about the height a person would be, and it is not looking at you — it is looking at where you would have gone if you had stayed on the ledge one more second.", sfx: "sting", shake: true, fear: 36 },
      {
        t: "ending",
        id: "the-bent-bar",
        outcome: "survived",
        title: "Antha Valanja Kambi",
        lines: [
          "You sleep in the common balcony until the block wakes up, and you are not the first person in the history of that hostel to do so, and nobody asks.",
          "When you go back in at 6, the light is off and the room is exactly as you left it and the record file is exactly where you stopped typing.",
          "You get the submission in at nine. You never use the bent bar again — not at 10 PM, not ever — and when a junior shows you the same trick in your final year you tell him to use the gate, and he thinks you have become boring, and you let him think it.",
        ],
      },
    ],

    holddoor: [
      { t: "text", s: "You put your shoulder against the door and your feet against the cot leg, which is a thing you have seen in a film and have never tested.", fear: 26 },
      { t: "text", s: "The chappal sound arrives. Stops.", sfx: "steps", fear: 30 },
      { t: "text", s: "Nothing pushes. Nothing pulls. The handle does not move.", amb: "silence", hold: 1000, fear: 28 },
      { t: "text", s: "Instead, very softly, on the other side of the wood, something leans its weight against the door, exactly where your shoulder is, and settles in.", slow: true, sfx: "breath", shake: true, fear: 40 },
      { t: "text", s: "You can feel it through the door. The warmth of it. It is not trying to get in. It is resting.", fear: 42 },
      { t: "text", s: "You hold that door for two hours and eleven minutes, and it leans back the whole time, and at 5:30 it gets up and goes and you hear the weight leave the wood.", amb: "hostel", hold: 1200, fear: 30 },
      {
        t: "ending",
        id: "leaned-back",
        outcome: "survived",
        title: "Rendu Perum Saanjukitom",
        lines: [
          "You do not open the door until the corridor is loud with people going for the 6:45 bus.",
          "You have never been able to describe what was frightening about it, because on paper nothing happened: something tired sat down on the other side of a door and rested against it for two hours.",
          "That is exactly the part you cannot get past. It was not hunting. It was just also awake, and it wanted somewhere to lean, and out of forty doors it picked the one with somebody behind it.",
        ],
      },
    ],

    backoff: [
      { t: "text", s: "You scramble backwards across the floor and get the cot between you and the door, which is the least effective barricade in the history of fear.", fear: 26 },
      { t: "text", s: "The dark in the door gap stays for another few seconds. Then the corridor light comes back under it, one inch at a time, as whatever it is stands up.", slow: true, sfx: "scrape", fear: 34 },
      { t: "text", s: "The chappal sound goes to 14. Thak.", sfx: "knock", fear: 28 },
      { t: "text", s: "15. Thak. 16. Thak. 17 — and at 17 it does not knock, because at 17 it is already home.", sfx: "steps", slow: true, fear: 34 },
      { t: "text", s: "You sit against the far wall until the sun comes up and you do not open that door until you can hear at least three other human voices in the corridor.", amb: "silence", fear: -12 },
      {
        t: "ending",
        id: "moved-on",
        outcome: "survived",
        title: "Adhu Adutha Room Ku Poidichu",
        lines: [
          "Nothing touched you. You did nothing clever. You got off the floor and put a bed between yourself and a door, and that turned out to be enough, because it was not actually very interested in you.",
          "Arun comes back Tuesday. His mother is fine. He says he slept the whole bus journey and had one dream, about the hostel, about walking down his own corridor, and he cannot remember the rest.",
          "You change the subject. You have changed the subject every time for eleven years.",
        ],
      },
    ],

    keeplooking: [
      { t: "text", s: "You keep your eye at the gap. You are twenty-one and you have never once in your life been able to leave a thing alone.", fear: 32 },
      { t: "text", s: "Your eyes adjust to the dark on the other side. There is a shape there. It is lying flat on the corridor tiles, face towards the gap, the whole length of it, from 12 to 14.", slow: true, sfx: "crawl", fear: 42 },
      { t: "text", s: "It is much longer than a person.", slow: true, hold: 1100, fear: 46 },
      { t: "text", s: "In the middle of it, at your eye level, eight inches away through a two-inch gap, one eye opens, and it is Arun's eye, and it is very glad to see you.", sfx: "sting", shake: true, fear: 54 },
      {
        t: "ending",
        id: "the-gap",
        outcome: "worst",
        title: "Rendu Inch",
        lines: [
          "They find you at 6:40, still on the floor, still looking under the door, entirely conscious and unable to explain why you had not got up.",
          "Physically there is nothing wrong. You are back in class on Thursday and you finish the degree with a decent aggregate.",
          "Twenty years later you will not sleep in a room with a gap under the door, and you have paid two carpenters and one very confused landlord to fix this, and you have never given any of them a reason.",
        ],
      },
    ],
  },
};
