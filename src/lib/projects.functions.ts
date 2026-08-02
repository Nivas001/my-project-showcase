import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PROJECT_COLUMNS, type Project } from "@/lib/projects";

export const listProjects = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient, signScreenshots } = await import("@/lib/projects.server");
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return signScreenshots((data ?? []) as unknown as Project[]);
});

export const getProjectBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { createPublicServerClient, signScreenshots } = await import("@/lib/projects.server");
    const supabase = createPublicServerClient();
    const { data: rows, error } = await supabase
      .from("projects")
      .select(PROJECT_COLUMNS)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);

    const all = await signScreenshots((rows ?? []) as unknown as Project[]);
    const index = all.findIndex((p) => p.slug === data.slug);
    if (index === -1) return null;
    return {
      project: all[index]!,
      prev: index > 0 ? { slug: all[index - 1]!.slug, title: all[index - 1]!.title } : null,
      next:
        index < all.length - 1
          ? { slug: all[index + 1]!.slug, title: all[index + 1]!.title }
          : null,
    };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data), userId: context.userId };
  });

export const saveProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { project: Project & { id?: string } }) => data)
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data.project;
    const payload = {
      ...fields,
      live_url: fields.live_url || null,
      github_url: fields.github_url || null,
      video_url: fields.video_url || null,
      doc_url: fields.doc_url || null,
      doc_path: fields.doc_path || null,
    };

    if (id) {
      const { error } = await context.supabase.from("projects").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }

    const { data: inserted, error } = await context.supabase
      .from("projects")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
