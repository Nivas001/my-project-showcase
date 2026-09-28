import { createServerFn } from "@tanstack/react-start";
import { publicClient, isMissingTable } from "@/lib/supabase-public";
import type { TablesUpdate } from "@/integrations/supabase/types";
import {
  MAX_IMAGE_CHARS,
  MAX_NAME,
  MAX_TITLE,
  validatePainting,
  type AdminPainting,
  type Painting,
} from "@/lib/paint";

/**
 * The wall's read path.
 *
 * `artist_email` is absent from this select on purpose and not by accident of
 * ordering: the browser must never be handed a list of the email addresses of
 * everyone who has ever drawn on this site. The admin function below is the
 * only place that column is read, and it sits behind the authenticated route.
 */
const PUBLIC_COLUMNS =
  "id, created_at, artist_name, title, image, width, height, strokes, seconds, rating, rating_note, featured";

export type WallPage = {
  paintings: Painting[];
  /** True before the migration has been applied — renders an empty state. */
  pending: boolean;
};

export const listPaintings = createServerFn({ method: "GET" }).handler(
  async (): Promise<WallPage> => {
    const supabase = publicClient();

    const { data, error } = await supabase
      .from("paintings")
      .select(PUBLIC_COLUMNS)
      .eq("hidden", false)
      // Featured first, then whatever is newest. A wall that only ever shows the
      // last twelve uploads punishes everyone who drew something good early.
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(240);

    if (error) {
      if (isMissingTable(error)) return { paintings: [], pending: true };
      throw new Error(error.message);
    }
    return { paintings: (data ?? []) as unknown as Painting[], pending: false };
  },
);

export const savePainting = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      name: string;
      email: string;
      title: string;
      image: string;
      width: number;
      height: number;
      strokes: number;
      seconds: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    const check = validatePainting(data);
    if (!check.ok) throw new Error(check.error);

    // The data URL is the one field an attacker controls the size of, so it is
    // checked before anything else touches it.
    const image = String(data.image ?? "");
    if (!image.startsWith("data:image/png;base64,")) {
      throw new Error("That does not look like a drawing.");
    }
    if (image.length > MAX_IMAGE_CHARS) {
      throw new Error("That drawing is too large to save. Try a smaller canvas.");
    }
    if (image.length < 128) throw new Error("The canvas is empty.");

    const clampInt = (value: unknown, max: number) =>
      Math.max(0, Math.min(max, Math.floor(Number(value) || 0)));

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("paintings")
      .insert({
        artist_name: data.name.trim().slice(0, MAX_NAME),
        artist_email: data.email.trim().toLowerCase().slice(0, 160),
        title: data.title.trim().slice(0, MAX_TITLE),
        image,
        width: clampInt(data.width, 4000),
        height: clampInt(data.height, 4000),
        strokes: clampInt(data.strokes, 100000),
        seconds: clampInt(data.seconds, 86400),
      })
      .select(PUBLIC_COLUMNS)
      .single();

    if (error) {
      if (isMissingTable(error)) {
        throw new Error("The wall is not open yet — the database migration still has to run.");
      }
      throw new Error(error.message);
    }
    return row as unknown as Painting;
  });

/* ==========================================================================
 * Admin
 *
 * Both of these read and write the email column and the hidden flag, so they
 * live behind /admin, which is already gated by the authenticated route and
 * the `has_role` check in the auth middleware.
 * ======================================================================== */

export const listPaintingsForAdmin = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ paintings: AdminPainting[]; pending: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("paintings")
      // Unrated first: the queue exists to be emptied.
      .select(`${PUBLIC_COLUMNS}, artist_email, hidden`)
      .order("rating", { ascending: true, nullsFirst: true })
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      if (isMissingTable(error)) return { paintings: [], pending: true };
      throw new Error(error.message);
    }
    return { paintings: (data ?? []) as unknown as AdminPainting[], pending: false };
  },
);

export const ratePainting = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      id: string;
      rating: number | null;
      note?: string;
      featured?: boolean;
      hidden?: boolean;
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.id)) throw new Error("Unknown painting.");

    const rating =
      data.rating === null || data.rating === undefined
        ? null
        : Math.max(1, Math.min(5, Math.floor(Number(data.rating))));

    // See the note in notes.functions.ts — postgrest-js rejects an index
    // signature, and the generated Update type catches column typos here.
    const patch: TablesUpdate<"paintings"> = { rating };
    if (data.note !== undefined) patch.rating_note = data.note.trim().slice(0, 240) || null;
    if (data.featured !== undefined) patch.featured = Boolean(data.featured);
    if (data.hidden !== undefined) patch.hidden = Boolean(data.hidden);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("paintings").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePainting = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.id)) throw new Error("Unknown painting.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("paintings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
