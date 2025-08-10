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

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseServiceRoleClient()
    const url = new URL(req.url)
    const q = url.searchParams.get("q")?.trim()
    let query = supabase
      .from("menu_items")
      .select("*")
      .order("name", { ascending: true })

    if (q) {
      // Basic search by name or category
      query = query.ilike("name", `%${q}%`)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const items = (data || []).map(mapRow)
    return NextResponse.json({ items })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { role } = await auth(req)
    if (!isStaffOrAdmin(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const payload = {
      name: String(body.name ?? "").trim(),
      description: body.description ?? null,
      price: Number(body.price ?? 0),
      available: body.available ?? true,
      category: body.category ?? null,
      sort_order: Number(body.sortOrder ?? 0),
      // Write to both columns so either schema works
      image_url: body.imageUrl ?? body.image ?? null,
      image: body.image ?? body.imageUrl ?? null,
    }

    if (!payload.name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase
      .from("menu_items")
      .upsert(payload, { onConflict: "name", ignoreDuplicates: false })
      .select("*")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ items: (data || []).map(mapRow) }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 })
  }
}
