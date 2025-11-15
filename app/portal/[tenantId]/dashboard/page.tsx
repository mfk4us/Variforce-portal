import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href?: string;
}) {
  const body = (
    <div className="rounded-xl border p-5 bg-white/70 dark:bg-black/30 backdrop-blur transition hover:shadow-sm">
      <div className="text-sm opacity-70">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

type Params = { params: Promise<{ tenantId: string }> }

export default async function TenantDashboard({ params }: Params) {
  const { tenantId } = await params;
  const supabase = createServiceClient();

  // --- Stats (defensive: ignore failures gracefully)
  let projectsCount = 0;
  let recent: Array<{
    id: string;
    name: string;
    description: string | null;
    status?: string | null;
    created_at: string;
    updated_at?: string | null;
  }> = [];
  let surveysCount: number | null = null;

  // Projects count
  {
    const { count } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId);
    projectsCount = count ?? 0;
  }

  // Recent projects
  {
    const { data } = await supabase
      .from("projects")
      .select("id, name, description, status, created_at, updated_at")
      .eq("tenant_id", tenantId)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(5);
    recent = data ?? [];
  }

  // Optional: surveys count (table might not exist yet; ignore errors).
  // We cast supabase to any here to avoid TS errors until the surveys table is part of generated types.
  try {
    const { count } = await (supabase as any)
      .from("surveys")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId);
    surveysCount = count ?? 0;
  } catch {
    surveysCount = null;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Intro (small helper text, no duplicate heading) */}
      <p className="text-sm opacity-70">
        Welcome to your workspace. Use the quick actions below to create a project, upload files, or request a site survey.
      </p>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/portal/${tenantId}/projects`}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Projects
        </Link>
        <Link
          href={`/portal/${tenantId}/projects/new`}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2"
        >
          Create Project
        </Link>
        <Link
          href={`/portal/${tenantId}/surveys/new`}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2"
        >
          Request Survey
        </Link>
        <Link
          href={`/portal/${tenantId}/files`}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2"
        >
          Upload Files
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Projects" value={projectsCount} href={`/portal/${tenantId}/projects`} />
        <StatCard
          label="Open Surveys"
          value={surveysCount === null ? "—" : surveysCount}
          href={`/portal/${tenantId}/surveys`}
        />
        <StatCard label="Invoices (Zoho)" value="—" />
      </div>

      {/* Recent projects */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent Projects</h2>
          <Link
            className="text-sm underline underline-offset-4 opacity-80 hover:opacity-100"
            href={`/portal/${tenantId}/projects`}
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-xl border p-6 text-sm opacity-70">
            No projects yet. Create your first project to get started.
          </div>
        ) : (
          <ul className="grid gap-3">
            {recent.map((p) => (
              <li key={p.id} className="rounded-xl border p-4 bg-white/60 dark:bg-black/30 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    {p.description ? (
                      <div className="text-sm opacity-70 line-clamp-2">{p.description}</div>
                    ) : null}
                    <div className="mt-1 text-xs opacity-60">
                      {p.status ? <span className="mr-2">Status: {p.status}</span> : null}
                      <span>Created: {new Date(p.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <Link
                    href={`/portal/${tenantId}/projects/${p.id}`}
                    className="shrink-0 rounded-lg border px-3 py-1.5 text-sm"
                  >
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}