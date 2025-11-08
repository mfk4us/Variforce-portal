'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getTenantContext } from '@/lib/supabase/auth'
import { assertAuth, assertRole, assertTenant } from '@/lib/guards'
import type { Database } from '@/lib/database.types'

type NewProjectInput = {
  name: string
  description?: string
  view_mode?: 'kanban' | 'list'
}

export async function createProject(tenantId: string, input: NewProjectInput) {
  const { member } = await getTenantContext(tenantId)
  assertAuth(member)
  assertTenant(member, tenantId)
  assertRole(member, ['admin', 'company_manager'])

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('projects')
    .insert({
      tenant_id: member.tenant_id ?? tenantId, // internal can act on any tenant
      created_by_member_id: member.id,
      name: input.name,
      description: input.description ?? null,
      view_mode: input.view_mode ?? 'kanban'
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function listProjects(tenantId: string) {
  const { member } = await getTenantContext(tenantId)
  assertAuth(member)
  assertTenant(member, tenantId)

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('tenant_id', member.tenant_id ?? tenantId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}