import { useEffect, useState } from "react";

/**
 * A quiet index down the right edge of the homepage on wide screens: one tick
 * per section, the current one drawn long in the accent. Hovering a tick names
 * it (labels stay hidden otherwise, so they never sit on top of content);
 * clicking goes there. It reads `data-rail` off the sections, so adding a section to
 * the page adds it here.
 */
export function SectionRail() {
  const [sections, setSections] = useState<{ el: HTMLElement; label: string }[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-rail]")];
    setSections(els.map((el) => ({ el, label: el.dataset["rail"] ?? "" })));

    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let index = 0;
      els.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= line) index = i;
      });
      setActive(index);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="Sections"
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex"
    >
      {sections.map((section, i) => {
        const on = i === active;
        return (
          <button
            key={section.label}
            type="button"
            onClick={() => section.el.scrollIntoView({ behavior: "smooth", block: "start" })}
            aria-label={`Go to ${section.label}`}
            aria-current={on ? "true" : undefined}
            className="group flex h-4 items-center gap-3"
          >
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.16em] transition-all duration-300 ${
                on
                  ? "translate-x-1 text-foreground opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  : "translate-x-1 text-muted-foreground opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
              }`}
            >
              {section.label}
            </span>
            <span
              className={`block h-px transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                on
                  ? "w-8 bg-accent"
                  : "w-3 bg-muted-foreground/50 group-hover:w-5 group-hover:bg-foreground"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
