// app/admin/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data.ok) {
        setErr(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Cookie is set server-side by /admin/login; just navigate
      router.push("/admin/dashboard");
    } catch (error: any) {
      setErr(error?.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#020617",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 16,
          border: "1px solid #1f2937",
          background:
            "radial-gradient(circle at top left, rgba(16,185,129,0.18), transparent 55%), #020617",
          padding: 24,
          boxShadow: "0 18px 45px rgba(0,0,0,0.55)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
          BOCC Admin Login
        </h1>
        <p style={{ margin: 0, marginBottom: 18, fontSize: 13, color: "#94a3b8" }}>
          Sign in with your Supabase admin account.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ fontSize: 12 }}>
            Email
            <input
              type="email"
              autoComplete="username"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                marginTop: 4,
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #1f2937",
                background: "#020617",
                color: "#e5e7eb",
                fontSize: 13,
              }}
            />
          </label>

          <label style={{ fontSize: 12 }}>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                marginTop: 4,
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #1f2937",
                background: "#020617",
                color: "#e5e7eb",
                fontSize: 13,
              }}
            />
          </label>

          {err && (
            <div
              style={{
                fontSize: 12,
                color: "#fecaca",
                background: "#450a0a",
                borderRadius: 8,
                padding: 8,
              }}
            >
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "9px 12px",
              borderRadius: 999,
              border: 0,
              background: loading ? "#4b5563" : "#10b981",
              color: "#022c22",
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p
          style={{
            marginTop: 16,
            fontSize: 11,
            color: "#64748b",
          }}
        >
          Only the configured BOCC admin user can access the dashboard. Once
          signed in, you&apos;ll be redirected to the main admin console.
        </p>
      </div>
    </main>
  );
}