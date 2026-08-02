import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { SKILL_GROUP_COLUMNS, type SkillGroup } from "@/lib/skills";

export const listSkillGroups = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("@/lib/projects.server");
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("skill_groups")
    .select(SKILL_GROUP_COLUMNS)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SkillGroup[];
});

export const saveSkillGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { group: SkillGroup & { id?: string } }) => data)
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data.group;
    const payload = {
      name: fields.name,
      items: fields.items,
      sort_order: fields.sort_order,
    };

    if (id) {
      const { error } = await context.supabase.from("skill_groups").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }

    const { data: inserted, error } = await context.supabase
      .from("skill_groups")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const deleteSkillGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("skill_groups").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
