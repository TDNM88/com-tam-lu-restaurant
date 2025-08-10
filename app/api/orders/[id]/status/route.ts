import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase-server"
import { auth, assertRole } from "@/lib/auth"

type OrderRow = {
  id: string
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  completed_at: string | null
}

function ok<T>(data: T, init?: number) {
  return NextResponse.json({ success: true, data }, { status: init ?? 200 })
}
function err(message: string, init?: number) {
  return NextResponse.json({ success: false, error: message }, { status: init ?? 500 })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { role } = await auth(req)
    assertRole(role, ["admin", "staff"])

    const body = await req.json()
    const status = String(body.status || "").toLowerCase() as OrderRow["status"]
    if (!["pending", "preparing", "ready", "completed", "cancelled"].includes(status)) {
      return err("Trạng thái không hợp lệ", 400)
    }

    const supabase = getSupabaseServiceRoleClient()
    const patch: Partial<OrderRow> = { status }
    if (status === "completed") patch.completed_at = new Date().toISOString()
    if (status !== "completed") patch.completed_at = null

    const { data, error } = await supabase
      .from("orders")
      .update(patch)
      .eq("id", params.id)
      .select("*")
      .single()
    if (error) throw error
    return ok(data)
  } catch (e: any) {
    console.error("PATCH /api/orders/[id]/status error:", e?.message || e)
    return err("Không thể cập nhật trạng thái", 500)
  }
}
