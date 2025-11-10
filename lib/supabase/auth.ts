import { createServiceClient } from './server'
import { redirect } from 'next/navigation'

// Returns { user, member, tenantId, isInternal }
export async function getAuthContext(userId: string | null) {
  if (!userId) return { user: null, member: null, tenantId: null, isInternal: false }

  const supabase = createServiceClient()
  const { data: memberRows, error } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) throw new Error(error.message)
  const member = memberRows?.[0] ?? null
  const tenantId = member?.tenant_id ?? null
  const isInternal = member?.tenant_id === null

  return { user: { id: userId }, member, tenantId, isInternal }
}

// Simple guard for server components
export async function requirePortalAccess(userId: string | null) {
  const ctx = await getAuthContext(userId)
  if (!ctx.user) redirect('/portal/login')
  return ctx
}