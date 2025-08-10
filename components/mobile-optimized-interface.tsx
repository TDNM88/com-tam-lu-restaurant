"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  Plus,
  Minus,
  Star,
  Heart,
  Clock,
  CheckCircle,
  Eye,
  X,
  Bell,
  MessageCircle,
  Receipt,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SearchAndFilter } from "./customer/search-and-filter"
import { FeedbackDialog } from "./customer/feedback-dialog"
import { useTableFromQR } from "@/hooks/use-table-from-qr"
import { useOrders } from "@/hooks/use-orders"
import { useRealtimeOrders } from "@/hooks/use-realtime-orders"
import { useMenuItems } from "@/hooks/use-menu-items"
import type { MenuItem } from "@/lib/types"
import { FeaturedStrip } from "@/components/featured-strip"

type PaymentMethod = "pay_later" | "online"

interface CartItem extends MenuItem {
  quantity: number
  note?: string
}

const defaultCategories = [
  { id: "signature", name: "Món chính", emoji: "🍱" },
  { id: "addon", name: "Món thêm", emoji: "🥚" },
  { id: "drink", name: "Nước uống", emoji: "🧋" },
]

export function MobileOptimizedInterface({ tableNumber: tableNumberProp }: { tableNumber?: string }) {
  const tableNumber = useTableFromQR(tableNumberProp)
  const { menuItems, loading: menuLoading } = useMenuItems()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("signature")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pay_later")
  const [acceptsPush, setAcceptsPush] = useState<NotificationPermission>("default")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const { toast } = useToast()
  const { orders, createOrder, refetch } = useOrders({ tableNumber })

  useRealtimeOrders(() => {
    refetch()
  })

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setAcceptsPush(Notification.permission)
    }
  }, [])

  const categories =
    menuItems.length > 0
      ? Array.from(new Set(menuItems.map((m) => m.category))).map((c) => ({
          id: c,
          name: defaultCategories.find((d) => d.id === c)?.name || c,
          emoji: defaultCategories.find((d) => d.id === c)?.emoji || "🍽️",
        }))
      : defaultCategories

  // Nếu danh mục hiện tại không có trong dữ liệu, tự động chọn danh mục hợp lệ đầu tiên
  useEffect(() => {
    if (categories.length === 0) return
    const exists = categories.some((c) => c.id === selectedCategory)
    if (!exists) setSelectedCategory(categories[0].id)
  }, [categories, selectedCategory])

  const filteredItems = useMemo(() => {
    const pool = menuItems.filter((i) => i.category === selectedCategory)
    if (!search.trim()) return pool
    const q = search.trim().toLowerCase()
    return pool.filter((i) => i.name.toLowerCase().includes(q) || i.shortName.toLowerCase().includes(q))
  }, [menuItems, selectedCategory, search])

  const addToCart = (item: MenuItem, options?: { note?: string }) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id && (options?.note || "") === (c.note || ""))
      if (existing) {
        return prev.map((c) => (c === existing ? { ...c, quantity: c.quantity + 1 } : c))
      }
      return [...prev, { ...item, quantity: 1, note: options?.note }]
    })
    toast({
      title: "Đã thêm vào giỏ",
      description: `${item.shortName || item.name} ${options?.note ? `• ${options.note}` : ""}`,
    })
  }

  const updateNote = (idx: number, note: string) => {
    setCart((prev) => prev.map((c, i) => (i === idx ? { ...c, note } : c)))
  }

  const removeFromCart = (index: number) => {
    setCart((prev) => {
      const item = prev[index]
      if (item.quantity > 1) {
        return prev.map((c, i) => (i === index ? { ...c, quantity: c.quantity - 1 } : c))
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const clearCart = () => {
    setCart([])
    toast({ title: "Đã xóa giỏ hàng", description: "Tất cả món ăn đã được xóa khỏi giỏ hàng" })
  }

  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const getTotalPrice = () => cart.reduce((total, item) => total + item.price * item.quantity, 0)

  const taxRate = 0.1
  const subtotal = getTotalPrice()
  const tax = Math.round(subtotal * taxRate)
  const grandTotal = subtotal + tax

  const formatPrice = (price: number) =>
    price === 0 ? "MIỄN PHÍ" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)

  const requestPush = async () => {
    if (!("Notification" in window)) {
      toast({ title: "Thiết bị không hỗ trợ thông báo", variant: "destructive" })
      return
    }
    const perm = await Notification.requestPermission()
    setAcceptsPush(perm)
    if (perm === "granted") {
      new Notification("Cơm Tấm LU", { body: "Bạn sẽ nhận thông báo khi món sẵn sàng." })
    }
  }

  const callStaff = async () => {
    toast({ title: "Đã gửi yêu cầu", description: `Nhân viên sẽ đến bàn ${tableNumber}` })
  }

  const submitOrder = async () => {
    if (!tableNumber) {
      toast({ title: "Thiếu thông tin bàn", description: "Vui lòng quét QR để nhận diện bàn", variant: "destructive" })
      return
    }
    if (cart.length === 0) {
      toast({ title: "Giỏ hàng trống", description: "Vui lòng chọn món trước khi đặt hàng", variant: "destructive" })
      return
    }

    const itemsPayload = cart.map((c) => ({
      menuItemId: c.id,
      name: c.name,
      quantity: c.quantity,
      unitPrice: c.price,
      note: c.note,
      subtotal: c.price * c.quantity,
    }))

    try {
      const created = await createOrder({
        tableNumber,
        items: itemsPayload,
        totalAmount: grandTotal,
        notes: paymentMethod === "pay_later" ? "Thanh toán sau" : "Thanh toán online",
      })

      setIsCartOpen(false)
      setCart([])

      toast({
        title: "Đặt hàng thành công! 🎉",
        description: `Mã đơn ${created.id?.slice?.(-4) || ""} • Tổng: ${formatPrice(grandTotal)}`,
      })

      if (acceptsPush === "granted") {
        new Notification("Đơn đã tiếp nhận", { body: "Chúng tôi đang chế biến món cho bạn." })
      }
      setIsOrderHistoryOpen(true)
    } catch (e: any) {
      toast({ title: "Lỗi đặt hàng", description: e?.message || "Không thể tạo đơn hàng", variant: "destructive" })
    }
  }

  const myOrders = useMemo(
    () => orders.filter((o: any) => String(o.tableNumber) === String(tableNumber)),
    [orders, tableNumber],
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Hero */}
      <div className="relative h-48 overflow-hidden">
        <img src="/images/lu-oven-2.jpg" alt="Cơm Tấm Lu" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-1">CƠM TẤM LU</h1>
            <p className="text-sm italic">{"Ngon có gu – Nhanh có Lu"}</p>
            {tableNumber && <Badge className="mt-2 bg-orange-500 text-white px-3 py-1">Bàn {tableNumber}</Badge>}
          </div>
        </div>
      </div>

      <FeaturedStrip />

      {/* Top actions */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsOrderHistoryOpen(true)} className="gap-2">
            <Eye className="w-4 h-4" />
            Đơn hàng ({myOrders.length})
          </Button>
          <Button variant="outline" size="sm" onClick={callStaff} className="gap-2 bg-transparent">
            <Bell className="w-4 h-4" />
            Gọi nhân viên
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {acceptsPush !== "granted" && (
            <Button variant="outline" size="sm" onClick={requestPush} className="gap-2 bg-transparent">
              <MessageCircle className="w-4 h-4" />
              Bật thông báo
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setIsCartOpen(true)} className="relative gap-2">
            <ShoppingCart className="w-4 h-4" />
            Giỏ hàng
            {cart.length > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
                {cart.reduce((a, c) => a + c.quantity, 0)}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Search + Categories + View mode toggle */}
      <SearchAndFilter
        categories={categories}
        activeCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        search={search}
        onSearchChange={setSearch}
      />
      <div className="px-4 -mt-2 mb-2 flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant={viewMode === "list" ? "default" : "outline"}
          className={viewMode === "list" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
          onClick={() => setViewMode("list")}
        >
          Danh sách
        </Button>
        <Button
          size="sm"
          variant={viewMode === "grid" ? "default" : "outline"}
          className={viewMode === "grid" ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}
          onClick={() => setViewMode("grid")}
        >
          Lưới
        </Button>
      </div>

      {/* Items */}
      <div className="p-4 pb-24">
        {menuLoading && <div className="text-sm text-muted-foreground">Đang tải thực đơn...</div>}
        {viewMode === "list" ? (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="border-0 shadow-md bg-white">
                <CardContent className="p-3">
                  <div className="flex items-stretch gap-3">
                    <div className="relative">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.shortName || item.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      {item.isPopular && (
                        <Badge className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1 py-0.5">
                          <Star className="w-2 h-2 mr-0.5" /> Hot
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2">{item.shortName || item.name}</h3>
                      {item.prepTime && (
                        <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.prepTime}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {item.category}
                        </Badge>
                        {item.isFree && (
                          <Badge className="bg-green-500 text-white text-[10px]">MIỄN PHÍ</Badge>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`font-bold ${item.isFree ? "text-green-600" : "text-orange-600"}`}>
                          {formatPrice(item.price)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => toggleFavorite(item.id)}
                            aria-label="Yêu thích"
                          >
                            <Heart
                              className={`w-3 h-3 ${
                                favorites.includes(item.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                              }`}
                            />
                          </Button>
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white h-8" onClick={() => addToCart(item)}>
                            <Plus className="w-3 h-3 mr-1" /> Thêm
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden border-0 shadow-md bg-white">
                <div className="relative">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.shortName || item.name}
                    className="w-full h-28 object-cover"
                  />
                  <div className="absolute top-1 left-1 flex gap-1">
                    {item.isPopular && (
                      <Badge className="bg-red-500 text-white text-[10px] px-1 py-0.5">
                        <Star className="w-2 h-2 mr-0.5" />
                        Hot
                      </Badge>
                    )}
                    {item.isFree && <Badge className="bg-green-500 text-white text-[10px] px-1 py-0.5">FREE</Badge>}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-1 right-1 w-6 h-6 p-0 bg-white/80 hover:bg-white"
                    onClick={() => toggleFavorite(item.id)}
                    aria-label="Yêu thích"
                  >
                    <Heart
                      className={`w-3 h-3 ${favorites.includes(item.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                    />
                  </Button>
                  {item.prepTime && (
                    <div className="absolute bottom-1 left-1 bg-white/90 rounded-full px-1.5 py-0.5 flex items-center">
                      <Clock className="w-2 h-2 mr-0.5 text-muted-foreground" />
                      <span className="text-[10px] font-medium">{item.prepTime}</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-2">
                  <h3 className="font-bold text-xs mb-1 line-clamp-2 min-h-[2rem]">{item.shortName || item.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${item.isFree ? "text-green-600" : "text-orange-600"}`}>
                      {formatPrice(item.price)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => addToCart(item)}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-7 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Thêm
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cart */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 flex flex-col">
          <div className="p-4 border-b">
            <SheetHeader className="pb-2">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-bold">
                  Giỏ hàng ({cart.reduce((a, c) => a + c.quantity, 0)} món)
                </SheetTitle>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4 mr-1" />
                    Xóa tất cả
                  </Button>
                )}
              </div>
            </SheetHeader>
          </div>

          {/* Scrollable items area */}
          <ScrollArea className="flex-1 px-4">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Chưa có món nào trong giỏ hàng</p>
                <p className="text-sm mt-2">Hãy chọn món yêu thích của bạn!</p>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                {cart.map((item, index) => (
                  <Card key={`${item.id}-${index}`} className="border border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.shortName || item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">{item.shortName || item.name}</h4>
                            <span className="text-orange-600 font-bold text-sm">{formatPrice(item.price)}</span>
                          </div>
                          <div className="mt-2 grid grid-cols-1 gap-2">
                            <div>
                              <Label htmlFor={`note-${index}`} className="text-xs text-muted-foreground">
                                Ghi chú (ví dụ: Không hành)
                              </Label>
                              <Input
                                id={`note-${index}`}
                                value={item.note || ""}
                                onChange={(e) => updateNote(index, e.target.value)}
                                placeholder="Tuỳ chọn"
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-6">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(index)}
                            className="w-7 h-7 p-0 rounded-full"
                            aria-label="Giảm số lượng"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-bold text-base w-6 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            onClick={() => addToCart(item, { note: item.note })}
                            className="w-7 h-7 p-0 rounded-full bg-orange-500 hover:bg-orange-600"
                            aria-label="Tăng số lượng"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Sticky footer summary + action */}
          {cart.length > 0 && (
            <div className="sticky bottom-0 w-full bg-white border-t">
              <div className="p-4 space-y-3">
                <div className="bg-orange-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Thuế (10%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Tổng</span>
                    <span className="text-orange-600">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <div className="rounded-xl p-4 border bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-4 h-4 text-orange-600" />
                    <h4 className="font-semibold">Phương thức thanh toán</h4>
                  </div>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                    className="grid gap-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="pay_later" value="pay_later" />
                      <Label htmlFor="pay_later">Thanh toán sau tại quầy</Label>
                    </div>
                    <div className="flex items-center space-x-2 opacity-70">
                      <RadioGroupItem id="online" value="online" />
                      <Label htmlFor="online">Thanh toán online (sắp ra mắt)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  onClick={submitOrder}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg font-bold rounded-xl"
                >
                  Đặt món ngay
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Order History */}
      <Sheet open={isOrderHistoryOpen} onOpenChange={setIsOrderHistoryOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl font-bold">Đơn hàng của bàn {tableNumber || "?"}</SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[78vh] px-1">
            {myOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order: any) => (
                  <Card key={order.id} className="border border-gray-200">
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">Đơn #{order.id?.slice?.(-4)}</div>
                        <StatusBadge status={order.status as any} />
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Thời gian: {order.orderTime?.slice?.(11, 16) || ""}</span>
                        <span>
                          Tổng: <span className="font-semibold text-orange-600">{formatPrice(order.totalAmount)}</span>
                        </span>
                      </div>

                      <Separator className="my-2" />

                      <div className="space-y-2 mb-3">
                        {(order.rawItems || []).map((it: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span>{it.name}</span>
                              <span className="text-gray-500">x{it.quantity}</span>
                              {it.note && <span className="text-xs italic text-gray-500">({it.note})</span>}
                            </div>
                            <span className="font-medium">
                              {formatPrice(Number(it.unitPrice || 0) * Number(it.quantity || 1))}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-end">
                        <FeedbackDialog
                          orderId={order.id}
                          onSubmit={() => {}}
                          trigger={
                            <Button size="sm" variant="outline">
                              Đánh giá
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function StatusBadge({ status }: { status: "pending" | "preparing" | "ready" | "completed" | "cancelled" }) {
  const map = {
    pending: { label: "Đã tiếp nhận", className: "bg-yellow-500 text-white" },
    preparing: { label: "Đang chế biến", className: "bg-blue-500 text-white" },
    ready: { label: "Hoàn thành", className: "bg-green-500 text-white" },
    completed: { label: "Đã phục vụ", className: "bg-gray-500 text-white" },
    cancelled: { label: "Đã hủy", className: "bg-red-600 text-white" },
  } as const
  const c = map[status] || map.pending
  return (
    <Badge className={`flex items-center gap-1 ${c.className}`}>
      <CheckCircle className="w-3 h-3" /> {c.label}
    </Badge>
  )
}
