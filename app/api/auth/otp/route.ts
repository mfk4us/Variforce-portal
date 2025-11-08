import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createServiceClient()
  const body = await req.json().catch(() => ({}))
  const { to, purpose } = body

  if (!to || !purpose) {
    return NextResponse.json({ error: 'to & purpose are required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('otp_requests')
    .insert({ channel: 'whatsapp', to, purpose, status: 'sent' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // TODO: call WhatsApp Cloud API here and update row with provider_msg_id
  return NextResponse.json({ ok: true })
}