"use client"

import { getSupabaseBrowserClient } from "@/lib/supabase-browser"

// Dùng cùng một singleton client trên browser để tránh cảnh báo
// "Multiple GoTrueClient instances detected" do trùng storage key.
export const supabaseClient = getSupabaseBrowserClient()
