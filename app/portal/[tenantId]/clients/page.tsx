// app/portal/[tenantId]/clients/page.tsx

import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Eye } from "lucide-react";
import { createEndClientAction } from "./action";

export const dynamic = "force-dynamic";

const DEFAULT_TENANT_ID = "24f1fddd-76c0-4b05-b600-06ef351109e2";

interface EndClientsPageProps {
  params: Promise<{ tenantId: string }>;
  searchParams?: Promise<{ q?: string; filter?: string }>;
}

type EndClientRow = {
  id: string;
  tenant_id: string;
  company_name: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address_json: any;
  notes: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export default async function EndClientsPage({
  params,
  searchParams,
}: EndClientsPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const tenantId = resolvedParams?.tenantId;
  const searchQuery = resolvedSearchParams.q ?? "";
  const filterParam = resolvedSearchParams.filter ?? "all";

  const effectiveTenantId =
    tenantId && tenantId !== "undefined" ? tenantId : DEFAULT_TENANT_ID;

  const supabase = createServiceClient();

  let query = supabase
    .from("end_clients")
    .select("*")
    .eq("tenant_id", effectiveTenantId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error loading end clients:", JSON.stringify(error, null, 2));

    return (
      <div className="p-6">
        <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Unable to load clients</p>
          <p className="text-xs text-red-700">
            This is an internal error while querying Supabase. Please make sure
            the{" "}
            <code className="mx-1 rounded bg-red-100 px-1 py-0.5">
              end_clients
            </code>{" "}
            table exists and has a{" "}
            <code className="mx-1 rounded bg-red-100 px-1 py-0.5">
              tenant_id
            </code>{" "}
            column, and that your Supabase service role key is configured
            correctly.
          </p>
        </div>
      </div>
    );
  }

  const rawClients = (data ?? []) as EndClientRow[];

  const normalizedSearch = (searchQuery || "").trim().toLowerCase();
  const searchedClients =
    normalizedSearch.length === 0
      ? rawClients
      : rawClients.filter((c) => {
          const parts = [
            c.contact_name,
            c.company_name,
            c.email,
            c.phone,
            c.notes,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!parts) return false;
          return parts.includes(normalizedSearch);
        });

  const clients =
    filterParam === "with-contact"
      ? searchedClients.filter((c) => c.contact_name || c.email || c.phone)
      : filterParam === "without-contact"
      ? searchedClients.filter(
          (c) => !c.contact_name && !c.email && !c.phone,
        )
      : searchedClients;

  return (
    <div className="space-y-8 p-6">
      {/* Top bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: helper text */}
        <div className="space-y-1">
          
          <p className="text-sm text-muted-foreground">
            Manage all end clients (customers) for this workspace. Filter by contact
            completeness or search by name, company, or phone.
          </p>
        </div>

        {/* Right: search + new client modal trigger */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          {/* Search */}
          <form
            action={`/portal/${effectiveTenantId}/clients`}
            className="flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs shadow-sm"
          >
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search clients by contact, company, phone, email..."
              className="w-56 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="text-muted-foreground hover:text-emerald-700"
            >
              🔍
            </button>
          </form>

          {/* New client modal trigger + overlay */}
          <div className="relative">
            {/* Hidden checkbox controls modal open/close using Tailwind peer classes */}
            <input
              id="newClientModal"
              type="checkbox"
              className="peer hidden"
            />

            {/* Trigger button */}
            <label
              htmlFor="newClientModal"
              className="inline-flex cursor-pointer items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600"
            >
              + New client
            </label>

            {/* Modal overlay */}
            <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-black/40 backdrop-blur-sm peer-checked:flex peer-checked:pointer-events-auto">
              <div className="w-full max-w-md rounded-lg border border-emerald-200 bg-card p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">
                    New client
                  </h2>
                  <label
                    htmlFor="newClientModal"
                    className="cursor-pointer text-xs text-slate-500 hover:text-slate-800"
                  >
                    ✕
                  </label>
                </div>

                <form
                  action={createEndClientAction}
                  className="space-y-3 text-xs"
                >
                  <input
                    type="hidden"
                    name="tenantId"
                    value={effectiveTenantId}
                  />

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-700">
                        Contact name
                      </label>
                      <input
                        type="text"
                        name="contact_name"
                        placeholder="e.g. Eng. Ahmed Ali"
                        className="w-full rounded-md border border-emerald-200 bg-white/80 px-2 py-1 text-xs outline-none placeholder:text-slate-400 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-700">
                        Company name
                      </label>
                      <input
                        type="text"
                        name="company_name"
                        placeholder="e.g. Delta Real Estate"
                        className="w-full rounded-md border border-emerald-200 bg-white/80 px-2 py-1 text-xs outline-none placeholder:text-slate-400 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-700">
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        placeholder="e.g. +9665..."
                        className="w-full rounded-md border border-emerald-200 bg-white/80 px-2 py-1 text-xs outline-none placeholder:text-slate-400 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="e.g. client@example.com"
                        className="w-full rounded-md border border-emerald-200 bg-white/80 px-2 py-1 text-xs outline-none placeholder:text-slate-400 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-700">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      placeholder="Internal notes about this client (site, preferences, etc.)"
                      className="w-full rounded-md border border-emerald-200 bg-white/80 px-2 py-1 text-xs outline-none placeholder:text-slate-400 focus:border-emerald-500"
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-end gap-2">
                    <label
                      htmlFor="newClientModal"
                      className="cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </label>
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700"
                    >
                      Save client
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters row similar to projects page */}
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {[
          { key: "all", label: "All" },
          { key: "with-contact", label: "With contact details" },
          { key: "without-contact", label: "Missing contact" },
        ].map((f) => {
          const isActive = filterParam === f.key;
          const baseHref = `/portal/${effectiveTenantId}/clients`;
          const href =
            f.key === "all"
              ? baseHref
              : `${baseHref}?filter=${encodeURIComponent(f.key)}`;

          return (
            <Link
              key={f.key}
              href={href}
              className={
                "inline-flex items-center rounded-full border px-3 py-1 " +
                (isActive
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-700")
              }
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card/50 backdrop-blur">
        <div className="grid grid-cols-12 gap-2 border-b p-3 text-xs text-muted-foreground">
          <div className="col-span-4">Company</div>
          <div className="col-span-3">Contact person</div>
          <div className="col-span-3">Created</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y">
          {clients.length ? (
            clients.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-12 gap-2 p-3 text-sm"
              >
                {/* Company name */}
                <div className="col-span-4 truncate">
                  <div className="font-medium">
                    {c.company_name || "Unnamed company"}
                  </div>
                </div>

                {/* Contact person with phone/email */}
                <div className="col-span-3 text-xs text-muted-foreground">
                  {c.contact_name && (
                    <div className="font-medium text-slate-700">{c.contact_name}</div>
                  )}
                  {c.email && <div className="text-slate-500">{c.email}</div>}
                  {c.phone && <div className="text-slate-500">{c.phone}</div>}
                  {!c.contact_name && !c.email && !c.phone && (
                    <div className="italic text-slate-400">No contact info yet</div>
                  )}
                </div>

                {/* Created */}
                <div className="col-span-3 text-xs text-muted-foreground">
                  {c.created_at
                    ? new Date(c.created_at).toLocaleDateString()
                    : "—"}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-end gap-2">
                  <Link
                    href={`/portal/${effectiveTenantId}/clients/${c.id}?tab=overview`}
                    className="inline-flex items-center text-emerald-700 hover:text-emerald-900"
                    title="View client"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  {/* later: add edit/delete icons here if needed */}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No clients found yet. Click
              <span className="font-medium"> New client</span> to add your
              first customer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}