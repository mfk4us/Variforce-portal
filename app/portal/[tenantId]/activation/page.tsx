import "server-only";
import * as React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// --------- Helpers ---------
function sbService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

function slugify(input: string | null | undefined) {
  return (input || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function isUuid(v: string | null | undefined) {
  return !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

async function getTenant(tenantId: string) {
  if (!isUuid(tenantId)) {
    throw new Error(`Invalid tenantId: ${tenantId}`);
  }
  const sb = sbService();
  const { data, error } = await sb
    .from("tenants")
    .select(
      `id, name, status, logo_url, cr_number, vat_number, cr_doc_url, vat_doc_url,
       address_line1, city, country`
    )
    .eq("id", tenantId)
    .single();
  if (error) {
    console.error("[activation] getTenant error", error);
    throw new Error(error.message);
  }
  return data;
}

async function publicUrl(bucket: string, path: string) {
  const sb = sbService();
  const { data } = sb.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// --------- Server Action: Save + Activate ---------
export async function saveActivationAction(formData: FormData) {
  "use server";
  try {
    const sb = sbService();

    const rawTenantId = String(formData.get("tenantId") ?? "");
    if (!isUuid(rawTenantId)) {
      throw new Error(`Invalid tenantId submitted: ${rawTenantId}`);
    }
    const tenantId = rawTenantId;

    const crNumber = ((formData.get("cr_number") as string | null) || "").trim() || null;
    const vatNumber = ((formData.get("vat_number") as string | null) || "").trim() || null;
    const address1 = ((formData.get("address_line1") as string | null) || "").trim() || null;
    const city = ((formData.get("city") as string | null) || "").trim() || null;
    const country = ((formData.get("country") as string | null) || "").trim() || null;

    // Files (may be empty)
    const logo = (formData.get("logo") as File | null) ?? null;
    const crPdf = (formData.get("cr_pdf") as File | null) ?? null;
    const vatPdf = (formData.get("vat_pdf") as File | null) ?? null;

    // 1) Upload files if provided
    const bucket = "tenant-assets"; // ensure bucket exists
    const base = `tenant/${tenantId}`;

    let logo_url: string | null = null;
    let cr_doc_url: string | null = null;
    let vat_doc_url: string | null = null;

    if (logo && typeof (logo as any).arrayBuffer === "function" && logo.size > 0) {
      const ext = logo.type?.split("/")[1] || "png";
      const path = `${base}/logo.${ext}`;
      const { error: upErr } = await sb.storage
        .from(bucket)
        .upload(path, logo, { upsert: true, contentType: logo.type || "image/png" });
      if (upErr) throw new Error(`Logo upload failed: ${upErr.message}`);
      const { data } = sb.storage.from(bucket).getPublicUrl(path);
      logo_url = data.publicUrl;
    }

    if (crPdf && typeof (crPdf as any).arrayBuffer === "function" && crPdf.size > 0) {
      const path = `${base}/compliance/cr.pdf`;
      const { error: upErr } = await sb.storage
        .from(bucket)
        .upload(path, crPdf, { upsert: true, contentType: crPdf.type || "application/pdf" });
      if (upErr) throw new Error(`CR upload failed: ${upErr.message}`);
      const { data } = sb.storage.from(bucket).getPublicUrl(path);
      cr_doc_url = data.publicUrl;
    }

    if (vatPdf && typeof (vatPdf as any).arrayBuffer === "function" && vatPdf.size > 0) {
      const path = `${base}/compliance/vat.pdf`;
      const { error: upErr } = await sb.storage
        .from(bucket)
        .upload(path, vatPdf, { upsert: true, contentType: vatPdf.type || "application/pdf" });
      if (upErr) throw new Error(`VAT upload failed: ${upErr.message}`);
      const { data } = sb.storage.from(bucket).getPublicUrl(path);
      vat_doc_url = data.publicUrl;
    }

    // 2) Update tenant fields (only provided values)
    const patch: Record<string, any> = {};
    if (crNumber !== null) patch.cr_number = crNumber;
    if (vatNumber !== null) patch.vat_number = vatNumber;
    if (address1 !== null) patch.address_line1 = address1;
    if (city !== null) patch.city = city;
    if (country !== null) patch.country = country;
    if (logo_url) patch.logo_url = logo_url;
    if (cr_doc_url) patch.cr_doc_url = cr_doc_url;
    if (vat_doc_url) patch.vat_doc_url = vat_doc_url;

    if (Object.keys(patch).length > 0) {
      patch.updated_at = new Date().toISOString();
      const { error: updErr } = await sb.from("tenants").update(patch).eq("id", tenantId);
      if (updErr) throw new Error(`Tenant update failed: ${updErr.message}`);
    }

    // 3) Re-check completeness and activate if ready
    const t = await getTenant(tenantId);
    const ok = !!(
      t.logo_url && t.cr_number && t.vat_number && t.cr_doc_url && t.vat_doc_url && t.address_line1 && t.city && t.country
    );

    if (ok && t.status !== "active") {
      const { error: actErr } = await sb.from("tenants").update({ status: "active" }).eq("id", tenantId);
      if (actErr) throw new Error(`Activate failed: ${actErr.message}`);
    }

    // Go to dashboard (even if still pending, they can see banner)
    redirect(`/portal/${tenantId}/${ok ? "dashboard" : "activation"}`);
  } catch (e: any) {
    console.error("[activation] saveActivationAction error", e);
    const tenantId = String((formData.get("tenantId") ?? "").toString());
    // Surface the message in query for quick diagnosis
    redirect(`/portal/${tenantId || "_"}/activation?error=${encodeURIComponent(e?.message || "unknown_error")}`);
  }
}

// --------- Page (Server Component) ---------
export default async function ActivationPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  if (!isUuid(tenantId)) {
    redirect(`/portal/login?error=${encodeURIComponent("missing_or_invalid_tenant")}`);
  }

  const t = await getTenant(tenantId);

  const checklist = [
    { key: "logo", label: "Company logo", done: !!t.logo_url },
    { key: "cr", label: "CR number + PDF", done: !!(t.cr_number && t.cr_doc_url) },
    { key: "vat", label: "VAT number + PDF", done: !!(t.vat_number && t.vat_doc_url) },
    { key: "addr", label: "Business address (line, city, country)", done: !!(t.address_line1 && t.city && t.country) },
  ];

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-1">Activate your company</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Complete the checklist below to activate <strong>{t.name}</strong>. Once complete, you’ll be redirected to your dashboard.
      </p>

      {/* Error banner (optional) */}
      {/* @ts-expect-error Server Component read of search params via headers */}
      {(() => {
        try {
          // Read raw query string (server context)
          const url = require("next/headers").headers().get("x-invoke-path") || "";
        } catch {}
        return null;
      })()}

      <div className="grid gap-4 mb-8">
        {checklist.map((c) => (
          <div key={c.key} className={`flex items-center justify-between rounded-lg border p-3 ${c.done ? "bg-emerald-50 border-emerald-200" : "bg-white/60"}`}>
            <span className="text-sm">{c.label}</span>
            <span className={`inline-flex h-6 min-w-16 items-center justify-center rounded-full text-xs px-2 ${c.done ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700"}`}>
              {c.done ? "Done" : "Missing"}
            </span>
          </div>
        ))}
      </div>

      <form action={saveActivationAction} className="space-y-4" encType="multipart/form-data">
        <input type="hidden" name="tenantId" value={tenantId} />

        <fieldset className="grid gap-2 rounded-lg border p-4">
          <legend className="text-sm font-medium">Logo</legend>
          <input type="file" name="logo" accept="image/*" className="block" />
          {t.logo_url ? (
            <div className="text-xs text-muted-foreground">Current: <a className="underline" href={t.logo_url} target="_blank">View</a></div>
          ) : null}
        </fieldset>

        <fieldset className="grid gap-2 rounded-lg border p-4">
          <legend className="text-sm font-medium">CR Details</legend>
          <input name="cr_number" placeholder="CR number" defaultValue={t.cr_number ?? ""} className="h-10 rounded-md border px-3" />
          <input type="file" name="cr_pdf" accept="application/pdf" className="block" />
          {t.cr_doc_url ? (
            <div className="text-xs text-muted-foreground">Current: <a className="underline" href={t.cr_doc_url} target="_blank">View</a></div>
          ) : null}
        </fieldset>

        <fieldset className="grid gap-2 rounded-lg border p-4">
          <legend className="text-sm font-medium">VAT Details</legend>
          <input name="vat_number" placeholder="VAT number" defaultValue={t.vat_number ?? ""} className="h-10 rounded-md border px-3" />
          <input type="file" name="vat_pdf" accept="application/pdf" className="block" />
          {t.vat_doc_url ? (
            <div className="text-xs text-muted-foreground">Current: <a className="underline" href={t.vat_doc_url} target="_blank">View</a></div>
          ) : null}
        </fieldset>

        <fieldset className="grid gap-2 rounded-lg border p-4">
          <legend className="text-sm font-medium">Address</legend>
          <input name="address_line1" placeholder="Address line 1" defaultValue={t.address_line1 ?? ""} className="h-10 rounded-md border px-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input name="city" placeholder="City" defaultValue={t.city ?? ""} className="h-10 rounded-md border px-3" />
            <input name="country" placeholder="Country" defaultValue={t.country ?? ""} className="h-10 rounded-md border px-3" />
          </div>
        </fieldset>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-emerald-50">
            Save & Validate
          </button>
          <a href={`/portal/${tenantId}/dashboard`} className="text-sm underline opacity-80 hover:opacity-100">Skip for now</a>
        </div>
      </form>
    </div>
  );
}