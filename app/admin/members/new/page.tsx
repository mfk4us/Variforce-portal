import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createServiceClient(url, service);
}

// Optional helper: look up auth user by email using admin API
async function findAuthUserByEmail(email: string) {
  const sb = serviceClient();
  // @ts-ignore: admin API is supported on server with service key
  const { data, error } = await sb.auth.admin.listUsers({ page: 1, perPage: 50 });
  if (error) return null;
  const needle = email.toLowerCase();
  return data.users.find((u: any) => (u.email || "").toLowerCase() === needle) || null;
}

export async function createMemberAction(formData: FormData) {
  "use server";

  const tenant_id_raw = String(formData.get("tenant_id") ?? "").trim();
  const tenant_id = tenant_id_raw.length ? tenant_id_raw : null;

  const role = String(formData.get("role") || "").trim();
  const user_id_raw = String(formData.get("user_id") || "").trim();
  const email_raw = String(formData.get("email") || "").trim();

  // Which identifier are we using?
  let user_id = user_id_raw || "";

  if (!user_id && !email_raw) {
    redirect("/admin/members/new?error=need_user");
  }

  // If email provided, resolve to auth user_id
  if (!user_id && email_raw) {
    const authUser = await findAuthUserByEmail(email_raw);
    if (!authUser) {
      redirect("/admin/members/new?error=user_not_found");
    }
    user_id = authUser.id;
  }

  // Validate role against your enum set
  const allowed = new Set([
    "admin",
    "team_member",          // BOCC ops (internal)
    "workforce_leader",
    "technician",
    "helper",
    "company_manager",      // tenant manager
    "customer_employee"     // tenant employee
  ]);
  if (!allowed.has(role)) {
    redirect("/admin/members/new?error=invalid_role");
  }

  // Tenant must be present for tenant roles; internal roles can be null-tenant
  const tenantRoles = new Set(["company_manager", "customer_employee"]);
  if (tenantRoles.has(role) && !tenant_id) {
    redirect("/admin/members/new?error=tenant_required");
  }

  const sb = serviceClient();

  // Insert directly into members
  const { error: insertErr } = await sb
    .from("members")
    .insert({
      id: crypto.randomUUID(),
      tenant_id,             // null for internal BOCC staff
      user_id,
      role,                  // must match member_role enum
      status: "active"
    });

  // Optional audit trail
  if (!insertErr) {
    await sb.from("admin_actions").insert({
      action: "create_member_manual",
      entity: "member",
      after_json: { tenant_id, user_id, role }
    });
  }

  revalidatePath("/admin/dashboard");
  if (insertErr) {
    redirect(`/admin/members/new?error=insert_failed`);
  }
  redirect(`/admin/dashboard?ok=member_created`);
}

async function loadTenants() {
  const sb = serviceClient();
  const { data } = await sb
    .from("tenants")
    .select("id, name, status")
    .order("name", { ascending: true });
  return data ?? [];
}

export default async function NewMemberPage({
  searchParams
}: {
  searchParams?: { [k: string]: string | string[] | undefined }
}) {
  const tenants = await loadTenants();
  const ok = typeof searchParams?.ok === "string" ? String(searchParams?.ok) : null;
  const error = typeof searchParams?.error === "string" ? String(searchParams?.error) : null;

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Link Existing Auth User → Create Member</h1>
          <Link href="/admin/dashboard" className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10">
            ← Back to dashboard
          </Link>
        </div>

        <div className="rounded-2xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur p-6">
          {ok && (
            <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 px-3 py-2 text-sm">
              {ok === "member_created" ? "Member created." : "Success."}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-100 px-3 py-2 text-sm">
              {error === "need_user" && "Enter a user_id or email."}
              {error === "user_not_found" && "No auth user found for that email."}
              {error === "invalid_role" && "Selected role is not allowed."}
              {error === "tenant_required" && "Tenant is required for company roles."}
              {error === "insert_failed" && "Failed to create member. Please try again."}
              {!["need_user","user_not_found","invalid_role","tenant_required","insert_failed"].includes(error) && "Something went wrong."}
            </div>
          )}

          <p className="text-sm text-muted-foreground mb-5">
            Use this when you already created a user in Supabase Auth and want to grant access by inserting a row into{" "}
            <code>members</code>.
          </p>

          <form action={createMemberAction} className="grid gap-4">
            <label className="grid gap-1">
              <span className="text-xs">Tenant (required for company roles)</span>
              <select name="tenant_id" className="h-11 rounded-md border px-3 bg-white/80 dark:bg-black/40" defaultValue="">
                <option value="">BOCC (internal)</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.status === "inactive" ? "(inactive)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="text-xs">Auth User ID (uuid)</span>
                <input
                  type="text"
                  name="user_id"
                  placeholder="paste user_id from Supabase Auth"
                  className="h-11 rounded-md border px-3 bg-white/80 dark:bg-black/40"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs">OR Auth Email (we’ll look it up)</span>
                <input
                  type="email"
                  name="email"
                  placeholder="user@company.com"
                  className="h-11 rounded-md border px-3 bg-white/80 dark:bg-black/40"
                />
              </label>
            </div>

            <label className="grid gap-1">
              <span className="text-xs">Role</span>
              <select name="role" required className="h-11 rounded-md border px-3 bg-white/80 dark:bg-black/40" defaultValue="company_manager">
                {/* Tenant roles */}
                <option value="company_manager">Company Manager (Tenant)</option>
                <option value="customer_employee">Company Employee (Tenant)</option>
                {/* Internal BOCC roles */}
                <option value="team_member">BOCC Team Member (Ops)</option>
                <option value="workforce_leader">Workforce Leader</option>
                <option value="technician">Technician</option>
                <option value="helper">Helper</option>
              </select>
            </label>

            <div className="flex items-center gap-2 pt-2">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20"
              >
                Create Member
              </button>
            </div>
          </form>

          <div className="mt-6 text-xs text-muted-foreground">
            Tips:
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Use **tenant + company_manager** for the customer’s initial manager account.</li>
              <li>Use **BOCC (internal) + team_member/workforce_leader/technician/helper** for BOCC staff.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}