import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Server-only Supabase client using the service role key.
// Access to these tables is gated at the application layer:
//   - admin area: ADMIN_PASSWORD session cookie
//   - teacher area: assignment PIN / token
// The service role key must NEVER be imported into client components.
let cached: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient {
  if (cached) return cached
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Supabase server credentials are not configured")
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}
