import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

// Create a simple server-side Supabase client using the anon key.
// We don't need auth-helpers here because we're not using the Next.js cookie integration.
function serverSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

// POST /admin/login
// Expects JSON: { email: string, password: string }
// Verifies with Supabase Auth and, if allowed, sets a secure HttpOnly admin_auth cookie.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { email?: string; password?: string }
      | null;

    const email = (body?.email || "").trim();
    const password = body?.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = serverSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      return NextResponse.json(
        { ok: false, error: error?.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    // Enforce that only the configured admin email can access the console
    if (ADMIN_EMAIL && data.user.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { ok: false, error: "Not allowed" },
        { status: 403 }
      );
    }

    // Build the response and attach a secure HttpOnly cookie for admin gate
    const res = NextResponse.json({ ok: true });

    res.cookies.set("admin_auth", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return res;
  } catch (err) {
    console.error("Admin login route error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}