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
    <div className="scanlines mx-auto max-w-3xl px-5 py-16 sm:py-24">
      <p className="mb-10 text-center font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground">
        // access: restricted
      </p>
      <h1 className="sr-only">Secret frame</h1>
      <SmashFrame />
    </div>
  );
}
