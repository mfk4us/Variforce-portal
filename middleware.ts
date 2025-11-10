import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Edge‑safe cookie adapter for Supabase inside middleware
function supabaseFromReq(req: NextRequest, res: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        res.cookies.set({ name, value: "", ...options, expires: new Date(0) });
      },
    },
  });
}

const NOINDEX_PREFIXES = ["/admin", "/portal", "/dashboard", "/api", "/settings"] as const;

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  let res = NextResponse.next();

  // --- 1) Global noindex for private paths ---
  if (NOINDEX_PREFIXES.some((p) => pathname.startsWith(p))) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // ---------- ADMIN AREA ----------
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login" || pathname === "/admin";

  if (isAdminPath) {
    // Allow the public admin login page
    if (isAdminLogin) return res;

    // Require session for any other /admin/*
    const sb = supabaseFromReq(req, res);
    const {
      data: { user },
    } = await sb.auth.getUser();

    // Fallback: treat as internal if user metadata flag is set or email domain matches BOCC
    const meta = (user?.user_metadata || {}) as any;
    const email = user?.email || "";
    const domain = email.includes("@") ? email.split("@")[1] : "";
    const metaInternal =
      meta?.bocc_internal === true ||
      ["bocc.sa", "variforce.sa"].includes(domain);

    if (!user) {
      const url = new URL("/admin", req.url);
      url.search = search;
      const redirect = NextResponse.redirect(url);
      redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
      return redirect;
    }

    // Check BOCC‑internal membership (tenant_id IS NULL) + allowed roles
    const { data: internal, error } = await sb
      .from("members")
      .select("role, tenant_id, status")
      .is("tenant_id", null)
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1);

    const ok =
      metaInternal ||
      (!!internal?.length &&
        ["admin", "team_member"].includes(internal[0].role as any));

    if (!ok) {
      const url = new URL("/admin", req.url);
      const redirect = NextResponse.redirect(url);
      redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
      return redirect;
    }

    return res; // Internal admin/staff allowed
  }

  // ---------- PORTAL AREA ----------
  const isPortal = pathname.startsWith("/portal");
  const isPortalAuth =
    pathname === "/portal/login" ||
    pathname === "/portal/signup" ||
    pathname.startsWith("/portal/invite/");

  // Not a portal page or is an auth page → allow
  if (!isPortal || isPortalAuth) return res;

  const sb = supabaseFromReq(req, res);
  const {
    data: { user },
  } = await sb.auth.getUser();

  // No session → redirect to portal login
  if (!user) {
    const url = new URL("/portal/login", req.url);
    url.searchParams.set("next", pathname + (search || ""));
    const redirect = NextResponse.redirect(url);
    redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
    return redirect;
  }

  const { data: internal } = await sb
    .from("members")
    .select("role, tenant_id, status")
    .is("tenant_id", null)
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1);

  const meta2 = (user?.user_metadata || {}) as any;
  const email2 = user?.email || "";
  const domain2 = email2.includes("@") ? email2.split("@")[1] : "";
  const metaInternal2 =
    meta2?.bocc_internal === true ||
    ["bocc.sa", "variforce.sa"].includes(domain2);

  if (
    metaInternal2 ||
    (internal?.length && ["admin", "team_member"].includes(internal[0].role as any))
  ) {
    const url = new URL("/admin/dashboard", req.url);
    const redirect = NextResponse.redirect(url);
    redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
    return redirect;
  }

  // Tenant membership enforcement for /portal/:tenantId/*
  const m = pathname.match(/^\/portal\/([^\/]+)/);
  const tenantId = m?.[1];
  const isRootPortal = pathname === "/portal";

  if (tenantId && !isRootPortal && tenantId !== "login" && tenantId !== "signup") {
    const { data: mems, error } = await sb
      .from("members")
      .select("status")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .limit(1);

    const active = !error && mems?.length && mems[0].status === "active";
    if (!active) {
      const url = new URL("/portal", req.url);
      const redirect = NextResponse.redirect(url);
      redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
      return redirect;
    }
    return res;
  }

  // /portal root → auto‑resolve first/default tenant
  if (isRootPortal) {
    const meta = (user.user_metadata || {}) as any;
    let resolved: string | null = meta.default_tenant_id ?? meta.default_tenant ?? null;

    if (!resolved) {
      const { data: memberships } = await sb
        .from("members")
        .select("tenant_id, created_at")
        .eq("user_id", user.id)
        .eq("status", "active")            // ✅ only active memberships
        .order("created_at", { ascending: true })
        .limit(1);

      if (memberships?.length) {
        resolved = memberships[0].tenant_id as string;
      }
    }

    if (resolved) {
      const url = new URL(`/portal/${resolved}/dashboard`, req.url);
      const redirect = NextResponse.redirect(url);
      redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
      return redirect;
    }
    return res;
  }

  return res;
}

// Match all non‑static routes
export const config = {
  matcher: [
    "/((?!_next/|favicon|favicon.ico|favicon.png|favicon.svg|logo.png|images/|fonts/|public/).*)",
  ],
};