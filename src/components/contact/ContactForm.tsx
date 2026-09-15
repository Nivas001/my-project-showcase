import { useMemo, useState } from "react";
import { Copy, Check, Mail, Send } from "lucide-react";
import { site } from "@/lib/site";
import { HandNote, HardButton, Marked } from "@/components/kit";

/* ==========================================================================
 * THE COMPOSER
 *
 * There is no mail server behind this site, so the form does not pretend to
 * have one. It composes a real message and hands it to the visitor's own mail
 * client through a mailto: link — which means it actually works, from any
 * device, with no backend, and the visitor keeps a copy in their sent folder.
 *
 * The button says exactly that, because a form that silently does nothing is
 * worse than no form at all.
 * ======================================================================== */

const TOPICS = [
  { id: "role", label: "A full-time role", accent: "hog-red" },
  { id: "contract", label: "Contract work", accent: "hog-blue" },
  { id: "product", label: "Building a product", accent: "hog-yellow" },
  { id: "research", label: "NLP / research", accent: "hog-purple" },
  { id: "other", label: "Something else", accent: "hog-green" },
] as const;

export function ContactForm() {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [topic, setTopic] = useState<string>(TOPICS[0].id);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const chosen = TOPICS.find((item) => item.id === topic) ?? TOPICS[0];

  const mailto = useMemo(() => {
    const subject = `${chosen.label}${name ? ` — from ${name}` : ""}`;
    const body = [message.trim(), "", "—", name ? `${name}` : "", from ? `${from}` : ""]
      .filter((line, i, all) => line !== "" || (i > 0 && all[i - 1] !== ""))
      .join("\n");
    return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [chosen.label, name, from, message]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Clipboard blocked (insecure context or denied permission) — the
         address is on screen and selectable, so there is nothing to recover. */
    }
  };

  const field =
    "w-full rounded-md border-2 border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/70 focus:hard-shadow";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        window.location.href = mailto;
      }}
      className="hog-card relative overflow-hidden p-6 sm:p-8"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1.5 transition-colors duration-300"
        style={{ background: `var(--${chosen.accent})` }}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="display-sm text-foreground">
            Tell me what you{" "}
            <Marked kind="underline" tone="hog-red" delay={300}>
              need
            </Marked>
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            This opens your own email app with the message written out — nothing is sent from this
            page, and nothing is stored here.
          </p>
        </div>
        <HandNote tone="hog-yellow" rotate={-5} size="sm" className="hidden sm:inline-flex">
          no forms disappearing into a void
        </HandNote>
      </div>

      {/* Topic */}
      <fieldset className="mt-7">
        <legend className="micro text-muted-foreground">What is it about?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((item) => {
            const on = item.id === topic;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => setTopic(item.id)}
                className={`hog-press rounded-full border-2 border-border px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  on
                    ? "text-white hard-shadow"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
                style={
                  on ? { background: `var(--${item.accent})`, color: "oklch(0.99 0 0)" } : undefined
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="micro text-muted-foreground">Your name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Who is this?"
            autoComplete="name"
            className={`mt-2 ${field}`}
          />
        </label>
        <label className="block">
          <span className="micro text-muted-foreground">Your email</span>
          <input
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            placeholder="so I can reply"
            type="email"
            autoComplete="email"
            className={`mt-2 ${field}`}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="micro text-muted-foreground">The message</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          placeholder="What are you building, and where do you need a hand?"
          className={`mt-2 resize-y ${field}`}
        />
      </label>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <HardButton type="submit" variant="primary" size="lg">
          <Send className="h-4 w-4" />
          Open in my email app
        </HardButton>
        <HardButton type="button" variant="secondary" size="lg" onClick={copyEmail}>
          {copied ? <Check className="h-4 w-4 text-hog-green" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy address"}
        </HardButton>
        <span className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          {site.email}
        </span>
      </div>
    </form>
  );
}
