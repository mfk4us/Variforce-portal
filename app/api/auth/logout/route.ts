export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set("bocc_session", "", {
    httpOnly: true,
    secure: isProd, // allow over HTTP on localhost
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return res;
}