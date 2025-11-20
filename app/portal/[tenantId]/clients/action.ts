"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

function parseJsonSafely(raw: string | null): unknown | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* CREATE                                                             */
/* ------------------------------------------------------------------ */

export type CreateEndClientInput = {
  tenantId: string;
  company_name: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  address_json?: unknown;
};

export async function createEndClient(input: CreateEndClientInput) {
  const {
    tenantId,
    company_name,
    contact_name,
    phone,
    email,
    notes,
    address_json,
  } = input;

  if (!tenantId) {
    return {
      ok: false as const,
      error: "Missing tenantId for end client creation",
      client: null as null,
    };
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("end_clients")
    .insert([
      {
        tenant_id: tenantId,
        company_name,
        contact_name,
        phone,
        email,
        notes,
        address_json: address_json ?? null,
      },
    ])
    .select("*")
    .single();

  if (error) {
    console.error("Error creating end client", error);
    return {
      ok: false as const,
      error: error.message ?? "Unknown error creating end client",
      client: null as null,
    };
  }

  // Log creation into activity_log (best effort)
  try {
    await supabase.from("activity_log").insert([
      {
        actor_member_id: null, // TODO: wire actual member id later
        project_id: null,
        entity: "end_client",
        entity_id: data.id,
        action: "created",
        meta_json: {
          tenant_id: tenantId,
          company_name,
          contact_name,
          phone,
          email,
        },
      },
    ]);
  } catch (logErr) {
    console.error("Failed to log end_client creation", logErr);
  }

  return {
    ok: true as const,
    error: null as null,
    client: data,
  };
}

export async function createEndClientAction(formData: FormData) {
  const tenantId = (formData.get("tenantId") as string | null) ?? "";
  const company_name = (formData.get("company_name") as string | null) ?? null;
  const contact_name = (formData.get("contact_name") as string | null) ?? null;
  const phone = (formData.get("phone") as string | null) ?? null;
  const email = (formData.get("email") as string | null) ?? null;
  const notes = (formData.get("notes") as string | null) ?? null;
  const address_json_raw =
    (formData.get("address_json") as string | null) ?? null;

  const address_json = parseJsonSafely(address_json_raw);

  const result = await createEndClient({
    tenantId,
    company_name,
    contact_name,
    phone,
    email,
    notes,
    address_json,
  });

  if (!result.ok) {
    console.error("Error creating end client via action", result.error);
  }

  redirect(`/portal/${tenantId}/clients`);
}

/* ------------------------------------------------------------------ */
/* UPDATE                                                             */
/* ------------------------------------------------------------------ */

export type UpdateEndClientInput = {
  id: string;
  tenantId: string;
  company_name?: string | null;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  address_json?: unknown;
};

export async function updateEndClient(input: UpdateEndClientInput) {
  const {
    id,
    tenantId,
    company_name,
    contact_name,
    phone,
    email,
    notes,
    address_json,
  } = input;

  if (!id || !tenantId) {
    return {
      ok: false as const,
      error: "Missing id or tenantId for end client update",
      client: null as null,
    };
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("end_clients")
    .update({
      company_name: company_name ?? null,
      contact_name: contact_name ?? null,
      phone: phone ?? null,
      email: email ?? null,
      notes: notes ?? null,
      address_json: address_json ?? null,
    })
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating end client", error);
    return {
      ok: false as const,
      error: error.message ?? "Unknown error updating end client",
      client: null as null,
    };
  }

  // Log update into activity_log (best effort)
  try {
    await supabase.from("activity_log").insert([
      {
        actor_member_id: null, // TODO: wire actual member id later
        project_id: null,
        entity: "end_client",
        entity_id: data.id,
        action: "updated",
        meta_json: {
          tenant_id: tenantId,
          company_name,
          contact_name,
          phone,
          email,
        },
      },
    ]);
  } catch (logErr) {
    console.error("Failed to log end_client update", logErr);
  }

  return {
    ok: true as const,
    error: null as null,
    client: data,
  };
}

export async function updateEndClientAction(formData: FormData) {
  const tenantId = (formData.get("tenantId") as string | null) ?? "";
  const clientId = (formData.get("clientId") as string | null) ?? "";

  const company_name = (formData.get("company_name") as string | null) ?? null;
  const contact_name = (formData.get("contact_name") as string | null) ?? null;
  const phone = (formData.get("phone") as string | null) ?? null;
  const email = (formData.get("email") as string | null) ?? null;
  const notes = (formData.get("notes") as string | null) ?? null;
  const address_json_raw =
    (formData.get("address_json") as string | null) ?? null;

  const address_json = parseJsonSafely(address_json_raw);

  // Basic validation: require at least company or contact
  if (!company_name && !contact_name) {
    console.error("Validation failed: company_name or contact_name required");
    redirect(
      `/portal/${tenantId}/clients/${clientId}?tab=overview&error=missing_name`,
    );
  }

  const result = await updateEndClient({
    id: clientId,
    tenantId,
    company_name,
    contact_name,
    phone,
    email,
    notes,
    address_json,
  });

  if (!result.ok) {
    console.error("Error updating end client via action", result.error);
    redirect(
      `/portal/${tenantId}/clients/${clientId}?tab=overview&error=update_failed`,
    );
  }

  redirect(`/portal/${tenantId}/clients/${clientId}?tab=overview`);
}

/* ------------------------------------------------------------------ */
/* ARCHIVE (SOFT DELETE)                                             */
/* ------------------------------------------------------------------ */

export type ArchiveEndClientInput = {
  id: string;
  tenantId: string;
};

export async function archiveEndClient(input: ArchiveEndClientInput) {
  const { id, tenantId } = input;

  if (!id || !tenantId) {
    return {
      ok: false as const,
      error: "Missing id or tenantId for archive",
    };
  }

  const supabase = createServiceClient();

  const { error } = await supabase
    .from("end_clients")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("Error archiving end client", error);
    return {
      ok: false as const,
      error: error.message ?? "Unknown error archiving end client",
    };
  }

  // Log archive into activity_log (best effort)
  try {
    await supabase.from("activity_log").insert([
      {
        actor_member_id: null,
        project_id: null,
        entity: "end_client",
        entity_id: id,
        action: "archived",
        meta_json: {
          tenant_id: tenantId,
        },
      },
    ]);
  } catch (logErr) {
    console.error("Failed to log end_client archive", logErr);
  }

  return {
    ok: true as const,
    error: null as null,
  };
}

export async function archiveEndClientAction(formData: FormData) {
  const tenantId = (formData.get("tenantId") as string | null) ?? "";
  const clientId = (formData.get("clientId") as string | null) ?? "";

  const result = await archiveEndClient({ id: clientId, tenantId });

  if (!result.ok) {
    console.error("Error archiving end client via action", result.error);
    redirect(
      `/portal/${tenantId}/clients/${clientId}?tab=overview&error=archive_failed`,
    );
  }

  redirect(`/portal/${tenantId}/clients`);
}
