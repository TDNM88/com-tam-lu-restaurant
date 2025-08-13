"use client"

import { useState, useEffect } from "react"

export interface Order {
  id: string
  tableNumber: string
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  notes: string | null
  orderTime: string
  completedAt: string | null
  totalAmount: number
  items: string[]
  rawItems: Array<{
    menuItemId: string | null
    name: string
    quantity: number
    unitPrice: number
    subtotal: number
    note: string | null
    imageUrl: string | null
  }>
}

export function useOrders(tableNumber?: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = new URL("/api/orders", window.location.origin)
      if (tableNumber) {
        url.searchParams.set("table", tableNumber)
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setOrders(result.data || [])
      } else {
        throw new Error(result.error || "Failed to fetch orders")
      }
    } catch (err: any) {
      console.error("useOrders fetch error:", err)
      setError(err.message || "Failed to fetch orders")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const createOrder = async (orderData: {
    tableNumber: string
    items: Array<{
      menuItemId: string
      name: string
      quantity: number
      unitPrice: number
      subtotal?: number
      note?: string
    }>
    totalAmount: number
    notes?: string
  }) => {
    try {
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

      if (result.success) {
        // Refresh orders after creating
        await fetchOrders()
        return result.data
      } else {
        throw new Error(result.error || "Failed to create order")
      }
    } catch (err: any) {
      console.error("Create order error:", err)
      throw err
    }
  }

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Refresh orders after updating
        await fetchOrders()
        return result.data
      } else {
        throw new Error(result.error || "Failed to update order status")
      }
    } catch (err: any) {
      console.error("Update order status error:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [tableNumber])

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    updateOrderStatus,
  }
}
