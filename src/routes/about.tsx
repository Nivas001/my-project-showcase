import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, ExternalLink } from "lucide-react";
import { site, skills, education, certifications, strengths, toEmbedUrl } from "@/lib/site";
import { certificatesQuery, skillGroupsQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Srinivas M, Python & Full Stack Developer" },
      {
        name: "description",
        content:
          "Background, skills, education and certifications of Srinivas M — MCA graduate from Pondicherry University specialising in Python, NLP and full stack development.",
      },
      { property: "og:title", content: "About — Srinivas M" },
      {
        property: "og:description",
        content: "Skills, education and certifications of Srinivas M, Python and full stack developer.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: certificates } = useQuery(certificatesQuery);
  const { data: skillGroups } = useQuery(skillGroupsQuery);
  const skillList =
    skillGroups && skillGroups.length > 0
      ? skillGroups.map((group) => ({ group: group.name, items: group.items }))
      : skills;
  const embed = toEmbedUrl(site.videoResumeUrl);
  const hasStored = (certificates ?? []).length > 0;

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        // cat about.md
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">About me</h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {site.summary}
      </p>
      <a
        href={site.resumeUrl}
        download
        className="mt-6 inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary"
      >
        <Download className="h-4 w-4" /> Download resume
      </a>

      {embed ? (
        <section className="mt-14">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            // video resume
          </h2>
          <div className="mt-5 overflow-hidden rounded-md border border-border bg-card shadow-[var(--shadow-glow)]">
            <div className="flex items-center gap-1.5 border-b border-border/70 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
              <span className="ml-3 font-mono text-[11px] text-muted-foreground">
                srinivas — intro.mp4
              </span>
            </div>
            <div className="aspect-video bg-background">
              <iframe
                src={embed}
                title="Video resume of Srinivas M"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          // skills
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {skillList.map((group) => (
            <div key={group.group} className="rounded-md border border-border bg-card p-4">
              <h3 className="font-mono text-xs text-accent">{group.group}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-sm bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          // education
        </h2>
        <div className="mt-5 space-y-3">
          {education.map((entry) => (
            <div
              key={entry.degree}
              className="flex flex-col gap-1 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="text-sm font-semibold">{entry.degree}</h3>
                <p className="text-sm text-muted-foreground">{entry.school}</p>
              </div>
              <div className="font-mono text-xs text-muted-foreground sm:text-right">
                <div>{entry.period}</div>
                <div className="text-accent">{entry.score}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            // certifications
          </h2>
          {hasStored ? (
            <div className="mt-5 space-y-3">
              {(certificates ?? []).map((certificate) => (
                <div key={certificate.id} className="rounded-md border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">{certificate.title}</h3>
                      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                        {[certificate.issuer, certificate.issued_on].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {certificate.credential_url ? (
                      <a
                        href={certificate.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-primary"
                        aria-label={`Open credential for ${certificate.title}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                  {certificate.images.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {certificate.images.map((src) => (
                        <img
                          key={src}
                          src={src}
                          alt={`${certificate.title} certificate`}
                          loading="lazy"
                          className="rounded-sm border border-border"
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <ul className="mt-5 space-y-2 text-sm text-foreground/85">
              {certifications.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="font-mono text-accent">▹</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            // strengths
          </h2>
          <ul className="mt-5 space-y-2 text-sm text-foreground/85">
            {strengths.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="font-mono text-accent">▹</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
