import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Singleton Supabase server client using the Service Role key.
 * Use ONLY in Route Handlers / Server Actions.
 * Falls back to ANON key if service key is missing, so public GETs still work.
 */
let cached: SupabaseClient | null = null

export function getSupabaseServiceRoleClient(): SupabaseClient {
  if (cached) return cached

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error("Supabase URL is not configured (SUPABASE_URL | NEXT_PUBLIC_SUPABASE_URL)")
  }

  const key = serviceKey || anonKey
  if (!key) {
    throw new Error("Supabase credentials are not configured (SUPABASE_SERVICE_ROLE_KEY | SUPABASE_ANON_KEY)")
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "com-tam-lu/server" } },
  })
  return cached
}
