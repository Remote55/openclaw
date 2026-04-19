/**
 * Admin client for server-side operations that must bypass RLS.
 *
 * ⚠️ WARNING: This uses the service_role key. Never expose to the browser.
 * Only use for: webhooks, cron jobs, admin scripts, migrations.
 */
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}