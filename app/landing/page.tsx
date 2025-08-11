"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { motion } from "framer-motion" // Giữ framer-motion để thêm hiệu ứng mượt mà

export default function LandingPage() {
  const [showImages, setShowImages] = useState(true)
  return (
    <main className="relative min-h-dvh bg-gradient-to-b from-neutral-900/40 to-neutral-900/80 text-white scroll-smooth text-[15px] sm:text-base lg:text-[17px]">
      {/* Lớp nền tinh tế: giảm opacity để ảnh nền hiển thị rõ ràng hơn */}
      <div className="fixed inset-0 -z-10">
        <Image src="/images/holo.png" alt="Modern tech background" fill className="object-cover opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-teal-800/50 to-neutral-900/70" />
      </div>
      <IntroSection />
      <TableOfContents />
      <MainFeaturesSection />
      <DetailedGuideSection />
      <FeatureSection />
      <DisplayControls showImages={showImages} setShowImages={setShowImages} />
      <GallerySection showImages={showImages} />
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

function IntroSection() {
  return (
    <motion.section
      id="gioi-thieu"
      className="container mx-auto scroll-mt-24 px-4 py-16 sm:py-20"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Giới thiệu về QuánAI</h2>
        <p className="mt-4 text-lg text-neutral-300">
          Bạn đang đối mặt với vấn đề <b>quản lý nhân sự</b>, <b>quy trình rườm rà</b>, <b>sai sót đơn hàng</b>, <b>khách chờ lâu</b>, <b>chi phí quản lý cao</b>?
        </p>
        <p className="mt-4 text-lg text-neutral-300">
          QuánAI là <b>giải pháp toàn diện</b> cho mọi loại hình kinh doanh F&B, giúp bạn <b>tối ưu kinh doanh</b>, <b>tăng trưởng bền vững</b> và mang lại <b>trải nghiệm khách hàng tuyệt vời</b>.
        </p>
        <p className="mt-4 text-lg text-neutral-300"> 
          Không chỉ là phần mềm, QuánAI là <b>công cụ AI thông minh</b> giúp bạn <b>quản lý hiệu quả</b>, <b>vận hành dễ dàng</b>, <b>phục vụ nhanh chóng</b> – và mang lại <b>lợi nhuận cao hơn</b>.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-500">
            <Link href="/signup">Thử Miễn Phí Ngay</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-teal-600 text-teal-400 hover:bg-teal-600 hover:text-white">
            <Link href="#tinh-nang">Khám Phá Tính Năng</Link>
          </Button>
          <div className="mt-10 flex items-center justify-center gap-4 text-neutral-200">
            <div className="flex -space-x-2">
              {[
                "/placeholder-user.jpg",
                "/images/holo.png",
                "/images/holo1.png",
              ].map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt="Khách hàng hài lòng"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border-2 border-neutral-600 object-cover"
                />
              ))}
            </div>
            <p className="text-sm">
              Hơn <b>1,500+</b> quán F&B tăng trưởng cùng QuánAI
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function MainFeaturesSection() {
  const items = [
    {
      title: "Khám phá Menu Thông Minh",
      desc: "Menu được phân loại rõ ràng với mô tả hấp dẫn, hình ảnh chất lượng cao, tùy chọn topping linh hoạt và giá cập nhật realtime. AI gợi ý món ăn dựa trên sở thích, mang lại trải nghiệm cá nhân hóa giúp khách hàng dễ dàng chọn lựa và tăng tỷ lệ chuyển đổi.",
      icon: "🍱",
    },
    {
      title: "Giỏ Hàng & Đặt Món Mượt Mà",
      desc: "Thêm/sửa món dễ dàng, ghi chú chi tiết theo khẩu vị, áp dụng khuyến mãi tự động. Tính toán tổng đơn chính xác với gợi ý upsell thông minh, giúp quy trình đặt hàng nhanh chóng, tiện lợi và tăng giá trị đơn hàng trung bình.",
      icon: "🛒",
    },
    {
      title: "Thanh Toán An Toàn & Linh Hoạt",
      desc: "Hỗ trợ đa kênh thanh toán trực tuyến bảo mật cao hoặc COD, tích hợp ví điện tử và thẻ ngân hàng. Xác thực nhanh chóng, giảm tỷ lệ bỏ giỏ hàng và nâng cao lòng tin từ khách hàng.",
      icon: "💳",
    },
    {
      title: "Theo Dõi Đơn Hàng Realtime",
      desc: "Cập nhật trạng thái tức thì từ Pending đến Completed qua Supabase Realtime. Thông báo đẩy đa kênh giúp khách hàng luôn nắm bắt tiến trình, giảm lo lắng và tăng sự hài lòng tổng thể.",
      icon: "⏱️",
    },
    {
      title: "Hệ Thống Thông Báo Thông Minh",
      desc: "Gửi cập nhật trạng thái và sự kiện quan trọng đến khách hàng và nhân viên qua push notification, email hoặc SMS. Tùy chỉnh theo ngữ cảnh để tối ưu engagement và hiệu quả vận hành.",
      icon: "🔔",
    },
    {
      title: "Quản Trị Vận Hành AI-Driven",
      desc: "Dashboard toàn diện để quản lý đơn hàng, theo dõi KPI, báo cáo doanh thu và phân tích dữ liệu sâu. AI hỗ trợ dự báo xu hướng, giúp ra quyết định kinh doanh thông minh và tăng trưởng bền vững.",
      icon: "📊",
    },
  ]
  return (
    <motion.section
      id="tinh-nang"
      className="container mx-auto scroll-mt-24 px-4 py-12 sm:py-16"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">Tính Năng Nổi Bật</h3>
        <p className="mt-3 text-neutral-300">BếpAI không chỉ là công cụ quản lý mà còn là đối tác tăng trưởng, với các tính năng được thiết kế để tối ưu trải nghiệm khách hàng và hiệu quả kinh doanh.</p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, idx) => (
          <motion.div
            key={it.title}
            className="group rounded-2xl bg-neutral-800/50 p-6 shadow-lg transition-all hover:-translate-y-1 hover:bg-neutral-700/50 hover:shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="text-3xl text-teal-400">{it.icon}</div>
            <h4 className="mt-3 text-lg font-semibold">{it.title}</h4>
            <p className="mt-2 text-sm text-neutral-300">{it.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

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
      {/* Desktop TOC - Tối ưu giao diện với hover effect mượt hơn */}
      <nav
        aria-label="Mục lục"
        className="sticky top-0 z-20 hidden border-b border-neutral-700 bg-neutral-900/90 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/60 sm:block"
      >
        <div className="container mx-auto flex flex-wrap items-center gap-3 px-4 py-4">
          <span className="font-medium text-neutral-400">Khám Phá:</span>
          {items.map((i) => (
            <a
              key={i.href}
              href={i.href}
              className="rounded-full border border-neutral-600 px-4 py-2 text-sm text-neutral-300 transition hover:bg-teal-600 hover:text-white hover:shadow-md"
            >
              {i.label}
            </a>
          ))}
        </div>
      </nav>
      {/* Mobile TOC - Cải thiện UX với animation mở sheet */}
      <div className="sticky top-0 z-20 border-b border-neutral-700 bg-neutral-900/90 px-4 py-3 sm:hidden">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-sm font-medium text-neutral-400">Điều Hướng</div>
          <Sheet>
            <SheetTrigger className="rounded-full border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:bg-teal-600 hover:text-white">
              Mục Lục
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl bg-neutral-800 p-6">
              <SheetHeader>
                <SheetTitle className="text-white">Khám Phá BếpAI</SheetTitle>
              </SheetHeader>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                {items.map((i) => (
                  <a
                    key={i.href}
                    href={i.href}
                    className="rounded-lg border border-neutral-600 px-4 py-3 text-neutral-300 hover:bg-teal-600 hover:text-white"
                  >
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

function DisplayControls({
  showImages,
  setShowImages,
}: {
  showImages: boolean
  setShowImages: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <section className="container mx-auto px-4 py-4">
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="rounded-full border border-neutral-600 px-4 py-2 text-neutral-400" aria-hidden>
          Tùy Chỉnh Hiển Thị
        </div>
        <Button
          variant="outline"
          onClick={() => setShowImages(!showImages)}
          aria-pressed={showImages}
          aria-label="Ẩn/hiện hình ảnh"
          className="border-neutral-600 text-neutral-300 hover:bg-teal-600 hover:text-white"
        >
          {showImages ? "Ẩn Hình Ảnh" : "Hiện Hình Ảnh"}
        </Button>
        <Button asChild variant="ghost" className="text-neutral-300 hover:bg-teal-600 hover:text-white">
          <a href="#huong-dan">Hướng Dẫn Chi Tiết</a>
        </Button>
      </div>
    </section>
  )
}

function DetailedGuideSection() {
  return (
    <motion.section
      id="huong-dan"
      className="container mx-auto scroll-mt-24 px-4 py-16 sm:py-20"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Hướng Dẫn Sử Dụng QuánAI</h2>
        <p className="mt-4 text-center text-lg text-neutral-300">Các bước rõ ràng, dễ làm theo cho khách và nhân viên — khai thác tối đa sức mạnh AI tại bàn để phục vụ nhanh, chính xác, không chờ đợi.</p>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <motion.div
            className="rounded-2xl bg-neutral-800/50 p-8 shadow-lg transition-all hover:shadow-xl"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-lg font-semibold text-teal-400">Dành Cho Khách Hàng</div>
            <ol className="mt-6 space-y-6">
              <li className="flex gap-4">
                <span className="mt-1 h-8 w-8 flex-shrink-0 rounded-full bg-teal-500/20 text-teal-400 grid place-items-center text-sm font-semibold">1</span>
                <div>
                  <div className="font-semibold text-white">Khám Phá & Chọn Món</div>
                  <p className="text-sm text-neutral-300">Duyệt menu hấp dẫn với tìm kiếm thông minh, xem ảnh chi tiết, mô tả dinh dưỡng và tùy chỉnh topping theo sở thích. AI gợi ý món ăn phù hợp để trải nghiệm cá nhân hóa tối ưu.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="mt-1 h-8 w-8 flex-shrink-0 rounded-full bg-teal-500/20 text-teal-400 grid place-items-center text-sm font-semibold">2</span>
                <div>
                  <div className="font-semibold text-white">Thêm Vào Giỏ & Tùy Chỉnh</div>
                  <p className="text-sm text-neutral-300">Điều chỉnh số lượng linh hoạt, thêm ghi chú khẩu vị chi tiết, áp mã khuyến mãi tự động. Xem tổng quan giỏ hàng với gợi ý bổ sung để tăng giá trị đơn hàng.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="mt-1 h-8 w-8 flex-shrink-0 rounded-full bg-teal-500/20 text-teal-400 grid place-items-center text-sm font-semibold">3</span>
                <div>
                  <div className="font-semibold text-white">Thanh Toán Nhanh Chóng</div>
                  <p className="text-sm text-neutral-300">Chọn phương thức an toàn như ví điện tử hoặc COD, với quy trình xác thực mượt mà để hoàn tất đơn hàng chỉ trong vài giây.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="mt-1 h-8 w-8 flex-shrink-0 rounded-full bg-teal-500/20 text-teal-400 grid place-items-center text-sm font-semibold">4</span>
                <div>
                  <div className="font-semibold text-white">Theo Dõi Tiến Trình</div>
                  <p className="text-sm text-neutral-300">Nhận cập nhật realtime về trạng thái đơn hàng, theo dõi vị trí giao hàng và dễ dàng quản lý đơn qua app di động.</p>
                </div>
              </li>
            </ol>
            <div className="mt-8 rounded-lg bg-neutral-700/30 p-5">
              <div className="font-semibold text-white">Mẹo Tối Ưu:</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-300">
                <li>Bật thông báo để cập nhật tức thì, tránh bỏ lỡ tiến trình đơn hàng.</li>
                <li>Lưu đơn yêu thích để đặt lại nhanh chóng, tiết kiệm thời gian.</li>
                <li>Sử dụng AI gợi ý để khám phá món mới phù hợp khẩu vị.</li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            className="rounded-2xl bg-neutral-800/50 p-8 shadow-lg transition-all hover:shadow-xl"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-lg font-semibold text-teal-400">Dành Cho Nhân Viên Quán</div>
            <ol className="mt-6 space-y-6">
              <li className="flex gap-4">
                <span className="mt-1 h-8 w-8 flex-shrink-0 rounded-full bg-teal-500/20 text-teal-400 grid place-items-center text-sm font-semibold">1</span>
                <div>
                  <div className="font-semibold text-white">Xác Nhận Đơn Hàng</div>
                  <p className="text-sm text-neutral-300">Kiểm tra chi tiết đơn, áp dụng khuyến mãi và chuyển trạng thái Confirmed. Thông báo tự động đến khách để khởi động quy trình mượt mà.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="mt-1 h-8 w-8 flex-shrink-0 rounded-full bg-teal-500/20 text-teal-400 grid place-items-center text-sm font-semibold">2</span>
                <div>
                  <div className="font-semibold text-white">Chuẩn Bị Món Ăn</div>
                  <p className="text-sm text-neutral-300">Nhận phiếu bếp tự động, cập nhật Preparing realtime. Phối hợp đội ngũ để đảm bảo chất lượng và tốc độ phục vụ cao nhất.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="mt-1 h-8 w-8 flex-shrink-0 rounded-full bg-teal-500/20 text-teal-400 grid place-items-center text-sm font-semibold">3</span>
                <div>
                  <div className="font-semibold text-white">Hoàn Tất & Giao Hàng</div>
                  <p className="text-sm text-neutral-300">Đánh dấu Ready, chuẩn bị đóng gói chuyên nghiệp. Hệ thống thông báo khách hàng và theo dõi SLA để tối ưu thời gian.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="mt-1 h-8 w-8 flex-shrink-0 rounded-full bg-teal-500/20 text-teal-400 grid place-items-center text-sm font-semibold">4</span>
                <div>
                  <div className="font-semibold text-white">Chốt Đơn & Phân Tích</div>
                  <p className="text-sm text-neutral-300">Hoàn tất đơn với Completed hoặc Cancelled, dữ liệu tự động cập nhật vào báo cáo AI để insights kinh doanh sâu sắc.</p>
                </div>
              </li>
            </ol>
            <div className="mt-8 rounded-lg bg-neutral-700/30 p-5">
              <div className="font-semibold text-white">Lưu Ý Vận Hành:</div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-300">
                <li>Cập nhật trạng thái realtime để xây dựng lòng tin với khách hàng.</li>
                <li>Xử lý ghi chú đặc biệt nhanh chóng để nâng cao sự hài lòng.</li>
                <li>Sử dụng insights AI hàng ngày để tinh chỉnh menu và quy trình.</li>
              </ul>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <motion.div
            className="rounded-2xl bg-neutral-800/50 p-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-white">Hỗ Trợ & Xử Lý Sự Cố (Khách Hàng)</h3>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-neutral-300">
              <li>Trạng thái không cập nhật? Làm mới trang hoặc kiểm tra mạng; chat hỗ trợ 24/7 để giải quyết tức thì.</li>
              <li>Thanh toán lỗi? Chuyển COD hoặc thử lại; kiểm tra hạn mức nếu dùng thẻ.</li>
              <li>Sai đơn? Liên hệ hotline hoặc chat để chỉnh sửa nhanh, đảm bảo trải nghiệm hoàn hảo.</li>
            </ul>
          </motion.div>
          <motion.div
            className="rounded-2xl bg-neutral-800/50 p-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-white">Hỗ Trợ & Xử Lý Sự Cố (Nhân Viên)</h3>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-neutral-300">
              <li>Không thấy đơn mới? Kiểm tra pending và mạng; đăng nhập lại để đồng bộ.</li>
              <li>Thông báo không gửi? Xác nhận bước trạng thái và cài đặt notification.</li>
              <li>Lỗi giá/khuyến mãi? Cập nhật menu dashboard và ghi chú đơn để khắc phục.</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

function FeatureVideoSection() {
  return (
    <motion.section
      id="video-gioi-thieu"
      className="container mx-auto scroll-mt-24 px-4 py-16"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Demo Nhanh BếpAI</h2>
        <p className="mt-4 text-lg text-neutral-300">Khám phá cách nền tảng AI biến vận hành quán ăn thành trải nghiệm thông minh, hiệu quả và tăng trưởng vượt bậc.</p>
      </div>
      <div className="relative mx-auto mt-10 aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-700 shadow-xl">
        <Image src="/images/IMG_20250810_021232.png" alt="Demo BếpAI" fill className="object-cover transition-transform duration-500 hover:scale-105" />
      </div>
    </motion.section>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Tối ưu nền: giảm opacity gradient để ảnh hiển thị rõ nét hơn */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
      >
        <Image src="/images/hologram.png" alt="Nền công nghệ thông minh QuánAI" fill className="object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/40 to-neutral-900/70" />
      </motion.div>
      <div className="container relative z-10 mx-auto px-4 py-32 sm:py-40">
        <motion.div
          className="mx-auto max-w-3xl text-center text-white"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">QUÁN AI</h1>
          <p className="mt-6 text-lg text-neutral-200 sm:text-xl">
          Giải pháp trí tuệ nhân tạo dành cho mọi loại hình kinh doanh F&B, từ quán nhỏ tới chuỗi lớn. Hãy để QuánAI giúp bạn tối ưu trải nghiệm khách hàng và tăng trưởng bền vững – nhờ sức mạnh của AI.
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
              {[
                "/placeholder-user.jpg",
                "/images/holo.png",
                "/images/holo1.png",
              ].map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt="Khách hàng hài lòng"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border-2 border-neutral-600 object-cover"
                />
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

function FeatureSection() {
  const features = [
    {
      id: "quan-ly-menu",
      title: "Menu Thông Minh AI",
      points: [
        "Phân loại món ăn động với tìm kiếm nâng cao và gợi ý AI",
        "Cập nhật realtime giá/trạng thái, tối ưu theo dữ liệu chuyển đổi",
        "Tích hợp hình ảnh 360° và mô tả AR cho trải nghiệm sống động",
      ],
      image: "/images/hologram.png",
    },
    {
      id: "don-hang",
      title: "Xử Lý Đơn Hàng Siêu Tốc",
      points: [
        "Đồng bộ bếp-thu ngân-giao hàng với AI dự báo tải",
        "Theo dõi SLA chi tiết, cảnh báo trễ tự động",
        "Tích hợp voice command cho nhân viên để tăng tốc độ",
      ],
      image: "/images/bar.png",
    },
    {
      id: "bao-cao",
      title: "Insights & Báo Cáo AI-Driven",
      points: [
        "Phân tích doanh thu, món hot theo thời gian thực",
        "Biểu đồ tương tác với dự báo xu hướng AI",
        "Tùy chỉnh dashboard cho insights kinh doanh sâu sắc",
      ],
      image: "/images/cafe.png",
    },
  ]
  return (
    <motion.section
      id="tinh-nang"
      className="container mx-auto px-4 py-16 sm:py-20"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tính Năng Đột Phá</h2>
        <p className="mt-4 text-lg text-neutral-300">
          QuánAI biến dữ liệu thành sức mạnh: AI tại bàn giúp vận hành mượt mà, tối ưu chi phí và thúc đẩy tăng trưởng doanh thu bền vững.
        </p>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {features.map((f, idx) => (
          <motion.div
            key={f.id}
            className="flex flex-col overflow-hidden rounded-2xl bg-neutral-800/50 shadow-lg transition-all hover:shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="relative aspect-[16/9]">
              <Image src={f.image} alt={f.title} fill className="object-cover transition-transform duration-500 hover:scale-105" />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-neutral-300">
                {f.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 text-teal-400">✔</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

function GallerySection({ showImages = true }: { showImages?: boolean }) {
  if (!showImages) return null
  const imgs = [
    { src: "/images/hologram.png", alt: "Menu AI hấp dẫn" },
    { src: "/images/holo.png", alt: "Giao diện đặt hàng mượt mà" },
    { src: "/images/holo1.png", alt: "Dashboard insights sâu sắc" },
    { src: "/images/bar.png", alt: "Vận hành bếp thông minh" },
    { src: "/images/cafe.png", alt: "Theo dõi realtime" },
    { src: "/images/IMG_20250810_021232.png", alt: "AI dự báo xu hướng" },
  ]
  return (
    <motion.section
      className="container mx-auto px-4 py-16 sm:py-20"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Thư Viện Hình Ảnh</h2>
        <p className="mt-4 text-lg text-neutral-300">Trải nghiệm giao diện hiện đại qua bộ sưu tập hình ảnh chất lượng cao, được thiết kế để truyền tải sức mạnh của BếpAI một cách trực quan nhất.</p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {imgs.map((img, i) => (
          <motion.div
            key={i}
            className="group relative overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-800/50"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="relative aspect-[4/3]">
              <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-900/80 to-transparent p-4 text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
              {img.alt}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

function TestimonialsSection() {
  return (
    <motion.section
      className="container mx-auto px-4 py-16 sm:py-20"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Khách Hàng Chia Sẻ</h2>
        <p className="mt-4 text-lg text-neutral-300">Nghe từ những chủ quán đã biến BếpAI thành chìa khóa tăng trưởng kinh doanh thực tế.</p>
      </div>
      <TestimonialsCarousel />
    </motion.section>
  )
}

function TestimonialsCarousel() {
  const slides = [
    {
      quote: "BếpAI giúp doanh thu tăng vọt 27% chỉ sau 2 tháng, với AI tối ưu menu và upsell thông minh dựa trên dữ liệu thực.",
      author: "Anh Minh — Chủ Chuỗi Cơm Tấm",
      avatar: "/placeholder-user.jpg",
    },
    {
      quote: "Quy trình vận hành mượt mà, giảm 30% thời gian chờ, khách hàng hài lòng hơn bao giờ hết nhờ theo dõi realtime.",
      author: "Chị Lan — Chủ Quán Ăn Trưa",
      avatar: "/placeholder-user.jpg",
    },
    {
      quote: "Báo cáo AI sâu sắc giúp kiểm soát thất thoát và điều chỉnh chiến lược kịp thời, thực sự là game-changer.",
      author: "Anh Huy — Quản Lý Cửa Hàng",
      avatar: "/placeholder-user.jpg",
    },
  ]
  return (
    <div className="mt-10">
      <div
        id="testimonials-snap"
        className="-ml-6 flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        style={{ msOverflowStyle: "none" }}
      >
        {slides.map((s, i) => (
          <div key={i} className="min-w-0 shrink-0 grow-0 basis-full snap-center px-6 sm:basis-1/2 lg:basis-1/3">
            <motion.div
              className="h-full rounded-2xl bg-neutral-800/50 p-6 shadow-lg transition-all hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <Image src={s.avatar} alt={s.author} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                <div className="text-sm font-semibold text-white">{s.author}</div>
              </div>
              <p className="mt-4 text-sm text-neutral-300">“{s.quote}”</p>
            </motion.div>
          </div>
        ))}
      </div>
      <style jsx>{`
        #testimonials-snap::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

function FAQSection() {
  const faqs = [
    {
      q: "Cần Thiết Bị Đặc Biệt Không?",
      a: "Không hề. BếpAI chạy mượt trên điện thoại, tablet hoặc PC sẵn có, chỉ cần kết nối internet để đồng bộ realtime và tận hưởng đầy đủ tính năng AI.",
    },
    {
      q: "Dữ Liệu Có Bảo Mật?",
      a: "Tuyệt đối an toàn với mã hóa end-to-end, xác thực đa lớp và sao lưu tự động, tuân thủ nghiêm ngặt các tiêu chuẩn bảo mật toàn cầu như GDPR.",
    },
    {
      q: "Hỗ Trợ Triển Khai Như Thế Nào?",
      a: "Đội ngũ chuyên gia hỗ trợ 24/7 với hướng dẫn chi tiết, đào tạo trực tuyến và tùy chỉnh theo quy mô quán, đảm bảo khởi động suôn sẻ chỉ trong 24h.",
    },
  ]
  return (
    <motion.section
      id="faq"
      className="container mx-auto scroll-mt-24 px-4 py-16"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Câu Hỏi Thường Gặp</h2>
        <p className="mt-4 text-lg text-neutral-300">Giải đáp nhanh chóng để bạn tự tin bắt đầu hành trình tăng trưởng với BếpAI.</p>
      </div>
      <div className="mx-auto mt-10 max-w-2xl space-y-4">
        {faqs.map((f, i) => (
          <motion.details
            key={i}
            className="group rounded-2xl bg-neutral-800/50 p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <summary className="cursor-pointer list-none text-left text-sm font-semibold text-white">
              <span className="mr-2 text-teal-400">?</span>
              {f.q}
            </summary>
            <p className="mt-3 text-sm text-neutral-300">{f.a}</p>
          </motion.details>
        ))}
      </div>
    </motion.section>
  )
}

function RoadmapSection() {
  const roadmap = [
    {
      title: "AI Gợi Ý Món Cá Nhân Hóa",
      desc: "AI phân tích sở thích, thời tiết và dữ liệu lịch sử để gợi ý món ăn lý tưởng, tăng upsell và sự hài lòng khách hàng lên mức mới.",
    },
    {
      title: "Dự Báo Tồn Kho Thông Minh",
      desc: "Mô hình AI dự báo nhu cầu chính xác, tối ưu nhập hàng để giảm lãng phí và đảm bảo sẵn sàng phục vụ mọi lúc.",
    },
    {
      title: "Phát Hiện Rủi Ro Tự Động",
      desc: "AI giám sát giao dịch và tồn kho, cảnh báo bất thường ngay lập tức để bảo vệ doanh thu và vận hành an toàn.",
    },
    {
      title: "Phân Tích Khách Hàng 360°",
      desc: "Xây dựng profile khách hàng toàn diện, tối ưu campaign marketing để tăng tỷ lệ quay lại và lòng trung thành.",
    },
    {
      title: "Tự Động Hóa Quy Trình",
      desc: "AI lập lịch làm việc, định lượng nguyên liệu và điều phối thông minh, giúp quán ăn hoạt động hiệu quả cao nhất.",
    },
    {
      title: "Công Nghệ Phục Vụ Tương Lai",
      desc: "Tích hợp robot, kiosk tự phục vụ và trợ lý ảo để mang lại trải nghiệm quán ăn hiện đại, hấp dẫn thế hệ trẻ.",
    },
  ]
  return (
    <motion.section
      id="lo-trinh"
      className="container mx-auto scroll-mt-24 px-4 py-16 sm:py-20"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Lộ Trình Tương Lai</h2>
        <p className="mt-4 text-lg text-neutral-300">BếpAI liên tục tiến hóa với các tính năng AI đột phá, giúp quán ăn của bạn dẫn đầu xu hướng F&B thông minh.</p>
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2">
        {roadmap.map((r, idx) => (
          <motion.div
            key={r.title}
            className="rounded-2xl bg-neutral-800/50 p-6 shadow-lg transition-all hover:shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-white">{r.title}</h3>
            <p className="mt-3 text-sm text-neutral-300">{r.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

function SocialProofSection() {
  return (
    <motion.section
      className="container mx-auto px-4 py-16"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="rounded-2xl bg-neutral-800/50 p-8 text-center shadow-lg">
        <p className="text-sm text-neutral-300">
          QuánAI được tin dùng bởi nhiều mô hình F&B: từ quán nhỏ, cafe, trà sữa đến chuỗi lớn. Triển khai nhanh, chi phí tối ưu, ROI cao — đối tác lý tưởng cho tăng trưởng bền vững.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-80">
          <Image src="/placeholder-logo.svg" alt="Partner Logo" width={90} height={24} />
          <Image src="/placeholder-logo.svg" alt="Partner Logo" width={90} height={24} />
          <Image src="/placeholder-logo.svg" alt="Partner Logo" width={90} height={24} />
          <Image src="/placeholder-logo.svg" alt="Partner Logo" width={90} height={24} />
        </div>
      </div>
    </motion.section>
  )
}

function CTASection() {
  return (
    <motion.section
      id="cta"
      className="relative mx-auto my-16 w-full max-w-5xl scroll-mt-24 px-4"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900/20 via-teal-800/10 to-neutral-900 p-10 shadow-xl">
        <div className="grid items-center gap-10 sm:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">Sẵn Sàng Nâng Tầm Quán Ăn?</h3>
            <p className="mt-3 text-sm text-neutral-300">
              Thử miễn phí 14 ngày, không cam kết. Hỗ trợ setup nhanh 24h với chuyên gia, biến dữ liệu thành lợi nhuận ngay hôm nay.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-500">
                <Link href="/signup">Thử Miễn Phí</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-teal-600 text-teal-400 hover:bg-teal-600 hover:text-white">
                <Link href="/contact">Đặt Demo</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
            <Image src="/images/IMG_20250810_021232.png" alt="Dashboard QuánAI" fill className="object-cover transition-transform duration-500 hover:scale-105" />
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function FooterSimple() {
  return (
    <footer className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-between gap-6 border-t border-neutral-700 pt-8 text-center sm:flex-row sm:text-left">
        <div className="text-sm text-neutral-400">
          © {new Date().getFullYear()} QuánAI — Tất Cả Quyền Được Bảo Lưu.
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/terms" className="text-neutral-400 hover:text-teal-400">Điều Khoản</Link>
          <Link href="/privacy" className="text-neutral-400 hover:text-teal-400">Bảo Mật</Link>
          <Link href="/contact" className="text-neutral-400 hover:text-teal-400">Liên Hệ</Link>
        </div>
      </div>
    </footer>
  )
}

function HelpFab() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <Button asChild size="lg" className="bg-teal-600 shadow-lg hover:bg-teal-500" aria-label="Cần hỗ trợ?">
        <a href="#faq">Cần Hỗ Trợ?</a>
      </Button>
      <Button asChild variant="outline" size="sm" className="border-teal-600 text-teal-400 shadow hover:bg-teal-600 hover:text-white" aria-label="Liên hệ nhanh">
        <Link href="/contact">Chat Ngay</Link>
      </Button>
    </div>
  )
}