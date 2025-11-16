import { createClient } from "@supabase/supabase-js";

// ---- Types ----

type ProjectStatus = "new" | "estimation" | "survey" | "install" | "closed";

type Project = {
  id: string;
  tenant_id: string;
  created_by_member_id: string | null;
  name: string | null;
  description: string | null;
  status: ProjectStatus | null;
  view_mode: string | null;
  created_at: string;
  updated_at: string | null;
};

interface Tenant {
  id: string;
  name: string | null;
  logo_url?: string | null;
}

interface Member {
  id: string;
  full_name: string | null;
  role: string | null;
}

const MAIN_TABS = [
  { id: "overview", label: "Overview" },
  { id: "timeline", label: "Timeline" },
  { id: "files", label: "Files" },
  { id: "surveys", label: "Surveys" },
  { id: "boq", label: "BOQ & Internal" },
  { id: "clientDocs", label: "Client Docs" },
  { id: "workorders", label: "Work Orders" },
] as const;

const CLIENT_DOC_TABS = [
  { id: "estimates", label: "Client Estimates" },
  { id: "delivery", label: "Delivery Notes" },
  { id: "handover", label: "Project Handover" },
] as const;

const STAGES: { id: ProjectStatus; label: string; description: string }[] = [
  {
    id: "new",
    label: "New",
    description: "Project created, basic details captured.",
  },
  {
    id: "estimation",
    label: "Estimation",
    description: "Collect requirements, prepare BOQ and client estimate.",
  },
  {
    id: "survey",
    label: "Site Survey",
    description: "Technician / engineer survey and validation.",
  },
  {
    id: "install",
    label: "Installation",
    description: "Execution on site, work orders in progress.",
  },
  {
    id: "closed",
    label: "Closed",
    description: "Delivery notes + handover completed.",
  },
];

function makeSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{ tab?: string; clientTab?: string }>;
}

export default async function AdminProjectDetails({
  params,
  searchParams,
}: PageProps) {
  // Unwrap async params and searchParams per Next.js 16 dynamic API
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const { projectId } = resolvedParams;
  const activeTab = resolvedSearchParams.tab || "overview";
  const activeClientDocTab = resolvedSearchParams.clientTab || "estimates";

  const supabase = makeSupabase();

  // 1) Load project
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select(
      "id, tenant_id, created_by_member_id, name, description, status, view_mode, created_at, updated_at"
    )
    .eq("id", projectId)
    .single();

  if (projectError || !projectData) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          Admin / Projects
        </div>
        <h1 className="text-2xl font-semibold mt-1">Project Details</h1>
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load project details.
        </div>
      </div>
    );
  }

  const project = projectData as Project;

  // 2) Tenant
  let tenant: Tenant | null = null;
  if (project.tenant_id) {
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("id,name,logo_url")
      .eq("id", project.tenant_id)
      .single();
    if (tenantData) tenant = tenantData as Tenant;
  }

  // 3) Created-by member
  let member: Member | null = null;
  if (project.created_by_member_id) {
    const { data: memberData } = await supabase
      .from("members")
      .select("id,full_name,role")
      .eq("id", project.created_by_member_id)
      .single();
    if (memberData) member = memberData as Member;
  }

  const currentStatus: ProjectStatus =
    (project.status as ProjectStatus) || "new";

  const currentStageIndex = STAGES.findIndex((s) => s.id === currentStatus);
  const safeStageIndex = currentStageIndex === -1 ? 0 : currentStageIndex;
  const nextStage =
    safeStageIndex < STAGES.length - 1 ? STAGES[safeStageIndex + 1] : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Admin / Projects
          </div>
          <h1 className="text-2xl font-semibold mt-1">
            {project.name || "Project Details"}
          </h1>
          <div className="text-gray-400 text-xs mt-1">
            Project ID: <span className="font-mono">{projectId}</span>
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {member?.full_name ? (
              <>
                Created by:{" "}
                <span className="font-medium text-gray-600">
                  {member.full_name}
                </span>
                {member.role && (
                  <span className="ml-1 text-gray-500">({member.role})</span>
                )}
              </>
            ) : project.created_by_member_id ? (
              <>
                Created by ID:{" "}
                <span className="font-mono">
                  {project.created_by_member_id}
                </span>
              </>
            ) : (
              <span className="italic text-gray-400">
                Creator not recorded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {MAIN_TABS.map((t) => {
          const isActive = activeTab === t.id;
          const href = `?tab=${t.id}`;
          return (
            <a
              key={t.id}
              href={href}
              className={`px-4 py-2 text-sm rounded-t-md transition-colors ${
                isActive
                  ? "border-b-2 border-emerald-600 font-medium text-emerald-700 bg-emerald-50"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </a>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6 text-gray-700">
            {/* Stage progress – now at the top */}
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-800">
                  Project Stages
                </h2>
                {nextStage ? (
                  <p className="text-xs text-gray-500">
                    Next step: {" "}
                    <span className="font-medium text-gray-800">
                      {nextStage.label}
                    </span>{" "}
                    — {nextStage.description}
                  </p>
                ) : (
                  <p className="text-xs text-emerald-700 font-medium">
                    Project is in the final stage (Closed).
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                {STAGES.map((stage, index) => {
                  const isCompleted = index < safeStageIndex;
                  const isCurrent = index === safeStageIndex;

                  return (
                    <div
                      key={stage.id}
                      className="flex-1 flex items-center min-w-0"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={[
                            "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                            isCompleted
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : isCurrent
                              ? "bg-emerald-50 border-emerald-600 text-emerald-700"
                              : "bg-gray-50 border-gray-300 text-gray-400",
                          ].join(" ")}
                        >
                          {index + 1}
                        </div>
                        <div className="mt-2 text-xs font-medium text-gray-700 text-center">
                          {stage.label}
                        </div>
                      </div>
                      {index < STAGES.length - 1 && (
                        <div
                          className={[
                            "mx-2 h-0.5 flex-1",
                            index < safeStageIndex
                              ? "bg-emerald-500"
                              : "bg-gray-200",
                          ].join(" ")}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-semibold text-gray-700">
                    From Created → Closed:
                  </span>{" "}
                  New → Estimation → Survey → Installation → Closed.
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Tip:</span>{" "}
                  Updating the project status in Kanban will automatically move
                  this indicator.
                </div>
              </div>
            </div>

            {/* Basic details as inline info (no cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mt-6">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </div>
                <div className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 capitalize">
                  {currentStatus.replace("_", " ")}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  This status drives the Kanban column and next steps.
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Created At
                </div>
                <div className="mt-2 font-medium text-gray-800">
                  {formatDateTime(project.created_at)}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  When this project was first created.
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Last Updated
                </div>
                <div className="mt-2 font-medium text-gray-800">
                  {formatDateTime(project.updated_at)}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Auto-updated when key changes are made.
                </div>
              </div>
            </div>

            {/* Description inline */}
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-800">
                Project Description
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {project.description || (
                  <span className="italic text-gray-400">
                    No description saved yet. Use this space for key notes,
                    scope, or special instructions.
                  </span>
                )}
              </p>
            </div>

            {/* Admin-facing info: who created, which company/tenant, and future links */}
            <div className="mt-8 border-t pt-4">
              <h2 className="text-sm font-semibold text-gray-800">
                Admin &amp; Linking
              </h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Company / Tenant
                  </div>
                  <div className="mt-2 text-xs text-gray-800">
                    {tenant?.name ? (
                      <>
                        <span className="font-medium">{tenant.name}</span>
                        <div className="mt-1 font-mono text-[11px] text-gray-500 break-all">
                          ID: {project.tenant_id}
                        </div>
                      </>
                    ) : (
                      <span className="font-mono break-all">{project.tenant_id}</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Identifies which company / tenant this project belongs to in
                    the VariForce portal.
                  </p>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Created By
                  </div>
                  <div className="mt-2 text-xs text-gray-800">
                    {member?.full_name ? (
                      <>
                        <span className="font-medium">{member.full_name}</span>
                        {member.role && (
                          <span className="ml-1 text-gray-500">
                            ({member.role})
                          </span>
                        )}
                        {member.id && (
                          <div className="mt-1 font-mono text-[11px] text-gray-400">
                            ID: {member.id}
                          </div>
                        )}
                      </>
                    ) : project.created_by_member_id ? (
                      <span className="font-mono">
                        {project.created_by_member_id}
                      </span>
                    ) : (
                      <span className="italic text-gray-400">Not recorded</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Member ID that initially created this project.
                  </p>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Teams &amp; Linked Items
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    Future enhancement: show which workforce team is assigned,
                    linked work orders, BOQ items, and client documents so you
                    can see the full chain from project → team → materials →
                    client docs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === "timeline" && (
          <div className="text-gray-600">Timeline entries will appear here.</div>
        )}

        {/* FILES TAB */}
        {activeTab === "files" && (
          <div className="text-gray-600">
            Project file attachments will show here.
          </div>
        )}

        {/* SURVEYS TAB */}
        {activeTab === "surveys" && (
          <div className="text-gray-600">
            Survey forms and site surveys will show here.
          </div>
        )}

        {/* BOQ TAB */}
        {activeTab === "boq" && (
          <div className="text-gray-600">
            BOQs, items, pricing, and internal costing will appear here.
          </div>
        )}

        {/* CLIENT DOCS TABS */}
        {activeTab === "clientDocs" && (
          <div>
            <div className="flex flex-wrap gap-2 border-b pb-1 mb-4">
              {CLIENT_DOC_TABS.map((c) => {
                const isActive = activeClientDocTab === c.id;
                const href = `?tab=clientDocs&clientTab=${c.id}`;
                return (
                  <a
                    key={c.id}
                    href={href}
                    className={`px-3 py-1 text-sm rounded-t-md ${
                      isActive
                        ? "border-b-2 border-emerald-600 font-medium text-emerald-700 bg-emerald-50"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {c.label}
                  </a>
                );
              })}
            </div>

            {activeClientDocTab === "estimates" && (
              <div className="text-gray-600">
                Client Estimates (white-label PDF, Zoho estimate linkage) will
                be listed here.
              </div>
            )}

            {activeClientDocTab === "delivery" && (
              <div className="text-gray-600">
                Delivery Notes — Example: 100 pcs → 90 delivered → 10 remaining.
              </div>
            )}

            {activeClientDocTab === "handover" && (
              <div className="text-gray-600">
                Final Project Handover documents, signatures, images, and
                checklists will show here.
              </div>
            )}
          </div>
        )}

        {/* WORK ORDERS TAB */}
        {activeTab === "workorders" && (
          <div className="text-gray-600">
            Work Orders linked to technicians will show here.
          </div>
        )}
      </div>
    </div>
  );
}