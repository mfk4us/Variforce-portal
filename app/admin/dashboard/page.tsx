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

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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
  opts: { eq?: [key: string, val: any]; gteDate?: [key: string, days: number] } = {}
) {
  try {
    const sb = rlsClient();
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
    const { count } = await q;
    return count ?? 0;
  } catch {
    // If table or column doesn't exist yet, render 0 gracefully
    return 0;
  }
}

async function getDashboardCounts() {
  const [
    tenants,
    members,
    projects,
    pendingJobs,
    jobs7d,
  ] = await Promise.all([
    safeCount("tenants"),
    safeCount("members"),
    safeCount("projects"),
    safeCount("jobs", { eq: ["status", "pending"] }),
    safeCount("jobs", { gteDate: ["created_at", 7] }),
  ]);

  return {
    tenants,
    members,
    projects,
    pendingJobs,
    jobs7d,
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

  // Simple improvement suggestions
  const improvements: { title: string; detail: string }[] = [];
  if (counts.pendingJobs > 0) {
    improvements.push({
      title: "Review pending jobs",
      detail: `You have ${counts.pendingJobs} job(s) awaiting approval.`,
    });
  }
  if (counts.projects === 0) {
    improvements.push({
      title: "Create your first project",
      detail: "Kick off by creating a test tenant and a sample project to validate flows.",
    });
  }
  if (counts.members < 3) {
    improvements.push({
      title: "Invite more team members",
      detail: "Add at least a workforce_leader and a technician to test assignments.",
    });
  }
  if (improvements.length === 0) {
    improvements.push({
      title: "Everything looks good",
      detail: "No urgent actions. You can proceed to configure modules & billing.",
    });
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 space-y-6">
      {/* KPI Row */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Tenants" value={counts.tenants} />
        <KpiCard label="Members" value={counts.members} />
        <KpiCard label="Projects" value={counts.projects} />
        <KpiCard label="Pending Jobs" value={counts.pendingJobs} />
        <KpiCard label="Jobs this week" value={counts.jobs7d} />
      </section>

      {/* Improvements */}
      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur p-6">
          <h2 className="text-base font-semibold mb-2">Improvements</h2>
          <ul className="space-y-2">
            {improvements.map((it, i) => (
              <li key={i} className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="text-sm font-medium">{it.title}</div>
                <div className="text-xs text-muted-foreground">{it.detail}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur p-6">
          <h2 className="text-base font-semibold mb-2">Quick actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/members/new"
              className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
            >
              Create Member
            </Link>
            <Link
              href="/admin/jobs"
              className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
            >
              Review Jobs
            </Link>
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
            >
              New Project
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
    </div>
  );
}