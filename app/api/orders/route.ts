import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const tableNumber = searchParams.get("tableNumber")

    let query = supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          menu_item_id,
          quantity,
          unit_price,
          subtotal,
          note,
          menu_items (
            id,
            name,
            price
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (tableNumber) {
      query = query.eq("table_number", tableNumber)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Transform the data to include rawItems for compatibility
    const transformedOrders =
      orders?.map((order) => ({
        ...order,
        rawItems:
          order.order_items?.map((item: any) => ({
            id: item.id,
            name: item.menu_items?.name || "Unknown Item",
            quantity: item.quantity,
            unitPrice: item.unit_price,
            subtotal: item.subtotal,
            note: item.note,
          })) || [],
      })) || []

    return NextResponse.json({
      success: true,
      data: transformedOrders,
    })
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { tableNumber, items, totalAmount, notes } = body

    if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        table_number: tableNumber,
        total_amount: totalAmount,
        status: "pending",
        notes: notes || "",
        order_time: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return NextResponse.json({ success: false, error: orderError.message }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal,
      note: item.note || item.specialRequests || "",
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Order items creation error:", itemsError)
      // Try to clean up the order if items failed
      await supabase.from("orders").delete().eq("id", order.id)
      return NextResponse.json({ success: false, error: itemsError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
