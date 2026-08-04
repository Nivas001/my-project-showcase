import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, Download, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/site";
import { projectsQuery } from "@/lib/queries";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal, CountUp } from "@/components/Reveal";



export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQuery),
  head: () => ({
    meta: [
      { title: "Srinivas M — Python, Full Stack & Flutter Developer" },
      {
        name: "description",
        content:
          "MCA graduate building NLP research, React web apps and Flutter mobile products. Watch the video resume, browse live projects and open-source repos.",
      },
      { property: "og:title", content: "Srinivas M — Python, Full Stack & Flutter Developer" },
      {
        property: "og:description",
        content:
          "MCA graduate building NLP research, React web apps and Flutter mobile products. Watch the video resume, browse live projects and open-source repos.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Srinivas M",
          jobTitle: "Python Developer",
          email: `mailto:${site.email}`,
          telephone: site.phone,
          address: { "@type": "PostalAddress", addressLocality: "Pondicherry", addressCountry: "IN" },
          alumniOf: "Pondicherry University",
        }),
      },
    ],
  }),
  component: Home,
});

function TerminalIntro() {
  const lines = ["whoami", "cat role.txt"];
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (step >= lines.length) {
      setDone(true);
      return;
    }
    const target = lines[step]!;
    let i = 0;
    setTyped("");
    const id = window.setInterval(() => {
      i += 1;
      setTyped(target.slice(0, i));
      if (i >= target.length) {
        window.clearInterval(id);
        window.setTimeout(() => setStep((s) => s + 1), 520);
      }
    }, 70);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="space-y-1 font-mono text-sm text-muted-foreground">
      <div>
        <span className="text-primary">srinivas@portfolio</span>
        <span>:~$ </span>
        <span className="text-foreground">{step === 0 ? typed : lines[0]}</span>
        {step === 0 && (
          <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-accent align-middle" />
        )}
      </div>
      {step >= 1 && (
        <>
          <div className="text-accent">Srinivas M</div>
          <div>
            <span className="text-primary">srinivas@portfolio</span>
            <span>:~$ </span>
            <span className="text-foreground">{step === 1 ? typed : lines[1]}</span>
            {!done && (
              <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-accent align-middle" />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Home() {
  const { data: projects } = useSuspenseQuery(projectsQuery);
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  const shown = featured.length > 0 ? featured : projects.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-5">
      <section className="scanlines relative py-20 sm:py-28">
        <div
          aria-hidden
          className="cyber-drift pointer-events-none absolute -left-32 -top-24 -z-10 h-[26rem] w-[26rem] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, var(--glow) 0%, transparent 70%)",
            opacity: 0.16,
          }}
        />
        <div className="animate-fade-in-up">
          <TerminalIntro />

          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Srinivas M
            <span className="text-accent">.</span>
          </h1>
          <p className="mt-4 max-w-2xl font-mono text-sm text-accent sm:text-base text-glow">
            {site.role}
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {site.summary}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/5 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-accent">
            <span className="relative flex h-2 w-2">
              <span className="status-ping absolute inline-flex h-full w-full rounded-full bg-accent" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            available for work
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/projects"
              className="glare-swipe group inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[var(--shadow-glow)]"
            >
              View projects{" "}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a
              href={site.resumeUrl}
              download
              className="group inline-flex items-center gap-2 rounded-sm border border-border px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary"
            >
              <Download className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />{" "}
              Resume PDF
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {site.location}
            </span>
            <a href={`mailto:${site.email}`} className="flex items-center gap-1.5 hover:text-accent">
              <Mail className="h-3.5 w-3.5" /> {site.email}
            </a>
            <a href={`tel:${site.phone}`} className="flex items-center gap-1.5 hover:text-accent">
              <Phone className="h-3.5 w-3.5" /> {site.phone}
            </a>
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-accent"
            >
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-accent"
            >
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-4 border-y border-border/70 py-8 sm:grid-cols-3">
        {[
          { value: "8.79", label: "MCA GPA / 10" },
          { value: String(projects.length), label: "projects shipped" },
          { value: "5", label: "certifications" },
        ].map((stat, index) => (
          <Reveal key={stat.label} delay={index * 90}>
            <div className="font-mono text-3xl font-bold text-accent">
              <CountUp value={stat.value} />
            </div>
            <div className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </div>
          </Reveal>
        ))}
      </section>

      <section className="py-8">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              // selected work
            </h2>
            <Link
              to="/projects"
              className="group font-mono text-xs text-accent hover:underline"
            >
              all projects{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </Reveal>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((project, index) => (
            <Reveal key={project.id} delay={index * 110}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

