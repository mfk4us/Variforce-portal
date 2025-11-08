/* eslint-disable @typescript-eslint/no-use-before-define */
"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
const { useState, useEffect } = React;
import { createClient } from "@supabase/supabase-js";
import { Zap } from "lucide-react";

import { Kelly_Slab } from "next/font/google";
const variforceFont = Kelly_Slab({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-variforce",
});

function getSupabase() {
  if (typeof window === "undefined") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const i18n = {
  en: {
    back: "← Back to website",
    title: "Get started with us",
    subtitle: "Sign up with WhatsApp OTP, then set up your company profile",
    waNumber: "WhatsApp number",
    sendCode: "Send code",
    byContinue: "By continuing, you agree to the",
    terms: "Terms",
    privacy: "Privacy",
    enterCodeTo: "Enter the 6-digit code sent to",
    verifying: "Verifying…",
    verifyContinue: "Verify & continue",
    resend: "Resend code",
    haveAccount: "Have an account? Log in",
    companyProfile: "Company profile",
    companyName: "Company name *",
    contactPerson: "Contact person *",
    email: "Email",
    city: "City",
    cr: "Commercial Registration (CR)",
    vat: "VAT Number",
    uploadCr: "Upload CR PDF",
    uploadVat: "Upload VAT PDF",
    industry: "Industry",
    primaryLanguage: "Primary language",
    rateBook: "Create a starter ",
    rateBookBold: "Rate Book",
    rateBookTail: " with my hot tasks (recommended)",
    acceptTerms: "I accept the Terms & Privacy and confirm VAT/CR details are correct if provided.",
    save: "Save & continue",
    codeSent: "Code sent on WhatsApp.",
    verified: "Verified! Let’s set up your company profile…",
    submitted: "Application submitted. We’ll review your details and approve eligible partner accounts.",
    underReview: "Your account is under review. You’ll be able to log in once approved.",
    errPhone: "Enter phone in E.164 without + (e.g., 9665XXXXXXXX).",
    errCode: "Enter the 6-digit code.",
    errCompany: "Please enter your company name.",
    errContact: "Please enter a contact name.",
    errAccept: "Please accept the Terms & Privacy to continue.",
    tagline: "One Team, Many Skills",
    support1: "On‑demand factotum crews.",
    support2: "Built for founders starting from zero and SMEs where outsourcing is slowing growth.",
  },
  ar: {
    back: "← الرجوع إلى الموقع",
    title: "ابدأ معنا",
    subtitle: "سجّل عبر واتساب OTP ثم أكمل ملف شركتك",
    waNumber: "رقم الواتساب",
    sendCode: "إرسال الرمز",
    byContinue: "بالمتابعة، أنت توافق على",
    terms: "الشروط",
    privacy: "الخصوصية",
    enterCodeTo: "أدخل الرمز المكوّن من 6 أرقام المرسل إلى",
    verifying: "جارٍ التحقق…",
    verifyContinue: "تحقق وتابع",
    resend: "إعادة إرسال الرمز",
    haveAccount: "لديك حساب؟ سجّل الدخول",
    companyProfile: "ملف الشركة",
    companyName: "اسم الشركة *",
    contactPerson: "الشخص المسؤول *",
    email: "البريد الإلكتروني",
    city: "المدينة",
    cr: "السجل التجاري (CR)",
    vat: "الرقم الضريبي",
    uploadCr: "رفع سجل تجاري PDF",
    uploadVat: "رفع شهادة ضريبة PDF",
    industry: "النشاط",
    primaryLanguage: "اللغة الأساسية",
    rateBook: "إنشاء ",
    rateBookBold: "دفتر أسعار",
    rateBookTail: " بالمهام الشائعة (مستحسن)",
    acceptTerms: "أوافق على الشروط والخصوصية وأؤكد صحة بيانات السجل/الضريبة إن وُجدت.",
    save: "حفظ ومتابعة",
    codeSent: "تم إرسال الرمز على واتساب.",
    verified: "تم التحقق! لنكمل إعداد ملف الشركة…",
    submitted: "تم استلام طلبك. سنراجع التفاصيل ونوافق الحسابات المؤهلة للشراكة.",
    underReview: "حسابك قيد المراجعة. ستتمكن من تسجيل الدخول بعد الموافقة.",
    errPhone: "أدخل الرقم بصيغة E.164 بدون + (مثال: 9665XXXXXXXX).",
    errCode: "أدخل الرمز المكوّن من 6 أرقام.",
    errCompany: "يرجى إدخال اسم الشركة.",
    errContact: "يرجى إدخال اسم المسؤول.",
    errAccept: "يرجى الموافقة على الشروط والخصوصية للمتابعة.",
    tagline: "فريق واحد، مهارات متعددة",
    support1: "فرق متعددة المهام عند الطلب.",
    support2: "مصمم للمؤسسين من الصفر وللشركات الصغيرة والمتوسطة حيث يبطئ الاستعانة بمصادر خارجية النمو.",
  },
  ur: {
    back: "← ویب سائٹ پر واپس جائیں",
    title: "ہمارے ساتھ آغاز کریں",
    subtitle: "واٹس ایپ OTP سے سائن اپ کریں، پھر کمپنی پروفائل مکمل کریں",
    waNumber: "واٹس ایپ نمبر",
    sendCode: "کوڈ بھیجیں",
    byContinue: "جاری رکھنے سے آپ متفق ہیں",
    terms: "شرائط",
    privacy: "رازداری",
    enterCodeTo: "چھ ہندسوں کا کوڈ درج کریں بھیجا گیا:",
    verifying: "تصدیق ہو رہی ہے…",
    verifyContinue: "تصدیق کریں اور آگے بڑھیں",
    resend: "کوڈ دوبارہ بھیجیں",
    haveAccount: "اکاؤنٹ ہے؟ لاگ ان کریں",
    companyProfile: "کمپنی پروفائل",
    companyName: "کمپنی کا نام *",
    contactPerson: "رابطہ شخص *",
    email: "ای میل",
    city: "شہر",
    cr: "کمرشل رجسٹریشن (CR)",
    vat: "وی اے ٹی نمبر",
    uploadCr: "سی آر PDF اپ لوڈ کریں",
    uploadVat: "وی اے ٹی PDF اپ لوڈ کریں",
    industry: "انڈسٹری",
    primaryLanguage: "بنیادی زبان",
    rateBook: "ابتدائی ",
    rateBookBold: "ریٹ بُک",
    rateBookTail: " بنائیں (سفارش کردہ)",
    acceptTerms: "میں شرائط و رازداری سے اتفاق کرتا/کرتی ہوں۔",
    save: "محفوظ کریں اور آگے بڑھیں",
    codeSent: "کوڈ واٹس ایپ پر بھیج دیا گیا۔",
    verified: "تصدیق ہو گئی! کمپنی پروفائل مکمل کریں…",
    submitted: "درخواست موصول ہو گئی۔ ہم تفصیلات کا جائزہ لے کر اہل اکاؤنٹس کو منظور کریں گے.",
    underReview: "آپ کا اکاؤنٹ نظرِ ثانی میں ہے۔ منظوری کے بعد لاگ ان ممکن ہوگا.",
    errPhone: "فون E.164 فارمیٹ میں بغیر + درج کریں (مثلاً 9665XXXXXXXX)",
    errCode: "6 ہندسوں کا کوڈ درج کریں۔",
    errCompany: "براہِ کرم کمپنی نام درج کریں۔",
    errContact: "براہِ کرم رابطہ نام درج کریں۔",
    errAccept: "براہِ کرم شرائط و رازداری قبول کریں۔",
    tagline: "ایک ٹیم، کئی مہارتیں",
    support1: "مطالبہ پر فیکٹوٹم عملہ۔",
    support2: "ان بانیوں کے لیے جو صفر سے آغاز کر رہے ہیں، اور اُن ایس ایم ایز کے لیے جہاں آؤٹ سورسنگ ترقی کو سست کر دیتی ہے۔",
  },
  hi: {
    back: "← वेबसाइट पर वापस",
    title: "हमारे साथ शुरू करें",
    subtitle: "WhatsApp OTP से साइन अप करें और कंपनी प्रोफ़ाइल सेट करें",
    waNumber: "व्हाट्सऐप नंबर",
    sendCode: "कोड भेजें",
    byContinue: "आगे बढ़ने पर आप सहमत हैं",
    terms: "नियम",
    privacy: "गोपनीयता",
    enterCodeTo: "6 अंकों का कोड दर्ज करें भेजा गया:",
    verifying: "सत्यापित हो रहा है…",
    verifyContinue: "सत्यापित करें और जारी रखें",
    resend: "कोड पुनः भेजें",
    haveAccount: "अकाउंट है? लॉगिन करें",
    companyProfile: "कंपनी प्रोफ़ाइल",
    companyName: "कंपनी का नाम *",
    contactPerson: "सम्पर्क व्यक्ति *",
    email: "ईमेल",
    city: "शहर",
    cr: "कॉमर्शियल रजिस्ट्रेशन (CR)",
    vat: "वैट नंबर",
    uploadCr: "CR PDF अपलोड करें",
    uploadVat: "VAT PDF अपलोड करें",
    industry: "उद्योग",
    primaryLanguage: "प्राथमिक भाषा",
    rateBook: "स्टार्टर ",
    rateBookBold: "रेट बुक",
    rateBookTail: " बनाएं (अनुशंसित)",
    acceptTerms: "मैं नियम व गोपनीयता से सहमत हूँ।",
    save: "सेव करें और आगे बढ़ें",
    codeSent: "कोड WhatsApp पर भेजा गया।",
    verified: "सत्यापित! अब कंपनी प्रोफ़ाइल सेट करें…",
    submitted: "अनुरोध प्राप्त। हम विवरण की समीक्षा कर पात्र पार्टनर अकाउंट्स को स्वीकृत करेंगे.",
    underReview: "आपका अकाउंट समीक्षा में है। स्वीकृति के बाद लॉगिन संभव होगा.",
    errPhone: "फोन E.164 फॉर्मेट में + के बिना लिखें (उदा. 9665XXXXXXXX)",
    errCode: "6 अंकों का कोड दर्ज करें।",
    errCompany: "कंपनी का नाम दर्ज करें।",
    errContact: "सम्पर्क नाम दर्ज करें।",
    errAccept: "कृपया नियम व गोपनीयता स्वीकार करें।",
    tagline: "एक टीम, अनेक कौशल",
    support1: "ऑन‑डिमांड फेक्टोटम क्रू।",
    support2: "शून्य से शुरू करने वाले संस्थापकों और एसएमई के लिए जहाँ आउटसोर्सिंग विकास को धीमा करती है।",
  },
  ml: {
    back: "← വെബ്സൈറ്റിലേക്കു മടങ്ങുക",
    title: "ഞങ്ങളോടൊപ്പം ആരംഭിക്കുക",
    subtitle: "WhatsApp OTP ഉപയോഗിച്ച് സൈൻ അപ് ചെയ്ത് കമ്പനി പ്രൊഫൈൽ സജ്ജമാക്കുക",
    waNumber: "വാട്ട്സ്ആപ്പ് നമ്പർ",
    sendCode: "കോഡ് അയയ്ക്കുക",
    byContinue: "തുടരുന്നതിലൂടെ നിങ്ങൾ സമ്മതിക്കുന്നു",
    terms: "നിബന്ധനകൾ",
    privacy: "സ്വകാര്യത",
    enterCodeTo: "അയച്ച 6 അക്ക കോഡ് നൽകുക:",
    verifying: "സ്ഥിരീകരിക്കുന്നു…",
    verifyContinue: "സ്ഥിരീകരിച്ച് തുടരുക",
    resend: "കോഡ് വീണ്ടും അയക്കുക",
    haveAccount: "അക്കൗണ്ട് ഉണ്ടോ? ലോഗിൻ ചെയ്യുക",
    companyProfile: "കമ്പനി പ്രൊഫൈൽ",
    companyName: "കമ്പനിയുടെ പേര് *",
    contactPerson: "ബന്ധപ്പെടേണ്ട kişi *",
    email: "ഇമെയിൽ",
    city: "നഗരം",
    cr: "കോമേഴ്ഷ്യൽ രജിസ്ട്രേഷൻ (CR)",
    vat: "വാറ്റ് നമ്പർ",
    uploadCr: "CR PDF അപ്‌ലോഡ് ചെയ്യുക",
    uploadVat: "VAT PDF അപ്‌ലോഡ് ചെയ്യുക",
    industry: "ഇന്ത്യസ്ട്രി",
    primaryLanguage: "പ്രാഥമിക ഭാഷ",
    rateBook: "സ്റ്റാർട്ടർ ",
    rateBookBold: "റേറ്റ് ബുക്ക്",
    rateBookTail: " സൃഷ്ടിക്കുക (പരാമർശനം)",
    acceptTerms: "ഞാൻ നിബന്ധനകളും സ്വകാര്യതയും അംഗീകരിക്കുന്നു.",
    save: "സേവ് ചെയ്ത് തുടരുക",
    codeSent: "കോഡ് വാട്ട്സ്ആപ്പിൽ അയച്ചു.",
    verified: "സ്ഥിരീകരിച്ചു! കമ്പനി പ്രൊഫൈൽ സജ്ജമാക്കാം…",
    submitted: "അപേക്ഷ ലഭിച്ചു. യോഗ്യമായ അക്കൗണ്ടുകൾ ഞങ്ങൾ അവലോകനം ചെയ്ത് അംഗീകരിക്കും.",
    underReview: "നിങ്ങളുടെ അക്കൗണ്ട് അവലോകനത്തിലാണ്. അംഗീകരണത്തിന് ശേഷം ലോഗിൻ ചെയ്യാം.",
    errPhone: "+ ഇല്ലാതെ E.164 ഫോർമാറ്റിൽ ഫോൺ നൽകുക (ഉദാ. 9665XXXXXXXX)",
    errCode: "6 അക്ക കോഡ് നൽകുക.",
    errCompany: "കമ്പനി പേര് നൽകുക.",
    errContact: "ബന്ധപ്പെടേണ്ട പേര് നൽകുക.",
    errAccept: "ദയവായി നിബന്ധനകളും സ്വകാര്യതയും അംഗീകരിക്കുക.",
    tagline: "ഒരു ടീം, നിരവധി കഴിവുകൾ",
    support1: "ആവശ്യാനുസരണം ഫാക്ടോട്ടം ടീമുകൾ.",
    support2: "ശൂന്യത്തിൽ നിന്ന് ആരംഭിക്കുന്ന സ്ഥാപകരുടെയും ഔട്ട്‌സോഴ്സിംഗ് വളർച്ച മന്ദഗതിയിലാക്കുന്ന SME കളുടെയും വേണ്ടി നിർമ്മിച്ചത്.",
  },
  bn: {
    back: "← ওয়েবসাইটে ফিরে যান",
    title: "আমাদের সাথে শুরু করুন",
    subtitle: "WhatsApp OTP দিয়ে সাইন আপ করে কোম্পানি প্রোফাইল সেট করুন",
    waNumber: "হোয়াটসঅ্যাপ নম্বর",
    sendCode: "কোড পাঠান",
    byContinue: "অগ্রসর হলে আপনি সম্মত হচ্ছেন",
    terms: "শর্তাবলী",
    privacy: "গোপনীয়তা",
    enterCodeTo: "৬-সংখ্যার কোড লিখুন পাঠানো হয়েছে:",
    verifying: "যাচাই হচ্ছে…",
    verifyContinue: "যাচাই করে এগিয়ে যান",
    resend: "কোড পুনরায় পাঠান",
    haveAccount: "অ্যাকাউন্ট আছে? লগইন করুন",
    companyProfile: "কোম্পানি প্রোফাইল",
    companyName: "কোম্পানির নাম *",
    contactPerson: "যোগাযোগ ব্যক্তি *",
    email: "ইমেইল",
    city: "শহর",
    cr: "কমার্শিয়াল রেজিস্ট্রেশন (CR)",
    vat: "ভ্যাট নম্বর",
    uploadCr: "CR PDF আপলোড করুন",
    uploadVat: "VAT PDF আপলোড করুন",
    industry: "ইন্ডাস্ট্রি",
    primaryLanguage: "প্রাথমিক ভাষা",
    rateBook: "স্টার্টার ",
    rateBookBold: "রেট বুক",
    rateBookTail: " তৈরি করুন (প্রস্তাবিত)",
    acceptTerms: "আমি শর্তাবলী ও গোপনীয়তায় সম্মত।",
    save: "সেভ করে এগিয়ে যান",
    codeSent: "কোড WhatsApp-এ পাঠানো হয়েছে।",
    verified: "যাচাই সম্পন্ন! এখন প্রোফাইল সেট করুন…",
    submitted: "আবেদন গ্রহণ করা হয়েছে। আমরা বিস্তারিত পর্যালোচনা করে যোগ্য পার্টনার অ্যাকাউন্ট অনুমোদন করব.",
    underReview: "আপনার অ্যাকাউন্ট পর্যালোচনাধীন। অনুমোদনের পর লগইন করা যাবে.",
    errPhone: "+ ছাড়া E.164 ফরম্যাটে ফোন লিখুন (যেমন 9665XXXXXXXX)",
    errCode: "৬-সংখ্যার কোড লিখুন।",
    errCompany: "কোম্পানির নাম লিখুন।",
    errContact: "যোগাযোগের নাম লিখুন।",
    errAccept: "দয়া করে শর্তাবলী ও গোপনীয়তা মেনে নিন।",
    tagline: "এক দল, অনেক দক্ষতা",
    support1: "চাহিদা অনুযায়ী ফ্যাকটোটাম ক্রু।",
    support2: "শূন্য থেকে শুরু করা প্রতিষ্ঠাতা এবং এসএমইদের জন্য যেখানে আউটসোর্সিং বৃদ্ধি ধীর করে দেয়।",
  },
  zh: {
    back: "← 返回网站",
    title: "立即开始",
    subtitle: "使用 WhatsApp 验证码注册，然后完善公司信息",
    waNumber: "WhatsApp 号码",
    sendCode: "发送验证码",
    byContinue: "继续即表示同意",
    terms: "条款",
    privacy: "隐私",
    enterCodeTo: "输入发送到以下号码的 6 位验证码",
    verifying: "正在验证…",
    verifyContinue: "验证并继续",
    resend: "重新发送",
    haveAccount: "已有账号？登录",
    companyProfile: "公司资料",
    companyName: "公司名称 *",
    contactPerson: "联系人 *",
    email: "邮箱",
    city: "城市",
    cr: "商业登记号 (CR)",
    vat: "增值税号",
    uploadCr: "上传 CR PDF",
    uploadVat: "上传 VAT PDF",
    industry: "行业",
    primaryLanguage: "首选语言",
    rateBook: "创建 ",
    rateBookBold: "价格手册",
    rateBookTail: "（常用任务，推荐）",
    acceptTerms: "我同意条款与隐私，并确认所填 VAT/CR 信息准确无误（如提供）。",
    save: "保存并继续",
    codeSent: "验证码已通过 WhatsApp 发送。",
    verified: "验证成功！现在完善公司资料…",
    submitted: "已提交。我们将审核信息并批准符合条件的合作伙伴账号。",
    underReview: "账号正在审核，批准后即可登录。",
    errPhone: "请按 E.164 格式输入号码且不带 +（例如：9665XXXXXXXX）。",
    errCode: "请输入 6 位验证码。",
    errCompany: "请输入公司名称。",
    errContact: "请输入联系人姓名。",
    errAccept: "请同意条款与隐私以继续。",
    tagline: "一支团队，多种技能",
    support1: "按需提供多能工团队。",
    support2: "为从零起步的创始人与外包拖慢增长的中小企业而构建。",
  },
} as const;
const RTL = new Set(["ar","ur"]);

type CompanyProfile = {
  companyName: string;
  contactName: string;
  email: string;
  industry: string;
  crNumber: string;
  vatNumber: string;
  city: string;
  primaryLanguage: "en" | "ar" | "ur" | "hi" | "ml" | "bn" | "zh";
  wantRateBook: boolean;
  acceptTerms: boolean;
};
const initialProfile: CompanyProfile = {
  companyName: "",
  contactName: "",
  email: "",
  industry: "",
  crNumber: "",
  vatNumber: "",
  city: "",
  primaryLanguage: "en",
  wantRateBook: true,
  acceptTerms: false
};

export default function SignupPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const sp = React.use(searchParams);
  const initialLangFromURL = (sp?.lang as any) ?? "en";
  const [lang, setLang] = useState<"en"|"ar"|"ur"|"hi"|"ml"|"bn"|"zh">(initialLangFromURL as any);
  const t = (k: keyof typeof i18n["en"]) => (i18n[lang] as any)[k] ?? (i18n.en as any)[k] ?? k;
  const dir = RTL.has(lang) ? "rtl" : "ltr";
  const isRTL = RTL.has(lang);
  useEffect(() => {
    if (typeof window === "undefined") return;
    // On first mount, if URL has no lang but localStorage does, adopt it and push to URL
    const url = new URL(window.location.href);
    const urlLang = url.searchParams.get("lang");
    const saved = window.localStorage.getItem("vf_lang");
    if (!urlLang && saved && saved !== lang) {
      setLang(saved as any);
      url.searchParams.set("lang", saved);
      window.history.replaceState({}, "", url.toString());
      return; // let next effect persist
    }
    // Persist current lang and keep URL in sync
    try { window.localStorage.setItem("vf_lang", lang); } catch {}
    url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url.toString());
  }, [lang]);
  const [step, setStep] = useState<"phone"|"code"|"company">("phone");
  const [phone, setPhone] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("last_phone") || "";
  });
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [phoneErr, setPhoneErr] = useState<string|null>(null);

  const [profile, setProfile] = useState<CompanyProfile>(initialProfile);

  // ---- Supabase Storage (CR/VAT) ----
  const [crUploading, setCrUploading] = useState(false);
  const [vatUploading, setVatUploading] = useState(false);
  const [crPath, setCrPath] = useState<string | null>(null);
  const [vatPath, setVatPath] = useState<string | null>(null);
  const [crUploadErr, setCrUploadErr] = useState<string | null>(null);
  const [vatUploadErr, setVatUploadErr] = useState<string | null>(null);
  const [crFile, setCrFile] = useState<File | null>(null);
  const [vatFile, setVatFile] = useState<File | null>(null);
  const [crFieldErr, setCrFieldErr] = useState<string | null>(null);
  const [vatFieldErr, setVatFieldErr] = useState<string | null>(null);

  const normalizedPhone = (phone || "").replace(/\D/g, "");

  // Queue a PDF file for later upload (on final submit). Actual upload happens in submitCompanyProfile().
  function queuePdf(kind: "cr" | "vat", file: File) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      (kind === "cr" ? setCrUploadErr : setVatUploadErr)("Only PDF allowed");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      (kind === "cr" ? setCrUploadErr : setVatUploadErr)("Max 25MB");
      return;
    }
    // Clear any previous error and store the file for submit
    (kind === "cr" ? setCrUploadErr : setVatUploadErr)(null);
    if (kind === "cr") {
      setCrFile(file);
      setCrPath(null); // visual hint: will upload on Submit
    } else {
      setVatFile(file);
      setVatPath(null);
    }
  }

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  async function sendOTP() {
    setErr(null); setMsg(null);
    let normalized = (phone || "").replace(/\D/g, "");
    // Auto remove leading 0 if user types 05...
    if (normalized.startsWith("05")) normalized = normalized.slice(1);
    // Ensure it always starts with country code 966
    if (!normalized.startsWith("966")) normalized = "966" + normalized;
    if (!/^9665\d{8}$/.test(normalized)) {
      setErr("Phone must start with 5 and be 9 digits long.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`/api/wa/send-otp?lang=${lang}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed to send code");
      setPhone(normalized);
      setMsg(t("codeSent"));
      setStep("code");
      setResendTimer(j?.resend_in ?? 60);
    } catch (e:any) {
      setErr(e.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTP() {
    setErr(null); setMsg(null);
    const normalizedCode = (code || "").replace(/\D/g, "").slice(0,6);
    if (!/^\d{6}$/.test(normalizedCode)) { setErr(t("errCode")); return; }
    // Normalize phone
    let normalized = (phone || "").replace(/\D/g, "");
    if (normalized.startsWith("05")) normalized = normalized.slice(1);
    if (!normalized.startsWith("966")) normalized = "966" + normalized;
    // Enforce KSA mobile format: 9665 + 8 digits (total 12 digits)
    if (!/^9665\d{8}$/.test(normalized)) {
      setErr("Phone must start with 5 and be 9 digits long.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/wa/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, code: normalizedCode })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Invalid code");
      setMsg(t("verified"));
      setStep("company");
      try { window.localStorage.setItem("last_phone", normalized); } catch {}
    } catch (e:any) {
      setErr(e.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  // Server-side submission (Option B): expects app/api/partners/submit/route.ts to exist
  // and handle storage uploads + DB upsert with the Supabase Service Role.
  async function submitCompanyProfile() {
    setErr(null); setMsg(null);

    // Basic validation
    if (!profile.companyName.trim()) { setErr(t("errCompany")); return; }
    if (!profile.contactName.trim()) { setErr(t("errContact")); return; }
    if (!profile.acceptTerms) { setErr(t("errAccept")); return; }

    // Normalize phone to E.164 without '+', enforce 9665XXXXXXXX
    let normalizedPhone = (phone || "").replace(/\D/g, "");
    if (normalizedPhone.startsWith("05")) normalizedPhone = normalizedPhone.slice(1);
    if (!normalizedPhone.startsWith("966")) normalizedPhone = "966" + normalizedPhone;
    if (!/^9665\d{8}$/.test(normalizedPhone)) {
      setErr("Phone must start with 5 and be 9 digits long.");
      return;
    }

    // Enforce CR/VAT lengths only if provided
    if (profile.crNumber && profile.crNumber.replace(/\D/g, "").length !== 10) {
      setCrFieldErr("CR must be exactly 10 digits.");
      setErr("Please fix the highlighted CR field.");
      return;
    }
    if (profile.vatNumber && profile.vatNumber.replace(/\D/g, "").length !== 15) {
      setVatFieldErr("VAT must be exactly 15 digits.");
      setErr("Please fix the highlighted VAT field.");
      return;
    }

    setLoading(true);

    try {
      // Build a multipart form to send to our server route
      const fd = new FormData();
      fd.append("phone", normalizedPhone);
      fd.append("company_name", profile.companyName.trim());
      fd.append("contact_name", profile.contactName.trim());
      if (profile.email.trim()) fd.append("email", profile.email.trim());
      if (profile.city.trim()) fd.append("city", profile.city.trim());
      if (profile.industry) fd.append("industry", profile.industry);
      if (profile.crNumber && profile.crNumber.replace(/\D/g,"").length === 10) {
        fd.append("cr_number", profile.crNumber.replace(/\D/g,""));
      }
      if (profile.vatNumber && profile.vatNumber.replace(/\D/g,"").length === 15) {
        fd.append("vat_number", profile.vatNumber.replace(/\D/g,""));
      }
      fd.append("lang", lang);
      fd.append("want_rate_book", String(profile.wantRateBook));

      // Attach files (they will be validated server-side)
      if (crFile) {
        fd.append("cr", crFile, "cr.pdf");
        setCrUploading(true);
      }
      if (vatFile) {
        fd.append("vat", vatFile, "vat.pdf");
        setVatUploading(true);
      }

      const res = await fetch("/api/partners/submit", {
        method: "POST",
        body: fd
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Prefer detailed server error if available
        throw new Error(j?.error || "Failed to submit profile");
      }

      // Optionally capture returned storage paths
      if (j?.crPath) setCrPath(j.crPath);
      if (j?.vatPath) setVatPath(j.vatPath);
      setCrFile(null);
      setVatFile(null);

      setMsg(t("submitted"));
      // Optionally navigate to an "under review" page:
      // window.location.href = "/portal/under-review";
    } catch (e:any) {
      setErr(e.message || "Failed to save profile");
    } finally {
      setCrUploading(false);
      setVatUploading(false);
      setLoading(false);
    }
  }

  const VFWord = () => (
    <span className={`${variforceFont.className} text-emerald-600`}>VariForce</span>
  );
  return (
    <div className="relative min-h-screen" dir={dir} data-lang={lang} suppressHydrationWarning>
      <style jsx global>{`
        .bolt-text {
          background: linear-gradient(90deg, #22c55e, #06b6d4, #22c55e);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          background-size: 200% 100%;
          animation: bolt-shimmer 4s linear infinite;
          text-shadow: 0 0 14px rgba(34,197,94,0.45), 0 0 28px rgba(6,182,212,0.35);
        }
        @keyframes bolt-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        /* Breathing lightning + glow */
        .bolt-breathe { animation: bolt-breathe 2.6s ease-in-out infinite; will-change: transform, filter; }
        .glow-breathe { animation: glow-breathe 3.2s ease-in-out infinite; }
        @keyframes glow-breathe {
          0%, 100% { opacity: 0.22; }
          50% { opacity: 0.5; }
        }
        @keyframes bolt-breathe {
          0%, 100% {
            transform: translateY(0) scale(1.0);
            opacity: 0.55;
            filter: drop-shadow(0 0 8px rgba(16,185,129,0.35));
          }
          50% {
            transform: translateY(-1px) scale(1.03);
            opacity: 0.98;
            filter: drop-shadow(0 0 18px rgba(16,185,129,0.75));
          }
        }
        /* generic breathe animation used for the bolt glow */
        @keyframes breathe { 0%,100% { transform: scale(1); opacity: .6; } 50% { transform: scale(1.15); opacity: .95; } }
        .animate-breathe { animation: breathe 2.2s ease-in-out infinite; will-change: transform, opacity; }
        /* Tint any monochrome SVG/PNG to Tailwind emerald-600 (#059669) */
        .tint-emerald-600 { filter: invert(41%) sepia(84%) saturate(470%) hue-rotate(119deg) brightness(92%) contrast(96%); }
      `}</style>
      {/* Background video */}
      <video
        className="pointer-events-none fixed inset-0 w-full h-full object-cover z-0"
        src="/bg/fieldwork.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      {/* soft color wash */}
      <div className="fixed inset-0 z-0 bg-emerald-50/80" />
      {/* radial glow */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(60%_40%_at_20%_20%,rgba(16,185,129,0.12),transparent),radial-gradient(50%_40%_at_80%_0%,rgba(6,182,212,0.12),transparent)]" />
      <header className="fixed inset-x-0 top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          {/* Left: brand + tagline */}
          <a href="/partners" className="inline-flex items-center gap-3 group" dir="ltr">
            <img src="/logo.png" alt="BOCC logo" className="h-9 w-9 rounded-md bg-white ring-1 ring-emerald-200/50 shadow" />
            <div className="leading-tight">
              <div className="text-slate-900 font-semibold tracking-tight text-base sm:text-lg">Brightness of Creativity</div>
              <div className="text-slate-600 text-[12px]">Fast • Agile • Secure • Advanced — Modernizing your tech</div>
            </div>
          </a>

          {/* Right: language toggle pill */}
          <div className="shrink-0">
            <label className="sr-only" htmlFor="lang-toggle">Language</label>
            <select
              id="lang-toggle"
              value={lang}
              onChange={(e)=>{ const v = e.target.value as any; setLang(v); setProfile(p=>({ ...p, primaryLanguage: v })); const u = new URL(window.location.href); u.searchParams.set("lang", v); window.history.replaceState({}, "", u.toString()); }}
              className="appearance-none w-auto max-w-[52vw] sm:max-w-none truncate pl-8 pr-7 py-1.5 sm:pl-9 sm:pr-8 sm:py-2 text-xs sm:text-sm rounded-full border border-emerald-200 bg-white/70 backdrop-blur-md text-slate-900 ring-1 ring-emerald-200/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="en">🇬🇧 English</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="ur">🇵🇰 اُردو</option>
              <option value="hi">🇮🇳 हिन्दी</option>
              <option value="ml">🇮🇳 മലയാളം</option>
              <option value="bn">🇧🇩 বাংলা</option>
              <option value="zh">🇨🇳 中文</option>
            </select>
            {/* flag icon positioned inside the select (left) */}
            <span className="pointer-events-none relative -ml-7 sm:-ml-8 inline-block align-middle" aria-hidden>
              {/* This span just reserves space; the flag glyph is rendered as part of the option text */}
            </span>
          </div>
        </div>
      </header>
      <main className="relative z-10 bg-transparent">
        <div dir="ltr" className="mx-auto max-w-6xl px-4 pt-24 pb-12 grid md:grid-cols-2 gap-8 items-center min-h-[80vh]">
          {/* Left: brand + hero copy (portal hero style) */}
          <section className="hidden md:flex flex-col justify-center items-end text-right w-full">
            <h1 className="mt-0">
              <span className={`${variforceFont.className} relative inline-block tracking-tight text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-slate-900`}>
                {/* soft halo behind brand */}
                <span className="pointer-events-none absolute -inset-8 -z-10 blur-3xl bg-[radial-gradient(closest-side,rgba(16,185,129,0.25),transparent_78%)] glow-breathe" />

                {/* VariForce with exponent bolt at the end */}
                <span className="inline-flex items-baseline gap-0.5">
                  <span>VariForce</span>
                  <span className="relative -translate-y-16 ml-1 pointer-events-none">
                    <span className="absolute inset-0 rounded-full bg-emerald-500/25 blur-md animate-breathe" />
                    <Zap className="relative w-8 h-8 text-emerald-500 bolt-breathe" />
                  </span>
                </span>
              </span>
            </h1>
            {/* Bold sub‑tagline directly under brand */}
            <div className="mt-2 text-lg sm:text-xl font-semibold text-slate-900 text-right ml-auto">{t("tagline")}</div>
            {/* Support lines */}
            <p className="mt-4 text-2xl text-slate-700 text-right ml-auto">{t("support1")}</p>
            <p className="mt-2 text-base leading-7 text-slate-600 text-right ml-auto">{t("support2")}</p>
          </section>

          {/* Right: signup card */}
          <section className="flex justify-center">
            <div className="w-full max-w-md sm:max-w-lg">
              <div className="relative isolate overflow-hidden rounded-3xl border border-emerald-200 bg-white/95 backdrop-blur-xl shadow-lg">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.08),transparent_32%)]" />
                <div className="relative z-10 p-4 sm:p-5 mx-auto max-w-2xl">
          <a
            href="/partners"
            className="mb-4 inline-flex items-center text-sm text-emerald-700 hover:text-emerald-900"
          >
            {t("back")}
          </a>
          {(() => {
            const rawTitle = t("title") as string;
            const parts = rawTitle.split("VariForce");
            return (
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {parts.map((chunk, idx) => (
                  <span key={idx}>
                    {chunk}
                    {idx < parts.length - 1 && <span className={variforceFont.className}>VariForce</span>}
                  </span>
                ))}
              </h1>
            );
          })()}
          <p className="text-sm text-gray-700 max-w-2xl mt-1">{t("subtitle")}</p>

          {msg && (
            <div className="mt-4 rounded bg-green-50 text-green-700 text-sm px-3 py-2">
              <div>{msg}</div>
              {step === "company" && (
                <div className="mt-1 text-gray-700">{t("underReview")}</div>
              )}
            </div>
          )}
          {err && <div className="mt-4 rounded bg-red-50 text-red-700 text-sm px-3 py-2">{err}</div>}

          {step === "phone" && (
            <>
              <label className="block text-sm text-gray-800 mb-1">{t("waNumber")}</label>
              <div className="relative mb-4">
                {/* left icon */}
                <span className="absolute inset-y-0 left-3 grid place-items-center">
                  <img src="/whatsapp.svg" alt="WhatsApp" className="h-5 w-5 tint-emerald-600" />
                </span>
                {/* fixed country code prefix */}
                <span className="absolute inset-y-0 left-9 flex items-center">
                  <span className="text-emerald-700 text-base font-medium select-none tracking-tight">+966</span>
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
                />
                {phoneErr && <div className="mt-1 text-xs text-red-600">{phoneErr}</div>}
              </div>
              <button
                onClick={sendOTP}
                disabled={loading}
                className="w-full h-11 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm disabled:opacity-60 transition-colors"
              >
                {loading ? "Sending…" : t("sendCode")}
              </button>

              <div className="mt-4 text-xs text-gray-600">
                {t("byContinue")}{" "}
                <a href="/terms" className="underline hover:text-emerald-600">{t("terms")}</a> &amp;{" "}
                <a href="/privacy" className="underline hover:text-emerald-600">{t("privacy")}</a>.
              </div>
              <p className="mt-3 text-sm text-gray-700">
                <a href="/portal/login" className="underline hover:text-emerald-600">
                  {t("haveAccount")}
                </a>
              </p>
            </>
          )}

          {step === "code" && (
            <>
              <div className="text-sm text-gray-800 mb-2">
                {t("enterCodeTo")} <span className="font-medium">{phone}</span>
              </div>
              <input
                value={code}
                onChange={(e)=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}
                placeholder="••••••"
                className="tracking-widest text-center text-lg w-full border rounded px-3 py-2 mb-4 outline-none border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                inputMode="numeric"
                maxLength={6}
                dir="ltr"
              />
              <button
                onClick={verifyOTP}
                disabled={loading}
                className="w-full h-11 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm disabled:opacity-60 transition-colors"
              >
                {loading ? t("verifying") : t("verifyContinue")}
              </button>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
                <a className="text-emerald-600 hover:underline" onClick={sendOTP}>
                  {t("resend")} {resendTimer>0 ? `(${resendTimer}s)` : ""}
                </a>
                <a href="/portal/login" className="text-emerald-600 hover:underline">
                  {t("haveAccount")}
                </a>
              </div>
            </>
          )}

          {step === "company" && (
            <>
              <h2 className="text-base font-medium text-gray-900 mb-3">{t("companyProfile")}</h2>

              <label className="block text-sm text-gray-800 mb-1">{t("companyName")}</label>
              <input
                value={profile.companyName}
                onChange={(e)=>setProfile(p=>({ ...p, companyName: e.target.value }))}
                placeholder="Brightness of Creativity Co."
                className="w-full border rounded px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
              />

              <label className="block text-sm text-gray-800 mb-1">{t("contactPerson")}</label>
              <input
                value={profile.contactName}
                onChange={(e)=>setProfile(p=>({ ...p, contactName: e.target.value }))}
                placeholder="Your name"
                className="w-full border rounded px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-800 mb-1">{t("email")}</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e)=>setProfile(p=>({ ...p, email: e.target.value }))}
                    placeholder="you@company.com"
                    className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-1">{t("city")}</label>
                  <input
                    value={profile.city}
                    onChange={(e)=>setProfile(p=>({ ...p, city: e.target.value }))}
                    placeholder="Jeddah"
                    className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm text-gray-800 mb-1">{t("cr")}</label>
                  <input
                    value={profile.crNumber}
                    onChange={(e)=>{
                      const digits = (e.target.value || "").replace(/\D/g,"").slice(0,10);
                      setCrFieldErr(null);
                      setProfile(p=>({ ...p, crNumber: digits }));
                    }}
                    onBlur={(e)=>{
                      const v = (e.target.value || "").replace(/\D/g,"");
                      if (v.length > 0 && v.length !== 10) {
                        setCrFieldErr("CR must be exactly 10 digits.");
                      } else {
                        setCrFieldErr(null);
                      }
                    }}
                    maxLength={10}
                    inputMode="numeric"
                    pattern="\d{10}"
                    placeholder="10XXXXXXXX"
                    aria-invalid={!!crFieldErr}
                    title="If provided, CR must be exactly 10 digits"
                    className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                  />
                  {crFieldErr ? (
                    <div className="mt-1 text-xs text-red-600">{crFieldErr}</div>
                  ) : (
                    <div className="mt-1 text-[11px] text-gray-500">Optional — enter 10 digits if you want to attach CR PDF.</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-1">{t("vat")}</label>
                  <input
                    value={profile.vatNumber}
                    onChange={(e)=>{
                      const digits = (e.target.value || "").replace(/\D/g,"").slice(0,15);
                      setVatFieldErr(null);
                      setProfile(p=>({ ...p, vatNumber: digits }));
                    }}
                    onBlur={(e)=>{
                      const v = (e.target.value || "").replace(/\D/g,"");
                      if (v.length > 0 && v.length !== 15) {
                        setVatFieldErr("VAT must be exactly 15 digits.");
                      } else {
                        setVatFieldErr(null);
                      }
                    }}
                    maxLength={15}
                    inputMode="numeric"
                    pattern="\d{15}"
                    placeholder="3XXXXXXXXXXXXXX"
                    aria-invalid={!!vatFieldErr}
                    title="If provided, VAT must be exactly 15 digits"
                    className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                  />
                  {vatFieldErr ? (
                    <div className="mt-1 text-xs text-red-600">{vatFieldErr}</div>
                  ) : (
                    <div className="mt-1 text-[11px] text-gray-500">Optional — enter 15 digits if you want to attach VAT PDF.</div>
                  )}
                </div>
              </div>

              {/* Attachments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm text-gray-800 mb-1">{t("uploadCr")}</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e)=>{ const f = e.target.files?.[0]; if (f) queuePdf("cr", f); }}
                    className="w-full text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                  />
                  {crUploading && <div className="mt-1 text-xs text-gray-600">Uploading CR…</div>}
                  {!crUploading && crFile && <div className="mt-1 text-xs text-emerald-700">CR selected ✓ <span className="text-gray-600">({crFile.name}) — will upload on Submit</span></div>}
                  {crPath && !crUploading && !crFile && <div className="mt-1 text-xs text-emerald-700">CR uploaded ✓ <span className="text-gray-600">({crPath})</span></div>}
                  {crUploadErr && <div className="mt-1 text-xs text-red-600">{crUploadErr}</div>}
                  {crFile && profile.crNumber.replace(/\D/g,"").length !== 10 && (
                    <div className="mt-1 text-xs text-amber-600">Tip: enter a 10‑digit CR so we can name/place the file correctly.</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-1">{t("uploadVat")}</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e)=>{ const f = e.target.files?.[0]; if (f) queuePdf("vat", f); }}
                    className="w-full text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                  />
                  {vatUploading && <div className="mt-1 text-xs text-gray-600">Uploading VAT…</div>}
                  {!vatUploading && vatFile && <div className="mt-1 text-xs text-emerald-700">VAT selected ✓ <span className="text-gray-600">({vatFile.name}) — will upload on Submit</span></div>}
                  {vatPath && !vatUploading && !vatFile && <div className="mt-1 text-xs text-emerald-700">VAT uploaded ✓ <span className="text-gray-600">({vatPath})</span></div>}
                  {vatUploadErr && <div className="mt-1 text-xs text-red-600">{vatUploadErr}</div>}
                  {vatFile && profile.vatNumber.replace(/\D/g,"").length !== 15 && (
                    <div className="mt-1 text-xs text-amber-600">Tip: enter a 15‑digit VAT so we can name/place the file correctly.</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm text-gray-800 mb-1">{t("industry")}</label>
                  <select
                    value={profile.industry}
                    onChange={(e)=>setProfile(p=>({ ...p, industry: e.target.value }))}
                    className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                  >
                    <option value="">{/* Select industry */}Select industry</option>
                    <option value="wood_fabrication">Wood fabrication / carpentry</option>
                    <option value="signage">Signage / lightboxes</option>
                    <option value="it_msp">IT / MSP (CCTV, WiFi, network)</option>
                    <option value="construction">Construction / contracting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-800 mb-1">{t("primaryLanguage")}</label>
                  <select
                    value={profile.primaryLanguage}
                    onChange={(e)=>{ const v = e.target.value as any; setProfile(p=>({ ...p, primaryLanguage: v })); setLang(v); const u = new URL(window.location.href); u.searchParams.set("lang", v); window.history.replaceState({}, "", u.toString()); }}
                    className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية (Arabic)</option>
                    <option value="ur">اردو (Urdu)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="ml">മലയാളം (Malayalam)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="zh">中文 (Chinese)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  id="wantRateBook"
                  type="checkbox"
                  checked={profile.wantRateBook}
                  onChange={(e)=>setProfile(p=>({ ...p, wantRateBook: e.target.checked }))}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="wantRateBook" className="text-sm text-gray-800">
                  {t("rateBook")}
                  <span className="font-medium">{t("rateBookBold")}</span>
                  {t("rateBookTail")}
                </label>
              </div>

              <div className="mt-3 flex items-start gap-2">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={profile.acceptTerms}
                  onChange={(e)=>setProfile(p=>({ ...p, acceptTerms: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-800">
                  {t("acceptTerms")}
                </label>
              </div>

              <button
                onClick={submitCompanyProfile}
                disabled={loading}
                className="mt-5 w-full h-11 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm disabled:opacity-60 transition-colors"
              >
                {loading ? "Saving…" : t("save")}
              </button>
            </>
          )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    {/* Footer (text-only) */}
    <footer className="absolute bottom-0 w-full z-10 border-t border-white/20 bg-black/40 backdrop-blur-sm text-gray-200">
      <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="text-xs">
          © 2025 Brightness of Creativity (BOCC) — All rights reserved.{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:text-emerald-400">Privacy</a>
          {" • "}
          <a href="/terms" className="underline underline-offset-4 hover:text-emerald-400">Terms</a>
        </div>
        <nav className="flex items-center gap-5 text-white">
          <a
            href="https://x.com/bocc_sa"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X / Twitter"
            className="opacity-90 hover:opacity-100 transition-opacity"
          >
            <img src="/x.svg" alt="X (Twitter)" className="h-4 w-4 brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
          </a>
          <a
            href="https://instagram.com/bocc_sa"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="opacity-90 hover:opacity-100 transition-opacity"
          >
            <img src="/instagram.svg" alt="Instagram" className="h-4 w-4 brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
          </a>
          <a
            href="https://linkedin.com/company/bocc-sa"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="opacity-90 hover:opacity-100 transition-opacity"
          >
            <img src="/linkedin.svg" alt="LinkedIn" className="h-4 w-4 brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
          </a>
          <a
            href="https://wa.me/966570442116"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="opacity-90 hover:opacity-100 transition-opacity"
          >
            <img src="/whatsapp.svg" alt="WhatsApp" className="h-4 w-4 brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
          </a>
        </nav>
      </div>
    </footer>
    </div>
  );
}