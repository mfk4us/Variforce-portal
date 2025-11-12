/* cspell:words ilike */
// app/admin/companies/page.tsx
import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { Building2, CheckCircle2, ChevronRight, Star } from "lucide-react";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import React from "react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// ---- Types ----
// Local row types to avoid `any`
export interface MemberRow {
  id: string;
  role: string | null;
  status: string | null;
  created_at?: string | null;
  users: {
    full_name: string | null;
    email: string | null;
  };
}

type SimpleEntityRow = {
  id: string;
  title?: string | null;
  name?: string | null;
  number?: string | null;
  status?: string | null;
  total?: number | string | null;
  reference?: string | null;
  amount?: number | string | null;
  created_at?: string | null;
};
export interface Tenant {
  id: string;
  uuid?: string | null;
  slug?: string | null;
  name?: string | null;
  company_name?: string | null;
  legal_name?: string | null;
  display_name?: string | null;
  status?: string | null;
  is_approved?: boolean | null;
  approval_status?: string | null;
  approved?: boolean | null;
  approved_at?: string | null;
  created_at?: string | null;
  inserted_at?: string | null;
  updated_at?: string | null;
  tier?: string | null;
  currency?: string | null;
  rate_book_enabled?: boolean | null;
  language?: string | null;
  timezone?: string | null;
  primary_contact_name?: string | null;
  primary_contact_email?: string | null;
  primary_email?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  owner_name?: string | null;
  contact_phone?: string | null;
  phone?: string | null;
  mobile?: string | null;
  website?: string | null;
  logo_url?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postal_code?: string | null;
  address_json?: unknown;
  cr_number?: string | null;
  vat_number?: string | null;
  cr_doc_url?: string | null;
  vat_doc_url?: string | null;
  industry?: string | null;
  notes?: string | null;
  rating_team?: number | null;
  rating_customer?: number | null;
}

// ---- Supabase (server-only) ----
function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createServiceClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function boolFromForm(val: FormDataEntryValue | null): boolean | null {
  if (val === null) return null;
  const v = String(val).toLowerCase();
  return v === "on" || v === "true" || v === "1";
}
function jsonFromForm(val: FormDataEntryValue | null): unknown {
  if (!val) return null;
  try { return JSON.parse(String(val)); } catch { return String(val); }
}

function strFromForm(val: FormDataEntryValue | null): string | null {
  if (val == null) return null;
  return typeof val === "string" ? val : (val as File).name ?? null;
}

async function getTenantById(id: string): Promise<Tenant | null> {
  const sb = serviceClient();
  let { data } = await sb.from("tenants").select("*").eq("id", id).maybeSingle();
  if (data) return data as Tenant;
  ({ data } = await sb.from("tenants").select("*").eq("uuid", id).maybeSingle());
  if (data) return data as Tenant;
  ({ data } = await sb.from("tenants").select("*").eq("slug", id).maybeSingle());
  return (data as Tenant) || null;
}

export async function updateTenantAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const payload: Partial<Tenant> = {
    name: strFromForm(formData.get("name")),
    tier: strFromForm(formData.get("tier")),
    status: strFromForm(formData.get("status")),
    currency: strFromForm(formData.get("currency")),
    slug: strFromForm(formData.get("slug")),
    rate_book_enabled: boolFromForm(formData.get("rate_book_enabled")),
    timezone: strFromForm(formData.get("timezone")),
    primary_contact_name: strFromForm(formData.get("primary_contact_name")),
    primary_contact_email: strFromForm(formData.get("primary_contact_email")),
    phone: strFromForm(formData.get("phone")),
    website: strFromForm(formData.get("website")),
    language: strFromForm(formData.get("language")),
    logo_url: strFromForm(formData.get("logo_url")),
    address_line1: strFromForm(formData.get("address_line1")),
    address_line2: strFromForm(formData.get("address_line2")),
    city: strFromForm(formData.get("city")),
    region: strFromForm(formData.get("region")),
    country: strFromForm(formData.get("country")),
    postal_code: strFromForm(formData.get("postal_code")),
    address_json: jsonFromForm(formData.get("address_json")),
    cr_number: strFromForm(formData.get("cr_number")),
    vat_number: strFromForm(formData.get("vat_number")),
    cr_doc_url: strFromForm(formData.get("cr_doc_url")),
    vat_doc_url: strFromForm(formData.get("vat_doc_url")),
    industry: strFromForm(formData.get("industry")),
    notes: strFromForm(formData.get("notes")),
    updated_at: new Date().toISOString(),
  };
  const sb = serviceClient();
  await sb.from("tenants").update(payload).eq("id", id);
  revalidatePath("/admin/companies");
  redirect("/admin/companies");
}

// ---- Data loaders ----
async function listApprovedTenants(): Promise<Tenant[]> {
  const sb = serviceClient();

  const isApproved = (r: Tenant) => {
    const s = String(r.status ?? r.approval_status ?? "").toLowerCase();
    return (
      r.is_approved === true ||
      r.approved === true ||
      (!!r.approved_at && r.approved_at !== null) ||
      s.includes("approve") // matches approved/Approved/approval
    );
  };

  // Helper: fetch recent rows from a table and filter in JS
  const fetchAndFilter = async (table: string): Promise<{ rows: Tenant[]; filtered: Tenant[] }> => {
    const { data } = await sb
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    const rows = (data as Tenant[]) ?? [];
    const filtered = rows.filter(isApproved);
    return { rows, filtered };
  };

  try {
    // 1) Try tenants with server-side filter first (fast path)
    const fast = await sb
      .from("tenants")
      .select("*")
      .or([
        "status.eq.approved",
        "status.ilike.*approved*",
        "is_approved.is.true",
        "approval_status.ilike.*approved*",
      ].join(","))
      .order("created_at", { ascending: false })
      .limit(50);
    if (fast.data && fast.data.length > 0) return fast.data as Tenant[];

    // 2) Broad fetch + JS filter on tenants
    const t = await fetchAndFilter("tenants");
    if (t.filtered.length > 0) return t.filtered as Tenant[];

    // 3) Fallback to companies table (broad + JS filter)
    const c = await fetchAndFilter("companies");
    if (c.filtered.length > 0) return c.filtered as Tenant[];

    // 4) If still nothing, return most recent tenants as a last-resort hint
    return t.rows as Tenant[];
  } catch {
    return [] as Tenant[];
  }
}

// ---- Page ----
function isBlank(v: unknown): boolean {
  if (v == null) return true;
  const s = typeof v === "string" ? v : String(v);
  return s.trim().length === 0 || s === "—";
}

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "members", label: "Members" },
  { key: "projects", label: "Projects" },
  { key: "surveys", label: "Surveys" },
  { key: "estimates", label: "Estimates" },
  { key: "invoices", label: "Invoices" },
  { key: "payments", label: "Payments" },
] as const;

type TabKey = typeof TABS[number]["key"];

function clampRating(n: unknown): number | null {
  if (n == null) return null;
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.max(0, Math.min(5, v));
}

function Stars({ value }: { value: number | null }) {
  const v = value == null ? null : clampRating(value);
  if (v == null) return <span>—</span>;
  const full = Math.floor(v);
  const half = v - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-600">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`s${i}`} className="h-3.5 w-3.5 fill-current" />
      ))}
      {half === 1 ? <Star className="h-3.5 w-3.5 fill-current opacity-60" /> : null}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className="h-3.5 w-3.5 opacity-30" />
      ))}
      <span className="ml-1 text-[11px] text-muted-foreground">{v.toFixed(1)}</span>
    </span>
  );
}
// ---- Tab data loaders ----
async function listMembers(tenantId: string): Promise<MemberRow[]> {
  const sb = serviceClient();

  // 1) Read from `members` scoped to tenant, exclude soft-deleted, newest first
  let rows: unknown[] = [];
  try {
    const { data, error } = await sb
      .from("members")
      .select("*")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error && data) rows = data as unknown[];
  } catch {}

  if (!rows.length) return [];

  // 2) Hydrate display fields from profiles/auth.users
  const ids = new Set<string>();
  for (const r of rows) {
    if ((r as Record<string, unknown>).user_id) ids.add(String((r as Record<string, unknown>).user_id));
  }
  const idList = Array.from(ids);

  const profilesByUserId: Record<string, { id?: string; user_id?: string; full_name?: string | null; email?: string | null } > = {};
  const usersById: Record<string, { id: string; email?: string | null; raw_user_meta_data?: Record<string, unknown>; user_metadata?: Record<string, unknown> } > = {};

  if (idList.length) {
    try {
      const { data } = await sb
        .from("profiles")
        .select("id, user_id, full_name, email")
        .in("user_id", idList);
      for (const p of data ?? []) {
        if (p?.user_id) profilesByUserId[String(p.user_id)] = p;
      }
    } catch {}
    // Enhanced: Try to load user name/email from auth.users with metadata
    let usersData: Array<{ id: string; email?: string | null; raw_user_meta_data?: Record<string, unknown>; user_metadata?: Record<string, unknown> }> | null = null;
    try {
      // Try selecting modern column name first (raw_user_meta_data)
      const { data } = await sb
        .from("auth.users")
        .select("id, email, raw_user_meta_data")
        .in("id", idList);
      usersData = data ?? null;
    } catch {}

    if (!usersData) {
      try {
        // Fallback for older projects where it's named user_metadata
        const { data } = await sb
          .from("auth.users")
          .select("id, email, user_metadata")
          .in("id", idList);
        usersData = data ?? null;
      } catch {}
    }

    for (const u of usersData ?? []) usersById[String(u.id)] = u;
  }

  return (rows as Array<Record<string, unknown>>).map((r) => {
    const uid = String((r as Record<string, unknown>).user_id ?? "");
    const p = profilesByUserId[uid];
    const u = usersById[uid];
    const meta = (u?.raw_user_meta_data ?? u?.user_metadata) as Record<string, unknown> | undefined;
    const metaName = typeof meta?.full_name === "string" ? meta?.full_name
                    : typeof meta?.name === "string" ? meta?.name
                    : null;

    const memberName =
      (r as Record<string, unknown>).name as string | null ??
      (p?.full_name ?? null) ??
      (metaName ?? null);

    const memberEmail =
      (r as Record<string, unknown>).email as string | null ??
      (p?.email ?? null) ??
      (u?.email ?? null);

    return {
      id: String((r as Record<string, unknown>).id),
      role: ((r as Record<string, unknown>).role as string | null) ?? "—",
      status: ((r as Record<string, unknown>).status as string | null) ?? "—",
      created_at: ((r as Record<string, unknown>).created_at as string | null) ?? null,
      users: {
        full_name: memberName,
        email: memberEmail,
      },
    };
  });
}

// Try multiple table names and tenant key candidates. Returns the first non-empty dataset.
async function listMulti(options: {
  tables: string[];
  tenantId: string;
  select: string;
  order?: 'created_at' | 'updated_at' | 'inserted_at';
  limit?: number;
  keys?: string[];
}) {
  const sb = serviceClient();
  const tables = options.tables;
  const select = options.select;
  const order = options.order ?? 'created_at';
  const limit = options.limit ?? 50;
  const tenantKeys = options.keys ?? ['tenant_id', 'company_id', 'org_id']; // common variations

  for (const table of tables) {
    for (const key of tenantKeys) {
      try {
        const q = sb
          .from(table)
          .select(select)
          .eq(key, options.tenantId)
          .order(order, { ascending: false })
          .limit(limit);
        const { data, error } = await q;
        if (!error && data && data.length) {
          return { table, key, rows: (data as unknown[]) };
        }
      } catch {}
    }
  }
  return { table: null, key: null, rows: [] as unknown[] };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ tenantId?: string; mode?: string; tab?: string }> }) {
  const rows = await listApprovedTenants();
  const showDebug = process.env.NEXT_PUBLIC_DEBUG === "1";
  const sp = await searchParams;
  const editingId = sp?.tenantId;
  const mode = sp?.mode;
  const tabParam = (sp?.tab as TabKey | undefined) ?? "profile";
  const activeTab: TabKey = TABS.some(t => t.key === tabParam) ? tabParam : "profile";
  const isViewOnly = mode === "view";
  const editing = editingId ? await getTenantById(editingId) : null;
  const _sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let _projRef: string | null = null;
  try { _projRef = new URL(_sbUrl).hostname.split(".")[0] || null; } catch {}
  const supabaseRestMembers = editing ? `${_sbUrl}/rest/v1/members?tenant_id=eq.${encodeURIComponent(String(editing.id))}&select=*` : null;
  const supabaseStudioMembers = _projRef ? `https://app.supabase.com/project/${_projRef}/editor` : null;
  let members: MemberRow[] = [];
  let projects: SimpleEntityRow[] = [];
  let surveys: SimpleEntityRow[] = [];
  let estimates: SimpleEntityRow[] = [];
  let invoices: SimpleEntityRow[] = [];
  let payments: SimpleEntityRow[] = [];
  if (editing) {
    const tenantId = editing.id;
    if (activeTab === "members") {
      members = await listMembers(tenantId);
    }
    if (activeTab === "projects") {
      const pr = await listMulti({
        tables: ["projects", "tenant_projects", "company_projects"],
        tenantId,
        select: "id, title, name, number, status, total, created_at",
      });
      projects = pr.rows as SimpleEntityRow[];
    }
    if (activeTab === "surveys") {
      const sv = await listMulti({
        tables: ["survey_requests", "surveys", "tenant_surveys"],
        tenantId,
        select: "id, title, name, number, status, total, created_at",
      });
      surveys = sv.rows as SimpleEntityRow[];
    }
    if (activeTab === "estimates") {
      const es = await listMulti({
        tables: ["estimates", "quotes", "tenant_estimates"],
        tenantId,
        select: "id, title, name, number, status, total, created_at",
      });
      estimates = es.rows as SimpleEntityRow[];
    }
    if (activeTab === "invoices") {
      const iv = await listMulti({
        tables: ["invoices", "sales_invoices", "tenant_invoices"],
        tenantId,
        select: "id, title, name, number, status, total, created_at",
      });
      invoices = iv.rows as SimpleEntityRow[];
    }
    if (activeTab === "payments") {
      const pm = await listMulti({
        tables: ["payments", "invoice_payments", "transactions"],
        tenantId,
        select: "id, reference, status, amount, total, created_at",
      });
      payments = pm.rows as SimpleEntityRow[];
    }
  }
  const _debugBanner = showDebug ? (
    <div className="text-[10px] text-muted-foreground">modal lookup: tenantId=&quot;{editingId}&quot; ⇒ found={String(!!editing)}</div>
  ) : null;

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Companies (Approved)</h1>
        </div>
        <Link
          href="/admin/partner-applications"
          className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
        >
          View pending
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </header>
      {_debugBanner}

      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-tenant-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"
        >
          {/* Backdrop */}
          <Link
            href="/admin/companies"
            aria-label="Close"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal panel */}
          <div className="relative z-10 w-full sm:max-w-4xl mx-auto max-h-[90svh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl border bg-white/90 dark:bg-neutral-900/90 backdrop-blur shadow-xl overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b bg-white/90 dark:bg-neutral-900/90 backdrop-blur">
              <div className="min-w-0 flex items-center gap-2">
                {editing.logo_url ? (
                  <Image src={editing.logo_url} alt="Logo" width={24} height={24} unoptimized className="h-6 w-6 rounded object-cover border" />
                ) : (
                  <div className="h-6 w-6 rounded bg-muted border" />
                )}
                <div className="min-w-0">
                  <h2 id="edit-tenant-title" className="text-base font-semibold truncate">
                    View & Edit Tenant
                  </h2>
                  {isViewOnly ? (
                    <span className="ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">View only</span>
                  ) : null}
                  <p className="text-xs text-muted-foreground truncate">
                    {editing.name ?? editing.company_name ?? "Tenant"}
                  </p>
                </div>
              </div>
              <Link
                href="/admin/companies"
                className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted"
                aria-label="Close"
              >
                Close
              </Link>
            </div>
            <nav className="-mb-px mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              {TABS.map((t) => {
                const href = `/admin/companies?tenantId=${encodeURIComponent(String(editing.id))}&mode=${isViewOnly ? "view" : "edit"}&tab=${t.key}`;
                const isActive = activeTab === t.key;
                return (
                  <Link
                    key={t.key}
                    href={href}
                    className={`pb-2 border-b-2 ${isActive ? "border-emerald-500 text-emerald-700" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex-1 overflow-y-auto">
              {activeTab === "profile" && (
                <>
                  {/* Quick View summary */}
                  <div className="px-4 sm:px-6 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                    <div><span className="text-muted-foreground">ID:</span> {editing.id}</div>
                    {editing.uuid ? <div><span className="text-muted-foreground">UUID:</span> {editing.uuid}</div> : null}
                    <div><span className="text-muted-foreground">Status:</span> {editing.status ?? "—"}</div>
                    <div><span className="text-muted-foreground">Tier:</span> {editing.tier ?? "—"}</div>
                    <div><span className="text-muted-foreground">Currency:</span> {editing.currency ?? "—"}</div>
                    <div><span className="text-muted-foreground">Rate Book:</span> {editing.rate_book_enabled ? "Enabled" : "Disabled"}</div>
                    <div><span className="text-muted-foreground">Created:</span> {editing.created_at ? new Date(editing.created_at).toLocaleString() : "—"}</div>
                    <div><span className="text-muted-foreground">Updated:</span> {editing.updated_at ? new Date(editing.updated_at).toLocaleString() : "—"}</div>
                    <div className="col-span-2 sm:col-span-1"><span className="text-muted-foreground">Team Rating:</span> <Stars value={clampRating(editing.rating_team ?? null)} /></div>
                    <div className="col-span-2 sm:col-span-1"><span className="text-muted-foreground">Customer Rating:</span> <Stars value={clampRating(editing.rating_customer ?? null)} /></div>
                  </div>

                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <form action={isViewOnly ? undefined : updateTenantAction}>
                      <input type="hidden" name="id" defaultValue={editing.id} />

                      <Field label="Name"><input name="name" defaultValue={editing.name ?? ""} className={`input ${isBlank(editing.name) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>
                      <Field label="Slug"><input name="slug" defaultValue={editing.slug ?? ""} className={`input ${isBlank(editing.slug) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>

                      <Field label="Tier"><input name="tier" defaultValue={editing.tier ?? ""} className={`input ${isBlank(editing.tier) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>
                      <Field label="Status"><input name="status" defaultValue={editing.status ?? ""} className={`input ${isBlank(editing.status) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>

                      <Field label="Currency"><input name="currency" defaultValue={editing.currency ?? ""} className={`input ${isBlank(editing.currency) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>
                      <Field label="Language"><input name="language" defaultValue={editing.language ?? ""} className={`input ${isBlank(editing.language) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>

                      <Field label="Timezone"><input name="timezone" defaultValue={editing.timezone ?? ""} className={`input ${isBlank(editing.timezone) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>
                      <Field label="Rate Book Enabled">
                        <input type="checkbox" name="rate_book_enabled" defaultChecked={!!editing.rate_book_enabled} disabled={isViewOnly} />
                      </Field>

                      <Field label="Primary Contact Name"><input name="primary_contact_name" defaultValue={editing.primary_contact_name ?? ""} className={`input ${isBlank(editing.primary_contact_name) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>
                      <Field label="Primary Contact Email"><input name="primary_contact_email" defaultValue={editing.primary_contact_email ?? ""} className={`input ${isBlank(editing.primary_contact_email) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>

                      <Field label="Phone"><input name="phone" defaultValue={editing.phone ?? ""} className={`input ${isBlank(editing.phone) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>
                      <Field label="Website"><input name="website" defaultValue={editing.website ?? ""} className={`input ${isBlank(editing.website) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>

                      <Field label="Logo URL" className="sm:col-span-2 lg:col-span-3"><input name="logo_url" defaultValue={editing.logo_url ?? ""} className={`input ${isBlank(editing.logo_url) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>

                      <Field label="Address Line 1"><input name="address_line1" defaultValue={editing.address_line1 ?? ""} className={`input ${isBlank(editing.address_line1) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>
                      <Field label="Address Line 2"><input name="address_line2" defaultValue={editing.address_line2 ?? ""} className={`input ${isBlank(editing.address_line2) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>

                      <Field label="City"><input name="city" defaultValue={editing.city ?? ""} className={`input ${isBlank(editing.city) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>
                      <Field label="Region"><input name="region" defaultValue={editing.region ?? ""} className={`input ${isBlank(editing.region) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>

                      <Field label="Country"><input name="country" defaultValue={editing.country ?? ""} className={`input ${isBlank(editing.country) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>
                      <Field label="Postal Code"><input name="postal_code" defaultValue={editing.postal_code ?? ""} className={`input ${isBlank(editing.postal_code) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>

                      <Field label="Address JSON" className="sm:col-span-2 lg:col-span-3">
                        <textarea name="address_json" defaultValue={editing.address_json ? JSON.stringify(editing.address_json) : ""} className={`textarea ${isBlank(editing.address_json ? JSON.stringify(editing.address_json) : "") ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} rows={3} disabled={isViewOnly} readOnly={isViewOnly} />
                      </Field>

                      <Field label="CR Number"><input name="cr_number" defaultValue={editing.cr_number ?? ""} className={`input ${isBlank(editing.cr_number) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>
                      <Field label="VAT Number"><input name="vat_number" defaultValue={editing.vat_number ?? ""} className={`input ${isBlank(editing.vat_number) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>

                      <Field label="CR Doc URL"><input name="cr_doc_url" defaultValue={editing.cr_doc_url ?? ""} className={`input ${isBlank(editing.cr_doc_url) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>
                      <Field label="VAT Doc URL"><input name="vat_doc_url" defaultValue={editing.vat_doc_url ?? ""} className={`input ${isBlank(editing.vat_doc_url) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>

                      <Field label="Industry"><input name="industry" defaultValue={editing.industry ?? ""} className={`input ${isBlank(editing.industry) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} disabled={isViewOnly} readOnly={isViewOnly} /></Field>
                      <Field label="Notes" className="sm:col-span-2 lg:col-span-3">
                        <textarea name="notes" defaultValue={editing.notes ?? ""} className={`textarea ${isBlank(editing.notes) ? "border-red-500/60 focus-visible:ring-red-500/30" : ""}`} rows={3} disabled={isViewOnly} readOnly={isViewOnly} />
                      </Field>

                      <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end gap-2 pt-2">
                        <Link href="/admin/companies" className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm">Close</Link>
                        {!isViewOnly && (
                          <button type="submit" className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700">Save Changes</button>
                        )}
                      </div>
                    </form>
                  </div>
                </>
              )}

              {activeTab !== "profile" && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                  {activeTab === "members" && (
                    <>
                      {showDebug && (
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Live data from Supabase (RLS-safe).</span>
                          <span className="flex items-center gap-3">
                            {supabaseRestMembers ? (
                              <a href={supabaseRestMembers} target="_blank" rel="noreferrer" className="underline hover:no-underline">REST</a>
                            ) : null}
                            {supabaseStudioMembers ? (
                              <a href={supabaseStudioMembers} target="_blank" rel="noreferrer" className="underline hover:no-underline">Studio</a>
                            ) : null}
                          </span>
                        </div>
                      )}
                  <SimpleList
                    headers={["Name", "Email", "Role", "Joined"]}
                    rows={(members || []).map((m: MemberRow) => [
                      <span key={`n-${m.id}`}>{m.users?.full_name ?? "—"}</span>,
                      <span key={`e-${m.id}`}>{m.users?.email ?? "—"}</span>,
                      <span key={`r-${m.id}`}>{m.role ?? "—"}</span>,
                      <span key={`j-${m.id}`}>{m.created_at ? new Date(m.created_at).toLocaleDateString() : "—"}</span>,
                    ])}
                    empty="No members yet."
                  />
                    </>
                  )}

                  {activeTab === "projects" && (
                    <SimpleList
                      headers={["Project", "Status", "Created"]}
                      rows={(projects || []).map((p) => [
                        <span key={`p-title-${p.id}`}>{p.title ?? p.name ?? `#${p.id}`}</span>,
                        <span key={`p-status-${p.id}`}>{p.status ?? "—"}</span>,
                        <span key={`p-date-${p.id}`}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</span>,
                      ])}
                      empty="No projects yet."
                    />
                  )}

                  {activeTab === "surveys" && (
                    <SimpleList
                      headers={["Survey", "Status", "Created"]}
                      rows={(surveys || []).map((s) => [
                        <span key={`s-title-${s.id}`}>{s.title ?? s.name ?? `#${s.id}`}</span>,
                        <span key={`s-status-${s.id}`}>{s.status ?? "—"}</span>,
                        <span key={`s-date-${s.id}`}>{s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</span>,
                      ])}
                      empty="No surveys yet."
                    />
                  )}

                  {activeTab === "estimates" && (
                    <SimpleList
                      headers={["Estimate", "Status", "Total", "Created"]}
                      rows={(estimates || []).map((e) => [
                        <span key={`e-num-${e.id}`}>{e.number ?? e.title ?? `#${e.id}`}</span>,
                        <span key={`e-status-${e.id}`}>{e.status ?? "—"}</span>,
                        <span key={`e-total-${e.id}`}>{e.total ?? "—"}</span>,
                        <span key={`e-date-${e.id}`}>{e.created_at ? new Date(e.created_at).toLocaleDateString() : "—"}</span>,
                      ])}
                      empty="No estimates yet."
                    />
                  )}

                  {activeTab === "invoices" && (
                    <SimpleList
                      headers={["Invoice", "Status", "Total", "Created"]}
                      rows={(invoices || []).map((iv) => [
                        <span key={`i-num-${iv.id}`}>{iv.number ?? iv.title ?? `#${iv.id}`}</span>,
                        <span key={`i-status-${iv.id}`}>{iv.status ?? "—"}</span>,
                        <span key={`i-total-${iv.id}`}>{iv.total ?? "—"}</span>,
                        <span key={`i-date-${iv.id}`}>{iv.created_at ? new Date(iv.created_at).toLocaleDateString() : "—"}</span>,
                      ])}
                      empty="No invoices yet."
                    />
                  )}

                  {activeTab === "payments" && (
                    <SimpleList
                      headers={["Payment", "Status", "Amount", "Created"]}
                      rows={(payments || []).map((pm) => [
                        <span key={`pm-ref-${pm.id}`}>{pm.reference ?? pm.number ?? `#${pm.id}`}</span>,
                        <span key={`pm-status-${pm.id}`}>{pm.status ?? "—"}</span>,
                        <span key={`pm-amt-${pm.id}`}>{pm.amount ?? pm.total ?? "—"}</span>,
                        <span key={`pm-date-${pm.id}`}>{pm.created_at ? new Date(pm.created_at).toLocaleDateString() : "—"}</span>,
                      ])}
                      empty="No payments yet."
                    />
                  )}
            {showDebug && (
              <div className="px-4 py-2 text-[10px] text-muted-foreground border-t">
                Debug: tab={activeTab} members={Array.isArray(members) ? members.length : 0} projects={Array.isArray(projects) ? projects.length : 0} surveys={Array.isArray(surveys) ? surveys.length : 0} estimates={Array.isArray(estimates) ? estimates.length : 0} invoices={Array.isArray(invoices) ? invoices.length : 0} payments={Array.isArray(payments) ? payments.length : 0}
              </div>
            )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDebug && (
        <pre className="text-xs whitespace-pre-wrap rounded-lg border p-3 bg-muted/30 overflow-auto">
          {JSON.stringify({
            count: rows.length,
            sample: rows.slice(0, 3).map((r: Tenant) => ({
              id: r.id,
              name: r.name ?? r.company_name,
              status: r.status ?? r.approval_status,
              is_approved: r.is_approved,
              approved: r.approved,
              approved_at: r.approved_at,
            })),
          }, null, 2)}
        </pre>
      )}

      <CardBlock title="Approved Tenants" icon={CheckCircle2}>
        <TableList
          empty="No approved tenants yet."
          headers={["Company", "CR Number", "VAT Number", "Ratings", "Created", "Actions"]}
          rows={rows.map((r: Tenant) => [
            (
              <div key={`company-${r.id}`} className="flex items-center gap-3 min-w-0">
                {r.logo_url ? (
                  <Image src={r.logo_url} alt="Logo" width={24} height={24} unoptimized className="h-6 w-6 rounded object-cover border" />
                ) : (
                  <div className="h-6 w-6 rounded bg-muted border" />
                )}
                <span className={`truncate ${isBlank(r.name ?? r.company_name ?? r.legal_name ?? r.display_name) ? "text-red-600" : ""}`}>
                  {r.name ?? r.company_name ?? r.legal_name ?? r.display_name ?? "—"}
                </span>
              </div>
            ),
            <span key={`cr-${r.id}`} className={isBlank(r.cr_number) ? "text-red-600" : ""}>{r.cr_number ?? "—"}</span>,
            <span key={`vat-${r.id}`} className={isBlank(r.vat_number) ? "text-red-600" : ""}>{r.vat_number ?? "—"}</span>,
            (
              <div key={`rat-${r.id}`} className="flex flex-col gap-1">
                <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Team</span><Stars value={clampRating(r.rating_team ?? null)} /></div>
                <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Clients</span><Stars value={clampRating(r.rating_customer ?? null)} /></div>
              </div>
            ),
            <span key={`created-${r.id}`}>
              {(() => {
                const d = r.created_at ?? r.inserted_at ?? r.approved_at;
                return d ? new Date(d).toLocaleDateString() : "—";
              })()}
            </span>,
            <ActionCell key={`ac-${r.id}`} id={r.id} uuid={r.uuid} slug={r.slug} />,
          ])}
        />
      </CardBlock>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}


// ---- UI helpers ----

function ActionCell({ id, uuid, slug }: { id?: string; uuid?: string | null; slug?: string | null }) {
  const ident = encodeURIComponent(String(id ?? uuid ?? slug ?? ""));
  return (
    <span className="inline-flex items-center gap-3" key={`actions-${ident}`}>
      <Link
        href={`/admin/companies?tenantId=${ident}&mode=view&tab=profile`}
        className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline dark:text-emerald-400"
      >
        Open <ChevronRight className="h-3 w-3" />
      </Link>
      <Link
        href={`/admin/companies?tenantId=${ident}&mode=edit&tab=profile`}
        className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline dark:text-emerald-400"
      >
        Edit <ChevronRight className="h-3 w-3" />
      </Link>
    </span>
  );
}

// ---- UI helpers ----
function CardBlock({
  title,
  icon: TitleIcon,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur">
      <div className="flex items-center gap-2 px-6 pt-5">
        {TitleIcon ? <TitleIcon className="h-4 w-4 opacity-80" /> : null}
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent mb-4" />
        {children}
      </div>
    </div>
  );
}

function TableList({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  if (!rows || rows.length === 0) {
    return <div className="text-sm text-muted-foreground">{empty}</div>;
  }
  return (
    <>
      {/* Desktop/Tablet table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              {headers.map((h) => (
                <th key={h} className="p-3 text-left whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                {r.map((c, j) => (
                  <td key={j} className="p-3 align-top">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone stacked cards */}
      <ul className="md:hidden space-y-3">
        {rows.map((r, i) => (
          <li key={i} className="rounded-xl border p-3 bg-white/70 dark:bg-black/40">
            <div className="grid grid-cols-1 gap-1 text-sm">
              {r.map((c, j) => (
                <div key={j} className="flex items-start justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{headers[j]}</span>
                  <span className="max-w-[60%] text-right break-words">{c}</span>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
function SimpleList({ headers, rows, empty }: { headers: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (!rows || rows.length === 0) return <div className="text-sm text-muted-foreground">{empty}</div>;
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((h) => (
              <th key={h} className="p-3 text-left whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              {r.map((c, j) => (
                <td key={j} className="p-3 align-top">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}