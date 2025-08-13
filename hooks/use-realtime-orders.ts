"use client"

import { useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase-browser"

export function useRealtimeOrders(onOrderUpdate?: () => void) {
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("Order change received:", payload)
          onOrderUpdate?.()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onOrderUpdate])
}
