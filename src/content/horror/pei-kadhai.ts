import type { Story } from "@/lib/horror/types";

export const peiKadhai: Story = {
  slug: "pei-kadhai",
  title: "Pei Kadhai",
  hook: "A village road at midnight. A woman asking for a lift. One old rule you were told never to break.",
  tags: ["folk horror", "roadside", "tamil ghost lore"],
  fear: 5,
  minutes: "6-8 min",
  ambience: "forest",
  endings: 3,
  nodes: {
    start: [
      { t: "text", s: "The shortcut to your grandmother's village saves forty minutes and costs, everyone says, more than that.", amb: "forest", fear: 6 },
      { t: "text", s: "Your uncle gave you three rules when you were nine. You remember two of them clearly.", fear: 10 },
      { t: "text", s: "One: don't stop for anyone after the tamarind tree. Two: if you stop, don't let them sit behind you.", slow: true, fear: 14 },
      { t: "text", s: "The third rule you have forgotten. This has never mattered before.", sfx: "whisper", fear: 16 },
      { t: "text", s: "Half a kilometre past the tamarind tree, your headlights find a woman standing in the middle of the road.", sfx: "sting", fear: 20 },
      { t: "text", s: "White saree. Wet hair, though it has not rained in three weeks. She is holding her hand out, palm down.", fear: 22 },
      {
        t: "choice",
        prompt: "She has not moved. She will not move.",
        timer: 12,
        options: [
          { label: "Drive around her. Do not slow down.", go: "around", fear: 16 },
          { label: "Stop. She might be a real woman in real trouble.", go: "stop", fear: 20 },
          { label: "Reverse.", go: "reverse", fear: 18 },
        ],
      },
    ],

    around: [
      { t: "text", s: "You swerve. Gravel. Branches on the windscreen. You get past her.", sfx: "scrape", fear: 14 },
      { t: "text", s: "In the mirror the road is empty. You laugh, once, badly.", fear: 10 },
      { t: "text", s: "Two kilometres later she is standing in the road again. Same posture. Same wet hair.", slow: true, sfx: "sting", shake: true, fear: 26 },
      { t: "text", s: "This time her palm is up.", fear: 24 },
      {
        t: "choice",
        options: [
          { label: "Drive around her again.", go: "again", fear: 20 },
          { label: "Stop and ask what she wants.", go: "stop", fear: 22 },
        ],
      },
    ],

    again: [
      { t: "text", s: "You swerve. Third time, she is closer. Fourth time, she is at the edge of the headlights.", fear: 24 },
      { t: "text", s: "Fifth time, she is not in the road at all.", slow: true, hold: 1100, fear: 26 },
      { t: "text", s: "The car is heavier. The suspension has taken new weight. The mirror shows the back seat.", sfx: "breath", shake: true, fear: 32 },
      {
        t: "ending",
        id: "behind-you",
        outcome: "worst",
        title: "Rule Two",
        lines: [
          "Do not let them sit behind you.",
          "Your uncle never explained why, and now you understand that he could not have.",
          "The car is found at dawn, engine running, doors locked from inside, nobody in it. Both seats are wet.",
        ],
      },
    ],

    reverse: [
      { t: "text", s: "You throw it into reverse. The engine screams. The road behind you goes back thirty metres.", sfx: "scrape", fear: 18 },
      { t: "text", s: "She is behind the car now. She did not walk there.", slow: true, sfx: "sting", shake: true, fear: 28 },
      { t: "text", s: "You brake. She taps the boot twice, patiently, the way you'd tap a bus to tell the driver to go.", sfx: "knock", fear: 26 },
      { t: "goto", go: "stop" },
    ],

    stop: [
      { t: "text", s: "You stop. She comes to the window. Up close she is entirely ordinary, and that is the horror of it.", fear: 20 },
      { t: "text", s: "\"Kovil varaikkum,\" she says. Just as far as the temple. Her voice is dry, like paper in a drawer.", sfx: "whisper", fear: 22 },
      { t: "text", s: "There is no temple on this road. There was one. Forty years ago, before the reservoir.", slow: true, fear: 26 },
      {
        t: "choice",
        prompt: "She waits with the patience of water.",
        timer: 11,
        options: [
          { label: "Let her in the front seat, beside you.", go: "front", fear: 18 },
          { label: "Let her in the back.", go: "backseat", fear: 26 },
          { label: "Refuse and drive.", go: "refuse", fear: 22 },
        ],
      },
    ],

    refuse: [
      { t: "text", s: "\"Sorry,\" you say, and put the car in gear. She does not argue. That is not a good sign.", fear: 20 },
      { t: "text", s: "For six kilometres nothing happens. You start to breathe.", fear: -6 },
      { t: "text", s: "Then the smell arrives — river silt, wet cloth, old flowers — and the temperature drops.", sfx: "drop", fear: 24 },
      { t: "text", s: "Your grandmother's voice, from the passenger seat: \"You should have taken her. She only ever asks once.\"", slow: true, sfx: "sting", shake: true, fear: 30 },
      { t: "text", s: "Your grandmother has been dead for six years.", fear: 30 },
      {
        t: "choice",
        options: [
          { label: "Look at the passenger seat.", go: "lookSeat", fear: 26 },
          { label: "Keep your eyes on the road. Say the rule out loud.", go: "ruleOut", fear: 18 },
        ],
      },
    ],

    lookSeat: [
      { t: "text", s: "You look.", slow: true, sfx: "breath", fear: 28 },
      { t: "text", s: "Empty seat. Wet upholstery. A single strand of long black hair across the belt buckle.", sfx: "sting", shake: true, fear: 30 },
      { t: "text", s: "When you look back at the road, the road is water.", slow: true, fear: 34 },
      {
        t: "ending",
        id: "reservoir",
        outcome: "worst",
        title: "The Reservoir",
        lines: [
          "The car goes in without a sound, the way the train came into the platform.",
          "They drag the vehicle out three days later from a reservoir that is eleven kilometres from the road you were on.",
          "The temple, they say, is directly underneath. She only wanted a lift as far as the temple.",
        ],
      },
    ],

    ruleOut: [
      { t: "text", s: "You say the two rules aloud, over and over, like a child reciting times tables.", fear: 16 },
      { t: "text", s: "Somewhere around the fortieth repetition you remember the third rule.", slow: true, fear: 20 },
      { t: "text", s: "Three: if you refuse her, do not stop until sunrise. Not for anything. Not for anyone you know.", sfx: "whisper", fear: 24 },
      { t: "text", s: "Ahead, in the headlights, your grandmother is standing in the middle of the road with her hand out.", sfx: "sting", shake: true, fear: 30 },
      {
        t: "choice",
        prompt: "It is 4:40am. Sunrise is at 6:02.",
        timer: 9,
        options: [
          { label: "Drive through her.", go: "through", fear: 24 },
          { label: "Stop. It's your grandmother.", go: "stopGran", fear: 30 },
        ],
      },
    ],

    stopGran: [
      { t: "text", s: "You stop. Of course you stop. You would always have stopped.", fear: 26 },
      { t: "text", s: "She gets in the back without opening the door.", slow: true, sfx: "door", shake: true, fear: 32 },
      {
        t: "ending",
        id: "family",
        outcome: "doomed",
        title: "Family",
        lines: [
          "\"Kovil varaikkum,\" she says, in a voice that is dry as paper in a drawer.",
          "You drive. The sun does not come up at 6:02, or at 7, or at all.",
          "There is a temple at the end of every road now, and you are always just short of it.",
        ],
      },
    ],

    through: [
      { t: "text", s: "You do not slow down. Your hands do it, not you. The bonnet passes through her like fog through a fence.", fear: 24, sfx: "sting" },
      { t: "text", s: "You keep driving. 5:10. 5:40. The sky goes the colour of old ash, then old gold.", fear: -14, amb: "rain" },
      { t: "text", s: "At 6:02 the sun comes up over the paddy fields and everything in the car stops being cold.", sfx: "bell", fear: -25 },
      {
        t: "ending",
        id: "sunrise",
        outcome: "survived",
        title: "Until Sunrise",
        lines: [
          "You arrive at your grandmother's village at seven. Her house has been empty for six years and you sit in it anyway.",
          "You take the long road home. Everyone takes the long road, after.",
          "When your nephew turns nine, you will teach him three rules, and you will make him repeat the third one twice.",
        ],
      },
    ],

    backseat: [
      { t: "text", s: "She gets in behind you. The car sinks on its springs. The smell of river silt fills the cabin.", sfx: "door", fear: 26 },
      { t: "text", s: "You break rule two before you finish remembering rule two.", slow: true, fear: 28 },
      { t: "text", s: "In the mirror she is sitting with her head tilted all the way back, looking at the roof, smiling.", sfx: "sting", shake: true, fear: 32 },
      {
        t: "ending",
        id: "rule-two",
        outcome: "worst",
        title: "Don't Let Them Sit Behind You",
        lines: [
          "Two cold hands settle on your shoulders at the third bend.",
          "They are not pushing or pulling. They are just resting, the way a passenger rests, for a very long journey.",
          "The car is still on that road. It will be on that road when the road is gone.",
        ],
      },
    ],

    front: [
      { t: "text", s: "She sits beside you. You can see her the whole time. This turns out to matter enormously.", fear: 18 },
      { t: "text", s: "She talks about the reservoir. About a wedding. About water coming into a house at night in 1983.", sfx: "whisper", fear: 22 },
      { t: "text", s: "\"Stop here,\" she says, at a stretch of road with nothing on either side but water-weed and dark.", fear: 24 },
      {
        t: "choice",
        prompt: "There is no temple. There is only the reservoir.",
        timer: 10,
        options: [
          { label: "Stop and let her out.", go: "letOut", fear: 20 },
          { label: "Keep driving. Take her to the village instead.", go: "keepDriving", fear: 26 },
        ],
      },
    ],

    letOut: [
      { t: "text", s: "She gets out. She does not thank you. At the water's edge she turns and touches her forehead — a blessing, or a receipt.", fear: -12, sfx: "bell" },
      { t: "text", s: "Then she walks into the reservoir without a ripple, and the cold goes out of the car.", slow: true, fear: -20, amb: "rain" },
      {
        t: "ending",
        id: "delivered",
        outcome: "survived",
        title: "As Far As The Temple",
        lines: [
          "You drove someone home. That is all that happened, and it is enough to keep you up for a year.",
          "The passenger seat stays damp for eleven days. Nothing you do dries it.",
          "On the twelfth day it is dry, and you find a wet marigold under the seat, in a month when marigolds don't flower.",
        ],
      },
    ],

    keepDriving: [
      { t: "text", s: "\"There's nothing here,\" you say. \"Let me take you to the village. There are people there.\"", fear: 22 },
      { t: "text", s: "For the first time, she looks at you directly.", slow: true, sfx: "breath", fear: 28 },
      { t: "text", s: "\"There are people here too,\" she says. \"Under it. I was going to be polite about this.\"", sfx: "sting", shake: true, fear: 32 },
      {
        t: "ending",
        id: "under-it",
        outcome: "doomed",
        title: "Under It",
        lines: [
          "The steering wheel turns under your hands, gently, the way an adult corrects a child's handwriting.",
          "The water is warmer than you expected, and there is a temple bell ringing somewhere below you.",
          "It rings for a very long time.",
        ],
      },
    ],
  },
};
