"use client"

import { useState, useEffect } from "react"
import type { MenuItem } from "@/lib/types"

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      await fetchMenuItems()
    }
    init()
  }, [])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/menu-items")
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch menu items")
      }

      setMenuItems(result.data || [])
    } catch (err: any) {
      console.error("Error fetching menu items:", err)
      setError(err.message)
      setMenuItems([])
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    await fetchMenuItems()
  }

  const createMenuItem = async (data: Partial<MenuItem> & { name: string; price: number; category: string }) => {
    const payload = {
      name: data.name,
      description: data.description ?? "",
      price: Number(data.price ?? 0),
      category: data.category,
      imageUrl: data.image ?? "",
      isAvailable: data.isAvailable ?? true,
    }
    const res = await fetch("/api/menu-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Không thể tạo món ăn")
    }
    await refetch()
  }

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    // Map một số trường theo API PATCH
    const payload: any = {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.price !== undefined && { price: Number(updates.price) }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.image !== undefined && { imageUrl: updates.image }),
      ...(updates.isAvailable !== undefined && { available: updates.isAvailable }),
    }
    const res = await fetch(`/api/menu-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) {
      throw new Error(json?.error || "Không thể cập nhật món ăn")
    }
    await refetch()
  }

  const deleteMenuItem = async (id: string) => {
    const res = await fetch(`/api/menu-items/${id}`, { method: "DELETE" })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(json?.error || "Không thể xóa món ăn")
    }
    // Optimistic update
    setMenuItems((prev) => prev.filter((m) => m.id !== id))
  }

  return {
    menuItems,
    loading,
    error,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    refetch,
  }
}
