// app/admin/page.tsx — BOCC Admin Login (VariForce style)
// - Emerald glass UI, dark/light mode
// - Email + Password (no OTP)
// - Supabase sign-in, then middleware enforces internal roles
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Kelly_Slab } from "next/font/google";
import { Zap } from "lucide-react";
import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";

const kellySlab = Kelly_Slab({ weight: "400", subsets: ["latin"], display: "swap" });

function createSupabase() {
  return _createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = useMemo(createSupabase, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Basic dark/light toggle (keeps Tailwind/Daisy/your tokens happy)
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved === "dark") document.documentElement.classList.add("dark");
  }, []);
  function toggleTheme() {
    const el = document.documentElement;
    const dark = el.classList.toggle("dark");
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {}
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data?.user) {
        setErr(error?.message || "Invalid email or password");
        setLoading(false);
        return;
      }
      // If signed in, middleware will enforce internal roles
      // Try to go to admin dashboard directly
      const next = params.get("next");
      window.location.href = next || "/admin/dashboard";
    } catch (e: any) {
      setErr(e?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-svh grid place-items-center bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(16,185,129,0.12),transparent),radial-gradient(1200px_600px_at_120%_110%,rgba(16,185,129,0.10),transparent)] dark:bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(16,185,129,0.18),transparent),radial-gradient(1200px_600px_at_120%_110%,rgba(16,185,129,0.15),transparent)] px-4 py-10 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-[440px]">
        {/* Brand */}
        <div className="mb-5 flex items-center justify-center">
          <div className={`${kellySlab.className} relative text-3xl md:text-4xl font-extrabold tracking-tight`}>
            <span className="inline-flex items-baseline">
              <span className="mr-1">VariForce</span>
              <span className="relative inline-block">
                <span className="align-baseline">e</span>
                {/* Zap as superscript/exponent on the 'e' */}
                <Zap
                  aria-hidden
                  className="absolute -top-3 -right-3 h-4 w-4 md:h-5 md:w-5 text-emerald-500 drop-shadow zap-breathe"
                  style={{ animation: "zapBreath 1.8s ease-in-out infinite", transformOrigin: "center" }}
                />
              </span>
            </span>
            <span className="ml-2 text-base md:text-lg font-semibold opacity-80">Admin</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur p-5 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
          <div className="mb-2 text-sm text-slate-600 dark:text-slate-300">Sign in to</div>
          <h1 className="text-lg font-semibold mb-4">BOCC Admin Console</h1>

          <form onSubmit={onSubmit} className="grid gap-3">
            <label className="text-xs">
              Email
              <input
                type="email"
                autoComplete="username"
                placeholder="xyz@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300/60 dark:border-white/15 bg-white/80 dark:bg-black/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400/60"
                required
              />
            </label>

            <label className="text-xs">
              Password
              <div className="relative mt-1">
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300/60 dark:border-white/15 bg-white/80 dark:bg-black/40 px-3 py-2 pr-20 text-sm outline-none focus:ring-2 focus:ring-emerald-400/60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md border border-slate-300/60 dark:border-white/15 bg-white/60 dark:bg-black/30 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {err && (
              <div className="text-xs rounded-lg border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 px-3 py-2">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex items-center justify-center rounded-full bg-emerald-500 text-emerald-950 font-semibold text-sm px-4 py-2 hover:bg-emerald-400 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Internal access only • tenant_id = NULL</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full border border-slate-300/60 dark:border-white/15 px-3 py-1 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10"
            >
              Toggle theme
            </button>
          </div>
        </div>

        {/* Helper links */}
        <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
          Not an internal user?{" "}
          <a href="/portal/login" className="text-emerald-600 hover:underline">
            Go to Client Portal
          </a>
        </div>
      </div>
      <style jsx global>{`
        @keyframes zapBreath {
          0%, 100% {
            transform: translateZ(0) scale(1);
            filter: drop-shadow(0 0 0 rgba(16,185,129,0));
            opacity: 0.95;
          }
          50% {
            transform: translateZ(0) scale(1.14);
            filter: drop-shadow(0 0 12px rgba(16,185,129,0.55));
            opacity: 1;
          }
        }
        .zap-breathe {
          display: inline-block;
          transform-origin: center !important;
          transform-box: fill-box; /* important for SVG transform origin */
          will-change: transform, filter, opacity;
          pointer-events: none;
        }
        @media (prefers-reduced-motion: no-preference) {
          .zap-breathe {
            animation: zapBreath 1.8s ease-in-out infinite !important;
          }
        }
      `}</style>
    </main>
  );
}