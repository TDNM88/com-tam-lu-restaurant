import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase-server"
import { getRequestRole, isStaffOrAdmin } from "@/lib/auth"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const role = await getRequestRole(req)
    if (!isStaffOrAdmin(role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }
    const body = await req.json()
    const payload: any = {}
    if (body.status) payload.status = body.status
    if (body.capacity !== undefined) payload.capacity = Number(body.capacity)
    if (body.qrCodeUrl !== undefined) payload.qr_code_url = body.qrCodeUrl

    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase.from("tables").update(payload).eq("id", params.id).select("*").single()
    if (error) throw error
    return NextResponse.json({ success: true, data, message: "Table updated" })
  } catch (e: any) {
    console.error("PATCH /api/tables/[id] error:", e?.message || e)
    return NextResponse.json({ success: false, error: "Failed to update table" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const role = await getRequestRole(req)
    if (!isStaffOrAdmin(role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }
    const supabase = getSupabaseServiceRoleClient()
    const { error } = await supabase.from("tables").delete().eq("id", params.id)
    if (error) throw error
    return NextResponse.json({ success: true, message: "Table deleted" })
  } catch (e: any) {
    console.error("DELETE /api/tables/[id] error:", e?.message || e)
    return NextResponse.json({ success: false, error: "Failed to delete table" }, { status: 500 })
  }
}
