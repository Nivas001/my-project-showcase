import { createFileRoute } from "@tanstack/react-router";
import { Github, Linkedin, Mail, MapPin, Phone, Terminal as TerminalIcon, Send, Sparkles, Cpu, ShieldCheck } from "lucide-react";
import { site } from "@/lib/site";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Srinivas M" },
      {
        name: "description",
        content:
          "Get in touch with Srinivas M for Python, full stack or Flutter development roles. Email, phone, GitHub, LinkedIn and interactive terminal.",
      },
      { property: "og:title", content: "Contact — Srinivas M" },
      { property: "og:description", content: "Email, phone, GitHub and LinkedIn for Srinivas M." },
    ],
  }),
  component: ContactPage,
});

// Staggered animated background SVG illustration
function CyberBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-25">
      {/* Soft color glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl" />
      
      {/* Constellation grid network */}
      <svg
        className="cyber-drift absolute h-[115%] w-[115%] -left-[7%] -top-[7%] text-accent/15"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dotGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" className="text-accent/30" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
        
        {/* Connection nodes & paths */}
        <g strokeDasharray="3,3" className="text-accent/10">
          <line x1="100" y1="150" x2="300" y2="100" />
          <line x1="300" y1="100" x2="450" y2="250" />
          <line x1="450" y1="250" x2="600" y2="120" />
          <line x1="600" y1="120" x2="720" y2="220" />
          
          <line x1="80" y1="420" x2="250" y2="350" />
          <line x1="250" y1="350" x2="380" y2="520" />
          <line x1="380" y1="520" x2="550" y2="430" />
          <line x1="550" y1="430" x2="700" y2="600" />
          
          <line x1="100" y1="150" x2="80" y2="420" />
          <line x1="300" y1="100" x2="250" y2="350" />
          <line x1="450" y1="250" x2="380" y2="520" />
          <line x1="600" y1="120" x2="550" y2="430" />
          <line x1="720" y1="220" x2="700" y2="600" />
        </g>
        
        {/* Solid paths */}
        <path d="M 150 250 L 250 250 L 300 350 L 400 350 L 450 450" strokeWidth="0.8" className="text-primary/20" />
        <path d="M 650 300 L 550 350 L 500 480" strokeWidth="0.8" className="text-accent/20" />
        
        {/* Pulsing nodes */}
        <g className="fill-accent text-accent">
          <circle cx="100" cy="150" r="3" className="animate-ping [animation-duration:3s]" />
          <circle cx="100" cy="150" r="2.5" />
          <circle cx="300" cy="100" r="3" />
          <circle cx="450" cy="250" r="4.5" className="fill-primary text-primary" />
          <circle cx="600" cy="120" r="3" />
          <circle cx="720" cy="220" r="3.5" />
          <circle cx="80" cy="420" r="3" />
          <circle cx="250" cy="350" r="4" />
          <circle cx="380" cy="520" r="3" />
          <circle cx="550" cy="430" r="4" />
          <circle cx="700" cy="600" r="3.5" className="animate-ping [animation-duration:4.5s]" />
          <circle cx="700" cy="600" r="2.5" />
        </g>
      </svg>
    </div>
  );
}

type LogLine = {
  text: string;
  type: "system" | "exec" | "success" | "error" | "output" | "bold";
};

// Cyber Terminal Simulator Component
function CyberTerminal({ onCardTriggerRef }: { onCardTriggerRef: React.MutableRefObject<((channel: string) => void) | null> }) {
  const [logs, setLogs] = useState<LogLine[]>([
    { text: "CRITICAL: SECURE NODE COMMUNICATION PORT ACTIVE", type: "bold" },
    { text: "Initializing srinivas-m.node connection logs...", type: "system" },
    { text: "SSH Handshake: SUCCESSFUL (256-bit AES)", type: "success" },
    { text: "Status: Ready to accept CLI instructions", type: "system" },
    { text: "Type /help to query supported protocols or click any contact card above.", type: "output" },
  ]);
  const [inputVal, setInputVal] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Handle auto connection triggers from cards
  const triggerConnection = (channel: string) => {
    const channelName = channel.toLowerCase();
    const mockDetails: Record<string, { cmd: string; steps: string[] }> = {
      email: {
        cmd: "connect --channel=email",
        steps: [
          "Connecting to SMTP relay server...",
          `Resolved target endpoint: mailto:${site.email}`,
          "Port 465 status: SECURE",
          "ACTION COMPLETE: Click the Email Card to draft mail."
        ]
      },
      phone: {
        cmd: "connect --channel=phone",
        steps: [
          "Handshaking with Puducherry telecom gateway...",
          `Resolving telephone node: ${site.phone}`,
          "Call routing protocol: ACTIVE",
          "ACTION COMPLETE: Click the Phone Card to dial."
        ]
      },
      github: {
        cmd: "connect --channel=github",
        steps: [
          `Pinging github.com/Nivas001...`,
          "Status: 200 OK (Latency: 28ms)",
          "Fetching user repos: [Centac, DentalCare, TamilSummarizer, etc.]",
          "ACTION COMPLETE: Click the GitHub Card to view repo portfolio."
        ]
      },
      linkedin: {
        cmd: "connect --channel=linkedin",
        steps: [
          "Querying professional profile endpoints...",
          `Matching user: srinivas-m-734631259`,
          "Availability status: OPEN_TO_ROLES (Python, Full Stack, Flutter)",
          "ACTION COMPLETE: Click the LinkedIn Card to connect."
        ]
      }
    };

    const config = mockDetails[channelName];
    if (!config) return;

    // Simulate input execution
    setLogs((prev) => [...prev, { text: `> ${config.cmd}`, type: "exec" }]);

    config.steps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          {
            text: step,
            type: idx === config.steps.length - 1 ? "success" : "output"
          }
        ]);
      }, (idx + 1) * 350);
    });
  };

  // Bind trigger connection function to ref so cards can call it
  useEffect(() => {
    onCardTriggerRef.current = triggerConnection;
    return () => {
      onCardTriggerRef.current = null;
    };
  }, [onCardTriggerRef]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const command = inputVal.trim();
    if (!command) return;

    setLogs((prev) => [...prev, { text: `> ${command}`, type: "exec" }]);
    setInputVal("");

    const parts = command.split(" ");
    const mainCommand = parts[0]!.toLowerCase();

    setTimeout(() => {
      switch (mainCommand) {
        case "help":
        case "/help":
          setLogs((prev) => [
            ...prev,
            { text: "--- AVAILABLE PROTOCOLS ---", type: "bold" },
            { text: "/ping [email|phone|github|linkedin]  - Test connection latency", type: "output" },
            { text: "/msg [message_text]                - Encrypt and queue direct message", type: "output" },
            { text: "/sysinfo                            - Print developer hardware/academic specs", type: "output" },
            { text: "/clear                              - Flush terminal logs", type: "output" },
          ]);
          break;
        case "clear":
        case "/clear":
          setLogs([]);
          break;
        case "/sysinfo":
        case "sysinfo":
          setLogs((prev) => [
            ...prev,
            { text: "=== HOST SYSTEM SPECS ===", type: "bold" },
            { text: `Developer: Srinivas M.`, type: "output" },
            { text: `Academic Background: MCA (Pondicherry University)`, type: "output" },
            { text: `Scholastic Merit: GPA 8.79 / 10`, type: "output" },
            { text: `Primary Core: Python | NLP (Natural Language Processing)`, type: "output" },
            { text: `Frameworks: React.js, Flutter, Firebase, TensorFlow`, type: "output" },
            { text: `Status: Active & seeking software engineering roles`, type: "success" },
          ]);
          break;
        case "/ping":
          const target = parts[1]?.toLowerCase();
          if (!target || !["email", "phone", "github", "linkedin"].includes(target)) {
            setLogs((prev) => [
              ...prev,
              { text: "Error: Invalid target. Usage: /ping [email|phone|github|linkedin]", type: "error" }
            ]);
            break;
          }
          setLogs((prev) => [
            ...prev,
            { text: `Pinging ${target}.nivas.tech network gateways...`, type: "system" }
          ]);
          let pingCount = 0;
          const pingInterval = setInterval(() => {
            const rtt = Math.floor(Math.random() * 25) + 12;
            setLogs((prev) => [
              ...prev,
              { text: `64 bytes from nodes.${target}.tech: icmp_seq=${pingCount} ttl=56 time=${rtt}ms`, type: "output" }
            ]);
            pingCount++;
            if (pingCount >= 3) {
              clearInterval(pingInterval);
              setLogs((prev) => [
                ...prev,
                { text: `--- ${target}.nivas.tech ping statistics ---`, type: "bold" },
                { text: "3 packets transmitted, 3 received, 0% packet loss", type: "success" }
              ]);
            }
          }, 300);
          break;
        case "/msg":
          const msgBody = parts.slice(1).join(" ");
          if (!msgBody) {
            setLogs((prev) => [
              ...prev,
              { text: "Error: Message payload empty. Usage: /msg [message_text]", type: "error" }
            ]);
            break;
          }
          setLogs((prev) => [
            ...prev,
            { text: "[MSG] Compiling envelope payload...", type: "system" },
          ]);
          setTimeout(() => {
            setLogs((prev) => [...prev, { text: "[MSG] Applying 256-bit AES cryptographic wrappers...", type: "system" }]);
          }, 400);
          setTimeout(() => {
            setLogs((prev) => [...prev, { text: "[MSG] Injecting packet to transmission stream queue...", type: "system" }]);
          }, 800);
          setTimeout(() => {
            setLogs((prev) => [
              ...prev,
              { text: "[MSG] TRANSMISSION SUCCESSFUL! Local spool created.", type: "success" },
              { text: `Please forward your drafted mail directly to ${site.email} to guarantee real-time reception!`, type: "output" }
            ]);
          }, 1400);
          break;
        default:
          setLogs((prev) => [
            ...prev,
            { text: `Error: Command '${mainCommand}' not recognized. Type /help for console reference.`, type: "error" }
          ]);
      }
    }, 150);
  };

  return (
    <div className="mt-12 rounded-md border border-border/80 bg-black/75 shadow-[var(--shadow-glow)] backdrop-blur-md">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-border/70 bg-card/65 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          <span className="ml-3 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            srinivas@cyber-panel:~
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-accent/80">
          <Cpu className="h-3 w-3 animate-pulse" />
          <span>PORT 465 ACTIVE</span>
        </div>
      </div>
      
      {/* Terminal Output Logs */}
      <div className="h-64 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
        {logs.map((log, idx) => {
          let color = "text-muted-foreground";
          if (log.type === "exec") color = "text-accent text-glow";
          if (log.type === "success") color = "text-primary font-semibold";
          if (log.type === "error") color = "text-destructive font-medium";
          if (log.type === "bold") color = "text-foreground font-semibold border-b border-border/20 pb-1 mb-1 block";
          
          return (
            <div key={idx} className={color}>
              {log.text}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Form */}
      <form onSubmit={handleCommand} className="flex border-t border-border/70 bg-card/25 p-2 font-mono text-xs">
        <span className="flex items-center px-1 sm:px-2 text-accent select-none">
          <span className="hidden sm:inline">srinivas@terminal:~$</span>
          <span className="inline sm:hidden">:~$</span>
        </span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="type /help to explore..."
          className="flex-1 bg-transparent px-1 py-1.5 text-foreground outline-none placeholder:text-muted-foreground/50"
        />
        <button
          type="submit"
          aria-label="Submit command"
          className="flex items-center gap-1 rounded-sm bg-accent/15 px-3 py-1.5 text-[10px] font-medium text-accent border border-accent/30 hover:bg-accent/30 transition-colors"
        >
          <Send className="h-3 w-3" />
          <span>EXEC</span>
        </button>
      </form>
    </div>
  );
}

const channels = [
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}`, detail: "$ ping mail.nivas.tech", bg: "hover:border-accent/40 hover:shadow-[0_0_15px_oklch(0.74_0.13_270_/_20%)]" },
  { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone}`, detail: "$ dial +917448724920", bg: "hover:border-accent/40 hover:shadow-[0_0_15px_oklch(0.74_0.13_270_/_20%)]" },
  { icon: Github, label: "GitHub", value: "View repositories", href: site.github, detail: "$ ssh git@github.com", bg: "hover:border-primary/40 hover:shadow-[0_0_15px_oklch(0.51_0.23_277_/_20%)]" },
  { icon: Linkedin, label: "LinkedIn", value: "Connect with me", href: site.linkedin, detail: "$ curl linkedin.com", bg: "hover:border-primary/40 hover:shadow-[0_0_15px_oklch(0.51_0.23_277_/_20%)]" },
];

function ContactPage() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const onCardTriggerRef = useRef<((channel: string) => void) | null>(null);

  const handleCardClick = (label: string) => {
    if (onCardTriggerRef.current) {
      onCardTriggerRef.current(label);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Visual cyber grids & constellation backgrounds */}
      <CyberBackground />

      <div className="mx-auto max-w-3xl px-5 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground animate-fade-in-up [animation-delay:0ms]">
          // ./contact --now
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl animate-fade-in-up [animation-delay:100ms]">
          Let&apos;s talk
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground animate-fade-in-up [animation-delay:200ms]">
          Open to Python, full stack and Flutter roles. The fastest way to reach me is email — I
          usually reply the same day.
        </p>

        {/* Contact details grid list */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {channels.map((channel, index) => (
            <a
              key={channel.label}
              href={channel.href}
              onClick={() => handleCardClick(channel.label)}
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              style={{ animationDelay: `${300 + index * 100}ms` }}
              className={`glare-swipe flex items-start gap-3 rounded-md border border-border bg-card/85 p-4 animate-fade-in-up transition-all duration-300 hover:-translate-y-1 hover:bg-card ${channel.bg}`}
            >
              <channel.icon className={`mt-0.5 h-4 w-4 text-accent transition-transform duration-300 ${hoveredIdx === index ? "scale-125 rotate-12" : ""}`} />
              <div className="flex-1">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {channel.label}
                </div>
                <div className="mt-0.5 text-sm text-foreground">{channel.value}</div>
                
                {/* Dynamically expanding subtext console instruction on hover */}
                <div 
                  className={`mt-2 font-mono text-[10px] transition-all duration-300 overflow-hidden ${
                    hoveredIdx === index ? "max-h-8 opacity-100 text-accent/80" : "max-h-0 opacity-0 text-muted-foreground/30"
                  }`}
                >
                  {channel.detail}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Cyber terminal simulator container */}
        <div style={{ animationDelay: "700ms" }} className="animate-fade-in-up">
          <CyberTerminal onCardTriggerRef={onCardTriggerRef} />
        </div>

        {/* Location Footer bar */}
        <p style={{ animationDelay: "850ms" }} className="mt-12 flex items-center gap-2 font-mono text-xs text-muted-foreground animate-fade-in-up">
          <MapPin className="h-3.5 w-3.5 text-accent animate-pulse" /> {site.location}
          <span className="mx-2 text-border">|</span>
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> SECURE CONSOLE
        </p>
      </div>
    </div>
  );
}
