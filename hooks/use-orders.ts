"use client"

import { useState, useCallback } from "react"

export interface OrderDTO {
  tableNumber: string
  items: Array<{
    menuItemId: string
    name: string
    quantity: number
    unitPrice: number
    subtotal: number
    note?: string
    specialRequests?: string
  }>
  totalAmount: number
  notes?: string
}

export function useOrders(options?: { tableNumber?: string }) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const url = new URL("/api/orders", window.location.origin)
      if (options?.tableNumber) {
        url.searchParams.set("tableNumber", options.tableNumber)
      }

      const response = await fetch(url.toString())
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch orders")
      }

      setOrders(result.data || [])
    } catch (err: any) {
      console.error("Error fetching orders:", err)
      setError(err.message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [options?.tableNumber])

  const createOrder = useCallback(
    async (orderData: OrderDTO) => {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Failed to create order")
        }

        // Refresh orders after creating
        await fetchOrders()

        return result.data
      } catch (err: any) {
        console.error("Error creating order:", err)
        throw err
      }
    },
    [fetchOrders],
  )

  return {
    orders,
    loading,
    error,
    createOrder,
    refetch: fetchOrders,
  }
}
