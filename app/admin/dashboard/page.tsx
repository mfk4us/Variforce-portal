import * as React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// shadcn/ui (local kit via barrel)
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Separator,
  Button,
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type Status = "pending" | "approved" | "rejected" | null;

type ApplicationRow = {
  id: number;
  company_name: string | null;
  city: string | null;
  status: Status;
};

// Server-side Supabase admin client using service role key (server-only)
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function fetchDashboardData() {
  const supabase = adminClient();

  // Accurate counts using head-only selects
  const [totalRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
    supabase.from("partners_applications").select("*", { count: "exact", head: true }),
    supabase.from("partners_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("partners_applications").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("partners_applications").select("*", { count: "exact", head: true }).eq("status", "rejected"),
  ]);

  const counts = {
    total: totalRes.count ?? 0,
    pending: pendingRes.count ?? 0,
    approved: approvedRes.count ?? 0,
    rejected: rejectedRes.count ?? 0,
  };

  // Recent rows snapshot (last 10 by id desc)
  const { data: rowsData, error: rowsError } = await supabase
    .from("partners_applications")
    .select("id, company_name, city, status")
    .order("id", { ascending: false })
    .limit(10);

  if (rowsError) throw rowsError;

  return { counts, rows: (rowsData || []) as ApplicationRow[] };
}

function statusBadge(status: Status) {
  if (status === "approved")
    return (
      <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
        Approved
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge variant="secondary" className="bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/20">
        Rejected
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20">
        Pending
      </Badge>
    );
  return <Badge variant="outline">Unknown</Badge>;
}

export default async function AdminDashboardPage() {
  const result = await (async () => {
    try {
      const data = await fetchDashboardData();
      return { ok: true as const, ...data };
    } catch (error: unknown) {
      return { ok: false as const, error };
    }
  })();

  if (!result.ok) {
    const err = result.error;
    const message = err instanceof Error ? err.message : String(err);
    return (
      <main className="min-h-[calc(100vh-64px)] w-full px-4 py-6 md:px-6 lg:px-8">
        <Card className="border-white/20 dark:border-white/10">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>We couldn’t load dashboard data</AlertTitle>
              <AlertDescription>
                Please check your Supabase credentials or network and try again.
              </AlertDescription>
            </Alert>
            {process.env.NODE_ENV !== "production" && (
              <pre className="mt-3 text-xs whitespace-pre-wrap break-words p-3 rounded-lg bg-muted/40">{message}</pre>
            )}
            <div className="mt-4">
              <Button asChild>
                <Link href="/admin/partner-applications">Go to Applications</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { counts, rows } = result;

  return (
    <main className="min-h-[calc(100vh-64px)] w-full px-4 py-6 md:px-6 lg:px-8 space-y-6">
      {/* KPI Row */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/20 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total applications</CardTitle>
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">{counts.total}</div>
            <p className="mt-1 text-xs text-muted-foreground">Count of all partner applications currently stored.</p>
          </CardContent>
        </Card>

        <Card className="border-white/20 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{counts.pending}</div>
            <p className="mt-1 text-xs text-muted-foreground">Awaiting your review and decision.</p>
          </CardContent>
        </Card>

        <Card className="border-white/20 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{counts.approved}</div>
            <p className="mt-1 text-xs text-muted-foreground">Ready to onboard into BOCC&apos;s partner network.</p>
          </CardContent>
        </Card>

        <Card className="border-white/20 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{counts.rejected}</div>
            <p className="mt-1 text-xs text-muted-foreground">Closed applications kept for records.</p>
          </CardContent>
        </Card>
      </section>

      {/* Bottom Grid */}
      <section className="grid gap-6 lg:grid-cols-5">
        {/* Recent Applications */}
        <Card className="lg:col-span-3 border-white/20 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Recent applications</CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/partner-applications">Review all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">A quick snapshot of the latest activity across partner onboarding.</p>
            {rows.length === 0 ? (
              <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
                No applications found yet. Once partners start applying, their submissions will be listed here.
              </div>
            ) : (
              <div className="rounded-lg border border-muted/30 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Company</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10">
                        <TableCell className="font-medium break-words">{row.company_name || `Application #${row.id}`}</TableCell>
                        <TableCell className="text-muted-foreground break-words">{row.city || "Not set"}</TableCell>
                        <TableCell>{statusBadge(row.status)}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">#{row.id}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Focus */}
        <Card className="lg:col-span-2 border-white/20 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Admin focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Suggested next actions based on your current application pipeline.</p>

            <div className="space-y-4">
              <div className="rounded-lg border border-muted/30 p-4">
                <strong className="block mb-1 text-sm">Pending queue</strong>
                <span className="text-sm text-muted-foreground">
                  {counts.pending > 0
                    ? `You currently have ${counts.pending} pending application${counts.pending === 1 ? "" : "s"}. Prioritise reviewing these to keep partners moving.`
                    : "You have no pending applications — great job staying on top of the queue."}
                </span>
              </div>

              <div className="rounded-lg border border-muted/30 p-4">
                <strong className="block mb-1 text-sm">Approved partners</strong>
                <span className="text-sm text-muted-foreground">
                  {counts.approved > 0
                    ? `There ${counts.approved === 1 ? "is" : "are"} ${counts.approved} approved partner${counts.approved === 1 ? "" : "s"}. Make sure their onboarding, contacts and pricing are fully configured.`
                    : "Once you approve applications, they will appear here as a reminder to finish onboarding tasks."}
                </span>
              </div>

              <div className="rounded-lg border border-muted/30 p-4">
                <strong className="block mb-1 text-sm">Data quality</strong>
                <span className="text-sm text-muted-foreground">
                  Use the partner applications page to spot missing cities, contacts or notes. Clean data makes your rate-book and white-labelling work much smoother.
                </span>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="rounded-full">
                <Link href="/admin/partner-applications">Go to Applications</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/portal/login">Open Portal (Client View)</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">Tip: Add filters &amp; bulk actions later with our table patterns.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}