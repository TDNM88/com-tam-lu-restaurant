/**
 * Production-grade auth + RBAC helpers for Route Handlers.
 * Ưu tiên lấy role từ Supabase JWT (Authorization: Bearer <token> hoặc cookie sb-access-token).
 * Vẫn giữ fallback dev: header x-role, Authorization: "Role admin", hoặc query ?role=admin.
 */

import { createClient } from "@supabase/supabase-js"

export type Role = "owner" | "admin" | "staff" | "customer" | "anonymous"

function parseCookies(req: Request): Record<string, string> {
  const cookie = req.headers.get("cookie") || req.headers.get("Cookie") || ""
  return cookie.split(";").reduce<Record<string, string>>((acc, part) => {
    const [k, ...rest] = part.trim().split("=")
    if (!k) return acc
    acc[k] = decodeURIComponent(rest.join("="))
    return acc
  }, {})
}

function isLocalRequest(req: Request): boolean {
  try {
    const url = new URL(req.url)
    const host = url.hostname
    // localhost or common private network ranges
    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(host)) return true
    if (/^192\.168\./.test(host)) return true
    if (/^10\./.test(host)) return true
    // 172.16.0.0 – 172.31.255.255
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return true
    return false
  } catch {
    return false
  }
}

function getBearerToken(req: Request): string | null {
  const h = req.headers
  const auth = h.get("authorization") || h.get("Authorization") || ""
  const m = auth.match(/^Bearer\s+(.+)$/i)
  if (m) return m[1]
  const cookies = parseCookies(req)
  // Supabase auth helpers thường đặt tên cookie sb-access-token
  return cookies["sb-access-token"] || null
}

async function getRoleFromSupabase(req: Request): Promise<{ role: Role; userId?: string }> {
  try {
    const token = getBearerToken(req)
    if (!token) return { role: "anonymous" }
    const env: any = (globalThis as any).process?.env || {}
    const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
    const anon = env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) return { role: "anonymous" }
    const client = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data, error } = await client.auth.getUser()
    if (error || !data?.user) return { role: "anonymous" }
    const user = data.user
    const metaRole = (user.app_metadata?.role || user.user_metadata?.role || "customer") as Role
    return { role: metaRole, userId: user.id }
  } catch {
    return { role: "anonymous" }
  }
}

export async function getRequestRole(req: Request): Promise<Role> {
  const NODE_ENV: string = ((globalThis as any).process?.env?.NODE_ENV as string) || "development"
  const local = isLocalRequest(req)

  // 1) On local/private networks, prioritize dev fallbacks over JWT to allow override
  if (local) {
    try {
      const h = req.headers
      const headerRole = (h.get("x-role") || h.get("X-Role") || "").toLowerCase()
      if (headerRole === "admin" || headerRole === "staff" || headerRole === "customer") {
        return headerRole as Role
      }
      const auth = h.get("authorization") || h.get("Authorization") || ""
      const roleMatch = auth.match(/role\s*=?\s*(admin|staff|customer)/i)
      if (roleMatch) return roleMatch[1].toLowerCase() as Role
      const url = new URL(req.url)
      const qpRole = (url.searchParams.get("role") || "").toLowerCase()
      if (qpRole === "admin" || qpRole === "staff" || qpRole === "customer") {
        return qpRole as Role
      }
    } catch {
      // ignore
    }
  }

  // 2) Try Supabase JWT
  const fromJwt = await getRoleFromSupabase(req)
  if (fromJwt.role !== "anonymous") return fromJwt.role

  // 3) Dev fallbacks when not production or when local/private networks
  if (NODE_ENV === "production" && !local) return "anonymous"
  try {
    const h = req.headers
    const headerRole = (h.get("x-role") || h.get("X-Role") || "").toLowerCase()
    if (headerRole === "admin" || headerRole === "staff" || headerRole === "customer") {
      return headerRole as Role
    }
    const auth = h.get("authorization") || h.get("Authorization") || ""
    const roleMatch = auth.match(/role\s*=?\s*(admin|staff|customer)/i)
    if (roleMatch) return roleMatch[1].toLowerCase() as Role
    const url = new URL(req.url)
    const qpRole = (url.searchParams.get("role") || "").toLowerCase()
    if (qpRole === "admin" || qpRole === "staff" || qpRole === "customer") {
      return qpRole as Role
    }
    return "anonymous"
  } catch {
    return "anonymous"
  }
}

export function isStaffOrAdmin(role: Role): boolean {
  return role === "admin" || role === "staff" || role === "owner"
}

export async function auth(req: Request): Promise<{ role: Role; userId?: string }> {
  const userId = req.headers.get("x-user-id") || req.headers.get("X-User-Id") || undefined
  const local = isLocalRequest(req)
  // On local/private networks, allow header/query role to override before JWT
  if (local) {
    const devRole = await getRequestRole(req)
    if (devRole !== "anonymous") {
      return { role: devRole, userId }
    }
  }
  const fromJwt = await getRoleFromSupabase(req)
  if (fromJwt.role !== "anonymous") return fromJwt
  const role = await getRequestRole(req)
  return { role, userId }
}

export function assertRole(role: Role, allowed: Role[]) {
  if (!allowed.includes(role)) {
    const err = new Error("Forbidden")
    ;(err as any).status = 403
    throw err
  }
}
