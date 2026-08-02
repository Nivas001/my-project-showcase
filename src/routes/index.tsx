import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, Download, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/site";
import { projectsQuery } from "@/lib/queries";
import { ProjectCard } from "@/components/ProjectCard";

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
          "MCA graduate building NLP research, React web apps and Flutter mobile products. Video resume, live projects and GitHub repos.",
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

const bootLines = ["whoami", "Srinivas M"];

function TerminalIntro() {
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const target = bootLines[0]!;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(target.slice(0, i));
      if (i >= target.length) {
        window.clearInterval(id);
        window.setTimeout(() => setDone(true), 320);
      }
    }, 70);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="font-mono text-sm text-muted-foreground">
      <span className="text-primary">srinivas@portfolio</span>
      <span className="text-muted-foreground">:~$ </span>
      <span className="text-foreground">{typed}</span>
      {!done && <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-accent align-middle" />}
    </div>
  );
}

function Home() {
  const { data: projects } = useSuspenseQuery(projectsQuery);
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  const shown = featured.length > 0 ? featured : projects.slice(0, 3);
  

  return (
    <div className="mx-auto max-w-6xl px-5">
      <section className="scanlines relative grid items-center gap-10 py-20 sm:py-28 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="order-2 lg:order-1">
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

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View projects <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={site.resumeUrl}
            download
            className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary"
          >
            <Download className="h-4 w-4" /> Resume PDF
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
      </section>

      <section className="grid gap-4 border-y border-border/70 py-8 sm:grid-cols-3">
        {[
          { value: "8.79", label: "MCA GPA / 10" },
          { value: String(projects.length), label: "projects shipped" },
          { value: "5", label: "certifications" },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="font-mono text-3xl font-bold text-accent">{stat.value}</div>
            <div className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </section>


      <section className="py-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            // selected work
          </h2>
          <Link to="/projects" className="font-mono text-xs text-accent hover:underline">
            all projects →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
