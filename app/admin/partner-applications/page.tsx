// app/admin/partner-applications/page.tsx
// BOCC • Admin — Partner Applications (modernized, server-only)

import * as React from "react";
import { createClient } from "@supabase/supabase-js";

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

export async function decideAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const decision = String(formData.get("decision") || "") as "approved" | "rejected";
  if (!id || !["approved", "rejected"].includes(decision)) return;
  const supabase = adminClient();
  await supabase
    .from("partners_applications")
    .update({ status: decision, reviewed_at: new Date().toISOString() })
    .eq("id", id);
}

export async function bulkAction(formData: FormData) {
  "use server";
  const idsCsv = String(formData.get("ids") || "");
  const decision = String(formData.get("decision") || "");
  const ids = idsCsv.split(",").map((s) => s.trim()).filter(Boolean);
  if (!ids.length || !["approved", "rejected"].includes(decision)) return;
  const supabase = adminClient();
  await supabase
    .from("partners_applications")
    .update({ status: decision, reviewed_at: new Date().toISOString() })
    .in("id", ids);
}

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "documents";

/** ================== Page ================== */
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

  const allowed: Array<Row["status"] | "all"> = ["all", "pending", "approved", "rejected"];
  const norm = (rawStatus || "all").toString().toLowerCase();
  const status: Row["status"] | "all" = allowed.includes(norm as any) ? (norm as any) : "all";

  const rawSort = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  const rawDir = Array.isArray(sp.dir) ? sp.dir[0] : sp.dir;

  const allowedSorts = ["company", "phone", "status", "submitted_at"] as const;
  const sortKey = (rawSort || "submitted_at").toString().toLowerCase();
  const sort: (typeof allowedSorts)[number] = (allowedSorts as readonly string[]).includes(sortKey)
    ? (sortKey as any)
    : "submitted_at";

  const dirKey = (rawDir || (sort === "submitted_at" ? "desc" : "asc")).toString().toLowerCase();
  const dir: "asc" | "desc" = dirKey === "desc" ? "desc" : "asc";

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
      ].join(",")
    );
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const baseRows = (data || []) as Row[];
  const visible = status && status !== "all" ? baseRows.filter((r) => r.status === status) : baseRows;

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
    return dir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const rows: RowWithUrls[] = await Promise.all(
    sortedVisible.map(async (r) => {
      const cr = r.cr_path
        ? (await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(r.cr_path, 60 * 60)).data
            ?.signedUrl ?? null
        : null;
      const vat = r.vat_path
        ? (await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(r.vat_path, 60 * 60)).data
            ?.signedUrl ?? null
        : null;
      return { ...r, cr_href: cr, vat_href: vat };
    })
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
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 px-4 py-5 grid grid-rows-[auto_auto_1fr] gap-2">

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-0">
        {[
          { key: "Total", val: counts.total },
          { key: "Pending", val: counts.pending },
          { key: "Approved", val: counts.approved },
          { key: "Rejected", val: counts.rejected },
        ].map((k) => (
          <div
            key={k.key}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-20 flex flex-col justify-center px-3 shadow-sm"
          >
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{k.key}</div>
            <div className="font-extrabold text-xl tracking-tight">{k.val}</div>
          </div>
        ))}
      </section>

      {/* Card */}
      <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur p-3 grid grid-rows-[auto_auto_1fr_auto] gap-1 shadow-sm">

        {/* Filters */}
        <form
          method="GET"
          action="/admin/partner-applications"
          className="flex flex-wrap items-center gap-2"
        >
          {/* Preserve current search */}
          {q ? <input type="hidden" name="q" value={q} /> : null}
          {(["all", "pending", "approved", "rejected"] as const).map((opt) => {
            const active = status === opt;
            const badge =
              opt === "all"
                ? counts.total
                : opt === "pending"
                ? counts.pending
                : opt === "approved"
                ? counts.approved
                : counts.rejected;
            return (
              <button
                key={opt}
                type="submit"
                name="status"
                value={opt}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition",
                  active
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50/60 dark:hover:bg-slate-800/50"
                ].join(" ")}
              >
                <span className="capitalize">{opt}</span>
                <span
                  className={[
                    "inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full px-1.5 font-bold",
                    active ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  ].join(" ")}
                >
                  {badge}
                </span>
              </button>
            );
          })}
        </form>

        {/* Bulk actions toolbar */}
        <div
          id="bulk-toolbar"
          className="hidden items-center justify-between border border-dashed border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-900/40"
        >
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <strong id="bulk-count">0</strong> selected
          </div>
          <div className="flex gap-2">
            <form action={bulkAction} id="bulk-approve-form">
              <input type="hidden" name="ids" id="bulk-ids" />
              <input type="hidden" name="decision" value="approved" />
              <button
                className="px-3 py-2 rounded-md border-0 bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                Approve selected
              </button>
            </form>
            <form action={bulkAction} id="bulk-reject-form">
              <input type="hidden" name="ids" id="bulk-ids-reject" />
              <input type="hidden" name="decision" value="rejected" />
              <button
                className="px-3 py-2 rounded-md border-0 bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600"
              >
                Reject selected
              </button>
            </form>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 grid grid-rows-[auto_1fr]">
          {/* Header */}
          <div className="grid grid-cols-[36px_minmax(0,1fr)_160px_120px_60px] gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900/60 text-sm font-bold sticky top-0 z-10">
            <div>
              <input
                type="checkbox"
                id="chk-all"
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
              />
            </div>
            <div>
              {(() => {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                params.set("status", status);
                const isActive = sort === "company";
                const nextDir = isActive && dir === "asc" ? "desc" : "asc";
                params.set("sort", "company");
                params.set("dir", nextDir);
                const href = `/admin/partner-applications?${params.toString()}`;
                return (
                  <a href={href} className="no-underline text-slate-900 dark:text-slate-100">
                    Company / Contact {isActive ? (dir === "asc" ? "▲" : "▼") : ""}
                  </a>
                );
              })()}
            </div>
            <div>
              {(() => {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                params.set("status", status);
                const isActive = sort === "phone";
                const nextDir = isActive && dir === "asc" ? "desc" : "asc";
                params.set("sort", "phone");
                params.set("dir", nextDir);
                const href = `/admin/partner-applications?${params.toString()}`;
                return (
                  <a href={href} className="no-underline text-slate-900 dark:text-slate-100">
                    Phone {isActive ? (dir === "asc" ? "▲" : "▼") : ""}
                  </a>
                );
              })()}
            </div>
            <div>
              {(() => {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                params.set("status", status);
                const isActive = sort === "status";
                const nextDir = isActive && dir === "asc" ? "desc" : "asc";
                params.set("sort", "status");
                params.set("dir", nextDir);
                const href = `/admin/partner-applications?${params.toString()}`;
                return (
                  <a href={href} className="no-underline text-slate-900 dark:text-slate-100">
                    Status {isActive ? (dir === "asc" ? "▲" : "▼") : ""}
                  </a>
                );
              })()}
            </div>
            <div className="text-right">View</div>
          </div>

          {/* Body */}
          <ul className="list-none m-0 p-0 overflow-y-auto max-h-[58vh] divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((r) => {
              return (
                <li
                  key={r.id}
                  data-rowid={r.id}
                  data-status={r.status}
                  className="grid grid-cols-[36px_minmax(0,1fr)_160px_120px_60px] gap-2 p-3 items-center"
                >
                  <div>
                    <input
                      type="checkbox"
                      name="row"
                      value={r.id}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-[0.95rem] text-slate-900 dark:text-slate-100 truncate">
                      {r.company_name || "—"}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {r.contact_name || "—"}
                      {r.email ? ` • ${r.email}` : ""}
                      {r.city ? ` • ${r.city}` : ""}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {r.industry && (
                        <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 rounded-full px-2 h-5 leading-5 text-xs font-semibold">
                          {r.industry}
                        </span>
                      )}
                      {typeof r.want_rate_book === "boolean" && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Rate book: {r.want_rate_book ? "Yes" : "No"}
                        </span>
                      )}
                      {r.lang && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Lang: {(r.lang || "").toUpperCase()}
                        </span>
                      )}
                      {(r.cr_href || r.vat_href) && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                          >
                            <path d="M21.44 11.05l-8.49 8.49a5 5 0 11-7.07-7.07l8.49-8.49a3.5 3.5 0 014.95 4.95l-8.49 8.49a2 2 0 11-2.83-2.83l8.49-8.49" />
                          </svg>
                          Docs
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-slate-900 dark:text-slate-100">{r.phone || "—"}</div>
                  <div>
                    {(() => {
                      const map = {
                        pending:
                          "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
                        approved:
                          "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
                        rejected:
                          "bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200",
                      } as const;
                      const cls =
                        (map as any)[r.status] ||
                        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
                      return (
                        <span
                          className={`inline-flex items-center h-6 px-2 rounded-full text-xs font-semibold capitalize ${cls}`}
                        >
                          {r.status}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="btn-view w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                      title="View"
                      data-id={r.id}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zm11 3a3 3 0 100-6 3 3 0 000 6z" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
            {!rows.length && (
              <li className="p-4 text-center text-slate-500 dark:text-slate-400">No applications</li>
            )}
          </ul>
        </div>

        {/* Footer note */}
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Data mirrors Supabase · Private bucket with signed URLs
        </div>
      </article>

      {/* Modal Overlay */}
      <div id="details-backdrop" className="fixed inset-0 bg-slate-900/60 hidden z-[1000]" />
      <section
        id="details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(1040px,96vw)] max-h-[90vh] hidden z-[1001] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl backdrop-blur"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="min-w-0">
            <div id="details-title" className="font-semibold text-base truncate">
              Application
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Profile and documents</div>
          </div>
          <div className="flex gap-2">
            <form action={decideAction} id="form-approve">
              <input type="hidden" name="id" id="details-id-approve" />
              <input type="hidden" name="decision" value="approved" />
              <button
                id="btn-approve"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border-0 bg-emerald-600 text-white text-sm font-semibold"
              >
                Approve
              </button>
            </form>
            <form action={decideAction} id="form-reject">
              <input type="hidden" name="id" id="details-id-reject" />
              <input type="hidden" name="decision" value="rejected" />
              <button
                id="btn-reject"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border-0 bg-rose-500 text-white text-sm font-semibold"
              >
                Reject
              </button>
            </form>
            <button
              type="button"
              id="btn-close-modal"
              aria-label="Close"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <button
            className="tab-btn px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold"
            data-tab="details"
          >
            Details
          </button>
          <button
            className="tab-btn px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold hidden"
            data-tab="cr"
          >
            CR
          </button>
          <button
            className="tab-btn px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold hidden"
            data-tab="vat"
          >
            VAT
          </button>
        </div>

        {/* Bodies */}
        <div id="tab-details" className="p-3 overflow-y-auto max-h-[calc(90vh-140px)]" />
        <div id="tab-cr" className="p-0 hidden overflow-hidden">
          <iframe
            id="cr-frame"
            title="CR"
            className="w-full h-[calc(90vh-140px)] border-0"
            loading="lazy"
          />
        </div>
        <div id="tab-vat" className="p-0 hidden overflow-hidden">
          <iframe
            id="vat-frame"
            title="VAT"
            className="w-full h-[calc(90vh-140px)] border-0"
            loading="lazy"
          />
        </div>
      </section>

      {/* Centralized JSON rows blob for modal view */}
      <script id="rows-json" type="application/json">
        {JSON.stringify(rows)}
      </script>

      {/* Client script (unchanged behavior) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  const qs = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));

  // Centralized rows cache for reliable modal view (avoids huge data-json attrs)
  const rowsBlob = document.getElementById('rows-json');
  let rowsArr = [];
  let rowsMap = {};
  try {
    rowsArr = rowsBlob ? JSON.parse(rowsBlob.textContent || '[]') : [];
    rowsArr.forEach(function(r){ rowsMap[r.id] = r; });
  } catch(e) { rowsArr = []; rowsMap = {}; }

  function light(h){ try{ const el = qs('[data-rowid="'+h+'"]'); if (el) el.style.background = 'rgba(16,185,129,0.10)'; }catch(e){} }
  function unlight(){ qsa('[data-rowid]').forEach(el => el.style.background = ''); }

  // Client fallback: ensure filter applies even if server ignores searchParams
  function applyFilterFromURL(){
    try{
      const sp = new URLSearchParams(location.search);
      const wanted = (sp.get('status')||'all').toLowerCase();
      const allowed = ['all','pending','approved','rejected'];
      const pick = allowed.includes(wanted) ? wanted : 'all';

      // show/hide rows
      const items = Array.from(document.querySelectorAll('li[data-status]'));
      items.forEach(function(li){
        const st = (li.getAttribute('data-status')||'').toLowerCase();
        li.style.display = (pick==='all' || st===pick) ? 'grid' : 'none';
      });
    }catch(e){}
  }

  function setBulkToolbar(){
    const checks = qsa('input[name="row"]').filter(cb => cb.checked);
    const cnt = checks.length;
    const bar = qs('#bulk-toolbar');
    const countEl = qs('#bulk-count');
    const ids = checks.map(cb => cb.value).join(',');
    const h1 = qs('#bulk-ids'); const h2 = qs('#bulk-ids-reject');
    if (h1) h1.value = ids; if (h2) h2.value = ids;
    if (countEl) countEl.textContent = String(cnt);
    bar && (bar.style.display = cnt ? 'flex' : 'none');

    // set indeterminate on master
    const master = qs('#chk-all');
    if (master && master instanceof HTMLInputElement){
      if (cnt === 0) { master.indeterminate = false; master.checked = false; }
      else {
        const total = qsa('input[name="row"]').length;
        master.indeterminate = cnt>0 && cnt<total;
        master.checked = cnt===total;
      }
    }
  }

  // Events: selection
  document.addEventListener('change', (e)=>{
    const t = e.target;
    if (!t) return;
    if (t.id === 'chk-all'){
      const on = t.checked;
      qsa('input[name="row"]').forEach(cb => { cb.checked = on; });
      setBulkToolbar();
    }
    if (t.name === 'row'){ setBulkToolbar(); }
  });

  // Modal elements
  const backdrop = qs('#details-backdrop');
  const modal = qs('#details-modal');
  const titleEl = qs('#details-title');
  const approveBtn = qs('#btn-approve');
  const rejectBtn = qs('#btn-reject');
  const idApprove = qs('#details-id-approve');
  const idReject = qs('#details-id-reject');

  const tabBtns = qsa('.tab-btn');
  const tabDetails = qs('#tab-details');
  const tabCR = qs('#tab-cr');
  const tabVAT = qs('#tab-vat');
  const crFrame = qs('#cr-frame');
  const vatFrame = qs('#vat-frame');

  let openId = null;

  function openModal(){
    if (backdrop) backdrop.style.display = 'block';
    if (modal) modal.style.display = 'block';
    document.documentElement.style.overflow = 'hidden';
  }
  function closeModal(){
    if (backdrop) backdrop.style.display = 'none';
    if (modal) modal.style.display = 'none';
    document.documentElement.style.overflow = '';
    openId = null;
    unlight();
  }
  function showTab(name){
    if (!tabDetails || !tabCR || !tabVAT) return;
    tabDetails.style.display = (name==='details')?'block':'none';
    tabCR.style.display = (name==='cr')?'block':'none';
    tabVAT.style.display = (name==='vat')?'block':'none';
    tabBtns.forEach(btn => {
      if (btn.dataset.tab === name) { btn.style.background = '#10b981'; btn.style.color = '#fff'; }
      else { btn.style.background = '#fff'; btn.style.color = '#111827'; }
    });
  }

  // Close events
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeModal(); });
  document.addEventListener('click', (e)=>{
    const t = e.target;
    if (t && t.id === 'details-backdrop') closeModal();
  });
  const closeBtn = qs('#btn-close-modal');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Tab click
  tabBtns.forEach(btn => btn.addEventListener('click', ()=> showTab(btn.dataset.tab)));

  // Approve/Reject submit -> immediately close for snappy UX (server will re-render)
  const f1 = qs('#form-approve'); const f2 = qs('#form-reject');
  if (f1) f1.addEventListener('submit', ()=> closeModal());
  if (f2) f2.addEventListener('submit', ()=> closeModal());

  // View buttons
  document.addEventListener('click', (e)=>{
    const trg = e.target && e.target.closest ? e.target.closest('.btn-view') : null;
    if (!trg) return;
    const rid = trg.getAttribute('data-id');
    const obj = rid ? rowsMap[rid] : null;
    if (!obj) { alert('Failed to open details'); return; }

    // Toggle if same row
    if (openId && openId === obj.id){ closeModal(); return; }

    // Row highlight
    unlight(); light(obj.id);

    // Fill header + hidden ids
    if (titleEl) titleEl.textContent = obj.company_name || 'Application';
    if (idApprove) idApprove.value = obj.id || '';
    if (idReject) idReject.value = obj.id || '';

    // Show actions only for pending
    const isPending = obj.status === 'pending';
    if (approveBtn) approveBtn.style.display = isPending ? 'inline-flex' : 'none';
    if (rejectBtn) rejectBtn.style.display = isPending ? 'inline-flex' : 'none';

    // Details body
    const lines = [];
    const span = (k, v)=> v ? '<div style="margin:4px 0;"><span style="color:#667085;">'+k+':</span> <strong>'+String(v)+'</strong></div>' : '';
    lines.push(span('Company', obj.company_name));
    lines.push(span('Contact', obj.contact_name));
    lines.push(span('Phone', obj.phone));
    lines.push(span('Email', obj.email));
    lines.push(span('City', obj.city));
    lines.push(span('Industry', obj.industry));
    lines.push(span('Language', obj.lang && String(obj.lang).toUpperCase()));
    if (obj.want_rate_book !== undefined) lines.push(span('Wants Rate Book', obj.want_rate_book ? 'Yes':'No'));
    lines.push(span('CR Number', obj.cr_number));
    lines.push(span('VAT Number', obj.vat_number));
    lines.push(span('Status', obj.status));
    lines.push(span('Submitted At', obj.submitted_at));
    lines.push(span('Reviewed At', obj.reviewed_at));
    lines.push(span('Reviewer ID', obj.reviewer_id));
    if (tabDetails) tabDetails.innerHTML = lines.join('');

    // Tabs availability + sources
    const hasCR = !!obj.cr_href;
    const hasVAT = !!obj.vat_href;
    const tabCRBtn = qsa('.tab-btn').find(b => b.dataset.tab==='cr');
    const tabVATBtn = qsa('.tab-btn').find(b => b.dataset.tab==='vat');
    if (tabCRBtn) tabCRBtn.style.display = hasCR ? 'inline-flex' : 'none';
    if (tabVATBtn) tabVATBtn.style.display = hasVAT ? 'inline-flex' : 'none';
    if (crFrame) (crFrame).src = hasCR ? obj.cr_href : 'about:blank';
    if (vatFrame) (vatFrame).src = hasVAT ? obj.vat_href : 'about:blank';

    // Default active tab
    showTab('details');

    openId = obj.id || null;
    openModal();
  });

  // Defer filter to avoid hydration mismatch: run only after window load
  window.addEventListener('load', function(){
    // give React a paint frame before mutating
    requestAnimationFrame(function(){
      setTimeout(applyFilterFromURL, 0);
    });
  });
  // also re-apply on popstate (back/forward navigation)
  window.addEventListener('popstate', function(){
    requestAnimationFrame(function(){
      setTimeout(applyFilterFromURL, 0);
    });
  });
})();
          `,
        }}
      />
    </main>
  );
}