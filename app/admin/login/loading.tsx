import { LoadingSpinner } from "@/components/loading-spinner"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="text-center">
        <LoadingSpinner className="h-12 w-12 mx-auto mb-4" />
        <p className="text-gray-600">Đang tải...</p>
      </div>
    </div>
  )
}
