"use client"

import { useState, useEffect } from "react"
import type { MenuItem, ApiResponse } from "@/lib/types"
import { supabaseClient } from "@/lib/supabase-client"

// Detect production without referencing process.env in client
const isProduction = typeof window !== "undefined"
  ? !/^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
  : true

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Backend item shape from current API routes
  type BackendItem = {
    id: string
    name: string
    description?: string | null
    price: number
    available?: boolean | null
    category?: string | null
    sortOrder?: number | null
    imageUrl?: string | null
    image?: string | null
    createdAt?: string
    updatedAt?: string
  }

  const toFrontItem = (b: BackendItem): MenuItem => ({
    id: b.id,
    name: b.name,
    shortName: "",
    description: b.description ?? "",
    price: b.price ?? 0,
    image: b.imageUrl ?? b.image ?? "",
    category: b.category ?? "signature",
    rating: 4.5,
    prepTime: "",
    isPopular: false,
    isFree: false,
    isAvailable: b.available ?? true,
    createdAt: b.createdAt ?? "",
    updatedAt: b.updatedAt ?? "",
  })

  const toBackendPayload = (item: Partial<MenuItem>) => ({
    ...(item.name !== undefined && { name: item.name }),
    ...(item.description !== undefined && { description: item.description }),
    ...(item.price !== undefined && { price: Number(item.price) }),
    ...(item.isAvailable !== undefined && { available: Boolean(item.isAvailable) }),
    ...(item.category !== undefined && { category: item.category }),
    ...(item.image !== undefined && { imageUrl: item.image }),
  })

  const buildAuthHeaders = async () => {
    const base: Record<string, string> = { "Content-Type": "application/json" }
    try {
      const { data } = await supabaseClient.auth.getSession()
      const token = data?.session?.access_token
      if (token) {
        // Try to decode role from JWT to decide whether to use dev fallback
        let role: string | undefined
        try {
          const payload = JSON.parse(atob(token.split(".")[1] || ""))
          role = payload?.app_metadata?.role || payload?.user_metadata?.role
        } catch {
          // ignore decode errors
        }

        const privileged = role === "admin" || role === "staff" || role === "owner"
        if (privileged) {
          base["Authorization"] = `Bearer ${token}`
          return { headers: base, devFallback: false }
        }
        // Token có nhưng role không đủ quyền → trong dev dùng fallback, tránh gửi Authorization
        if (!isProduction) {
          base["X-Role"] = "admin"
          return { headers: base, devFallback: true }
        }
        // production: gửi token (sẽ bị 403 nếu không đủ quyền, đúng mong đợi)
        base["Authorization"] = `Bearer ${token}`
        return { headers: base, devFallback: false }
      }
    } catch {
      // ignore
    }
    // Không có token: dev fallback
    if (!isProduction) {
      base["X-Role"] = "admin"
      return { headers: base, devFallback: true }
    }
    return { headers: base, devFallback: false }
  }

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/menu-items")
      const raw = await response.json()
      // Support both shapes: { success, data } or { items }
      const list: BackendItem[] = raw?.data ?? raw?.items ?? []
      if (!Array.isArray(list)) {
        setError(raw?.error || "Failed to fetch menu items")
      } else {
        setMenuItems(list.map(toFrontItem))
        setError(null)
      }
    } catch (err) {
      setError("Network error")
      console.error("Error fetching menu items:", err)
    } finally {
      setLoading(false)
    }
  }

  const createMenuItem = async (item: Omit<MenuItem, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { headers, devFallback } = await buildAuthHeaders()
      const url = devFallback ? "/api/menu-items?role=admin" : "/api/menu-items"
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(toBackendPayload(item)),
      })

      const raw = await response.json()
      const created: BackendItem[] = raw?.data ?? raw?.items ?? []
      if (Array.isArray(created) && created.length > 0) {
        const newItem = toFrontItem(created[0])
        setMenuItems((prev) => [...prev, newItem])
        return newItem
      }
      throw new Error(raw?.error || "Failed to create menu item")
    } catch (err) {
      console.error("Error creating menu item:", err)
      throw err
    }
  }

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const { headers, devFallback } = await buildAuthHeaders()
      const url = devFallback ? `/api/menu-items/${id}?role=admin` : `/api/menu-items/${id}`
      const response = await fetch(url, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(toBackendPayload(updates)),
      })

      const raw = await response.json()
      const updated: BackendItem = raw?.data ?? raw?.item
      if (updated && updated.id) {
        const newItem = toFrontItem(updated)
        setMenuItems((prev) => prev.map((it) => (it.id === id ? newItem : it)))
        return newItem
      }
      throw new Error(raw?.error || "Failed to update menu item")
    } catch (err) {
      console.error("Error updating menu item:", err)
      throw err
    }
  }

  const deleteMenuItem = async (id: string) => {
    try {
      const { headers, devFallback } = await buildAuthHeaders()
      const url = devFallback ? `/api/menu-items/${id}?role=admin` : `/api/menu-items/${id}`
      const response = await fetch(url, {
        method: "DELETE",
        headers: headers,
      })

      const raw = await response.json()
      if (raw?.ok || raw?.success) {
        setMenuItems((prev) => prev.filter((item) => item.id !== id))
      } else {
        throw new Error(raw?.error || "Failed to delete menu item")
      }
    } catch (err) {
      console.error("Error deleting menu item:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  return {
    menuItems,
    loading,
    error,
    refetch: fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
  }
}
