import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables: SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  )
}

export function createServerClient() {
  return createSupabaseClient(supabaseUrl as string, supabaseServiceKey as string, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Tương thích ngược với các import cũ trong các route API
export function getSupabaseServiceRoleClient() {
  return createServerClient()
}

// Alias tương thích ngược: một số nơi import { createClient } từ file này
export const createClient = getSupabaseServiceRoleClient

export default getSupabaseServiceRoleClient
