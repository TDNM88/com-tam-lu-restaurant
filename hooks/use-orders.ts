"use client"

import { useState, useEffect, useCallback } from "react"

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  notes?: string
}

export interface OrderDTO {
  id: string
  tableNumber: number
  items: OrderItem[]
  totalAmount: number
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  customerName?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type OrderStatus = OrderDTO["status"]

export interface CreateOrderPayload {
  tableNumber: number
  items: OrderItem[]
  totalAmount: number
  customerName?: string
  notes?: string
}

export interface UpdateOrderPayload {
  status?: OrderStatus
  notes?: string
}

export function useOrders() {
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async (filters?: { status?: string; table?: string }) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters?.status) params.append("status", filters.status)
      if (filters?.table) params.append("table", filters.table)

      const response = await fetch(`/api/orders?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && Array.isArray(result.data)) {
        setOrders(result.data)
      } else {
        throw new Error(result.error || "Invalid response format")
      }
    } catch (err: any) {
      console.error("useOrders fetch error:", err)
      setError(err.message || "Failed to fetch orders")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createOrder = useCallback(async (orderData: CreateOrderPayload): Promise<OrderDTO | null> => {
    try {
      setError(null)

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        const newOrder = result.data
        setOrders((prev) => [newOrder, ...prev])
        return newOrder
      } else {
        throw new Error(result.error || "Failed to create order")
      }
    } catch (err: any) {
      console.error("Create order error:", err)
      setError(err.message || "Failed to create order")
      return null
    }
  }, [])

  const updateOrderStatus = useCallback(async (orderId: string, updates: UpdateOrderPayload): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        const updatedOrder = result.data
        setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)))
        return true
      } else {
        throw new Error(result.error || "Failed to update order")
      }
    } catch (err: any) {
      console.error("Update order error:", err)
      setError(err.message || "Failed to update order")
      return false
    }
  }, [])

  const deleteOrder = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setOrders((prev) => prev.filter((order) => order.id !== orderId))
        return true
      } else {
        throw new Error(result.error || "Failed to delete order")
      }
    } catch (err: any) {
      console.error("Delete order error:", err)
      setError(err.message || "Failed to delete order")
      return false
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder,
  }
}
