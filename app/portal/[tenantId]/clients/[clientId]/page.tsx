// app/portal/[tenantId]/clients/[clientId]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { Eye } from "lucide-react";
import { updateEndClientAction } from "../action";

export const dynamic = "force-dynamic";

const DEFAULT_TENANT_ID = "24f1fddd-76c0-4b05-b600-06ef351109e2";

interface ClientDetailPageProps {
  params: Promise<{ tenantId: string; clientId: string }>;
  searchParams?: Promise<{ tab?: string; mode?: string }>;
}

type EndClientRow = {
  id: string;
  tenant_id: string;
  company_name: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address_json: any;
  notes: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
};

type ProjectRow = {
  id: string;
  tenant_id: string;
  name: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
};

export default async function ClientDetailPage({
  params,
  searchParams,
}: ClientDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const tenantId = resolvedParams?.tenantId;
  const clientId = resolvedParams?.clientId;
  const activeTab = (resolvedSearchParams.tab || "overview") as
    | "overview"
    | "projects"
    | "surveys"
    | "estimates";
  const isEditing = (resolvedSearchParams.mode || "") === "edit";

  const effectiveTenantId =
    tenantId && tenantId !== "undefined" ? tenantId : DEFAULT_TENANT_ID;

  const supabase = createServiceClient();

  // 1) Load client
  const { data: client, error: clientError } = await supabase
    .from("end_clients")
    .select("*")
    .eq("tenant_id", effectiveTenantId)
    .eq("id", clientId)
    .is("deleted_at", null)
    .single();

  if (clientError || !client) {
    console.error("Client not found or error:", clientError);
    notFound();
  }

  const c = client as EndClientRow;

  // 2) Load projects linked to this client via project_end_clients
  const { data: pecRows } = await supabase
    .from("project_end_clients")
    .select("project_id")
    .eq("end_client_id", c.id)
    .eq("tenant_id", effectiveTenantId);

  const projectIds =
    (pecRows ?? [])
      .map((r: any) => r.project_id)
      .filter((v: string | null) => !!v) ?? [];

  let projects: ProjectRow[] = [];
  if (projectIds.length > 0) {
    const { data: projectRows, error: projectError } = await supabase
      .from("projects")
      .select("id, tenant_id, name, status, created_at, updated_at")
      .in("id", projectIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (projectError) {
      console.error("Error loading client projects:", projectError);
    } else {
      projects = (projectRows ?? []) as ProjectRow[];
    }
  }

  // 3) Load surveys (best-effort, schema-safe)
  const { data: surveyRows } = await supabase
    .from("survey_requests")
    .select("*")
    .eq("tenant_id", effectiveTenantId)
    .order("created_at", { ascending: false });

  const surveys = (surveyRows ?? []).filter((sr: any) => {
    // Try to associate by end_client_id or project_id
    if (sr.end_client_id && sr.end_client_id === c.id) return true;
    if (sr.project_id && projectIds.includes(sr.project_id)) return true;
    return false;
  });

  // 4) Load estimates (best-effort, schema-safe)
  const { data: estimateRows } = await supabase
    .from("estimates")
    .select("*")
    .eq("tenant_id", effectiveTenantId)
    .order("created_at", { ascending: false });

  const estimates = (estimateRows ?? []).filter((e: any) => {
    if (e.end_client_id && e.end_client_id === c.id) return true;
    if (e.project_id && projectIds.includes(e.project_id)) return true;
    return false;
  });

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: "overview", label: "Client overview" },
    { key: "projects", label: "Projects" },
    { key: "surveys", label: "Surveys" },
    { key: "estimates", label: "Estimates" },
  ];

  const baseClientPath = `/portal/${effectiveTenantId}/clients/${c.id}`;

  const tabHref = (key: string) =>
    key === "overview" ? baseClientPath : `${baseClientPath}?tab=${key}`;

  const overviewEditHref = `${baseClientPath}?tab=overview&mode=edit`;
  const overviewViewHref = `${baseClientPath}?tab=overview`;

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb + heading */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">
            <Link
              href={`/portal/${effectiveTenantId}/clients`}
              className="hover:text-emerald-700 hover:underline"
            >
              Clients
            </Link>{" "}
            /{" "}
            <span className="text-slate-700">
              {c.company_name || c.contact_name || "Client"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            All projects, surveys, and estimates linked to this client will show
            here.
          </p>
        </div>

        {/* Quick stats + close button */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex gap-2">
            <div className="rounded-full border bg-white px-3 py-1 shadow-sm">
              Projects: <span className="font-semibold">{projects.length}</span>
            </div>
            <div className="rounded-full border bg-white px-3 py-1 shadow-sm">
              Surveys: <span className="font-semibold">{surveys.length}</span>
            </div>
            <div className="rounded-full border bg-white px-3 py-1 shadow-sm">
              Estimates: <span className="font-semibold">{estimates.length}</span>
            </div>
          </div>

          <Link
            href={`/portal/${effectiveTenantId}/clients`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-300 bg-red-50 text-xs font-semibold text-red-600 shadow-sm hover:border-red-500 hover:bg-red-100 hover:text-red-700"
            title="Back to clients list"
          >
            ×
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2 text-xs">
        {tabs.map((t) => {
          const isActive = t.key === activeTab;
          return (
            <Link
              key={t.key}
              href={tabHref(t.key)}
              className={
                "inline-flex items-center rounded-full px-3 py-1 " +
                (isActive
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700")
              }
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Left: core details - view vs edit */}
          {isEditing ? (
            <form
              action={updateEndClientAction}
              className="md:col-span-2 space-y-3 rounded-lg border bg-card/60 p-4 backdrop-blur"
            >
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Client details
                </h2>
                <Link
                  href={overviewViewHref}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-white/60 px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  Cancel
                </Link>
              </div>

              <input
                type="hidden"
                name="tenantId"
                value={effectiveTenantId}
              />
              <input type="hidden" name="clientId" value={c.id} />

              <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
                <div>
                  <div className="text-[11px] text-muted-foreground">
                    Company name
                  </div>
                  <input
                    type="text"
                    name="company_name"
                    defaultValue={c.company_name || ""}
                    placeholder="Company name"
                    className="mt-1 w-full rounded-md border border-emerald-200 bg-white/80 px-2 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">
                    Contact person
                  </div>
                  <input
                    type="text"
                    name="contact_name"
                    defaultValue={c.contact_name || ""}
                    placeholder="Contact person name"
                    className="mt-1 w-full rounded-md border border-emerald-200 bg-white/80 px-2 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Phone</div>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={c.phone || ""}
                    placeholder="+9665..."
                    className="mt-1 w-full rounded-md border border-emerald-200 bg-white/80 px-2 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Email</div>
                  <input
                    type="email"
                    name="email"
                    defaultValue={c.email || ""}
                    placeholder="client@example.com"
                    className="mt-1 w-full rounded-md border border-emerald-200 bg-white/80 px-2 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">
                    Created at
                  </div>
                  <div className="mt-1 text-sm text-slate-800">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleString()
                      : "—"}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs">
                <div className="text-[11px] text-muted-foreground">Notes</div>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={c.notes || ""}
                  placeholder="Internal notes about this client (site, preferences, etc.)"
                  className="mt-1 w-full rounded-md border border-emerald-200 bg-white/80 px-2 py-1 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
                >
                  Save changes
                </button>
              </div>
            </form>
          ) : (
            <div className="md:col-span-2 space-y-3 rounded-lg border bg-card/60 p-4 backdrop-blur">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Client details
                </h2>
                <Link
                  href={overviewEditHref}
                  className="inline-flex items-center rounded-md border border-emerald-200 bg-white/60 px-2 py-1 text-[11px] font-medium text-emerald-700 shadow-sm hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  Edit details
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
                <div>
                  <div className="text-[11px] text-muted-foreground">
                    Company name
                  </div>
                  <div className="mt-1 text-sm font-medium text-slate-800">
                    {c.company_name || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">
                    Contact person
                  </div>
                  <div className="mt-1 text-sm font-medium text-slate-800">
                    {c.contact_name || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Phone</div>
                  <div className="mt-1 text-sm text-slate-800">
                    {c.phone || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Email</div>
                  <div className="mt-1 text-sm text-slate-800">
                    {c.email || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">
                    Created at
                  </div>
                  <div className="mt-1 text-sm text-slate-800">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleString()
                      : "—"}
                  </div>
                </div>
              </div>

              {c.notes && (
                <div className="pt-2 text-xs">
                  <div className="text-[11px] text-muted-foreground">Notes</div>
                  <p className="mt-1 whitespace-pre-wrap text-slate-800">
                    {c.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Right: small summary card */}
          <div className="space-y-3 rounded-lg border bg-card/60 p-4 text-xs backdrop-blur">
            <h3 className="text-sm font-semibold text-slate-900">
              Summary snapshot
            </h3>
            <ul className="space-y-1 text-slate-700">
              <li>
                <span className="text-muted-foreground">Projects: </span>
                <span className="font-semibold">{projects.length}</span>
              </li>
              <li>
                <span className="text-muted-foreground">Surveys: </span>
                <span className="font-semibold">{surveys.length}</span>
              </li>
              <li>
                <span className="text-muted-foreground">Estimates: </span>
                <span className="font-semibold">{estimates.length}</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "projects" && (
        <div className="rounded-lg border bg-card/60 p-4 text-sm backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Projects for this client
            </h2>
          </div>

          {projects.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No projects are linked to this client yet.
            </p>
          ) : (
            <div className="divide-y">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-900">
                      {p.name || "Untitled project"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Created{" "}
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.status && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        {p.status}
                      </span>
                    )}
                    <Link
                      href={`/portal/${effectiveTenantId}/projects/${p.id}`}
                      className="inline-flex items-center text-emerald-700 hover:text-emerald-900"
                      title="Open project"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "surveys" && (
        <div className="rounded-lg border bg-card/60 p-4 text-sm backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Surveys for this client
            </h2>
          </div>

          {surveys.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No surveys are linked to this client yet.
            </p>
          ) : (
            <div className="divide-y">
              {surveys.map((s: any) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium text-slate-800">
                      Survey #{s.id}
                    </div>
                    {s.status && (
                      <div className="text-[11px] text-muted-foreground">
                        Status: {s.status}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {s.created_at
                      ? new Date(s.created_at).toLocaleString()
                      : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "estimates" && (
        <div className="rounded-lg border bg-card/60 p-4 text-sm backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Estimates for this client
            </h2>
          </div>

          {estimates.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No estimates are linked to this client yet.
            </p>
          ) : (
            <div className="divide-y">
              {estimates.map((e: any) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between py-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium text-slate-800">
                      Estimate #{e.id}
                    </div>
                    {e.status && (
                      <div className="text-[11px] text-muted-foreground">
                        Status: {e.status}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {e.created_at
                      ? new Date(e.created_at).toLocaleString()
                      : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}