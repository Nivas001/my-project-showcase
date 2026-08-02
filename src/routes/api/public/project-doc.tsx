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
        const slug = new URL(request.url).searchParams.get("slug");
        if (!slug) return new Response("Missing slug", { status: 400 });

        const { createPublicServerClient } = await import("@/lib/projects.server");
        const supabase = createPublicServerClient();
        const { data: project } = await supabase
          .from("projects")
          .select("doc_path, title")
          .eq("slug", slug)
          .maybeSingle();

        if (!project?.doc_path) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: file, error } = await supabaseAdmin.storage
          .from(SCREENSHOT_BUCKET)
          .download(project.doc_path);
        if (error || !file) return new Response("Not found", { status: 404 });

        const name = project.doc_path.split("/").pop() ?? "documentation.pdf";
        return new Response(file.stream(), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${name}"`,
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
