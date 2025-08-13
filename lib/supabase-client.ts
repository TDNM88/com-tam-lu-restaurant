import { getSupabaseBrowserClient } from "./supabase-browser"

export const supabase = getSupabaseBrowserClient()
// Tương thích ngược với các import cũ
export const supabaseClient = supabase
export { getSupabaseBrowserClient }
