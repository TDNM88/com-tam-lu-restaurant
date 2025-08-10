import { type NextRequest, NextResponse } from "next/server"
import type { Role } from "@/lib/auth"

// GET returns current role from cookie
export async function GET(req: NextRequest) {
  const role = (req.cookies.get("role")?.value || "customer") as Role
  return NextResponse.json({ success: true, role })
}

// POST sets role cookie for easy QA: { "role": "admin" | "staff" | "customer" }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const role = (body?.role || "customer") as Role
    if (!["admin", "staff", "customer"].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 })
    }
    const res = NextResponse.json({ success: true, role })
    res.cookies.set("role", role, {
      httpOnly: false,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
    return res
  } catch (e) {
    return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 })
  }
}
