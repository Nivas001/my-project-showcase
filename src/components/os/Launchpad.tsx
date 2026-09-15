import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Brain, House, Search, Sparkles } from "lucide-react";
import { projectsQuery } from "@/lib/queries";
import { DOCK_APPS, NAV_PAGES, type AppSpec } from "@/lib/os-apps";
import { StackMark, type AppGlyph } from "./app-marks";
import { AppIcon } from "./AppIcon";

/** Pages with no dock app of their own still deserve their own mark. */
const PAGE_GLYPHS: Record<string, AppGlyph> = {
  "/": House,
  "/how-to-be-smarter-than-an-ai": Brain,
  "/surprise": Sparkles,
};

/* ==========================================================================
 * LAUNCHPAD
 *
 * Every destination on the site as one grid, over a blurred page.
 *
 * It reads NAV_PAGES and the live projects query — the same two sources the
 * ⌘K palette uses — so the two can't drift. Launchpad is a second *view* of the
 * index, not a second index.
 * ======================================================================== */

export function Launchpad({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data: projects } = useQuery({ ...projectsQuery, enabled: open });

  // Typing anywhere filters, and Escape closes — no need to focus the field.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reopening should not inherit the last search.
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const tiles = useMemo(() => {
    // Plain apps only. The widgets borrow routes for their click target — the
    // calendar points at /about, the clock at /contact — and would otherwise
    // win the lookup and put a clock face on the Contact tile.
    const appsByRoute = new Map<string, AppSpec>();
    for (const app of DOCK_APPS) {
      if (app.to_ && (!app.kind || app.kind === "app") && !appsByRoute.has(app.to_)) {
        appsByRoute.set(app.to_, app);
      }
    }

    const pages: AppSpec[] = NAV_PAGES.map((page) => {
      const match = appsByRoute.get(page.to);
      if (match) return { ...match, id: `page-${page.to}`, label: page.label };
      return {
        id: `page-${page.to}`,
        label: page.label,
        glyph: PAGE_GLYPHS[page.to] ?? House,
        from: "oklch(0.72 0.05 250)",
        to: "oklch(0.5 0.06 255)",
        to_: page.to,
      };
    });

    const projectTiles: AppSpec[] = (projects ?? []).map((project) => ({
      id: `project-${project.id}`,
      label: project.title,
      glyph: StackMark,
      from: "oklch(0.78 0.13 210)",
      to: "oklch(0.55 0.16 235)",
      to_: `/projects/${project.slug}`,
    }));

    return [...pages, ...projectTiles];
  }, [projects]);

  const needle = query.trim().toLowerCase();
  const visible = needle ? tiles.filter((t) => t.label.toLowerCase().includes(needle)) : tiles;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, backdropFilter: "blur(0px)" }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, backdropFilter: "blur(28px)" }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Launchpad"
          className="fixed inset-0 z-[60] hidden overflow-y-auto bg-background/55 lg:block"
          style={{ backdropFilter: "blur(28px) saturate(170%)" }}
        >
          <div
            className="mx-auto flex min-h-full max-w-5xl flex-col items-center px-8 py-20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="liquid-glass flex w-full max-w-sm items-center gap-2.5 rounded-full px-4 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                aria-label="Filter destinations"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            {visible.length === 0 ? (
              <p className="mt-20 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Nothing matches “{query}”
              </p>
            ) : (
              <div className="mt-14 grid w-full grid-cols-4 gap-x-6 gap-y-10 sm:grid-cols-5 lg:grid-cols-6">
                {visible.map((tile, i) => (
                  <motion.button
                    key={tile.id}
                    type="button"
                    initial={reduced ? false : { opacity: 0, scale: 0.86 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: reduced ? 0 : Math.min(i, 18) * 0.014,
                      type: "spring",
                      stiffness: 460,
                      damping: 32,
                    }}
                    onClick={() => {
                      onClose();
                      if (tile.to_) navigate({ to: tile.to_ });
                    }}
                    className="group flex flex-col items-center gap-2.5 rounded-xl p-2 outline-none focus-visible:bg-foreground/10"
                  >
                    <AppIcon
                      app={tile}
                      size={62}
                      className="transition-transform duration-200 group-hover:scale-[1.09]"
                    />
                    <span className="line-clamp-2 text-center text-[12px] leading-tight text-foreground">
                      {tile.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            <p className="mt-auto pt-16 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Esc to close
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
