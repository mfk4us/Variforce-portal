// app/admin/layout.tsx
"use client";

import type { ReactNode } from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const TOKENS = {
  light: {
    s4: 4,
    s6: 6,
    s8: 8,
    s10: 10,
    s12: 12,
    s16: 16,
    s20: 20,
    sidebarWidth: 240,
    line: "#e5e7eb",
    bg: "#f9fafb",
    panel: "#ffffff",
    inkSoft: "#6b7280",
    ink: "#020617",
    em: "#10b981",
    emSoft: "#d1fae5",
  },
  dark: {
    s4: 4,
    s6: 6,
    s8: 8,
    s10: 10,
    s12: 12,
    s16: 16,
    s20: 20,
    sidebarWidth: 240,
    line: "#1f2937",
    bg: "#020617",
    panel: "#020617",
    inkSoft: "#9ca3af",
    ink: "#e5e7eb",
    em: "#10b981",
    emSoft: "#0b3b35",
  },
} as const;

const navItems: { href: string; label: string }[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/partner-applications", label: "Partner Applications" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/quotes", label: "Quotes" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  // Load initial theme preference from localStorage or system preferences
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("bocc_admin_theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        return;
      }
      if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
        setTheme("light");
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist theme choice
  useEffect(() => {
    try {
      window.localStorage.setItem("bocc_admin_theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setNotifOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (notifRef.current && target && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const T = TOKENS[theme];

  // --- Derive dynamic page title & breadcrumbs from current path ---
  const segments = pathname.split("/").filter(Boolean); // ["admin", "dashboard", ...]
  const activeItem = navItems.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + "/")
  );
  const pageTitle = activeItem?.label ||
    (segments[segments.length - 1]?.replace(/-/g, " ") || "Dashboard");

  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = seg === "admin" ? "Admin" : seg.replace(/-/g, " ");
    return { href, label };
  });

  // Important: don't wrap the login page at /admin in the admin shell.
  if (pathname === "/admin") {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: T.bg,
        color: T.ink,
        fontFamily: '"Variforce", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: T.sidebarWidth,
          borderRight: `1px solid ${T.line}`,
          padding: T.s12,
          display: "flex",
          flexDirection: "column",
          gap: T.s12,
          background:
            theme === "dark"
              ? "radial-gradient(circle at top left, rgba(16,185,129,0.16), transparent 60%), #020617"
              : "radial-gradient(circle at top left, rgba(16,185,129,0.08), transparent 60%), #f9fafb",
        }}
      >
        {/* Brand / header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: T.s4,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: T.s8,
            }}
          >
            <Image
              src="/logo.png"
              alt="BOCC logo"
              width={32}
              height={32}
              style={{ borderRadius: 999, flexShrink: 0 }}
            />
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                }}
              >
                VariForce Admin
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: T.inkSoft,
                }}
              >
                Logistics &amp; partners console
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 11,
              color: T.inkSoft,
            }}
          >
            Internal console for partners, clients and projects.
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            marginTop: T.s8,
            display: "grid",
            gap: 2,
          }}
        >
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: 999,
                  fontSize: 13,
                  textDecoration: "none",
                  border: active ? `1px solid ${T.em}` : "1px solid transparent",
                  background: active ? T.emSoft : "transparent",
                  color: active
                    ? theme === "light"
                      ? "#064e3b" // rich emerald for light mode
                      : "#bbf7d0" // soft mint for dark mode
                    : T.inkSoft,
                }}
              >
                <span>{item.label}</span>
                {active && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: T.em,
                      flexShrink: 0,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Footer */}
        <div
          style={{
            display: "grid",
            gap: T.s6,
            fontSize: 11,
            color: T.inkSoft,
          }}
        >
          <div>BOCC · Internal use only</div>
        </div>
      </aside>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          maxWidth: "100%",
          padding: T.s16,
          overflow: "auto",
          background: T.panel,
        }}
      >
        {/* Page header (dynamic title + breadcrumbs) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: T.s16,
            gap: T.s12,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: 0.2,
              }}
            >
              {pageTitle}
            </h1>
            <div style={{ marginTop: 4, fontSize: 12, color: T.inkSoft }}>
              {crumbs.map((c, i) => (
                <span key={c.href}>
                  {i > 0 && <span style={{ opacity: 0.6 }}> / </span>}
                  <Link href={c.href} style={{ color: T.inkSoft, textDecoration: "none" }}>
                    {c.label}
                  </Link>
                </span>
              ))}
            </div>
          </div>

          {/* Right-side utilities */}
          <div style={{ display: "flex", alignItems: "center", gap: T.s8 }}>
            {/* Theme toggle */}
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              style={{
                borderRadius: 999,
                border: `1px solid ${T.line}`,
                padding: "6px 10px",
                background: T.panel,
                color: T.inkSoft,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {theme === "dark" ? "☀︎ Light" : "🌙 Dark"}
            </button>

            {/* Notifications (always has a dropdown, even if empty) */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={notifOpen}
                onClick={() => { setNotifOpen((v) => !v); setUserMenuOpen(false); }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  border: `1px solid ${T.line}`,
                  background: T.panel,
                  color: T.inkSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                🔔
                {/* Badge can be shown conditionally later; keep a soft dot for presence */}
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 7,
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: T.em,
                    opacity: 0.9,
                  }}
                />
              </button>

              {notifOpen && (
                <div
                  role="menu"
                  aria-label="Notifications"
                  style={{
                    position: "absolute",
                    top: "110%",
                    right: 0,
                    marginTop: 4,
                    minWidth: 300,
                    borderRadius: 12,
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                    boxShadow: "0 12px 30px rgba(15,23,42,0.25)",
                    padding: 8,
                    zIndex: 60,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <strong style={{ fontSize: 13 }}>Notifications</strong>
                    <span style={{ fontSize: 11, color: T.inkSoft }}>0 new</span>
                  </div>
                  <div style={{ height: 1, background: T.line, opacity: 0.6, margin: "6px 0" }} />

                  {/* Empty state */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, borderRadius: 8, background: theme === "dark" ? "rgba(255,255,255,0.02)" : "#f9fafb" }}>
                    <div style={{ fontSize: 16 }}>✅</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>All clear</div>
                      <div style={{ fontSize: 12, color: T.inkSoft }}>No notifications right now.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User pill + dropdown (existing logic retained) */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => { setUserMenuOpen((open) => !open); setNotifOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: T.s6,
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: `1px solid ${T.line}`,
                  background: T.panel,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    background: T.emSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                >
                  A
                </div>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                  <span>Admin</span>
                  <span style={{ color: T.inkSoft, fontSize: 11 }}>admin@bocc.sa</span>
                </div>
              </button>

              {userMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "110%",
                    right: 0,
                    marginTop: 4,
                    minWidth: 180,
                    borderRadius: 12,
                    border: `1px solid ${T.line}`,
                    background: T.panel,
                    boxShadow: "0 12px 30px rgba(15,23,42,0.25)",
                    padding: 6,
                    fontSize: 13,
                    zIndex: 50,
                  }}
                >
                  <div style={{ padding: "6px 10px", borderRadius: 8, fontSize: 12, color: T.inkSoft }}>
                    Signed in as
                    <div style={{ fontWeight: 600, color: T.ink }}>admin@bocc.sa</div>
                  </div>
                  <div style={{ height: 1, background: T.line, margin: "4px 0", opacity: 0.6 }} />
                  <Link
                    href="/admin/logout"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      borderRadius: 8,
                      textDecoration: "none",
                      color: "#b91c1c",
                      fontSize: 13,
                    }}
                  >
                    <span>Log out</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Routed page content */}
        {children}
      </div>
    </div>
  );
}