"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CustomerOrderStatus } from "@/components/customer/order-status"

export default function OrderStatusPage() {
  const params = useSearchParams()
  const qTable = params.get("tableNumber") || params.get("table") || undefined
  const [tableNumber, setTableNumber] = useState<string | undefined>(undefined)

  useEffect(() => {
    setTableNumber(qTable || undefined)
  }, [qTable])

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <h1 className="text-2xl font-bold">Theo dõi đơn hàng</h1>
      <p className="text-sm text-muted-foreground">Nhập số bàn hoặc truy cập bằng liên kết chứa tham số ?tableNumber.</p>
      <CustomerOrderStatus tableNumber={tableNumber} />
    </div>
  )
}
