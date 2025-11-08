

import { NextRequest, NextResponse } from "next/server";

// GET /admin/logout
// Clears the admin_auth cookie and redirects to /admin (login page).
export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin", req.url));

  // Clear the admin_auth cookie
  res.cookies.set("admin_auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}