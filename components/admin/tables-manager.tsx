"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Copy, Plus, Trash2, Printer } from "lucide-react"
import { supabaseClient } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

type TableRow = {
  id: string
  tableNumber: string
  status: "available" | "occupied" | "disabled"
}

type ApiResponse<T> = { success: boolean; data?: T; error?: string }

function buildOrderUrl(origin: string, tableNumber: string) {
  return `${origin}/?table=${encodeURIComponent(tableNumber)}`
}
function buildQrUrl(orderUrl: string, size: number = 400) {
  const dim = `${size}x${size}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=${dim}&data=${encodeURIComponent(orderUrl)}`
}

export function TablesManager() {
  const [tables, setTables] = useState<TableRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTable, setNewTable] = useState("")
  const [bulkCount, setBulkCount] = useState<number>(0)
  const [qrSize, setQrSize] = useState<number>(400)
  const [query, setQuery] = useState<string>("")
  const { toast } = useToast()

  const origin = typeof window !== "undefined" ? window.location.origin : ""

  async function getAuthHeaders(): Promise<Record<string, string>> {
    const { data } = await supabaseClient.auth.getSession()
    const token = data.session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : ({} as Record<string, string>)
  }

  const fetchTables = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/tables", { cache: "no-store" })
      const json: ApiResponse<TableRow[]> = await res.json()
      if (!json.success) throw new Error(json.error || "Failed to fetch tables")
      setTables(json.data ?? [])
    } catch (e: any) {
      setError(e?.message || "Không thể tải danh sách bàn")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const enriched = useMemo(
    () =>
      tables.map((t) => {
        const link = buildOrderUrl(origin, t.tableNumber)
        const qr = buildQrUrl(link, qrSize)
        return { ...t, link, qr }
      }),
    [tables, origin, qrSize],
  )

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return enriched
    return enriched.filter((t) => t.tableNumber.includes(q))
  }, [enriched, query])

  const addSingle = async () => {
    const num = newTable.trim()
    if (!num) return
    try {
      const authHeaders = await getAuthHeaders()
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders } as HeadersInit,
        body: JSON.stringify({ tableNumber: num }),
      })
      const json: ApiResponse<TableRow[]> = await res.json()
      if (!json.success) throw new Error(json.error || "Failed to add table")
      const added = json.data ?? []
      setTables((prev) => [...prev, ...added])
      setNewTable("")
      const first = added[0]
      if (first) {
        toast({ title: "Đã thêm bàn", description: `Bàn ${first.tableNumber}` })
      } else {
        toast({ title: "Thành công", description: "Đã tạo bàn mới" })
      }
    } catch (e: any) {
      toast({ title: "Lỗi", description: e?.message || "Không thể thêm bàn", variant: "destructive" })
    }
  }

  const bulkAdd = async () => {
    const count = Math.max(0, Math.floor(Number(bulkCount)))
    if (!count) return
    try {
      const authHeaders = await getAuthHeaders()
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders } as HeadersInit,
        body: JSON.stringify({ bulkCount: count }),
      })
      const json: ApiResponse<TableRow[]> = await res.json()
      if (!json.success) throw new Error(json.error || "Failed to add tables")
      setTables((prev) => [...prev, ...(json.data ?? [])])
      setBulkCount(0)
      toast({ title: "Đã thêm nhiều bàn", description: `Số bàn thêm: ${json.data?.length ?? 0}` })
    } catch (e: any) {
      toast({ title: "Lỗi", description: e?.message || "Không thể thêm nhiều bàn", variant: "destructive" })
    }
  }

  const removeTable = async (id: string) => {
    if (!confirm("Xóa bàn này?")) return
    const authHeaders = await getAuthHeaders()
    const res = await fetch(`/api/tables/${id}`, { method: "DELETE", headers: { ...authHeaders } as HeadersInit })
    const json: ApiResponse<unknown> = await res.json()
    if (!json.success) {
      alert(json.error || "Không thể xóa bàn")
      return
    }
    setTables((prev) => prev.filter((t) => t.id !== id))
  }

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      toast({ title: "Đã sao chép", description: "Liên kết gọi món đã được copy" })
    } catch {
      toast({ title: "Lỗi", description: "Không thể copy", variant: "destructive" })
    }
  }

  const downloadQr = (qrUrl: string, tableNumber: string) => {
    const a = document.createElement("a")
    a.href = qrUrl
    a.download = `qr-ban-${tableNumber}.png`
    a.click()
  }

  const printAll = () => {
    const win = window.open("", "_blank")
    if (!win) return
    const html = `
      <html>
        <head>
          <title>QR Mỗi Bàn</title>
          <style>
            @page { size: A4; margin: 16mm; }
            body { font-family: system-ui,-apple-system,Segoe UI,Roboto,Arial; padding: 0; }
            .grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
            .card { border: 1px solid #f59e0b; border-radius: 12px; padding: 12px; text-align: center; }
            .title { font-weight: 700; color: #b45309; margin-bottom: 8px; }
            img { width: ${qrSize}px; height: ${qrSize}px; object-fit: contain; }
            .link { word-break: break-all; font-size: 12px; color: #6b7280; margin-top: 6px; }
            @media print { .page-break { page-break-after: always; } }
          </style>
        </head>
        <body>
          <h1>QR Cố Định Cho Từng Bàn</h1>
          <div class="grid">
            ${enriched
              .map(
                (t) => `
              <div class="card">
                <div class="title">Bàn ${t.tableNumber}</div>
                <img src="${t.qr}" alt="QR Bàn ${t.tableNumber}" />
                <div class="link">${t.link}</div>
              </div>
            `,
              )
              .join("")}
          </div>
          <script>window.onload = () => window.print()</script>
        </body>
      </html>
    `
    win.document.write(html)
    win.document.close()
  }

  const exportCsv = () => {
    const rows = [["tableNumber", "link"] as const, ...enriched.map((t) => [t.tableNumber, t.link] as const)]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "tables.csv"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-amber-700">Quản lý bàn & mã QR</CardTitle>
        <CardDescription>
          Mã QR cố định theo từng bàn. Thêm bàn mới, tải/ in QR nhanh chóng. {loading && "(Đang tải...)"}{" "}
          {error && <span className="text-red-600">• {error}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Số bàn mới</Label>
            <div className="flex gap-2">
              <Input placeholder="VD: 13" value={newTable} onChange={(e) => setNewTable(e.target.value)} />
              <Button onClick={addSingle} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-1" />
                Thêm
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Thêm một bàn với số tùy ý.</p>
          </div>
          <div className="space-y-2">
            <Label>Thêm nhanh nhiều bàn</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="VD: 10"
                value={bulkCount || ""}
                onChange={(e) => setBulkCount(Number(e.target.value))}
              />
              <Button onClick={bulkAdd} variant="outline" className="bg-transparent">
                <Plus className="w-4 h-4 mr-1" />
                Thêm N bàn
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Tự động đánh số tiếp theo.</p>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={printAll} variant="outline" className="bg-transparent">
              <Printer className="w-4 h-4 mr-2" />
              In tất cả QR
            </Button>
            <Button onClick={fetchTables} variant="outline" className="bg-transparent">
              Refresh
            </Button>
          </div>
        </div>

        <Separator />

        {/* Toolbar: Search, QR size, Export */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">Tìm bàn</Label>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nhập số bàn..." className="w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">Kích thước QR</Label>
            <select
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="h-9 rounded-md border border-neutral-300 bg-white/80 px-2"
            >
              <option value={300}>300px</option>
              <option value={400}>400px</option>
              <option value={600}>600px</option>
            </select>
            <Button onClick={exportCsv} variant="outline" className="bg-transparent">
              <Download className="w-4 h-4 mr-1" /> CSV
            </Button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={`sk-${i}`} className="overflow-hidden border-amber-200">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-center">
                    <Skeleton className="h-[200px] w-[200px]" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-9" />
                    <Skeleton className="h-9" />
                    <Skeleton className="h-9" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <Card key={t.id} className="overflow-hidden border-amber-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Bàn {t.tableNumber}</CardTitle>
                    <Badge variant="secondary">Cố định</Badge>
                  </div>
                  <CardDescription className="truncate">{t.link}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-center">
                    <img src={t.qr || "/placeholder.svg"} alt={`QR Bàn ${t.tableNumber}`} className="border rounded-lg" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="bg-transparent" onClick={() => copyLink(t.link)}>
                      <Copy className="w-4 h-4 mr-1" />
                      Link
                    </Button>
                    <Button variant="outline" className="bg-transparent" onClick={() => downloadQr(t.qr, t.tableNumber)}>
                      <Download className="w-4 h-4 mr-1" />
                      Tải
                    </Button>
                    <Button variant="destructive" onClick={() => removeTable(t.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
