import { createFileRoute } from "@tanstack/react-router";
import { SmashFrame } from "@/components/SmashFrame";

export const Route = createFileRoute("/surprise")({
  head: () => ({
    meta: [
      { title: "…" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Nothing to see here." },
    ],
  }),
  component: Surprise,
});

function Surprise() {
  return (
    <section
      data-act="noir"
      className="act-noir grain scanlines relative min-h-svh overflow-hidden"
    >
      <div aria-hidden className="hairline-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-3xl px-5 py-28 sm:py-32">
        <p className="micro mb-10 text-center text-muted-foreground">Access: restricted</p>
        <h1 className="sr-only">Secret frame</h1>
        <SmashFrame />
      </div>
    </section>
  );
}
