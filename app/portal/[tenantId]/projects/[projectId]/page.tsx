// REPLACED CONTENT
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import {
  Menu,
  PhoneCall,
  MessageCircle,
  MapPin,
  Sparkles,
  ClipboardList,
  Send,
  CheckCircle2,
  XCircle,
  FileText,
  Wrench,
  CheckCircle,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

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
  | "work-orders"
  | "chat-calls";

type ClientDocsSubTab =
  | "client-estimates"
  | "delivery-notes"
  | "handover";

type ProjectStage =
  | "open"
  | "estimation"
  | "sent_to_customer"
  | "customer_approved"
  | "customer_rejected"
  | "survey"
  | "install"
  | "closed";

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

type EndClientRecord = {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  phone: string | null;
};

type ProjectEndClientRecord = {
  project_id: string;
  end_client_id: string;
};

type ActivityLogRow = {
  id: string;
  actor_member_id: string | null;
  project_id: string;
  entity: string | null;
  entity_id: string | null;
  action: string;
  meta_json: any;
  created_at: string;
};

const projectStages: { id: ProjectStage; label: string; icon: LucideIcon }[] = [
  { id: "open", label: "Open", icon: Sparkles },
  { id: "survey", label: "Survey", icon: FileText },
  { id: "estimation", label: "Estimation", icon: ClipboardList },
  { id: "sent_to_customer", label: "Sent to client", icon: Send },
  { id: "customer_approved", label: "Client approved", icon: CheckCircle2 },
  { id: "customer_rejected", label: "Client declined", icon: XCircle },
  { id: "install", label: "Install", icon: Wrench },
  { id: "closed", label: "Closed", icon: CheckCircle },
];

const mainTabs: { id: MainTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "timeline", label: "Timeline" },
  { id: "files", label: "Files" },
  { id: "surveys", label: "Surveys" },
  { id: "boq", label: "BOQ & Internal" },
  { id: "client-docs", label: "Client Docs" },
  { id: "work-orders", label: "Work Orders" },
  { id: "chat-calls", label: "Chat & Calls" },
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

  // Backwards compatibility: old "idea" and "new" now map to "open"
  if (s === "idea" || s === "new" || s === "open") return "open";
  if (s === "estimation") return "estimation";
  if (s === "sent_to_customer") return "sent_to_customer";
  if (s === "customer_approved") return "customer_approved";
  if (s === "customer_rejected") return "customer_rejected";
  if (s === "survey") return "survey";
  if (s === "install") return "install";
  if (s === "closed") return "closed";

  // fallback
  return "estimation";
}

function getNextStageConfig(stage: ProjectStage): { id: ProjectStage; ctaLabel: string } | null {
  switch (stage) {
    case "open":
      return { id: "survey", ctaLabel: "Request survey" };
    case "survey":
      return { id: "estimation", ctaLabel: "Prepare estimate" };
    case "estimation":
      return { id: "sent_to_customer", ctaLabel: "Send to client" };
    case "sent_to_customer":
      return { id: "customer_approved", ctaLabel: "Mark client approved" };
    case "customer_approved":
      return { id: "install", ctaLabel: "Move to install" };
    case "customer_rejected":
      return { id: "closed", ctaLabel: "Close project" };
    case "install":
      return { id: "closed", ctaLabel: "Mark project closed" };
    case "closed":
    default:
      return null;
  }
}

function formatActivityMessage(item: ActivityLogRow): string {
  if (item.action === "stage_changed") {
    const from = item.meta_json?.from ?? "";
    const to = item.meta_json?.to ?? "";
    return `Stage changed from ${from} to ${to}`;
  }

  if (item.action === "project_updated") {
    return "Project details updated";
  }

  // Fallback: prettify action string
  return item.action.replace(/_/g, " ");
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  // unwrap Next 16 async params in a client component
  const resolvedParams = React.use(params);
  const { tenantId, projectId } = resolvedParams;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [endClients, setEndClients] = useState<EndClientRecord[]>([]);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState<string>("");
  const [projectStage, setProjectStage] = useState<ProjectStage>("estimation");
  const [projectDescription, setProjectDescription] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<MainTab>("overview");
  const [activeClientDocsTab, setActiveClientDocsTab] =
    useState<ClientDocsSubTab>("client-estimates");

  const [isEditing, setIsEditing] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [editName, setEditName] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);

  const [activity, setActivity] = useState<ActivityLogRow[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  const shortProjectId =
    typeof projectId === "string" ? projectId.slice(0, 6) : "";

  const currentStageLabel =
    projectStages.find((s) => s.id === projectStage)?.label ?? projectStage;

  const nextStageConfig = getNextStageConfig(projectStage);

  const supabase = createBrowserClient();

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const { data: proj, error: pErr } = await supabase
          .from("projects")
          .select("id,name,description,status,tenant_id,created_at,updated_at")
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
        if (isMounted) {
          setEditName(proj.name ?? "");
          setEditDescription(proj.description ?? "");
        }

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

        // Load end clients for this workspace and the current project->client link
        try {
          if (isMounted) {
            const effectiveTenantId = proj.tenant_id ?? tenantId;

            const { data: clients, error: clientsErr } = await supabase
              .from("end_clients")
              .select("id,company_name,contact_name,phone")
              .eq("tenant_id", effectiveTenantId)
              .is("deleted_at", null);

            if (clientsErr) {
              console.error("Error loading end clients for project:", clientsErr);
            } else if (clients && isMounted) {
              setEndClients(clients as EndClientRecord[]);
            }

            const { data: linkRows, error: linkErr } = await supabase
              .from("project_end_clients")
              .select("project_id,end_client_id")
              .eq("project_id", proj.id)
              .limit(1);

            if (linkErr) {
              console.error(
                "Error loading project->client link:",
                JSON.stringify(linkErr, null, 2)
              );
            } else if (linkRows && linkRows.length > 0 && isMounted) {
              const linkRow = linkRows[0] as ProjectEndClientRecord;
              setCurrentClientId(linkRow.end_client_id);
              setSelectedClientId(linkRow.end_client_id);
            }
          }
        } catch (clientErr) {
          console.error("Unexpected error loading clients for project:", clientErr);
        }

        // Load activity timeline for this project
        try {
          if (isMounted && proj.id) {
            setIsActivityLoading(true);
            setActivityError(null);

            const { data: activityRows, error: aErr } = await supabase
              .from("activity_log")
              .select(
                "id,actor_member_id,project_id,entity,entity_id,action,meta_json,created_at"
              )
              .eq("project_id", proj.id)
              .order("created_at", { ascending: false });

            if (aErr) {
              console.error("Error loading activity log:", aErr);
              if (isMounted) {
                setActivityError("Failed to load timeline.");
              }
            } else if (isMounted) {
              setActivity((activityRows ?? []) as ActivityLogRow[]);
            }
          }
        } finally {
          if (isMounted) {
            setIsActivityLoading(false);
          }
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

  async function handleStageClick(stageId: ProjectStage) {
    if (!project || stageId === projectStage) return;

    const previousStage = projectStage;
    try {
      setIsUpdatingStage(true);
      setStageError(null);
      setProjectStage(stageId);

      const { data, error } = await supabase
        .from("projects")
        .update({ status: stageId })
        .eq("id", project.id)
        .select(
          "id,name,description,status,tenant_id,created_at,updated_at"
        )
        .single<ProjectRecord>();

      if (error) {
        console.error("Error updating project stage:", error);
        setStageError("Couldn't update stage. Please try again.");
        setProjectStage(previousStage);
        return;
      }

      if (data) {
        setProject(data);
        // Log stage change in activity_log
        try {
          const { data: logged, error: logErr } = await supabase
            .from("activity_log")
            .insert([
              {
                actor_member_id: null,
                project_id: data.id,
                entity: "project",
                entity_id: data.id,
                action: "stage_changed",
                meta_json: { from: previousStage, to: stageId },
              },
            ])
            .select(
              "id,actor_member_id,project_id,entity,entity_id,action,meta_json,created_at"
            );

          if (logErr) {
            console.error("Error logging stage change activity:", logErr);
          } else if (logged && logged.length > 0) {
            setActivity((prev) => [
              logged[0] as ActivityLogRow,
              ...prev,
            ]);
          }
        } catch (logErr) {
          console.error("Unexpected error logging stage change:", logErr);
        }
      }
    } catch (err) {
      console.error("Unexpected error updating stage:", err);
      setStageError("Couldn't update stage. Please try again.");
      setProjectStage(previousStage);
    } finally {
      setIsUpdatingStage(false);
    }
  }

  function handleStartEditing() {
    if (!project) return;
    setEditName(project.name ?? "");
    setEditDescription(projectDescription ?? "");
    setSelectedClientId(currentClientId);
    setIsEditing(true);
  }

  function handleCancelEditing() {
    setIsEditing(false);
    setEditName(project?.name ?? "");
    setEditDescription(projectDescription ?? "");
    setSelectedClientId(currentClientId);
  }

  async function handleSaveDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!project) return;

    const oldName = project?.name ?? null;
    const oldDescription = project?.description ?? null;
    const oldClientId = currentClientId;

    try {
      setIsSavingDetails(true);

      const { data, error } = await supabase
        .from("projects")
        .update({
          name: editName.trim() || null,
          description: editDescription.trim() || null,
        })
        .eq("id", project.id)
        .select(
          "id,name,description,status,tenant_id,created_at,updated_at"
        )
        .single<ProjectRecord>();

      if (error) {
        console.error("Error updating project details:", error);
        return;
      }

      if (data) {
        setProject(data);
        setProjectDescription(data.description ?? null);
        setIsEditing(false);

        let clientChanged = false;
        const newClientId = selectedClientId || null;

        // Upsert/delete link in project_end_clients
        try {
          if (oldClientId !== newClientId) {
            clientChanged = true;

            if (newClientId) {
              if (oldClientId) {
                // Update existing link for this project
                const { error: linkErr } = await supabase
                  .from("project_end_clients")
                  .update({ end_client_id: newClientId })
                  .eq("project_id", data.id);

                if (linkErr) {
                  console.error(
                    "Error updating project client link:",
                    JSON.stringify(linkErr, null, 2)
                  );
                } else {
                  setCurrentClientId(newClientId);
                }
              } else {
                // Insert new link for this project
                const { error: linkErr } = await supabase
                  .from("project_end_clients")
                  .insert([
                    {
                      project_id: data.id,
                      end_client_id: newClientId,
                    },
                  ]);

                if (linkErr) {
                  console.error(
                    "Error creating project client link:",
                    JSON.stringify(linkErr, null, 2)
                  );
                } else {
                  setCurrentClientId(newClientId);
                }
              }
            } else if (oldClientId) {
              // Remove existing link for this project
              const { error: linkErr } = await supabase
                .from("project_end_clients")
                .delete()
                .eq("project_id", data.id);

              if (linkErr) {
                console.error("Error removing project client link:", linkErr);
              } else {
                setCurrentClientId(null);
              }
            }
          }
        } catch (linkErr) {
          console.error("Unexpected error updating project client link:", linkErr);
        }

        // Log project update in activity_log
        try {
          const inserts: any[] = [
            {
              actor_member_id: null,
              project_id: data.id,
              entity: "project",
              entity_id: data.id,
              action: "project_updated",
              meta_json: {
                name: { from: oldName, to: data.name },
                description: { from: oldDescription, to: data.description },
              },
            },
          ];

          if (clientChanged) {
            inserts.push({
              actor_member_id: null,
              project_id: data.id,
              entity: "project",
              entity_id: data.id,
              action: "client_linked",
              meta_json: {
                from: oldClientId,
                to: newClientId,
              },
            });
          }

          const { data: logged, error: logErr } = await supabase
            .from("activity_log")
            .insert(inserts)
            .select(
              "id,actor_member_id,project_id,entity,entity_id,action,meta_json,created_at"
            );

          if (logErr) {
            console.error(
              "Error logging project update activity:",
              JSON.stringify(logErr, null, 2)
            );
          } else if (logged && logged.length > 0) {
            setActivity((prev) => [
              ...(logged as ActivityLogRow[]),
              ...prev,
            ]);
          }
        } catch (logErr) {
          console.error("Unexpected error logging project update:", logErr);
        }
      }
    } catch (err) {
      console.error("Unexpected error updating project details:", err);
    } finally {
      setIsSavingDetails(false);
    }
  }

  const headerTitle =
    project?.name?.trim() ||
    (shortProjectId ? `Project #${shortProjectId}` : "Project");

  const currentClient =
    currentClientId && endClients.find((c) => c.id === currentClientId);
  const currentClientLabel = currentClient
    ? currentClient.company_name || currentClient.contact_name || "Client"
    : null;
  const currentClientPhone =
    currentClient && currentClient.phone ? currentClient.phone : null;

  const selectedClient =
    selectedClientId && endClients.find((c) => c.id === selectedClientId);
  const selectedClientPhone =
    selectedClient && selectedClient.phone ? selectedClient.phone : null;

  const filteredEndClients = React.useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return endClients;

    return endClients.filter((client) => {
      const haystack = [
        client.company_name ?? "",
        client.contact_name ?? "",
        client.phone ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [clientSearch, endClients]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top header / breadcrumb */}
      <header className="sticky top-0 z-20 border-b border-emerald-100/60 bg-white/80 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="space-y-1">
            <div className="flex items-center text-sm text-emerald-900/80">
              <Link
                href={`/portal/${tenantId}/projects?view=table`}
                className="font-medium text-emerald-800 hover:text-emerald-900"
              >
                Projects
              </Link>
              <span className="mx-1 text-emerald-700/60">/</span>
              <span className="font-medium text-emerald-950/90">
                Project workspace
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950 md:text-xl">
                {headerTitle}
              </h1>
              {shortProjectId && (
                <Badge
                  variant="outline"
                  className="border-emerald-300 bg-emerald-50/70 text-[10px] uppercase tracking-wide text-emerald-800"
                >
                  #{shortProjectId}
                </Badge>
              )}
            </div>
            <p className="hidden text-sm text-emerald-900/70 sm:block">
              All communication, documents, and work orders for this project live here.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              {nextStageConfig && (
                <Button
                  size="sm"
                  className="bg-emerald-600 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                  onClick={() => handleStageClick(nextStageConfig.id)}
                  disabled={isUpdatingStage || !project}
                >
                  {nextStageConfig.ctaLabel}
                </Button>
              )}
            </div>

            {/* Close project view */}
            <Link
              href={`/portal/${tenantId}/projects?view=table`}
              className="hidden md:inline-flex"
            >
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 border-red-200 bg-red-50/80 text-red-600 shadow-sm hover:border-red-300 hover:bg-red-100"
              >
                <XCircle className="h-4 w-4" />
                <span className="sr-only">Close project view</span>
              </Button>
            </Link>

            {/* Mobile sheet for project actions & tabs */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 border-emerald-200 bg-white/70 text-emerald-900 shadow-sm hover:bg-emerald-50 md:hidden"
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open project menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 border-emerald-100 bg-emerald-50/90 p-4 backdrop-blur">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                      Project
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-900">
                      {headerTitle}
                    </p>
                    <p className="mt-0.5 text-sm text-emerald-900/70">
                      Workspace: {workspaceName || tenantId || "—"}
                    </p>
                  </div>

                  <Separator className="bg-emerald-100" />

                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                      Quick actions
                    </p>
                    <div className="flex flex-col gap-2">
                      {nextStageConfig ? (
                        <Button
                          size="sm"
                          className="w-full bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
                          onClick={() => handleStageClick(nextStageConfig.id)}
                          disabled={isUpdatingStage || !project}
                        >
                          {nextStageConfig.ctaLabel}
                        </Button>
                      ) : (
                        <p className="text-xs text-emerald-900/70">
                          This project is already closed. No further stages.
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-emerald-100" />

                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                      Sections
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      {mainTabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={classNames(
                            "rounded-md px-2 py-1 text-left text-sm font-medium",
                            activeTab === tab.id
                              ? "bg-emerald-600 text-white"
                              : "bg-white/60 text-emerald-900 hover:bg-emerald-100/80"
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Tabs bar */}
        <div className="border-t border-emerald-100/70 bg-white/70">
          <div className="w-full px-3 pb-1 pt-2 md:px-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MainTab)}>
              <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto border border-emerald-100/80 bg-white/70 px-1 py-1 text-sm shadow-sm backdrop-blur">
                {mainTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex w-full flex-1 flex-col gap-4 px-3 py-4 md:px-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="col-span-2 border-emerald-100/70 bg-white/70 backdrop-blur">
              <CardContent className="space-y-3 pt-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card className="border-emerald-100/70 bg-white/70 backdrop-blur">
              <CardContent className="space-y-3 pt-4">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MainTab)} className="flex-1">
            {/* Overview */}
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-4">
                {/* Project journey card (full-width, above all) */}
                <Card className="border-emerald-100/80 bg-gradient-to-r from-emerald-50/90 via-white/80 to-emerald-50/80 shadow-sm backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-950">
                      Project journey
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      From <span className="font-semibold">Open</span> → Survey → Estimation → Sent to client → Client approved / Client declined → Install → Closed.
                      Click a stage to update the current status of this project.
                    </CardDescription>
                    {stageError && (
                      <p className="mt-2 text-xs text-red-600">{stageError}</p>
                    )}
                    {isUpdatingStage && (
                      <p className="mt-1 text-xs text-emerald-700">
                        Updating stage...
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="mt-1 flex flex-wrap items-stretch justify-between gap-2 rounded-xl border border-dashed border-emerald-100 bg-emerald-50/60 px-3 py-3">
                      {projectStages.map((stage, index) => {
                        const isActive = stage.id === projectStage;
                        const activeIndex = projectStages.findIndex(
                          (s) => s.id === projectStage
                        );
                        const isCompleted = activeIndex > index;

                        const Icon = stage.icon;
                        return (
                          <div
                            key={stage.id}
                            className="flex min-w-[120px] flex-1 items-center gap-2"
                          >
                            <button
                              type="button"
                              onClick={() => handleStageClick(stage.id)}
                              disabled={isUpdatingStage}
                              className={classNames(
                                "flex h-9 w-full items-center justify-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors",
                                isActive &&
                                  "border-emerald-500 bg-emerald-600 text-white shadow-sm",
                                !isActive &&
                                  isCompleted &&
                                  "border-emerald-200 bg-emerald-50 text-emerald-800",
                                !isActive &&
                                  !isCompleted &&
                                  "border-emerald-100 bg-white/70 text-emerald-900/80 hover:border-emerald-300 hover:bg-emerald-50/80",
                                isUpdatingStage && "opacity-70 cursor-wait"
                              )}
                            >
                              <span className="flex items-center justify-center">
                                <Icon
                                  className={classNames(
                                    "h-3.5 w-3.5",
                                    isActive ? "text-white" : "text-emerald-700"
                                  )}
                                />
                              </span>
                              <span className="capitalize">{stage.label}</span>
                            </button>
                            {index < projectStages.length - 1 && (
                              <div className="hidden h-px w-6 bg-emerald-100 md:block" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-500">
                      We recommend moving to the next stage only after the previous step is complete.
                    </p>
                  </CardContent>
                </Card>

                {/* Main overview layout below journey */}
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1 space-y-4">
                    <Card className="border-emerald-100/80 bg-white/80 shadow-sm backdrop-blur">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-sm font-semibold text-slate-950">
                              Overview
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-600">
                              High-level summary of this project: stage, reference, and workspace details.
                            </CardDescription>
                            {loadError && (
                              <p className="mt-2 text-sm text-red-600">{loadError}</p>
                            )}
                          </div>
                          {!isEditing && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleStartEditing}
                              className="border-emerald-200 bg-white/80 text-xs font-medium text-emerald-900 hover:bg-emerald-50/80"
                              disabled={isSavingDetails}
                            >
                              Edit details
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isEditing ? (
                          <form onSubmit={handleSaveDetails} className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-600">
                                Project name
                              </label>
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-9 border-emerald-100 bg-white/80 text-sm"
                                placeholder="Project name"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-600">
                                Project description
                              </label>
                              <Textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="min-h-[90px] border-emerald-100 bg-white/80 text-sm"
                                placeholder="Describe the site, scope of work, and any special notes."
                              />
                              <p className="text-xs text-slate-500">
                                This will also update the Project description card below.
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-600">
                                Linked client (end customer)
                              </label>
                              <Input
                                placeholder="Search clients by name or phone"
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                                className="mb-1 h-8 border-emerald-100 bg-white/80 text-xs"
                              />
                              <select
                                value={selectedClientId || ""}
                                onChange={(e) =>
                                  setSelectedClientId(
                                    e.target.value ? e.target.value : null
                                  )
                                }
                                className="h-9 w-full rounded-md border border-emerald-100 bg-white/80 text-sm text-slate-800"
                              >
                                <option value="">No client linked yet</option>
                                {filteredEndClients.length === 0 ? (
                                  <option value="" disabled>
                                    No clients match this search
                                  </option>
                                ) : (
                                  filteredEndClients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                      {client.company_name ||
                                        client.contact_name ||
                                        "Unnamed client"}
                                    </option>
                                  ))
                                )}
                              </select>
                              <p className="text-xs text-slate-500">
                                This client will be used on estimates and handover documents for this project.
                              </p>
                              {selectedClientPhone && (
                                <p className="text-xs text-slate-500">
                                  Current client phone:{" "}
                                  <span className="font-medium">
                                    {selectedClientPhone}
                                  </span>
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="submit"
                                size="sm"
                                className="bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
                                disabled={isSavingDetails}
                              >
                                {isSavingDetails ? "Saving..." : "Save changes"}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="border-slate-200 bg-white/80 text-xs text-slate-700 hover:bg-slate-50"
                                onClick={handleCancelEditing}
                                disabled={isSavingDetails}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-4 text-sm text-slate-800">
                            {/* Project snapshot */}
                            <section className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 shadow-sm">
                              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                Project snapshot
                              </p>
                              <div className="mt-2 grid gap-2 md:grid-cols-2">
                                <div className="space-y-1">
                                  <p className="text-xs text-slate-500">Project title</p>
                                  <p className="font-medium text-slate-900">
                                    {headerTitle}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-slate-500">Client</p>
                                  <p className="truncate font-medium">
                                    {currentClientLabel || "Not linked yet"}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-slate-500">Stage</p>
                                  <p className="capitalize">{currentStageLabel}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-slate-500">Workspace</p>
                                  <p className="truncate">
                                    {workspaceName || tenantId || "—"}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-slate-500">Client phone</p>
                                  <p className="truncate">
                                    {currentClientPhone || "—"}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-slate-500">Project reference</p>
                                  <p className="font-mono text-xs">
                                    {shortProjectId ? `Project-${shortProjectId}` : "—"}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-slate-500">Created</p>
                                  <p>
                                    {project?.created_at
                                      ? new Date(project.created_at).toLocaleDateString()
                                      : "—"}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-slate-500">Last updated</p>
                                  <p>
                                    {project?.updated_at
                                      ? new Date(project.updated_at).toLocaleDateString()
                                      : "—"}
                                  </p>
                                </div>
                              </div>
                              <p className="mt-2 text-xs text-emerald-900/80">
                                We will move this project step-by-step until it is fully installed and handed over.
                              </p>
                            </section>

                            <Separator className="bg-emerald-100" />

                            {/* Key dates */}
                            <section className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Key dates
                              </p>
                              <div className="grid gap-2 md:grid-cols-2">
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                                  <span className="text-xs text-slate-500">Survey</span>
                                  <span className="text-xs font-medium text-slate-800">Not scheduled yet</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                                  <span className="text-xs text-slate-500">Estimate sent</span>
                                  <span className="text-xs font-medium text-slate-800">Pending</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                                  <span className="text-xs text-slate-500">Client approval</span>
                                  <span className="text-xs font-medium text-slate-800">Not approved yet</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                                  <span className="text-xs text-slate-500">Install start</span>
                                  <span className="text-xs font-medium text-slate-800">Not scheduled yet</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                                  <span className="text-xs text-slate-500">Install finish</span>
                                  <span className="text-xs font-medium text-slate-800">Not scheduled yet</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                                  <span className="text-xs text-slate-500">Handover</span>
                                  <span className="text-xs font-medium text-slate-800">Pending</span>
                                </div>
                              </div>
                            </section>

                            <Separator className="bg-emerald-100" />

                            {/* Financial overview */}
                            <section className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Financial overview
                              </p>
                              <div className="grid gap-2 md:grid-cols-2">
                                <div className="flex flex-col gap-0.5 rounded-lg border border-emerald-100 bg-white/80 px-3 py-2">
                                  <span className="text-xs text-slate-500">BOQ total (internal)</span>
                                  <span className="text-sm font-medium text-slate-900">Coming soon</span>
                                </div>
                                <div className="flex flex-col gap-0.5 rounded-lg border border-emerald-100 bg-white/80 px-3 py-2">
                                  <span className="text-xs text-slate-500">Client estimate total</span>
                                  <span className="text-sm font-medium text-slate-900">Coming soon</span>
                                </div>
                                <div className="flex flex-col gap-0.5 rounded-lg border border-emerald-100 bg-white/80 px-3 py-2">
                                  <span className="text-xs text-slate-500">Approved amount</span>
                                  <span className="text-sm font-medium text-slate-900">Coming soon</span>
                                </div>
                                <div className="flex flex-col gap-0.5 rounded-lg border border-emerald-100 bg-white/80 px-3 py-2">
                                  <span className="text-xs text-slate-500">Payment status</span>
                                  <span className="text-xs font-medium text-amber-700">Invoice workflow not linked yet</span>
                                </div>
                              </div>
                            </section>

                            <Separator className="bg-emerald-100" />

                            {/* Documents summary */}
                            <section className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Documents summary
                              </p>
                              <div className="grid gap-2 md:grid-cols-2">
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                                  <span className="text-xs text-slate-500">Survey report</span>
                                  <span className="text-xs font-medium text-slate-800">Not uploaded</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                                  <span className="text-xs text-slate-500">Client estimate</span>
                                  <span className="text-xs font-medium text-slate-800">Not created</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                                  <span className="text-xs text-slate-500">Work orders</span>
                                  <span className="text-xs font-medium text-slate-800">0 work orders</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                                  <span className="text-xs text-slate-500">Delivery notes</span>
                                  <span className="text-xs font-medium text-slate-800">No deliveries yet</span>
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                                  <span className="text-xs text-slate-500">Handover certificate</span>
                                  <span className="text-xs font-medium text-slate-800">Not generated</span>
                                </div>
                              </div>
                            </section>

                            <Separator className="bg-emerald-100" />

                            {/* Scope summary */}
                            <section className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Scope summary
                              </p>
                              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700">
                                {projectDescription ? (
                                  <p>{projectDescription}</p>
                                ) : (
                                  <p>
                                    Scope details (number of rooms, devices, materials, and any special notes) will appear here once the BOQ and surveys are prepared.
                                  </p>
                                )}
                              </div>
                            </section>

                            <Separator className="bg-emerald-100" />

                            {/* Communication */}
                            <section className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Communication
                              </p>
                              <div className="grid gap-2 md:grid-cols-2">
                                <div className="rounded-lg border border-emerald-100 bg-white/80 px-3 py-2">
                                  <p className="text-xs text-slate-500">Account / project owner</p>
                                  <p className="text-sm font-medium text-slate-900">
                                    To be linked from workforce
                                  </p>
                                </div>
                                <div className="rounded-lg border border-emerald-100 bg-white/80 px-3 py-2">
                                  <p className="text-xs text-slate-500">Technician lead</p>
                                  <p className="text-sm font-medium text-slate-900">
                                    Will show assigned leader for site visits
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-slate-600">
                                For urgent matters, use the <span className="font-medium">Chat &amp; Calls</span> tab to reach our team directly.
                              </p>
                            </section>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-emerald-100/80 bg-white/80 shadow-sm backdrop-blur">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-950">
                          Project description
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-600">
                          High-level notes about the site, scope of work, and any special agreements.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700">
                          {projectDescription ? (
                            <p>{projectDescription}</p>
                          ) : (
                            <p>
                              Your project description will appear here once it is added by our team.
                              It usually includes the site name, agreed scope of work, and important notes.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="w-full space-y-4 md:w-72">
                    <Card className="border-emerald-100/80 bg-gradient-to-b from-emerald-50/90 to-white/80 shadow-sm backdrop-blur">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-950">
                          Next steps
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-slate-800">
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <p>
                            Our team will add surveys, estimates, and delivery notes here as the project progresses.
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <p>
                            You will be able to track technician visits, work orders, and handover from this workspace.
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <p>
                            For any urgent updates, you can use the{" "}
                            <span className="font-medium">Chat &amp; Calls</span> tab.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-emerald-100/80 bg-white/80 shadow-sm backdrop-blur">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-slate-950">
                          Quick info
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-slate-800">
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Workspace</span>
                          <span className="truncate font-medium">
                            {workspaceName || tenantId || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Project ID</span>
                          <span className="font-mono text-sm">
                            {shortProjectId ? `Project-${shortProjectId}` : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Stage</span>
                          <span className="capitalize">{currentStageLabel}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Client</span>
                          <span className="truncate font-medium">
                            {currentClientLabel || "Not linked yet"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Client phone</span>
                          <span className="truncate">
                            {currentClientPhone || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Created</span>
                          <span>
                            {project?.created_at
                              ? new Date(project.created_at).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Last updated</span>
                          <span>
                            {project?.updated_at
                              ? new Date(project.updated_at).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Timeline */}
            <TabsContent value="timeline" className="mt-0">
              <Card className="border-emerald-100/80 bg-white/80 shadow-sm backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-slate-950">
                    Timeline &amp; Activity
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    A chronological activity feed will appear here (project created, survey booked, estimate sent, delivery notes, work orders, handover, etc.).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activityError && (
                    <p className="mb-2 text-sm text-red-600">{activityError}</p>
                  )}

                  {isActivityLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  ) : activity.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
                      No activity logged yet. As the project progresses, updates will appear here automatically.
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {activity.map((item) => (
                        <li key={item.id} className="flex gap-3">
                          <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                          <div className="flex-1 space-y-0.5">
                            <p className="text-sm font-medium text-slate-900">
                              {formatActivityMessage(item)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Files */}
            <TabsContent value="files" className="mt-0">
              <Card className="border-emerald-100/80 bg-white/80 shadow-sm backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-slate-950">
                    Files &amp; Attachments
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    Uploaded PDFs, DWGs, images, and other documents linked to this project.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
                    Future: connect to project_files table and show uploads from technicians and clients.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Surveys */}
            <TabsContent value="surveys" className="mt-0">
              <Card className="border-emerald-100/80 bg-white/80 shadow-sm backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-slate-950">
                    Surveys
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    AI surveyor runs and in-person survey reports linked to the project.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
                    Future: list AI survey runs, attachments, and technicians' survey notes here.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* BOQ */}
            <TabsContent value="boq" className="mt-0">
              <Card className="border-emerald-100/80 bg-white/80 shadow-sm backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-slate-950">
                    BOQ &amp; Internal Costing
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    Internal BOQs and costing for this project (linked to boqs and boq_items tables).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
                    Future: show BOQ summary, margins, and links to Zoho estimates/invoices.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Client Docs */}
            <TabsContent value="client-docs" className="mt-0">
              <div className="flex flex-col gap-4">
                <Card className="border-emerald-100/80 bg-white/80 shadow-sm backdrop-blur">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-950">
                      Client Documents
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      White-label documents your customer sees: estimates, delivery notes, and handover certificates.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <Tabs
                      value={activeClientDocsTab}
                      onValueChange={(v) =>
                        setActiveClientDocsTab(v as ClientDocsSubTab)
                      }
                    >
                      <TabsList className="flex h-auto justify-start gap-1 overflow-x-auto border border-emerald-100 bg-emerald-50/70 px-1 py-1 text-sm backdrop-blur">
                        {clientDocsSubTabs.map((tab) => (
                          <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                          >
                            {tab.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      <TabsContent value="client-estimates" className="mt-3 space-y-3">
                        <p className="text-sm text-slate-600">
                          List of client-facing estimates will appear here with status (draft / sent / accepted), total amount, and quick actions.
                        </p>
                        <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-800">
                          Future: connect this to Zoho Estimates and our white-label PDF templates.
                        </div>
                      </TabsContent>

                      <TabsContent value="delivery-notes" className="mt-3 space-y-3">
                        <p className="text-sm text-slate-600">
                          Material delivery notes per drop will be shown here with ordered vs delivered vs remaining quantities.
                        </p>
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
                          Future: table of delivery notes + per-item progress.
                        </div>
                      </TabsContent>

                      <TabsContent value="handover" className="mt-3 space-y-3">
                        <p className="text-sm text-slate-600">
                          Project handover documents (completion report, snag-list status, client signature) will be managed here.
                        </p>
                        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
                          Future: generate a formal handover certificate and capture sign-off details.
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Work Orders */}
            <TabsContent value="work-orders" className="mt-0">
              <Card className="border-emerald-100/80 bg-white/80 shadow-sm backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-slate-950">
                    Work Orders
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    Internal work orders for technicians and crews, linked to installation schedule and progress.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
                    Future: show technician assignments, visit dates, and completion status per work order.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Chat & Calls */}
            <TabsContent value="chat-calls" className="mt-0">
              <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
                <Card className="border-emerald-100/80 bg-white/80 shadow-sm backdrop-blur">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm font-semibold text-slate-950">
                          Chat with assigned team
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-600">
                          All project messages stay here instead of WhatsApp.
                        </CardDescription>
                      </div>
                      <Badge className="bg-emerald-600 text-[10px] font-semibold text-white">
                        Coming Soon
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-700">
                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                      <p>
                        This space will show the full chat history between you and the BOCC / VariForce team for this project.
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Messages, images, and documents shared here are linked to the project activity timeline.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                        Open chat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-200 bg-white/70 text-sm font-medium text-emerald-900 hover:bg-emerald-50/80"
                      >
                        <PhoneCall className="mr-1.5 h-3.5 w-3.5" />
                        Start audio call
                      </Button>
                    </div>
                    <p className="text-sm text-slate-500">
                      In the MVP we will start with audio calls only. Later we can enable call recordings and advanced routing.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100/80 bg-gradient-to-b from-emerald-50/90 to-white/80 shadow-sm backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-950">
                      Assigned team &amp; live location
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      See who is working on your project and where they are during visits.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-800">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Assigned team (placeholder)
                      </p>
                      <div className="space-y-1 rounded-lg border border-emerald-100 bg-white/70 p-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">Workforce Leader</span>
                          <span className="text-sm text-slate-500">To be linked from workforce table</span>
                        </div>
                        <Separator className="my-1 bg-emerald-100" />
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span>Technicians / Helpers</span>
                          <span className="text-slate-500">Will list names &amp; roles</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Live location (later phase)
                      </p>
                      <div className="flex items-start gap-2 rounded-lg border border-dashed border-emerald-200 bg-emerald-50/70 p-3">
                        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/90 text-white shadow-sm">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-900">
                            Live technician location
                          </p>
                          <p className="text-sm text-slate-700">
                            Once a team starts working on site, you will see an approximate live location and visit status here.
                          </p>
                          <p className="text-sm text-slate-500">
                            This will be powered by the VariForce technician app (GPS) and updated in real time.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}