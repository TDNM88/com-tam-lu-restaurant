import { NextResponse, type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { tableNumber, reason } = await req.json()

    if (!tableNumber) {
      return NextResponse.json({ success: false, error: "Missing tableNumber" }, { status: 400 })
    }

    // In production: insert into a supabase table "alerts" or publish to a realtime channel for staff devices.
    // For now, we log and return success.
    console.log("[CALL_STAFF]", { tableNumber, reason: reason || "customer_request", at: new Date().toISOString() })

    return NextResponse.json({ success: true, message: "Đã gửi yêu cầu gọi nhân viên" })
  } catch (e) {
    console.error("CALL_STAFF_ERROR", e)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
