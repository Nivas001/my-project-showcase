import { createServerFn } from "@tanstack/react-start";
import { publicClient, isMissingTable } from "@/lib/supabase-public";
import type { TablesUpdate } from "@/integrations/supabase/types";
import {
  MAX_NOTE_BODY,
  MAX_NOTE_NAME,
  MAX_NOTE_TITLE,
  isTint,
  validateNote,
  type AdminNote,
  type Note,
} from "@/lib/notes";

/** `author_email` is deliberately absent. See the same note in paint.functions.ts. */
const PUBLIC_COLUMNS = "id, created_at, author_name, title, body, tint, pinned";

export type NoteBoard = { notes: Note[]; pending: boolean };

export const listNotes = createServerFn({ method: "GET" }).handler(async (): Promise<NoteBoard> => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("notes")
    .select(PUBLIC_COLUMNS)
    .eq("hidden", false)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    if (isMissingTable(error)) return { notes: [], pending: true };
    throw new Error(error.message);
  }
  return { notes: (data ?? []) as unknown as Note[], pending: false };
});

export const saveNote = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { name: string; email: string; title: string; body: string; tint: string }) => data,
  )
  .handler(async ({ data }) => {
    const check = validateNote(data);
    if (!check.ok) throw new Error(check.error);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("notes")
      .insert({
        author_name: data.name.trim().slice(0, MAX_NOTE_NAME),
        author_email: data.email.trim().toLowerCase().slice(0, 160),
        title: data.title.trim().slice(0, MAX_NOTE_TITLE),
        body: data.body.slice(0, MAX_NOTE_BODY),
        tint: isTint(data.tint) ? data.tint : "butter",
      })
      .select(PUBLIC_COLUMNS)
      .single();

    if (error) {
      if (isMissingTable(error)) {
        throw new Error("The board is not open yet — the database migration still has to run.");
      }
      throw new Error(error.message);
    }
    return row as unknown as Note;
  });

/* ---- Admin ------------------------------------------------------------- */

export const listNotesForAdmin = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ notes: AdminNote[]; pending: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("notes")
      .select(`${PUBLIC_COLUMNS}, author_email, hidden`)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      if (isMissingTable(error)) return { notes: [], pending: true };
      throw new Error(error.message);
    }
    return { notes: (data ?? []) as unknown as AdminNote[], pending: false };
  },
);

export const moderateNote = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; hidden?: boolean; pinned?: boolean }) => data)
  .handler(async ({ data }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.id)) throw new Error("Unknown note.");
    // Typed against the generated Update shape rather than Record<string,
    // unknown>: postgrest-js rejects an index signature outright, and building
    // the object this way also stops a typo becoming a silent no-op column.
    const patch: TablesUpdate<"notes"> = {};
    if (data.hidden !== undefined) patch.hidden = Boolean(data.hidden);
    if (data.pinned !== undefined) patch.pinned = Boolean(data.pinned);
    if (Object.keys(patch).length === 0) return { ok: true };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("notes").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteNote = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.id)) throw new Error("Unknown note.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("notes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
