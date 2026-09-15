import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, Mail } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { shippingNow, site } from "@/lib/site";
import { CommandPalette } from "@/components/CommandPalette";
import { MenuBar } from "@/components/os/MenuBar";
import { Dock } from "@/components/os/Dock";
import { MobileDock, StatusBar } from "@/components/os/MobileShell";
import { HardLink, HardRouteLink, LocalClock, StatusDot } from "@/components/kit";
import { Toaster } from "@/components/ui/sonner";

const TITLE = "Srinivas M — Full-stack engineer, Flutter & applied NLP";
const DESCRIPTION =
  "Full-stack engineer in Pondicherry with three products live in production and a published Tamil NLP summarisation model. React, TanStack, Python, Flutter, PostgreSQL.";
const OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4869a48e-75b9-4dfa-b4a1-f5b15cc0b31b/id-preview-7e102b57--6307a852-b20a-4277-b229-dbceb744db18.lovable.app-1785679047358.png";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "author", content: "Srinivas M" },
      { name: "theme-color", content: "#141414" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Srinivas M" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Caveat:wght@500;600;700&family=Kalam:wght@400;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/* ==========================================================================
 * Act detection
 *
 * The header floats over the page, so it has to invert as the ground beneath
 * it changes. Every section declares `data-act="noir" | "hog"`; this probes a
 * point just under the header and reports whichever act is painted there.
 *
 * Last match wins on purpose: the homepage's act wipe layers a cream sheet
 * over a black field, and the sheet is later in DOM order.
 * ======================================================================== */

type Act = "noir" | "hog";

function useSectionAct(pathname: string): Act {
  const [act, setAct] = useState<Act>("noir");

  useEffect(() => {
    let frame = 0;
    const PROBE_Y = 36;

    const measure = () => {
      const sections = document.querySelectorAll<HTMLElement>("[data-act]");

      let covering: Act | null = null;
      let nextDown: Act | null = null;
      let nextDownGap = Infinity;

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.height <= 0) continue;
        const act: Act = section.dataset["act"] === "hog" ? "hog" : "noir";

        if (rect.top <= PROBE_Y && rect.bottom >= PROBE_Y) {
          // Last match wins: the homepage's act wipe layers a cream sheet over a
          // black field, and the sheet is later in DOM order.
          covering = act;
        } else if (rect.top > PROBE_Y && rect.top - PROBE_Y < nextDownGap) {
          nextDownGap = rect.top - PROBE_Y;
          nextDown = act;
        }
      }

      // Anchor jumps can park the probe in a gap — a wrapper that carries no act
      // of its own, such as the scroll-length behind the wipe. Fall forward to
      // whatever section is arriving rather than snapping back to the default.
      setAct(covering ?? nextDown ?? "noir");
    };

    // Two passes, a frame apart. Scroll-linked transforms (the act wipe's cream
    // sheet) are written in Motion's own rAF pass, which may land after ours —
    // so a single read taken right after an anchor jump that stops instantly
    // would see the previous frame's position and leave the header stale.
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        measure();
        frame = requestAnimationFrame(() => {
          frame = 0;
          measure();
        });
      });
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  return act;
}

/* ==========================================================================
 * OS chrome
 *
 * The site wears a desktop. On large screens that is a macOS menu bar and a
 * magnifying dock; on phones it is an iOS status bar and dock. Both read their
 * colour from whichever act is painted beneath them.
 *
 * `display: contents` on the wrapper means the act class supplies custom
 * properties without generating a box, so the fixed children still position
 * against the viewport.
 * ======================================================================== */

function OsChrome() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const act = useSectionAct(pathname);

  const openSearch = useCallback(() => {
    document.dispatchEvent(new CustomEvent("open-command-palette"));
  }, []);

  return (
    <div className={`act-${act} contents`}>
      <MenuBar onOpenSearch={openSearch} nowShipping={shippingNow} />
      <StatusBar />
      <Dock />
      <MobileDock />
    </div>
  );
}

/* ==========================================================================
 * Footer — always cream. It is the ground floor of every page.
 * ======================================================================== */

const FOOTER_COLUMNS = [
  {
    title: "Work",
    links: [
      { label: "All projects", to: "/projects" as const },
      { label: "Ani Bakes", to: "/projects/$slug" as const, params: { slug: "anibakes" } },
      {
        label: "AARRKKAA",
        to: "/projects/$slug" as const,
        params: { slug: "aarrkkaa-international" },
      },
      {
        label: "Tamil summariser",
        to: "/projects/$slug" as const,
        params: { slug: "tamil-ner-summarizer" },
      },
    ],
  },
  {
    title: "Me",
    links: [
      { label: "About", to: "/about" as const },
      { label: "Contact", to: "/contact" as const },
      { label: "Résumé", to: "/about" as const },
    ],
  },
  {
    title: "Detours",
    links: [
      { label: "The arcade", to: "/fun" as const },
      { label: "Horror stories", to: "/horror" as const },
      { label: "Beat an AI", to: "/how-to-be-smarter-than-an-ai" as const },
      { label: "???", to: "/surprise" as const },
    ],
  },
];

function SiteFooter() {
  return (
    <footer data-act="hog" className="act-hog relative border-t-[3px] border-ink">
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="display-sm text-foreground">
              {site.fullName}
              <span className="text-hog-red">.</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {site.tagline}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <HardLink
                href={site.github}
                target="_blank"
                rel="noreferrer"
                variant="secondary"
                size="sm"
              >
                GitHub
              </HardLink>
              <HardLink
                href={site.linkedin}
                target="_blank"
                rel="noreferrer"
                variant="secondary"
                size="sm"
              >
                LinkedIn
              </HardLink>
              <HardLink href={`mailto:${site.email}`} variant="secondary" size="sm">
                Email
              </HardLink>
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="micro text-muted-foreground">{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link
                      to={link.to}
                      {...("params" in link ? { params: link.params } : {})}
                      className="nav-link text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t-2 border-border/15 pt-6 font-mono text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {site.fullName} — {site.location}
          </span>
          <span className="flex flex-wrap items-center gap-5">
            <span className="inline-flex items-center gap-2">
              <StatusDot />
              Available for work
            </span>
            <span className="hidden sm:inline">Built with TanStack Start</span>
            <Link to="/auth" className="transition-colors hover:text-foreground">
              Admin
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ==========================================================================
 * Error states
 * ======================================================================== */

function NotFoundComponent() {
  return (
    <section
      data-act="noir"
      className="act-noir grain flex min-h-svh flex-col items-center justify-center px-5 text-center"
    >
      <div aria-hidden className="hairline-grid pointer-events-none absolute inset-0 opacity-40" />
      <p className="micro relative text-hog-red">Error 404</p>
      <h1 className="display-xl relative mt-4 text-foreground">
        Nothing here<span className="text-hog-red">.</span>
      </h1>
      <p className="relative mt-5 max-w-sm text-base leading-relaxed text-muted-foreground">
        That route doesn't exist — or it did once and doesn't any more.
      </p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <HardRouteLink to="/projects" variant="invert" size="md">
          Browse the work
        </HardRouteLink>
        <HardRouteLink to="/" variant="ghost" size="md">
          Back home
        </HardRouteLink>
      </div>
    </section>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const retry = useCallback(() => {
    router.invalidate();
    reset();
  }, [router, reset]);

  return (
    <section
      data-act="noir"
      className="act-noir grain flex min-h-svh flex-col items-center justify-center px-5 text-center"
    >
      <div aria-hidden className="hairline-grid pointer-events-none absolute inset-0 opacity-40" />
      <p className="micro relative text-hog-red">Something broke</p>
      <h1 className="display-lg relative mt-4 max-w-2xl text-foreground">
        This page didn't load<span className="text-hog-red">.</span>
      </h1>
      <p className="relative mt-5 max-w-sm text-base leading-relaxed text-muted-foreground">
        Not your fault. Try again, or head somewhere that works.
      </p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={retry}
          className="hog-press inline-flex items-center gap-2 rounded-md border-2 border-foreground bg-foreground px-5 py-2.5 text-sm font-medium text-background hard-shadow"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-md border-2 border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Go home
        </a>
      </div>
    </section>
  );
}

/* ==========================================================================
 * Root
 * ======================================================================== */

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-svh flex-col">
        <OsChrome />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <main key={pathname} className="route-fade flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>

      <CommandPalette trigger={false} />
      <Toaster />
    </QueryClientProvider>
  );
}
