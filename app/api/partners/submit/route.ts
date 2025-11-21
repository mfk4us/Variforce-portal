// /app/api/partners/submit/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function required(name: string, v?: string | null) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE env (or SUPABASE_SERVICE_ROLE_KEY).");

const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

const digits = (v: FormDataEntryValue | null, n?: number) => {
  if (!v || typeof v !== "string") return "";
  const d = v.replace(/\D/g, "");
  return typeof n === "number" ? d.slice(0, n) : d;
};

export async function POST(req: Request) {
  try {
    const fd = await req.formData();

    const phoneRaw = (fd.get("phone") as string) || "";
    const phone = digits(phoneRaw);
    if (!phone) return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    if (phone.length < 10 || phone.length > 15)
      return NextResponse.json({ error: "Phone must be 10–15 digits" }, { status: 400 });

    const company_name = (fd.get("company_name") as string) || "";
    const contact_name = (fd.get("contact_name") as string) || "";
    if (!company_name) return NextResponse.json({ error: "Company is required" }, { status: 400 });
    if (!contact_name) return NextResponse.json({ error: "Contact is required" }, { status: 400 });

    const email = ((fd.get("email") as string) || "").trim() || null;
    const city = ((fd.get("city") as string) || "").trim() || null;
    const industry = ((fd.get("industry") as string) || "").trim() || null;
    const lang = ((fd.get("lang") as string) || "en").trim();
    const want_rate_book = ((fd.get("want_rate_book") as string) || "true").toString() === "true";

    const cr_number = digits(fd.get("cr_number"), 10) || null;
    const vat_number = digits(fd.get("vat_number"), 15) || null;

    const crFile = (fd.get("cr_pdf") || fd.get("cr")) as File | null;
    const vatFile = (fd.get("vat_pdf") || fd.get("vat")) as File | null;

    let cr_path: string | null = null;
    let vat_path: string | null = null;

    async function upload(kind: "cr" | "vat", file: File | null, idDigits: string | null) {
      if (!file) return null;
      // Accept Safari case where file.type may be empty but name ends with .pdf
      const filename = (file && "name" in file ? file.name : "") as string;
      const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(filename);
      if (!isPdf) throw new Error(`${kind.toUpperCase()} must be a PDF`);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const folder = idDigits || phone; // prefer CR/VAT folder; fallback to phone
      const path = `${folder}/${kind}.pdf`;
      const { error } = await admin.storage.from("documents").upload(path, bytes, {
        contentType: "application/pdf",
        upsert: true,
      });
      if (error) throw new Error(`Upload failed for ${kind}: ${error.message}`);
      return path;
    }

    [cr_path, vat_path] = await Promise.all([
      upload("cr", crFile, cr_number),
      upload("vat", vatFile, vat_number),
    ]);

    const payload = {
      phone,
      company_name,
      contact_name,
      email,
      city,
      industry,
      lang,
      want_rate_book,
      cr_number,
      vat_number,
      cr_path,
      vat_path,
      status: "pending" as const,
      submitted_at: new Date().toISOString(),
    };

    // Save into partners_applications (plural)
    const { data, error } = await admin
      .from("partners_applications")
      .upsert(payload, { onConflict: "phone" })
      .select()
      .limit(1);

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, row: data?.[0] ?? null });
  } catch (err: unknown) {
    console.error("/api/partners/submit error:", (err as Error)?.message || String(err));
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}

// Lightweight status check by phone, used right after OTP verify
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = (searchParams.get("phone") || "").toString();
    const phone = (raw || "").replace(/\D/g, "");
    if (!phone) {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    // Look up the latest application by phone
    const { data: rows, error } = await admin
      .from("partners_applications")
      .select("status, submitted_at")
      .eq("phone", phone)
      .order("submitted_at", { ascending: false })
      .limit(1);

    if (error) throw new Error(error.message);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ status: "none" });
    }

    const row = rows[0];
    if (row.status === "pending") {
      return NextResponse.json({ status: "pending" });
    }
    if (row.status === "approved") {
      return NextResponse.json({ status: "approved" });
    }

    // Any other status -> treat as pending unless you add more states later
    return NextResponse.json({ status: String(row.status || "pending") });
  } catch (err: unknown) {
    console.error("/api/partners/submit GET error:", (err as Error)?.message || String(err));
    return NextResponse.json(
      { error: (err as Error)?.message || "Failed to check status" },
      { status: 500 }
    );
  }
}