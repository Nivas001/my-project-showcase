import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CERTIFICATE_COLUMNS, type Certificate } from "@/lib/certificates";

export const listCertificates = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("@/lib/projects.server");
  const { signCertificateImages } = await import("@/lib/certificates.server");
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("certificates")
    .select(CERTIFICATE_COLUMNS)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return signCertificateImages((data ?? []) as unknown as Certificate[]);
});

export const saveCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { certificate: Certificate & { id?: string } }) => data)
  .handler(async ({ data, context }) => {
    const { id, ...fields } = data.certificate;
    const payload = { ...fields, credential_url: fields.credential_url || null };

    if (id) {
      const { error } = await context.supabase.from("certificates").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }

    const { data: inserted, error } = await context.supabase
      .from("certificates")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const deleteCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("certificates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
