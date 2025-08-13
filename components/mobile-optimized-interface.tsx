"use client"

import { useState, useMemo } from "react"
import { useMenuItems } from "@/hooks/use-menu-items"
import { useOrders } from "@/hooks/use-orders"
import { useTableFromQR } from "@/hooks/use-table-from-qr"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingSpinner } from "@/components/loading-spinner"
import { FeedbackDialog } from "@/components/customer/feedback-dialog"
import { ShoppingCart, Plus, Minus, Star, Clock, Phone, MessageSquare, Heart, Search } from "lucide-react"
import { toast } from "sonner"
import type { MenuItem } from "@/lib/types"

interface CartItem extends MenuItem {
  quantity: number
  specialRequests?: string
}

export function MobileOptimizedInterface({ tableNumber: tableNumberProp }: { tableNumber?: string }) {
  const { tableNumber } = useTableFromQR(tableNumberProp)
  const { menuItems = [], loading: menuLoading } = useMenuItems()
  const { createOrder } = useOrders()

  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false)
  const [orderNotes, setOrderNotes] = useState("")

  // Ensure menuItems is always an array
  const safeMenuItems = Array.isArray(menuItems) ? menuItems : []

  // Get unique categories
  const categories = useMemo(() => {
    if (safeMenuItems.length === 0) return []

    const uniqueCategories = Array.from(new Set(safeMenuItems.map((item) => item.category)))
    return ["all", ...uniqueCategories]
  }, [safeMenuItems])

  // Filter menu items
  const filteredItems = useMemo(() => {
    return safeMenuItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      return matchesSearch && matchesCategory && item.isAvailable
    })
  }, [safeMenuItems, searchQuery, selectedCategory])

  // Cart functions
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id)
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    toast.success(`Đã thêm ${item.name} vào giỏ hàng`)
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === itemId)
      if (existing && existing.quantity > 1) {
        return prev.map((cartItem) =>
          cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem,
        )
      }
      return prev.filter((cartItem) => cartItem.id !== itemId)
    })
  }

  const updateSpecialRequests = (itemId: string, requests: string) => {
    setCart((prev) =>
      prev.map((cartItem) => (cartItem.id === itemId ? { ...cartItem, specialRequests: requests } : cartItem)),
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const submitOrder = async () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống")
      return
    }

    if (!tableNumber) {
      toast.error("Không tìm thấy số bàn")
      return
    }

    setIsOrderSubmitting(true)

    try {
      const orderData = {
        tableNumber,
        items: cart.map((item) => ({
          menuItemId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal: item.price * item.quantity,
          specialRequests: item.specialRequests,
        })),
        totalAmount: getTotalPrice(),
        notes: orderNotes,
      }

      await createOrder(orderData)

      toast.success("Đặt món thành công!")
      clearCart()
      setOrderNotes("")
      setIsCartOpen(false)
    } catch (error: any) {
      console.error("Error submitting order:", error)
      toast.error(error.message || "Có lỗi xảy ra khi đặt món")
    } finally {
      setIsOrderSubmitting(false)
    }
  }

  if (menuLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Cơm Tấm LU</h1>
            {tableNumber && <p className="text-sm text-gray-600">Bàn {tableNumber}</p>}
          </div>

          {/* Cart Button */}
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Giỏ hàng ({getTotalItems()} món)</SheetTitle>
              </SheetHeader>

              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1 py-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Giỏ hàng trống</div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="font-semibold text-orange-600">
                                {(item.price * item.quantity).toLocaleString()}đ
                              </p>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" onClick={() => removeFromCart(item.id)}>
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button size="sm" variant="outline" onClick={() => addToCart(item)}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600">{item.price.toLocaleString()}đ/món</p>
                            </div>

                            <Textarea
                              placeholder="Ghi chú đặc biệt..."
                              value={item.specialRequests || ""}
                              onChange={(e) => updateSpecialRequests(item.id, e.target.value)}
                              className="text-sm"
                              rows={2}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {cart.length > 0 && (
                  <div className="border-t pt-4 space-y-4">
                    <Textarea
                      placeholder="Ghi chú cho đơn hàng..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={2}
                    />

                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Tổng cộng:</span>
                      <span className="text-orange-600">{getTotalPrice().toLocaleString()}đ</span>
                    </div>

                    <Button className="w-full" onClick={submitOrder} disabled={isOrderSubmitting}>
                      {isOrderSubmitting ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Đang đặt món...
                        </>
                      ) : (
                        "Đặt món"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 bg-white border-b">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-2 pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category === "all" ? "Tất cả" : category}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Không tìm thấy món ăn nào</div>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                        {item.isPopular && (
                          <Badge variant="secondary" className="ml-2">
                            <Heart className="h-3 w-3 mr-1" />
                            Phổ biến
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                      <div className="flex items-center space-x-4 mb-3 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-400" />
                          {item.rating || 4.5}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.prepTime || "10-15 phút"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-orange-600">{item.price.toLocaleString()}đ</span>
                          {item.isFree && (
                            <Badge variant="outline" className="text-green-600">
                              Miễn phí
                            </Badge>
                          )}
                        </div>

                        <Button size="sm" onClick={() => addToCart(item)} disabled={!item.isAvailable}>
                          <Plus className="h-4 w-4 mr-1" />
                          Thêm
                        </Button>
                      </div>
                    </div>

                    {item.image && (
                      <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-2">
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1 bg-transparent" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Gọi nhân viên
          </Button>
          <FeedbackDialog>
            <Button variant="outline" className="flex-1 bg-transparent" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Góp ý
            </Button>
          </FeedbackDialog>
        </div>
      </div>
    </div>
  )
}
