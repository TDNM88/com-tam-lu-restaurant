"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useOrders } from "@/hooks/use-orders"
import { useRealtimeOrders } from "@/hooks/use-realtime-orders"
import { Clock, ChefHat, Bell, CheckCircle, AlertCircle } from "lucide-react"

function StatusBadge({ status }: { status: string }) {
  const map = {
    pending: { label: "Chờ xác nhận", variant: "secondary" as const, Icon: Clock },
    preparing: { label: "Đang chế biến", variant: "default" as const, Icon: ChefHat },
    ready: { label: "Sẵn sàng nhận", variant: "outline" as const, Icon: Bell },
    completed: { label: "Đã hoàn thành", variant: "secondary" as const, Icon: CheckCircle },
    cancelled: { label: "Đã hủy", variant: "destructive" as const, Icon: AlertCircle },
  }
  const cfg = (map as any)[status] ?? map.pending
  const Icon = cfg.Icon
  return (
    <Badge variant={cfg.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  )
}

function Step({ active, done, label, Icon }: { active: boolean; done: boolean; label: string; Icon: any }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border ${
          done ? "bg-green-500 text-white border-green-500" : active ? "bg-orange-500 text-white border-orange-500" : "bg-muted"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  )
}

export function CustomerOrderStatus({ tableNumber: initialTable }: { tableNumber?: string }) {
  const [tableNumber, setTableNumber] = useState<string | undefined>(initialTable)
  const { orders, loading, refetch } = useOrders({ tableNumber })

  useRealtimeOrders(() => {
    refetch()
  })

  useEffect(() => {
    // fallback lấy từ localStorage nếu không có query
    if (!tableNumber) {
      const saved = typeof window !== "undefined" ? window.localStorage.getItem("tableNumber") || undefined : undefined
      if (saved) setTableNumber(saved)
    } else {
      // lưu lại để khách dễ quay lại xem
      window.localStorage.setItem("tableNumber", tableNumber)
    }
  }, [tableNumber])

  const currentOrder = useMemo(() => {
    if (!orders?.length) return null
    // chọn đơn mới nhất theo created_at
    const sorted = [...orders].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return sorted[0]
  }, [orders])

  const status = currentOrder?.status || "pending"
  const steps = [
    { key: "pending", label: "Chờ xác nhận", Icon: Clock },
    { key: "preparing", label: "Đang chế biến", Icon: ChefHat },
    { key: "ready", label: "Sẵn sàng nhận", Icon: Bell },
    { key: "completed", label: "Hoàn thành", Icon: CheckCircle },
  ] as const

  const activeIndex = steps.findIndex((s) => s.key === status)

  if (!tableNumber) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nhập số bàn</CardTitle>
          <CardDescription>Vui lòng nhập số bàn để xem trạng thái đơn hàng.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget as HTMLFormElement)
              const val = String(fd.get("table"))
              if (val) setTableNumber(val)
            }}
          >
            <input name="table" required placeholder="VD: 5" className="flex-1 rounded-md border px-3 py-2" />
            <Button type="submit">Xác nhận</Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (loading && !currentOrder) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
            <CardDescription>Bàn {tableNumber}</CardDescription>
          </div>
          <StatusBadge status={status} />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            {steps.map((s, idx) => (
              <Step key={s.key as string} active={idx === activeIndex} done={idx <= activeIndex} label={s.label} Icon={s.Icon} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết đơn</CardTitle>
          <CardDescription>
            Mã đơn: {currentOrder?.id ?? "—"} • Thời gian: {currentOrder?.created_at ? new Date(currentOrder.created_at).toLocaleTimeString("vi-VN") : "—"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!currentOrder ? (
            <div className="text-center text-sm text-muted-foreground">Chưa có đơn hàng cho bàn này.</div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {(currentOrder.rawItems || []).map((it: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{it.name}</div>
                      {it.note ? <div className="text-xs text-muted-foreground">Ghi chú: {it.note}</div> : null}
                    </div>
                    <div className="whitespace-nowrap">x{it.quantity}</div>
                    <div className="w-24 text-right">{(it.unitPrice * it.quantity).toLocaleString()}đ</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <div className="text-sm text-muted-foreground">Tổng tiền</div>
            <div className="text-base font-semibold">{currentOrder?.total_amount?.toLocaleString() ?? 0}đ</div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
