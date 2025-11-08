// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Zap, Mail, Lock } from "lucide-react";
import { Kelly_Slab } from "next/font/google";
const kellySlab = Kelly_Slab({ weight: "400", subsets: ["latin"], display: "swap" });

function BreathingBolt() {
  return (
    <span className="relative inline-flex items-center">
      <span className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl animate-breathe" />
      <Zap className="relative w-10 h-10 text-emerald-400 drop-shadow-[0_0_18px_rgba(16,185,129,0.85)] animate-breathe" />
    </span>
  );
}

type Step = "phone" | "code";

type Lang = "en" | "ar" | "ur" | "hi" | "ml" | "bn";

type Method = "otp" | "password";

// Lightweight i18n (aligned with signup page)
const i18n: Record<Lang | "zh", any> = {
  en: {
    back: "← Back to website",
    title: "Sign in to VariForce Workspace",
    subtitle: "Use WhatsApp OTP or Email & Password",
    waNumber: "WhatsApp number",
    phonePh: "9665XXXXXXXX",
    send: "Send code",
    sending: "Sending…",
    enterCodeTo: "Enter the 6‑digit code sent to",
    codePh: "••••••",
    verify: "Verify & continue",
    verifying: "Verifying…",
    resend: "Resend code",
    haveNoAccount: "New here? Create an account",
    codeSent: "Code sent on WhatsApp.",
    phoneError: "Enter phone in E.164 without + (e.g., 9665XXXXXXXX).",
    codeError: "Enter the 6‑digit code.",
    noAccountTitle: "No account found",
    noAccountBody:
      "This WhatsApp number is not registered. Please sign up to request access to VariForce Workspace.",
    goToSignup: "Go to Sign up",
    cancel: "Cancel",
    hintPhone: "KSA mobile format: 5XXXXXXXX",
    tagline: "One Team, Many Skills",
    support1: "On‑demand factotum crews.",
    support2:
      "Built for founders starting from zero and SMEs where outsourcing slows growth.",
    // New keys for email/password tab
    methodOTP: "WhatsApp OTP",
    methodPassword: "Email & Password",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    emailRequired: "Enter a valid email.",
    passwordRequired: "Enter your password.",
    loginFailed: "Login failed. Check your email and password.",
  },
  ar: {
    back: "← الرجوع إلى الموقع",
    title: "تسجيل الدخول إلى مساحة عمل VariForce",
    subtitle: "سجّل عبر رمز واتساب أو البريد وكلمة المرور",
    waNumber: "رقم الواتساب",
    phonePh: "9665XXXXXXXX",
    send: "إرسال الرمز",
    sending: "جارٍ الإرسال…",
    enterCodeTo: "أدخل الرمز المكوّن من 6 أرقام المُرسل إلى",
    codePh: "••••••",
    verify: "تحقق وتابع",
    verifying: "جارٍ التحقق…",
    resend: "إعادة إرسال الرمز",
    haveNoAccount: "مستخدم جديد؟ أنشئ حسابًا",
    codeSent: "تم إرسال الرمز عبر واتساب.",
    phoneError: "أدخل الرقم بصيغة E.164 بدون + (مثال: 9665XXXXXXXX).",
    codeError: "أدخل الرمز المكوّن من 6 أرقام.",
    noAccountTitle: "لا يوجد حساب",
    noAccountBody:
      "رقم الواتساب هذا غير مسجل. يرجى إنشاء حساب للتقديم على الوصول إلى مساحة عمل VariForce.",
    goToSignup: "اذهب للتسجيل",
    cancel: "إلغاء",
    hintPhone: "تنسيق رقم الجوال السعودي: ‎5XXXXXXXX",
    tagline: "فريق واحد، مهارات متعددة",
    support1: "فرق متعددة المهام عند الطلب.",
    support2:
      "مصمم للمؤسسين من الصفر وللشركات الصغيرة والمتوسطة حيث يبطئ الاستعانة بمصادر خارجية النمو.",
    methodOTP: "رمز واتساب",
    methodPassword: "البريد وكلمة المرور",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    signIn: "تسجيل الدخول",
    signingIn: "جارٍ الدخول…",
    emailRequired: "أدخل بريدًا صحيحًا.",
    passwordRequired: "أدخل كلمة المرور.",
    loginFailed: "تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.",
  },
  ur: {},
  hi: {},
  ml: {},
  bn: {},
  zh: {},
};

export default function LoginPage() {
  const [method, setMethod] = useState<Method>("otp");
  const [step, setStep] = useState<Step>("phone");
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

  // OTP state
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const phoneNational = (phone || "").replace(/^966/, "");
  const phoneValid = /^5\d{8}$/.test(phoneNational);

  // Email/Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Shared state
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const t = (k: keyof typeof i18n["en"]) => (i18n[lang] as any)[k] ?? (i18n.en as any)[k] ?? k;
  const isRTL = lang === "ar" || lang === "ur";
  const dir = isRTL ? "rtl" : "ltr";
  const cardOrderCls = isRTL ? "md:order-1" : "md:order-2";
  const partnerUrl = useMemo(() => `https://bocc.sa/partners?lang=${lang}`, [lang]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const tm = setInterval(() => setResendTimer((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(tm);
  }, [resendTimer]);

  async function sendOTP() {
    setErr(null);
    setMsg(null);

    let normalized = (phone || "").replace(/\D/g, "");
    if (normalized.startsWith("05")) normalized = normalized.slice(1);
    normalized = normalized.replace(/^0+/, "");
    if (!normalized.startsWith("966")) normalized = "966" + normalized;

    if (!/^9665\d{8}$/.test(normalized)) {
      setErr("Phone must start with 5 and be 9 digits long.");
      return;
    }

    setLoading(true);
    try {
      try {
        if (supabase) {
          const { data, error } = await supabase.from("profiles").select("status").eq("phone", normalized).single();
          if (error && error.code && error.code !== "PGRST116") {
            console.warn("profiles precheck warning:", error);
          } else if (data) {
            if (data.status === "pending") {
              setErr("Your account is under review. You’ll receive access once approved.");
              setLoading(false);
              return;
            }
            if (data.status === "rejected") {
              setErr("Your application was not approved. Contact support if you believe this is a mistake.");
              setLoading(false);
              return;
            }
          }
        }
      } catch (preErr) {
        console.warn("profiles precheck failed, continuing:", preErr);
      }

      const r = await fetch(`/api/wa/send-otp?lang=${encodeURIComponent(lang)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized }),
      });

      let j: any = null;
      try {
        j = await r.json();
      } catch {}

      if (!r.ok) {
        if (r.status === 404) setErr("OTP service not found. Ensure /app/api/wa/send-otp/route.ts exists and rebuild.");
        else if (r.status === 401 || r.status === 403) setErr("OTP service unauthorized. Check META_WHATSAPP_TOKEN envs.");
        else setErr(j?.message || j?.error || `Failed to send code (HTTP ${r.status}).`);
        setLoading(false);
        return;
      }

      const resendIn = j && typeof j.resend_in === "number" ? j.resend_in : 60;
      setMsg(t("codeSent"));
      setStep("code");
      setResendTimer(resendIn);
      setPhone(normalized.replace(/^966/, ""));
    } catch (e: any) {
      console.error("sendOTP exception:", e);
      setErr(e?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTP() {
    setErr(null);
    setMsg(null);
    const c = (code || "").replace(/\D/g, "").slice(0, 6);
    if (!/^\d{6}$/.test(c)) {
      setErr(t("codeError"));
      return;
    }
    let normalized = (phone || "").replace(/\D/g, "");
    if (normalized.startsWith("05")) normalized = normalized.slice(1);
    normalized = normalized.replace(/^0+/, "");
    if (!normalized.startsWith("966")) normalized = "966" + normalized;
    if (!/^9665\d{8}$/.test(normalized)) {
      setErr("Phone must start with 5 and be 9 digits long.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/wa/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, code: c }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.message || j?.error || "Invalid code");

      // Gate by profiles table if present
      const sb = supabase;
      if (sb) {
        const { data, error } = await sb.from("profiles").select("status").eq("phone", normalized).maybeSingle();
        if (error) throw new Error(error.message);
        if (!data) {
          setShowSignupModal(true);
          setLoading(false);
          return;
        }
        if (data.status === "pending") throw new Error("Your account is under review.");
        if (data.status === "rejected") throw new Error("Your application was not approved. Contact support.");
      }
      window.location.href = "/portal/create-project";
    } catch (e: any) {
      setErr(e.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function loginWithEmailPass() {
    setErr(null);
    setMsg(null);
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr(t("emailRequired"));
      return;
    }
    if (!password) {
      setErr(t("passwordRequired"));
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data?.session) throw new Error(error?.message || t("loginFailed"));

      // TEMP: set vf_session on client so middleware allows /portal/* (replace with server route later)
      try {
        const token = data.session.access_token || "vf";
        document.cookie = `vf_session=${encodeURIComponent(token)}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      } catch {}

      // Determine tenant and route to /portal/{tenantId}/dashboard when available
      try {
        const user = data.user; // supabase-js v2 returns { data: { user, session } }
        let tenantId: string | null = (user?.user_metadata as any)?.default_tenant_id ?? null;

        if (!tenantId) {
          const { data: memberships, error: mErr } = await supabase
            .from("tenant_members")
            .select("tenant_id, role, created_at")
            .order("created_at", { ascending: true });

          if (mErr) {
            console.warn("tenant_members lookup warning:", mErr);
          } else if (memberships && memberships.length > 0) {
            tenantId = memberships[0].tenant_id as string;
          }
        }

        // Persist chosen tenant locally for the app shell
        if (tenantId) {
          try { localStorage.setItem("vf_tenant", tenantId); } catch {}
          document.cookie = `vf_tenant=${encodeURIComponent(tenantId)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
          window.location.href = `/portal/${tenantId}/dashboard`;
        } else {
          // Fallback if no membership yet
          window.location.href = "/portal/create-project";
        }
      } catch (routeErr) {
        console.warn("post-login routing issue:", routeErr);
        window.location.href = "/portal/create-project";
      }
    } catch (e: any) {
      setErr(e.message || t("loginFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden overflow-y-hidden" dir={dir} data-lang={lang} suppressHydrationWarning>
      {/* Background */}
      <video className="pointer-events-none fixed inset-0 w-full h-full object-cover z-0" src="/bg/fieldwork.mp4" autoPlay muted loop playsInline />
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
              <span className={`${kellySlab.className} relative inline-block tracking-tight text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-slate-900`}>
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
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{t("title")}</h1>
                  <p className="text-sm text-gray-700 max-w-2xl mt-1">{t("subtitle")}</p>

                  {/* Method tabs */}
                  <div className="mt-4 inline-flex rounded-full border border-emerald-200 bg-white/80 backdrop-blur p-1">
                    <button
                      className={`px-3 py-1.5 text-sm rounded-full transition ${
                        method === "otp" ? "bg-emerald-600 text-white shadow" : "text-emerald-700 hover:bg-emerald-50"
                      }`}
                      onClick={() => setMethod("otp")}
                    >
                      {t("methodOTP")}
                    </button>
                    <button
                      className={`px-3 py-1.5 text-sm rounded-full transition ${
                        method === "password" ? "bg-emerald-600 text-white shadow" : "text-emerald-700 hover:bg-emerald-50"
                      }`}
                      onClick={() => setMethod("password")}
                    >
                      {t("methodPassword")}
                    </button>
                  </div>

                  {/* Flash messages */}
                  {msg && <div className="mt-4 rounded bg-green-50 text-green-700 text-sm px-3 py-2">{msg}</div>}
                  {err && <div className="mt-4 rounded bg-red-50 text-red-700 text-sm px-3 py-2">{err}</div>}

                  {/* Forms */}
                  <div className="mt-4">
                    {method === "otp" ? (
                      step === "phone" ? (
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">{t("waNumber")}</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-3 grid place-items-center">
                              <img src="/whatsapp.svg" alt="WhatsApp" className="h-5 w-5 tint-emerald-600" />
                            </span>
                            <span className="absolute inset-y-0 left-9 flex items-center">
                              <span className="text-emerald-700 text-sm font-medium select-none">+966</span>
                            </span>
                            <input
                              value={(phone || "").replace(/^966/, "")}
                              onChange={(e) => {
                                let v = (e.target.value || "").replace(/\D/g, "");
                                if (v.startsWith("05")) v = v.slice(1);
                                v = v.replace(/^0+/, "");
                                if (v.length > 9) v = v.slice(0, 9);
                                if (v.length > 0 && v[0] !== "5") {
                                  setPhoneErr("Number must start with 5");
                                } else {
                                  setPhoneErr(null);
                                }
                                setPhone(v);
                              }}
                              placeholder="5XXXXXXXX"
                              className="w-full border rounded px-3 pl-20 py-2 outline-none border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              inputMode="numeric"
                              maxLength={9}
                              dir="ltr"
                              aria-invalid={!!phoneErr || !phoneValid}
                              aria-describedby="phone-hint"
                              onKeyDown={(ev) => {
                                if (ev.key === "Enter" && phoneValid && !loading) {
                                  sendOTP();
                                }
                              }}
                            />
                          </div>
                          {phoneErr && <div className="mt-1 text-xs text-red-600">{phoneErr}</div>}
                          {!phoneErr && (
                            <div id="phone-hint" className="mt-1 text-xs text-gray-500">
                              {t("hintPhone")}
                            </div>
                          )}
                          <button
                            onClick={sendOTP}
                            disabled={loading || !phoneValid}
                            aria-disabled={loading || !phoneValid}
                            className="mt-3 w-full h-11 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition-colors disabled:opacity-100 disabled:brightness-95 disabled:saturate-90 disabled:cursor-not-allowed"
                            title={!phoneValid ? t("hintPhone") : undefined}
                          >
                            {loading ? t("sending") : t("send")}
                          </button>
                          <p className="mt-3 text-sm text-gray-700">
                            <a href="/portal/signup" className="underline hover:text-emerald-700">
                              {t("haveNoAccount")}
                            </a>
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-gray-700 mb-2">
                            {t("enterCodeTo")} <span className="font-medium">{phone}</span>
                          </div>
                          <input
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder={t("codePh")}
                            className="tracking-widest text-center text-lg w-full border rounded px-3 py-2 outline-none border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            inputMode="numeric"
                            maxLength={6}
                            onKeyDown={(ev) => {
                              if (ev.key === "Enter" && !loading) {
                                verifyOTP();
                              }
                            }}
                          />
                          <button
                            onClick={verifyOTP}
                            disabled={loading}
                            className="mt-3 w-full h-11 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition-colors disabled:opacity-100 disabled:brightness-95 disabled:saturate-90 disabled:cursor-not-allowed"
                          >
                            {loading ? t("verifying") : t("verify")}
                          </button>
                          <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
                            <button className="underline disabled:no-underline disabled:opacity-50" onClick={sendOTP} disabled={resendTimer > 0 || loading}>
                              {t("resend")} {resendTimer > 0 ? `(${resendTimer}s)` : ""}
                            </button>
                            <a href="/portal/signup" className="underline hover:text-emerald-700">
                              {t("haveNoAccount")}
                            </a>
                          </div>
                        </div>
                      )
                    ) : (
                      // Email & Password method
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
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border rounded px-3 pl-10 py-2 outline-none border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            dir="ltr"
                            onKeyDown={(ev) => {
                              if (ev.key === "Enter" && !loading) loginWithEmailPass();
                            }}
                          />
                        </div>
                        <button
                          onClick={loginWithEmailPass}
                          disabled={loading}
                          className="mt-4 w-full h-11 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition-colors disabled:opacity-100 disabled:brightness-95 disabled:saturate-90 disabled:cursor-not-allowed"
                        >
                          {loading ? t("signingIn") : t("signIn")}
                        </button>
                        <p className="mt-3 text-sm text-gray-700">
                          <a href="/portal/signup" className="underline hover:text-emerald-700">
                            {t("haveNoAccount")}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Global Signup Modal */}
      {showSignupModal && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]" onClick={() => setShowSignupModal(false)} />
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 min-h-screen">
            <div role="dialog" aria-modal="true" aria-labelledby="signup-modal-title" className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl">
              <div className="px-5 py-4 border-b">
                <h2 id="signup-modal-title" className="text-lg font-semibold text-gray-900">{t("noAccountTitle")}</h2>
              </div>
              <div className="px-5 py-4 text-gray-700 text-sm">{t("noAccountBody")}</div>
              <div className="px-5 py-4 flex items-center justify-end gap-2 border-t">
                <button type="button" onClick={() => setShowSignupModal(false)} className="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  {t("cancel")}
                </button>
                <a href="/portal/signup" className="inline-flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2">
                  {t("goToSignup")}
                </a>
              </div>
            </div>
          </div>
        </>
      )}

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

    </div>
  );
}