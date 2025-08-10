import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase-server"
import { auth, isStaffOrAdmin } from "@/lib/auth"

function mapRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    price: typeof row.price === "number" ? row.price : Number(row.price ?? 0),
    available: row.available ?? true,
    category: row.category ?? null,
    sortOrder: row.sort_order ?? 0,
    imageUrl: row.image_url ?? row.image ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase.from("menu_items").select("*").eq("id", ctx.params.id).single()
    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json({ item: mapRow(data) })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 })
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const { role } = await auth(req)
    if (!isStaffOrAdmin(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const updates: any = {
      ...(body.name !== undefined && { name: String(body.name) }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price !== undefined && { price: Number(body.price) }),
      ...(body.available !== undefined && { available: !!body.available }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.sortOrder !== undefined && { sort_order: Number(body.sortOrder) }),
    }
    if (body.imageUrl !== undefined || body.image !== undefined) {
      updates.image_url = body.imageUrl ?? body.image ?? null
      updates.image = body.image ?? body.imageUrl ?? null
    }

    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase
      .from("menu_items")
      .update(updates)
      .eq("id", ctx.params.id)
      .select("*")
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ item: mapRow(data) })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  try {
    const { role } = await auth(req)
    if (!isStaffOrAdmin(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const supabase = getSupabaseServiceRoleClient()
    const { error } = await supabase.from("menu_items").delete().eq("id", ctx.params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 })
  }
}
