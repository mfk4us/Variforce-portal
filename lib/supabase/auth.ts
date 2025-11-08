import { cookies } from 'next/headers'
import { createServiceClient } from './server'

export async function getCurrentUser() {
  const access = cookies().get('sb-access-token')?.value
  if (!access) return null
  const supabase = createServiceClient()
  const { data } = await supabase.auth.getUser(access)
  return data.user ?? null
}

export async function getCurrentMember() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) throw new Error(error.message)
  return data?.[0] ?? null
}

export async function getTenantContext(tenantId: string) {
  const member = await getCurrentMember()
  if (!member) throw new Error('Not authenticated')
  // If member.tenant_id is null (BOCC internal), allow cross-tenant ops via UI guard.
  return { member, tenantId }
}