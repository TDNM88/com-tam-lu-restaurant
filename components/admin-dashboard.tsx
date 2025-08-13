"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Bell,
  Clock,
  DollarSign,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Users,
  ChefHat,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { MenuManagement } from "@/components/menu-management"
import { useOrders, type OrderDTO } from "@/hooks/use-orders"
import { useRealtimeOrders } from "@/hooks/use-realtime-orders"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

const sidebarItems = [
  {
    title: "Dashboard",
    icon: TrendingUp,
    id: "dashboard",
  },
  {
    title: "Đơn hàng",
    icon: ShoppingCart,
    id: "orders",
  },
  {
    title: "Menu",
    icon: Package,
    id: "menu",
  },
  {
    title: "Bàn",
    icon: Users,
    id: "tables",
  },
  {
    title: "Cài đặt",
    icon: Settings,
    id: "settings",
  },
]

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  preparing: "bg-blue-100 text-blue-800 border-blue-200",
  ready: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

const statusLabels = {
  pending: "Chờ xử lý",
  preparing: "Đang chuẩn bị",
  ready: "Sẵn sàng",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [realtimeEnabled, setRealtimeEnabled] = useState(true)

  const { orders, loading, error, refetch, updateOrderStatus } = useOrders()
  const { toast } = useToast()

  // Enable realtime updates
  useRealtimeOrders({
    enabled: realtimeEnabled,
    onNewOrder: (order) => {
      toast({
        title: "Đơn hàng mới!",
        description: `Bàn ${order.tableNumber} - ${order.totalAmount.toLocaleString()}đ`,
        duration: 5000,
      })
      refetch()
    },
    onOrderUpdate: (order) => {
      toast({
        title: "Cập nhật đơn hàng",
        description: `Bàn ${order.tableNumber} - ${statusLabels[order.status]}`,
        duration: 3000,
      })
      refetch()
    },
  })

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.tableNumber.toString().includes(searchTerm) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    preparingOrders: orders.filter((o) => o.status === "preparing").length,
    completedOrders: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders.filter((o) => o.status === "completed").reduce((sum, order) => sum + order.totalAmount, 0),
    activeTables: new Set(
      orders.filter((o) => o.status !== "completed" && o.status !== "cancelled").map((o) => o.tableNumber),
    ).size,
  }

  const handleStatusUpdate = async (orderId: string, newStatus: OrderDTO["status"]) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus })
      toast({
        title: "Cập nhật thành công",
        description: `Trạng thái đơn hàng đã được cập nhật thành ${statusLabels[newStatus]}`,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái đơn hàng",
        variant: "destructive",
      })
    }
  }

  const DashboardContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan hoạt động nhà hàng</p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={realtimeEnabled} onCheckedChange={setRealtimeEnabled} id="realtime" />
          <label htmlFor="realtime" className="text-sm font-medium">
            Cập nhật realtime
          </label>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
            <ShoppingCart className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs opacity-80">Tất cả đơn hàng</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs opacity-80">Đơn hàng mới</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}đ</div>
            <p className="text-xs opacity-80">Đơn hoàn thành</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bàn hoạt động</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTables}</div>
            <p className="text-xs opacity-80">Đang phục vụ</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
          <CardDescription>Các đơn hàng mới nhất cần xử lý</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-semibold">{order.tableNumber}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Bàn {order.tableNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} món • {order.totalAmount.toLocaleString()}đ
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const OrdersContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">Theo dõi và xử lý đơn hàng</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <Bell className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm kiếm đơn hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ xử lý</SelectItem>
            <SelectItem value="preparing">Đang chuẩn bị</SelectItem>
            <SelectItem value="ready">Sẵn sàng</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Đơn hàng</TableHead>
                <TableHead>Bàn</TableHead>
                <TableHead>Món ăn</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Không có đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-orange-600 font-semibold text-sm">{order.tableNumber}</span>
                        </div>
                        Bàn {order.tableNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="text-sm">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-xs text-muted-foreground">+{order.items.length - 2} món khác</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{order.totalAmount.toLocaleString()}đ</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, "preparing")}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <ChefHat className="h-3 w-3 mr-1" />
                            Chuẩn bị
                          </Button>
                        )}
                        {order.status === "preparing" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, "ready")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sẵn sàng
                          </Button>
                        )}
                        {order.status === "ready" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, "completed")}
                            className="bg-gray-600 hover:bg-gray-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Hoàn thành
                          </Button>
                        )}
                        {(order.status === "pending" || order.status === "preparing") && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(order.id, "cancelled")}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Hủy
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r bg-gradient-to-b from-orange-50 to-red-50">
          <SidebarContent>
            <div className="p-6">
              <h2 className="text-xl font-bold text-orange-600">Cơm Tấm LU</h2>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Menu chính</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTab === item.id}
                        className="w-full justify-start"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex h-16 items-center px-6">
              <SidebarTrigger />
              <div className="ml-auto flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                  {stats.pendingOrders > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">{stats.pendingOrders}</span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {activeTab === "dashboard" && <DashboardContent />}
            {activeTab === "orders" && <OrdersContent />}
            {activeTab === "menu" && <MenuManagement />}
            {activeTab === "tables" && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Quản lý bàn</h2>
                <p className="text-muted-foreground">Tính năng đang phát triển...</p>
              </div>
            )}
            {activeTab === "settings" && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Cài đặt</h2>
                <p className="text-muted-foreground">Tính năng đang phát triển...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
