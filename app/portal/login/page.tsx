// @ts-nocheck
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Zap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Kelly_Slab } from "next/font/google";
const kellySlab = Kelly_Slab({ weight: "400", subsets: ["latin"], display: "swap" });
// Small helpers for session-availability race
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function waitForSession(sb: ReturnType<typeof createBrowserClient>, timeoutMs = 2000) {
  const start = Date.now();
  // quick attempt
  let { data } = await sb.auth.getSession();
  if (data?.session) return data.session;
  // subscribe + light polling (covers most cases)
  const { data: sub } = sb.auth.onAuthStateChange((_evt, session) => {
    if (session) {
      // no-op; polling branch will pick it up
    }
  });
  try {
    while (Date.now() - start < timeoutMs) {
      await sleep(150);
      const { data: d2 } = await sb.auth.getSession();
      if (d2?.session) return d2.session;
    }
    return null as any;
  } finally {
    try { sub.subscription.unsubscribe(); } catch {}
  }
}

function Modal({ open, onClose, title, children, actions }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-white dark:bg-neutral-900 shadow-xl">
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="px-5 pb-4 text-sm text-neutral-700 dark:text-neutral-200">
            {children}
          </div>
          <div className="px-5 pb-4 flex items-center justify-end gap-2">
            {actions}
          </div>
        </div>
      </div>
    </div>
  )
}

function BreathingBolt() {
  return (
    <span className="relative inline-flex items-center">
      <span className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl animate-breathe" />
      <Zap className="relative w-10 h-10 text-emerald-400 drop-shadow-[0_0_18px_rgba(16,185,129,0.85)] animate-breathe" />
    </span>
  );
}


type Lang = "en" | "ar" | "ur" | "hi" | "ml" | "bn";


// Lightweight i18n (aligned with signup page)
const i18n: Record<Lang | "zh", any> = {
  en: {
    back: "← Back to website",
    title: "Sign in to VariForce Workspace",
    subtitle: "Sign in with Email & Password",
    haveNoAccount: "New here? Create an account",
    tagline: "One Team, Many Skills",
    support1: "On‑demand factotum crews.",
    support2:
      "Built for founders starting from zero and SMEs where outsourcing slows growth.",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    emailRequired: "Enter a valid email.",
    passwordRequired: "Enter your password.",
    forgotPassword: "Forgot password?",
    loginFailed: "Login failed. Check your email and password.",
    accountInactiveTitle: "Account not active",
    accountInactiveBody: "Your account is not active yet. Please contact VariForce support to activate your workspace access.",
    contactSupport: "Contact support",
    close: "Close",
  },
  ar: {
    back: "← الرجوع إلى الموقع",
    title: "تسجيل الدخول إلى مساحة عمل VariForce",
    subtitle: "سجّل عبر البريد وكلمة المرور",
    haveNoAccount: "مستخدم جديد؟ أنشئ حسابًا",
    tagline: "فريق واحد، مهارات متعددة",
    support1: "فرق متعددة المهام عند الطلب.",
    support2:
      "مصمم للمؤسسين من الصفر وللشركات الصغيرة والمتوسطة حيث يبطئ الاستعانة بمصادر خارجية النمو.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    signIn: "تسجيل الدخول",
    signingIn: "جارٍ الدخول…",
    emailRequired: "أدخل بريدًا صحيحًا.",
    passwordRequired: "أدخل كلمة المرور.",
    forgotPassword: "نسيت كلمة المرور؟",
    loginFailed: "تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.",
    accountInactiveTitle: "الحساب غير مفعل",
    accountInactiveBody: "حسابك غير مفعل بعد. يرجى التواصل مع دعم VariForce لتفعيل صلاحية الدخول.",
    contactSupport: "تواصل مع الدعم",
    close: "إغلاق",
  },
  ur: {},
  hi: {},
  ml: {},
  bn: {},
  zh: {},
};

export default function LoginPage() {
  const router = useRouter();
  const sb = useMemo(() => createBrowserClient(), []);
  const [lang, setLang] = useState<Lang>("en");

  // One-time init: prefer ?lang=
  useEffect(() => {
    try {
      const supported = ["en", "ar", "ur", "hi", "ml", "bn", "zh"] as const;
      let urlLang = "en";
      if (typeof window !== "undefined") {
        const sp = new URL(window.location.href).searchParams;
        urlLang = (sp.get("lang") || "").toLowerCase();
      }
      const storeLang = typeof window !== "undefined" ? (localStorage.getItem("vf_lang") as Lang | null) : null;

      let initial: Lang = "en";
      if ((supported as readonly string[]).includes(urlLang)) initial = urlLang as Lang;
      else if (storeLang && (supported as readonly string[]).includes(storeLang)) initial = storeLang;

      setLang(initial);

      if (typeof window !== "undefined") {
        localStorage.setItem("vf_lang", initial);
        const u = new URL(window.location.href);
        if (u.searchParams.get("lang") !== initial) {
          u.searchParams.set("lang", initial);
          window.history.replaceState({}, "", u.toString());
        }
      }
    } catch {}
  }, []);


  // Email/Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [noMembershipOpen, setNoMembershipOpen] = useState(false);
  // Auth UI guards
  const [bootChecked, setBootChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [attempted, setAttempted] = useState(false); // set true when user presses Sign In

  const resolveAndRoute = useCallback(
    async (fromAttempt: boolean = false, retries: number = 5) => {
      try {
        const { data: u } = await sb.auth.getUser();
        const user = u?.user;
        if (!user) return;

        // Prefer default tenant from metadata
        let tenantId: string | null =
          (user?.user_metadata as any)?.default_tenant_id ??
          (user?.user_metadata as any)?.default_tenant ??
          null;

        // Fallback: oldest ACTIVE membership
        if (!tenantId) {
          const { data: memberships, error: mErr } = await sb
            .from("members")
            .select("tenant_id, status, created_at")
            .eq("user_id", user.id)
            .eq("status", "active")
            .order("created_at", { ascending: true })
            .limit(1);

          if (mErr) console.warn("[login] members lookup RLS error:", mErr);
          if (memberships?.length) tenantId = memberships[0].tenant_id as string | null;
        }

        // If still nothing, retry a few times to let the new JWT propagate
        if (!tenantId && retries > 0) {
          await sleep(220);
          return resolveAndRoute(fromAttempt, retries - 1);
        }

        if (!tenantId) {
          if (fromAttempt) {
            setErr("No tenant membership found for this account. If you were just provisioned, refresh and try again.");
            setNoMembershipOpen(true);
          }
          return;
        }

        // Read tenant status (RLS-enabled). If blocked, send to activation.
        const { data: t, error: tErr } = await sb
          .from("tenants")
          .select("id,status")
          .eq("id", tenantId)
          .maybeSingle();

        try {
          localStorage.setItem("vf_tenant", tenantId);
          document.cookie = `vf_tenant=${encodeURIComponent(tenantId)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        } catch {}

        if (tErr || !t || t.status === "pending") {
          router.replace(`/portal/${tenantId}/activation`);
          return;
        }
        router.replace(`/portal/${tenantId}/dashboard`);
      } catch (err) {
        console.warn("[login] resolveAndRoute failed", err);
      }
    },
    [sb, setNoMembershipOpen, router]
  );

  // On mount, if already signed in, resolve and route
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await sb.auth.getUser();
        if (!alive) return;
        const isAuthed = !!data?.user;
        setAuthed(isAuthed);
        setBootChecked(true);
        if (isAuthed) {
          await resolveAndRoute(false, 3);
        }
      } catch {
        setBootChecked(true);
      }
    })();
    return () => { alive = false; };
  }, [resolveAndRoute]);

  async function routeAfterAuth(accessToken: string) {
    // Resolve membership and route accordingly (no admin redirect here)
    try {
      const { data: u } = await sb.auth.getUser();
      const user = u?.user;
      if (!user) return;

      // Prefer default tenant from auth metadata
      let tenantId: string | null =
        (user?.user_metadata as any)?.default_tenant_id ??
        (user?.user_metadata as any)?.default_tenant ??
        null;

      // Fallback: earliest active membership
      if (!tenantId && user?.id) {
        const { data: memberships, error: mErr } = await sb
          .from("members")
          .select("tenant_id, status, created_at")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: true });

        console.log("[login] memberships RLS data:", memberships, "error:", mErr);

        if (mErr) {
          console.warn("[login] members lookup RLS error:", mErr);
        }

        if (memberships && memberships.length > 0) {
          tenantId = memberships[0].tenant_id as string | null;
        }
      }

      // This portal is for tenant users only; BOCC staff must use /admin/login
      if (!tenantId) {
        setErr("This portal is for customers/tenants. BOCC staff should sign in at /admin/login.");
        try { await sb.auth.signOut(); } catch {}
        return;
      }

      // Read tenant status via RLS and route to activation if pending
      const { data: t, error: tErr } = await sb
        .from("tenants")
        .select("id, status")
        .eq("id", tenantId)
        .maybeSingle();

      // Persist tenant hint for subsequent navigation
      try { localStorage.setItem("vf_tenant", tenantId); } catch {}
      document.cookie = `vf_tenant=${encodeURIComponent(tenantId)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;

      if (tErr || !t || t.status === "pending") {
        router.replace(`/portal/${tenantId}/activation`);
        return;
      }

      // Default route for active tenants
      router.replace(`/portal/${tenantId}/dashboard`);
    } catch (routeErr) {
      console.warn("routeAfterAuth failed:", routeErr);
      router.replace("/portal");
    }
  }

  const t = (k: keyof typeof i18n["en"]) => (i18n[lang] as any)[k] ?? (i18n.en as any)[k] ?? k;
  const isRTL = lang === "ar" || lang === "ur";
  const dir = isRTL ? "rtl" : "ltr";
  const cardOrderCls = isRTL ? "md:order-1" : "md:order-2";
  const partnerUrl = useMemo(() => `https://bocc.sa/partners?lang=${lang}`, [lang]);

  async function loginWithEmailPass() {
    setErr(null);
    setMsg(null);
    setAttempted(true);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr(t("emailRequired"));
      return;
    }
    if (!password) {
      setErr(t("passwordRequired"));
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error || !data?.session) throw new Error(error?.message || t("loginFailed"));

      // Optional cookie for other parts of app
      try {
        document.cookie = `vf_session=${encodeURIComponent(data.session.access_token)}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      } catch {}

      setMsg("Sign-in successful. Redirecting…");
      // Ensure fresh JWT/session is attached before RLS queries
      await waitForSession(sb, 2000);
      await resolveAndRoute(true /* fromAttempt */, 5);
    } catch (e: any) {
      setErr(e?.message || t("loginFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden overflow-y-hidden" dir={dir} data-lang={lang} suppressHydrationWarning>
      {/* Background */}
      <video
        className="pointer-events-none fixed inset-0 w-full h-full object-cover z-0"
        src="/bg/fieldwork.mp4"
        autoPlay
        muted
        loop
        playsInline
        onError={(e) => { try { (e.currentTarget as HTMLVideoElement).style.display = 'none'; } catch {} }}
      />
      <div className="fixed inset-0 z-0 bg-emerald-50/80" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(60%_40%_at_20%_20%,rgba(16,185,129,0.12),transparent),radial-gradient(50%_40%_at_80%_0%,rgba(6,182,212,0.12),transparent)]" />

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <a href={partnerUrl} className="inline-flex items-center gap-3 group" dir="ltr">
            <img src="/logo.png" alt="BOCC logo" className="h-9 w-9 rounded-md bg-white ring-1 ring-emerald-200/50 shadow" />
            <div className="leading-tight">
              <div className="text-slate-900 font-semibold tracking-tight text-base sm:text-lg">Brightness of Creativity</div>
              <div className="text-slate-600 text-[12px]">Fast • Agile • Secure • Advanced — Modernizing your tech</div>
            </div>
          </a>
          <div className="shrink-0">
            <label className="sr-only" htmlFor="lang-toggle">Language</label>
            <select
              id="lang-toggle"
              value={lang}
              onChange={(e) => {
                const v = e.target.value as Lang;
                setLang(v);
                if (typeof window !== "undefined") {
                  localStorage.setItem("vf_lang", v);
                  const u = new URL(window.location.href);
                  u.searchParams.set("lang", v);
                  window.history.replaceState({}, "", u.toString());
                }
              }}
              className="appearance-none pl-9 pr-8 py-2 text-sm rounded-full border border-emerald-200 bg-white/70 backdrop-blur-md text-slate-900 ring-1 ring-emerald-200/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="en">🇬🇧 English</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="ur">🇵🇰 اردو</option>
              <option value="hi">🇮🇳 हिंदी</option>
              <option value="ml">🇮🇳 മലയാളം</option>
              <option value="bn">🇧🇩 বাংলা</option>
              <option value="zh">🇨🇳 中文</option>
            </select>
            <span className="pointer-events-none relative -ml-8 inline-block align-middle" aria-hidden />
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="relative z-10 bg-transparent">
        <div dir="ltr" className="mx-auto max-w-6xl px-4 pt-24 pb-12 grid md:grid-cols-2 gap-8 items-center min-h-[80vh]">
          {/* Left: hero branding */}
          <section className="hidden md:flex flex-col justify-center items-end text-right w-full">
            <h1 className="mt-0">
              <span className={`${kellySlab.className} relative inline-block tracking-tight text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-slate-900 pb-4`}>
                <span className="pointer-events-none absolute -inset-8 -z-10 blur-3xl bg-[radial-gradient(closest-side,rgba(16,185,129,0.25),transparent_78%)] glow-breathe" />
                <span className="inline-flex items-baseline gap-0.5">
                  <span>VariForce</span>
                  <span className="relative -translate-y-16 ml-1 pointer-events-none">
                    <span className="absolute inset-0 rounded-full bg-emerald-500/25 blur-md animate-breathe" />
                    <Zap className="relative w-8 h-8 text-emerald-500 bolt-breathe" />
                  </span>
                </span>
              </span>
            </h1>
            <div className="mt-0 text-lg sm:text-xl font-semibold text-slate-900 text-right ml-auto">{t("tagline")}</div>
            <p className="mt-1 text-2xl text-slate-700 text-right ml-auto">{t("support1")}</p>
            <p className="mt-1 text-base leading-7 text-slate-600 text-right ml-auto">{t("support2")}</p>
          </section>

          {/* Right: signin card */}
          <section className={`flex justify-center ${cardOrderCls}`}>
            <div className="w-full max-w-md sm:max-w-lg">
              <div className="relative isolate overflow-hidden rounded-3xl border border-emerald-200 bg-white/95 backdrop-blur-xl shadow-lg">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.08),transparent_32%)]" />
                <div className="relative z-10 p-4 sm:p-5 mx-auto w-full">
                  <a href={partnerUrl} className="mb-2 inline-flex items-center text-sm text-emerald-700 hover:text-emerald-900">{t("back")}</a>
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {lang === "ar" ? (
                      <span className="relative inline-block">
                        {i18n.ar.title.split("VariForce")[0]}
                        <span className={`${kellySlab.className} tracking-tight mx-1 text-slate-900 relative inline-block`}>
                          VariForce
                          <span className="pointer-events-none absolute -top-2 -left-3">
                            <Zap className="w-4 h-4 text-emerald-500 bolt-breathe" />
                          </span>
                        </span>
                      </span>
                    ) : (
                      <span className="relative inline-block">
                        {"Sign in to "}
                        <span className={`${kellySlab.className} tracking-tight mx-1 text-slate-900 relative inline-block`}>
                          VariForce
                          <span className="pointer-events-none absolute -top-2 -right-3">
                            <Zap className="w-4 h-4 text-emerald-500 bolt-breathe" />
                          </span>
                        </span>
                        {" Workspace"}
                      </span>
                    )}
                  </h1>
                  <p className="text-sm text-gray-700 max-w-2xl mt-1">{t("subtitle")}</p>

                  {/* Title for email/password login */}
                  <div className="mt-4 text-lg font-semibold text-emerald-800">{t("subtitle")}</div>

                  {/* Flash messages */}
                  {msg && <div className="mt-4 rounded bg-green-50 text-green-700 text-sm px-3 py-2">{msg}</div>}
                  {bootChecked && err && <div className="mt-4 rounded bg-red-50 text-red-700 text-sm px-3 py-2">{err}</div>}
                  {bootChecked && err && (
                    <div className="mt-2 text-[11px] text-slate-500">
                      (Tip: ensure there is an <code>active</code> row in <code>public.members</code> with this <code>user_id</code> and a valid <code>tenant_id</code>.)
                    </div>
                  )}

                  {/* Forms */}
                  <div className="mt-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">{t("email")}</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 grid place-items-center">
                          <Mail className="h-4 w-4 text-emerald-700" />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full border rounded px-3 pl-10 py-2 outline-none border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          dir="ltr"
                          onKeyDown={(ev) => {
                            if (ev.key === "Enter" && !loading) loginWithEmailPass();
                          }}
                        />
                      </div>
                      <label className="block text-sm text-gray-700 mb-1 mt-3">{t("password")}</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 grid place-items-center">
                          <Lock className="h-4 w-4 text-emerald-700" />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full border rounded px-3 pl-10 pr-10 py-2 outline-none border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          dir="ltr"
                          onKeyDown={(ev) => {
                            if (ev.key === "Enter" && !loading) loginWithEmailPass();
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute inset-y-0 right-2 grid place-items-center px-2 text-emerald-700 hover:text-emerald-900 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="mt-2 text-right">
                        <a
                          href={`mailto:info@bocc.sa?subject=${encodeURIComponent('Forgot Password — VariForce')}&body=${encodeURIComponent('Hello BOCC Team,%0D%0A%0D%0AI cannot access my VariForce account.%0D%0AEmail: ' + (email || '') + '%0D%0ATenant/Company (if known): %0D%0APhone (optional): %0D%0A%0D%0AThank you!')}`}
                          className="text-sm text-emerald-700 hover:text-emerald-900 underline underline-offset-4"
                        >
                          {t("forgotPassword")}
                        </a>
                      </div>
                      <button
                        onClick={loginWithEmailPass}
                        disabled={loading}
                        className="mt-4 w-full h-11 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition-colors disabled:opacity-100 disabled:brightness-95 disabled:saturate-90 disabled:cursor-not-allowed"
                      >
                        {loading ? t("signingIn") : t("signIn")}
                      </button>
                      {msg && (
                        <div className="mt-2 text-right">
                          <a
                            href="/portal"
                            className="text-sm text-emerald-700 hover:text-emerald-900 underline underline-offset-4"
                          >
                            Go to dashboard
                          </a>
                        </div>
                      )}
                      <p className="mt-3 text-sm text-gray-700">
                        <a href="/portal/signup" className="underline hover:text-emerald-700">
                          {t("haveNoAccount")}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div> 
            </div>
          </section>
        </div>
      </main>



      {/* Footer */}
      <footer className="absolute bottom-0 w-full z-10 border-t border-white/20 bg-black/40 backdrop-blur-sm text-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="text-xs">
            © 2025 Brightness of Creativity (BOCC) — All rights reserved. <a href="/privacy" className="underline underline-offset-4 hover:text-emerald-400">Privacy</a>{" • "}
            <a href="/terms" className="underline underline-offset-4 hover:text-emerald-400">Terms</a>
          </div>
          <nav className="flex items-center gap-5 text-white">
            <a href="https://x.com/bocc_sa" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="opacity-90 hover:opacity-100 transition-opacity">
              <img src="/x.svg" alt="X (Twitter)" className="h-4 w-4 brightness-0 invert" />
            </a>
            <a href="https://instagram.com/bocc_sa" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="opacity-90 hover:opacity-100 transition-opacity">
              <img src="/instagram.svg" alt="Instagram" className="h-4 w-4 brightness-0 invert" />
            </a>
            <a href="https://linkedin.com/company/bocc-sa" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="opacity-90 hover:opacity-100 transition-opacity">
              <img src="/linkedin.svg" alt="LinkedIn" className="h-4 w-4 brightness-0 invert" />
            </a>
            <a href="https://wa.me/966570442116" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="opacity-90 hover:opacity-100 transition-opacity">
              <img src="/whatsapp.svg" alt="WhatsApp" className="h-4 w-4 brightness-0 invert" />
            </a>
          </nav>
        </div>
      </footer>

      {/* No membership modal */}
      <Modal
        open={(attempted || authed) && noMembershipOpen}
        onClose={() => setNoMembershipOpen(false)}
        title={t("accountInactiveTitle")}
      >
        <p>{t("accountInactiveBody")}</p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <a
            href="mailto:info@bocc.sa?subject=Activate%20my%20VariForce%20account"
            className="rounded-md bg-emerald-600 text-white px-3 py-1.5 text-sm"
          >
            {t("contactSupport")}
          </a>
          <button
            onClick={() => setNoMembershipOpen(false)}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            {t("close")}
          </button>
        </div>
      </Modal>
    </div>
  );
}