import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const runtime = 'edge' // or 'nodejs'

export async function POST(req: Request) {
  const supabase = createServiceClient()
  const payload = await req.json().catch(() => ({}))

  // TODO: verify Zoho signature if applicable

  const { error } = await supabase
    .from('webhooks_log')
    .insert({
      source: 'zoho',
      event_type: payload?.event || 'unknown',
      payload_json: payload,
      status: 'received'
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}