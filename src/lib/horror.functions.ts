import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { StoryStat } from "@/lib/horror/types";

export const getStoryStats = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });

  const { data, error } = await supabase
    .from("horror_runs")
    .select("story, ending, outcome")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) throw new Error(error.message);

  const map = new Map<string, StoryStat>();
  for (const row of data ?? []) {
    const k = `${row.story}::${row.ending}`;
    const existing = map.get(k);
    if (existing) existing.count += 1;
    else map.set(k, { story: row.story, ending: row.ending, outcome: row.outcome, count: 1 });
  }
  return [...map.values()];
});

export const recordRun = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      story: string;
      ending: string;
      outcome: string;
      nickname: string;
      choices: string[];
      durationSeconds: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    const { STORIES } = await import("@/content/horror");
    const story = STORIES.find((s) => s.slug === data.story);
    if (!story) throw new Error("Unknown story.");
    if (!/^[a-z0-9-]{1,40}$/.test(data.ending)) throw new Error("Unknown ending.");
    if (!["survived", "doomed", "worst"].includes(data.outcome)) throw new Error("Unknown outcome.");

    const nickname = data.nickname.trim().slice(0, 20).replace(/[^\p{L}\p{N}_\- ]/gu, "") || "anonymous";
    const choices = (Array.isArray(data.choices) ? data.choices : []).slice(0, 20).map((c) => String(c).slice(0, 60));
    const duration = Math.max(0, Math.min(7200, Math.floor(Number(data.durationSeconds) || 0)));

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("horror_runs").insert({
      story: data.story,
      ending: data.ending,
      outcome: data.outcome,
      nickname,
      choices,
      duration_seconds: duration,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
