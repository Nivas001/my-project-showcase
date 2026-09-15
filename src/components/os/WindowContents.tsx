import { Link } from "@tanstack/react-router";
import {
  Award,
  ArrowUpRight,
  Download,
  FileText,
  Folder,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import type { Project } from "@/lib/projects";
import {
  certifications,
  changelog,
  education,
  site,
  skills,
  toAbsoluteUrl,
  prettyUrl,
} from "@/lib/site";
import { StatusDot } from "@/components/kit";

/* ==========================================================================
 * about-me.txt — a TextEdit-ish plain document.
 * ======================================================================== */

export function AboutWindow() {
  return (
    <div className="space-y-4 px-6 py-5 font-mono text-[13px] leading-relaxed text-muted-foreground">
      <p className="text-foreground">{site.tagline}</p>
      {site.bio.map((paragraph) => (
        <p key={paragraph.slice(0, 20)}>{paragraph}</p>
      ))}
      <div className="border-t border-foreground/10 pt-4">
        <p className="micro mb-3 text-muted-foreground">Education</p>
        {education.slice(0, 2).map((entry) => (
          <p key={entry.degree} className="mb-1.5">
            <span className="text-foreground">{entry.degree}</span> — {entry.school}{" "}
            <span className="opacity-70">({entry.score})</span>
          </p>
        ))}
      </div>
      <Link
        to="/about"
        className="inline-flex items-center gap-1.5 text-foreground underline underline-offset-4"
      >
        Open the full page <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

/* ==========================================================================
 * Résumé.pdf — a Preview-ish sheet.
 * ======================================================================== */

export function ResumeWindow() {
  const facts: [string, string][] = [
    ["Name", site.fullName],
    ["Role", "Full-stack engineer"],
    ["Location", site.location],
    ["Education", "MCA, Pondicherry University — 8.79/10"],
    ["Email", site.email],
    ["Phone", site.phone],
  ];

  return (
    <div className="px-6 py-5">
      <div className="rounded-lg border border-foreground/12 bg-foreground/5 p-5">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Srinivas M — Résumé.pdf</p>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              PDF document · updated 2026
            </p>
          </div>
        </div>

        <dl className="mt-5 space-y-2">
          {facts.map(([label, value]) => (
            <div key={label} className="flex gap-4 text-[13px]">
              <dt className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {label}
              </dt>
              <dd className="min-w-0 flex-1 text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <a
          href={site.resumeUrl}
          download
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          Download
        </a>
        <a
          href={`mailto:${site.email}`}
          className="inline-flex items-center gap-2 rounded-lg border border-foreground/20 px-4 py-2 text-sm text-foreground transition-colors hover:bg-foreground/10"
        >
          Email me instead
        </a>
      </div>
    </div>
  );
}

/* ==========================================================================
 * Projects — a Finder-ish list view.
 * ======================================================================== */

export function ProjectsWindow({ projects }: { projects: Project[] }) {
  return (
    <div className="px-2 py-2">
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-foreground/10 px-4 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>Name</span>
        <span className="hidden sm:block">Kind</span>
        <span>Date</span>
      </div>

      {projects.map((project) => {
        const live = toAbsoluteUrl(project.live_url);
        return (
          <Link
            key={project.id}
            to="/projects/$slug"
            params={{ slug: project.slug }}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 rounded-lg px-4 py-2.5 transition-colors hover:bg-foreground/10"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-[13px] text-foreground">{project.title}</span>
              {live ? <StatusDot /> : null}
            </span>
            <span className="hidden font-mono text-[11px] text-muted-foreground sm:block">
              {project.category}
            </span>
            <span className="truncate font-mono text-[11px] text-muted-foreground">
              {project.period}
            </span>
          </Link>
        );
      })}

      <div className="mt-2 flex items-center justify-between border-t border-foreground/10 px-4 pt-2.5 font-mono text-[11px] text-muted-foreground">
        <span>{projects.length} items</span>
        <Link to="/projects" className="text-foreground underline underline-offset-4">
          Open Work
        </Link>
      </div>
    </div>
  );
}

/* ==========================================================================
 * read-me-first.rtf — the note that explains the desktop.
 * ======================================================================== */

export function ReadmeWindow({ projects }: { projects: Project[] }) {
  const live = projects.filter((p) => toAbsoluteUrl(p.live_url) && p.category !== "Research");

  return (
    <div className="space-y-4 px-6 py-5 text-[13px] leading-relaxed text-muted-foreground">
      <p className="hand text-2xl leading-tight text-foreground">Hey — welcome to my desktop.</p>

      <p>
        Everything here is real. The dock at the bottom opens the actual pages, the files on the
        wallpaper open in windows you can drag around, and the Trash is not empty.
      </p>

      <div className="rounded-lg border border-foreground/12 bg-foreground/5 p-4">
        <p className="micro mb-3 text-muted-foreground">Currently in production</p>
        <ul className="space-y-2">
          {live.map((project) => {
            const url = toAbsoluteUrl(project.live_url)!;
            return (
              <li key={project.id} className="flex items-center gap-2.5">
                <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-foreground underline underline-offset-4"
                >
                  {prettyUrl(url)}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <p>
        Keep scrolling past the wallpaper and the site changes register entirely — that part is
        worth seeing.
      </p>

      <div className="flex flex-wrap gap-2.5 pt-1">
        <a
          href={site.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-foreground/20 px-3 py-1.5 text-[13px] text-foreground transition-colors hover:bg-foreground/10"
        >
          <Github className="h-3.5 w-3.5" />
          Source
        </a>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-lg border border-foreground/20 px-3 py-1.5 text-[13px] text-foreground transition-colors hover:bg-foreground/10"
        >
          Browse the work
        </Link>
      </div>
    </div>
  );
}

/* ==========================================================================
 * changelog.log — the shipping history, rehomed off the front page.
 *
 * It used to be a homepage section, where it re-listed the same projects a
 * third time. As a file you choose to open it earns its length back.
 * ======================================================================== */

export function ChangelogWindow() {
  return (
    <div className="px-6 py-5 font-mono text-[12px] leading-relaxed">
      <p className="micro mb-4 text-muted-foreground">{changelog.length} entries · newest first</p>
      <ol className="space-y-4">
        {changelog.map((entry) => (
          <li
            key={entry.title}
            className="border-l-2 pl-3.5"
            style={{ borderColor: `var(--${entry.accent})` }}
          >
            <p className="flex flex-wrap items-baseline gap-x-2.5">
              <span className="text-muted-foreground">{entry.date}</span>
              <span
                className="uppercase tracking-widest"
                style={{ color: `var(--${entry.accent})` }}
              >
                {entry.tag}
              </span>
            </p>
            <p className="mt-1 font-sans text-[13px] font-semibold text-foreground">
              {entry.title}
            </p>
            <p className="mt-1 font-sans text-[12px] text-muted-foreground">{entry.body}</p>
            {/* Not every entry is about a project — some are milestones with
                nowhere to link to. */}
            {entry.slug ? (
              <Link
                to="/projects/$slug"
                params={{ slug: entry.slug }}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-foreground underline underline-offset-4"
              >
                Open case study <ArrowUpRight className="h-3 w-3" />
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ==========================================================================
 * certificates — a folder of them.
 * ======================================================================== */

export function CertificatesWindow() {
  return (
    <div className="px-6 py-5">
      <p className="micro mb-4 text-muted-foreground">{certifications.length} items</p>
      <ul className="space-y-1">
        {certifications.map((cert) => (
          <li
            key={cert.title}
            className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-foreground/8"
          >
            <Award className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] text-foreground">{cert.title}</span>
              <span className="block font-mono text-[11px] text-muted-foreground">
                {cert.issuer}
              </span>
            </span>
            <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
              {cert.year}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ==========================================================================
 * education.txt
 * ======================================================================== */

export function EducationWindow() {
  return (
    <div className="space-y-4 px-6 py-5 font-mono text-[12px] leading-relaxed text-muted-foreground">
      {education.map((entry) => (
        <div
          key={entry.degree}
          className="border-t border-foreground/10 pt-3 first:border-0 first:pt-0"
        >
          <p className="font-sans text-[13px] font-semibold text-foreground">{entry.degree}</p>
          <p className="mt-0.5">{entry.school}</p>
          <p className="mt-0.5 flex flex-wrap gap-x-3">
            <span>{entry.period}</span>
            <span className="text-foreground">{entry.score}</span>
          </p>
          {entry.note ? <p className="mt-1 opacity-80">{entry.note}</p> : null}
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
 * stack.app — everything, grouped.
 * ======================================================================== */

export function StackWindow() {
  return (
    <div className="space-y-5 px-6 py-5">
      {skills.map((group) => (
        <div key={group.group}>
          <p className="micro mb-2.5 text-muted-foreground">{group.group}</p>
          <div className="flex flex-wrap gap-1.5">
            {group.items.map((item) => (
              <span
                key={item}
                className="rounded-md border border-foreground/15 bg-foreground/5 px-2 py-1 font-mono text-[11px] text-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
 * contact.card — a vCard.
 * ======================================================================== */

export function ContactWindow() {
  const rows: { icon: typeof Mail; label: string; href: string; external?: boolean }[] = [
    { icon: Mail, label: site.email, href: `mailto:${site.email}` },
    { icon: Phone, label: site.phone, href: `tel:${site.phone}` },
    { icon: Github, label: "GitHub", href: site.github, external: true },
    { icon: Linkedin, label: "LinkedIn", href: site.linkedin, external: true },
  ];

  return (
    <div className="px-6 py-5">
      <div className="rounded-lg border border-foreground/12 bg-foreground/5 p-5">
        <p className="text-base font-semibold text-foreground">{site.fullName}</p>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">Full-stack engineer</p>
        <p className="mt-2.5 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {site.location}
        </p>
        <p className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <StatusDot />
          Available for work
        </p>
      </div>

      <div className="mt-4 space-y-1">
        {rows.map((row) => (
          <a
            key={row.label}
            href={row.href}
            {...(row.external ? { target: "_blank", rel: "noreferrer" } : {})}
            className="flex items-center gap-3 rounded-lg px-2 py-2 text-[13px] text-foreground transition-colors hover:bg-foreground/8"
          >
            <row.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{row.label}</span>
            {row.external ? <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-50" /> : null}
          </a>
        ))}
      </div>
    </div>
  );
}
