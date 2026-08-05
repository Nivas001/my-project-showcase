import type { GameId } from "@/lib/games";

/** Tiered roasts. Lower is better only for reaction-time. */
const ROASTS: Record<GameId, { bad: string[]; mid: string[]; good: string[] }> = {
  "bug-hunt": {
    bad: [
      "You squashed {s} bugs. My grandmother's cat does QA better than this.",
      "{s} bugs. Honestly, the bugs squashed you.",
      "{s}? That's not a score, that's a cry for help.",
    ],
    mid: [
      "{s} bugs. Perfectly average. The human equivalent of beige.",
      "{s}. Not bad. Not good. Just... employed.",
    ],
    good: [
      "{s} bugs. Fine. FINE. You're decent. Don't let it go to your head.",
      "{s}?! Okay speedrunner, touch some grass.",
    ],
  },
  "snake-byte": {
    bad: [
      "{s} bytes. You lost to a wall. A stationary wall.",
      "{s} bytes collected before self-destructing. Iconic.",
      "{s}. The snake wanted to die rather than be controlled by you.",
    ],
    mid: ["{s} bytes. Mid. Aggressively mid.", "{s}. You survived. Barely. Congrats?"],
    good: ["{s} bytes. Alright, snake charmer. Show-off.", "{s}?! Who hurt you, and how much free time do you have?"],
  },
  "memory-stack": {
    bad: [
      "Level {s}. A goldfish reached level 4.",
      "Level {s}. Your RAM has been deallocated.",
      "{s} levels. Did you blink? Did you forget the game existed?",
    ],
    mid: ["Level {s}. Adequate memory. Like a browser tab you forgot about.", "Level {s}. Solid mediocrity."],
    good: ["Level {s}. Okay, brain. Flexing hard, huh?", "Level {s}. Suspicious. Are you a bot? Blink twice."],
  },
  "code-sprint": {
    bad: [
      "{s} WPM. My compiler types faster than you.",
      "{s} WPM. Are you typing with your elbows?",
      "{s} WPM. Somewhere, a keyboard is crying.",
    ],
    mid: ["{s} WPM. Standard-issue human fingers.", "{s} WPM. You'd survive a stand-up meeting. Barely."],
    good: ["{s} WPM. Fine, you can type. Can you spell though?", "{s} WPM. Okay, keyboard warrior. Literally."],
  },
  "reaction-time": {
    bad: [
      "{s} ms. Continental drift is faster.",
      "{s} ms. Were you buffering?",
      "{s} ms average. Light travelled to the Moon and back waiting for you.",
    ],
    mid: ["{s} ms. Very human. Disappointingly human.", "{s} ms. You reacted. Eventually."],
    good: ["{s} ms. Alright twitchy, calm down.", "{s} ms. Suspiciously fast. I'm reporting you to nobody."],
  },
};

const THRESHOLDS: Record<GameId, { good: number; mid: number; lowerIsBetter?: boolean }> = {
  "bug-hunt": { good: 25, mid: 12 },
  "snake-byte": { good: 20, mid: 8 },
  "memory-stack": { good: 9, mid: 5 },
  "code-sprint": { good: 55, mid: 30 },
  "reaction-time": { good: 250, mid: 400, lowerIsBetter: true },
};

export function roastScore(game: GameId, score: number) {
  const t = THRESHOLDS[game];
  const tier = t.lowerIsBetter
    ? score <= t.good
      ? "good"
      : score <= t.mid
        ? "mid"
        : "bad"
    : score >= t.good
      ? "good"
      : score >= t.mid
        ? "mid"
        : "bad";
  const pool = ROASTS[game][tier];
  const line = pool[Math.floor(Math.random() * pool.length)] ?? pool[0]!;
  return { tier, line: line.replace("{s}", String(score)) };
}

/** Small jabs used while idling / hovering / mid-game. */
export const IDLE_TAUNTS = [
  "Still reading the instructions? Cute.",
  "Take your time. The leaderboard isn't going anywhere. Neither are you.",
  "I've seen toddlers press Start faster.",
  "Warning: this game has been known to expose skill issues.",
  "You can leave. Nobody's watching. Except me. Always me.",
  "Pro tip: winning requires clicking. Revolutionary, I know.",
];

export const SUBMIT_TAUNTS = [
  "Bold of you to put your name on that.",
  "Immortalising mediocrity. Respect.",
  "Saved. Now everyone can see it. Forever.",
  "Committed to the leaderboard. No takebacks, coward.",
];

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] ?? arr[0]!;
}
