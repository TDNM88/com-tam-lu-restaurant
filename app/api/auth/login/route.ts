import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email và mật khẩu là bắt buộc" },
        { status: 400 },
      )
    }

    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      return NextResponse.json(
        { success: false, error: "Thiếu cấu hình Supabase (URL/ANON KEY)" },
        { status: 500 },
      )
    }

    const supabase = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "X-Client-Info": "com-tam-lu/api" } },
    })

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      )
    }

    // Trả về thông tin cần thiết, tránh rò rỉ token nhạy cảm
    const safeUser = data.user
      ? {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
        }
      : null

    return NextResponse.json(
      {
        success: true,
        user: safeUser,
        // session.access_token sẵn có trong data.session nếu cần client lưu trữ
        session: data.session ? { access_token: data.session.access_token, token_type: data.session.token_type } : null,
      },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Yêu cầu không hợp lệ" },
      { status: 400 },
    )
  }
}
