import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

export function getSupabaseServiceRoleClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Named export for compatibility
export const createClient = getSupabaseServiceRoleClient

export default getSupabaseServiceRoleClient
