"use client";

import React, { useState } from "react";
import Link from "next/link";

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

type KanbanStatus = "idea" | "estimation" | "survey" | "install" | "closed";

function normalizeStatus(status: string | null | undefined): KanbanStatus {
  if (!status) return "idea";

  const s = status.toLowerCase().trim();

  if (s === "idea" || s === "estimation" || s === "survey" || s === "install" || s === "closed") {
    return s as KanbanStatus;
  }

  // Fallback to "idea" for any unknown value
  return "idea";
}

const COLUMN_DEFS = [
  { key: "idea" as const, label: "Idea" },
  { key: "estimation" as const, label: "Estimation" },
  { key: "survey" as const, label: "Survey" },
  { key: "install" as const, label: "Install" },
  { key: "closed" as const, label: "Closed" },
];

export default function ProjectsBoardClient({
  tenantId,
  initialProjects,
  updateStatusAction,
}: ProjectsBoardClientProps) {
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
    const previousStatus = existing?.status ?? "idea";

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

      {/* Kanban grid */}
      <div className="grid min-h-[60vh] grid-cols-1 gap-2 md:grid-cols-5 lg:gap-3 xl:gap-4">
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
                <span>{col.label}</span>
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
                          Last update: {new Date(project.updated_at).toLocaleDateString()}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px]">
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
                            {normalizeStatus(project.status)}
                          </span>
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

        {isUpdating && (
          <div className="fixed bottom-4 right-4 rounded-full bg-emerald-600 px-4 py-2 text-xs text-white shadow-lg">
            Updating status...
          </div>
        )}
      </div>
    </div>
  );
}