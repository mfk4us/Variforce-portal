'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

type ApproveInput = {
  applicationId: string
  name: string
  managerEmail: string
}

export async function approvePartner(input: ApproveInput) {
  const supabase = createServiceClient()
  const tenantId = randomUUID()

  // 1) create tenant (slug will auto-generate in DB)
  const { error: tErr } = await supabase
    .from('tenants')
    .insert({
      id: tenantId,
      name: input.name
      // slug omitted intentionally — DB trigger fills it
    })

  if (tErr) throw new Error(`Create tenant failed: ${tErr.message}`)

  // 2) mark application approved
  const { error: aErr } = await supabase
    .from('partners_applications')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', input.applicationId)

  if (aErr) throw new Error(`Update application failed: ${aErr.message}`)

  // 3) invite manager (set default_tenant_id + role in metadata)
  const meta = {
    full_name: 'Company Manager',
    default_tenant_id: tenantId,
    role: 'company_manager'
  }

  const { data: invite, error: iErr } = await supabase.auth.admin.inviteUserByEmail(
    input.managerEmail,
    { data: meta }
  )

  if (iErr) throw new Error(`Invite failed: ${iErr.message}`)

  return { ok: true, tenantId, inviteId: invite?.user?.id }
}