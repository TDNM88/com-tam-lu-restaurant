"use client"

import { useState, useEffect } from "react"

export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  available: boolean
  created_at: string
  updated_at: string
}

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/menu-items", {
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
        setMenuItems(result.data || [])
      } else {
        throw new Error(result.error || "Failed to fetch menu items")
      }
    } catch (err: any) {
      console.error("useMenuItems fetch error:", err)
      setError(err.message || "Failed to fetch menu items")
      setMenuItems([])
    } finally {
      setLoading(false)
    }
  }

  const createMenuItem = async (itemData: Omit<MenuItem, "id" | "created_at" | "updated_at">) => {
    try {
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

      if (result.success) {
        // Refresh menu items after creating
        await fetchMenuItems()
        return result.data
      } else {
        throw new Error(result.error || "Failed to create menu item")
      }
    } catch (err: any) {
      console.error("Create menu item error:", err)
      throw err
    }
  }

  const updateMenuItem = async (id: string, itemData: Partial<Omit<MenuItem, "id" | "created_at" | "updated_at">>) => {
    try {
      const response = await fetch(`/api/menu-items/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Refresh menu items after updating
        await fetchMenuItems()
        return result.data
      } else {
        throw new Error(result.error || "Failed to update menu item")
      }
    } catch (err: any) {
      console.error("Update menu item error:", err)
      throw err
    }
  }

  const deleteMenuItem = async (id: string) => {
    try {
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

      if (result.success) {
        // Refresh menu items after deleting
        await fetchMenuItems()
        return true
      } else {
        throw new Error(result.error || "Failed to delete menu item")
      }
    } catch (err: any) {
      console.error("Delete menu item error:", err)
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
