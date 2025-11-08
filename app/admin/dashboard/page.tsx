import * as React from "react";

import { createClient } from "@supabase/supabase-js";

// UI components (shadcn/ui)
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

type Status = "pending" | "approved" | "rejected" | null;

type ApplicationRow = {
  id: number;
  company_name: string | null;
  city: string | null;
  status: Status;
};

// Server-side Supabase admin client using service role key.
// This code only runs on the server (no "use client" in this file).
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

async function fetchApplicationStats() {
  const supabase = adminClient();

  const { data, error, count } = await supabase
    .from("partners_applications")
    .select("id, company_name, city, status", { count: "exact" })
    .order("id", { ascending: false }) // newest first
    .limit(10);

  if (error) {
    console.error("Error fetching partner applications for dashboard:", error);
  }

  const rows: ApplicationRow[] = (data || []) as ApplicationRow[];

  const total = count ?? rows.length;
  let pending = 0;
  let approved = 0;
  let rejected = 0;

  for (const row of rows) {
    if (row.status === "pending") pending += 1;
    else if (row.status === "approved") approved += 1;
    else if (row.status === "rejected") rejected += 1;
  }

  return {
    total,
    pending,
    approved,
    rejected,
    rows,
  };
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
  const { total, pending, approved, rejected, rows } =
    await fetchApplicationStats();

  return (
    <main className="min-h-[calc(100vh-64px)] w-full px-4 py-6 md:px-6 lg:px-8 space-y-6">
      {/* KPI Row */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/20 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total applications
              </CardTitle>
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">{total}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Count of all partner applications currently stored.
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/20 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{pending}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting your review and decision.
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/20 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{approved}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ready to onboard into BOCC&apos;s partner network.
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/20 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{rejected}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Closed applications kept for records.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Bottom Grid */}
      <section className="grid gap-6 lg:grid-cols-5">
        {/* Recent Applications */}
        <Card className="lg:col-span-3 border-white/20 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              A quick snapshot of the latest activity across partner onboarding.
            </p>

            {rows.length === 0 ? (
              <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
                No applications found yet. Once partners start applying, their
                submissions will be listed here.
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
                      <TableRow key={row.id}>
                        <TableCell className="font-medium break-words">
                          {row.company_name || `Application #${row.id}`}
                        </TableCell>
                        <TableCell className="text-muted-foreground break-words">
                          {row.city || "Not set"}
                        </TableCell>
                        <TableCell>{statusBadge(row.status)}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          #{row.id}
                        </TableCell>
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
            <p className="text-sm text-muted-foreground">
              Suggested next actions based on your current application pipeline.
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border border-muted/30 p-4">
                <strong className="block mb-1 text-sm">Pending queue</strong>
                <span className="text-sm text-muted-foreground">
                  {pending > 0
                    ? `You currently have ${pending} pending application${
                        pending === 1 ? "" : "s"
                      }. Prioritise reviewing these to keep partners moving.`
                    : "You have no pending applications — great job staying on top of the queue."}
                </span>
              </div>

              <div className="rounded-lg border border-muted/30 p-4">
                <strong className="block mb-1 text-sm">Approved partners</strong>
                <span className="text-sm text-muted-foreground">
                  {approved > 0
                    ? `There ${approved === 1 ? "is" : "are"} ${approved} approved partner${
                        approved === 1 ? "" : "s"
                      }. Make sure their onboarding, contacts and pricing are fully configured.`
                    : "Once you approve applications, they will appear here as a reminder to finish onboarding tasks."}
                </span>
              </div>

              <div className="rounded-lg border border-muted/30 p-4">
                <strong className="block mb-1 text-sm">Data quality</strong>
                <span className="text-sm text-muted-foreground">
                  Use the partner applications page to spot missing cities, contacts or notes.
                  Clean data makes your rate-book and white-labelling work much smoother.
                </span>
              </div>
            </div>

            <Separator className="my-2" />

            <p className="text-xs text-muted-foreground">
              Tip: Add filters &amp; bulk actions later with our table patterns.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}