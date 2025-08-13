import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ErrorBoundary } from "@/components/error-boundary"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Q+AI - Hệ thống gọi món QR Code",
  description:
    "Hệ thống gọi món hiện đại cho nhà hàng với giao diện sang trọng và trải nghiệm người dùng tối ưu",
  keywords: "hệ thống gọi món, QR code",
  authors: [{ name: "Q+AI" }],
  robots: "index, follow",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} pb-20`}>
        <ErrorBoundary>
          <div className="min-h-screen">{children}</div>
          <SiteFooter />
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}
