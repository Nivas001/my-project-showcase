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
import { useEffect, useState, type ReactNode } from "react";


import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { site } from "@/lib/site";
import { CommandPalette } from "@/components/CommandPalette";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-mono text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That route doesn&apos;t exist. Try the projects index instead.
        </p>
        <div className="mt-6">
          <Link
            to="/projects"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse projects
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">This page didn&apos;t load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-sm border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/10"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Srinivas M — Python, Full Stack & Flutter Developer" },
      {
        name: "description",
        content:
          "MCA graduate building NLP research, React web apps and Flutter mobile products. Watch the video resume, browse live projects and open-source repos.",
      },
      { name: "author", content: "Srinivas" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Srinivas M — Python, Full Stack & Flutter Developer" },
      { name: "twitter:title", content: "Srinivas M — Python, Full Stack & Flutter Developer" },
      { property: "og:description", content: "MCA graduate building NLP research, React web apps and Flutter mobile products. Watch the video resume, browse live projects and open-source repos." },
      { name: "twitter:description", content: "MCA graduate building NLP research, React web apps and Flutter mobile products. Watch the video resume, browse live projects and open-source repos." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4869a48e-75b9-4dfa-b4a1-f5b15cc0b31b/id-preview-7e102b57--6307a852-b20a-4277-b229-dbceb744db18.lovable.app-1785679047358.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4869a48e-75b9-4dfa-b4a1-f5b15cc0b31b/id-preview-7e102b57--6307a852-b20a-4277-b229-dbceb744db18.lovable.app-1785679047358.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap",
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

const navLinks = [
  { to: "/" as const, label: "home" },
  { to: "/projects" as const, label: "projects" },
  { to: "/about" as const, label: "about" },
  { to: "/fun" as const, label: "fun" },
  { to: "/contact" as const, label: "contact" },
];

function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-background/80 backdrop-blur transition-[border-color,box-shadow,background-color] duration-300 ${
        scrolled
          ? "border-primary/40 bg-background/95 shadow-[0_8px_30px_-18px_var(--glow)]"
          : "border-border/70"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="group flex items-center gap-2 font-mono text-sm">
          <span className="text-primary">$</span>
          <span className="font-semibold tracking-tight">srinivas</span>
          <span className="inline-block h-3.5 w-1.5 animate-pulse bg-accent align-middle" />
        </Link>

        <nav className="flex items-center gap-1 font-mono text-xs sm:gap-3 sm:text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className="nav-link rounded-sm px-2 py-1 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "nav-link-active text-accent" }}
            >
              {link.label}
            </Link>
          ))}
          <CommandPalette />
        </nav>
      </div>
    </header>
  );
}


function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Srinivas — {site.location}</span>
        <span className="flex flex-wrap items-center gap-4">
          <Link
            to="/surprise"
            title="something is sealed behind a frame…"
            className="text-muted-foreground/40 transition-colors hover:text-accent"
          >
            {"// ???"}
          </Link>
          <a href={`mailto:${site.email}`} className="hover:text-accent">
            {site.email}
          </a>
          <Link to="/auth" className="hover:text-accent">
            admin
          </Link>
        </span>
      </div>
    </footer>
  );
}

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
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <main key={pathname} className="route-fade flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>

      <Toaster />
    </QueryClientProvider>
  );
}
