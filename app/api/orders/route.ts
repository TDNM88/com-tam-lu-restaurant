import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase-server"
import { auth } from "@/lib/auth"

type OrderRow = {
  id: string
  table_number: string | null
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  notes: string | null
  order_time?: string
  created_at?: string
  total_amount: number | null
  completed_at: string | null
}

type OrderItemRow = {
  id: string
  order_id: string
  menu_item_id: string | null
  quantity: number
  unit_price: number | null
  subtotal: number | null
  special_requests: string | null
}

type MenuItemRow = {
  id: string
  name: string
  price: number | null
  image_url: string | null
}

function toDto(order: OrderRow, items: (OrderItemRow & { menu?: MenuItemRow | null })[]) {
  const rawItems = items.map((it) => {
    const unit = Number(it.unit_price ?? it.menu?.price ?? 0)
    const qty = Number(it.quantity || 1)
    return {
      menuItemId: it.menu_item_id,
      name: it.menu?.name ?? "Món",
      quantity: qty,
      unitPrice: unit,
      subtotal: Number(it.subtotal ?? unit * qty),
      note: it.special_requests ?? null,
      imageUrl: it.menu?.image_url ?? null,
    }
  })
  return {
    id: order.id,
    tableNumber: String(order.table_number ?? ""),
    status: order.status,
    notes: order.notes,
    orderTime: order.order_time ?? order.created_at ?? new Date().toISOString(),
    completedAt: order.completed_at,
    totalAmount: Number(order.total_amount ?? 0),
    items: rawItems.map((i) => i.name),
    rawItems,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { role } = await auth(request)
    const { searchParams } = new URL(request.url)
    const tableFilter = searchParams.get("table")?.trim()

    const supabase = getSupabaseServiceRoleClient()

    // Build query based on role and table filter
    let query = supabase.from("orders").select("*")

    // Apply table filter for non-admin/staff users
    if (!(role === "admin" || role === "staff")) {
      if (!tableFilter) {
        return NextResponse.json({ success: true, data: [] }, { status: 200 })
      }
      query = query.eq("table_number", tableFilter)
    }

    // Try to order by order_time first, fallback to created_at
    let ordersRes = await query.order("order_time", { ascending: false })

    if (ordersRes.error) {
      const errorMsg = String(ordersRes.error.message || "").toLowerCase()
      if (errorMsg.includes("order_time") && errorMsg.includes("does not exist")) {
        // Fallback to created_at if order_time column doesn't exist
        ordersRes = await query.order("created_at", { ascending: false })
      }
    }

    if (ordersRes.error) {
      const errorMsg = String(ordersRes.error.message || "")
      if (errorMsg.includes("relation") && errorMsg.includes("does not exist")) {
        // Database tables don't exist yet
        return NextResponse.json({ success: true, data: [] }, { status: 200 })
      }
      console.error("Orders query error:", ordersRes.error)
      return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
    }

    const orders: OrderRow[] = ordersRes.data || []
    if (!orders.length) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 })
    }

    // Fetch order items
    const orderIds = orders.map((o) => o.id)
    const { data: orderItems, error: itemsErr } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds)

    if (itemsErr) {
      console.error("Order items query error:", itemsErr)
      return NextResponse.json({ success: false, error: "Failed to fetch order items" }, { status: 500 })
    }

    // Fetch menu items for the order items
    const menuIds = Array.from(
      new Set((orderItems || []).map((i: OrderItemRow) => i.menu_item_id).filter(Boolean)),
    ) as string[]

    let menuById = new Map<string, MenuItemRow>()
    if (menuIds.length > 0) {
      const { data: menuData, error: menuErr } = await supabase
        .from("menu_items")
        .select("id, name, price, image_url")
        .in("id", menuIds)

      if (menuErr) {
        console.error("Menu items query error:", menuErr)
        return NextResponse.json({ success: false, error: "Failed to fetch menu items" }, { status: 500 })
      }

      if (menuData) {
        menuById = new Map(menuData.map((m: MenuItemRow) => [m.id, m]))
      }
    }

    // Group order items by order
    const itemsByOrder = new Map<string, (OrderItemRow & { menu?: MenuItemRow | null })[]>()
    for (const item of orderItems || []) {
      const orderItems = itemsByOrder.get(item.order_id) || []
      orderItems.push({
        ...item,
        menu: item.menu_item_id ? menuById.get(item.menu_item_id) || null : null,
      })
      itemsByOrder.set(item.order_id, orderItems)
    }

    // Convert to DTOs
    const dto = orders.map((order) => toDto(order, itemsByOrder.get(order.id) || []))

    return NextResponse.json({ success: true, data: dto }, { status: 200 })
  } catch (error: any) {
    console.error("GET /api/orders error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const tableNumber = String(body.tableNumber || "").trim()
    const items = Array.isArray(body.items) ? body.items : []
    const totalAmount = Number(body.totalAmount || 0)
    const notes = body.notes ? String(body.notes) : null

    if (!tableNumber || !items.length || isNaN(totalAmount)) {
      return NextResponse.json({ success: false, error: "Thiếu thông tin đơn hàng" }, { status: 400 })
    }

    const supabase = getSupabaseServiceRoleClient()

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        table_number: tableNumber,
        status: "pending",
        notes,
        order_time: new Date().toISOString(),
        total_amount: totalAmount,
        completed_at: null,
      })
      .select("*")
      .single()

    if (orderErr || !order) {
      console.error("Order insert error:", orderErr)
      return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
    }

    // Create order items
    if (items.length > 0) {
      const orderItemsData = items.map((item: any) => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        quantity: Number(item.quantity || 1),
        unit_price: Number(item.unitPrice || 0),
        subtotal: Number(item.subtotal || item.unitPrice * item.quantity),
        special_requests: item.note || null,
      }))

      const { error: itemsErr } = await supabase.from("order_items").insert(orderItemsData)

      if (itemsErr) {
        console.error("Order items insert error:", itemsErr)
        return NextResponse.json({ success: false, error: "Failed to create order items" }, { status: 500 })
      }
    }

    // Fetch the complete order with items
    const { data: fetchedItems, error: fetchErr } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id)

    if (fetchErr) {
      console.error("Fetch order items error:", fetchErr)
      return NextResponse.json({ success: false, error: "Failed to fetch order items" }, { status: 500 })
    }

    // Fetch menu items for the order
    const menuIds = Array.from(
      new Set((fetchedItems || []).map((i: OrderItemRow) => i.menu_item_id).filter(Boolean)),
    ) as string[]

    let menuById = new Map<string, MenuItemRow>()
    if (menuIds.length > 0) {
      const { data: menuData, error: menuErr } = await supabase
        .from("menu_items")
        .select("id, name, price, image_url")
        .in("id", menuIds)

      if (menuErr) {
        console.error("Menu fetch error:", menuErr)
        return NextResponse.json({ success: false, error: "Failed to fetch menu items" }, { status: 500 })
      }

      if (menuData) {
        menuById = new Map(menuData.map((m: MenuItemRow) => [m.id, m]))
      }
    }

    // Enrich items with menu data
    const enrichedItems = (fetchedItems || []).map((item: OrderItemRow) => ({
      ...item,
      menu: item.menu_item_id ? menuById.get(item.menu_item_id) || null : null,
    }))

    const dto = toDto(order, enrichedItems)

    return NextResponse.json({ success: true, data: dto, message: "Order created successfully" }, { status: 201 })
  } catch (error: any) {
    console.error("POST /api/orders error:", error)
    return NextResponse.json({ success: false, error: "Không thể tạo đơn hàng" }, { status: 500 })
  }
}
