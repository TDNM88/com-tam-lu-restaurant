"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Star, Clock } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrandHeader } from "@/components/brand-header"
import { useMenuItems } from "@/hooks/use-menu-items"
import type { MenuItem } from "@/lib/types"

interface CartItem extends MenuItem {
  quantity: number
}

export function CustomerOrderInterface({ tableNumber }: { tableNumber?: string }) {
  const { menuItems, loading: menuLoading } = useMenuItems()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất Cả")
  const [isCartOpen, setIsCartOpen] = useState(false)

  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((m) => m.category)))
    return ["Tất Cả", ...cats]
  }, [menuItems])

  const filteredItems = useMemo(
    () => (selectedCategory === "Tất Cả" ? menuItems : menuItems.filter((i) => i.category === selectedCategory)),
    [menuItems, selectedCategory],
  )

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

  const getTotalPrice = () => cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0)

  const formatPrice = (price: number) =>
    price === 0 ? "MIỄN PHÍ" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)

  const submitOrder = () => {
    alert(`Đơn hàng đã được gửi cho bàn ${tableNumber || "N/A"}!\nTổng tiền: ${formatPrice(getTotalPrice())}`)
    setCart([])
    setIsCartOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <BrandHeader tableNumber={tableNumber} />
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button className="relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Giỏ hàng
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold text-amber-700">Giỏ hàng của bạn</SheetTitle>
                  <SheetDescription>Xem lại đơn hàng trước khi xác nhận</SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[60vh] mt-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Giỏ hàng trống</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <Card key={item.id} className="border-amber-200">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                <p className="text-amber-600 font-bold">{formatPrice(item.price)}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeFromCart(item.id)}
                                  className="w-8 h-8 p-0"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addToCart(item)}
                                  className="w-8 h-8 p-0"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {cart.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-amber-600">{formatPrice(getTotalPrice())}</span>
                    </div>
                    <Button
                      onClick={submitOrder}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 text-lg font-semibold shadow-lg"
                    >
                      Xác nhận đơn hàng
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-amber-200">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-400 data-[state=active]:text-white"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {menuLoading && <div className="text-sm text-muted-foreground">Đang tải thực đơn...</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="group hover:shadow-xl transition-all duration-300 border-amber-200 bg-white/90 backdrop-blur-sm overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.isPopular && (
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Phổ biến
                      </Badge>
                    )}
                    {!!item.rating && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-semibold">{item.rating}</span>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-amber-700 transition-colors">
                      {item.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 line-clamp-2">{item.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {item.prepTime && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {item.prepTime}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${item.price === 0 ? "text-green-600" : "text-amber-600"}`}>
                        {formatPrice(item.price)}
                      </span>
                      <Button
                        onClick={() => addToCart(item)}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {item.price === 0 ? "Lấy" : "Thêm"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
