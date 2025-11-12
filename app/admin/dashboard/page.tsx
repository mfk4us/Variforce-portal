/**
 * Admin → Dashboard
 * Server component that fetches KPI counts via Supabase (RLS).
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import * as React from "react";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath, redirect } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ExternalLink,
  Building2,
  Users as UsersIcon,
  FolderKanban,
  ClipboardList,
  Handshake,
  FileSpreadsheet,
  Receipt,
  BadgeCheck,
  Clock,
  XCircle,
  ChevronRight,
  UserPlus,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// NOTE: Admin dashboard reads use the service-role key on the server only (never sent to the client),
// so that RLS on tenant-scoped tables doesn't filter out global admin visibility.

// RSC-safe cookie adapter (no-ops for mutators)
function rlsClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        try {
          return cookies().get(name)?.value;
        } catch {
          return undefined;
        }
      },
      set() {},
      remove() {},
    },
  });
}

// Service-role client (full access, no RLS) for server actions
function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createServiceClient(url, service);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function safeCount<T extends Record<string, any>>(
  table: string,
  opts: { eq?: [key: string, val: any]; gteDate?: [key: string, days: number]; useService?: boolean } = {}
) {
  try {
    const sb = opts.useService ? serviceClient() : rlsClient();
    let q = sb.from(table).select("*", { count: "exact", head: true });
    if (opts.eq) {
      const [k, v] = opts.eq;
      q = q.eq(k, v as any);
    }
    if (opts.gteDate) {
      const [k, days] = opts.gteDate;
      const since = new Date();
      since.setDate(since.getDate() - days);
      q = q.gte(k, since.toISOString());
    }
    const { count, error } = await q;
    if (error) throw error;
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function safeList<T = any>(
  table: string,
  opts: {
    select?: string;
    order?: [column: string, { ascending?: boolean }?];
    limit?: number;
    eq?: [key: string, val: any];
    useService?: boolean;
  } = {}
): Promise<T[]> {
  try {
    const sb = opts.useService ? serviceClient() : rlsClient();
    let q = sb.from(table).select(opts.select || "*");
    if (opts.eq) {
      const [k, v] = opts.eq;
      q = q.eq(k, v as any);
    }
    if (opts.order) {
      const [col, cfg] = opts.order;
      q = q.order(col, cfg || { ascending: false });
    }
    if (opts.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) throw error;
    return (data as T[]) || [];
  } catch {
    return [] as T[];
  }
}

async function getRecentPartnerApplications() {
  return safeList("partners_applications", {
    select: "*",
    order: ["created_at", { ascending: false }],
    limit: 5,
    eq: ["status", "pending"],
    useService: true,
  });
}

async function getRecentProjects() {
  return safeList("projects", {
    select: "id, name, customer_name, stage, created_at",
    order: ["created_at", { ascending: false }],
    limit: 5,
    useService: true,
  });
}

async function getRecentEstimates() {
  return safeList("estimates", {
    select: "id, number, customer_name, total, status, created_at",
    order: ["created_at", { ascending: false }],
    limit: 5,
    useService: true,
  });
}

async function getRecentInvoices() {
  return safeList("invoices", {
    select: "id, number, customer_name, total, status, created_at",
    order: ["created_at", { ascending: false }],
    limit: 5,
    useService: true,
  });
}

async function getRecentMembers() {
  return safeList("members", {
    select:
      "id, full_name, name, display_name, email, contact_email, user_email, role, internal_role, title, created_at, tenant_id, company_name, tenant:tenants(name)",
    order: ["created_at", { ascending: false }],
    limit: 5,
    useService: true,
  });
}

async function getRecentSurveyRequests() {
  return safeList("survey_requests", {
    select: "id, requester_name, requester_phone, requester_email, project_name, status, created_at",
    order: ["created_at", { ascending: false }],
    limit: 5,
    useService: true,
  });
}

async function getRecentSurveyJobs() {
  return safeList("jobs", {
    select: "id, name, customer_name, type, status, created_at",
    order: ["created_at", { ascending: false }],
    limit: 5,
    eq: ["type", "survey"],
    useService: true,
  });
}

async function getDashboardCounts() {
  const [
    tenants,
    members,
    projects,
    pendingJobs,
    jobs7d,
    partnerAppsPending,
    estimates,
    invoices,
  ] = await Promise.all([
    safeCount("tenants", { useService: true }),
    safeCount("members", { useService: true }),
    safeCount("projects", { useService: true }),
    safeCount("jobs", { eq: ["status", "pending"], useService: true }),
    safeCount("jobs", { gteDate: ["created_at", 7], useService: true }),
    safeCount("partners_applications", { eq: ["status", "pending"], useService: true }),
    safeCount("estimates", { useService: true }),
    safeCount("invoices", { useService: true }),
  ]);

  const [surveyReqCount, surveyJobCount] = await Promise.all([
    safeCount("survey_requests", { useService: true }),
    safeCount("jobs", { eq: ["type", "survey"], useService: true }),
  ]);

  return {
    tenants,
    members,
    projects,
    pendingJobs,
    jobs7d,
    partnerAppsPending,
    estimates,
    invoices,
    surveys: surveyReqCount || surveyJobCount,
  };
}

// ============================
// Server Actions (Service-role)
// ============================

export async function createTenantAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const providedSlug = String(formData.get("slug") || "").trim();

  if (!name || !email) {
    redirect("/admin/dashboard?create=tenant&error=missing_fields");
  }

  const sb = serviceClient();

  // 1) Insert tenant
  const slug = providedSlug ? slugify(providedSlug) : slugify(name);
  const { data: tenant, error: tenantErr } = await sb
    .from("tenants")
    .insert({ name, slug, status: "active" })
    .select("id, name, slug")
    .single();

  if (tenantErr || !tenant) {
    redirect("/admin/dashboard?create=tenant&error=tenant_insert_failed");
  }

  // 2) Invite manager user with default_tenant_id + role metadata
  const { data: invite, error: inviteErr } = await sb.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: name + " Manager",
      default_tenant_id: tenant.id,
      role: "company_manager",
    },
    // redirectTo could be your portal URL if you want post-confirm redirect
    // redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/login`
  });

  // We do not insert into members here; our trigger `sync_auth_user_to_members`
  // will create the member row upon user creation/verification using metadata.

  // 3) Revalidate and route back with success
  revalidatePath("/admin/dashboard");
  if (inviteErr) {
    redirect(`/admin/dashboard?create=tenant&ok=1&warn=invite`);
  }
  redirect("/admin/dashboard?ok=tenant_created");
}

export async function createWorkforceAction(formData: FormData) {
  "use server";
  const full_name = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "").trim(); // team_member | workforce_leader | technician | helper

  if (!full_name || !email || !role) {
    redirect("/admin/dashboard?create=workforce&error=missing_fields");
  }

  const sb = serviceClient();

  // 1) Invite internal (BOCC) user; trigger will upsert members(tenant_id null, role)
  const { error: inviteErr } = await sb.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name,
      bocc_internal: true,
      internal_role: role,
    },
    // redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/login`
  });

  revalidatePath("/admin/dashboard");
  if (inviteErr) {
    redirect(`/admin/dashboard?create=workforce&warn=invite_failed`);
  }
  redirect("/admin/dashboard?ok=workforce_invited");
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const counts = await getDashboardCounts();
  const [partnerApps, recentProjects, recentEstimates, recentInvoices, recentMembers] = await Promise.all([
    getRecentPartnerApplications(),
    getRecentProjects(),
    getRecentEstimates(),
    getRecentInvoices(),
    getRecentMembers(),
  ]);
  const [surveyRequests, surveyJobs] = await Promise.all([
    getRecentSurveyRequests(),
    getRecentSurveyJobs(),
  ]);
  const recentSurveys = surveyRequests.length > 0 ? surveyRequests : surveyJobs;

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 space-y-8">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Admin overview</p>
        </div>
        {process.env.NEXT_PUBLIC_SHOW_SUPABASE_LINK === "1" && process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <Link
            href={process.env.NEXT_PUBLIC_SUPABASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
          >
            Open in Supabase
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* KPI Row */}
      <section className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <KpiCard label="Tenants" value={counts.tenants} Icon={Building2} />
        <KpiCard label="Members" value={counts.members} Icon={UsersIcon} />
        <KpiCard label="Projects" value={counts.projects} Icon={FolderKanban} />
        <KpiCard label="Pending Jobs" value={counts.pendingJobs} Icon={ClipboardList} />
        <KpiCard label="Jobs this week" value={counts.jobs7d} Icon={ClipboardList} />
        <KpiCard label="Survey Requests" value={counts.surveys ?? 0} Icon={ClipboardList} />
        <KpiCard label="Pending Partners" value={counts.partnerAppsPending} Icon={Handshake} />
        <KpiCard label="Estimates" value={counts.estimates} Icon={FileSpreadsheet} />
        <KpiCard label="Invoices" value={counts.invoices} Icon={Receipt} />
      </section>

      {/* Two-column grid: activity & finance */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Activity column */}
        <div className="space-y-6">
          <CardBlock title="Pending Partner Applications" icon={Handshake} href="/admin/partner-applications">
            <TableList
              empty="No partner applications."
              headers={["Company", "Contact", "Phone", "Status", "Created"]}
              rows={partnerApps.map((r: any) => [
                r.company_name ?? r.company ?? r.name ?? "—",
                r.contact_name ?? r.requester_name ?? r.contact_email ?? "—",
                r.contact_phone ?? r.phone ?? "—",
                StatusBadge.inline(r.status),
                new Date(r.created_at ?? r.inserted_at ?? Date.now()).toLocaleDateString(),
              ])}
            />
          </CardBlock>

          <CardBlock title="Survey Requests" icon={ClipboardList} href="/admin/surveys">
            <TableList
              empty="No survey requests."
              headers={["Requester", "Phone", "Project", "Status", "Created"]}
              rows={recentSurveys.map((s: any) => [
                s.requester_name ?? s.customer_name ?? s.name ?? "—",
                s.requester_phone ?? "—",
                s.project_name ?? s.name ?? "—",
                StatusBadge.inline(s.status),
                new Date(s.created_at).toLocaleDateString(),
              ])}
            />
          </CardBlock>

          <CardBlock title="Latest Projects" icon={FolderKanban} href="/admin/projects">
            <TableList
              empty="No projects found."
              headers={["Project", "Customer", "Stage", "Created"]}
              rows={recentProjects.map((p: any) => [
                p.name ?? "—",
                p.customer_name ?? "—",
                p.stage ?? "—",
                new Date(p.created_at).toLocaleDateString(),
              ])}
            />
          </CardBlock>

          <CardBlock title="Newest Members" icon={UserPlus} href="/admin/members">
            <TableList
              empty="No members yet."
              headers={["Name", "Email", "Role", "Joined"]}
              rows={recentMembers.map((m: any) => {
                const memberName = m.full_name ?? m.name ?? m.display_name ?? "—";
                const companyName = (m.tenant && m.tenant.name) ?? m.company_name ?? m.tenant_name ?? (m.tenant_id ? "Company" : "BOCC");
                const email = m.email ?? m.contact_email ?? m.user_email ?? "—";
                const role = m.role ?? m.internal_role ?? m.title ?? "—";
                const joined = new Date(m.created_at ?? m.inserted_at ?? Date.now()).toLocaleDateString();
                return [
                  `${memberName} · ${companyName}`,
                  email,
                  role,
                  joined,
                ];
              })}
            />
          </CardBlock>
        </div>

        {/* Finance column */}
        <div className="space-y-6">
          <CardBlock title="Latest Estimates" icon={FileSpreadsheet} href="/admin/estimates">
            <TableList
              empty="No estimates yet."
              headers={["#", "Customer", "Total", "Status", "Created"]}
              rows={recentEstimates.map((e: any) => [
                e.number ?? e.id,
                e.customer_name ?? "—",
                (e.total ?? 0).toLocaleString(),
                StatusBadge.inline(e.status),
                new Date(e.created_at).toLocaleDateString(),
              ])}
            />
          </CardBlock>

          <CardBlock title="Latest Invoices" icon={Receipt} href="/admin/invoices-payments">
            <TableList
              empty="No invoices yet."
              headers={["#", "Customer", "Total", "Status", "Created"]}
              rows={recentInvoices.map((i: any) => [
                i.number ?? i.id,
                i.customer_name ?? "—",
                (i.total ?? 0).toLocaleString(),
                StatusBadge.inline(i.status),
                new Date(i.created_at).toLocaleDateString(),
              ])}
            />
          </CardBlock>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, value, Icon }: { label: string; value: number; Icon?: LucideIcon }) {
  return (
    <div className="rounded-2xl bg-gradient-to-tr from-emerald-400/30 to-cyan-400/30 p-[1px]">
      <div className="rounded-2xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur p-4 sm:p-5 h-full transition-transform duration-200 hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{label}</div>
          {Icon ? <Icon className="h-4 w-4 opacity-70" /> : null}
        </div>
        <div className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function CardBlock({ title, href, icon: TitleIcon, children }: { title: string; href: string; icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur">
      <div className="flex items-center justify-between px-6 pt-5">
        <div className="flex items-center gap-2">
          {TitleIcon ? <TitleIcon className="h-4 w-4 opacity-80" /> : null}
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline dark:text-emerald-400">
          View all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent mb-4" />
        {children}
      </div>
    </div>
  );
}

const StatusBadge = {
  inline(status?: string) {
    const s = (status || "").toLowerCase();
    let cls = "bg-muted text-foreground/80";
    let Icon: LucideIcon | null = null;
    if (["paid", "approved", "accepted"].includes(s)) {
      cls = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
      Icon = BadgeCheck;
    } else if (["pending", "draft"].includes(s)) {
      cls = "bg-amber-500/15 text-amber-700 dark:text-amber-300";
      Icon = Clock;
    } else if (["rejected", "void", "overdue"].includes(s)) {
      cls = "bg-rose-500/15 text-rose-700 dark:text-rose-300";
      Icon = XCircle;
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {status ?? "—"}
      </span>
    );
  },
};

function TableList({ headers, rows, empty }: { headers: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (!rows || rows.length === 0) {
    return <div className="text-sm text-muted-foreground">{empty}</div>;
  }
  return (
    <>
      {/* Desktop/Tablet */}
      <div className="hidden md:block overflow-x-auto rounded-lg border">
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