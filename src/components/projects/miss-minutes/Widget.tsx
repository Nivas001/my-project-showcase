import { forwardRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Ear, Mic, SlidersHorizontal, Square, Volume2 } from "lucide-react";
import { Character, type CharacterHandle, type Mood } from "./Character";
import { BUBBLE_LABEL, STATUS } from "./data";
import { cn } from "@/lib/utils";
import { MM } from "./theme";

/**
 * Her desktop widget, rebuilt for the web: the charcoal card with the warm
 * border, the status line, the speech card and the control row from
 * qml/CompanionView.qml. The palette is hers, not the site's, on purpose.
 */

export const Widget = forwardRef<
  CharacterHandle,
  {
    mood: Mood;
    bubble?: string | null;
    /** Override the bubble's small label. */
    label?: string | undefined;
    mode?: string;
    /** Rendered under the bubble text (confirm buttons, a command, a mic meter). */
    extra?: ReactNode;
    onTalk?: (() => void) | undefined;
    talkDisabled?: boolean | undefined;
    onCharacterPress?: (() => void) | undefined;
    animate?: boolean;
    className?: string;
  }
>(function Widget(
  {
    mood,
    bubble,
    label,
    mode = "Auto",
    extra,
    onTalk,
    talkDisabled,
    onCharacterPress,
    animate = true,
    className,
  },
  ref,
) {
  const busy = mood !== "idle" && mood !== "sleeping";
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[28px] border p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]",
        className,
      )}
      style={{ background: MM.card, borderColor: MM.border, color: MM.text }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[19px] font-semibold leading-none tracking-tight">Miss Minutes</p>
          <p
            className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: MM.muted }}
          >
            Your desktop companion
          </p>
        </div>
        <span
          className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
          style={{
            borderColor: "rgba(255,173,92,0.45)",
            color: MM.amber,
            background: "rgba(255,173,92,0.08)",
          }}
        >
          {mode}
        </span>
      </div>

      <p className="mt-3 flex items-center gap-2 text-[12px] font-medium" aria-live="polite">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: mood === "confirm" ? MM.amber : mood === "sad" ? "#ff6b5b" : "#7fd1a8",
          }}
        />
        {STATUS[mood]}
      </p>

      {/* speech card */}
      <div className="relative mt-3 min-h-[5.5rem]">
        <AnimatePresence mode="wait">
          {bubble !== null && bubble !== undefined ? (
            <motion.div
              key={label ?? BUBBLE_LABEL[mood] ?? "say"}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="relative rounded-2xl border px-4 py-3"
              style={{ background: MM.bubble, borderColor: "rgba(255,255,255,0.12)" }}
            >
              <p
                className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em]"
                style={{ color: MM.amber }}
              >
                <span className="h-1 w-1 rounded-full" style={{ background: MM.amber }} />
                {label ?? BUBBLE_LABEL[mood] ?? "Miss Minutes"}
              </p>
              {mood === "thinking" && !bubble ? (
                <p className="mt-2 flex gap-1.5" aria-label="Thinking">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: MM.amber }}
                      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </p>
              ) : (
                <p className="mt-1.5 text-[14px] font-semibold leading-snug">{bubble}</p>
              )}
              {extra}
              <span
                aria-hidden
                className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r"
                style={{ background: "#2a2320", borderColor: "rgba(255,255,255,0.12)" }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="relative mx-auto -mt-1 w-full max-w-[15rem]">
        <Character
          handle={ref}
          mood={mood}
          onPress={onCharacterPress}
          animate={animate}
          className="h-auto w-full"
        />
      </div>

      <p className="mt-1 text-center text-[11px]" style={{ color: MM.muted }}>
        Say “Hey Minutes” · Meta + M
      </p>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onTalk}
          disabled={talkDisabled}
          className="grid h-11 flex-1 place-items-center rounded-2xl text-[#2b1a0c] transition-transform active:scale-95 disabled:opacity-60"
          style={{ background: MM.amber }}
          aria-label={busy ? "Stop" : "Talk to Miss Minutes"}
        >
          {busy ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        {[Volume2, Ear, SlidersHorizontal].map((Icon, i) => (
          <span
            key={i}
            aria-hidden
            className="grid h-11 w-11 place-items-center rounded-2xl border"
            style={{
              borderColor: i === 1 ? "rgba(255,173,92,0.5)" : "rgba(255,255,255,0.1)",
              background: i === 1 ? "rgba(255,173,92,0.12)" : "rgba(255,255,255,0.04)",
              color: i === 1 ? MM.amber : MM.text,
            }}
          >
            <Icon className="h-4 w-4" />
          </span>
        ))}
      </div>
    </div>
  );
});
