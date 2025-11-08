// app/admin/partner-applications/page.tsx
// VariForce • Admin — Partner Applications (reimagined)

import * as React from "react";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Script from "next/script";
import { Button, Input, Badge, Card, CardContent } from "@/components/ui";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/** ================== Types ================== */
type Row = {
  id: string;
  submitted_at?: string | null;
  status: "pending" | "approved" | "rejected";
  phone?: string | null;
  company_name?: string | null;
  contact_name?: string | null;
  email?: string | null;
  city?: string | null;
  industry?: string | null;
  lang?: string | null;
  want_rate_book?: boolean | null;
  cr_number?: string | null;
  vat_number?: string | null;
  cr_path?: string | null;
  vat_path?: string | null;
  reviewer_id?: string | null;
  reviewed_at?: string | null;
};

type RowWithUrls = Row & {
  cr_href: string | null;
  vat_href: string | null;
};

/** ================== Supabase (server) ================== */
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

// Helper to create tenant and invite, returning invite URL
async function createTenantAndInviteForApp(app: {
  company_name: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  role?: "owner" | "admin" | "member";
}) {
  const supabase = adminClient();

  // 1) Ensure tenant exists (name only to avoid schema mismatches)
  const { data: foundTenant } = await supabase
    .from("tenants")
    .select("id,name")
    .eq("name", app.company_name)
    .maybeSingle();

  let tenantId = foundTenant?.id as string | undefined;
  if (!tenantId) {
    const { data: created, error: tErr } = await supabase
      .from("tenants")
      .insert({ name: app.company_name })
      .select("id")
      .single();
    if (tErr) throw tErr;
    tenantId = created.id as string;
  }

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_PORTAL_URL ||
    "";

  // 2) Preferred path: **send email using Supabase Auth Invite**
  // This triggers your Supabase → Emails → "Invite user" template.
  // We also embed tenant/role into user_metadata so your login handler can attach membership.
  let actionLink: string | undefined;
  if (app.contact_email) {
    try {
      // Send the actual email (uses your SMTP settings in Supabase)
      const { error: inviteErr } = await (supabase as any).auth.admin.inviteUserByEmail(
        app.contact_email,
        {
          redirectTo: `${base}/portal/login`,
          data: {
            invite_tenant_id: tenantId,
            invite_role: app.role ?? "owner",
          },
        }
      );
      if (inviteErr) throw inviteErr;

      // Also generate the link so we can show "Copy link" in the UI
      const { data: linkData, error: linkErr } = await (supabase as any).auth.admin.generateLink({
        type: "signup",
        email: app.contact_email,
        options: {
          redirectTo: `${base}/portal/login`,
          data: {
            invite_tenant_id: tenantId,
            invite_role: app.role ?? "owner",
          },
        },
      });
      if (!linkErr) {
        actionLink = (linkData?.action_link || linkData?.properties?.action_link) as string | undefined;
      }
      if (actionLink) return actionLink; // prefer the auth-generated link if available
    } catch (_) {
      // fall through to custom invite
    }
  }

  // 3) Fallback: Signed code invite stored in `invites` (works for phone-only or GoTrue failures)
  const raw = crypto.randomUUID();
  const secret = process.env.INVITE_SIGNING_SECRET || "insecure-dev-secret";
  const sig = crypto.createHmac("sha256", secret).update(raw).digest("hex").slice(0, 12);
  const code = `${raw}.${sig}`;
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const payload: Record<string, any> = {
    tenant_id: tenantId,
    role: app.role ?? "owner",
    code,
    expires_at,
  };
  if (app.contact_email) payload.email = app.contact_email;
  if (app.contact_phone) payload.phone = app.contact_phone;

  const { error: iErr } = await supabase.from("invites").insert(payload);
  if (iErr) throw iErr;

  return `${base}/portal/invite/${encodeURIComponent(code)}`;
}

export async function decideAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const decision = String(formData.get("decision") || "") as
    | "approved"
    | "rejected"
    | "resend";
  if (!id || !["approved", "rejected", "resend"].includes(decision)) return;
  const supabase = adminClient();

  // Update application status (skip for resend)
  if (decision !== "resend") {
    await supabase
      .from("partners_applications")
      .update({ status: decision, reviewed_at: new Date().toISOString() })
      .eq("id", id);
  }

  if (decision === "resend") {
    try {
      const { data: appRow, error: aErr } = await supabase
        .from("partners_applications")
        .select("company_name, email, phone")
        .eq("id", id)
        .single();
      if (aErr) throw aErr;

      const inviteUrl = await createTenantAndInviteForApp({
        company_name: appRow?.company_name || "Partner",
        contact_email: appRow?.email || null,
        contact_phone: appRow?.phone || null,
        role: "owner",
      });

      const params = new URLSearchParams();
      params.set("status", "approved");
      params.set("invite", encodeURIComponent(inviteUrl));
      if (appRow?.phone) params.set("phone", appRow.phone);
      if (appRow?.email) params.set("email", appRow.email);
      redirect(`/admin/partner-applications?${params.toString()}`);
    } catch (e: any) {
      const msg = e?.message || "invite_error";
      const params = new URLSearchParams();
      params.set("status", "approved");
      params.set("error", msg);
      redirect(`/admin/partner-applications?${params.toString()}`);
    }
  }

  if (decision === "approved") {
    try {
      const { data: appRow, error: aErr } = await supabase
        .from("partners_applications")
        .select("company_name, email, phone")
        .eq("id", id)
        .single();
      if (aErr) throw aErr;

      const inviteUrl = await createTenantAndInviteForApp({
        company_name: appRow?.company_name || "Partner",
        contact_email: appRow?.email || null,
        contact_phone: appRow?.phone || null,
        role: "owner",
      });

      const params = new URLSearchParams();
      params.set("status", "approved");
      params.set("invite", encodeURIComponent(inviteUrl));
      if (appRow?.phone) params.set("phone", appRow.phone);
      if (appRow?.email) params.set("email", appRow.email);
      redirect(`/admin/partner-applications?${params.toString()}`);
    } catch (e: any) {
      const msg = e?.message || "invite_error";
      const params = new URLSearchParams();
      params.set("status", "approved");
      params.set("error", msg);
      redirect(`/admin/partner-applications?${params.toString()}`);
    }
  }
}

export async function bulkAction(formData: FormData) {
  "use server";
  const idsCsv = String(formData.get("ids") || "");
  const decision = String(formData.get("decision") || "");
  const ids = idsCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!ids.length || !["approved", "rejected"].includes(decision)) return;
  const supabase = adminClient();
  await supabase
    .from("partners_applications")
    .update({ status: decision, reviewed_at: new Date().toISOString() })
    .in("id", ids);
}

const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "documents";

/** ================== Page ================== */
// ADOPT ADMIN SHELL: Remove standalone header/gradient, use shell chrome.
export default async function AdminPartnersApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    status?: Row["status"] | "all" | string | string[];
    sort?: string | string[];
    dir?: string | string[];
  }>;
}) {
  const sp = ((await searchParams) ?? {}) as {
    q?: string | string[];
    status?: Row["status"] | "all" | string | string[];
    sort?: string | string[];
    dir?: string | string[];
  };

  // Normalize searchParams
  const rawQ = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const rawStatus = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const q = (rawQ || "").toString().trim();

  const allowed: Array<Row["status"] | "all"> = [
    "all",
    "pending",
    "approved",
    "rejected",
  ];
  const norm = (rawStatus || "all").toString().toLowerCase();
  const status: Row["status"] | "all" = allowed.includes(norm as any)
    ? (norm as any)
    : "all";

  const rawSort = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  const rawDir = Array.isArray(sp.dir) ? sp.dir[0] : sp.dir;

  const allowedSorts = ["company", "phone", "status", "submitted_at"] as const;
  const sortKey = (rawSort || "submitted_at").toString().toLowerCase();
  const sort: (typeof allowedSorts)[number] = (
    allowedSorts as readonly string[]
  ).includes(sortKey)
    ? (sortKey as any)
    : "submitted_at";

  const dirKey = (rawDir || (sort === "submitted_at" ? "desc" : "asc"))
    .toString()
    .toLowerCase();
  const dir: "asc" | "desc" = dirKey === "desc" ? "desc" : "asc";

  const rawInvite = Array.isArray((sp as any).invite)
    ? (sp as any).invite[0]
    : (sp as any).invite;
  const rawPhone = Array.isArray((sp as any).phone)
    ? (sp as any).phone[0]
    : (sp as any).phone;
  const inviteUrl = rawInvite ? decodeURIComponent(String(rawInvite)) : "";
  const invitePhone = rawPhone ? String(rawPhone) : "";
  const rawEmail = Array.isArray((sp as any).email)
    ? (sp as any).email[0]
    : (sp as any).email;
  const inviteEmail = rawEmail ? String(rawEmail) : "";

  // Query Supabase
  const supabase = adminClient();
  let query = supabase.from("partners_applications").select("*").limit(300);

  const sortToColumn: Record<string, string> = {
    company: "company_name",
    phone: "phone",
    status: "status",
    submitted_at: "submitted_at",
  };
  const primaryCol = sortToColumn[sort] || "submitted_at";
  query = query.order(primaryCol, { ascending: dir === "asc" });
  if (primaryCol !== "submitted_at") {
    query = query.order("submitted_at", { ascending: false });
  }
  if (status && status !== "all") query = query.eq("status", status);
  if (q)
    query = query.or(
      [
        `phone.ilike.%${q}%`,
        `company_name.ilike.%${q}%`,
        `contact_name.ilike.%${q}%`,
        `email.ilike.%${q}%`,
      ].join(","),
    );
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const baseRows = (data || []) as Row[];
  const visible =
    status && status !== "all"
      ? baseRows.filter((r) => r.status === status)
      : baseRows;

  const getField = (r: Row) => {
    if (sort === "company") return (r.company_name || "").toLowerCase();
    if (sort === "phone") return (r.phone || "").toLowerCase();
    if (sort === "status") return (r.status || "").toLowerCase();
    return (r.submitted_at || "") as string;
  };
  const sortedVisible = [...visible].sort((a, b) => {
    const av = getField(a);
    const bv = getField(b);
    if (av === bv) return 0;
    return dir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
  });

  const rows: RowWithUrls[] = await Promise.all(
    sortedVisible.map(async (r) => {
      const cr = r.cr_path
        ? (
            await supabase.storage
              .from(STORAGE_BUCKET)
              .createSignedUrl(r.cr_path, 60 * 60)
          ).data?.signedUrl ?? null
        : null;
      const vat = r.vat_path
        ? (
            await supabase.storage
              .from(STORAGE_BUCKET)
              .createSignedUrl(r.vat_path, 60 * 60)
          ).data?.signedUrl ?? null
        : null;
      return { ...r, cr_href: cr, vat_href: vat };
    }),
  );

  // Global counters
  const totalRes = await supabase
    .from("partners_applications")
    .select("*", { count: "exact", head: true });
  const pendingRes = await supabase
    .from("partners_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  const approvedRes = await supabase
    .from("partners_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");
  const rejectedRes = await supabase
    .from("partners_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "rejected");

  const counts = {
    total: totalRes.count ?? 0,
    pending: pendingRes.count ?? 0,
    approved: approvedRes.count ?? 0,
    rejected: rejectedRes.count ?? 0,
  };

  return (
    <>
      {/* Page header row (inside Admin shell) */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/20 dark:border-white/10 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/50">
        <div className="min-w-0">
          <h1 className="m-0 text-xl font-extrabold tracking-tight">Partner Applications</h1>
          <p className="m-0 text-[12px] text-slate-500 dark:text-slate-400">Review, approve, invite; or reject with one click.</p>
        </div>
        <form method="GET" action="/admin/partner-applications" className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search phone, company, contact, email…"
              className="w-[280px]"
            />
            {status !== "all" && <input type="hidden" name="status" value={status} />}
          </div>
          <Button type="submit">Search</Button>
          {q && (
            <Button asChild variant="outline"><a href="/admin/partner-applications">Reset</a></Button>
          )}
          <Button id="btn-export-csv" type="button" variant="outline">Export CSV</Button>
        </form>
      </div>

      {/* Status pills */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {([
          { key: "all", label: "All", n: counts.total },
          { key: "pending", label: "Pending", n: counts.pending },
          { key: "approved", label: "Approved", n: counts.approved },
          { key: "rejected", label: "Rejected", n: counts.rejected },
        ] as const).map((opt) => {
          const active = status === opt.key;
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          params.set("status", opt.key);
          return (
            <a
              key={opt.key}
              href={`/admin/partner-applications?${params.toString()}`}
              className={[
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm",
                active
                  ? "bg-emerald-600 text-white"
                  : "border border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/50 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/50",
              ].join(" ")}
            >
              <span>{opt.label}</span>
              <span className={(active ? "bg-white/20 text-white" : "bg-white/70 dark:bg-slate-900/40") + " rounded-full px-2 text-xs font-bold"}>{opt.n}</span>
            </a>
          );
        })}
      </div>

      {/* Invite banner (if any) */}
      {inviteUrl && (
        <div className="mb-4 rounded-xl border border-emerald-300/50 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-100 p-3 flex flex-wrap items-center gap-2 shadow-sm">
          <div className="font-semibold mr-2">Invite generated:</div>
          <code id="invite-code" data-invite={inviteUrl} className="px-2 py-1 bg-white/70 dark:bg-slate-800/60 rounded text-xs break-all">{inviteUrl}</code>
          <Button id="btn-copy-invite" variant="outline" className="ml-auto">Copy Link</Button>
          {inviteEmail ? (
            <Button asChild variant="outline">
              <a
                href={`mailto:${inviteEmail}?subject=${encodeURIComponent("Your VariForce portal invite")}&body=${encodeURIComponent(`Hello ${inviteEmail.split("@")[0]},\n\nYou have been invited to VariForce.\n\nAccess link:\n${inviteUrl}\n\nThis link expires in 7 days. If you didn’t request this, please ignore.\n\n— BOCC Portal`)}`}
              >
                Send Email
              </a>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <a
                href={`mailto:?subject=${encodeURIComponent("Your VariForce portal invite")}&body=${encodeURIComponent(`Hello,\n\nYou have been invited to VariForce.\n\nAccess link:\n${inviteUrl}\n\nThis link expires in 7 days.\n\n— BOCC Portal`)}`}
              >
                Compose Email
              </a>
            </Button>
          )}
        </div>
      )}

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { key: "Total", val: counts.total },
          { key: "Pending", val: counts.pending },
          { key: "Approved", val: counts.approved },
          { key: "Rejected", val: counts.rejected },
        ].map((k) => (
          <Card key={k.key} className="border-white/20 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/50">
            <CardContent className="h-24 flex flex-col justify-center">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{k.key}</div>
              <div className="font-extrabold text-2xl tracking-tight">{k.val}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Table Card */}
      <Card className="overflow-hidden border-white/20 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/50">
        {/* Header row (sortable) */}
        <div className="grid grid-cols-[36px_minmax(0,1fr)_160px_120px_120px_90px] gap-2 px-4 py-3 border-b border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/50 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/50 text-sm font-semibold">
          <div>
            <input type="checkbox" id="chk-all" className="h-4 w-4 rounded border-slate-300 dark:border-slate-700" />
          </div>
          <SortLink label="Company / Contact" sortKey="company" q={q} status={status} currentSort={sort} dir={dir} />
          <SortLink label="Phone" sortKey="phone" q={q} status={status} currentSort={sort} dir={dir} />
          <SortLink label="Status" sortKey="status" q={q} status={status} currentSort={sort} dir={dir} />
          <div className="text-right">Submitted</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Rows */}
        <ul className="list-none m-0 p-0 divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((r) => (
            <li key={r.id} data-rowid={r.id} data-status={r.status} className="grid grid-cols-[36px_minmax(0,1fr)_160px_120px_120px_90px] gap-2 px-4 py-3 items-center hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition">
              <div>
                <input type="checkbox" name="row" value={r.id} className="h-4 w-4 rounded border-slate-300 dark:border-slate-700" />
              </div>
              <div className="min-w-0 cursor-pointer btn-view" data-id={r.id} title="View details">
                <div className="font-semibold text-[0.95rem] truncate">{r.company_name || "—"}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {r.contact_name || "—"}
                  {r.email ? ` • ${r.email}` : ""}
                  {r.city ? ` • ${r.city}` : ""}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {r.industry && (
                    <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 rounded-full px-2 h-5 leading-5 text-[11px] font-semibold">
                      {r.industry}
                    </span>
                  )}
                  {typeof r.want_rate_book === "boolean" && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Rate book: {r.want_rate_book ? "Yes" : "No"}
                    </span>
                  )}
                  {r.lang && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Lang: {(r.lang || "").toUpperCase()}</span>
                  )}
                  {(r.cr_href || r.vat_href) && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M21.44 11.05l-8.49 8.49a5 5 0 11-7.07-7.07l8.49-8.49a3.5 3.5 0 014.95 4.95l-8.49 8.49a2 2 0 11-2.83-2.83l8.49-8.49" />
                      </svg>
                      Docs
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm">{r.phone || "—"}</div>
              <div>
                {(() => {
                  const map = {
                    pending: "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
                    approved: "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
                    rejected: "bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200",
                  } as const;
                  const cls = (map as any)[r.status] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
                  return (
                    <Badge variant="secondary" className={`capitalize ${cls} ring-1 ring-emerald-500/15`}>
                      {r.status}
                    </Badge>
                  );
                })()}
              </div>
              <div className="text-right text-sm tabular-nums text-slate-500 dark:text-slate-400">
                {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—"}
              </div>
              <div className="flex items-center justify-end gap-1">
                {/* Quick actions (server) */}
                {r.status !== "approved" ? (
                  <form action={decideAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="decision" value="approved" />
                    <Button title="Approve + Invite" className="w-8 h-8 p-0 bg-emerald-600 hover:bg-emerald-700">✓</Button>
                  </form>
                ) : null}

                {r.status === "approved" ? (
                  <form action={decideAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="decision" value="resend" />
                    <Button title="Resend invite" className="w-8 h-8 p-0 bg-amber-500 hover:bg-amber-600" aria-label="Resend invite">↻</Button>
                  </form>
                ) : null}

                <form action={decideAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="decision" value="rejected" />
                  <Button title="Reject" className="w-8 h-8 p-0 bg-rose-500 hover:bg-rose-600">×</Button>
                </form>
              </div>
            </li>
          ))}

          {!rows.length && (
            <li className="px-6 py-16 text-center">
              <div className="mx-auto max-w-md">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 grid place-items-center">
                  <span className="text-2xl">🗂️</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">No applications yet</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">When partners apply from the website, they will appear here for review.</p>
                <Button asChild className="mt-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  <a href="/admin/partner-applications">Refresh</a>
                </Button>
              </div>
            </li>
          )}
        </ul>

        {/* Bulk toolbar (sticky inside card bottom) */}
        <div id="bulk-toolbar" className="hidden items-center justify-between border-t border-white/20 dark:border-white/10 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/60">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <strong id="bulk-count">0</strong> selected
          </div>
          <div className="flex gap-2">
            <form action={bulkAction} id="bulk-approve-form">
              <input type="hidden" name="ids" id="bulk-ids" />
              <input type="hidden" name="decision" value="approved" />
              <Button className="px-3 py-2 rounded-full border-0 bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">Approve selected</Button>
            </form>
            <form action={bulkAction} id="bulk-reject-form">
              <input type="hidden" name="ids" id="bulk-ids-reject" />
              <input type="hidden" name="decision" value="rejected" />
              <Button className="px-3 py-2 rounded-full border-0 bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600">Reject selected</Button>
            </form>
          </div>
        </div>
      </Card>

      {/* Modal Overlay */}
      <div id="details-backdrop" className="fixed inset-0 bg-slate-900/60 hidden z-[1000]" />
      <section
        id="details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(1040px,96vw)] max-h-[90vh] hidden z-[1001] overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/60 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/60"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 dark:border-white/10">
          <div className="min-w-0">
            <div id="details-title" className="font-semibold text-base truncate">Application</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Profile and documents</div>
          </div>
          <div className="flex gap-2">
            <form action={decideAction} id="form-approve">
              <input type="hidden" name="id" id="details-id-approve" />
              <input type="hidden" name="decision" value="approved" />
              <Button id="btn-approve" type="submit" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border-0 bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">Approve + Invite</Button>
            </form>
            <form action={decideAction} id="form-reject">
              <input type="hidden" name="id" id="details-id-reject" />
              <input type="hidden" name="decision" value="rejected" />
              <Button id="btn-reject" type="submit" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border-0 bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600">Reject</Button>
            </form>
            <Button type="button" id="btn-close-modal" aria-label="Close" variant="outline" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full">Close</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/50 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/50">
          <button className="tab-btn px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold" data-tab="details">Details</button>
          <button className="tab-btn px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold hidden" data-tab="cr">CR</button>
          <button className="tab-btn px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold hidden" data-tab="vat">VAT</button>
        </div>

        {/* Bodies */}
        <div id="tab-details" className="p-3 overflow-y-auto max-h-[calc(90vh-140px)]" />
        <div id="tab-cr" className="p-0 hidden overflow-hidden">
          <iframe id="cr-frame" title="CR" className="w-full h-[calc(90vh-140px)] border-0" loading="lazy" />
        </div>
        <div id="tab-vat" className="p-0 hidden overflow-hidden">
          <iframe id="vat-frame" title="VAT" className="w-full h-[calc(90vh-140px)] border-0" loading="lazy" />
        </div>
      </section>

      {/* Centralized JSON rows blob for modal & export */}
      <script id="rows-json" type="application/json">{JSON.stringify(rows)}</script>

      {/* Client script (external) */}
      <Script src="/admin-partner-applications.js" strategy="afterInteractive" />
    </>
  );
}

/** Sortable header link */
function SortLink({
  label,
  sortKey,
  q,
  status,
  currentSort,
  dir,
}: {
  label: string;
  sortKey: "company" | "phone" | "status" | "submitted_at" | string;
  q: string;
  status: Row["status"] | "all";
  currentSort: string;
  dir: "asc" | "desc";
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("status", String(status));
  params.set("sort", String(sortKey));
  const isActive = currentSort === sortKey;
  params.set("dir", isActive && dir === "asc" ? "desc" : "asc");
  const href = `/admin/partner-applications?${params.toString()}`;
  return (
    <a href={href} className="no-underline text-slate-900 dark:text-slate-100">
      {label} {isActive ? (dir === "asc" ? "▲" : "▼") : ""}
    </a>
  );
}