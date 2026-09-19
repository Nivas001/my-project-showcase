import type { Story } from "@/lib/horror/types";

/**
 * Tech horror, set in the one building this portfolio's author actually knows:
 * an office at 3am with one person in it and a deploy that will not stay dead.
 */
export const nightShift: Story = {
  slug: "night-shift",
  title: "The Night Shift",
  hook: "A rollback you didn't trigger. A commit you didn't write. You are the only one badged into the building.",
  tags: ["tech horror", "on-call", "one location"],
  fear: 4,
  minutes: "8-10 min",
  ambience: "corridor",
  lang: "english",
  kind: "read",
  endings: 4,
  nodes: {
    start: [
      { t: "text", s: "The page comes in at 03:11. PROD-API returning 500s, 4% of requests, climbing.", amb: "corridor", fear: 6 },
      { t: "text", s: "You are nineteen minutes into the office before you notice the car park was empty. Not quiet. Empty." },
      { t: "text", s: "The floor lights come on in banks as you walk, six at a time, and go off behind you at the same rate.", sfx: "steps", fear: 10 },
      { t: "text", s: "Your desk. Your machine. The graph is a cliff and then a plateau: something broke at 03:04 and has been broken at exactly the same rate ever since.", fear: 12 },
      { t: "text", s: "The deploy log says a rollback ran at 03:09.", slow: true, fear: 15 },
      { t: "text", s: "You did not run a rollback. You were on the highway at 03:09.", sfx: "sting", fear: 20 },
      {
        t: "choice",
        prompt: "Something reverted production two minutes before you were paged.",
        timer: 180,
        options: [
          { label: "Read the deploy log. Find out who.", go: "log", fear: 6 },
          { label: "Page the on-call lead. Wake someone up.", go: "page", fear: 4 },
          { label: "Just fix the 500s. Questions later.", go: "fix", fear: 10 },
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    log: [
      { t: "text", s: "Twenty-two deploys today. You scroll up through the afternoon, the standup, the morning.", fear: 8 },
      { t: "text", s: "03:09:41 — rollback to 4f2a9c — triggered by: nivas@", fear: 14 },
      { t: "text", s: "That is your account. The session it ran from has been open for six days.", slow: true, sfx: "whisper", fear: 20 },
      { t: "text", s: "You check the IP. It is this building. Fourth floor. You are on the fourth floor.", sfx: "sting", shake: true, fear: 26 },
      { t: "text", s: "There are forty desks on this floor. Thirty-nine monitors are asleep.", hold: 900, fear: 22 },
      {
        t: "choice",
        prompt: "One of them is not.",
        timer: 180,
        options: [
          { label: "Walk over to it.", go: "desk", fear: 16 },
          { label: "Kill the session remotely first.", go: "kill", fear: 10 },
          { label: "Leave. Call it in from the car.", go: "leave", fear: 8 },
        ],
      },
    ],

    page: [
      { t: "text", s: "You open the escalation channel and start typing. The cursor blinks. The message does not send.", fear: 10 },
      { t: "text", s: "Not an error. It just sits there, greyed, the way a message does when the other end is thinking about it.", fear: 14 },
      { t: "text", s: "Then someone starts typing back.", slow: true, sfx: "whisper", fear: 20 },
      { t: "text", s: "The typing indicator says your own name.", sfx: "sting", shake: true, fear: 26 },
      { t: "text", s: "nivas is typing…", as: "sms", fear: 24 },
      { t: "text", s: "nivas is typing…", as: "sms", hold: 700, fear: 26 },
      { t: "text", s: "don't go to the fourth floor", as: "sms", slow: true, sfx: "drop", fear: 30 },
      { t: "text", s: "You are on the fourth floor. You have been on the fourth floor for eleven minutes.", fear: 32 },
      {
        t: "choice",
        timer: 180,
        options: [
          { label: "Reply. Ask who this is.", go: "reply", fear: 14 },
          { label: "Get to the stairs.", go: "stairs", fear: 18 },
          { label: "Find the machine that's sending it.", go: "desk", fear: 20 },
        ],
      },
    ],

    fix: [
      { t: "text", s: "You do what you are good at. Branch, patch, test, push. Twelve minutes.", fear: -4 },
      { t: "text", s: "The graph comes down. Errors 0.2% and falling. You let out a breath you had been holding since the highway.", amb: "silence", fear: -8 },
      { t: "text", s: "03:41. A rollback runs. Yours. Reverted.", sfx: "sting", amb: "corridor", fear: 24 },
      { t: "text", s: "The errors climb back to exactly four percent and hold there, flat, patient, like something breathing on purpose.", slow: true, fear: 26 },
      { t: "text", s: "You push again. 03:53. Reverted at 03:54.", fear: 28 },
      { t: "text", s: "You push again. Reverted before the build finishes. It is not reading your commits any more. It is reading you.", sfx: "scrape", shake: true, fear: 34 },
      {
        t: "choice",
        prompt: "Something is watching the pipeline. Or watching you use it.",
        timer: 180,
        options: [
          { label: "Deploy something that lies. Trap it.", go: "trap", fear: 14 },
          { label: "Pull the network cable out of the wall.", go: "cable", fear: 18 },
          { label: "Go find the machine doing it.", go: "desk", fear: 20 },
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    kill: [
      { t: "text", s: "You revoke every session on your account. All eleven. The dashboard confirms it.", fear: -4 },
      { t: "text", s: "For four seconds there is nothing but the air conditioning.", amb: "silence", hold: 800, fear: 10 },
      { t: "text", s: "Then a monitor across the floor wakes up, and the login sound plays.", amb: "corridor", sfx: "sting", shake: true, fear: 28 },
      { t: "text", s: "It does not need your session. It has your password.", slow: true, fear: 30 },
      { t: "goto", go: "desk" },
    ],

    desk: [
      { t: "text", s: "You walk the aisle. Forty desks. The lights come on ahead of you, six at a time.", sfx: "steps", fear: 18 },
      { t: "text", s: "The lit monitor is at the far end, by the window. Your old desk, from before the reorg. Nobody sits there now.", fear: 22 },
      { t: "text", s: "There is a chair pulled out. There is a coffee cup. The coffee is warm.", sfx: "breath", fear: 28 },
      { t: "text", s: "On the screen: your terminal, your prompt, your shell history. The cursor is in the middle of a command.", fear: 30 },
      { t: "text", s: "rm -rf --no-preserve-root /", as: "sign", slow: true, sfx: "drop", fear: 36 },
      { t: "text", s: "It has not been run. It is waiting for someone to press enter.", hold: 900, fear: 34 },
      {
        t: "choice",
        prompt: "The chair is still turning, very slightly, as though someone left it a second ago.",
        timer: 180,
        options: [
          { label: "Clear the line. Ctrl-C.", go: "ctrlc", fear: 12 },
          { label: "Look under the desk.", go: "under", fear: 24 },
          { label: "Look behind you.", go: "behind", fear: 26 },
        ],
      },
    ],

    ctrlc: [
      { t: "text", s: "You reach past the warm cup and clear the line. The command disappears.", fear: -6 },
      { t: "text", s: "The prompt waits. Then, one character at a time, at the speed of someone typing without looking at the keys, it comes back.", sfx: "whisper", fear: 26 },
      { t: "text", s: "r m   - r f", slow: true, as: "sign", fear: 30 },
      { t: "text", s: "You pull the power. The room goes dark to the window.", sfx: "drop", amb: "silence", shake: true, fear: 28 },
      { t: "text", s: "In the black glass you can see the floor behind you reflected, forty desks deep.", fear: 32 },
      { t: "text", s: "Thirty-nine chairs are pushed in. Two are not.", slow: true, sfx: "sting", shake: true, fear: 40 },
      {
        t: "choice",
        options: [
          { label: "Turn around.", go: "behind", fear: 20 },
          { label: "Keep looking at the glass.", go: "glass", fear: 22 },
        ],
      },
    ],

    glass: [
      { t: "text", s: "You do not turn around. You watch the reflection instead, because the reflection cannot lie to you.", amb: "silence", fear: 26 },
      { t: "text", s: "The second chair is occupied. The shape in it is your build. Same hoodie. Same slump. Same hand on the same mouse.", slow: true, fear: 34 },
      { t: "text", s: "It is watching the glass too. It is watching you watch it.", sfx: "breath", fear: 38 },
      { t: "text", s: "You raise your left hand. It raises its left hand. On its side of the glass, that is the wrong hand.", sfx: "sting", shake: true, fear: 44 },
      {
        t: "ending",
        id: "wrong-hand",
        outcome: "worst",
        title: "Wrong Hand",
        lines: [
          "Badge logs show you entering at 03:31 and never leaving.",
          "They also show you leaving at 05:02, without entering.",
          "The 500s stop at 05:02 and never come back. The team never finds the cause, and after a while they stop asking, because the on-call rota is covered every night now, by someone who never sleeps and never complains and answers every page in under a minute.",
        ],
      },
    ],

    under: [
      { t: "text", s: "You crouch. Cables, a dead power brick, eleven months of dust in the shape of two feet.", fear: 18 },
      { t: "text", s: "Not footprints in dust. Dust that has settled around where two feet have been standing, without moving, for eleven months.", slow: true, sfx: "scrape", fear: 32 },
      { t: "text", s: "You are underneath a desk, at eye level with them, and above you the keyboard starts to type.", sfx: "sting", shake: true, fear: 40 },
      {
        t: "choice",
        timer: 180,
        options: [
          { label: "Stay down. Do not look up.", go: "stay", fear: 20 },
          { label: "Come out the other side and run.", go: "stairs", fear: 16 },
        ],
      },
    ],

    stay: [
      { t: "text", s: "You make yourself small and you do not look up. You count the typing. Fourteen characters. A space. Twelve more.", fear: 30 },
      { t: "text", s: "Enter.", slow: true, sfx: "knock", hold: 1100, fear: 36 },
      { t: "text", s: "Every fan in the building spins up at once and then, one row of racks at a time, stops.", sfx: "drop", amb: "silence", fear: 34 },
      { t: "text", s: "The dust in front of your face moves. The two feet turn to face the desk.", sfx: "breath", shake: true, fear: 42 },
      {
        t: "ending",
        id: "no-preserve-root",
        outcome: "doomed",
        title: "No Preserve Root",
        lines: [
          "Everything is gone: the cluster, the backups, the backups of the backups, the six years.",
          "You are found at 07:40 under a desk that has not been assigned to anyone since the reorg, unhurt, unable to say a word for two days.",
          "When you do speak, the first thing you ask is whether anyone got the coffee cup. Nobody knows what you mean. There was no cup.",
        ],
      },
    ],

    behind: [
      { t: "text", s: "You turn around.", slow: true, hold: 900, sfx: "reverse", fear: 30 },
      { t: "text", s: "Forty desks. Forty empty chairs. The lights are on all the way to the far wall, every bank, all at once.", fear: 22 },
      { t: "text", s: "Nothing is there. Nothing has been there. Your own heartbeat is embarrassing in the quiet.", amb: "silence", fear: -14 },
      { t: "text", s: "You laugh, once, and it comes out wrong, and you decide to go home.", fear: -8 },
      { t: "text", s: "Behind you, very politely, someone pushes in the chair.", amb: "corridor", sfx: "sting", shake: true, slow: true, fear: 40 },
      {
        t: "choice",
        prompt: "You do not turn around a second time.",
        timer: 180,
        options: [
          { label: "Walk to the stairs. Do not run.", go: "stairs", fear: 14 },
          { label: "Say your own name out loud.", go: "name", fear: 26 },
        ],
      },
    ],

    name: [
      { t: "text", s: "\"Srinivas,\" you say, to the empty floor, because a name is the smallest thing you own.", fear: 18 },
      { t: "text", s: "Something answers. Not from behind you. From the speaker in the ceiling, the one used for fire drills.", sfx: "radio", fear: 30 },
      { t: "text", s: "It says your name back in your voice, and the recording is six days old, because it is from the standup you gave on Tuesday.", slow: true, fear: 34 },
      { t: "text", s: "Then it says a sentence you have not said yet.", sfx: "whisper", hold: 900, fear: 38 },
      { t: "text", s: "\"It's fine, I'll stay late and sort it.\"", as: "voice", sfx: "sting", shake: true, fear: 44 },
      {
        t: "ending",
        id: "ill-stay-late",
        outcome: "worst",
        title: "I'll Stay Late and Sort It",
        lines: [
          "You say it to the team at 10:30 that morning, in the standup, without meaning to, and hear it leave your mouth a half-second after you heard it in the ceiling.",
          "Nobody notices. Everyone is grateful. Someone says you're a legend.",
          "The 500s come back every night at 03:04, and every night there is someone in the building to fix them, and every night there is one more chair pulled out on the fourth floor.",
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    reply: [
      { t: "text", s: "who is this", as: "sms", fear: 14 },
      { t: "text", s: "The reply is instant, which means it was typed before you asked.", fear: 22 },
      { t: "text", s: "you, in about four minutes", as: "sms", slow: true, sfx: "drop", fear: 30 },
      { t: "text", s: "check the badge log", as: "sms", fear: 28 },
      { t: "text", s: "You check. One badge in tonight. 03:31. Yours.", fear: 24 },
      { t: "text", s: "And one badge out. 03:31. Also yours. Thirty seconds after you badged in, you badged out, and you are still here.", slow: true, sfx: "sting", shake: true, fear: 36 },
      {
        t: "choice",
        timer: 180,
        options: [
          { label: "Ask what happens in four minutes.", go: "four", fear: 20 },
          { label: "Get to the stairs.", go: "stairs", fear: 16 },
        ],
      },
    ],

    four: [
      { t: "text", s: "what happens in four minutes", as: "sms", fear: 24 },
      { t: "text", s: "The typing indicator runs for a long time. Long enough that you check the clock twice.", sfx: "breath", fear: 28 },
      { t: "text", s: "you stop being the one asking", as: "sms", slow: true, sfx: "reverse", fear: 36 },
      { t: "text", s: "Three minutes. The lights at the far end of the floor go out, six at a time, coming this way.", sfx: "steps", shake: true, fear: 42 },
      {
        t: "choice",
        prompt: "Two banks of lights left.",
        timer: 180,
        options: [
          { label: "Run for the stairs.", go: "stairs", fear: 18 },
          { label: "Stand still and let it arrive.", go: "arrive", fear: 30 },
        ],
      },
    ],

    arrive: [
      { t: "text", s: "You stand in the last lit bank of the fourth floor and you wait, because running from something that knows your badge number is a way of getting tired first.", fear: 32 },
      { t: "text", s: "The last lights go out.", slow: true, amb: "silence", hold: 1300, sfx: "drop", fear: 38 },
      { t: "text", s: "Nothing touches you. Nothing speaks. After a while, the lights come back on, six at a time, from the far end, going away.", fear: 26 },
      { t: "text", s: "The monitor at your old desk is asleep. The cup is gone. The chair is pushed in.", amb: "corridor", fear: 18 },
      { t: "text", s: "The errors are at zero. The last deploy in the log is yours, at 03:04, and it is green.", fear: 12 },
      {
        t: "ending",
        id: "held-the-floor",
        outcome: "survived",
        title: "You Held the Floor",
        lines: [
          "You go home at five. You sleep badly for a week and then normally.",
          "The incident review finds a race in the health check and closes it. You let it.",
          "You never take a night page again — you swap for early mornings, and if anyone asks why, you say you're just not a night person, which is true now in a way it was not before.",
        ],
      },
    ],

    /* ---------------------------------------------------------------- */

    trap: [
      { t: "text", s: "You write a deploy that does nothing except log who reverts it, and you give it a tempting name: hotfix-prod-critical.", fear: 8 },
      { t: "text", s: "It goes green at 04:02. You sit back. You wait.", amb: "silence", fear: 12 },
      { t: "text", s: "04:03. Reverted. The log catches it.", sfx: "knock", amb: "corridor", fear: 20 },
      { t: "text", s: "actor: nivas@ · source: 10.4.2.19 · agent: internal-tooling/1.0 · reason field:", fear: 24 },
      { t: "text", s: "\"because the last time you shipped this, everyone on the fourth floor stopped going home\"", as: "sign", slow: true, sfx: "sting", shake: true, fear: 34 },
      { t: "text", s: "You have never shipped this. You wrote it eleven minutes ago.", fear: 32 },
      {
        t: "choice",
        prompt: "The reason field is not a threat. It is a warning, and it is in your own phrasing.",
        timer: 180,
        options: [
          { label: "Ship it anyway. Force the deploy.", go: "force", fear: 24 },
          { label: "Delete the branch. Go home.", go: "gohome", fear: -6 },
          { label: "Trace the IP.", go: "desk", fear: 18 },
        ],
      },
    ],

    force: [
      { t: "text", s: "You add --force and you push, because you are tired and because being told no by your own infrastructure is the last insult of a long night.", fear: 20 },
      { t: "text", s: "It goes out. It stays out. The errors drop to zero and stay at zero.", fear: -8 },
      { t: "text", s: "The lights on the fourth floor come on. All of them, every bank, at once, and stay on.", sfx: "sting", fear: 26 },
      { t: "text", s: "One by one, the monitors wake. Forty of them. Each one showing a terminal, each one with a cursor, each one already logged in.", slow: true, shake: true, fear: 38 },
      { t: "text", s: "Somewhere below you, on three, the lights come on too.", sfx: "riser", hold: 2000, fear: 44 },
      {
        t: "ending",
        id: "everyone-stays",
        outcome: "worst",
        title: "Nobody Goes Home",
        lines: [
          "The team arrives at nine to a floor that is already full.",
          "Everyone is at their desk. Everyone is working. Nobody remembers arriving, and nobody can find their car in the car park, and by eleven nobody is looking.",
          "The deploy is still green. It has been green for two hundred and eleven days. Nobody has taken a night page since, because nobody has left.",
        ],
      },
    ],

    gohome: [
      { t: "text", s: "You delete the branch. You close the laptop mid-graph. You do not fix it.", fear: -10 },
      { t: "text", s: "The walk to the lift is the longest ninety seconds of your professional life, and nothing happens in any of them.", sfx: "steps", fear: 14 },
      { t: "text", s: "In the car park, your car is where you left it. The building behind you has one lit window on the fourth floor.", fear: 18 },
      { t: "text", s: "You do not look at it for long.", hold: 800, fear: 12 },
      {
        t: "ending",
        id: "four-percent",
        outcome: "survived",
        title: "Four Percent Forever",
        lines: [
          "PROD-API has run at 96% success every night since. Never worse. Never better.",
          "Four times a year someone new joins, notices, and opens a ticket. The ticket is closed as won't-fix by an account that stopped having a human attached to it a long time ago.",
          "You approve the closure each time. It is the only thing you have ever been afraid to automate.",
        ],
      },
    ],

    cable: [
      { t: "text", s: "You go under the desk and you pull the cable out of the wall, and then you pull the one next to it, and then you pull all of them.", sfx: "scrape", fear: 16 },
      { t: "text", s: "The floor goes quiet in a way an office never is. No fans. No hum. Nothing between you and your own ears.", amb: "silence", hold: 1000, fear: 22 },
      { t: "text", s: "Your laptop screen stays on. It is not on wifi. It is not on anything.", slow: true, fear: 30 },
      { t: "text", s: "The deploy log refreshes.", sfx: "sting", shake: true, fear: 36 },
      { t: "goto", go: "desk" },
    ],

    /* ---------------------------------------------------------------- */

    stairs: [
      { t: "text", s: "The stairwell door is forty metres away and the lights are already off behind you.", sfx: "steps", fear: 20 },
      { t: "text", s: "You do not run. Running is a decision you cannot take back, and whatever is on this floor has been patient for six days.", fear: 24 },
      { t: "text", s: "You badge out. The reader goes green. The door opens onto concrete and a smell of cold paint.", fear: 14 },
      { t: "text", s: "Four flights. You count them out loud, because counting is a way of not listening.", fear: 18 },
      { t: "text", s: "You reach the ground floor on the count of four and the door in front of you says FOURTH FLOOR.", slow: true, sfx: "sting", shake: true, fear: 34 },
      {
        t: "choice",
        prompt: "The stairwell is not long enough to have done that.",
        timer: 180,
        options: [
          { label: "Go down again. Count again.", go: "again", fear: 20 },
          { label: "Open the door.", go: "opendoor", fear: 24 },
          { label: "Sit down on the step and wait for six o'clock.", go: "wait", fear: 12 },
        ],
      },
    ],

    again: [
      { t: "text", s: "Four flights. Four. The same cold paint, the same chip out of the same step.", fear: 24 },
      { t: "text", s: "FOURTH FLOOR.", slow: true, sfx: "knock", fear: 30 },
      { t: "text", s: "Again. Faster. The count gets ragged.", fear: 32 },
      { t: "text", s: "FOURTH FLOOR.", sfx: "knock", fear: 34 },
      { t: "text", s: "The eleventh time, you notice the chip out of the step is a new chip, and the eighth time you noticed it, it was not there.", slow: true, sfx: "crack", shake: true, fear: 42 },
      {
        t: "ending",
        id: "four-flights",
        outcome: "doomed",
        title: "Four Flights",
        lines: [
          "Building security finds the stairwell door propped open at 06:15 and nobody in the stairwell.",
          "The badge log has you leaving the fourth floor forty-one times between 04:02 and 05:57, and arriving at the fourth floor forty-one times, and never once reaching the ground.",
          "The chip in the step is still there. It has got a little bigger every year since, and the maintenance team have stopped filling it, because it always comes back the same shape: a foot, going down.",
        ],
      },
    ],

    opendoor: [
      { t: "text", s: "You open it. It is the fourth floor. It is dark all the way to the window.", fear: 28 },
      { t: "text", s: "At the far end, at your old desk, a monitor is lit, and the chair is turned to face the door.", slow: true, sfx: "breath", fear: 36 },
      { t: "text", s: "It has been waiting for you to come back the long way around.", sfx: "sting", shake: true, fear: 42 },
      { t: "goto", go: "desk" },
    ],

    wait: [
      { t: "text", s: "You sit on the step between four and three with your back against the wall and your phone at 11%, and you wait for the building to fill up.", fear: 16 },
      { t: "text", s: "At 05:04 the lights in the stairwell go out. You do not move.", amb: "silence", fear: 26 },
      { t: "text", s: "At 05:40 something comes down past you, one step at a time, unhurried, and does not touch you, and takes a very long time to pass.", sfx: "steps", slow: true, hold: 1400, fear: 40 },
      { t: "text", s: "At 06:02 the cleaners badge in on the ground floor and the lights come back on and you are alone on a concrete step with a dead phone.", amb: "corridor", fear: -18 },
      { t: "text", s: "Nothing on the fourth floor is out of place. The cup is not there. The chair is pushed in. The graph is flat and green.", fear: -10 },
      {
        t: "ending",
        id: "sat-it-out",
        outcome: "survived",
        title: "You Sat It Out",
        lines: [
          "You did the only thing that has ever worked in this building: you stopped trying to fix it and you let the night finish.",
          "You hand in your on-call rota change the same morning. Your lead asks if everything's alright. You say it's fine, you just prefer mornings.",
          "You mean it. You have not been in this building after dark since, and you never will be, and that is not a fear — it is a policy, and policies are how sensible engineers survive things they cannot reproduce.",
        ],
      },
    ],
  },
};
