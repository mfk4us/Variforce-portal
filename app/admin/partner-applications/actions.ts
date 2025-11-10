import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/navigation";

function slugify(s: string) {
  return s.toLowerCase().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}
function withRandSuffix(s: string) {
  const r = Math.random().toString(36).slice(2, 6);
  return `${s}-${r}`;
}
function service() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function approveApplication(appId: string, adminUserId?: string) {
  const sb = service();

  // Fetch full application
  const { data: app, error: appErr } = await sb
    .from("partners_applications")
    .select(`
      id, status,
      company_name, contact_name, email, phone, city, industry, lang,
      cr_number, vat_number, cr_path, vat_path,
      want_rate_book
    `)
    .eq("id", appId)
    .single();
  if (appErr || !app) throw new Error("Application not found");

  // Idempotency: if already linked, do nothing
  const { data: already } = await sb
    .from("partners_applications")
    .select("tenant_id")
    .eq("id", appId)
    .maybeSingle();
  if (already?.tenant_id) {
    revalidatePath("/admin/partner-applications");
    return { ok: true, tenant_id: already.tenant_id };
  }

  // Create tenant with mapped fields
  let slug = slugify(app.company_name || "partner");
  const { data: slugExists } = await sb.from("tenants").select("id").eq("slug", slug).maybeSingle();
  if (slugExists) slug = withRandSuffix(slug);

  const { data: tenant, error: tErr } = await sb
    .from("tenants")
    .insert({
      name: app.company_name || "Partner",
      slug,
      status: "pending",               // start as pending; becomes active when docs are uploaded
      phone: app.phone ?? null,
      language: app.lang ?? "en",
      city: app.city ?? null,
      industry: app.industry ?? null,
      rate_book_enabled: !!app.want_rate_book,

      primary_contact_name: app.contact_name ?? null,
      primary_contact_email: app.email ?? null,

      -- Compliance (if files already uploaded externally, put URLs now; otherwise let them upload to bucket)
      cr_number: app.cr_number ?? null,
      vat_number: app.vat_number ?? null,
      cr_doc_url: app.cr_path ?? null,
      vat_doc_url: app.vat_path ?? null
    })
    .select("id, slug")
    .single();

  if (tErr || !tenant) throw new Error("Failed to create tenant");

  // Link app → tenant and mark approved
  const { error: upErr } = await sb
    .from("partners_applications")
    .update({
      status: "approved",
      tenant_id: tenant.id,
      approved_by: adminUserId ?? null,
      approved_at: new Date().toISOString(),
    })
    .eq("id", appId);
  if (upErr) throw new Error("Failed to update application");

  // Invite company manager if an email exists
  if (app.email) {
    await sb.auth.admin.inviteUserByEmail(app.email, {
      data: {
        full_name: `${app.company_name} Manager`,
        default_tenant_id: tenant.id,
        role: "company_manager",
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/portal/login`,
    });
  }

  await sb.from("admin_actions").insert({
    action: "approve_application",
    entity: "partners_applications",
    entity_id: appId,
    after_json: { tenant_id: tenant.id, slug: tenant.slug },
  });

  revalidatePath("/admin/partner-applications");
  return { ok: true, tenant_id: tenant.id, slug: tenant.slug };
}