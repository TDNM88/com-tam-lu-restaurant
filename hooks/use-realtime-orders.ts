"use client"

import { useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase-browser"

type Handler = (payload: any) => void

export function useRealtimeOrders(onChange?: Handler) {
  useEffect(() => {
    const isProd = typeof window !== "undefined" && !/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
    try {
      const supabase = getSupabaseBrowserClient()

      const channel = supabase
        .channel("orders-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          (payload) => {
            if (onChange) onChange(payload)
          },
        )
        .subscribe((status) => {
          // Logging an toàn (không lộ thông tin nhạy cảm)
          if (isProd) {
            if (status === "SUBSCRIBED") {
              // eslint-disable-next-line no-console
              console.info("[realtime][orders] SUBSCRIBED")
            } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              // eslint-disable-next-line no-console
              console.warn("[realtime][orders] status:", status)
            } else {
              // eslint-disable-next-line no-console
              console.debug("[realtime][orders] status:", status)
            }
          } else {
            // Dev luôn hiện chi tiết hơn
            // eslint-disable-next-line no-console
            console.debug("[realtime][orders] status:", status)
          }
        })

      return () => {
        supabase.removeChannel(channel)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[realtime][orders] init error:", e)
      return () => {}
    }
  }, [onChange])
}
