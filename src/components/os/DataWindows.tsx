import { useQuery } from "@tanstack/react-query";
import { projectsQuery } from "@/lib/queries";
import { ProjectsWindow, ReadmeWindow } from "./WindowContents";

/**
 * The two document windows that need the project list.
 *
 * The window manager renders every app the same way — no props — so the two
 * that want data fetch it themselves. React Query is already holding this list
 * for the page underneath, so in practice these read straight from the cache
 * and never produce a loading state at all.
 */

function Waiting({ label }: { label: string }) {
  return (
    <div className="grid h-40 place-items-center">
      <span className="micro animate-pulse text-muted-foreground">{label}</span>
    </div>
  );
}

export function ProjectsFinder() {
  const { data } = useQuery(projectsQuery);
  if (!data) return <Waiting label="Reading the folder…" />;
  return <ProjectsWindow projects={data} />;
}

export function ReadmeDoc() {
  const { data } = useQuery(projectsQuery);
  if (!data) return <Waiting label="Opening…" />;
  return <ReadmeWindow projects={data} />;
}
