// Server-side service-role client for server actions & API routes.
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}