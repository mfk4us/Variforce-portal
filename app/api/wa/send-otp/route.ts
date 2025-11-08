export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import otpMap from "@/lib/otpStore";
import crypto from "crypto";
import { getEnv } from "@/lib/env";

const WA_TOKEN = process.env.WA_ACCESS_TOKEN!;
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID!; // e.g. 636605492870899
const TEMPLATE_NAME = process.env.WA_TEMPLATE_NAME || "partner_login_auth";
const EXP_MINUTES = parseInt(process.env.OTP_EXP_MINUTES || "5", 10);
const TEMPLATE_LANG = process.env.WA_TEMPLATE_LANG || "en_US";
const TEMPLATE_URL_PLACEHOLDER = process.env.WA_TEMPLATE_URL_PLACEHOLDER === "1";

async function callMeta(payload: any) {
  const resp = await fetch(`https://graph.facebook.com/v22.0/${WA_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WA_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const json = await resp.json().catch(() => ({}));
  return { resp, json };
}

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

// Normalize phone into digits-only E.164 without '+'
function normalizePhone(input: string): string {
  return (input || "").replace(/\D/g, "");
}

function isValidPhone(e164NoPlus: string): boolean {
  // Basic sanity check: 11-15 digits (e.g., 9665XXXXXXXX for KSA)
  return /^\d{11,15}$/.test(e164NoPlus);
}

function resolveLang(requested?: string): string {
  if (!requested) return TEMPLATE_LANG;
  const v = requested.toLowerCase();
  if (v.startsWith("ar")) return "ar";
  if (v.startsWith("en")) return "en_US";
  return TEMPLATE_LANG;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPhone = body?.phone;
    const queryLang = req.nextUrl.searchParams.get("lang") || undefined;
    const bodyLang = typeof body?.lang === "string" ? body.lang : undefined;
    const phone = normalizePhone(rawPhone);
    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json({ error: "invalid_phone", message: "Enter phone in E.164 without + (e.g., 9665XXXXXXXX)." }, { status: 400 });
    }

    // Rate limit (simple): allow once per 60s per phone
    const existing = otpMap.get(phone) as any;
    const now = Date.now();
    if (existing?.lastSentAt && now - existing.lastSentAt < 60_000) {
      const wait = Math.ceil((60_000 - (now - existing.lastSentAt)) / 1000);
      return NextResponse.json({ error: "rate_limited", message: "Please wait before requesting another code.", retry_after: wait }, { status: 429 });
    }

    // Generate 6-digit
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const langCode = resolveLang(bodyLang || queryLang);

    const components: any[] = [
      {
        type: "body",
        parameters: [{ type: "text", text: code }]
      }
    ];

    // If your template has a URL button with a {{1}} placeholder, include the same OTP value for the button parameter.
    if (TEMPLATE_URL_PLACEHOLDER) {
      components.push({
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [{ type: "text", text: code }]
      });
    }

    const componentsToUse = components;

    // Build payload function for reuse
    const buildPayload = (comps: any[]) => ({
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: TEMPLATE_NAME,
        language: { code: langCode },
        components: comps
      }
    });

    // First attempt
    let { resp, json } = await callMeta(buildPayload(componentsToUse));

    // If failed due to missing URL button parameter (131008) and we didn't include it,
    // force a retry with URL button param.
    const needUrlParamRetry =
      !resp.ok &&
      (!TEMPLATE_URL_PLACEHOLDER) &&
      (json?.error?.code === 131008 ||
        /Button at index 0 of type Url requires a parameter/i.test(json?.error?.message || ""));

    if (needUrlParamRetry) {
      const forcedComponents = [
        ...components,
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: code }]
        }
      ];
      ({ resp, json } = await callMeta(buildPayload(forcedComponents)));
    }

    if (!resp.ok) {
      console.error("WA SEND ERROR:", JSON.stringify(json, null, 2));
      const metaMsg = json?.error?.message || json?.error?.error_user_msg || "Meta API error";
      const metaCode = json?.error?.code || json?.error?.error_subcode || resp.status;
      return NextResponse.json(
        { error: "WA send failed", message: metaMsg, code: metaCode, details: json },
        { status: 502 }
      );
    }

    console.log("WA SEND OK:", JSON.stringify(json, null, 2));

    otpMap.set(phone, {
      hash: hashCode(code),
      expiresAt: now + EXP_MINUTES * 60_000,
      attempts: 0,
      lastSentAt: now
    } as any);

    return NextResponse.json({ ok: true, resend_in: 60, message_id: json?.messages?.[0]?.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}