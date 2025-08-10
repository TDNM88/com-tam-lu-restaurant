"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"

export function useTableFromQR(fallback?: string) {
  const params = useSearchParams()
  const table = params.get("table") || params.get("tableNumber") || params.get("t")

  return useMemo(() => table || fallback || undefined, [table, fallback])
}
