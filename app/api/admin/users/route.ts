import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase-server"
import { auth, isStaffOrAdmin, type Role } from "@/lib/auth"

// POST /api/admin/users
// Body: { email: string, password: string, role: 'owner'|'admin'|'staff' }
// - Chỉ owner hoặc admin mới được gọi. Tạo 'owner' chỉ cho owner.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email || "").trim()
    const password = String(body.password || "").trim()
    const newRole = (body.role as Role) || ("staff" as Role)

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "email & password required" }, { status: 400 })
    }

    const supabase = getSupabaseServiceRoleClient()
    // Detect if there is any existing owner
    const owners = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const hasOwner = ((owners?.data?.users as any[]) || []).some((u: any) => {
      const r = (u.app_metadata as any)?.role || (u.user_metadata as any)?.role
      return String(r).toLowerCase() === "owner"
    })

    // Authorization rules:
    // - If at least one owner exists: only admin/owner can create; creating owner requires requester be owner
    // - If no owner exists: allow creating an owner without auth (bootstrap). Other roles still require auth.
    if (hasOwner) {
      const { role: reqRole } = await auth(req)
      if (!isStaffOrAdmin(reqRole)) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
      }
      if (newRole === "owner" && reqRole !== "owner") {
        return NextResponse.json({ success: false, error: "Only owner can create owner" }, { status: 403 })
      }
    } else {
      // Bootstrap: only permit creating owner as the very first account
      if (newRole !== "owner") {
        return NextResponse.json({ success: false, error: "First account must be owner" }, { status: 400 })
      }
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: newRole },
      app_metadata: { role: newRole },
    })
    if (error) throw error

    return NextResponse.json(
      {
        success: true,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          role: (data.user?.app_metadata as any)?.role || (data.user?.user_metadata as any)?.role || newRole,
        },
      },
      { status: 201 }
    )
  } catch (e: any) {
    console.error("POST /api/admin/users error:", e?.message || e)
    return NextResponse.json({ success: false, error: e?.message || "Failed to create user" }, { status: 500 })
  }
}
