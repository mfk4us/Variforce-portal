// app/api/whatsapp/send-invite/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, url } = await req.json();

    const token = process.env.WA_ACCESS_TOKEN!;
    const phoneId = process.env.WHATSAPP_PHONE_ID || process.env.WA_PHONE_NUMBER_ID;
    const template = process.env.WA_TEMPLATE_NAME || "partner_login_auth";
    const lang = process.env.WA_TEMPLATE_LANG || "en_US";

    const waRes = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: template,
            language: { code: lang },
            components: [
              {
                type: "body",
                parameters: [{ type: "text", text: url }],
              },
            ],
          },
        }),
      }
    );

    const json = await waRes.json();
    if (!waRes.ok) {
      return NextResponse.json({ ok: false, error: json?.error || "WA send failed" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, id: json.messages?.[0]?.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}