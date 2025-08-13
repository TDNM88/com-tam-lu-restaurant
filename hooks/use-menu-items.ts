"use client"

import { useState, useEffect, useCallback } from "react"

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  available: boolean
  category: string | null
  sortOrder: number
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateMenuItemData {
  name: string
  description?: string
  price: number
  category?: string
  imageUrl?: string
  available?: boolean
  sortOrder?: number
}

export interface UpdateMenuItemData extends Partial<CreateMenuItemData> {}

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/menu-items", {
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

      // Handle different response formats from the API
      let items: MenuItem[] = []
      if (result.items && Array.isArray(result.items)) {
        items = result.items
      } else if (result.success && Array.isArray(result.data)) {
        items = result.data
      } else if (Array.isArray(result)) {
        items = result
      } else {
        console.warn("Unexpected API response format:", result)
        items = []
      }

      setMenuItems(items)
    } catch (err: any) {
      console.error("useMenuItems fetch error:", err)
      setError(err.message || "Failed to fetch menu items")
      setMenuItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createMenuItem = useCallback(
    async (itemData: CreateMenuItemData) => {
      try {
        setError(null)

        const response = await fetch("/api/menu-items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.items && Array.isArray(result.items)) {
          // Refresh the menu items list
          await fetchMenuItems()
          return result.items[0]
        } else if (result.item) {
          await fetchMenuItems()
          return result.item
        } else {
          throw new Error(result.error || "Failed to create menu item")
        }
      } catch (err: any) {
        console.error("Create menu item error:", err)
        setError(err.message || "Failed to create menu item")
        throw err
      }
    },
    [fetchMenuItems],
  )

  const updateMenuItem = useCallback(
    async (id: string, updates: UpdateMenuItemData) => {
      try {
        setError(null)

        const response = await fetch(`/api/menu-items/${id}`, {
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

        if (result.item) {
          await fetchMenuItems()
          return result.item
        } else {
          throw new Error(result.error || "Failed to update menu item")
        }
      } catch (err: any) {
        console.error("Update menu item error:", err)
        setError(err.message || "Failed to update menu item")
        throw err
      }
    },
    [fetchMenuItems],
  )

  const deleteMenuItem = useCallback(
    async (id: string) => {
      try {
        setError(null)

        const response = await fetch(`/api/menu-items/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.ok || result.success) {
          await fetchMenuItems()
          return true
        } else {
          throw new Error(result.error || "Failed to delete menu item")
        }
      } catch (err: any) {
        console.error("Delete menu item error:", err)
        setError(err.message || "Failed to delete menu item")
        throw err
      }
    },
    [fetchMenuItems],
  )

  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

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
