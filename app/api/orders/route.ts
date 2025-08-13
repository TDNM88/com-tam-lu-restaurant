import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase-server"
import { auth, isStaffOrAdmin } from "@/lib/auth"

function mapOrderRow(row: any) {
  return {
    id: row.id,
    tableNumber: row.table_number || row.tableNumber,
    items: row.items || [],
    totalAmount: typeof row.total_amount === "number" ? row.total_amount : Number(row.total_amount || 0),
    status: row.status || "pending",
    customerName: row.customer_name || row.customerName || null,
    notes: row.notes || null,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  }
}

export async function GET(req: Request) {
  try {
    const { role } = await auth(req)
    if (!isStaffOrAdmin(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const supabase = getSupabaseServiceRoleClient()
    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const tableNumber = url.searchParams.get("table")

    let query = supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (tableNumber) {
      query = query.eq("table_number", Number.parseInt(tableNumber))
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const orders = (data || []).map(mapOrderRow)
    return NextResponse.json({ success: true, data: orders })
  } catch (err: any) {
    console.error("API error:", err)
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const orderData = {
      table_number: Number(body.tableNumber || body.table_number),
      items: body.items || [],
      total_amount: Number(body.totalAmount || body.total_amount || 0),
      status: body.status || "pending",
      customer_name: body.customerName || body.customer_name || null,
      notes: body.notes || null,
    }

    if (!orderData.table_number || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase.from("orders").insert(orderData).select("*").single()

    if (error) {
      console.error("Database error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const order = mapOrderRow(data)
    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (err: any) {
    console.error("API error:", err)
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 })
  }
}
