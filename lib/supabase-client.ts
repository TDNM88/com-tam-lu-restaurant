"use client"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Không throw để tránh crash component client; cảnh báo giúp dev biết cấu hình thiếu
  // eslint-disable-next-line no-console
  console.warn("[supabase-client] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY chưa được cấu hình")
}

export const supabaseClient = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: { "X-Client-Info": "com-tam-lu/client" },
  },
})
