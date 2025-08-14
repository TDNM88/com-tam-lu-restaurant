"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useOrders } from "@/hooks/use-orders"
import { useRealtimeOrders } from "@/hooks/use-realtime-orders"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Clock, CheckCircle, AlertCircle, DollarSign, ChefHat, Bell } from "lucide-react"
import { MenuManager } from "@/components/admin/menu-manager"

export function AdminDashboard() {
  const { orders = [], loading, refetch } = useOrders()
  const [selectedTab, setSelectedTab] = useState("orders")

  useRealtimeOrders(() => {
    refetch()
  })

  useEffect(() => {
    refetch()
  }, [refetch])

  const pendingOrders = orders.filter((order) => order.status === "pending")
  const preparingOrders = orders.filter((order) => order.status === "preparing")
  const readyOrders = orders.filter((order) => order.status === "ready")
  const completedOrders = orders.filter((order) => order.status === "completed")

  const totalRevenue = orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + (order.total_amount || 0), 0)

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update order status")
      refetch()
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Chờ xử lý", variant: "secondary" as const, icon: Clock },
      preparing: { label: "Đang chế biến", variant: "default" as const, icon: ChefHat },
      ready: { label: "Sẵn sàng", variant: "outline" as const, icon: Bell },
      completed: { label: "Hoàn thành", variant: "secondary" as const, icon: CheckCircle },
      cancelled: { label: "Đã hủy", variant: "destructive" as const, icon: AlertCircle },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = { pending: "preparing", preparing: "ready", ready: "completed" }
    return statusFlow[currentStatus as keyof typeof statusFlow]
  }

  const getNextStatusLabel = (currentStatus: string) => {
    const labels = { pending: "Bắt đầu chế biến", preparing: "Đánh dấu sẵn sàng", ready: "Hoàn thành đơn hàng" }
    return labels[currentStatus as keyof typeof labels]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý nhà hàng</h1>
            <p className="text-gray-600">Cơm Tấm LU - Dashboard</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đơn hàng chờ</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
              <p className="text-xs text-muted-foreground">Cần xử lý ngay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang chế biến</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{preparingOrders.length}</div>
              <p className="text-xs text-muted-foreground">Đang trong bếp</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sẵn sàng phục vụ</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readyOrders.length}</div>
              <p className="text-xs text-muted-foreground">Chờ phục vụ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu hôm nay</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString()}đ</div>
              <p className="text-xs text-muted-foreground">Từ {completedOrders.length} đơn hàng</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
            <TabsTrigger value="menu">Thực đơn</TabsTrigger>
            <TabsTrigger value="analytics">Thống kê</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Pending Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Đơn hàng mới ({pendingOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {pendingOrders.map((order) => (
                        <Card key={order.id} className="border-l-4 border-l-yellow-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold">Bàn {order.table_number}</p>
                                <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleTimeString("vi-VN")}</p>
                              </div>
                              {getStatusBadge(order.status)}
                            </div>

                            <div className="space-y-1 mb-3">
                              {order.rawItems?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span>
                                    {item.name} x{item.quantity}
                                  </span>
                                  <span>{(item.unitPrice * item.quantity).toLocaleString()}đ</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="font-bold">Tổng: {order.total_amount?.toLocaleString()}đ</span>
                              <Button size="sm" onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}>
                                {getNextStatusLabel(order.status)}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Preparing Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    Đang chế biến ({preparingOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {preparingOrders.map((order) => (
                        <Card key={order.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold">Bàn {order.table_number}</p>
                                <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleTimeString("vi-VN")}</p>
                              </div>
                              {getStatusBadge(order.status)}
                            </div>

                            <div className="space-y-1 mb-3">
                              {order.rawItems?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span>
                                    {item.name} x{item.quantity}
                                  </span>
                                  <span>{(item.unitPrice * item.quantity).toLocaleString()}đ</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="font-bold">Tổng: {order.total_amount?.toLocaleString()}đ</span>
                              <Button size="sm" onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}>
                                {getNextStatusLabel(order.status)}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Ready Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Sẵn sàng phục vụ ({readyOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {readyOrders.map((order) => (
                        <Card key={order.id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold">Bàn {order.table_number}</p>
                                <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleTimeString("vi-VN")}</p>
                              </div>
                              {getStatusBadge(order.status)}
                            </div>

                            <div className="space-y-1 mb-3">
                              {order.rawItems?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span>
                                    {item.name} x{item.quantity}
                                  </span>
                                  <span>{(item.unitPrice * item.quantity).toLocaleString()}đ</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="font-bold">Tổng: {order.total_amount?.toLocaleString()}đ</span>
                              <Button size="sm" onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}>
                                {getNextStatusLabel(order.status)}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="menu">
            <MenuManager />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê doanh thu</CardTitle>
                <CardDescription>Xem báo cáo chi tiết về doanh thu và đơn hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">Tính năng thống kê sẽ được phát triển</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
