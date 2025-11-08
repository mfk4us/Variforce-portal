import { NextRequest, NextResponse } from "next/server";

// Unified middleware for portal + admin
export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // --- 1) Force noindex on private areas ---
  const noindexPrefixes = ["/admin", "/portal", "/dashboard", "/api", "/settings"] as const;
  if (noindexPrefixes.some((p) => pathname.startsWith(p))) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // --- 2) Hide /admin entirely → always redirect to /portal/login ---
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const url = new URL("/portal/login", req.url);
    url.search = search; // preserve query if any
    const res = NextResponse.redirect(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // --- 3) Protect /portal routes except auth pages ---
  const isPortal = pathname.startsWith("/portal");
  const isAuthPage = pathname === "/portal/login" || pathname === "/portal/signup" || pathname.startsWith("/portal/invite/");

  if (isPortal && !isAuthPage) {
    const session = req.cookies.get("vf_session")?.value; // portal session cookie
    if (!session) {
      const url = new URL("/portal/login", req.url);
      // Optional: preserve return path
      url.searchParams.set("next", pathname + (search || ""));
      const res = NextResponse.redirect(url);
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      return res;
    }
  }

  // --- 4) Handle /portal/logout: clear session cookie and redirect ---
  if (pathname === "/portal/logout") {
    const res = NextResponse.redirect(new URL("/portal/login", req.url));
    res.cookies.set("vf_session", "", { expires: new Date(0), path: "/" });
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // Default pass-through
  return NextResponse.next();
}

// Ensure this runs for app routes while skipping static assets
export const config = {
  matcher: [
    "/((?!_next/|favicon|favicon.ico|favicon.png|favicon.svg|logo.png|images/|fonts/|public/).*)",
  ],
};