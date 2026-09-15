import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, ExternalLink, Mail } from "lucide-react";
import { site, skills, education, certifications, principles, toEmbedUrl } from "@/lib/site";
import { certificatesQuery, skillGroupsQuery, experiencesQuery } from "@/lib/queries";
import { experiencePeriod } from "@/lib/experiences";
import { accentFor, accentSurface } from "@/lib/accents";
import {
  Annotation,
  BrowserFrame,
  HardLink,
  PageHero,
  SectionLabel,
  SplitLines,
  Squiggle,
  StatusDot,
} from "@/components/kit";
import { Reveal } from "@/components/Reveal";

const TITLE = "About — Srinivas M";
const DESCRIPTION =
  "Srinivas M: full-stack engineer in Pondicherry. Background, stack, education and certifications, plus a video introduction.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AboutPage,
});

/** A labelled section on the cream surface. */
function Block({
  index,
  label,
  title,
  lede,
  children,
}: {
  index: string;
  label: string;
  title?: readonly string[];
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 first:mt-0">
      <Reveal>
        <SectionLabel index={index}>{label}</SectionLabel>
      </Reveal>
      {title ? (
        <SplitLines as="h2" onView lines={title} className="display-md mt-5 text-foreground" />
      ) : null}
      {lede ? (
        <Reveal delay={100}>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">{lede}</p>
        </Reveal>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function AboutPage() {
  const { data: certificates } = useQuery(certificatesQuery);
  const { data: experiences } = useQuery(experiencesQuery);
  const { data: skillGroups } = useQuery(skillGroupsQuery);

  const skillList =
    skillGroups && skillGroups.length > 0
      ? skillGroups.map((group) => ({ group: group.name, items: group.items }))
      : skills;

  const isDirectVideo =
    site.videoResumeUrl &&
    (site.videoResumeUrl.toLowerCase().endsWith(".mp4") ||
      site.videoResumeUrl.toLowerCase().endsWith(".webm") ||
      site.videoResumeUrl.toLowerCase().includes("supabase.co/storage/v1/object/public/"));
  const embed = isDirectVideo ? null : toEmbedUrl(site.videoResumeUrl);
  const hasVideo = Boolean(isDirectVideo || embed);

  const storedCertificates = certificates ?? [];
  const storedExperiences = experiences ?? [];

  let step = 0;
  const nextIndex = () => String(++step).padStart(2, "0");

  return (
    <>
      <PageHero index="01" label="About" lines={["The long", "version."]} lede={site.tagline}>
        <div className="flex flex-wrap items-center gap-3">
          <HardLink href={site.resumeUrl} download variant="invert" size="md">
            <Download className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
            Download résumé
          </HardLink>
          <HardLink href={`mailto:${site.email}`} variant="ghost" size="md">
            <Mail className="h-4 w-4" />
            Get in touch
          </HardLink>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <StatusDot />
            Available for work
          </span>
        </div>
      </PageHero>

      <section data-act="hog" className="act-hog relative border-t-[3px] border-ink">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />

        <div className="relative mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          {/* Bio ---------------------------------------------------------- */}
          <Block index={nextIndex()} label="Who I am" title={["Hello — I'm Srinivas."]}>
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
              <div className="min-w-0 space-y-5">
                {site.bio.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className="text-[15px] leading-relaxed text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="min-w-0">
                <div className="hog-card overflow-hidden">
                  <div className="border-b-2 border-border bg-secondary px-5 py-3">
                    <h3 className="micro text-muted-foreground">At a glance</h3>
                  </div>
                  <dl className="divide-y-2 divide-border/15">
                    {[
                      ["Based in", site.location],
                      ["Focus", "Full-stack · Mobile · NLP"],
                      ["Degree", "MCA — 8.79/10"],
                      ["University", "Pondicherry University"],
                      ["Open to", "Full-time & contract"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex gap-4 px-5 py-3">
                        <dt className="w-24 shrink-0 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="min-w-0 flex-1 text-sm text-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </Block>

          {/* Video -------------------------------------------------------- */}
          {hasVideo ? (
            <Block
              index={nextIndex()}
              label="Video introduction"
              title={["Or just watch me", "say it."]}
            >
              <Reveal>
                <div className="relative">
                  <Annotation
                    tone="hog-blue"
                    rotate={-6}
                    className="absolute -top-9 right-4 hidden lg:block"
                  >
                    ~90 seconds, promise
                  </Annotation>

                  <BrowserFrame url="srinivas — introduction.mp4">
                    <div className="relative aspect-video w-full bg-secondary">
                      {isDirectVideo ? (
                        <video
                          src={site.videoResumeUrl}
                          controls
                          preload="metadata"
                          className="absolute inset-0 h-full w-full object-contain"
                        />
                      ) : (
                        <iframe
                          src={embed || ""}
                          title="Video introduction from Srinivas M"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 h-full w-full border-0"
                        />
                      )}
                    </div>
                  </BrowserFrame>
                </div>
              </Reveal>
            </Block>
          ) : null}

          {/* Experience (only when the table has rows) --------------------- */}
          {storedExperiences.length > 0 ? (
            <Block index={nextIndex()} label="Experience" title={["Where I've worked."]}>
              <div className="relative pl-7">
                <span
                  aria-hidden
                  className="timeline-draw absolute bottom-3 left-[7px] top-3 w-0.5 bg-border/25"
                />
                <div className="space-y-4">
                  {storedExperiences.map((experience, index) => (
                    <Reveal key={experience.id} delay={index * 90}>
                      <div className="relative">
                        <span
                          aria-hidden
                          className="absolute -left-7 top-6 h-4 w-4 rounded-full border-2 border-border"
                          style={{ background: `var(--${accentFor(index)})` }}
                        />
                        <article className="hog-card hog-card-hover p-5">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="display-sm text-foreground">{experience.role}</h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {experience.company_url ? (
                                  <a
                                    href={experience.company_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="nav-link inline-flex items-center gap-1 hover:text-foreground"
                                  >
                                    {experience.company}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : (
                                  experience.company
                                )}
                                {experience.location ? ` · ${experience.location}` : ""}
                              </p>
                            </div>
                            <div className="shrink-0 font-mono text-[11px] text-muted-foreground sm:text-right">
                              <div>{experiencePeriod(experience)}</div>
                              {experience.employment_type ? (
                                <div className="font-bold text-foreground">
                                  {experience.employment_type}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {experience.summary ? (
                            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                              {experience.summary}
                            </p>
                          ) : null}

                          {experience.highlights.length > 0 ? (
                            <ul className="mt-4 space-y-2">
                              {experience.highlights.map((item) => (
                                <li
                                  key={item}
                                  className="flex gap-2.5 text-[14px] leading-relaxed text-muted-foreground"
                                >
                                  <span
                                    aria-hidden
                                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                                  />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : null}

                          {experience.tech.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {experience.tech.map((item) => (
                                <span
                                  key={item}
                                  className="rounded border border-border/25 bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground/85"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </article>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Block>
          ) : null}

          {/* Skills ------------------------------------------------------- */}
          <Block
            index={nextIndex()}
            label="The stack"
            title={["What I work with."]}
            lede="Deep in the first two groups, comfortable in the rest. I'd rather say that plainly than claim all of it equally."
          >
            <div className="hog-card grid overflow-hidden sm:grid-cols-2">
              {skillList.map((group, gi) => (
                <div
                  key={group.group}
                  className="border-border/15 p-5 [&:not(:last-child)]:border-b-2 sm:[&:nth-child(odd)]:border-r-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className="h-3 w-3 shrink-0 rounded-sm border-2 border-border"
                      style={{ background: `var(--${accentFor(gi)})` }}
                    />
                    <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
                      {group.group}
                    </h3>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded border border-border/25 bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground/85"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Block>

          {/* Education ---------------------------------------------------- */}
          <Block index={nextIndex()} label="Education" title={["Where I learned it."]}>
            <div className="hog-card overflow-hidden">
              {education.map((entry, i) => (
                <div
                  key={entry.degree}
                  className={`flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between ${
                    i < education.length - 1 ? "border-b-2 border-border/15" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-foreground">{entry.degree}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{entry.school}</p>
                    {entry.note ? (
                      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                        {entry.note}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 font-mono text-[11px] text-muted-foreground sm:text-right">
                    <div>{entry.period}</div>
                    <div className="mt-1 font-bold text-foreground">{entry.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </Block>

          {/* Certifications ----------------------------------------------- */}
          <Block index={nextIndex()} label="Certifications" title={["Paper trail."]}>
            {storedCertificates.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {storedCertificates.map((certificate, i) => (
                  <Reveal key={certificate.id} delay={i * 80}>
                    <article className="hog-card hog-card-hover h-full overflow-hidden">
                      <span
                        aria-hidden
                        className="block h-1.5 w-full"
                        style={{ background: `var(--${accentFor(i)})` }}
                      />
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-[15px] font-semibold text-foreground">
                              {certificate.title}
                            </h3>
                            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                              {[certificate.issuer, certificate.issued_on]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>
                          {certificate.credential_url ? (
                            <a
                              href={certificate.credential_url}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                              aria-label={`Open credential for ${certificate.title}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : null}
                        </div>
                        {certificate.images.length > 0 ? (
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            {certificate.images.map((src) => (
                              <img
                                key={src}
                                src={src}
                                alt=""
                                loading="lazy"
                                className="rounded border-2 border-border"
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="hog-card overflow-hidden">
                {certifications.map((item, i) => (
                  <div
                    key={item.title}
                    className={`flex items-center gap-4 p-4 ${
                      i < certifications.length - 1 ? "border-b-2 border-border/15" : ""
                    }`}
                  >
                    <span
                      aria-hidden
                      className="h-3 w-3 shrink-0 rounded-sm border-2 border-border"
                      style={{ background: `var(--${accentFor(i)})` }}
                    />
                    <span className="min-w-0 flex-1 text-[15px] text-foreground">{item.title}</span>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                      {item.issuer} · {item.year}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Block>

          {/* Principles --------------------------------------------------- */}
          <Block index={nextIndex()} label="How I work" title={["Four opinions."]}>
            <div className="grid gap-5 sm:grid-cols-2">
              {principles.map((principle, i) => (
                <Reveal key={principle.title} delay={i * 80}>
                  <article className="hog-card hog-card-hover flex h-full gap-4 p-5">
                    <span
                      aria-hidden
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-md border-2 border-border font-display text-base font-bold"
                      style={accentSurface(accentFor(i))}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-semibold text-foreground">
                        {principle.title}
                      </h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                        {principle.body}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </Block>

          {/* Close -------------------------------------------------------- */}
          <Reveal>
            <div className="mt-20 border-t-2 border-border/15 pt-12 text-center">
              <h2 className="display-md text-foreground">
                That's the whole story<span className="text-hog-red">.</span>
              </h2>
              <div className="mx-auto mt-3 w-48">
                <Squiggle tone="hog-red" />
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <HardLink href={`mailto:${site.email}`} variant="primary" size="lg">
                  <Mail className="h-4 w-4" />
                  Start a conversation
                </HardLink>
                <HardLink href={site.resumeUrl} download variant="secondary" size="lg">
                  <Download className="h-4 w-4" />
                  Download résumé
                </HardLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
