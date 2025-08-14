"use client"

import { useMemo, useState } from "react"
import { useMenuItems } from "@/hooks/use-menu-items"
import type { MenuItem } from "@/lib/types"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Plus, Edit, Trash2, RefreshCcw } from "lucide-react"
import { toast } from "sonner"

export function MenuManager() {
  const { menuItems, loading, error, createMenuItem, updateMenuItem, deleteMenuItem, refetch } = useMenuItems()

  const [query, setQuery] = useState("")
  const [catFilter, setCatFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [saving, setSaving] = useState(false)

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const m of menuItems || []) if (m.category) set.add(m.category)
    return ["all", ...Array.from(set)]
  }, [menuItems])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (menuItems || []).filter((m) => {
      const matchQ = !q || m.name.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q)
      const matchC = catFilter === "all" || m.category === catFilter
      return matchQ && matchC
    })
  }, [menuItems, query, catFilter])

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    isAvailable: true,
  })

  const resetForm = () =>
    setForm({ name: "", description: "", price: "", category: "", image: "", isAvailable: true })

  const openCreate = () => {
    setEditing(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (item: MenuItem) => {
    setEditing(item)
    setForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price ?? 0),
      category: item.category || "",
      image: item.image || "",
      isAvailable: !!item.isAvailable,
    })
    setDialogOpen(true)
  }

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Tên món là bắt buộc")
    const priceNum = Number(form.price)
    if (Number.isNaN(priceNum) || priceNum < 0) return toast.error("Giá không hợp lệ")

    setSaving(true)
    try {
      if (editing) {
        await updateMenuItem(editing.id, {
          name: form.name.trim(),
          description: form.description,
          price: priceNum,
          category: form.category,
          image: form.image,
          isAvailable: form.isAvailable,
        })
        toast.success("Cập nhật món thành công")
      } else {
        await createMenuItem({
          name: form.name.trim(),
          description: form.description,
          price: priceNum,
          category: form.category,
          image: form.image,
          isAvailable: form.isAvailable,
        })
        toast.success("Thêm món thành công")
      }
      setDialogOpen(false)
      setEditing(null)
      resetForm()
    } catch (e: any) {
      toast.error(e?.message || "Không thể lưu món")
    } finally {
      setSaving(false)
    }
  }

  const toggleAvailable = async (item: MenuItem, value: boolean) => {
    try {
      await updateMenuItem(item.id, { isAvailable: value })
    } catch (e: any) {
      toast.error(e?.message || "Không thể cập nhật trạng thái")
    }
  }

  const remove = async (item: MenuItem) => {
    if (!confirm(`Xóa món "${item.name}"?`)) return
    try {
      await deleteMenuItem(item.id)
      toast.success("Đã xóa món")
    } catch (e: any) {
      toast.error(e?.message || "Không thể xóa món")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Quản lý thực đơn</CardTitle>
          <CardDescription>Thêm, sửa, xóa món ăn và cập nhật trạng thái bán</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Làm mới
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" /> Thêm món
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{editing ? "Cập nhật món" : "Thêm món mới"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên món</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc">Mô tả</Label>
                  <Textarea id="desc" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Giá (đ)</Label>
                    <Input id="price" type="number" inputMode="decimal" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="cat">Danh mục</Label>
                    <Input id="cat" placeholder="VD: Cơm, Món thêm..." value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="img">Ảnh (URL)</Label>
                  <Input id="img" placeholder="https://..." value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label>Đang bán</Label>
                  <Switch checked={form.isAvailable} onCheckedChange={(v) => setForm((f) => ({ ...f, isAvailable: !!v }))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                  Hủy
                </Button>
                <Button onClick={submit} disabled={saving}>
                  {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex items-center gap-2">
                <Input placeholder="Tìm món theo tên/mô tả" value={query} onChange={(e) => setQuery(e.target.value)} className="w-72" />
                <Select value={catFilter} onValueChange={setCatFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c === "all" ? "Tất cả danh mục" : c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên món</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-center">Đang bán</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{m.category}</TableCell>
                      <TableCell className="text-right">{Number(m.price ?? 0).toLocaleString()}đ</TableCell>
                      <TableCell className="text-center">
                        <Switch checked={!!m.isAvailable} onCheckedChange={(v) => toggleAvailable(m, !!v)} />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(m)}>
                          <Edit className="h-4 w-4 mr-1" /> Sửa
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => remove(m)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Xóa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {!filtered.length && (
              <div className="text-center text-sm text-muted-foreground py-8">Không có món phù hợp.</div>
            )}
          </>
        )}
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </CardContent>
    </Card>
  )
}
