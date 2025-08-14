import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: menuItems, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("available", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Transform the data to match the expected format
    const transformedItems =
      menuItems?.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: item.price,
        category: item.category,
        image: item.image_url,
        isAvailable: item.available,
        isPopular: item.is_popular || false,
        isFree: item.price === 0,
        prepTime: item.prep_time || "10-15 phút",
        rating: item.rating || 4.5,
      })) || []

    return NextResponse.json({
      success: true,
      data: transformedItems,
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

    const { name, description, price, category, imageUrl, isAvailable = true } = body

    if (!name || !price || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const { data: menuItem, error } = await supabase
      .from("menu_items")
      .insert({
        name,
        description: description || "",
        price,
        category,
        image_url: imageUrl,
        available: isAvailable,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: menuItem,
    })
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
