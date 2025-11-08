import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createServiceClient()
  const payload = await req.json().catch(() => ({}))

  // TODO: verify signature (Tap/Moyasar/Stripe)
  // Map event -> invoices/payments update
  // Example: mark invoice paid and insert payments row

  const { error } = await supabase
    .from('webhooks_log')
    .insert({
      source: 'gateway',
      event_type: payload?.type || 'unknown',
      payload_json: payload,
      status: 'received'
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}