"use client"

import { Badge } from "@/components/ui/badge"

export function BrandHeader({ tableNumber }: { tableNumber?: string }) {
  return (
    <div className="text-center py-8 bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100 border-b border-amber-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">LU</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              CƠM TẤM LU
            </h1>
            <p className="text-lg text-amber-700 font-semibold italic">"Ngon có gu – Nhanh có Lu"</p>
          </div>
        </div>

        {tableNumber && (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-lg">
            Bàn số {tableNumber}
          </Badge>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p>📍 Thực đơn chính thức • Phục vụ trưa & tối</p>
        </div>
      </div>
    </div>
  )
}
