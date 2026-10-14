import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, CornerDownLeft, RotateCcw } from "lucide-react";
import type { CharacterHandle, Mood } from "./Character";
import { QUIPS, routeTyped, TIERS, TURNS, type Tier, type Turn } from "./data";
import { Widget } from "./Widget";
import { MM } from "./theme";
import { cn } from "@/lib/utils";

/**
 * “Talk to her”: pick (or type) a request and watch it take the same path it
 * takes on the desktop — wake word, transcription, one of three brains, the
 * skill call, the spoken reply — while the character acts it out.
 *
 * Nothing here calls a model. Each turn is scripted from the assistant's real
 * routes and skills, and typed requests go through a deliberately tiny router
 * that says so when a real one would need the cloud.
 */

type Stage = "idle" | "wake" | "heard" | "route" | "act" | "reply" | "confirm" | "done";
const ORDER: Stage[] = ["wake", "heard", "route", "act", "reply"];

const STEPS: { stage: Stage; title: string; engine: string }[] = [
  { stage: "wake", title: "Wake word", engine: "Vosk · tiny grammar, always listening" },
  { stage: "heard", title: "Transcribed", engine: "Silero VAD → faster-whisper on CUDA" },
  { stage: "route", title: "Routed", engine: "rules → local brain → cloud brain" },
  { stage: "act", title: "Did it", engine: "Python skills · KDE · D-Bus · Spotify" },
  { stage: "reply", title: "Answered", engine: "Kokoro neural voice + WebSocket → QML" },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function MissMinutesDemo() {
  const reduced = useReducedMotion();
  const character = useRef<CharacterHandle>(null);
  const run = useRef(0);
  const [mood, setMood] = useState<Mood>("idle");
  const [bubble, setBubble] = useState<string | null>("Pick something to ask me, sugar.");
  const [label, setLabel] = useState<string | undefined>(undefined);
  const [stage, setStage] = useState<Stage>("idle");
  const [turn, setTurn] = useState<Turn | null>(null);
  const [heard, setHeard] = useState("");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmFor, setConfirmFor] = useState<Turn | null>(null);

  // Stop any in-flight turn on unmount.
  useEffect(() => () => void (run.current += 1), []);

  const speak = useCallback(
    async (text: string, id: number, as: Mood = "speaking") => {
      setLabel(undefined);
      setMood(as);
      // Type the reply out at roughly speaking pace.
      const step = reduced ? text.length : 2;
      for (let i = step; i <= text.length + step - 1; i += step) {
        if (run.current !== id) return;
        setBubble(text.slice(0, i));
        await wait(reduced ? 0 : 22);
      }
      setBubble(text);
      await wait(Math.min(2600, 600 + text.length * 22));
    },
    [reduced],
  );

  const play = useCallback(
    async (next: Turn) => {
      const id = ++run.current;
      const alive = () => run.current === id;
      setBusy(true);
      setConfirmFor(null);
      setTurn(next);
      setHeard("");

      // 1. wake + listen (the ticks become a mic meter)
      setStage("wake");
      setMood("listening");
      setLabel(undefined);
      setBubble("I'm listening…");
      await wait(reduced ? 150 : 650);
      if (!alive()) return;

      // 2. transcript appears word by word
      setStage("heard");
      const words = next.heard.split(" ");
      for (let i = 1; i <= words.length; i++) {
        if (!alive()) return;
        const so_far = words.slice(0, i).join(" ");
        setHeard(so_far);
        setBubble(`“${so_far}”`);
        await wait(reduced ? 0 : 110);
      }
      await wait(reduced ? 100 : 350);
      if (!alive()) return;

      // 3. route: thinking time scales with the tier
      setStage("route");
      setMood("thinking");
      setBubble("");
      await wait(reduced ? 150 : next.tier === "rules" ? 350 : next.tier === "local" ? 900 : 1900);
      if (!alive()) return;

      // Shell commands stop here and ask.
      if (next.confirm) {
        setStage("confirm");
        setMood("confirm");
        setLabel("Your call");
        setBubble("Run this command?");
        setConfirmFor(next);
        setBusy(false);
        return;
      }

      // 4. act
      if (next.actions?.length) {
        setStage("act");
        setMood(next.doing ?? "acting");
        setLabel(undefined);
        setBubble("On it!");
        character.current?.hop();
        await wait(reduced ? 200 : 1100);
        if (!alive()) return;
      }

      // 5. reply
      setStage("reply");
      await speak(typeof next.reply === "function" ? next.reply() : next.reply, id);
      if (!alive()) return;
      setStage("done");
      setMood("idle");
      setBusy(false);
    },
    [reduced, speak],
  );

  const answer = useCallback(
    async (yes: boolean) => {
      const id = ++run.current;
      setConfirmFor(null);
      setBusy(true);
      if (yes) {
        // The demo never runs anything; she owns up to that.
        setStage("act");
        setMood("acting");
        setBubble("Okay!");
        character.current?.hop();
        await wait(reduced ? 150 : 900);
        if (run.current !== id) return;
        setStage("reply");
        await speak(
          "Just pretendin' here, sugar. Nothing was deleted. On the desktop, that command would run only now.",
          id,
        );
      } else {
        setStage("reply");
        await speak("Okay, I won't touch it. Negative or unsure answers always win.", id, "sad");
      }
      if (run.current !== id) return;
      setStage("done");
      setMood("idle");
      setBusy(false);
    },
    [reduced, speak],
  );

  const reset = () => {
    run.current += 1;
    setBusy(false);
    setConfirmFor(null);
    setTurn(null);
    setStage("idle");
    setHeard("");
    setLabel(undefined);
    setMood("idle");
    setBubble("Pick something to ask me, sugar.");
  };

  const poke = () => {
    if (busy) return;
    setMood("speaking");
    setLabel(undefined);
    setBubble(QUIPS[Math.floor(Math.random() * QUIPS.length)]!);
    const id = ++run.current;
    setTimeout(() => run.current === id && setMood("idle"), 1800);
  };

  const reached = (s: Stage) => {
    if (stage === "idle") return false;
    if (stage === "done") return turn?.actions?.length ? true : s !== "act";
    if (stage === "confirm") return s === "wake" || s === "heard" || s === "route";
    const at = ORDER.indexOf(stage);
    if (s === "act" && !turn?.actions?.length && at > ORDER.indexOf("act")) return false;
    return ORDER.indexOf(s) <= at;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:items-start">
      {/* the widget */}
      <div className="mx-auto w-full max-w-[19rem] lg:sticky lg:top-24">
        <Widget
          ref={character}
          mood={mood}
          bubble={bubble}
          label={label}
          animate={!reduced}
          onCharacterPress={poke}
          onTalk={() => (busy ? reset() : play(TURNS[Math.floor(Math.random() * TURNS.length)]!))}
          extra={
            confirmFor ? (
              <div className="mt-3">
                <code
                  className="block rounded-lg px-2.5 py-2 font-mono text-[11px]"
                  style={{ background: "rgba(0,0,0,0.35)", color: "#ffd9b0" }}
                >
                  {confirmFor.confirm}
                </code>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => answer(false)}
                    className="h-9 rounded-xl border text-[13px] font-semibold"
                    style={{ borderColor: "rgba(255,255,255,0.18)", color: MM.text }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => answer(true)}
                    className="h-9 rounded-xl text-[13px] font-semibold text-[#2b1a0c]"
                    style={{ background: MM.amber }}
                  >
                    Yes, run it
                  </button>
                </div>
              </div>
            ) : mood === "listening" ? (
              <div className="mt-2 flex h-5 items-end gap-[3px]" aria-hidden>
                {Array.from({ length: 9 }, (_, i) => (
                  <motion.span
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{ background: MM.amber }}
                    animate={{ height: [4, 8 + ((i * 7) % 12), 5, 14 - ((i * 5) % 9), 4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.06 }}
                  />
                ))}
              </div>
            ) : null
          }
        />
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Tap her · she has opinions
        </p>
      </div>

      {/* requests + trace */}
      <div className="min-w-0">
        <p className="micro text-muted-foreground">Ask her something</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TURNS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => play(t)}
              className={cn(
                "rounded-full border-2 px-3.5 py-1.5 text-[13px] font-medium transition-all",
                turn?.id === t.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-foreground",
              )}
            >
              {t.heard}
            </button>
          ))}
        </div>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!typed.trim()) return;
            play(routeTyped(typed));
            setTyped("");
          }}
        >
          <label className="sr-only" htmlFor="mm-typed">
            Type a request
          </label>
          <input
            id="mm-typed"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            maxLength={120}
            placeholder="…or type your own: “play something chill”, “tell me a joke”"
            className="h-10 min-w-0 flex-1 rounded-xl border-2 border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
          <button
            type="submit"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-foreground bg-foreground text-background"
            aria-label="Ask"
          >
            <CornerDownLeft className="h-4 w-4" />
          </button>
        </form>

        {/* the trace */}
        <div className="hog-card mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-border bg-secondary px-4 py-2.5">
            <p className="micro text-muted-foreground">What happens on the desktop</p>
            {stage !== "idle" ? (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            ) : null}
          </div>

          <ol className="divide-y-2 divide-border/15">
            {STEPS.map((step, i) => {
              const on = reached(step.stage);
              const current =
                stage === step.stage || (stage === "confirm" && step.stage === "route");
              return (
                <li key={step.stage} className="relative flex gap-3 px-4 py-3">
                  <span
                    className={cn(
                      "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 font-mono text-[10px] font-bold transition-colors duration-300",
                      on
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {on && !current ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-2 text-[14px] font-semibold text-foreground">
                      {step.title}
                      <span className="font-mono text-[10px] font-normal text-muted-foreground">
                        {step.engine}
                      </span>
                    </p>
                    <AnimatePresence initial={false}>
                      {on && turn ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <StepDetail
                            step={step.stage}
                            turn={turn}
                            heard={heard}
                            pending={stage === "confirm"}
                          />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                  {current && stage !== "done" ? (
                    <span className="absolute inset-y-0 left-0 w-[3px] bg-hog-red" aria-hidden />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>

        {turn ? (
          <p className="mt-4 flex gap-2 text-[14px] leading-relaxed text-muted-foreground">
            <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-hog-red" />
            {turn.why}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StepDetail({
  step,
  turn,
  heard,
  pending,
}: {
  step: Stage;
  turn: Turn;
  heard: string;
  pending: boolean;
}) {
  if (step === "wake")
    return (
      <p className="mt-1 font-mono text-[12px] text-muted-foreground">
        “Hey Minutes” → recording starts at the end of the word
      </p>
    );
  if (step === "heard") return <p className="mt-1 text-[14px] text-foreground">“{heard}”</p>;
  if (step === "route")
    return (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(Object.keys(TIERS) as Tier[]).map((tier) => {
          const chosen = tier === turn.tier;
          return (
            <span
              key={tier}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] transition-all",
                chosen
                  ? "border-foreground font-bold text-foreground"
                  : "border-border/40 text-muted-foreground/60 line-through decoration-1",
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: chosen ? TIERS[tier].tone : "currentColor" }}
              />
              {TIERS[tier].name}
              {chosen ? (
                <span className="font-normal text-muted-foreground">· {TIERS[tier].speed}</span>
              ) : null}
            </span>
          );
        })}
        {pending ? (
          <span className="w-full pt-1 font-mono text-[11px] text-hog-red">
            proposed shell command · waiting for your approval
          </span>
        ) : null}
      </div>
    );
  if (step === "act")
    return (
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {(turn.actions ?? [turn.confirm ? `bash: ${turn.confirm}` : ""])
          .filter(Boolean)
          .map((a) => (
            <code
              key={a}
              className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[12px] text-foreground"
            >
              {a}
            </code>
          ))}
      </div>
    );
  return (
    <p className="mt-1 text-[13px] text-muted-foreground">
      Spoken aloud while the widget shows the text.
    </p>
  );
}
