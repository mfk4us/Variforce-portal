// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Zap } from "lucide-react";
import { Kelly_Slab } from "next/font/google";
const kellySlab = Kelly_Slab({ weight: "400", subsets: ["latin"], display: "swap" });

function BreathingBolt() {
  return (
    <span className="relative inline-flex items-center">
      {/* glow layer */}
      <span className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl animate-breathe" />
      {/* bolt icon */}
      <Zap className="relative w-10 h-10 text-emerald-400 drop-shadow-[0_0_18px_rgba(16,185,129,0.85)] animate-breathe" />
    </span>
  );
}

type Step = "phone" | "code";

type Lang = "en" | "ar" | "ur" | "hi" | "ml" | "bn";

// Lightweight i18n (aligned with signup page)
const i18n: Record<Lang | "zh", any> = {
  en: {
    back: "← Back to website",
    title: "Sign in to VariForce Workspace",
    subtitle: "Use a one‑time code sent to your WhatsApp number",
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
    noAccountBody: "This WhatsApp number is not registered. Please sign up to request access to VariForce Workspace.",
    goToSignup: "Go to Sign up",
    cancel: "Cancel",
    hintPhone: "KSA mobile format: 5XXXXXXXX",
    tagline: "One Team, Many Skills",
    support1: "On‑demand factotum crews.",
    support2: "Built for founders starting from zero and SMEs where outsourcing slows growth.",
  },
  ar: {
    back: "← الرجوع إلى الموقع",
    title: "تسجيل الدخول إلى مساحة عمل VariForce",
    subtitle: "استخدم رمزًا لمرة واحدة يُرسل إلى رقم واتساب الخاص بك",
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
    noAccountBody: "رقم الواتساب هذا غير مسجل. يرجى إنشاء حساب للتقديم على الوصول إلى مساحة عمل VariForce.",
    goToSignup: "اذهب للتسجيل",
    cancel: "إلغاء",
    hintPhone: "تنسيق رقم الجوال السعودي: ‎5XXXXXXXX",
    tagline: "فريق واحد، مهارات متعددة",
    support1: "فرق متعددة المهام عند الطلب.",
    support2: "مصمم للمؤسسين من الصفر وللشركات الصغيرة والمتوسطة حيث يبطئ الاستعانة بمصادر خارجية النمو.",
  },
  ur: {
    back: "← ویب سائٹ پر واپس جائیں",
    title: "VariForce ورک اسپیس میں سائن اِن",
    subtitle: "واٹس ایپ نمبر پر بھیجے گئے ایک وقتی کوڈ کا استعمال کریں",
    waNumber: "واٹس ایپ نمبر",
    phonePh: "9665XXXXXXXX",
    send: "کوڈ بھیجیں",
    sending: "بھیجا جا رہا ہے…",
    enterCodeTo: "چھ ہندسوں کا کوڈ درج کریں بھیجا گیا:",
    codePh: "••••••",
    verify: "تصدیق کریں اور جاری رکھیں",
    verifying: "تصدیق ہو رہی ہے…",
    resend: "کوڈ دوبارہ بھیجیں",
    haveNoAccount: "نئے ہیں؟ اکاؤنٹ بنائیں",
    codeSent: "کوڈ واٹس ایپ پر بھیج دیا گیا۔",
    phoneError: "فون E.164 فارمیٹ میں بغیر + درج کریں (مثلاً 9665XXXXXXXX)",
    codeError: "6 ہندسوں کا کوڈ درج کریں۔",
    noAccountTitle: "کوئی اکاؤنٹ نہیں ملا",
    noAccountBody: "یہ واٹس ایپ نمبر رجسٹرڈ نہیں ہے۔ براہِ کرم VariForce ورک اسپیس تک رسائی کے لیے پہلے سائن اپ کریں۔",
    goToSignup: "سائن اپ پر جائیں",
    cancel: "منسوخ کریں",
    hintPhone: "سعودی موبائل فارمیٹ: ‎5XXXXXXXX",
    tagline: "ایک ٹیم، کئی مہارتیں",
    support1: "طلب پر فیکٹوٹم عملہ۔",
    support2: "ان بانیوں کے لیے جو صفر سے شروع کرتے ہیں اور ایس ایم ایز کے لیے جہاں آؤٹ سورسنگ ترقی کو سست کرتی ہے۔",
  },
  hi: {
    back: "← वेबसाइट पर वापस",
    title: "VariForce वर्कस्पेस में साइन इन",
    subtitle: "WhatsApp पर भेजे गए वन‑टाइम कोड का उपयोग करें",
    waNumber: "व्हाट्सऐप नंबर",
    phonePh: "9665XXXXXXXX",
    send: "कोड भेजें",
    sending: "भेजा जा रहा है…",
    enterCodeTo: "6 अंकों का कोड दर्ज करें भेजा गया:",
    codePh: "••••••",
    verify: "सत्यापित करें और जारी रखें",
    verifying: "सत्यापित हो रहा है…",
    resend: "कोड पुनः भेजें",
    haveNoAccount: "नए हैं? अकाउंट बनाएं",
    codeSent: "कोड WhatsApp पर भेजा गया।",
    phoneError: "फोन E.164 फॉर्मेट में + के बिना लिखें (उदा. 9665XXXXXXXX)",
    codeError: "6 अंकों का कोड दर्ज करें।",
    noAccountTitle: "कोई खाता नहीं मिला",
    noAccountBody: "यह WhatsApp नंबर पंजीकृत नहीं है। कृपया VariForce वर्कस्पेस तक पहुँच के लिए पहले साइन अप करें।",
    goToSignup: "साइन अप पर जाएँ",
    cancel: "रद्द करें",
    hintPhone: "सऊदी मोबाइल प्रारूप: 5XXXXXXXX",
    tagline: "एक टीम, कई कुशलताएँ",
    support1: "ऑन‑डिमांड फैक्टोटम क्रूज़।",
    support2: "उन संस्थापकों और एसएमई के लिए जो शून्य से शुरू कर रहे हैं जहाँ आउटसोर्सिंग विकास को धीमा करती है।",
  },
  ml: {
    back: "← വെബ്സൈറ്റിലേക്കു മടങ്ങുക",
    title: "VariForce വർക്‌സ്‌പേസിൽ സൈൻ ഇൻ ചെയ്യുക",
    subtitle: "വാട്ട്സ്ആപ്പിൽ അയക്കുന്ന ഒരുതവണ കോഡ് ഉപയോഗിക്കുക",
    waNumber: "വാട്ട്സ്ആപ്പ് നമ്പർ",
    phonePh: "9665XXXXXXXX",
    send: "കോഡ് അയയ്ക്കുക",
    sending: "അയക്കുന്നു…",
    enterCodeTo: "അയച്ച 6 അക്ക കോഡ് നൽകുക:",
    codePh: "••••••",
    verify: "സ്ഥിരീകരിച്ച് തുടരുക",
    verifying: "സ്ഥിരീകരിക്കുന്നു…",
    resend: "കോഡ് വീണ്ടും അയയ്ക്കുക",
    haveNoAccount: "പുതിയ ഉപയോക്താവാണോ? അക്കൗണ്ട് സൃഷ്ടിക്കുക",
    codeSent: "കോഡ് വാട്ട്സ്ആപ്പിൽ അയച്ചു.",
    phoneError: "+ ഇല്ലാതെ E.164 ഫോർമാറ്റിൽ ഫോൺ നൽകുക (ഉദാ. 9665XXXXXXXX)",
    codeError: "6 അക്ക കോഡ് നൽകുക.",
    noAccountTitle: "അക്കൗണ്ട് കണ്ടെത്തിയില്ല",
    noAccountBody: "ഈ WhatsApp നമ്പർ രജിസ്റ്റർ ചെയ്തിട്ടില്ല. VariForce വർക്‌സ്‌പേസിലേക്കുള്ള ആക്സസ് ആവശ്യപ്പെടാൻ ദയവായി ആദ്യം സൈൻ അപ്പ് ചെയ്യുക.",
    goToSignup: "സൈൻ അപ്പ് ചെയ്യുക",
    cancel: "റദ്ദാക്കുക",
    hintPhone: "KSA മൊബൈൽ ഫോർമാറ്റ്: 5XXXXXXXX",
    tagline: "ഒന്നുาทีം, പല കഴിവുകൾ",
    support1: "ഓൺ‑ഡിമാൻഡ് ഫാക്ടോട്ടം ടീമുകൾ.",
    support2: "പൂജ്യം മുതൽ തുടങ്ങുന്ന സ്ഥാപകർക്കും ഔട്ട്‌സോഴ്‌സിംഗ് വളർച്ച മന്ദഗതിയാക്കുന്ന എസ്‌എംഇമാർക്കും നിർമ്മിച്ചത്.",
  },
  bn: {
    back: "← ওয়েবসাইটে ফিরে যান",
    title: "VariForce ওয়ার্কস্পেসে সাইন ইন",
    subtitle: "WhatsApp‑এ পাঠানো এক‑বারের কোড ব্যবহার করুন",
    waNumber: "হোয়াটসঅ্যাপ নম্বর",
    phonePh: "9665XXXXXXXX",
    send: "কোড পাঠান",
    sending: "পাঠানো হচ্ছে…",
    enterCodeTo: "৬‑সংখ্যার কোড লিখুন পাঠানো হয়েছে:",
    codePh: "••••••",
    verify: "যাচাই করে এগিয়ে যান",
    verifying: "যাচাই হচ্ছে…",
    resend: "কোড পুনরায় পাঠান",
    haveNoAccount: "নতুন? একটি অ্যাকাউন্ট তৈরি করুন",
    codeSent: "কোড WhatsApp‑এ পাঠানো হয়েছে।",
    phoneError: "+ ছাড়া E.164 ফরম্যাটে ফোন লিখুন (যেমন 9665XXXXXXXX)",
    codeError: "৬‑সংখ্যার কোড লিখুন।",
    noAccountTitle: "কোনও অ্যাকাউন্ট পাওয়া যায়নি",
    noAccountBody: "এই WhatsApp নম্বরটি নিবন্ধিত নয়। VariForce ওয়ার্কস্পেসে অ্যাক্সেসের জন্য আগে সাইন আপ করুন।",
    goToSignup: "সাইন আপ করুন",
    cancel: "বাতিল করুন",
    hintPhone: "সৌদি মোবাইল ফরম্যাট: 5XXXXXXXX",
    tagline: "এক দল, অনেক দক্ষতা",
    support1: "অন-ডিমান্ড ফ্যাক্টোটাম ক্রু।",
    support2: "যারা শূন্য থেকে শুরু করছেন এমন প্রতিষ্ঠাতা এবং যেসব এসএমই-তে আউটসোর্সিং বৃদ্ধি ধীর করে—তাদের জন্য তৈরি।",
  },
  zh: {
    back: "← 返回网站",
    title: "登录 VariForce 工作空间",
    subtitle: "使用发送到 WhatsApp 的一次性验证码登录",
    waNumber: "WhatsApp 号码",
    phonePh: "5XXXXXXXX",
    send: "发送验证码",
    sending: "正在发送…",
    enterCodeTo: "输入发送到以下号码的 6 位验证码",
    codePh: "••••••",
    verify: "验证并继续",
    verifying: "正在验证…",
    resend: "重新发送",
    haveNoAccount: "新用户？创建账号",
    codeSent: "验证码已通过 WhatsApp 发送。",
    phoneError: "请按 E.164 格式输入且不带 +（如：9665XXXXXXXX）",
    codeError: "请输入 6 位验证码。",
    noAccountTitle: "未找到账号",
    noAccountBody: "此 WhatsApp 号码未注册。请先注册以申请访问 VariForce 工作空间。",
    goToSignup: "前往注册",
    cancel: "取消",
    hintPhone: "沙特手机格式：5XXXXXXXX",
    tagline: "一支团队，多种技能",
    support1: "按需多能工团队。",
    support2: "为从零起步的创业者和因外包而放缓增长的中小企业打造。",
  },
};

export default function LoginPage() {
  const [step, setStep] = useState<Step>("phone");
  const [lang, setLang] = useState<Lang>("en");
  // One-time init: prefer ?lang= from URL, then localStorage; also write it back to URL
  useEffect(() => {
    try {
      const supported = ["en","ar","ur","hi","ml","bn","zh"] as const;
      let urlLang = "en";
      if (typeof window !== "undefined") {
        const sp = new URL(window.location.href).searchParams;
        urlLang = (sp.get("lang") || "").toLowerCase();
      }
      const storeLang = (typeof window !== "undefined"
        ? (localStorage.getItem("vf_lang") as Lang | null)
        : null);

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
    } catch {
      // ignore
    }
  }, []);
  const [phone, setPhone] = useState("");
  // phone state keeps the NATIONAL format "5XXXXXXXX" for UI; we normalize to "9665XXXXXXXX" for API calls.
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const phoneNational = (phone || "").replace(/^966/, "");
  const phoneValid = /^5\d{8}$/.test(phoneNational);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const t = (k: keyof typeof i18n["en"]) => (i18n[lang] as any)[k] ?? (i18n.en as any)[k] ?? k;
  const isRTL = lang === "ar" || lang === "ur";
  const dir = isRTL ? "rtl" : "ltr";
  const heroContainerCls = isRTL
    ? "hidden md:flex flex-col justify-center items-start text-left w-full md:order-2"
    : "hidden md:flex flex-col justify-center items-end text-right w-full md:order-1";
  const pushCls = isRTL ? "mr-auto" : "ml-auto";
  const cardOrderCls = isRTL ? "md:order-1" : "md:order-2";

  useEffect(() => {
    if (resendTimer <= 0) return;
    const tm = setInterval(() => setResendTimer((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(tm);
  }, [resendTimer]);

  async function sendOTP() {
    setErr(null); 
    setMsg(null);

    // --- Normalize phone to 9665XXXXXXXX (12 digits, no plus) ---
    let normalized = (phone || "").replace(/\D/g, "");
    if (normalized.startsWith("05")) normalized = normalized.slice(1);
    normalized = normalized.replace(/^0+/, "");
    if (!normalized.startsWith("966")) normalized = "966" + normalized;

    // Client-side validation
    if (!/^9665\d{8}$/.test(normalized)) {
      setErr("Phone must start with 5 and be 9 digits long.");
      return;
    }

    setLoading(true);
    try {
      // Optional pre-check in DB: only block if explicitly rejected/pending; otherwise proceed.
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from("profiles")
            .select("status")
            .eq("phone", normalized)
            .single();

          // If table exists but row doesn't, let the flow continue to show the signup modal after request
          if (error && error.code && error.code !== "PGRST116") {
            // Unknown table/DB error should not block sending the OTP; log it and continue
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

      // --- Call OTP API route ---
      const r = await fetch(`/api/wa/send-otp?lang=${encodeURIComponent(lang)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized }),
      });

      // Attempt to parse JSON safely
      let j: any = null;
      try { j = await r.json(); } catch { /* ignore parse errors */ }

      if (!r.ok) {
        // Better diagnostics to help fix env / route problems
        if (r.status === 404) {
          setErr("OTP service not found. Ensure `/app/api/wa/send-otp/route.ts` exists and the app has been rebuilt.");
        } else if (r.status === 401 || r.status === 403) {
          setErr("OTP service is unauthorized. Check META_WHATSAPP_TOKEN and related env vars.");
        } else {
          setErr(j?.message || j?.error || `Failed to send code (HTTP ${r.status}).`);
        }
        console.error("send-otp error:", r.status, j);
        setLoading(false);
        return;
      }

      // Success
      const resendIn = (j && typeof j.resend_in === "number") ? j.resend_in : 60;
      setMsg(t("codeSent"));
      setStep("code");
      setResendTimer(resendIn);

      // Keep a copy of normalized phone in state (for verify step if needed)
      setPhone(normalized.replace(/^966/, "")); // keep UI showing national format 5XXXXXXXX
    } catch (e: any) {
      console.error("sendOTP exception:", e);
      setErr(e?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTP() {
    setErr(null); setMsg(null);
    const c = (code || "").replace(/\D/g, "").slice(0, 6);
    if (!/^\d{6}$/.test(c)) { setErr(t("codeError")); return; }
    // Normalize and validate KSA phone (9665 + 8 digits)
    let normalized = (phone || "").replace(/\D/g, "");
    if (normalized.startsWith("05")) normalized = normalized.slice(1);
    normalized = normalized.replace(/^0+/, "");
    if (!normalized.startsWith("966")) normalized = "966" + normalized;
    if (!/^9665\d{8}$/.test(normalized)) { setErr("Phone must start with 5 and be 9 digits long."); setLoading(false); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/wa/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, code: c }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.message || j?.error || "Invalid code");
      // Account approval gating
      const sb = supabase;
      if (sb) {
        const { data, error } = await sb
          .from("profiles")
          .select("status")
          .eq("phone", normalized)
          .maybeSingle();
        if (error) throw new Error(error.message);
        if (!data) {
          // no row means the number is not registered
          setShowSignupModal(true);
          setLoading(false);
          return;
        }
        if (data.status === "pending") throw new Error("Your account is under review.");
        if (data.status === "rejected") throw new Error("Your application was not approved. Contact support.");
        // Only approved passes through
      }
      // Cookie is set on the server; go to portal
      window.location.href = "/portal/create-project";
    } catch (e: any) {
      setErr(e.message || "Verification failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden overflow-y-hidden" dir={dir} data-lang={lang} suppressHydrationWarning>
      {/* Background: signup style */}
      <video
        className="pointer-events-none fixed inset-0 w-full h-full object-cover z-0"
        src="/bg/fieldwork.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="fixed inset-0 z-0 bg-emerald-50/80" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(60%_40%_at_20%_20%,rgba(16,185,129,0.12),transparent),radial-gradient(50%_40%_at_80%_0%,rgba(6,182,212,0.12),transparent)]" />

      {/* Header with brand + language switcher (mirrors signup) */}
      <header className="fixed inset-x-0 top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <a href="/partners" className="inline-flex items-center gap-3 group" dir="ltr">
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
              onChange={(e)=>{ 
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
          {/* Use signup hero style */}
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
          {/* Right: signin card (mirrors signup glass card) */}
          <section className={`flex justify-center ${cardOrderCls}`}>
            <div className="w-full max-w-md sm:max-w-lg">
              <div className="relative isolate overflow-hidden rounded-3xl border border-emerald-200 bg-white/95 backdrop-blur-xl shadow-lg">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.08),transparent_32%)]" />
                <div className="relative z-10 p-4 sm:p-5 mx-auto w-full">
                  {/* Back inside the card */}
                  <a href="/partners" className="mb-2 inline-flex items-center text-sm text-emerald-700 hover:text-emerald-900">{t("back")}</a>
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{t("title")}</h1>
                  <p className="text-sm text-gray-700 max-w-2xl mt-1">{t("subtitle")}</p>
                  {/* Flash messages */}
                  {msg && <div className="mt-4 rounded bg-green-50 text-green-700 text-sm px-3 py-2">{msg}</div>}
                  {err && <div className="mt-4 rounded bg-red-50 text-red-700 text-sm px-3 py-2">{err}</div>}
                  {/* FORM (existing step switch kept intact) */}
                  <div className="mt-4">
                    {/* keep the exact JSX that renders step === "phone" or "code" (already in this file) */}
                    {/* BEGIN keep */}
                    {step === "phone" ? (
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">{t("waNumber")}</label>
                        <div className="relative">
                          {/* WhatsApp icon */}
                          <span className="absolute inset-y-0 left-3 grid place-items-center">
                            <img src="/whatsapp.svg" alt="WhatsApp" className="h-5 w-5 tint-emerald-600" />
                          </span>
                          {/* Fixed +966 prefix */}
                          <span className="absolute inset-y-0 left-9 flex items-center">
                            <span className="text-emerald-700 text-sm font-medium select-none">+966</span>
                          </span>
                          <input
                            value={(phone || "").replace(/^966/, "")}
                            onChange={(e)=>{
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
                            onKeyDown={(ev)=>{ if(ev.key==='Enter' && phoneValid && !loading){ sendOTP(); } }}
                          />
                        </div>
                        {phoneErr && <div className="mt-1 text-xs text-red-600">{phoneErr}</div>}
                        {!phoneErr && <div id="phone-hint" className="mt-1 text-xs text-gray-500">{t("hintPhone")}</div>}
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
                          <a href="/portal/signup" className="underline hover:text-emerald-700">{t("haveNoAccount")}</a>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-700 mb-2">{t("enterCodeTo")} <span className="font-medium">{phone}</span></div>
                        <input
                          value={code}
                          onChange={(e)=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}
                          placeholder={t("codePh")}
                          className="tracking-widest text-center text-lg w-full border rounded px-3 py-2 outline-none border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          inputMode="numeric"
                          maxLength={6}
                          onKeyDown={(ev)=>{ if(ev.key==='Enter' && !loading){ verifyOTP(); } }}
                        />
                        <button
                          onClick={verifyOTP}
                          disabled={loading}
                          className="mt-3 w-full h-11 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition-colors disabled:opacity-100 disabled:brightness-95 disabled:saturate-90 disabled:cursor-not-allowed"
                        >
                          {loading ? t("verifying") : t("verify")}
                        </button>
                        <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
                          <button
                            className="underline disabled:no-underline disabled:opacity-50"
                            onClick={sendOTP}
                            disabled={resendTimer > 0 || loading}
                          >
                            {t("resend")} {resendTimer > 0 ? `(${resendTimer}s)` : ""}
                          </button>
                          <a href="/portal/signup" className="underline hover:text-emerald-700">{t("haveNoAccount")}</a>
                        </div>
                      </div>
                    )}
                    {/* END keep */}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Global Signup Modal (rendered outside card to avoid clipping) */}
      {showSignupModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
            onClick={() => setShowSignupModal(false)}
          />
          {/* Modal */}
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 min-h-screen">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="signup-modal-title"
              className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl"
            >
              <div className="px-5 py-4 border-b">
                <h2 id="signup-modal-title" className="text-lg font-semibold text-gray-900">{t("noAccountTitle")}</h2>
              </div>
              <div className="px-5 py-4 text-gray-700 text-sm">
                {t("noAccountBody")}
              </div>
              <div className="px-5 py-4 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowSignupModal(false)}
                  className="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {t("cancel")}
                </button>
                <a
                  href="/portal/signup"
                  className="inline-flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2"
                >
                  {t("goToSignup")}
                </a>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Footer (icons from /public) */}
      <footer className="absolute bottom-0 w-full z-10 border-t border-white/20 bg-black/40 backdrop-blur-sm text-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="text-xs">
            © 2025 Brightness of Creativity (BOCC) — All rights reserved.{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-emerald-400">Privacy</a>
            {" • "}
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
    {/* Signup global styles for bolt/glow/tint */}
    <style jsx global>{`
.bolt-text{background:linear-gradient(90deg,#22c55e,#06b6d4,#22c55e);-webkit-background-clip:text;background-clip:text;color:transparent;background-size:200% 100%;animation:bolt-shimmer 4s linear infinite;text-shadow:0 0 14px rgba(34,197,94,.45),0 0 28px rgba(6,182,212,.35)}
@keyframes bolt-shimmer{0%{background-position:0% 50%}100%{background-position:200% 50%}}
.bolt-breathe{animation:bolt-breathe 2.6s ease-in-out infinite;will-change:transform,filter}
.glow-breathe{animation:glow-breathe 3.2s ease-in-out infinite}
@keyframes glow-breathe{0%,100%{opacity:.22}50%{opacity:.5}}
@keyframes bolt-breathe{0%,100%{transform:translateY(0) scale(1);opacity:.55;filter:drop-shadow(0 0 8px rgba(16,185,129,.35))}50%{transform:translateY(-1px) scale(1.03);opacity:.98;filter:drop-shadow(0 0 18px rgba(16,185,129,.75))}}
@keyframes breathe{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.15);opacity:.95}}
.animate-breathe{animation:breathe 2.2s ease-in-out infinite;will-change:transform,opacity}
.tint-emerald-600{filter:invert(41%) sepia(84%) saturate(470%) hue-rotate(119deg) brightness(92%) contrast(96%)}
    `}</style>
    </div>
  );
}