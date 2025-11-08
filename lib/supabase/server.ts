// Server-side Supabase client (SERVICE ROLE). Use ONLY in server actions & API routes.
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { cookies, headers } from 'next/headers'

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const h = new Headers(headers())
  const c = cookies()

  // Propagate user access token (if present) so we can call auth.getUser()
  const accessToken = c.get('sb-access-token')?.value
  if (accessToken) h.set('Authorization', `Bearer ${accessToken}`)

  return createClient<Database>(url, key, {
    global: { headers: h },
    auth: { autoRefreshToken: false, persistSession: false }
  })
}