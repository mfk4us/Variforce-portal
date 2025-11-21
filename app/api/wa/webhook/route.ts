export const runtime = "nodejs";

import { NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "dev-verify-token";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return NextResponse.json({ error: "verify_failed" }, { status: 403 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));

  if (!body || Object.keys(body).length === 0) {
    console.warn("WA WEBHOOK EVENT: empty body");
    return NextResponse.json({ ok: false, warning: "empty body" });
  }

  // Iterate entries and changes
  if (Array.isArray(body.entry)) {
    for (const entry of body.entry) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const val = change?.value || {};
        const metadata = val?.metadata || {};

        // 1) Delivery/read/failed statuses (concise one‑liners)
        if (Array.isArray(val.statuses)) {
          for (const s of val.statuses) {
            const mid = s?.id || "unknown_mid";
            const status = s?.status || "unknown_status";
            const to = s?.recipient_id || metadata?.display_phone_number || "unknown_to";
            const ts = s?.timestamp ? new Date(Number(s.timestamp) * 1000).toISOString() : "";
            // If there are errors per status, surface the first one
            const err = Array.isArray(s?.errors) && s.errors.length ? ` err=${s.errors[0]?.title || s.errors[0]?.code || "unknown"}` : "";
            console.log(`WA STATUS: ${status} mid=${mid} to=${to}${ts ? ` ts=${ts}` : ""}${err}`);
          }
        }

        // 2) Inbound user messages (very concise)
        if (Array.isArray(val.messages)) {
          for (const m of val.messages) {
            const from = m?.from || "unknown_from";
            const type = m?.type || "unknown_type";
            const text = m?.text?.body ? ` text="${String(m.text.body).slice(0, 60)}"` : "";
            console.log(`WA IN: from=${from} type=${type}${text}`);
          }
        }

        // 3) Fallback: if neither statuses nor messages, log once (template/account updates, etc.)
        if (!val.statuses && !val.messages) {
          console.log("WA WEBHOOK OTHER:", JSON.stringify(val, null, 2));
        }
      }
    }
  } else {
    // Non-standard payload; log raw for visibility
    console.log("WA WEBHOOK RAW:", JSON.stringify(body, null, 2));
  }

  return NextResponse.json({ ok: true });
}