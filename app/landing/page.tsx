"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { motion } from "framer-motion"

// ================== MAIN PAGE ==================
export default function LandingPage() {
  const [showImages, setShowImages] = useState(true)
  return (
    <main className="relative min-h-dvh bg-gradient-to-b from-neutral-900 to-neutral-800 text-white scroll-smooth text-[15px] sm:text-base lg:text-[17px]">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <Image src="/images/holo.png" alt="Modern tech background" fill className="object-cover opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-orange-500/10 to-neutral-900/70" />
      </div>

      <HeroSection />
      <TableOfContents />
      <DisplayControls showImages={showImages} setShowImages={setShowImages} />
      <IntroSection />
      <GallerySection showImages={showImages} />
      <MainFeaturesSection />
      <DetailedGuideSection />
      <FeatureSection />
      <FeatureVideoSection />
      <TestimonialsSection />
      <RoadmapSection />
      <FAQSection />
      <SocialProofSection />
      <CTASection />
      <FooterSimple />
      <HelpFab />
    </main>
  )
}

// ================== HERO ==================
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      <motion.div className="absolute inset-0 -z-10" initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }}>
        <Image src="/images/hologram.png" alt="Nền công nghệ thông minh QuánAI" fill className="object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/40 to-neutral-900/70" />
      </motion.div>
      <div className="container relative z-10 mx-auto px-4 py-32 sm:py-40">
        <motion.div className="mx-auto max-w-3xl text-center text-white" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            QuánAI — AI hoá quán bạn • Nâng tầm phục vụ
          </h1>
          <p className="mt-6 text-lg text-neutral-200 sm:text-xl">
            Giúp mọi quán F&B vận hành dễ dàng, phục vụ nhanh chóng, tăng trưởng bền vững — nhờ sức mạnh AI.
          </p>
          <p className="mt-6 text-lg text-orange-300 sm:text-xl italic">
            “AI tại bàn – Nâng tầm mọi trải nghiệm” • “Nhàn tay – Lãi cao”
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-500">
              <Link href="/signup">Thử Miễn Phí Ngay</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-teal-600 text-teal-400 hover:bg-teal-600 hover:text-white">
              <Link href="#tinh-nang">Khám Phá Tính Năng</Link>
            </Button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-4 text-neutral-200">
            <div className="flex -space-x-2">
              {["/placeholder-user.jpg","/images/holo.png","/images/holo1.png"].map((src, i) => (
                <Image key={i} src={src} alt="Khách hàng hài lòng" width={40} height={40} className="h-10 w-10 rounded-full border-2 border-neutral-600 object-cover" />
              ))}
            </div>
            <p className="text-sm">
              Hơn <b>1,500+</b> quán F&B tăng trưởng cùng QuánAI
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ================== INTRO SECTION ==================
function IntroSection() {
  return (
    <motion.section id="gioi-thieu" className="container mx-auto scroll-mt-24 px-4 py-16 sm:py-20" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Giới thiệu QuánAI</h2>
        <p className="mt-4 text-lg text-neutral-300">
          Hơn 90% quán F&B tại Việt Nam gặp vấn đề nhân sự, quy trình rườm rà, sai sót order và chi phí quản lý cao. QuánAI mang trí tuệ nhân tạo vào từng chiếc bàn, từng món ăn — từ gọi món, xử lý đơn, thanh toán, quản lý tồn kho đến phân tích kinh doanh.
        </p>
        <p className="mt-4 text-lg text-neutral-300">
          Không chỉ là phần mềm, QuánAI là đồng đội thông minh của chủ quán và người phục vụ tận tâm của khách. Lời hứa thương hiệu: “Giúp mọi quán F&B vận hành dễ dàng, phục vụ nhanh chóng, tăng trưởng bền vững — nhờ sức mạnh AI.”
        </p>
      </div>
    </motion.section>
  )
}

// ================== TABLE OF CONTENTS ==================
function TableOfContents() {
  const items = [
    { href: "#gioi-thieu", label: "Giới Thiệu" },
    { href: "#tinh-nang", label: "Tính Năng Nổi Bật" },
    { href: "#huong-dan", label: "Hướng Dẫn Sử Dụng" },
    { href: "#video-gioi-thieu", label: "Video Demo" },
    { href: "#faq", label: "FAQ" },
    { href: "#lo-trinh", label: "Lộ Trình Phát Triển" },
    { href: "#cta", label: "Bắt Đầu Ngay" },
  ]
  return (
    <>
      {/* Desktop */}
      <nav aria-label="Mục lục" className="sticky top-0 z-20 hidden border-b border-neutral-700 bg-neutral-900/90 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/60 sm:block">
        <div className="container mx-auto flex flex-wrap items-center gap-3 px-4 py-4">
          <span className="font-medium text-neutral-400">Khám Phá:</span>
          {items.map((i) => (
            <a key={i.href} href={i.href} className="rounded-full border border-neutral-600 px-4 py-2 text-sm text-neutral-300 transition hover:bg-teal-600 hover:text-white hover:shadow-md">
              {i.label}
            </a>
          ))}
        </div>
      </nav>
      {/* Mobile */}
      <div className="sticky top-0 z-20 border-b border-neutral-700 bg-neutral-900/90 px-4 py-3 sm:hidden">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-sm font-medium text-neutral-400">Điều Hướng</div>
          <Sheet>
            <SheetTrigger className="rounded-full border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:bg-teal-600 hover:text-white">
              Mục Lục
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl bg-neutral-800 p-6">
              <SheetHeader>
                <SheetTitle className="text-white">Khám Phá QuánAI</SheetTitle>
              </SheetHeader>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                {items.map((i) => (
                  <a key={i.href} href={i.href} className="rounded-lg border border-neutral-600 px-4 py-3 text-neutral-300 hover:bg-teal-600 hover:text-white">
                    {i.label}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}

// ================== DISPLAY CONTROLS ==================
function DisplayControls({ showImages, setShowImages }: { showImages: boolean; setShowImages: Dispatch<SetStateAction<boolean>> }) {
  return (
    <section className="container mx-auto px-4 py-4">
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="rounded-full border border-neutral-600 px-4 py-2 text-neutral-400" aria-hidden>
          Tùy Chỉnh Hiển Thị
        </div>
        <Button variant="outline" onClick={() => setShowImages(!showImages)} aria-pressed={showImages} aria-label="Ẩn/hiện hình ảnh" className="border-neutral-600 text-neutral-300 hover:bg-teal-600 hover:text-white">
          {showImages ? "Ẩn Hình Ảnh" : "Hiện Hình Ảnh"}
        </Button>
        <Button asChild variant="ghost" className="text-neutral-300 hover:bg-teal-600 hover:text-white">
          <a href="#huong-dan">Hướng Dẫn Chi Tiết</a>
        </Button>
      </div>
    </section>
  )
}
// ================== GALLERY SECTION ==================
function GallerySection({ showImages }: { showImages: boolean }) {
  if (!showImages) return null
  const images = [
    { src: "/images/gallery1.jpg", alt: "Giao diện gọi món thông minh" },
    { src: "/images/gallery2.jpg", alt: "Phân tích dữ liệu kinh doanh" },
    { src: "/images/gallery3.jpg", alt: "Quản lý kho và tồn hàng" },
  ]
  return (
    <section className="container mx-auto px-4 py-16 sm:py-20">
      <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Hình ảnh thực tế</h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
            <Image src={img.src} alt={img.alt} width={600} height={400} className="rounded-lg border border-neutral-700 object-cover" />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ================== MAIN FEATURES ==================
function MainFeaturesSection() {
  const features = [
    { title: "Gọi món AI tại bàn", desc: "Khách hàng gọi món trực tiếp qua màn hình, giảm tải nhân viên." },
    { title: "Tự động hóa quy trình", desc: "Order, bếp, thu ngân và quản lý kho kết nối liền mạch." },
    { title: "Phân tích kinh doanh", desc: "AI gợi ý món bán chạy, khung giờ vàng và chiến dịch khuyến mãi." },
    { title: "Tích hợp thanh toán", desc: "Hỗ trợ quét mã QR, ví điện tử, thẻ ngân hàng nhanh chóng." },
  ]
  return (
    <section id="tinh-nang" className="container mx-auto px-4 py-16 sm:py-20">
      <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Tính năng nổi bật</h2>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }} viewport={{ once: true }} className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-6 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/20">
            <h3 className="text-xl font-semibold text-orange-400">{f.title}</h3>
            <p className="mt-2 text-neutral-300">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ================== DETAILED GUIDE ==================
function DetailedGuideSection() {
  const steps = [
    { step: "Đăng ký tài khoản", desc: "Nhập thông tin quán, nhận hướng dẫn cài đặt." },
    { step: "Cài đặt thiết bị", desc: "Kết nối màn hình AI tại bàn, thiết lập menu." },
    { step: "Bắt đầu vận hành", desc: "AI tự động nhận order, hỗ trợ khách hàng và báo cáo." },
  ]
  return (
    <section id="huong-dan" className="container mx-auto px-4 py-16 sm:py-20">
      <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Hướng dẫn sử dụng</h2>
      <div className="mt-10 space-y-6">
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} viewport={{ once: true }} className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-6">
            <h3 className="text-xl font-semibold text-teal-400">{`Bước ${i + 1}: ${s.step}`}</h3>
            <p className="mt-2 text-neutral-300">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ================== FEATURE SECTION ==================
function FeatureSection() {
  return (
    <section className="container mx-auto px-4 py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Vì sao chọn QuánAI?</h2>
          <p className="mt-4 text-lg text-neutral-300">
            Chúng tôi không chỉ bán phần mềm — chúng tôi đồng hành để quán của bạn tăng trưởng. Từ công nghệ AI tối ưu quy trình đến phân tích dữ liệu kinh doanh, QuánAI là giải pháp toàn diện cho mọi quán F&B.
          </p>
          <ul className="mt-6 space-y-3 text-neutral-300">
            <li>✔ Tiết kiệm 30% chi phí nhân sự</li>
            <li>✔ Tăng tốc phục vụ lên gấp 2 lần</li>
            <li>✔ Báo cáo, phân tích chi tiết mỗi ngày</li>
          </ul>
        </div>
        <Image src="/images/feature-why.jpg" alt="Lợi ích khi dùng QuánAI" width={600} height={400} className="rounded-lg border border-neutral-700 object-cover" />
      </div>
    </section>
  )
}

// ================== FEATURE VIDEO ==================
function FeatureVideoSection() {
  return (
    <section id="video-gioi-thieu" className="container mx-auto px-4 py-16 sm:py-20">
      <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Xem QuánAI hoạt động</h2>
      <div className="mt-8 aspect-video overflow-hidden rounded-lg border border-neutral-700">
        <iframe
          src="https://www.youtube.com/embed/your-video-id"
          title="QuánAI demo video"
          className="h-full w-full"
          allowFullScreen
        />
      </div>
    </section>
  )
}

// ================== TESTIMONIALS ==================
function TestimonialsSection() {
  const testimonials = [
    { name: "Anh Tuấn - Chủ quán cà phê", quote: "Nhờ QuánAI, quán mình tiết kiệm được 40% chi phí và khách hàng hài lòng hơn hẳn." },
    { name: "Chị Lan - Nhà hàng gia đình", quote: "Mình bất ngờ khi AI có thể gợi ý món ăn phù hợp cho từng nhóm khách." },
  ]
  return (
    <section className="container mx-auto px-4 py-16 sm:py-20">
      <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Khách hàng nói gì?</h2>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        {testimonials.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} viewport={{ once: true }} className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-6">
            <p className="text-neutral-300 italic">“{t.quote}”</p>
            <p className="mt-4 font-semibold text-teal-400">{t.name}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ================== ROADMAP ==================
function RoadmapSection() {
  const roadmap = [
    { quarter: "Q1 2025", detail: "Ra mắt phiên bản AI Gọi món 2.0" },
    { quarter: "Q2 2025", detail: "Tích hợp AI dự đoán nhu cầu nguyên liệu" },
    { quarter: "Q3 2025", detail: "Hỗ trợ đa ngôn ngữ cho khách du lịch" },
  ]
  return (
    <section id="lo-trinh" className="container mx-auto px-4 py-16 sm:py-20">
      <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Lộ trình phát triển</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {roadmap.map((r, i) => (
          <div key={i} className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-6 text-center">
            <h3 className="text-xl font-semibold text-orange-400">{r.quarter}</h3>
            <p className="mt-2 text-neutral-300">{r.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ================== FAQ ==================
function FAQSection() {
  const faqs = [
    { q: "QuánAI phù hợp cho loại quán nào?", a: "Tất cả các quán F&B, từ quán cà phê nhỏ tới chuỗi nhà hàng lớn." },
    { q: "Có cần nhân viên biết công nghệ?", a: "Không, giao diện trực quan, dễ dùng cho mọi lứa tuổi." },
    { q: "Chi phí thế nào?", a: "Có gói miễn phí dùng thử và nhiều gói nâng cấp linh hoạt." },
  ]
  return (
    <section id="faq" className="container mx-auto px-4 py-16 sm:py-20">
      <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Câu hỏi thường gặp</h2>
      <div className="mt-8 space-y-6">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-6">
            <h3 className="font-semibold text-teal-400">{f.q}</h3>
            <p className="mt-2 text-neutral-300">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ================== SOCIAL PROOF ==================
function SocialProofSection() {
  return (
    <section className="container mx-auto px-4 py-16 sm:py-20">
      <div className="text-center">
        <p className="text-lg text-neutral-300">Được tin dùng bởi hơn <span className="text-orange-400 font-bold">1,500+</span> quán F&B</p>
        <div className="mt-6 flex justify-center gap-6">
          <Image src="/images/logo1.png" alt="Logo đối tác" width={80} height={80} />
          <Image src="/images/logo2.png" alt="Logo đối tác" width={80} height={80} />
        </div>
      </div>
    </section>
  )
}

// ================== CTA ==================
function CTASection() {
  return (
    <section id="cta" className="bg-gradient-to-r from-teal-700 to-orange-500 py-16 text-center text-white">
      <h2 className="text-3xl font-bold sm:text-4xl">Sẵn sàng AI hoá quán của bạn?</h2>
      <p className="mt-4 text-lg">Bắt đầu miễn phí hôm nay và trải nghiệm sức mạnh của QuánAI.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button asChild size="lg" className="bg-white text-teal-700 hover:bg-neutral-200">
          <Link href="/signup">Dùng Thử Ngay</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-teal-700">
          <Link href="#tinh-nang">Xem Tính Năng</Link>
        </Button>
      </div>
    </section>
  )
}

// ================== FOOTER ==================
function FooterSimple() {
  return (
    <footer className="bg-neutral-900 py-8 text-center text-neutral-400">
      <p>© {new Date().getFullYear()} QuánAI. All rights reserved.</p>
    </footer>
  )
}

// ================== HELP FAB ==================
function HelpFab() {
  return (
    <a href="/contact" className="fixed bottom-6 right-6 rounded-full bg-teal-600 p-4 text-white shadow-lg hover:bg-teal-500">
      ?
    </a>
  )
}
