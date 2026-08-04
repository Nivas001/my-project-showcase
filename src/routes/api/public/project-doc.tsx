import { createFileRoute } from "@tanstack/react-router";
import { SCREENSHOT_BUCKET } from "@/lib/projects";

/**
 * Streams a project's uploaded documentation PDF with an inline content type so
 * browsers render it inside the on-page reader instead of downloading it.
 */
export const Route = createFileRoute("/api/public/project-doc")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const slug = params.get("slug");
        const kind = params.get("kind") === "slides" ? "slides" : "doc";
        if (!slug) return new Response("Missing slug", { status: 400 });

        const { createPublicServerClient } = await import("@/lib/projects.server");
        const supabase = createPublicServerClient();
        const { data: project } = await supabase
          .from("projects")
          .select("doc_path, slides_path, title")
          .eq("slug", slug)
          .maybeSingle();

        const storagePath = kind === "slides" ? project?.slides_path : project?.doc_path;
        if (!storagePath) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: file, error } = await supabaseAdmin.storage
          .from(SCREENSHOT_BUCKET)
          .download(storagePath);
        if (error || !file) return new Response("Not found", { status: 404 });

        const name = storagePath.split("/").pop() ?? "documentation.pdf";
        const ext = (name.split(".").pop() ?? "pdf").toLowerCase();
        const types: Record<string, string> = {
          pdf: "application/pdf",
          ppt: "application/vnd.ms-powerpoint",
          pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          odp: "application/vnd.oasis.opendocument.presentation",
          key: "application/octet-stream",
        };
        return new Response(file.stream(), {
          headers: {
            "Content-Type": types[ext] ?? "application/octet-stream",
            "Content-Disposition": `inline; filename="${name}"`,
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
