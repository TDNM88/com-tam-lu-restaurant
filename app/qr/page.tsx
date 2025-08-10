import { QRGenerator } from "@/components/qr-generator"

export default function QRPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <QRGenerator />
    </div>
  )
}
