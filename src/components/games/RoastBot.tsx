import { useEffect, useRef, useState } from "react";
import { Bot, Send, Loader2, Zap } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const OPENERS = [
  "oh look, a challenger. i'm GLITCH-9000 and i've already read your scores. tragic. ask me anything, i'll be honest. brutally. 🤖",
  "welcome to my arcade. i live here. you visit here. that's the difference between us. what do you want? 💀",
  "beep boop. detected: mediocre reflexes. want to argue about it? go ahead, type something.",
];

const QUICK = [
  "am I good at this game?",
  "roast my reaction time",
  "why do I keep losing?",
  "who is Srinivas?",
];

const THINKING = [
  "calculating how bad you are...",
  "loading insults...",
  "consulting the skill-issue database...",
  "buffering (like your reflexes)...",
];

export function RoastBot({ context }: { context?: string | undefined }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thinking, setThinking] = useState(THINKING[0]!);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: "assistant", content: OPENERS[Math.floor(Math.random() * OPENERS.length)]! }]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const send = async (text: string) => {
    const trimmed = text.trim().slice(0, 500);
    if (!trimmed || streaming) return;
    setError(null);
    setInput("");
    setThinking(THINKING[Math.floor(Math.random() * THINKING.length)]!);
    const withUser: Msg[] = [...messages, { role: "user", content: trimmed }];
    const payload = context
      ? [...withUser.slice(0, -1), { role: "user" as const, content: `[${context}]\n${trimmed}` }]
      : withUser;
    setMessages(withUser);
    setStreaming(true);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      if (!res.ok || !res.body) {
        throw new Error(
          res.status === 429
            ? "too many roasts. even I need a break. try again in a minute."
            : res.status === 402
              ? "my roast budget ran out. embarrassing. for me."
              : "my circuits glitched. lucky you.",
        );
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
      if (!acc.trim()) {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: "...I'm speechless. That's how bad it was. 💀" };
          return copy;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "something broke.");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-border bg-surface-raised px-4 py-3">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-accent/40 bg-accent/10">
          <Bot className="h-5 w-5 text-accent" />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-ping rounded-full bg-game-go" />
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-game-go" />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold tracking-tight">GLITCH-9000</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            certified hater · online · judging you
          </p>
        </div>
        <Zap className="ml-auto h-4 w-4 shrink-0 text-game-warn" />
      </div>

      {/* transcript */}
      <div ref={scrollRef} className="max-h-80 space-y-4 overflow-y-auto px-4 py-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-md rounded-br-none bg-primary px-3.5 py-2 text-primary-foreground"
                  : "font-mono text-[13px] text-foreground"
              }`}
            >
              {m.role === "assistant" && <span className="mr-1.5 text-accent">glitch&gt;</span>}
              {m.content}
              {m.role === "assistant" && streaming && i === messages.length - 1 && (
                <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-accent" />
              )}
            </div>
          </div>
        ))}

        {streaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /> {thinking}
          </div>
        )}

        {error && <p className="font-mono text-xs text-destructive">{error}</p>}
      </div>

      {/* quick prompts */}
      <div className="flex flex-wrap gap-2 border-t border-border px-4 pt-3">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            disabled={streaming}
            onClick={() => send(q)}
            className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex items-center gap-2 px-4 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          disabled={streaming}
          placeholder="say something you'll regret..."
          className="flex-1 rounded-sm border border-border bg-background px-3 py-2.5 font-mono text-xs outline-none transition-colors focus:border-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          aria-label="Send message"
        >
          {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
