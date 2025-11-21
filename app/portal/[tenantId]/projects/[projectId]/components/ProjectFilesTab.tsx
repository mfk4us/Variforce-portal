// "use client" marker for Next.js client component
"use client";

import React, { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FileText, Trash2, UploadCloud } from "lucide-react";

interface ProjectFilesTabProps {
  tenantId: string;
  projectId: string;
}

interface ProjectFileRow {
  id: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string;
  uploaded_at: string;
}

export function ProjectFilesTab({ tenantId, projectId }: ProjectFilesTabProps) {
  const supabase = createBrowserClient();

  const [files, setFiles] = useState<ProjectFileRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFiles() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const { data, error } = await supabase
          .from("project_files")
          .select("*")
          .eq("project_id", projectId)
          .order("uploaded_at", { ascending: false });

        if (error) {
          // Log full error details for debugging (message, code, details)
          console.error(
            "Error loading project files:",
            {
              message: (error as any).message,
              code: (error as any).code,
              details: (error as any).details,
              hint: (error as any).hint,
            }
          );

          if (isMounted) {
            const msg =
              (error as any).message ||
              (error as any).code ||
              "Failed to load files for this project.";
            setLoadError(msg);
          }
          return;
        }

        if (isMounted) {
          setFiles((data ?? []) as unknown as ProjectFileRow[]);
        }
      } catch (err) {
        console.error("Unexpected error loading project files:", err);
        if (isMounted) {
          setLoadError("Failed to load files for this project.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (tenantId && projectId) {
      void loadFiles();
    }

    return () => {
      isMounted = false;
    };
  }, [supabase, tenantId, projectId]);

  async function handleUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const storagePath = `${tenantId}/${projectId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading file to storage:", uploadError);
        setUploadError("Failed to upload file. Please try again.");
        return;
      }

      const insertPayload: any = {
        project_id: projectId,
        file_name: file.name,
        file_type: file.type || null,
        file_size: file.size,
        storage_path: storagePath,
        file_url: storagePath
      };

      const { data, error } = await supabase
        .from("project_files")
        .insert(insertPayload as any)
        .select("id,file_name,file_type,file_size,storage_path,uploaded_at")
        .single();

      if (error) {
        console.error("Error inserting project_files row:", error);
        setUploadError("File uploaded but metadata could not be saved.");
        return;
      }

      setFiles((prev) => [data as unknown as ProjectFileRow, ...prev]);
      event.target.value = "";
    } catch (err) {
      console.error("Unexpected error during upload:", err);
      setUploadError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(file: ProjectFileRow) {
    if (!file) return;

    setIsDeleting(file.id);

    try {
      const { error: storageError } = await supabase.storage
        .from("project-files")
        .remove([file.storage_path]);

      if (storageError) {
        console.error("Error deleting from storage:", storageError);
      }

      const { error } = await supabase.from("project_files").delete().eq("id", file.id) as any;

      if (error) {
        console.error("Error deleting project_files row:", error);
        return;
      }

      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (err) {
      console.error("Unexpected error deleting file:", err);
    } finally {
      setIsDeleting(null);
    }
  }

  function formatSize(bytes: number | null): string {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  return (
    <Card className="border-emerald-100/80 bg-white/80 shadow-sm backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-950">
              Files &amp; Attachments
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              Upload and manage files linked to this project.
            </CardDescription>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100">
            <UploadCloud className="h-3.5 w-3.5" />
            <span>{isUploading ? "Uploading..." : "Upload"}</span>
            <Input
              type="file"
              className="hidden"
              onChange={handleUploadChange}
              disabled={isUploading}
            />
          </label>
        </div>
        {uploadError && (
          <p className="mt-2 text-xs text-red-600">{uploadError}</p>
        )}
        {loadError && (
          <p className="mt-1 text-xs text-red-600">{loadError}</p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : files.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-600">
            No files uploaded yet. Use the upload button above to attach PDFs, images, or drawings.
          </div>
        ) : (
          <ul className="space-y-2 text-sm text-slate-800">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50/80 px-3 py-2"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {file.file_name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {formatSize(file.file_size)} ·
                      {" "}
                      {new Date(file.uploaded_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {file.file_type && (
                    <Badge
                      variant="outline"
                      className="hidden border-emerald-200 bg-emerald-50/70 text-[10px] uppercase tracking-wide text-emerald-800 sm:inline-flex"
                    >
                      {file.file_type.split("/")[1] || file.file_type}
                    </Badge>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 border-red-200 bg-red-50/80 text-red-600 hover:border-red-300 hover:bg-red-100"
                    onClick={() => handleDelete(file)}
                    disabled={isDeleting === file.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete file</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default ProjectFilesTab;