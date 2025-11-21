'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getAuthContext } from '@/lib/supabase/auth'
import { assertAuth, assertRole, assertTenant } from '@/lib/guards'

type NewProjectInput = {
  name: string
  description?: string
  view_mode?: 'kanban' | 'list'
}

export const createProject = async (tenantId: string, input: NewProjectInput) => {
  const { member } = await getAuthContext(tenantId)
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

export const listProjects = async (tenantId: string) => {
  const { member } = await getAuthContext(tenantId)
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

export const deleteProjectFormAction = async (formData: FormData) => {
  const tenantId = formData.get('tenantId')
  const projectId = formData.get('projectId')

  if (typeof tenantId !== 'string' || !tenantId) {
    throw new Error('Missing tenantId')
  }

  if (typeof projectId !== 'string' || !projectId) {
    throw new Error('Missing projectId')
  }

  const { member } = await getAuthContext(tenantId)
  assertAuth(member)
  assertTenant(member, tenantId)
  assertRole(member, ['admin', 'company_manager'])

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('tenant_id', member.tenant_id ?? tenantId)

  if (error) {
    throw new Error(error.message)
  }
}