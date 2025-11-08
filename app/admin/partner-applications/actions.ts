"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const svc = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Existing: mark application approved (adjust table/columns to match your schema)
export async function approveApplication(appId: string) {
  const { error } = await svc
    .from("partners_applications")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", appId);
  if (error) throw error;
}

export async function createTenantAndPrimaryInvite(app: {
  company_name: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  role?: "owner" | "admin" | "member";
}) {
  const { data: tenant, error: tErr } = await svc
    .from("tenants")
    .insert({
      name: app.company_name,
      contact_email: app.contact_email ?? null,
      contact_phone: app.contact_phone ?? null,
    })
    .select()
    .single();
  if (tErr) throw tErr;

  const { data: invite, error: iErr } = await svc
    .from("invites")
    .insert({
      tenant_id: tenant.id,
      email: app.contact_email ?? null,
      phone: app.contact_phone ?? null,
      role: app.role ?? "owner",
    })
    .select()
    .single();
  if (iErr) throw iErr;

  const base = process.env.NEXT_PUBLIC_PORTAL_URL!;
  return `${base}/portal/invite/${invite.token}`;
}

// Combined: approve → create invite → return link
export async function approveAndInvite(input: {
  appId: string;
  company_name: string;
  contact_email?: string | null;
  contact_phone?: string | null;
}) {
  await approveApplication(input.appId);
  const inviteUrl = await createTenantAndPrimaryInvite({
    company_name: input.company_name,
    contact_email: input.contact_email ?? undefined,
    contact_phone: input.contact_phone ?? undefined,
    role: "owner",
  });
  // revalidate the admin page so status changes immediately
  revalidatePath("/admin/partner-applications");
  return { ok: true, inviteUrl };
}