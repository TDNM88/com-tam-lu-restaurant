"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Download, Copy } from "lucide-react"

export function QRGenerator() {
  const [tableNumber, setTableNumber] = useState("")
  const [qrUrl, setQrUrl] = useState("")

  const generateQR = () => {
    if (!tableNumber) return

    const baseUrl = window.location.origin
    const orderUrl = `${baseUrl}?table=${tableNumber}`
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(orderUrl)}`

    setQrUrl(qrCodeUrl)
  }

  const copyToClipboard = () => {
    const baseUrl = window.location.origin
    const orderUrl = `${baseUrl}?table=${tableNumber}`
    navigator.clipboard.writeText(orderUrl)
  }

  const downloadQR = () => {
    if (!qrUrl) return

    const link = document.createElement("a")
    link.href = qrUrl
    link.download = `table-${tableNumber}-qr.png`
    link.click()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Tạo mã QR cho bàn
        </CardTitle>
        <CardDescription>Tạo mã QR để khách hàng có thể gọi món trực tiếp</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="table">Số bàn</Label>
          <Input
            id="table"
            placeholder="Nhập số bàn (ví dụ: 1, 2, 3...)"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
        </div>

        <Button onClick={generateQR} className="w-full" disabled={!tableNumber}>
          Tạo mã QR
        </Button>

        {qrUrl && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={qrUrl || "/placeholder.svg"}
                alt={`QR Code for table ${tableNumber}`}
                className="border rounded-lg"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" className="flex-1 bg-transparent">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button onClick={downloadQR} variant="outline" className="flex-1 bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Tải về
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
