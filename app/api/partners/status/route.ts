import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizeKsaPhone(raw: string): string {
  let v = (raw || "").replace(/\D/g, "");
  if (v.startsWith("05")) v = v.slice(1);
  if (!v.startsWith("966")) v = "966" + v;
  return v;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const rawPhone = body.phone || "";
    const phone = normalizeKsaPhone(rawPhone);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY; // REQUIRED
    if (!url || !service) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const supa = createClient(url, service, { auth: { persistSession: false } });

    const { data, error } = await supa
      .from("partners_applications")
      .select("id,status,reviewed_at,submitted_at")
      .eq("phone", phone)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) return NextResponse.json({ exists: false });

    return NextResponse.json({
      exists: true,
      id: data.id,
      status: data.status,
      reviewed_at: data.reviewed_at,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone") || "";
  return POST(new Request(req.url, { method: "POST", body: JSON.stringify({ phone }) }));
}