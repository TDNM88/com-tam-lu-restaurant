import { type NextRequest, NextResponse } from "next/server"

// Mock database - In production, use a real database
const orders: any[] = []

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status } = body
    const orderId = params.id

    const orderIndex = orders.findIndex((order) => order.id === orderId)

    if (orderIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 },
      )
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      status,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      order: orders[orderIndex],
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order",
      },
      { status: 500 },
    )
  }
}
