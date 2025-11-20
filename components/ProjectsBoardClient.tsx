"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  FileText,
  ClipboardList,
  Send,
  CheckCircle2,
  XCircle,
  Wrench,
  CheckCircle,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Project {
  id: string;
  name: string | null;
  status: string | null;
  updated_at: string;
  tenant_id: string;
}

interface UpdateResult {
  ok: boolean;
  error?: string;
  project?: {
    id: string;
    status: string;
    updated_at: string;
  };
}

interface ProjectsBoardClientProps {
  tenantId: string;
  initialProjects: Project[];
  updateStatusAction: (input: {
    projectId: string;
    tenantId: string;
    status: string;
  }) => Promise<UpdateResult>;
}

type KanbanStatus =
  | "open"
  | "survey"
  | "estimation"
  | "sent_to_customer"
  | "customer_approved"
  | "client_declined"
  | "install"
  | "closed";

function normalizeStatus(status: string | null | undefined): KanbanStatus {
  if (!status) return "open";

  const s = status.toLowerCase().trim().replace(/\s+/g, "_");

  // Legacy statuses map to the new lifecycle
  if (s === "idea" || s === "new" || s === "open") return "open";

  if (s === "survey") return "survey";
  if (s === "estimation") return "estimation";
  if (s === "sent_to_customer") return "sent_to_customer";
  if (s === "customer_approved") return "customer_approved";
  if (s === "customer_rejected" || s === "client_declined") return "client_declined";
  if (s === "install") return "install";
  if (s === "closed") return "closed";

  // Fallback to "open" for any unknown value
  return "open";
}

const COLUMN_DEFS: { key: KanbanStatus; label: string; icon: LucideIcon }[] = [
  { key: "open", label: "Open", icon: Sparkles },
  { key: "survey", label: "Survey", icon: FileText },
  { key: "estimation", label: "Estimation", icon: ClipboardList },
  { key: "sent_to_customer", label: "Sent to client", icon: Send },
  { key: "customer_approved", label: "Client approved", icon: CheckCircle2 },
  { key: "client_declined", label: "Client declined", icon: XCircle },
  { key: "install", label: "Install", icon: Wrench },
  { key: "closed", label: "Closed", icon: CheckCircle },
];

export default function ProjectsBoardClient({
  tenantId,
  initialProjects,
  updateStatusAction,
}: ProjectsBoardClientProps) {
  const supabase = createClientComponentClient();

  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hoveredStatus, setHoveredStatus] = useState<KanbanStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const onDragStart = (projectId: string) => {
    setDraggedProjectId(projectId);
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = (status: KanbanStatus) => {
    setHoveredStatus(status);
  };

  const handleDragLeave = (status: KanbanStatus) => {
    setHoveredStatus((current) => (current === status ? null : current));
  };

  const onDrop = async (targetStatusKey: KanbanStatus) => {
    if (!draggedProjectId) return;
    const projectId = draggedProjectId;
    setDraggedProjectId(null);

    const trimmedId = projectId.trim();
    const trimmedTenantId = tenantId.trim();

    setHoveredStatus(null);

    const existing = projects.find((p) => p.id === trimmedId);
    const previousStatus = existing?.status ?? "open";

    const previousStatusNormalized = normalizeStatus(previousStatus);

    // Optimistic UI update
    setProjects((prev) =>
      prev.map((p) =>
        p.id === trimmedId
          ? {
              ...p,
              status: targetStatusKey,
            }
          : p
      )
    );

    setIsUpdating(true);
    try {
      const result = await updateStatusAction({
        projectId: trimmedId,
        tenantId: trimmedTenantId,
        status: targetStatusKey,
      });

      if (!result || !result.ok) {
        console.error("Error updating project status via server action:", result?.error);

        // Revert optimistic update
        setProjects((prev) =>
          prev.map((p) =>
            p.id === trimmedId
              ? {
                  ...p,
                  status: previousStatusNormalized,
                }
              : p
          )
        );
        return;
      }

      // Apply server-confirmed status + updated_at if returned
      if (result.project) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === trimmedId
              ? {
                  ...p,
                  status: result.project.status,
                  updated_at: result.project.updated_at,
                }
              : p
          )
        );
      }

      // Log status change in activity_log so it appears in Timeline
      try {
        const fromStatus = previousStatusNormalized;
        const toStatus = normalizeStatus(result.project?.status ?? targetStatusKey);

        await supabase.from("activity_log").insert([
          {
            actor_member_id: null,
            project_id: trimmedId,
            entity: "project",
            entity_id: trimmedId,
            action: "stage_changed",
            meta_json: { from: fromStatus, to: toStatus },
          },
        ]);
      } catch (logErr) {
        console.error("Error logging status change in activity_log:", logErr);
      }
    } catch (err) {
      console.error("Error updating project status via server action:", err);
      // Revert optimistic update on error
      setProjects((prev) =>
        prev.map((p) =>
          p.id === trimmedId
            ? {
                ...p,
                status: previousStatusNormalized,
              }
            : p
        )
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top toolbar: search */}
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <h2 className="text-sm font-semibold text-foreground/80">Projects board</h2>
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-full rounded-md border bg-background px-8 text-xs outline-none ring-emerald-500/40 placeholder:text-xs placeholder:text-muted-foreground focus:ring-1"
          />
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">🔍</span>
        </div>
      </div>

      {/* Kanban grid (responsive columns, same-stage cards grouped) */}
      <div className="relative">
        <div className="grid min-h-[60vh] grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8 md:gap-3 xl:gap-4">
          {COLUMN_DEFS.map((col) => {
            const columnProjects = projects.filter((p) => {
              const matchesStatus = normalizeStatus(p.status) === col.key;
              if (!matchesStatus) return false;
              if (!searchTerm) return true;
              const name = (p.name || "").toLowerCase();
              return name.includes(searchTerm.toLowerCase());
            });

            const isActive = hoveredStatus === col.key;

            return (
              <div
                key={col.key}
                className={`flex h-full min-h-[320px] flex-col rounded-lg border bg-card/40 p-2.5 backdrop-blur transition-colors ${
                  isActive ? "border-emerald-400/70 bg-emerald-50/60 shadow-sm" : ""
                }`}
                onDragOver={onDragOver}
                onDragEnter={() => handleDragEnter(col.key)}
                onDragLeave={() => handleDragLeave(col.key)}
                onDrop={() => onDrop(col.key)}
              >
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <div className="inline-flex items-center gap-1.5">
                    {(() => {
                      const Icon = col.icon;
                      return (
                        <Icon
                          className={
                            col.key === "client_declined"
                              ? "h-3.5 w-3.5 text-red-500"
                              : "h-3.5 w-3.5 text-emerald-700"
                          }
                        />
                      );
                    })()}
                    <span>{col.label}</span>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">
                    {columnProjects.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {columnProjects.length === 0 ? (
                    <div className="rounded border border-dashed border-muted-foreground/30 p-3 text-center text-[11px] text-muted-foreground/80">
                      Drag a project here to move it to this stage.
                    </div>
                  ) : (
                    columnProjects.map((project) => (
                      <div
                        key={project.id}
                        draggable
                        onDragStart={() => onDragStart(project.id)}
                        className="cursor-move rounded-md border bg-background/80 p-3 text-xs shadow-sm transition hover:border-emerald-400 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">
                            {project.name || "Untitled project"}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Last update:{" "}
                            {new Date(project.updated_at).toLocaleDateString()}
                          </div>
                          <div className="mt-1 flex items-center justify-end text-[10px]">
                            <Link
                              href={`/portal/${tenantId}/projects/${project.id}`}
                              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 hover:underline"
                            >
                              <span>Open project</span>
                              <span aria-hidden>→</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isUpdating && (
          <div className="fixed bottom-4 right-4 rounded-full bg-emerald-600 px-4 py-2 text-xs text-white shadow-lg">
            Updating status...
          </div>
        )}
      </div>
    </div>
  );
}