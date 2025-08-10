"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/image-upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useMenuItems } from "@/hooks/use-menu-items"
import type { MenuItem } from "@/lib/types"

const categories = [
  { id: "signature", name: "Món chính" },
  { id: "addon", name: "Món thêm" },
  { id: "drink", name: "Nước uống" },
]

export function MenuManagement() {
  const { menuItems, loading, error, createMenuItem, updateMenuItem, deleteMenuItem, refetch } = useMenuItems()
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<MenuItem>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const { toast } = useToast()

  useEffect(() => {
    if (error) {
      toast({ title: "Lỗi", description: error, variant: "destructive" })
    }
  }, [error])

  const handleAddNew = () => {
    setEditingItem(null)
    setFormData({
      name: "",
      shortName: "",
      description: "",
      price: 0,
      image: "",
      category: "signature",
      rating: 4.5,
      prepTime: "",
      isPopular: false,
      isFree: false,
      isAvailable: true,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData(item)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || formData.price === undefined || !formData.category) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền tên, giá và danh mục.",
        variant: "destructive",
      })
      return
    }
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData)
        toast({ title: "Đã cập nhật", description: "Món ăn đã được cập nhật thành công." })
      } else {
        await createMenuItem({
          name: formData.name!,
          shortName: formData.shortName || "",
          description: formData.description || "",
          price: Number(formData.price || 0),
          image: formData.image || "",
          category: formData.category!,
          rating: Number(formData.rating || 4.5),
          prepTime: formData.prepTime || "",
          isPopular: Boolean(formData.isPopular),
          isFree: Boolean(formData.isFree),
          isAvailable: formData.isAvailable ?? true,
        })
        toast({ title: "Đã thêm", description: "Món ăn mới đã được thêm." })
      }
      setIsDialogOpen(false)
      setFormData({})
      setEditingItem(null)
      refetch()
    } catch (e: any) {
      toast({ title: "Lỗi lưu dữ liệu", description: e?.message || "Không thể lưu", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa món này?")) return
    try {
      await deleteMenuItem(id)
      toast({ title: "Đã xóa", description: "Món ăn đã được xóa khỏi thực đơn" })
    } catch (e: any) {
      toast({ title: "Lỗi xóa món", description: e?.message || "Không thể xóa", variant: "destructive" })
    }
  }

  const formatPrice = (price: number) =>
    price === 0 ? "MIỄN PHÍ" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>()
    for (const it of menuItems) {
      const key = it.category || "other"
      map.set(key, [...(map.get(key) || []), it])
    }
    return map
  }, [menuItems])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-amber-700">Quản lý thực đơn</h2>
          <p className="text-gray-600">Thêm, sửa, xóa các món ăn (lưu trực tiếp vào cơ sở dữ liệu)</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Thêm món mới
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}</DialogTitle>
              <DialogDescription>Điền thông tin chi tiết về món ăn</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tên món đầy đủ</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Cơm Tấm Lu Sườn Đặc Biệt"
                  />
                </div>

                <div>
                  <Label htmlFor="shortName">Tên rút gọn</Label>
                  <Input
                    id="shortName"
                    value={formData.shortName || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shortName: e.target.value }))}
                    placeholder="Sườn Đặc Biệt"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả chi tiết về món ăn..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Giá (VNĐ)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price ?? 0}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseInt(e.target.value) || 0 }))}
                    placeholder="68000"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Danh mục</Label>
                  <Select
                    value={formData.category || "signature"}
                    onValueChange={(value: string) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rating">Đánh giá</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min={1}
                    max={5}
                    value={formData.rating ?? 4.5}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, rating: Number.parseFloat(e.target.value) || 4.5 }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Thời gian chế biến</Label>
                <Input
                  value={formData.prepTime || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, prepTime: e.target.value }))}
                  placeholder="15-20 phút"
                />
              </div>

              <ImageUpload
                currentImage={formData.image}
                itemName={formData.name}
                onImageUploaded={(url) => setFormData((prev) => ({ ...prev, image: url }))}
              />

              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isPopular || false}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isPopular: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Món phổ biến</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isFree || false}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isFree: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Miễn phí</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable ?? true}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isAvailable: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Đang bán</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                  <Save className="w-4 h-4 mr-2" />
                  Lưu
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status/Loading */}
      {loading && <div className="text-sm text-muted-foreground">Đang tải thực đơn...</div>}

      {/* Bộ lọc danh mục */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => setSelectedCategory("all")}
        >
          Tất cả
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Danh sách theo filter */}
      <div className="space-y-8">
        {(selectedCategory === "all" ? categories : categories.filter((c) => c.id === selectedCategory)).map(
          (cat) => {
            const items = itemsByCategory.get(cat.id) || []
            if (items.length === 0) return null
            return (
              <div key={cat.id} className="space-y-3">
                <h3 className="text-lg font-semibold">{cat.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="relative h-44">
                        {item.image ? (
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">Chưa có hình ảnh</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 flex gap-1">
                          {item.isPopular && <Badge className="bg-red-500 text-white">Phổ biến</Badge>}
                          {item.isFree && <Badge className="bg-green-500 text-white">Miễn phí</Badge>}
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{item.shortName || item.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <span
                            className={`text-xl font-bold ${item.price === 0 ? "text-green-600" : "text-orange-600"}`}
                          >
                            {formatPrice(item.price)}
                          </span>
                          <Badge variant="outline">⭐ {item.rating}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="flex-1">
                            <Edit className="w-4 h-4 mr-1" />
                            Sửa
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}
