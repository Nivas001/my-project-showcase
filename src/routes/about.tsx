import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect, useState } from "react";
import { Download, ExternalLink, Mail, Rocket, Layers, Cog, LayoutDashboard } from "lucide-react";
import {
  site,
  skills,
  education,
  certifications,
  principles,
  toEmbedUrl,
  canonical,
} from "@/lib/site";
import { certificatesQuery, skillGroupsQuery, experiencesQuery } from "@/lib/queries";
import { experiencePeriod } from "@/lib/experiences";
import { accentFor, accentSurface } from "@/lib/accents";
import {
  BrowserFrame,
  CheckMark,
  HandNote,
  HardLink,
  Highlight,
  Marked,
  SectionLabel,
  SplitLines,
  Squiggle,
  StarMark,
  StickyNote,
  TiltCard,
} from "@/components/kit";
import { Reveal } from "@/components/Reveal";
import { AboutHero } from "@/components/about/AboutHero";

const TITLE = "About — Srinivas";
const DESCRIPTION =
  "Srinivas: full-stack engineer in Pondicherry. Background, stack, education and certifications, plus a video introduction.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
    links: [canonical("/about")],
  }),
  component: AboutPage,
});

const STATS = [
  { value: "5", label: "Products live", accent: "hog-red" },
  { value: "8.79", label: "GPA / 10", accent: "hog-blue" },
  { value: "4+", label: "Years building", accent: "hog-yellow" },
  { value: "12+", label: "Tech in prod", accent: "hog-green" },
] as const;

const PRINCIPLE_ICONS = [Rocket, Layers, Cog, LayoutDashboard] as const;

/** Animated counter that counts up when it first enters the viewport. */
function AnimCounter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState("0");
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    const suffix = value.replace(/[0-9.]/g, "");
    if (Number.isNaN(num)) {
      setDisplay(value);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started.current) return;
        started.current = true;
        const dur = 900;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          const cur = (num * ease).toFixed(value.includes(".") ? 2 : 0);
          setDisplay(cur + suffix);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/** Skill pill that wiggles into view. */
function SkillPill({ item, delay }: { item: string; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className="rounded border border-border/25 bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground/85 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {item}
    </span>
  );
}

/** Labelled section on the cream surface. */
function Block({
  index,
  label,
  title,
  lede,
  note,
  children,
}: {
  index: string;
  label: string;
  title?: readonly string[];
  lede?: string;
  /** Handwritten aside pinned beside the section label. */
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 first:mt-0">
      <Reveal>
        <div className="flex flex-wrap items-center gap-4">
          <SectionLabel index={index} rule={!note}>
            {label}
          </SectionLabel>
          {note ? (
            <HandNote tone="hog-blue" rotate={-4} size="sm">
              {note}
            </HandNote>
          ) : null}
        </div>
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
      <AboutHero />

      <section data-act="hog" className="act-hog relative border-t-[3px] border-ink">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />

        {/* Stats strip --------------------------------------------------- */}
        <div className="relative border-b-2 border-border/20">
          <p className="pointer-events-none absolute -top-4 left-1/2 z-10 hidden -translate-x-1/2 lg:block">
            <HandNote tone="hog-red" rotate={-2} size="sm">
              the numbers, checkable
            </HandNote>
          </p>
          <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x-2 divide-y-2 divide-border/20 sm:grid-cols-4 sm:divide-y-0">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 px-6 py-8">
                <span className="font-display text-4xl font-black tabular-nums text-foreground sm:text-5xl">
                  <AnimCounter value={stat.value} />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </span>
                <span
                  className="mt-1.5 h-1 w-8 rounded-full"
                  style={{ background: `var(--${stat.accent})` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          {/* Bio ---------------------------------------------------------- */}
          <Block
            index={nextIndex()}
            label="Who I am"
            title={["Hello — I'm Srinivas."]}
            note="the unedited bit"
          >
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
              <div className="min-w-0 space-y-5">
                <p className="text-lg leading-relaxed text-foreground">
                  I build{" "}
                  <Highlight tone="hog-yellow">
                    <span className="font-semibold">whole products</span>
                  </Highlight>
                  , not slices of them — and I would rather{" "}
                  <Marked kind="underline" tone="hog-red" delay={400}>
                    own the hard parts
                  </Marked>{" "}
                  than hand them off.
                </p>
                {site.bio.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className="text-[15px] leading-relaxed text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
                <StickyNote tone="hog-yellow" rotate={-1.5} className="max-w-sm">
                  If the person who owns the product can&apos;t change it without calling me, I
                  haven&apos;t finished the job.
                </StickyNote>
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
                  <div className="absolute -top-10 right-4 hidden lg:block">
                    <HandNote tone="hog-blue" rotate={-6} arrow="down" arrowClassName="h-9 w-7">
                      ~90 seconds, promise
                    </HandNote>
                  </div>

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
                          title="Video introduction from Srinivas"
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

          {/* Experience --------------------------------------------------- */}
          {storedExperiences.length > 0 ? (
            <Block
              index={nextIndex()}
              label="Experience"
              title={["Where I've worked."]}
              note="real rooms, real deadlines"
            >
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
            note="honest about the depth"
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
                    {group.items.map((item, ii) => (
                      <SkillPill key={item} item={item} delay={gi * 60 + ii * 40} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Block>

          {/* Education ---------------------------------------------------- */}
          <Block
            index={nextIndex()}
            label="Education"
            title={["Where I learned it."]}
            note="and where I didn't"
          >
            <div className="relative pl-6">
              {/* vertical rail */}
              <span aria-hidden className="absolute bottom-3 left-[7px] top-3 w-0.5 bg-border/20" />
              <div className="space-y-5">
                {education.map((entry, i) => (
                  <Reveal key={entry.degree} delay={i * 80}>
                    <div className="relative">
                      <span
                        aria-hidden
                        className="absolute -left-6 top-5 h-3.5 w-3.5 rounded-full border-2 border-border"
                        style={{ background: `var(--${accentFor(i)})` }}
                      />
                      <article className="hog-card p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-[15px] font-semibold text-foreground">
                              {entry.degree}
                            </h3>
                            <p className="mt-0.5 text-sm text-muted-foreground">{entry.school}</p>
                          </div>
                          <div className="shrink-0 sm:text-right">
                            <p className="font-mono text-[11px] text-muted-foreground">
                              {entry.period}
                            </p>
                            <p className="mt-0.5 font-mono text-sm font-bold text-foreground">
                              {entry.score}
                            </p>
                          </div>
                        </div>
                        {entry.note ? (
                          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                            {entry.note}
                          </p>
                        ) : null}
                      </article>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Block>

          {/* Certifications ----------------------------------------------- */}
          <Block
            index={nextIndex()}
            label="Certifications"
            title={["Paper trail."]}
            note="proof, not personality"
          >
            {storedCertificates.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {storedCertificates.map((certificate, i) => (
                  <Reveal key={certificate.id} delay={i * 80}>
                    <TiltCard max={5} lift={8} className="h-full">
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
                    </TiltCard>
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
                    <CheckMark tone={accentFor(i)} className="h-4 w-5 shrink-0" />
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
          <Block
            index={nextIndex()}
            label="How I work"
            title={["Four opinions."]}
            note="argue with me"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              {principles.map((principle, i) => {
                const Icon = PRINCIPLE_ICONS[i];
                return (
                  <Reveal key={principle.title} delay={i * 80}>
                    <article className="hog-card hog-card-hover group flex h-full gap-4 p-5">
                      <span
                        aria-hidden
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-md border-2 border-border transition-transform duration-200 group-hover:scale-110"
                        style={accentSurface(accentFor(i))}
                      >
                        {Icon ? (
                          <Icon className="h-4 w-4" />
                        ) : (
                          <span className="font-display text-base font-bold">{i + 1}</span>
                        )}
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
                );
              })}
            </div>
          </Block>

          {/* Close -------------------------------------------------------- */}
          <Reveal>
            <div className="mt-20 border-t-2 border-border/15 pt-12 text-center">
              <p className="mb-4 flex items-center justify-center gap-2">
                <StarMark tone="hog-yellow" className="h-4 w-4" />
                <HandNote tone="hog-yellow" rotate={-2} size="sm">
                  you made it to the end
                </HandNote>
                <StarMark tone="hog-yellow" className="h-4 w-4" delay={200} />
              </p>
              <h2 className="hero-md text-foreground">
                That&apos;s the whole story<span className="text-hog-red">.</span>
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
