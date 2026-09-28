import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Moon, Search, Sun } from "lucide-react";
import { site } from "@/lib/site";
import { useTheme } from "@/lib/os/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Work", to: "/projects" },
  { label: "About", to: "/about" },
  { label: "Arcade", to: "/fun" },
  { label: "Contact", to: "/contact" },
] as const;

const MOBILE_EXTRA = [
  { label: "Horror stories", to: "/horror" },
  { label: "Playground", to: "/apps" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The only chrome on the site. It sits clear at the top of a page, gains a
 * ground once content passes beneath it, and steps out of the way while the
 * visitor is reading downward — back the moment they scroll up.
 */
export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { resolved, setMode } = useTheme();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        setScrolled(y > 12);
        // A small dead zone keeps trackpad jitter from flickering the bar.
        if (Math.abs(y - last) > 6) {
          setHidden(y > last && y > 240);
          last = y;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close the sheet on navigation, and lock the page behind it while open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const openSearch = () => document.dispatchEvent(new CustomEvent("open-command-palette"));
  const toggleMode = () => setMode(resolved === "dark" ? "light" : "dark");
  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <>
      <header
        className={cn(
          "act-noir fixed inset-x-0 top-0 z-50 border-b transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled || open
            ? "border-border bg-background/85 backdrop-blur-md"
            : "border-transparent bg-transparent",
          hidden && !open ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link
            to="/"
            className="text-[15px] font-semibold tracking-[-0.02em] text-foreground"
            aria-label={`${site.fullName} — home`}
          >
            {site.fullName}
            <span className="text-accent">.</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "text-sm transition-colors duration-300",
                  isActive(item.to)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search the site"
              className="hidden h-9 items-center gap-2 rounded-full px-3 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              <Search className="h-4 w-4" />
              <kbd className="font-mono text-[10px] tracking-wider">⌘K</kbd>
            </button>
            <button
              type="button"
              onClick={toggleMode}
              aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              {resolved === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative grid h-9 w-9 place-items-center rounded-full text-foreground md:hidden"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute h-px w-4 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  open ? "rotate-45" : "-translate-y-[3px]",
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "absolute h-px w-4 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  open ? "-rotate-45" : "translate-y-[3px]",
                )}
              />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            className="act-noir fixed inset-0 z-40 flex flex-col bg-background px-5 pb-10 pt-24 md:hidden"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <nav aria-label="Mobile" className="flex flex-1 flex-col">
              {[{ label: "Home", to: "/" } as const, ...NAV, ...MOBILE_EXTRA].map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.05 + i * 0.04 }}
                >
                  <Link
                    to={item.to}
                    className={cn(
                      "block border-b border-border py-4 font-display text-[1.75rem] font-medium tracking-[-0.03em]",
                      (item.to === "/" ? pathname === "/" : isActive(item.to))
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.a
              href={`mailto:${site.email}`}
              className="mt-8 font-mono text-xs text-muted-foreground"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {site.email}
            </motion.a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
