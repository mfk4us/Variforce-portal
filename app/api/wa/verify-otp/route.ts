export const runtime = "nodejs";
import { NextResponse } from "next/server";
import otpMap from "@/lib/otpStore";
import crypto from "crypto";
import { SignJWT } from "jose";


function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

// Keep phone handling exactly like send-otp
function normalizePhone(input: string | undefined): string {
  return (input || "").replace(/\D/g, "");
}
function isValidPhone(e164NoPlus: string): boolean {
  return /^\d{11,15}$/.test(e164NoPlus);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({} as Record<string, unknown>))) as Record<string, unknown>;
    const rawPhone = typeof body.phone === "string" ? body.phone : undefined;
    const phone = normalizePhone(rawPhone);
    const code = String(body?.code || "").replace(/\D/g, "").slice(0, 6);

    if (!phone || !isValidPhone(phone) || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "bad_request", message: "Valid phone and 6-digit code required" },
        { status: 400 }
      );
    }

    const rec = otpMap.get(phone) as { hash: string; expiresAt: number; attempts: number } | undefined;
    if (!rec) {
      console.warn("VERIFY OTP: no record for phone", phone);
      return NextResponse.json({ error: "no_otp_requested" }, { status: 404 });
    }

    if (Date.now() > rec.expiresAt) {
      otpMap.delete(phone);
      console.warn("VERIFY OTP: code expired for phone", phone);
      return NextResponse.json({ error: "code_expired" }, { status: 410 });
    }

    if (rec.attempts >= 6) {
      console.warn("VERIFY OTP: too many attempts for phone", phone);
      return NextResponse.json({ error: "too_many_attempts" }, { status: 423 });
    }

    const ok = rec.hash === hashCode(code);
    if (!ok) {
      rec.attempts = (rec.attempts || 0) + 1;
      otpMap.set(phone, rec);
      console.warn("VERIFY OTP: invalid code for phone", phone, "attempts", rec.attempts);
      return NextResponse.json({ error: "invalid_code" }, { status: 401 });
    }

    const AUTH_SECRET = process.env.AUTH_SECRET;
    if (!AUTH_SECRET || AUTH_SECRET.trim().length < 16) {
      console.error("VERIFY OTP: AUTH_SECRET missing or too short. Set AUTH_SECRET in .env.local and restart dev server.");
      return NextResponse.json(
        { error: "server_config", message: "Server auth secret is not configured." },
        { status: 500 }
      );
    }

    // Success — clear OTP, set session cookie
    otpMap.delete(phone);
    const key = new TextEncoder().encode(AUTH_SECRET);
    const token = await new SignJWT({ sub: phone })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(key);

    // Issue session cookie
    const res = NextResponse.json({ ok: true, message: "verified" });
    const isProd = process.env.NODE_ENV === "production";
    res.cookies.set("bocc_session", token, {
      httpOnly: true,
      secure: isProd, // allow non-HTTPS on localhost
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    console.log("VERIFY OTP: success for", phone);
    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("VERIFY OTP ERROR:", msg);
    return NextResponse.json({ error: "server_error", message: msg }, { status: 500 });
  }
}