import { createFileRoute } from "@tanstack/react-router";
import { SCREENSHOT_BUCKET } from "@/lib/projects";

const TYPES: Record<string, string> = {
  pdf: "application/pdf",
  md: "text/markdown; charset=utf-8",
  markdown: "text/markdown; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odp: "application/vnd.oasis.opendocument.presentation",
  key: "application/octet-stream",
};

/**
 * Serves a project's uploaded documentation / slide deck under a real file
 * extension (…/slug/slides/deck.pptx). Office Online and Google's viewer both
 * refuse URLs without a recognisable file extension, so the query-string proxy
 * cannot be used for .pptx embeds.
 */
export const Route = createFileRoute("/api/public/project-file/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const segments = (params._splat ?? "").split("/").filter(Boolean);
        const [slug, rawKind] = segments;
        if (!slug) return new Response("Missing slug", { status: 400 });
        const kind = rawKind === "slides" ? "slides" : "doc";

        const { createPublicServerClient } = await import("@/lib/projects.server");
        const supabase = createPublicServerClient();
        const { data: project } = await supabase
          .from("projects")
          .select("doc_path, slides_path")
          .eq("slug", slug)
          .maybeSingle();

        const storagePath = kind === "slides" ? project?.slides_path : project?.doc_path;
        if (!storagePath) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: file, error } = await supabaseAdmin.storage
          .from(SCREENSHOT_BUCKET)
          .download(storagePath);
        if (error || !file) return new Response("Not found", { status: 404 });

        const name = storagePath.split("/").pop() ?? "file.pdf";
        const ext = (name.split(".").pop() ?? "pdf").toLowerCase();
        return new Response(file.stream(), {
          headers: {
            "Content-Type": TYPES[ext] ?? "application/octet-stream",
            "Content-Disposition": `inline; filename="${name}"`,
            "Cache-Control": "public, max-age=300",
            // Remote viewers (Office Online / Google) fetch this cross-origin.
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
