"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "fixed inset-x-0 bottom-0 z-40",
        "backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/85",
        "border-t border-neutral-200/80 shadow-[0_-6px_12px_-8px_rgba(0,0,0,0.08)]",
        "transition-colors",
        className
      )}
      aria-label="Đơn vị phát triển ứng dụng"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-8 w-8 overflow-hidden rounded-md ring-1 ring-inset ring-neutral-300">
              <img src="/tdnm.png" alt="CTCP Giải pháp Truyền thông số NDP" className="h-full w-full object-cover" />
            </div>
            <p className="truncate text-sm text-neutral-700">
              <span className="font-semibold text-neutral-900">QUÁN AI</span> · AI tại bàn | Nâng tầm mọi trải nghiệm
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-700">
            <span className="hidden sm:inline">Phát triển bởi</span>
            <Link
              href="https://tdnm.cloud"
              target="_blank"
              className="group inline-flex items-center gap-1 rounded-md px-2 py-1 ring-1 ring-inset ring-neutral-300 hover:ring-neutral-400 transition-colors"
            >
              <span className="font-medium text-neutral-900 group-hover:text-neutral-700">TDNM</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 opacity-70 group-hover:opacity-100"
                aria-hidden
              >
                <path d="M12.293 2.293a1 1 0 011.414 0l4 4A1 1 0 0117 8h-3a1 1 0 110-2h.586L12 3.414 6.707 8.707a1 1 0 01-1.414-1.414l7-7z" />
                <path d="M5 6a1 1 0 011-1h3a1 1 0 110 2H7v8h8v-2a1 1 0 112 0v3a1 1 0 01-1 1H6a1 1 0 01-1-1V6z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
