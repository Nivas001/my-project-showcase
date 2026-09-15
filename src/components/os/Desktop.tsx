import { useCallback, useState } from "react";
import type { Project } from "@/lib/projects";
import { DESKTOP_FILES, type WindowId } from "@/lib/os-apps";
import { Annotation, DoodleArrow } from "@/components/kit";
import { AppIcon, AppTarget } from "./AppIcon";
import { Window } from "./Window";
import {
  AboutWindow,
  CertificatesWindow,
  ChangelogWindow,
  ContactWindow,
  EducationWindow,
  ProjectsWindow,
  ReadmeWindow,
  ResumeWindow,
  StackWindow,
} from "./WindowContents";

const TITLES: Record<WindowId, { title: string; subtitle: string; width: number }> = {
  about: { title: "about-me.txt", subtitle: "TextEdit", width: 520 },
  resume: { title: "Résumé.pdf", subtitle: "Preview", width: 500 },
  projects: { title: "Projects", subtitle: "Finder", width: 620 },
  readme: { title: "read-me-first.rtf", subtitle: "TextEdit", width: 520 },
  changelog: { title: "changelog.log", subtitle: "Console", width: 560 },
  certificates: { title: "certificates", subtitle: "Finder", width: 520 },
  education: { title: "education.txt", subtitle: "TextEdit", width: 520 },
  stack: { title: "stack.app", subtitle: "About This Stack", width: 540 },
  contact: { title: "contact.card", subtitle: "Contacts", width: 440 },
};

/** Cascade windows so a second one never lands exactly on the first. */
const OFFSETS: Record<WindowId, { x: number; y: number }> = {
  readme: { x: -180, y: -40 },
  about: { x: -60, y: 10 },
  resume: { x: 90, y: -20 },
  projects: { x: 40, y: 60 },
  changelog: { x: -140, y: 70 },
  certificates: { x: 150, y: 40 },
  education: { x: -20, y: -70 },
  stack: { x: 110, y: -60 },
  contact: { x: -210, y: 20 },
};

/**
 * The desktop layer: files sitting on the wallpaper, and the windows they open.
 *
 * Large screens only — phones get the home screen in `MobileShell` instead.
 * Windows are non-modal on purpose: you can open several, drag them around and
 * still scroll the page underneath, which is the whole point of a desktop.
 */
export function Desktop({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState<WindowId[]>([]);
  const [focused, setFocused] = useState<WindowId | null>(null);

  const openWindow = useCallback((id: WindowId) => {
    setOpen((current) => (current.includes(id) ? current : [...current, id]));
    setFocused(id);
  }, []);

  const closeWindow = useCallback((id: WindowId) => {
    setOpen((current) => current.filter((item) => item !== id));
  }, []);

  const body = (id: WindowId) => {
    switch (id) {
      case "about":
        return <AboutWindow />;
      case "resume":
        return <ResumeWindow />;
      case "projects":
        return <ProjectsWindow projects={projects} />;
      case "readme":
        return <ReadmeWindow projects={projects} />;
      case "changelog":
        return <ChangelogWindow />;
      case "certificates":
        return <CertificatesWindow />;
      case "education":
        return <EducationWindow />;
      case "stack":
        return <StackWindow />;
      case "contact":
        return <ContactWindow />;
    }
  };

  return (
    <>
      {/* Files, stacked down the right edge exactly where macOS puts them. */}
      <div className="pointer-events-none absolute right-6 top-24 z-20 hidden flex-col items-end gap-1 lg:flex">
        {/* Two columns, filled top-to-bottom then right-to-left, the way macOS
            wraps a full desktop. One column of nine ran off the bottom of the
            screen and behind the dock. */}
        <div className="pointer-events-auto grid grid-flow-col grid-rows-5 gap-x-1 gap-y-1">
          {DESKTOP_FILES.map((file) => (
            <AppTarget
              key={file.id}
              app={file}
              onOpenWindow={openWindow}
              aria-label={`Open ${file.label}`}
              className="desktop-icon group flex w-24 flex-col items-center gap-1.5 rounded-lg p-2 text-center"
            >
              <AppIcon app={file} size={46} />
              <span className="desktop-icon-label rounded px-1.5 py-0.5 text-[11px] leading-tight text-foreground transition-colors">
                {file.label}
              </span>
            </AppTarget>
          ))}
        </div>

        {/* A nudge, in the margin. */}
        <div className="pointer-events-none mt-1 flex -translate-x-6 items-start gap-1">
          <DoodleArrow tone="hog-red" className="h-11 w-12 -scale-x-100 -scale-y-100" />
          <Annotation tone="hog-red" rotate={-6} className="pt-5 text-lg">
            open these
          </Annotation>
        </div>
      </div>

      {/* Windows. A non-modal layer that ignores pointer events where empty. */}
      {open.length > 0 ? (
        <div className="pointer-events-none fixed inset-0 z-30 hidden lg:block">
          <div className="relative mx-auto flex h-full max-w-[1600px] items-center justify-center">
            {open.map((id, i) => (
              <Window
                key={id}
                title={TITLES[id].title}
                subtitle={TITLES[id].subtitle}
                width={TITLES[id].width}
                initial={OFFSETS[id]}
                zIndex={focused === id ? 50 : 30 + i}
                onFocus={() => setFocused(id)}
                onClose={() => closeWindow(id)}
              >
                {body(id)}
              </Window>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
