import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { EXPERIENCE_COLUMNS, type Experience } from "@/lib/experiences";

export const listExperiences = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("@/lib/projects.server");
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("experiences")
    .select(EXPERIENCE_COLUMNS)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Experience[];
});

export const saveExperience = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { experience: Experience & { id?: string } }) => data)
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data.experience;
    const payload = {
      ...fields,
      company_url: fields.company_url || null,
      end_date: fields.is_current ? "" : fields.end_date,
    };

    if (id) {
      const { error } = await context.supabase.from("experiences").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }

    const { data: inserted, error } = await context.supabase
      .from("experiences")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const deleteExperience = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("experiences").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
