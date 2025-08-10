"use client"

import { useCallback, useEffect, useState } from "react"

export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled"

export type OrderItemPayload = {
  menuItemId: string | null
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
  note?: string | null
  imageUrl?: string | null
}

export type OrderDTO = {
  id: string
  tableNumber: string
  items: string[]
  rawItems: OrderItemPayload[]
  totalAmount: number
  status: OrderStatus
  notes?: string | null
  orderTime: string
  completedAt?: string | null
}

type ApiResponse<T> = { success: boolean; data?: T; error?: string; message?: string }

async function parseJsonSafe<T>(res: Response): Promise<ApiResponse<T>> {
  const ct = res.headers.get("content-type") || ""
  if (ct.includes("application/json")) {
    return (await res.json()) as ApiResponse<T>
  }
  const text = await res.text()
  throw new Error(text || `HTTP ${res.status} ${res.statusText}`)
}

export function useOrders(options?: { tableNumber?: string; role?: "admin" | "staff" | "customer" }) {
  const { tableNumber, role } = options || {}
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const headers: HeadersInit = {}
  if (role) headers["authorization"] = `Role ${role}`

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let url = "/api/orders"
      if (tableNumber) url += `?table=${encodeURIComponent(tableNumber)}`
      const res = await fetch(url, { headers, cache: "no-store" })
      if (!res.ok) {
        // Try to parse error JSON, else read text
        try {
          const json = await res.json()
          throw new Error(json?.error || `HTTP ${res.status}`)
        } catch {
          const text = await res.text()
          throw new Error(text || `HTTP ${res.status}`)
        }
      }
      const json = await parseJsonSafe<OrderDTO[]>(res)
      if (!json.success) throw new Error(json.error || "Failed to load orders")
      setOrders(json.data || [])
    } catch (e: any) {
      console.error("useOrders fetch error:", e)
      setOrders([])
      setError(e?.message || "Không thể tải đơn hàng")
    } finally {
      setLoading(false)
    }
  }, [tableNumber, role])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const createOrder = useCallback(
    async (payload: {
      tableNumber: string
      items: {
        menuItemId: string
        name?: string
        quantity: number
        unitPrice: number
        subtotal?: number
        note?: string
      }[]
      totalAmount: number
      notes?: string
    }) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(payload),
      })
      const json = await parseJsonSafe<OrderDTO>(res)
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || "Không thể tạo đơn hàng")
      }
      setOrders((prev) => [json.data!, ...prev])
      return json.data!
    },
    [role],
  )

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ status }),
      })
      const json = await parseJsonSafe<OrderDTO>(res)
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Không thể cập nhật trạng thái")
      }
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
      return true
    },
    [role],
  )

  return { orders, loading, error, refetch: fetchOrders, createOrder, updateOrderStatus }
}
