"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const router = useRouter()
  return (
    <main className="relative min-h-[70vh] bg-transparent text-white">
      {/* Nền theo phong cách landing */}
      <div className="fixed inset-0 -z-10">
        <Image src="/images/holo.png" alt="Modern tech background" fill className="object-cover opacity-20 mix-blend-overlay" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-teal-800/50 to-neutral-900/70" />
      </div>
      <div className="container mx-auto px-4 py-24">
        <motion.section
          className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-700 bg-gradient-to-br from-teal-900/20 via-teal-800/10 to-neutral-900 p-10 shadow-xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
       >
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">404 — Xin vui lòng trở lại sau</h1>
            <p className="mt-4 text-neutral-300">
              Cảm ơn bạn đã dành sự quan tâm đến <Image src="/logoQ.png" alt="Q+AI" width={80} height={80} className="inline-block ml-2" loading="lazy" />! 
              <br />
              Tuy nhiên, thông tin Bạn cần vẫn chưa sẳn sàng được công bố, hãy thường xuyên truy cập các kênh thông tin của chúng tôi để không bỏ lỡ sản phẩm mạnh mẽ này trên Hành trình kinh doanh của bạn!
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-teal-600 transition-transform duration-300 hover:scale-105 hover:bg-teal-500">
                <Link href="/landing">Về trang chủ</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-teal-600 text-teal-400 transition-transform duration-300 hover:scale-105 hover:bg-teal-600 hover:text-white">
                <Link href="/landing#contact">Liên hệ hỗ trợ</Link>
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
