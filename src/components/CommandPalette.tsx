import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { projectsQuery } from "@/lib/queries";

const pages = [
  { label: "Home", to: "/" as const },
  { label: "Projects", to: "/projects" as const },
  { label: "About", to: "/about" as const },
  { label: "Fun", to: "/fun" as const },
  { label: "Contact", to: "/contact" as const },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: projects } = useQuery({ ...projectsQuery, enabled: open });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-sm border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground md:flex"
        aria-label="Open command palette"
      >
        <span>Search</span>
        <kbd className="rounded-sm border border-border px-1 py-0.5 text-[10px]">Ctrl K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Jump to a page or project…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem
                key={page.to}
                value={page.label}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: page.to });
                }}
              >
                {page.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Projects">
            {(projects ?? []).map((project) => (
              <CommandItem
                key={project.id}
                value={project.title}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/projects/$slug", params: { slug: project.slug } });
                }}
              >
                {project.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
