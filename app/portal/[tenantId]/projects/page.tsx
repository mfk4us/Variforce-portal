// app/portal/[tenantId]/projects/page.tsx
// NOTE: Page components must export a default React component.
// In Next.js 16, `params` is a Promise and must be awaited.
// The previous POST upload handler must live in `app/portal/[tenantId]/projects/route.ts` (server route),
// not inside this page component.

import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const supabase = createServiceClient();

  // Fetch real project data
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, status, updated_at")
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error loading projects:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
        <Link
          href={`/portal/${tenantId}/projects/new`}
          className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          + New Project
        </Link>
      </div>

      <div className="rounded-lg border bg-card/50 backdrop-blur">
        <div className="grid grid-cols-12 gap-2 border-b p-3 text-xs text-muted-foreground">
          <div className="col-span-4">Project</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-3">Last Updated</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y">
          {projects?.length ? (
            projects.map((p) => (
              <div key={p.id} className="grid grid-cols-12 gap-2 p-3 text-sm">
                <div className="col-span-4 truncate">{p.name || "Untitled"}</div>
                <div className="col-span-3">{p.status || "—"}</div>
                <div className="col-span-3">
                  {new Date(p.updated_at).toLocaleDateString()}
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Link
                    href={`/portal/${tenantId}/projects/${p.id}`}
                    className="underline"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No projects found. Click <span className="font-medium">New Project</span> to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}