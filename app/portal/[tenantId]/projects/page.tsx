import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import ProjectsBoardClient from "./ProjectsBoardClient";

export const dynamic = "force-dynamic";

// TEMP: Hardcoded default tenant ID for local development.
// Replace this with your real test tenant UUID.
const DEFAULT_TENANT_ID = "24f1fddd-76c0-4b05-b600-06ef351109e2";

function normalizeStatus(status: string | null | undefined): string {
  if (!status) return "estimation";
  const s = status.toString().toLowerCase().trim().replace(/\s+/g, "_");

  // Map DB enum values to UI statuses
  if (s === "idea") return "estimation"; // legacy default maps into Estimation column
  if (s === "estimation") return "estimation";
  if (s === "survey") return "survey";
  if (s === "install") return "install";
  if (s === "closed") return "closed";

  // Fallback: just return the normalized value so we can at least display it
  return s;
}

function mapUiStatusToDb(status: string): string {
  const s = status.toString().toLowerCase().trim().replace(/\s+/g, "_");

  // Map UI values back to DB enum project_status
  if (s === "estimation") return "estimation";
  if (s === "survey") return "survey";
  if (s === "install") return "install";
  if (s === "closed") return "closed";

  // Fallback: write the normalized status as-is
  return s;
}

const STATUS_LABELS: Record<string, string> = {
  estimation: "Estimation",
  survey: "Survey",
  install: "Install",
  closed: "Closed",
};

export async function updateProjectStatusAction(input: {
  projectId: string;
  tenantId: string;
  status: string;
}) {
  "use server";

  const supabase = createServiceClient();

  console.log("DEBUG updateProjectStatusAction input", input);

  const dbStatus = mapUiStatusToDb(input.status);

  const { data, error } = await supabase
    .from("projects")
    .update({ status: dbStatus })
    .eq("id", input.projectId)
    .eq("tenant_id", input.tenantId)
    .is("deleted_at", null)
    .select("id, status, updated_at");

  if (error) {
    console.error("Supabase error updating project status", {
      error,
      projectId: input.projectId,
      tenantId: input.tenantId,
      status: input.status,
      dbStatus,
    });
    return { ok: false as const, error: error.message ?? "Unknown Supabase error" };
  }

  if (!data || data.length === 0) {
    console.error("No project row updated in updateProjectStatusAction", {
      projectId: input.projectId,
      tenantId: input.tenantId,
      status: input.status,
      dbStatus,
    });
    return { ok: false as const, error: "No project row updated" };
  }

  return { ok: true as const, project: data[0] };
}

interface ProjectsPageProps {
  params: Promise<{ tenantId: string }>;
  searchParams?: Promise<{ status?: string; view?: string; q?: string }>;
}

export default async function ProjectsPage({
  params,
  searchParams,
}: ProjectsPageProps) {
  // Unwrap async params and searchParams per Next.js 16 dynamic API
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const tenantId = resolvedParams?.tenantId;
  const status = resolvedSearchParams.status;
  const view = resolvedSearchParams.view;
  const searchQuery = resolvedSearchParams.q ?? "";

  // Derive an effective tenantId, falling back to a hardcoded default for dev if needed.
  const effectiveTenantId =
    tenantId && tenantId !== "undefined" ? tenantId : DEFAULT_TENANT_ID;

  const statusFilter = status ?? "all";
  const viewMode = view === "board" ? "board" : "table";

  const supabase = createServiceClient();

  let query = supabase
    .from("projects")
    .select("id, name, status, updated_at, tenant_id")
    .eq("tenant_id", effectiveTenantId)
    .order("updated_at", { ascending: false });

  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`);
  }

  const { data: projects, error } = await query;

  if (error) {
    console.error("Error loading projects:", JSON.stringify(error, null, 2));

    return (
      <div className="p-6">
        <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Unable to load projects</p>
          <p className="text-xs text-red-700">
            This is an internal error while querying Supabase. Please make sure
            the
            <code className="mx-1 rounded bg-red-100 px-1 py-0.5">projects</code>
            table exists and has a
            <code className="mx-1 rounded bg-red-100 px-1 py-0.5">tenant_id</code>
            column, and that your Supabase service role key is configured
            correctly.
          </p>
        </div>
      </div>
    );
  }

  const filteredProjects =
    statusFilter === "all"
      ? projects ?? []
      : (projects ?? []).filter(
          (p) => normalizeStatus(p.status as string | null) === statusFilter
        );

  const statusOptions = [
    { key: "all", label: "All" },
    { key: "estimation", label: "Estimation" },
    { key: "survey", label: "Survey" },
    { key: "install", label: "Install" },
    { key: "closed", label: "Closed" },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Top bar: helper text, filters, view toggle, new project */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: helper text + filters */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Manage all your projects for this workspace. Filter by status or
            switch to board view.
          </p>

          {/* Status filters */}
          <div className="flex flex-wrap gap-2 text-xs">
            {statusOptions.map((opt) => {
              const isActive = statusFilter === opt.key;

              const href = (() => {
                if (opt.key === "all") {
                  return viewMode === "board"
                    ? `/portal/${effectiveTenantId}/projects?view=board`
                    : `/portal/${effectiveTenantId}/projects`;
                }
                const base = `/portal/${effectiveTenantId}/projects?status=${opt.key}`;
                return viewMode === "board" ? `${base}&view=board` : base;
              })();

              return (
                <Link
                  key={opt.key}
                  href={href}
                  className={[
                    "inline-flex items-center rounded-full border px-3 py-1 transition",
                    isActive
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                      : "border-border bg-background/60 text-muted-foreground hover:border-emerald-300 hover:text-emerald-700",
                  ].join(" ")}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: search (table) + view toggle + new project */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          {/* Table search (server-side) */}
          {viewMode === "table" && (
            <form
              action={`/portal/${effectiveTenantId}/projects`}
              className="flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs shadow-sm"
            >
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search projects..."
                className="w-40 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
              {/* Preserve current status filter if not 'all' */}
              {statusFilter !== "all" && (
                <input type="hidden" name="status" value={statusFilter} />
              )}
              <button
                type="submit"
                className="text-muted-foreground hover:text-emerald-700"
              >
                🔍
              </button>
            </form>
          )}

          {/* View toggle */}
          <div className="inline-flex rounded-full border bg-background/60 p-1 text-xs">
            <Link
              href={
                statusFilter === "all"
                  ? `/portal/${effectiveTenantId}/projects`
                  : `/portal/${effectiveTenantId}/projects?status=${statusFilter}`
              }
              className={[
                "rounded-full px-3 py-1",
                viewMode === "table"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-emerald-700",
              ].join(" ")}
            >
              Table
            </Link>
            <Link
              href={
                statusFilter === "all"
                  ? `/portal/${effectiveTenantId}/projects?view=board`
                  : `/portal/${effectiveTenantId}/projects?status=${statusFilter}&view=board`
              }
              className={[
                "rounded-full px-3 py-1",
                viewMode === "board"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-emerald-700",
              ].join(" ")}
            >
              Board
            </Link>
          </div>

          {/* New project button → navigate to Board view, Estimation status */}
          <Link
            href={`/portal/${effectiveTenantId}/projects?status=estimation&view=board`}
            className="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600"
          >
            + New Project
          </Link>
        </div>
      </div>

      {/* Main content: table or board */}
      {viewMode === "table" ? (
        <div className="rounded-lg border bg-card/50 backdrop-blur">
          <div className="grid grid-cols-12 gap-2 border-b p-3 text-xs text-muted-foreground">
            <div className="col-span-4">Project</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-3">Last Updated</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y">
            {filteredProjects.length ? (
              filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 gap-2 p-3 text-sm"
                >
                  <div className="col-span-4 truncate">
                    {p.name || "Untitled"}
                  </div>
                  <div className="col-span-3">
                    {(() => {
                      const normalized = normalizeStatus(p.status as string | null);
                      return STATUS_LABELS[normalized] ?? "—";
                    })()}
                  </div>
                  <div className="col-span-3">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Link
                      href={`/portal/${effectiveTenantId}/projects/${p.id}`}
                      className="underline"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No projects found. Click
                <span className="font-medium"> New Project</span> to create
                one.
              </div>
            )}
          </div>
        </div>
      ) : (
        <ProjectsBoardClient
          tenantId={effectiveTenantId}
          initialProjects={filteredProjects}
          updateStatusAction={updateProjectStatusAction}
        />
      )}
    </div>
  );
}