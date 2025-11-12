'use client';
/* cspell:ignore ilike */

import { useEffect, useMemo, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';

// ---- Types ----
type Tenant = {
  id: string;
  name: string | null;
  logo_url?: string | null;
};

type Project = {
  id: string;
  name: string | null;
  description?: string | null;
  status?: 'new' | 'estimate' | 'approved' | 'in_progress' | 'completed' | 'archived' | string | null;
  view_mode?: string | null;
  tenant_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

// Row = project with joined tenant (resolved client-side to avoid FK alias issues)
type Row = Project & { tenant: Tenant | null };

// ---- Helpers ----
function makeSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-emerald-100/50 text-emerald-700 border-emerald-300',
  estimate: 'bg-blue-100/50 text-blue-700 border-blue-300',
  approved: 'bg-emerald-200/60 text-emerald-800 border-emerald-400',
  in_progress: 'bg-amber-100/60 text-amber-800 border-amber-300',
  completed: 'bg-gray-200/60 text-gray-800 border-gray-300',
  archived: 'bg-slate-200/60 text-slate-700 border-slate-300',
};

function Badge({ status }: { status?: string | null }) {
  const cls =
    STATUS_BADGE[status ?? ''] ??
    'bg-slate-100/60 text-slate-700 border-slate-300';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${cls}`}>
      {status ?? '—'}
    </span>
  );
}

function Logo({ src, alt, size = 24 }: { src?: string | null; alt: string; size?: number }) {
  if (!src) {
    return <div className="h-6 w-6 rounded bg-muted/60 border border-border" />;
  }
  // Use <img> to avoid next/image domain config issues when external domains are used.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="h-6 w-6 rounded object-cover border border-border"
    />
  );
}

export default function ProjectsPage() {
  const supabase = useMemo(makeSupabase, []);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>(''); // All by default
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setErrorMsg(null);
      try {
        // 1) Load projects (only columns that exist per API docs)
        let query = supabase
          .from('projects')
          .select('id,name,description,status,view_mode,tenant_id,created_at,updated_at')
          .order('created_at', { ascending: false })
          .limit(100);

        if (q.trim()) {
          // Search by project name or description
          const term = q.trim();
          query = query.or([
            `name.ilike.%${term}%`,
            `description.ilike.%${term}%`,
          ].join(','));
        }

        if (status) {
          query = query.eq('status', status);
        }

        const { data: projects, error } = await query;
        if (error) throw new Error(error.message || JSON.stringify(error));

        // 2) Load tenant records in one batch to avoid relying on FK alias names
        const tenantIds = Array.from(
          new Set((projects ?? []).map((p) => p.tenant_id).filter((x): x is string => !!x))
        );

        let tenantsById = new Map<string, Tenant>();
        if (tenantIds.length) {
          const { data: tenants, error: tErr } = await supabase
            .from('tenants')
            .select('id,name,logo_url')
            .in('id', tenantIds);
          if (tErr) throw new Error(tErr.message || JSON.stringify(tErr));
          tenantsById = new Map((tenants ?? []).map((t) => [t.id, t] as const));
        }

        const hydrated: Row[] = (projects ?? []).map((p) => ({
          ...p,
          tenant: p.tenant_id ? (tenantsById.get(p.tenant_id) ?? null) : null,
        }));

        if (!cancelled) setRows(hydrated);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setErrorMsg(msg || 'Failed to load projects');
        console.error('load projects error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, refreshTick]);

  const empty = !loading && rows.length === 0 && !errorMsg;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshTick((n) => n + 1)}
            className="rounded-md border bg-white/40 backdrop-blur px-3 py-2 text-sm hover:bg-white/60 transition"
            title="Refresh"
          >
            Refresh
          </button>
          <Link
            href="/admin/projects/new"
            className="rounded-md border border-emerald-300 bg-emerald-50/70 text-emerald-900 px-3 py-2 text-sm hover:bg-emerald-100 transition"
          >
            + New Project
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects…"
            className="w-full rounded-md border bg-white/50 backdrop-blur px-3 py-2 text-sm outline-none ring-emerald-500/20 focus:ring-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border bg-white/50 backdrop-blur px-3 py-2 text-sm outline-none ring-emerald-500/20 focus:ring-2"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="estimate">Estimate</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50/70 text-red-800 px-3 py-2 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white/50 backdrop-blur">
        <table className="min-w-full text-sm">
          <thead className="bg-emerald-50/70 text-emerald-900">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Project</th>
              <th className="px-3 py-2 text-left font-medium">Company</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Created</th>
              <th className="px-3 py-2 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-4" colSpan={5}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.map((r) => {
              const d = r.created_at ? new Date(r.created_at) : null;
              const created = d ? d.toLocaleDateString() : '—';
              return (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="font-medium">{r.name ?? '—'}</div>
                      {r.view_mode ? (
                        <span className="text-xs text-muted-foreground">{r.view_mode}</span>
                      ) : null}
                      {r.description ? (
                        <span className="line-clamp-1 text-xs text-muted-foreground">{r.description}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Logo src={r.tenant?.logo_url} alt={r.tenant?.name ?? 'Company'} />
                      <span className="truncate">{r.tenant?.name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Badge status={r.status} />
                  </td>
                  <td className="px-3 py-2">{created}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/projects/${r.id}`}
                        className="rounded border px-2 py-1 hover:bg-emerald-50"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/projects/${r.id}/edit`}
                        className="rounded border px-2 py-1 hover:bg-emerald-50"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {empty && (
              <tr>
                <td className="px-3 py-8 text-center text-muted-foreground" colSpan={5}>
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Small note */}
      <p className="mt-3 text-xs text-muted-foreground">
        Showing latest 100 projects. Use search and filters to refine.
      </p>
    </div>
  );
}