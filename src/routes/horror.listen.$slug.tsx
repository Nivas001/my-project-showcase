import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { canonical } from "@/lib/site";
import { getVoiceMeta, loadVoiceStory } from "@/content/horror/voice";
import type { VoiceStory } from "@/lib/horror/voice";
import { VoiceTheatre } from "@/components/horror/VoiceTheatre";

/**
 * One narrated story.
 *
 * The loader resolves METADATA ONLY, and the script is fetched in the component
 * after mount. That split is deliberate and it is the same lesson the branching
 * reader learned: a TanStack Start route splits its component but not its
 * loader, so anything the loader touches lands in the bundle that is never
 * split. Resolving the script here would put ninety kilobytes of horror prose
 * into the first paint of every page on the site.
 */
export const Route = createFileRoute("/horror/listen/$slug")({
  loader: ({ params }) => {
    const meta = getVoiceMeta(params.slug);
    if (!meta) throw notFound();
    return meta;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const title = `${loaderData.title} — narrated horror`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.standfirst },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.standfirst },
        { property: "og:type", content: "article" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: loaderData.standfirst },
      ],
      links: [canonical(`/horror/listen/${loaderData.slug}`)],
    };
  },
  component: Listen,
});

function Listen() {
  const meta = Route.useLoaderData();
  const [story, setStory] = useState<VoiceStory | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    setStory(null);
    setFailed(false);
    loadVoiceStory(meta.slug)
      .then((loaded) => {
        if (live) setStory(loaded);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [meta.slug]);

  return (
    <main data-act="noir" className="act-noir grain relative min-h-svh overflow-hidden">
      <div aria-hidden className="hairline-grid pointer-events-none absolute inset-0 opacity-25" />

      <Link
        to="/horror"
        className="absolute left-4 top-20 z-30 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground backdrop-blur transition-colors hover:border-foreground/50 hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Library
      </Link>

      <div className="relative z-10">
        {story ? (
          <VoiceTheatre story={story} />
        ) : failed ? (
          <div className="mx-auto max-w-md px-5 py-32 text-center">
            <p className="font-story text-xl text-foreground">This one will not load.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Which is either a network problem or the story not wanting to be heard. Reload, and if
              it happens again it is the first one.
            </p>
            <Link
              to="/horror"
              className="mt-6 inline-block rounded-full border border-border px-5 py-2 text-sm text-foreground transition-colors hover:bg-foreground/10"
            >
              Back to the library
            </Link>
          </div>
        ) : (
          <div className="grid min-h-svh place-items-center">
            <p className="micro animate-pulse text-muted-foreground">Cueing the tape…</p>
          </div>
        )}
      </div>
    </main>
  );
}
