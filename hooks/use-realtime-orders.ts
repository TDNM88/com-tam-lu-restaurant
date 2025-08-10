"use client"

import { useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase-browser"

type Handler = (payload: any) => void

export function useRealtimeOrders(onChange?: Handler) {
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (onChange) onChange(payload)
      })
      .subscribe((status) => {
        // Optional: console.debug("Realtime status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onChange])
}
