export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(req: Request) {
  const cookie = (req as any).headers.get("cookie") || "";
  const match = cookie.match(/bocc_session=([^;]+)/);
  if (!match) return NextResponse.json({ authed: false });
  const token = decodeURIComponent(match[1]);

  try {
    const key = new TextEncoder().encode(process.env.AUTH_SECRET || "");
    const { payload } = await jwtVerify(token, key);
    return NextResponse.json({ authed: true, phone: payload.sub });
  } catch {
    return NextResponse.json({ authed: false });
  }
}