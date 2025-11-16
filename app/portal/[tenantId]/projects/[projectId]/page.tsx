"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";

interface ProjectDetailPageProps {
  params: Promise<{
    tenantId: string;
    projectId: string;
  }>;
}

type MainTab =
  | "overview"
  | "timeline"
  | "files"
  | "surveys"
  | "boq"
  | "client-docs"
  | "work-orders";

type ClientDocsSubTab =
  | "client-estimates"
  | "delivery-notes"
  | "handover";

type ProjectStage = "idea" | "estimation" | "survey" | "install" | "closed";

type ProjectRecord = {
  id: string;
  name: string | null;
  description: string | null;
  status: string | null;
  tenant_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type TenantRecord = {
  id: string;
  name: string | null;
};

const projectStages: { id: ProjectStage; label: string }[] = [
  { id: "idea", label: "Idea" },
  { id: "estimation", label: "Estimation" },
  { id: "survey", label: "Survey" },
  { id: "install", label: "Install" },
  { id: "closed", label: "Closed" },
];

const mainTabs: { id: MainTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "timeline", label: "Timeline" },
  { id: "files", label: "Files" },
  { id: "surveys", label: "Surveys" },
  { id: "boq", label: "BOQ & Internal" },
  { id: "client-docs", label: "Client Docs" },
  { id: "work-orders", label: "Work Orders" },
];

const clientDocsSubTabs: { id: ClientDocsSubTab; label: string }[] = [
  { id: "client-estimates", label: "Client Estimates" },
  { id: "delivery-notes", label: "Delivery Notes (Material)" },
  { id: "handover", label: "Project Handover" },
];

function classNames(...classes: (string | boolean | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function normalizeStage(status: string | null | undefined): ProjectStage {
  if (!status) return "estimation";
  const s = status.toLowerCase().trim().replace(/\s+/g, "_");

  if (s === "idea") return "idea";
  if (s === "estimation") return "estimation";
  if (s === "survey") return "survey";
  if (s === "install") return "install";
  if (s === "closed") return "closed";

  // fallback
  return "estimation";
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  // unwrap Next 16 async params in a client component
  const resolvedParams = React.use(params);
  const { tenantId, projectId } = resolvedParams;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [projectStage, setProjectStage] = useState<ProjectStage>("estimation");
  const [projectDescription, setProjectDescription] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<MainTab>("overview");
  const [activeClientDocsTab, setActiveClientDocsTab] =
    useState<ClientDocsSubTab>("client-estimates");

  const shortProjectId =
    typeof projectId === "string" ? projectId.slice(0, 6) : "";

  const currentStageLabel =
    projectStages.find((s) => s.id === projectStage)?.label ?? projectStage;

  const supabase = createBrowserClient();

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setLoadError(null);

        // 1) Load project
        const { data: proj, error: pErr } = await supabase
          .from("projects")
          .select(
            "id,name,description,status,tenant_id,created_at,updated_at"
          )
          .eq("id", projectId)
          .single<ProjectRecord>();

        if (pErr) {
          console.error("Error loading project for portal view:", pErr);
          if (isMounted) {
            setLoadError("Failed to load project details.");
          }
          return;
        }

        if (!proj) {
          if (isMounted) {
            setLoadError("Project not found.");
          }
          return;
        }

        const normalizedStage = normalizeStage(proj.status);

        if (isMounted) {
          setProject(proj);
          setProjectStage(normalizedStage);
          setProjectDescription(proj.description ?? null);
        }

        // 2) Load tenant name for workspace label
        if (proj.tenant_id) {
          const { data: tenant, error: tErr } = await supabase
            .from("tenants")
            .select("id,name")
            .eq("id", proj.tenant_id)
            .single<TenantRecord>();

          if (!tErr && tenant && isMounted) {
            setWorkspaceName(tenant.name ?? proj.tenant_id ?? tenantId);
          } else if (isMounted) {
            setWorkspaceName(proj.tenant_id ?? tenantId);
          }
        } else if (isMounted) {
          setWorkspaceName(tenantId);
        }
      } catch (err) {
        console.error("Unexpected error loading project for portal:", err);
        if (isMounted) {
          setLoadError("Failed to load project details.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (projectId) {
      load();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, projectId]);

  const headerTitle =
    project?.name?.trim() ||
    (shortProjectId ? `Project #${shortProjectId}` : "Project");

  return (
    <div className="flex h-full flex-col">
      {/* Top header / breadcrumb */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-slate-500">
            <Link
              href={`/portal/${tenantId}/projects?view=table`}
              className="hover:text-emerald-600"
            >
              Projects
            </Link>
            <span className="mx-1">/</span>
            <span className="font-medium text-slate-700">Project details</span>
          </div>
          <div className="text-lg font-semibold text-slate-900">
            {headerTitle}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600">
            + New document
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-slate-50/60">
        <nav className="flex gap-4 overflow-x-auto px-6 pt-3">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={classNames(
                "relative whitespace-nowrap border-b-2 px-2 pb-2 text-sm font-medium outline-none transition",
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-4">
        <div className="flex-1 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <h2 className="text-base font-semibold text-slate-900">
                    Overview
                  </h2>
                  {loadError ? (
                    <p className="text-sm text-red-600">{loadError}</p>
                  ) : (
                    <p className="text-sm text-slate-600">
                      This is your project workspace. Here you can see the
                      current stage, basic details, and a quick summary of what
                      will happen next until the project is fully handed over.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold uppercase tracking-wide text-[10px] text-emerald-700">
                        Current Stage
                      </p>
                      <p className="text-sm capitalize">
                        {currentStageLabel}
                      </p>
                    </div>
                    <div className="hidden h-10 w-px bg-emerald-100/80 sm:block" />
                    <div className="space-y-1 text-right">
                      <p className="font-semibold uppercase tracking-wide text-[10px] text-emerald-700">
                        Project ID
                      </p>
                      <p className="text-sm font-mono">
                        {shortProjectId ? `#${shortProjectId}` : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage pipeline */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Project journey
                </p>
                <p className="text-[11px] text-slate-500">
                  From <span className="font-semibold">Created</span> →
                  <span className="mx-1">Idea</span> →
                  <span className="mx-1">Estimation</span> →
                  <span className="mx-1">Survey</span> →
                  <span className="mx-1">Install</span> →
                  <span className="mx-1">Closed</span>.
                  The current step is highlighted below.
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 rounded-lg border bg-slate-50/70 px-3 py-3">
                  {projectStages.map((stage, index) => {
                    const isActive = stage.id === projectStage;
                    const activeIndex = projectStages.findIndex(
                      (s) => s.id === projectStage
                    );
                    const isCompleted = activeIndex > index;

                    return (
                      <div key={stage.id} className="flex items-center gap-2">
                        <div
                          className={classNames(
                            "flex h-7 items-center rounded-full border px-3 text-xs font-medium",
                            isActive &&
                              "border-emerald-500 bg-emerald-500 text-white shadow-sm",
                            !isActive &&
                              isCompleted &&
                              "border-emerald-200 bg-emerald-50 text-emerald-700",
                            !isActive &&
                              !isCompleted &&
                              "border-slate-200 bg-white text-slate-500"
                          )}
                        >
                          <span className="capitalize">{stage.label}</span>
                        </div>
                        {index < projectStages.length - 1 && (
                          <div className="h-px w-6 bg-slate-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Project description & info */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Project description
                  </h3>
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-600">
                    {projectDescription ? (
                      <p>{projectDescription}</p>
                    ) : (
                      <p>
                        Your project description will appear here once it is
                        added by our team. It usually includes the site name,
                        scope of work, and any special notes agreed with you.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Quick info
                  </h3>
                  <div className="space-y-2 rounded-lg border bg-slate-50/60 p-3 text-xs text-slate-700">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Workspace</span>
                      <span className="truncate font-medium">
                        {workspaceName || tenantId || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Project reference</span>
                      <span className="font-mono text-[11px]">
                        {projectId || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Next step</span>
                      <span className="text-right">
                        We will add surveys, estimates, and delivery notes to
                        this workspace as the project progresses.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">
                Timeline &amp; Activity
              </h2>
              <p className="text-sm text-slate-600">
                A chronological activity feed will appear here (project
                created, survey booked, estimate sent, delivery notes, work
                orders, handover, etc.).
              </p>
            </div>
          )}

          {activeTab === "files" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">
                Files &amp; Attachments
              </h2>
              <p className="text-sm text-slate-600">
                This tab will list uploaded PDFs, DWGs, images, and other
                documents linked to this project.
              </p>
            </div>
          )}

          {activeTab === "surveys" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">
                Surveys
              </h2>
              <p className="text-sm text-slate-600">
                This tab will show AI surveyor runs and in-person survey
                reports linked to the project.
              </p>
            </div>
          )}

          {activeTab === "boq" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">
                BOQ &amp; Internal Costing
              </h2>
              <p className="text-sm text-slate-600">
                Here we will display internal BOQs and costing for this
                project (linked to `boqs` and `boq_items`).
              </p>
            </div>
          )}

          {activeTab === "client-docs" && (
            <div className="flex h-full flex-col gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Client Documents
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  White-label documents your customer sees: estimates, delivery
                  notes for materials, and project handover certificates.
                </p>
              </div>

              {/* Sub-tabs for client docs */}
              <div className="border-b border-slate-200">
                <nav className="flex gap-3">
                  {clientDocsSubTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveClientDocsTab(tab.id)}
                      className={classNames(
                        "whitespace-nowrap border-b-2 px-2 pb-2 text-xs font-medium uppercase tracking-wide",
                        activeClientDocsTab === tab.id
                          ? "border-emerald-500 text-emerald-700"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="flex-1 space-y-4">
                {activeClientDocsTab === "client-estimates" && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                      List of client-facing estimates will appear here, with
                      status (draft / sent / accepted), total amount, and quick
                      actions to view PDF, resend, or create invoice.
                    </p>
                    <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/40 p-4 text-xs text-emerald-800">
                      Future: connect this to Zoho Estimates and our
                      white-label PDF templates.
                    </div>
                  </div>
                )}

                {activeClientDocsTab === "delivery-notes" && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                      Material delivery notes per drop will be shown here. For
                      each BOQ item we will calculate ordered vs delivered vs
                      remaining (e.g., 100 pcs ordered, 90 delivered, 10
                      remaining).
                    </p>
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                      Future: table of delivery notes + per-item progress bar.
                    </div>
                  </div>
                )}

                {activeClientDocsTab === "handover" && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                      Project handover documents (completion report, snag-list
                      status, client signature) will be managed here.
                    </p>
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                      Future: generate a formal handover certificate and capture
                      sign-off details.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "work-orders" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">
                Work Orders
              </h2>
              <p className="text-sm text-slate-600">
                This tab will show internal work orders for technicians and
                crews, linked to installation schedule and progress.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}