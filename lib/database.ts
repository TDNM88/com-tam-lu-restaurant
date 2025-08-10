import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)

// Low-level DB helpers (snake_case). Route handlers normalize to camelCase DTOs.
export const db = {
  // Menu Items
  async getMenuItems() {
    // Assumes menu_items uses snake_case like: id, name, description, price, category_id, is_available, etc.
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("isAvailable", true)
      .order("category", { ascending: true })

    if (error) throw error
    return data
  },

  async getMenuItemById(id: string) {
    const { data, error } = await supabase.from("menu_items").select("*").eq("id", id).single()
    if (error) throw error
    return data
  },

  async createMenuItem(item: Record<string, any>) {
    const payload = {
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from("menu_items").insert([payload]).select().single()
    if (error) throw error
    return data
  },

  async updateMenuItem(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from("menu_items")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteMenuItem(id: string) {
    const { error } = await supabase.from("menu_items").delete().eq("id", id)
    if (error) throw error
  },

  // Orders
  async getOrdersRaw() {
    // Return snake_case rows with joins. IMPORTANT: select special_requests (not note).
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        tableNumber,
        status,
        notes,
        order_time,
        totalAmount,
        completed_at,
        order_items (
          id,
          order_id,
          menu_item_id,
          quantity,
          unit_price,
          subtotal,
          special_requests,
          menu_items (
            id,
            name,
            price
          )
        )
      `,
      )
      .order("order_time", { ascending: false })

    if (error) throw error
    return data
  },

  async createOrderWithItems(orderInput: {
    tableNumber: string
    items: {
      menuItemId: string
      quantity: number
      unitPrice: number
      subtotal: number
      specialRequests?: string
    }[]
    totalAmount: number
    status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
    notes?: string
  }) {
    // Insert into orders
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          tableNumber: orderInput.tableNumber,
          status: orderInput.status,
          notes: orderInput.notes ?? null,
          order_time: new Date().toISOString(),
          totalAmount: orderInput.totalAmount,
        },
      ])
      .select()
      .single()

    if (orderError) throw orderError

    // Insert order items
    if (orderInput.items?.length) {
      const itemsPayload = orderInput.items.map((it) => ({
        order_id: order.id,
        menu_item_id: it.menuItemId,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        subtotal: it.subtotal,
        // Persist in the correct column: special_requests
        special_requests: it.specialRequests ?? null,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(itemsPayload)
      if (itemsError) throw itemsError
    }

    // Fetch full order with joins
    const { data: full, error: fullErr } = await supabase
      .from("orders")
      .select(
        `
        id,
        tableNumber,
        status,
        notes,
        order_time,
        totalAmount,
        completed_at,
        order_items (
          id,
          order_id,
          menu_item_id,
          quantity,
          unit_price,
          subtotal,
          special_requests,
          menu_items (
            id,
            name,
            price
          )
        )
      `,
      )
      .eq("id", order.id)
      .single()

    if (fullErr) throw fullErr
    return full
  },

  async updateOrderStatus(id: string, status: string) {
    const update: Record<string, any> = { status }
    if (status === "completed") {
      update.completed_at = new Date().toISOString()
    }

    const { error } = await supabase.from("orders").update(update).eq("id", id)
    if (error) throw error

    // Return with items for completeness
    const { data: full, error: err2 } = await supabase
      .from("orders")
      .select(
        `
        id,
        tableNumber,
        status,
        notes,
        order_time,
        totalAmount,
        completed_at,
        order_items (
          id,
          order_id,
          menu_item_id,
          quantity,
          unit_price,
          subtotal,
          special_requests,
          menu_items (
            id,
            name,
            price
          )
        )
      `,
      )
      .eq("id", id)
      .single()

    if (err2) throw err2
    return full
  },

  // Tables
  async getTables() {
    const { data, error } = await supabase.from("tables").select("*").order("tableNumber", { ascending: true })
    if (error) throw error
    return data
  },

  async updateTableStatus(id: string, status: string) {
    const { data, error } = await supabase.from("tables").update({ status }).eq("id", id).select().single()
    if (error) throw error
    return data
  },
}
