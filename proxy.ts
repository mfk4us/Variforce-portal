import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /**
   * 1) Admin auth gate (keeps your existing behavior)
   * - /admin (root) is public (login/landing)
   * - /admin/login is public
   * - /api/admin/* is public (auth endpoints)
   */
  const isProtectedAdminPage =
    pathname.startsWith("/admin") &&
    pathname !== "/admin" &&
    pathname !== "/admin/login" &&
    !pathname.startsWith("/api/admin");

  if (isProtectedAdminPage) {
    const adminCookie = req.cookies.get("admin_auth")?.value;
    if (adminCookie !== "1") {
      const res = NextResponse.redirect(new URL("/admin", req.url));
      // Also tell crawlers not to index this redirect target
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      return res;
    }
  }

  /**
   * 2) SEO protection: force noindex on private areas
   * These should never be indexed even if publicly reachable.
   */
  const noindexPrefixes = ["/admin", "/portal", "/dashboard", "/api", "/settings"] as const;
  const shouldNoIndex = noindexPrefixes.some((p) => pathname.startsWith(p));

  if (shouldNoIndex) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // Default pass-through
  return NextResponse.next();
}

// Limit to app routes only (skip _next/static, assets, etc.)
export const config = {
  matcher: [
    "/((?!_next/|favicon|favicon.ico|favicon.png|favicon.svg|logo.png|images/|fonts/|public/).*)",
  ],
};