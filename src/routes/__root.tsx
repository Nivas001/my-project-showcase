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
import { useCallback, useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { site } from "@/lib/site";
import { CommandPalette } from "@/components/CommandPalette";
import { SiteHeader } from "@/components/SiteHeader";
import { Cursor, ScrollProgress } from "@/components/Cursor";
import { HardRouteLink } from "@/components/kit";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider, THEME_BOOT_SCRIPT } from "@/lib/os/theme";
import { WindowManagerProvider } from "@/components/os/WindowManager";
import { FunFx } from "@/components/os/FunFx";

const TITLE = "Srinivas M — Website & Mobile App Developer, Pondicherry";
const DESCRIPTION =
  "Full-stack developer in Pondicherry building websites and mobile apps with React, Next.js, Flutter and Supabase. Five live products and a published Tamil NLP model. Open to hire.";
/* Served from public/, not a preview-deployment screenshot on someone else's
   bucket. Every LinkedIn, WhatsApp and Slack unfurl of the site loads this, so
   it has to outlive whatever host built it. Absolute URL: crawlers do not
   resolve relative og:image paths. */
const OG_IMAGE = `${site.url}/og.png`;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "author", content: "Srinivas M" },
      { name: "theme-color", content: "#0d0e10" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Srinivas M" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Srinivas M — Full-Stack Engineer. nivas.tech" },
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
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Caveat:wght@500;600;700&family=Kalam:wght@400;700&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&family=Noto+Sans+Tamil:wght@400;500;700&family=Press+Start+2P&family=Special+Elite&family=Ubuntu:wght@400;500;700&display=swap",
      },
    ],
    /* Applies the stored skin and light/dark mode to <html> before the first
       paint. Without it, every navigation shows one frame of the default
       theme to anybody who picked another one. */
    scripts: [{ children: THEME_BOOT_SCRIPT }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    /*
     * suppressHydrationWarning, and no theme attributes in the JSX.
     *
     * THEME_BOOT_SCRIPT rewrites this element's data-skin, data-mode and the
     * `dark` class before React hydrates, which is the whole point of it —
     * otherwise a visitor who chose Kali sees one frame of macOS on every
     * navigation. React then compares what it rendered against what the script
     * left behind and reports a mismatch on <html> every time.
     *
     * Rendering the attributes here does not help; it only changes which value
     * loses. Letting the script own them outright and telling React not to
     * diff this one element is the standard answer, and it is scoped to <html>
     * alone — nothing inside it is exempted.
     */
    <html lang="en" className="dark" suppressHydrationWarning>
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
 * Footer — one quiet line. Everything worth reaching is in the header or the
 * homepage's contact section; this only has to say whose site it is.
 * ======================================================================== */

const FOOTER_LINKS = [
  { label: "Horror stories", to: "/horror" },
  { label: "Playground", to: "/apps" },
  { label: "Beat an AI", to: "/how-to-be-smarter-than-an-ai" },
  { label: "Admin", to: "/auth" },
] as const;

function SiteFooter() {
  return (
    <footer data-act="noir" className="act-noir relative border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          © {new Date().getFullYear()} {site.fullName}
          <span className="mx-2 text-border">/</span>
          {site.location}
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
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
      className="act-noir flex min-h-svh flex-col items-center justify-center px-5 text-center"
    >
      <p className="micro relative text-accent">Error 404</p>
      <h1 className="display-xl relative mt-4 text-foreground">
        Nothing here<span className="text-accent">.</span>
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
      className="act-noir flex min-h-svh flex-col items-center justify-center px-5 text-center"
    >
      <p className="micro relative text-accent">Something broke</p>
      <h1 className="display-lg relative mt-4 max-w-2xl text-foreground">
        This page didn't load<span className="text-accent">.</span>
      </h1>
      <p className="relative mt-5 max-w-sm text-base leading-relaxed text-muted-foreground">
        Not your fault. Try again, or head somewhere that works.
      </p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={retry}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
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
      {/* ThemeProvider owns light/dark mode. WindowManager still owns the app
          windows, which now live only on the /apps playground rather than on
          a desktop behind every page. Both sit above the router outlet so
          neither is torn down by a navigation. */}
      <ThemeProvider>
        <WindowManagerProvider>
          <div className="flex min-h-svh flex-col">
            <ScrollProgress />
            <SiteHeader />
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <main key={pathname} className="route-fade flex-1">
              <Outlet />
            </main>
            <SiteFooter />
          </div>

          <CommandPalette trigger={false} />
          <Cursor />
          <FunFx />
          <Toaster />
        </WindowManagerProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
