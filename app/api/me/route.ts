import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    // Expect "Authorization: Bearer <access_token>" from the client
    const auth = req.headers.get('authorization') || ''
    const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : null
    if (!token) return NextResponse.json({ error: 'missing bearer token' }, { status: 401 })

    const admin = createServiceClient()
    const { data: userData, error: uErr } = await admin.auth.getUser(token)
    if (uErr || !userData.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 })

    const userId = userData.user.id
    const { data: members, error: mErr } = await admin
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)

    if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 })

    const member = members?.[0] ?? null
    const tenantId = member?.tenant_id ?? null
    const isInternal = member?.tenant_id === null

    return NextResponse.json({
      ok: true,
      user: { id: userId, email: userData.user.email },
      member,
      tenantId,
      isInternal
    })
  } catch (e: unknown) {
    const message =
      typeof e === "object" && e !== null && "message" in e
        ? String((e as { message: string }).message)
        : "unexpected";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}