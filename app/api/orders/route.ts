import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase-server"
import { auth } from "@/lib/auth"

type OrderRow = {
  id: string
  table_number: string | null
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  notes: string | null
  order_time: string
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

function ok<T>(data: T, init?: number) {
  return NextResponse.json({ success: true, data }, { status: init ?? 200 })
}
function err(message: string, init?: number) {
  return NextResponse.json({ success: false, error: message }, { status: init ?? 500 })
}
function isMissingRelation(e: any) {
  const msg = String(e?.message || e || "")
  return msg.includes("relation") && msg.includes("does not exist")
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
    orderTime: order.order_time,
    completedAt: order.completed_at,
    totalAmount: Number(order.total_amount ?? 0),
    items: rawItems.map((i) => i.name),
    rawItems,
  }
}

export async function GET(req: Request) {
  try {
    const { role } = await auth(req)
    const url = new URL(req.url)
    const tableFilter = url.searchParams.get("table")?.trim()

    const supabase = getSupabaseServiceRoleClient()
    const base = supabase.from("orders").select("*").order("order_time", { ascending: false })

    // If not staff/admin, restrict to provided table (customer view)
    let ordersRes
    if (!(role === "admin" || role === "staff")) {
      if (!tableFilter) return ok([]) // public homepage preview: empty list is fine
      ordersRes = await base.eq("table_number", tableFilter)
    } else {
      ordersRes = await base
    }

    if (ordersRes.error) throw ordersRes.error
    const orders: OrderRow[] = (ordersRes.data as OrderRow[]) || []
    if (!orders.length) return ok([])

    const orderIds = orders.map((o: OrderRow) => o.id)
    const { data: orderItems, error: itemsErr } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds)
    if (itemsErr) throw itemsErr

    const menuIds = Array.from(
      new Set((orderItems as OrderItemRow[]).map((i: OrderItemRow) => i.menu_item_id).filter(Boolean))
    ) as string[]
    let menuById = new Map<string, MenuItemRow>()
    if (menuIds.length) {
      const { data: menuData, error: menuErr } = await supabase
        .from("menu_items")
        .select("id, name, price, image_url")
        .in("id", menuIds)
      if (menuErr) throw menuErr
      menuById = new Map<string, MenuItemRow>(
        ((menuData || []) as MenuItemRow[]).map((m: MenuItemRow) => [m.id, m])
      )
    }

    const itemsByOrder = new Map<string, (OrderItemRow & { menu?: MenuItemRow | null })[]>()
    for (const it of orderItems as OrderItemRow[]) {
      const list = itemsByOrder.get(it.order_id) ?? []
      list.push({ ...it, menu: it.menu_item_id ? (menuById.get(it.menu_item_id) ?? null) : null })
      itemsByOrder.set(it.order_id, list)
    }

    const dto = orders.map((o: OrderRow) => toDto(o, itemsByOrder.get(o.id) ?? []))
    return ok(dto)
  } catch (e: any) {
    if (isMissingRelation(e)) return ok([], 200)
    console.error("GET /api/orders error:", e?.message || e)
    return err("Failed to fetch orders", 500)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const tableNumber: string = String(body.tableNumber ?? "").trim()
    const items: {
      menuItemId: string
      name?: string
      quantity: number
      unitPrice: number
      subtotal?: number
      note?: string
    }[] = Array.isArray(body.items) ? body.items : []
    const totalAmount: number = Number(body.totalAmount ?? 0)
    const notes: string | null = body.notes ? String(body.notes) : null

    if (!tableNumber || !items.length || Number.isNaN(totalAmount)) {
      return err("Thiếu thông tin đơn hàng", 400)
    }

    const supabase = getSupabaseServiceRoleClient()

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
    if (orderErr || !order) throw orderErr || new Error("Order insert failed")

    const rows = items.map((it) => {
      const qty = Number(it.quantity || 1)
      const unit = Number(it.unitPrice || 0)
      return {
        order_id: order.id,
        menu_item_id: it.menuItemId,
        quantity: qty,
        unit_price: unit,
        subtotal: Number(it.subtotal ?? unit * qty),
        special_requests: it.note ?? null,
      }
    })
    if (rows.length) {
      const { error: itemsErr } = await supabase.from("order_items").insert(rows)
      if (itemsErr) throw itemsErr
    }

    const { data: fetchedItems, error: fetchItemsErr } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id)
    if (fetchItemsErr) throw fetchItemsErr

    const menuIds = Array.from(
      new Set(((fetchedItems || []) as OrderItemRow[]).map((i: OrderItemRow) => i.menu_item_id).filter(Boolean))
    ) as string[]
    let menuById = new Map<string, MenuItemRow>()
    if (menuIds.length) {
      const { data: menu, error: menuErr } = await supabase
        .from("menu_items")
        .select("id, name, price, image_url")
        .in("id", menuIds)
      if (menuErr) throw menuErr
      menuById = new Map<string, MenuItemRow>(
        ((menu || []) as MenuItemRow[]).map((m: MenuItemRow) => [m.id, m])
      )
    }

    const enriched = ((fetchedItems || []) as OrderItemRow[]).map((it: OrderItemRow) => ({
      ...it,
      menu: it.menu_item_id ? (menuById.get(it.menu_item_id) ?? null) : null,
    }))
    const dto = toDto(order, enriched)
    return NextResponse.json({ success: true, data: dto, message: "Order created" }, { status: 201 })
  } catch (e: any) {
    console.error("POST /api/orders error:", e?.message || e)
    return err("Không thể tạo đơn hàng", 500)
  }
}
