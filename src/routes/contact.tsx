import { createFileRoute } from "@tanstack/react-router";
import { Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Srinivas M" },
      {
        name: "description",
        content:
          "Get in touch with Srinivas M for Python, full stack or Flutter development roles and freelance work. Email, phone, GitHub and LinkedIn.",
      },
      { property: "og:title", content: "Contact — Srinivas M" },
      { property: "og:description", content: "Email, phone, GitHub and LinkedIn for Srinivas M." },
    ],
  }),
  component: ContactPage,
});

const channels = [
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
  { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone}` },
  { icon: Github, label: "GitHub", value: "View repositories", href: site.github },
  { icon: Linkedin, label: "LinkedIn", value: "Connect with me", href: site.linkedin },
];

function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        // ./contact --now
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Let&apos;s talk</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Open to Python, full stack and Flutter roles. The fastest way to reach me is email — I
        usually reply the same day.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {channels.map((channel) => (
          <a
            key={channel.label}
            href={channel.href}
            target={channel.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="glow-card flex items-start gap-3 rounded-md border border-border bg-card p-4"
          >
            <channel.icon className="mt-0.5 h-4 w-4 text-accent" />
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {channel.label}
              </div>
              <div className="mt-0.5 text-sm text-foreground">{channel.value}</div>
            </div>
          </a>
        ))}
      </div>

      <p className="mt-10 flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" /> {site.location}
      </p>
    </div>
  );
}
