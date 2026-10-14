import { motion, useReducedMotion } from "motion/react";
import {
  AudioLines,
  Brain,
  Cloud,
  Cpu,
  Hand,
  HeartHandshake,
  Keyboard,
  Mic,
  MonitorSmartphone,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Terminal,
  Volume2,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { TIERS, type Tier } from "./data";

/* ==========================================================================
 * How she works — the pipeline, left to right
 * ======================================================================== */

const COLUMNS: {
  title: string;
  items: { icon: typeof Mic; name: string; detail: string }[];
}[] = [
  {
    title: "1 · You",
    items: [
      { icon: Mic, name: "“Hey Minutes”", detail: "Vosk, always listening, tiny grammar" },
      { icon: Keyboard, name: "Meta + M / tap", detail: "KWin script → D-Bus" },
      { icon: Terminal, name: "minutes ask …", detail: "CLI over D-Bus" },
    ],
  },
  {
    title: "2 · Hear",
    items: [
      {
        icon: AudioLines,
        name: "Silero VAD",
        detail: "records until you stop, keeps audio said during model load",
      },
      { icon: ScrollText, name: "faster-whisper", detail: "speech → text on the GPU (CUDA)" },
    ],
  },
  {
    title: "3 · Think",
    items: [
      { icon: Zap, name: "Rules", detail: TIERS.rules.engine },
      { icon: Cpu, name: "Local brain", detail: TIERS.local.engine },
      { icon: Cloud, name: "Cloud brain", detail: TIERS.cloud.engine },
    ],
  },
  {
    title: "4 · Do",
    items: [
      { icon: Hand, name: "~50 skills", detail: "apps, Spotify, focus, dev tools, reminders" },
      { icon: ShieldCheck, name: "Approval gate", detail: "shell commands wait for a clear yes" },
    ],
  },
  {
    title: "5 · Answer",
    items: [
      { icon: Volume2, name: "Kokoro TTS", detail: "local neural voice, streamed by sentence" },
      {
        icon: MonitorSmartphone,
        name: "Widget + overlay",
        detail: "QML character over a loopback WebSocket",
      },
    ],
  },
];

export function HowSheWorks() {
  const reduced = useReducedMotion();
  return (
    <div>
      <div className="relative overflow-hidden rounded-[24px] border-2 border-border bg-[#1b1714] p-4 text-[#f6efe8] sm:p-6">
        {/* the signal travelling down the stages */}
        {!reduced ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 h-32"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(255,160,70,0.13), transparent)",
            }}
            animate={{ top: ["-20%", "105%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
          />
        ) : null}
        <ol className="relative space-y-4">
          <span
            aria-hidden
            className="absolute bottom-4 left-[11px] top-4 w-px bg-[#ffad5c]/30 sm:left-[13px]"
          />
          {COLUMNS.map((col, ci) => (
            <Reveal
              as="li"
              key={col.title}
              delay={ci * 90}
              className="relative flex gap-3 sm:gap-4"
            >
              <span className="relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#ffad5c]/60 bg-[#1b1714] font-mono text-[10px] font-bold text-[#ffad5c] sm:h-7 sm:w-7">
                {ci + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffad5c]">
                  {col.title.replace(/^\d · /, "")}
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {col.items.map((item) => {
                    const Icon = item.icon;
                    const tier = (
                      { Rules: "rules", "Local brain": "local", "Cloud brain": "cloud" } as Record<
                        string,
                        Tier
                      >
                    )[item.name];
                    return (
                      <div
                        key={item.name}
                        className="rounded-xl border px-3 py-2.5"
                        style={{
                          borderColor: tier ? `${TIERS[tier].tone}55` : "rgba(255,255,255,0.1)",
                          background: tier ? `${TIERS[tier].tone}10` : "rgba(255,255,255,0.03)",
                        }}
                      >
                        <p className="flex items-center gap-2 text-[13px] font-semibold">
                          <Icon
                            className="h-3.5 w-3.5 shrink-0"
                            style={{ color: tier ? TIERS[tier].tone : "#ffad5c" }}
                          />
                          {item.name}
                        </p>
                        <p className="mt-1 text-[11.5px] leading-snug text-[#f6efe8]/60">
                          {item.detail}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {(Object.keys(TIERS) as Tier[]).map((tier, i) => (
          <Reveal key={tier} delay={i * 80}>
            <div className="hog-card h-full p-4">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: TIERS[tier].tone }} />
                {i + 1}. {TIERS[tier].name}
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {TIERS[tier].engine}
              </p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                {TIERS[tier].when}
              </p>
              <p className="mt-3 font-mono text-[11px] font-bold text-foreground">
                {TIERS[tier].speed}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
        Each tier handles what it can and hands off the rest. The local model's prompt is generated
        from the same skill list the cloud brain uses, so the two never disagree about what she can
        do. It is tested against an evaluation set worded differently from the prompt's own
        examples, so it can't pass by memorising them.
      </p>
    </div>
  );
}

/* ==========================================================================
 * The assistant, in detail
 * ======================================================================== */

const SKILLS: { group: string; items: string[] }[] = [
  {
    group: "Desktop",
    items: [
      "open / close apps",
      "volume",
      "brightness",
      "Wi-Fi",
      "Bluetooth",
      "lock",
      "screenshot",
      "keep awake",
      "open folders",
      "search files",
    ],
  },
  {
    group: "Music & web",
    items: [
      "play a song",
      "play an artist",
      "playlists",
      "pause / next",
      "now playing",
      "YouTube",
      "Google",
      "weather",
      "Discord channels",
    ],
  },
  {
    group: "Developer",
    items: [
      "open a project",
      "dev servers",
      "test / build / lint",
      "last log",
      "git status",
      "stand-up summary",
      "commit messages",
      "PRs",
      "CI status",
      "Vercel deploys",
      "GitHub streak",
    ],
  },
  {
    group: "Productivity",
    items: [
      "reminders that survive reboots",
      "focus + Do Not Disturb",
      "to-dos",
      "screen time",
      "battery",
      "system load",
      "clipboard: explain / review / translate",
    ],
  },
  {
    group: "Companion",
    items: [
      "jokes",
      "fun facts",
      "greetings",
      "birthday reminders",
      "“how did it go?” follow-ups",
      "break nudges",
      "late-night check-ins",
    ],
  },
];

const SPEC: { icon: typeof Mic; title: string; rows: [string, string][] }[] = [
  {
    icon: AudioLines,
    title: "Voice",
    rows: [
      ["Wake word", "Vosk with a restricted grammar: “hey minutes”, “hey minute”, “miss minutes”"],
      ["Speech end", "Silero VAD; recording starts at the wake word's acoustic end"],
      ["Speech to text", "faster-whisper (small, CUDA), loaded on demand"],
      ["Voice", "Kokoro-82M: Heart, Nova, Bella, Emma… and blends of them"],
      ["Interruptions", "talk over her and she stops (barge-in)"],
    ],
  },
  {
    icon: Brain,
    title: "Brains",
    rows: [
      ["Rules", "about 700 lines of ordered regex, speech clean-up, “and then” planning"],
      ["Local", "Qwen3-1.7B on Ollama, JSON schema, GPU memory guard"],
      ["Cloud", "Gemini through a warm Antigravity session, web snippets when needed"],
      ["Modes", "Auto · Local only (no cloud at all) · Cloud"],
      ["Deep", "“think harder about …” switches to the stronger model"],
    ],
  },
  {
    icon: HeartHandshake,
    title: "Memory & care",
    rows: [
      ["Remembers", "people, birthdays, plans, likes, habits (local JSON)"],
      ["Follows up", "how the interview went, birthdays, a check-in after a rough day"],
      ["Nudges", "a break after ~90 min of non-stop work; once a night after 1 AM"],
      ["Respects", "mute, focus sessions and quiet hours"],
    ],
  },
  {
    icon: ShieldCheck,
    title: "Safety",
    rows: [
      ["Shell", "proposed commands are shown and need a clear yes; “okay, don't” is a no"],
      ["Cancel", "every turn has its own token; late cloud replies can't act"],
      ["Local only", "blocks every cloud path, including clipboard AI and commit messages"],
      ["Honesty", "if the budget runs out she says so out loud, never hangs"],
    ],
  },
  {
    icon: Terminal,
    title: "Runs as",
    rows: [
      ["Service", "systemd user unit, restarts on failure, survives sleep"],
      ["APIs", "D-Bus org.minutes.Assistant · WebSocket on 127.0.0.1"],
      ["Surfaces", "Plasma widget · Meta+M floating overlay · CLI"],
      ["Resources", "speech models in a child process that unloads when idle"],
    ],
  },
];

const NUMBERS: [string, string][] = [
  ["281", "passing tests"],
  ["~50", "skills"],
  ["8", "moods"],
  ["3", "brains"],
  ["0.01 s", "rule answers"],
  ["≈ 4 s", "warm cloud answers"],
];

export function AssistantDetails() {
  return (
    <div>
      <dl className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {NUMBERS.map(([value, label], i) => (
          <Reveal key={label} delay={i * 50}>
            <div className="hog-card h-full p-3 text-center">
              <dt className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {value}
              </dt>
              <dd className="mt-1 font-mono text-[9.5px] uppercase tracking-widest text-muted-foreground">
                {label}
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {SPEC.map((card, i) => {
          const Icon = card.icon;
          return (
            <Reveal
              key={card.title}
              delay={i * 60}
              className={i === SPEC.length - 1 ? "md:col-span-2" : ""}
            >
              <div className="hog-card h-full overflow-hidden">
                <p className="flex items-center gap-2 border-b-2 border-border bg-secondary px-4 py-2.5 text-[14px] font-semibold text-foreground">
                  <Icon className="h-4 w-4 text-hog-red" />
                  {card.title}
                </p>
                <dl className="divide-y divide-border/15">
                  {card.rows.map(([k, v]) => (
                    <div key={k} className="flex gap-3 px-4 py-2.5">
                      <dt className="w-24 shrink-0 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {k}
                      </dt>
                      <dd className="min-w-0 flex-1 text-[13.5px] leading-snug text-foreground">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          );
        })}
      </div>

      <div className="hog-card mt-6 p-4 sm:p-5">
        <p className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-hog-red" /> Everything she can do
        </p>
        <div className="mt-4 space-y-4">
          {SKILLS.map((group) => (
            <div key={group.group}>
              <p className="micro text-muted-foreground">{group.group}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded border border-border/25 bg-secondary px-2 py-0.5 font-mono text-[11.5px] text-foreground/85"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="hog-card p-4">
          <p className="micro text-hog-green">Stays on the computer</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            The microphone, wake word, transcription and voice. Rule answers and the local brain.
            Memory, reminders, history and logs are files in the home folder.
          </p>
        </div>
        <div className="hog-card p-4">
          <p className="micro text-hog-red">Leaves only when needed</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            Cloud answers send the question with relevant memory and recent context. Clipboard AI
            and commit messages send what you asked about. Local-only mode turns all of it off.
          </p>
        </div>
      </div>
    </div>
  );
}
