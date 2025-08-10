import { NextResponse } from "next/server"
import { getSupabaseServiceRoleClient } from "@/lib/supabase-server"
import { getRequestRole, isStaffOrAdmin } from "@/lib/auth"

type TableRow = {
  id: string
  table_number: string
  status: "available" | "occupied" | "reserved"
  capacity: number | null
  qr_code_url: string | null
  created_at: string
}

export async function GET() {
  try {
    const supabase = getSupabaseServiceRoleClient()
    let { data, error } = await supabase.from("tables").select("*")
    if (error) throw error

    // Auto-seed 5 tables if empty
    if (!data || data.length === 0) {
      const now = new Date().toISOString()
      const seedRows = [1, 2, 3, 4, 5].map((n) => ({
        table_number: String(n),
        status: "available" as const,
        capacity: 0,
        qr_code_url: null as string | null,
        created_at: now,
      }))
      const seed = await supabase.from("tables").insert(seedRows).select("*")
      if (seed.error) throw seed.error
      data = seed.data as any
    }

    // Normalize: if missing/invalid/duplicate numbers, renumber sequentially by created_at asc
    const ordered = (data || [])
      .slice()
      .sort((a: TableRow, b: TableRow) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const needFix = (() => {
      const seen = new Set<string>()
      let invalid = false
      for (const t of ordered) {
        const num = String(t.table_number || "").trim()
        if (!num || !/^\d+$/.test(num) || seen.has(num)) {
          invalid = true
          break
        }
        seen.add(num)
      }
      return invalid
    })()

    if (needFix) {
      const fixes = ordered.map((t: TableRow, idx: number) => ({ id: t.id, table_number: String(idx + 1) }))
      const up = await supabase.from("tables").upsert(fixes, { onConflict: "id" }).select("*")
      if (up.error) throw up.error
      data = up.data as any
    }

    // Sort numerically by table_number to avoid lexicographic issues ("10" < "2")
    const sorted = (data || []).slice().sort((a: TableRow, b: TableRow) => Number(a.table_number) - Number(b.table_number))

    const dto = sorted.map((t: TableRow) => ({
      id: t.id,
      tableNumber: t.table_number,
      status: t.status,
      capacity: t.capacity ?? 0,
      qrCodeUrl: t.qr_code_url || "",
    }))
    return NextResponse.json({ success: true, data: dto })
  } catch (e: any) {
    console.error("GET /api/tables error:", e?.message || e)
    return NextResponse.json({ success: false, error: "Failed to fetch tables" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const role = await getRequestRole(req)
    if (!isStaffOrAdmin(role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }
    const body = await req.json()
    const entries: { capacity?: number; qrCodeUrl?: string; bulkCount?: number }[] = Array.isArray(body) ? body : [body]

    const supabase = getSupabaseServiceRoleClient()
    
    // Determine how many rows to create
    const requestedCount = (() => {
      // Support body { bulkCount: N } or array length
      if (entries.length === 1 && typeof entries[0]?.bulkCount === "number") {
        return Math.max(1, Math.floor(entries[0].bulkCount!))
      }
      return entries.length
    })()

    const now = new Date().toISOString()

    // Helper to get next available numbers (fill holes) based on current DB state
    async function allocateNumbers(count: number): Promise<string[]> {
      const cur = await supabase.from("tables").select("table_number")
      if (cur.error) throw cur.error
      const used = new Set<string>((cur.data || []).map((r: any) => String(r.table_number)))
      const result: string[] = []
      let n = 1
      while (result.length < count) {
        const s = String(n)
        if (!used.has(s)) {
          result.push(s)
          used.add(s)
        }
        n++
        // fail-safe
        if (n > 100000) break
      }
      return result
    }

    // Retry loop to avoid race causing duplicates (unique constraint should exist on table_number)
    const maxAttempts = 3
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const nums = await allocateNumbers(requestedCount)
        const rows = nums.map((num) => ({
          table_number: num,
          status: "available" as const,
          capacity: Number(entries[0]?.capacity ?? 0),
          qr_code_url: entries[0]?.qrCodeUrl ?? null,
          created_at: now,
        }))
        const ins = await supabase.from("tables").insert(rows).select("*")
        if (ins.error) throw ins.error
        const inserted = (ins.data as any[]).sort(
          (a, b) => Number(a.table_number) - Number(b.table_number),
        )
        const dto = inserted.map((t) => ({
          id: t.id,
          tableNumber: t.table_number,
          status: t.status,
          capacity: t.capacity ?? 0,
          qrCodeUrl: t.qr_code_url || "",
        }))
        return NextResponse.json({ success: true, data: dto, message: "Tables created" }, { status: 201 })
      } catch (err: any) {
        // Unique violation code 23505
        const code = err?.code || err?.details || ""
        const isUnique = String(code).includes("23505") || String(err?.message || "").toLowerCase().includes("duplicate")
        if (attempt < maxAttempts && isUnique) {
          // Retry
          continue
        }
        throw err
      }
    }
    // Should not reach here
    throw new Error("Failed to create tables after retries")
  } catch (e: any) {
    console.error("POST /api/tables error:", e?.message || e)
    return NextResponse.json({ success: false, error: "Failed to create tables" }, { status: 500 })
  }
}
