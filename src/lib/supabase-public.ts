import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * The anon-key client used by read paths inside server functions.
 *
 * Three call sites had grown their own copy of this, including the header
 * fix-up for the new opaque `sb_publishable_` keys — which is exactly the kind
 * of detail that gets corrected in one copy and not the other two.
 */
export function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        // New-style keys are opaque strings, not bearer JWTs.
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/**
 * True when an error is Postgres complaining that the relation does not exist.
 *
 * The paint wall and the notes board ship in the same commit as the migration
 * that creates their tables, and the two do not necessarily land at the same
 * moment. Reading this as "not set up yet" rather than "broken" is the
 * difference between an empty state and an error boundary over the whole page.
 */
export function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  // Two different layers report this, and they report it differently:
  //   42P01   Postgres itself — "relation ... does not exist"
  //   PGRST205 PostgREST — the table is not in its schema cache, which is what
  //            you actually get back through supabase-js, and which says
  //            "Could not find the table ... in the schema cache" instead.
  // Only matching the Postgres code meant the empty state never fired and the
  // page threw to its error boundary instead.
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  const message = error.message ?? "";
  return /relation .* does not exist/i.test(message) || /could not find the table/i.test(message);
}
