import type { Database } from '@/lib/database.types'
type Member = Database['public']['Tables']['members']['Row']

export function assertAuth(member: Member | null): asserts member is Member {
  if (!member) throw new Error('Not authenticated')
}

export function assertRole(member: Member, allowed: Array<Member['role']>) {
  if (!allowed.includes(member.role)) throw new Error('Forbidden')
}

export function assertTenant(member: Member, tenantId: string) {
  if (member.tenant_id === null) return // BOCC internal
  if (member.tenant_id !== tenantId) throw new Error('Wrong tenant scope')
}