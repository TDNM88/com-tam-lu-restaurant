"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart3,
  Clock,
  DollarSign,
  Package,
  Settings,
  ShoppingBag,
  Users,
  CheckCircle,
  AlertCircle,
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TablesManager } from "@/components/admin/tables-manager"

const menuItems = [
  { name: "Quản lý đơn hàng", icon: ShoppingBag, id: "orders" },
  { name: "Thực đơn", icon: Package, id: "menu" },
  { name: "Bàn ăn & QR", icon: Users, id: "tables" },
  { name: "Thống kê", icon: BarChart3, id: "analytics" },
  { name: "Cài đặt", icon: Settings, id: "settings" },
]

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders")
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const { orders, updateOrderStatus, loading, error, refetch } = useOrders({ role: "admin" })
  const { toast } = useToast()
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"all" | OrderDTO["status"]>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = useMemo(() => {
    let data = [...orders]
    if (showPendingOnly) data = data.filter((o) => o.status === "pending")
    if (statusFilter !== "all") data = data.filter((o) => o.status === statusFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      data = data.filter((o) => o.id.toLowerCase().includes(q) || String(o.tableNumber).includes(q))
    }
    return data
  }, [orders, showPendingOnly, statusFilter, searchQuery])

  const getStatusBadge = (status: OrderDTO["status"]) => {
    const statusConfig = {
      pending: { label: "Chờ xử lý", variant: "destructive" as const, icon: AlertCircle },
      preparing: { label: "Đang chuẩn bị", variant: "default" as const, icon: Clock },
      ready: { label: "Sẵn sàng", variant: "secondary" as const, icon: CheckCircle },
      completed: { label: "Hoàn thành", variant: "outline" as const, icon: CheckCircle },
      cancelled: { label: "Đã hủy", variant: "destructive" as const, icon: AlertCircle },
    }
    const cfg = statusConfig[status] ?? statusConfig.pending
    const Icon = cfg.icon
    return (
      <Badge variant={cfg.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {cfg.label}
      </Badge>
    )
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)

  // Realtime: lắng nghe thay đổi bảng orders để tự động cập nhật và hiển thị thông báo
  useRealtimeOrders((payload) => {
    try {
      const evt = payload?.eventType as string | undefined
      const rowNew = payload?.new || {}
      const rowOld = payload?.old || {}
      const tableNumber = rowNew.tableNumber ?? rowNew.table_number ?? rowOld.tableNumber ?? rowOld.table_number
      const total = rowNew.totalAmount ?? rowNew.total ?? rowOld.totalAmount ?? rowOld.total ?? 0

      if (evt === "INSERT") {
        refetch()
        toast({
          title: "Đơn hàng mới",
          description: `${tableNumber ? `Bàn ${tableNumber} • ` : ""}${formatPrice(Number(total) || 0)}`,
        })
      } else if (evt === "UPDATE") {
        refetch()
        const status = rowNew.status ?? rowOld.status
        toast({
          title: "Cập nhật đơn hàng",
          description: `${tableNumber ? `Bàn ${tableNumber} • ` : ""}Trạng thái: ${status ?? "unknown"}`,
        })
      }
    } catch {
      // no-op: an toàn UI
    }
  })

  const AppSidebar = () => (
    <Sidebar
      className={`${sidebarExpanded ? "w-[240px]" : "w-[72px]"} bg-white border-r border-neutral-200 transition-[width] duration-300 ease-in-out`}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={`text-base font-semibold text-neutral-700 ${sidebarExpanded ? "opacity-100" : "opacity-0 pointer-events-none"} transition-opacity duration-200`}>
            Cơm Tấm LU Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    className={`w-full ${sidebarExpanded ? "justify-start" : "justify-center"} text-neutral-700 data-[active=true]:bg-neutral-100 transition-colors duration-200 hover:bg-neutral-50`}
                  >
                    <item.icon className="w-4 h-4" aria-hidden />
                    {sidebarExpanded && <span>{item.name}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-neutral-50">
        <AppSidebar />
        <main className="flex-1">
          {/* Global background layer */}
          <div className="pointer-events-none fixed inset-0 -z-10">
            <img
              src="/images/chi-19k.jpg"
              alt="Background"
              className={`w-full h-full object-cover opacity-65`}
            />
            <div className={`absolute inset-0 bg-gradient-to-b from-white/10 via-white/18 to-white/75`} />
          </div>
          {/* Sticky header - translucent with blur */}
          <div className="sticky top-0 z-40 bg-white/55 backdrop-blur border-b border-neutral-200 shadow-sm supports-[backdrop-filter]:bg-white/45">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger />
                  <h1 className="text-2xl lg:text-3xl font-semibold text-neutral-800">AI F&B</h1>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant={activeTab === "orders" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("orders")}
                    className="relative transition-all duration-200 hover:shadow-md hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-orange-400/60"
                  >
                    Đơn hàng
                    {(() => {
                      const pendingCount = orders.filter((o) => o.status === "pending").length
                      return pendingCount > 0 ? (
                        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] leading-none px-1.5 py-0.5">
                          {pendingCount}
                        </span>
                      ) : null
                    })()}
                  </Button>
                  <Button
                    variant={activeTab === "menu" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("menu")}
                    className="transition-all duration-200 hover:shadow-md hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-orange-400/60"
                  >
                    Thực đơn
                  </Button>
                  <Button
                    variant={activeTab === "tables" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("tables")}
                    className="transition-all duration-200 hover:shadow-md hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-orange-400/60"
                  > 
                    Bàn & QR
                  </Button>
                  <Button
                    variant={activeTab === "analytics" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("analytics")}
                    className="transition-all duration-200 hover:shadow-md hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-orange-400/60"
                  >
                    Thống kê
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="border-neutral-300 text-neutral-700 transition-all duration-200 hover:shadow-md hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-orange-400/60"
                  >
                    Làm mới
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Hero banner */}
          <section className="relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
              <div className="h-48 sm:h-56 lg:h-64 w-full overflow-hidden rounded-xl shadow-sm relative">
                {/* Hero image (original) */}
                <img
                  src="/images/lu-oven-2.jpg"
                  alt="Cơm Tấm LU"
                  className="w-full h-full object-cover"
                />
                {/* Dreamy overlays */}
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-center drop-shadow">
                    Trung tâm quản trị Cơm Tấm LU
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-white/90 text-center max-w-2xl">
                    Theo dõi đơn hàng theo thời gian thực, quản lý thực đơn, bàn & báo cáo hiệu suất.
                  </p>
                  <div className="mt-4 w-full max-w-3xl md:hidden">
                    <div className="mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-white/45 backdrop-blur-md rounded-xl p-2 sm:p-3 ring-1 ring-white/40 shadow-sm">
                      <Button variant="secondary" className="w-full" onClick={() => setActiveTab("orders")}> 
                        Đơn hàng
                      </Button>
                      <Button variant="secondary" className="w-full" onClick={() => setActiveTab("menu")}>
                        Thực đơn
                      </Button>
                      <Button variant="secondary" className="w-full" onClick={() => setActiveTab("tables")}>
                        Bàn & QR
                      </Button>
                      <Button variant="secondary" className="w-full" onClick={() => setActiveTab("analytics")}>
                        Thống kê
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Page content */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-6">

          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="grid grid-cols-12 gap-4">
                <Card className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white/95 backdrop-blur-[1px] border border-neutral-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-700">Đơn hàng hiện có</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-neutral-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold text-neutral-900">{orders.length}</div>
                    <p className="text-xs text-neutral-500">Cập nhật theo thời gian thực (client)</p>
                  </CardContent>
                </Card>

                <Card className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-neutral-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-700">Doanh thu</CardTitle>
                    <DollarSign className="h-4 w-4 text-neutral-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold text-neutral-900">
                      {formatPrice(orders.reduce((s, o) => s + (o.totalAmount || 0), 0))}
                    </div>
                    <p className="text-xs text-neutral-500">Tính theo danh sách hiển thị</p>
                  </CardContent>
                </Card>

                <Card className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-neutral-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-700">Bàn đang phục vụ</CardTitle>
                    <Users className="h-4 w-4 text-neutral-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold text-neutral-900">
                      {new Set(orders.map((o) => o.tableNumber)).size}
                    </div>
                    <p className="text-xs text-neutral-500">Theo dữ liệu đơn hàng</p>
                  </CardContent>
                </Card>

                <Card className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-neutral-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-700">Trạng thái</CardTitle>
                    <Clock className="h-4 w-4 text-neutral-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-neutral-600">
                      Pending: {orders.filter((o) => o.status === "pending").length} • Preparing:{" "}
                      {orders.filter((o) => o.status === "preparing").length} • Ready:{" "}
                      {orders.filter((o) => o.status === "ready").length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white/95 backdrop-blur-[1px] border border-neutral-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="text-lg font-semibold text-neutral-800">Đơn hàng hiện tại</CardTitle>
                      <CardDescription className="text-neutral-500 flex items-center gap-2">
                        Quản lý và theo dõi trạng thái đơn hàng
                        {(() => {
                          const pendingCount = orders.filter((o) => o.status === "pending").length
                          return pendingCount > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-red-50 text-red-600 text-xs px-2 py-0.5 ring-1 ring-inset ring-red-200">
                              {pendingCount} đơn mới
                            </span>
                          ) : null
                        })()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-full sm:w-auto">
                        <Input
                          placeholder="Tìm theo mã đơn hoặc số bàn..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-[240px] sm:w-[260px]"
                        />
                      </div>
                      <div className="w-full sm:w-auto">
                        <Select value={statusFilter} onValueChange={(v: string) => setStatusFilter(v as any)}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Lọc theo trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="pending">Đơn mới (pending)</SelectItem>
                            <SelectItem value="preparing">Đang chuẩn bị</SelectItem>
                            <SelectItem value="ready">Sẵn sàng</SelectItem>
                            <SelectItem value="completed">Hoàn tất</SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="pending-only" checked={showPendingOnly} onCheckedChange={setShowPendingOnly} />
                        <Label htmlFor="pending-only" className="text-sm text-neutral-700">
                          Chỉ hiển thị đơn mới (pending)
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading && <div className="text-sm text-neutral-500 px-2 py-1">Đang tải đơn hàng...</div>}
                  {error && <div className="text-sm text-red-600 px-2 py-1">Lỗi: {error}</div>}
                  <div className="rounded-xl ring-1 ring-neutral-200/80 overflow-hidden">
                    <div className="max-h-[60vh] overflow-auto overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="sticky top-0 z-[1] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/65 border-b border-neutral-200 [&>th]:py-2">
                            <TableHead className="w-[16%]">Mã đơn</TableHead>
                            <TableHead className="w-[10%]">Bàn</TableHead>
                            <TableHead className="w-[34%]">Món ăn</TableHead>
                            <TableHead className="w-[14%] text-right pr-3">Tổng tiền</TableHead>
                            <TableHead className="w-[12%]">Thời gian</TableHead>
                            <TableHead className="w-[6%]">Trạng thái</TableHead>
                            <TableHead className="w-[8%]">Hành động</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            if (filteredData.length === 0) {
                              return (
                                <TableRow>
                                  <TableCell colSpan={7} className="py-10 text-center text-neutral-500">
                                    {showPendingOnly ? "Hiện chưa có đơn mới (pending)" : "Chưa có đơn hàng nào"}
                                  </TableCell>
                                </TableRow>
                              )
                            }
                            return filteredData.map((order: OrderDTO, idx: number) => (
                              <TableRow
                                key={order.id}
                                className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-neutral-50/60"} hover:bg-neutral-100/60 [&>td]:py-2 [&>td]:align-top`}
                              >
                                <TableCell className="font-medium text-neutral-900 align-top">
                                  <span
                                    className="inline-flex max-w-[180px] truncate items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 font-mono text-[11px] text-neutral-800 ring-1 ring-inset ring-neutral-200"
                                    title={order.id}
                                  >
                                    {order.id}
                                  </span>
                                </TableCell>
                                <TableCell className="text-neutral-700 align-top">Bàn {order.tableNumber}</TableCell>
                                <TableCell className="align-top">
                                  <div className="max-w-[420px] truncate text-neutral-800" title={order.items.join(", ")}>
                                    {order.items.join(", ")}
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold text-amber-600 text-right pr-3 align-top">
                                  {formatPrice(order.totalAmount)}
                                </TableCell>
                                <TableCell className="text-neutral-700 align-top whitespace-nowrap">
                                  {order.orderTime?.slice?.(0, 16)?.replace("T", " ")}
                                </TableCell>
                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                <TableCell className="align-top">
                                  <div className="flex gap-2">
                                    {order.status === "pending" && (
                                      <Button
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, "preparing")}
                                        className="h-8 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:shadow-sm"
                                      >
                                        Bắt đầu
                                      </Button>
                                    )}
                                    {order.status === "preparing" && (
                                      <Button
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, "ready")}
                                        className="h-8 px-3 rounded-md bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:shadow-sm"
                                      >
                                        Hoàn thành
                                      </Button>
                                    )}
                                    {order.status === "ready" && (
                                      <Button
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, "completed")}
                                        className="h-8 px-3 rounded-md bg-neutral-700 hover:bg-neutral-800 text-white transition-all duration-200 hover:shadow-sm"
                                      >
                                        Đã phục vụ
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          })()}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "menu" && <MenuManagement />}

          {activeTab === "tables" && <TablesManager />}

          {activeTab === "analytics" && (
            <Card className="bg-white/95 backdrop-blur-[1px] border border-neutral-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral-800">Thống kê & Báo cáo</CardTitle>
                <CardDescription className="text-neutral-500">Phân tích doanh thu và hiệu suất nhà hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-neutral-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Tính năng thống kê đang được phát triển</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "settings" && (
            <Card className="bg-white/95 backdrop-blur-[1px] border border-neutral-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neutral-800">Cài đặt hệ thống</CardTitle>
                <CardDescription className="text-neutral-500">Cấu hình và tùy chỉnh hệ thống nhà hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-neutral-500">
                  <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Tính năng cài đặt đang được phát triển</p>
                </div>
              </CardContent>
            </Card>
          )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default AdminDashboard
