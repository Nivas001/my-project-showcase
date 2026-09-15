import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Clock,
  Download,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
  Terminal as TerminalIcon,
} from "lucide-react";
import { site } from "@/lib/site";
import {
  CheckMark,
  HandNote,
  HardLink,
  Highlight,
  LocalClock,
  Marked,
  ScribbleArrow,
  SectionLabel,
  SplitLines,
  Squiggle,
  StarMark,
  StatusDot,
  Sticker,
  TiltCard,
} from "@/components/kit";
import { accentSurface } from "@/lib/accents";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactHero } from "@/components/contact/ContactHero";

const TITLE = "Contact — Srinivas M";
const DESCRIPTION =
  "Get in touch with Srinivas M about full-stack, Python or Flutter work. Email, phone, GitHub and LinkedIn — plus a console that talks back.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: ContactPage,
});

/* ==========================================================================
 * Channels
 * ======================================================================== */

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: site.email,
    note: "Fastest route. Usually same-day.",
    href: `mailto:${site.email}`,
    accent: "hog-red",
  },
  {
    icon: Phone,
    label: "Phone",
    value: site.phone,
    note: "Call or WhatsApp, IST hours.",
    href: `tel:${site.phone}`,
    accent: "hog-blue",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "github.com/Nivas001",
    note: "Source for most of the work.",
    href: site.github,
    accent: "hog-yellow",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "srinivas-m",
    note: "For the formal version.",
    href: site.linkedin,
    accent: "hog-green",
  },
] as const;

/* ==========================================================================
 * Console — an easter egg for anyone who reads to the bottom of the page.
 * ======================================================================== */

type LogLine = {
  text: string;
  type: "system" | "output" | "success" | "error" | "exec" | "bold";
};

const BOOT_LOG: LogLine[] = [
  { text: "srinivas-m.node — secure channel", type: "bold" },
  { text: "Initialising connection log…", type: "system" },
  { text: "Handshake: OK (256-bit AES)", type: "success" },
  { text: "Ready for instructions.", type: "system" },
  { text: "Type /help for supported commands, or click a card above.", type: "output" },
];

const CONNECT_SCRIPTS: Record<string, { cmd: string; steps: string[] }> = {
  email: {
    cmd: "connect --channel=email",
    steps: [
      "Connecting to SMTP relay…",
      `Resolved endpoint: mailto:${site.email}`,
      "Port 465: secure",
      "Done — click the Email card to draft a message.",
    ],
  },
  phone: {
    cmd: "connect --channel=phone",
    steps: [
      "Handshaking with the Puducherry gateway…",
      `Resolving node: ${site.phone}`,
      "Call routing: active",
      "Done — click the Phone card to dial.",
    ],
  },
  github: {
    cmd: "connect --channel=github",
    steps: [
      "Pinging github.com/Nivas001…",
      "200 OK (28ms)",
      "Repos: Bakesite, Seals, Tamil_text_Summary, …",
      "Done — click the GitHub card to browse.",
    ],
  },
  linkedin: {
    cmd: "connect --channel=linkedin",
    steps: [
      "Querying profile endpoints…",
      "Matched: srinivas-m-734631259",
      "Status: open to roles (full-stack, Python, Flutter)",
      "Done — click the LinkedIn card to connect.",
    ],
  },
};

const LOG_TONE: Record<LogLine["type"], string> = {
  system: "text-muted-foreground",
  output: "text-muted-foreground",
  success: "text-hog-green",
  error: "text-hog-red",
  exec: "text-foreground font-semibold",
  bold: "mb-1 block border-b border-border/40 pb-1 font-semibold text-foreground",
};

function Console({
  triggerRef,
}: {
  triggerRef: React.MutableRefObject<((channel: string) => void) | null>;
}) {
  const [logs, setLogs] = useState<LogLine[]>(BOOT_LOG);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  // Every timer started here, so none of them fire into an unmounted component.
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const ids = timers.current;
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, []);

  const after = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  // Keep the newest line in view without dragging the whole page with it.
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const scroller = el.parentElement;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [logs]);

  useEffect(() => {
    triggerRef.current = (channel: string) => {
      const script = CONNECT_SCRIPTS[channel.toLowerCase()];
      if (!script) return;
      setLogs((prev) => [...prev, { text: `> ${script.cmd}`, type: "exec" }]);
      script.steps.forEach((step, i) => {
        after((i + 1) * 320, () =>
          setLogs((prev) => [
            ...prev,
            { text: step, type: i === script.steps.length - 1 ? "success" : "output" },
          ]),
        );
      });
    };
    return () => {
      triggerRef.current = null;
    };
  }, [triggerRef]);

  const run = (event: React.FormEvent) => {
    event.preventDefault();
    const command = input.trim();
    if (!command) return;

    setLogs((prev) => [...prev, { text: `> ${command}`, type: "exec" }]);
    setInput("");

    const parts = command.split(" ");
    const verb = parts[0]!.toLowerCase().replace(/^\//, "");
    const rest = parts.slice(1);

    after(140, () => {
      switch (verb) {
        case "help":
          setLogs((prev) => [
            ...prev,
            { text: "Available commands", type: "bold" },
            { text: "/ping [email|phone|github|linkedin]   test a channel", type: "output" },
            { text: "/msg  [text]                          queue a message", type: "output" },
            { text: "/whoami                               print the specs", type: "output" },
            { text: "/hire                                 the short pitch", type: "output" },
            { text: "/clear                                flush the log", type: "output" },
          ]);
          break;

        case "clear":
          setLogs([]);
          break;

        case "whoami":
        case "sysinfo":
          setLogs((prev) => [
            ...prev,
            { text: "Specs", type: "bold" },
            { text: "Name        Srinivas M", type: "output" },
            { text: "Role        Full-stack engineer", type: "output" },
            { text: "Education   MCA, Pondicherry University — 8.79/10", type: "output" },
            { text: "Core        TypeScript · React · Python · Flutter", type: "output" },
            { text: "Shipped     3 products in production", type: "output" },
            { text: "Status      Available for work", type: "success" },
          ]);
          break;

        case "hire":
          setLogs((prev) => [
            ...prev,
            { text: "I build whole products, not slices of them.", type: "output" },
            { text: "Three are live right now, all shipped solo.", type: "output" },
            { text: `Email ${site.email} and I'll reply within a day.`, type: "success" },
          ]);
          break;

        case "ping": {
          const target = rest[0]?.toLowerCase();
          if (!target || !CONNECT_SCRIPTS[target]) {
            setLogs((prev) => [
              ...prev,
              {
                text: "Usage: /ping [email|phone|github|linkedin]",
                type: "error",
              },
            ]);
            break;
          }
          setLogs((prev) => [...prev, { text: `Pinging ${target}…`, type: "system" }]);
          for (let seq = 0; seq < 3; seq += 1) {
            after((seq + 1) * 280, () =>
              setLogs((prev) => [
                ...prev,
                {
                  text: `64 bytes from ${target}: icmp_seq=${seq} ttl=56 time=${
                    Math.floor(Math.random() * 25) + 12
                  }ms`,
                  type: "output",
                },
              ]),
            );
          }
          after(4 * 280, () =>
            setLogs((prev) => [
              ...prev,
              { text: "3 transmitted, 3 received, 0% loss", type: "success" },
            ]),
          );
          break;
        }

        case "msg": {
          const body = rest.join(" ");
          if (!body) {
            setLogs((prev) => [...prev, { text: "Usage: /msg [your message]", type: "error" }]);
            break;
          }
          setLogs((prev) => [...prev, { text: "Composing envelope…", type: "system" }]);
          after(380, () =>
            setLogs((prev) => [...prev, { text: "Encrypting payload…", type: "system" }]),
          );
          after(760, () =>
            setLogs((prev) => [...prev, { text: "Queued for transmission.", type: "system" }]),
          );
          after(1200, () =>
            setLogs((prev) => [
              ...prev,
              { text: "Queued locally — which is to say, nowhere.", type: "success" },
              {
                text: `This console is a toy. Send it to ${site.email} and it'll actually arrive.`,
                type: "output",
              },
            ]),
          );
          break;
        }

        default:
          setLogs((prev) => [
            ...prev,
            { text: `Unknown command: ${verb}. Type /help.`, type: "error" },
          ]);
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-black/50">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-hog-red" />
          <span className="h-2.5 w-2.5 rounded-full bg-hog-yellow" />
          <span className="h-2.5 w-2.5 rounded-full bg-hog-green" />
          <span className="ml-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            srinivas@node:~
          </span>
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <StatusDot />
          Online
        </span>
      </div>

      <div className="h-64 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
        {logs.map((log, i) => (
          <div key={i} className={LOG_TONE[log.type]}>
            {log.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={run}
        className="flex items-center border-t border-border p-2 font-mono text-xs"
      >
        <span aria-hidden className="select-none px-2 text-hog-red">
          $
        </span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="try /help"
          aria-label="Console command"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center gap-1.5 rounded border border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          <Send className="h-3 w-3" />
          Run
        </button>
      </form>
    </div>
  );
}

/* ==========================================================================
 * Page
 * ======================================================================== */

function ContactPage() {
  const triggerRef = useRef<((channel: string) => void) | null>(null);

  return (
    <>
      <ContactHero />

      {/* The composer --------------------------------------------------- */}
      <section data-act="hog" className="act-hog relative border-t-[3px] border-ink">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <SectionLabel index="02">Write it here</SectionLabel>
          </Reveal>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Channels ------------------------------------------------------- */}
      <section data-act="hog" className="act-hog relative border-t-2 border-border/20">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />

        <div className="relative mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <SectionLabel index="03">Or pick a channel</SectionLabel>
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {CHANNELS.map((channel, i) => (
              <Reveal key={channel.label} delay={i * 80}>
                <TiltCard max={5} lift={8} className="h-full">
                  <a
                    href={channel.href}
                    onClick={() => triggerRef.current?.(channel.label)}
                    {...(channel.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                    className="hog-card hog-card-hover group flex h-full items-start gap-4 p-5"
                  >
                    <span
                      aria-hidden
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-md border-2 border-border"
                      style={accentSurface(channel.accent)}
                    >
                      <channel.icon className="h-5 w-5" strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {channel.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[15px] font-semibold text-foreground">
                        {channel.value}
                      </span>
                      <span className="mt-1.5 block text-[13px] text-muted-foreground">
                        {channel.note}
                      </span>
                    </span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
                  </a>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          {/* Availability */}
          <Reveal delay={120}>
            <div className="relative mt-10">
              <div className="absolute -top-4 left-6 z-10">
                <Sticker tone="hog-green" rotate={-3}>
                  Available now
                </Sticker>
              </div>

              <div className="hog-card grid gap-6 p-6 pt-9 sm:grid-cols-3 sm:p-8 sm:pt-10">
                {[
                  { icon: MapPin, label: "Based in", value: site.location },
                  {
                    icon: Clock,
                    label: "My local time",
                    value: (
                      <LocalClock
                        timeZone={site.timezone}
                        className="font-mono tabular-nums text-foreground"
                      />
                    ),
                  },
                  { icon: Mail, label: "Response time", value: "Within a day" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="mt-14 text-center">
              <h2 className="display-md text-foreground">
                Or say hello the normal way<span className="text-hog-red">.</span>
              </h2>
              <div className="mx-auto mt-3 w-56">
                <Squiggle tone="hog-red" />
              </div>
              <HardLink href={`mailto:${site.email}`} variant="primary" size="lg" className="mt-8">
                <Mail className="h-4 w-4" />
                {site.email}
              </HardLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Console -------------------------------------------------------- */}
      <section
        data-act="noir"
        className="act-noir grain relative overflow-hidden border-t-[3px] border-ink"
      >
        <div
          aria-hidden
          className="hairline-grid pointer-events-none absolute inset-0 opacity-50"
        />

        <div className="relative mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionLabel index="04" rule={false}>
                <span className="inline-flex items-center gap-2">
                  <TerminalIcon className="h-3 w-3" />
                  For the curious
                </span>
              </SectionLabel>
              <SplitLines
                as="h2"
                onView
                lines={["A console that", "talks back."]}
                className="display-md mt-5 text-foreground"
              />
            </div>
            <div className="hidden items-end gap-1 sm:flex">
              <HandNote
                tone="hog-red"
                rotate={-6}
                size="md"
                className="pb-2"
                arrow="curve"
                arrowClassName="h-11 w-12"
              >
                try /hire
              </HandNote>
            </div>
          </div>

          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Entirely for fun — nothing here sends a real message. The commands are listed under
            <span className="mx-1 font-mono text-foreground">/help</span>.
          </p>

          <div className="mt-8">
            <Console triggerRef={triggerRef} />
          </div>
        </div>
      </section>
    </>
  );
}
