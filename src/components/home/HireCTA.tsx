import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { LocalClock, StatusDot } from "@/components/kit";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useMagnetic } from "@/hooks/use-magnetic";
import { EASE, Eyebrow, FadeIn, RiseWords } from "./fx";

const LINKS = [
  { label: "GitHub", href: site.github },
  { label: "LinkedIn", href: site.linkedin },
  { label: "Résumé", href: site.resumeUrl, download: true },
  { label: "Phone", href: `tel:${site.phone.replace(/\s/g, "")}` },
] as const;

/**
 * The close. One question, one address, and the rest set small.
 */
export function HireCTA() {
  const email = useMagnetic<HTMLAnchorElement>({ strength: 0.12, radius: 80 });
  return (
    <section
      id="contact"
      data-act="noir"
      data-rail="Contact"
      className="act-noir relative scroll-mt-10"
    >
      <div className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
        <Eyebrow index="08">Contact</Eyebrow>

        <RiseWords
          text="Have something worth building?"
          className="mt-10 max-w-[24ch] text-balance font-display text-[clamp(1.9rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-foreground"
        />
        <FadeIn delay={0.1}>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            I&apos;m open to full-stack and Python roles, and to contract work. Tell me what
            you&apos;re making.
          </p>
        </FadeIn>

        <FadeIn delay={0.15} className="mt-14 sm:mt-20">
          <a
            ref={email}
            href={`mailto:${site.email}`}
            data-cursor="Write to me"
            className="group inline-flex max-w-full items-center gap-3 sm:gap-5"
          >
            <span className="link-sweep truncate font-display text-[clamp(1.5rem,5.2vw,4.25rem)] font-medium leading-[1.2] tracking-[-0.04em] text-foreground">
              {site.email}
            </span>
            <ArrowUpRight className="h-6 w-6 shrink-0 text-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:translate-x-1 sm:h-10 sm:w-10" />
          </a>
        </FadeIn>

        <FadeIn
          delay={0.25}
          className="mt-12 flex flex-col gap-8 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <ul className="flex flex-wrap gap-x-7 gap-y-3 text-[15px]">
            {LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  {...("download" in link ? { download: true } : {})}
                  {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="link-sweep text-foreground/85 transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <StatusDot />
              Replies within a day
            </span>
            <span aria-hidden className="text-border">
              /
            </span>
            <LocalClock timeZone={site.timezone} className="tabular-nums" />
          </p>
        </FadeIn>
      </div>

      <Wordmark />
    </section>
  );
}

const LETTERS = site.name.split("");

/**
 * The signature at the foot of the page: the first name, set as wide as the
 * screen, letters rising one after another as it arrives and drifting up a
 * touch as the page runs out. Decorative — the name is already in the hero.
 */
function Wordmark() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["18%", "0%"]);

  return (
    <div ref={ref} aria-hidden className="relative overflow-hidden px-3 sm:px-6">
      <motion.p
        style={{ y }}
        initial="out"
        whileInView="in"
        viewport={{ once: true, margin: "0px 0px -5% 0px" }}
        className="flex select-none justify-between font-display text-[22.5vw] font-semibold leading-[0.8] tracking-[-0.06em]"
      >
        {LETTERS.map((letter, i) => (
          // Padded out and pulled back by the same amount, so the glyphs' side
          // bearings fall inside the clipped, painted box instead of being cut.
          <span
            key={`${letter}-${i}`}
            className="-mx-[0.08em] inline-block overflow-hidden px-[0.08em] pb-[0.04em]"
          >
            <motion.span
              className="-mx-[0.08em] inline-block bg-gradient-to-b from-signature/40 to-signature/0 bg-clip-text px-[0.08em] text-transparent"
              variants={{
                out: { y: reduced ? "0%" : "100%" },
                in: { y: "0%", transition: { duration: 1.1, ease: EASE, delay: i * 0.06 } },
              }}
            >
              {letter}
            </motion.span>
          </span>
        ))}
      </motion.p>
    </div>
  );
}
