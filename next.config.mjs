/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // Không chặn build bởi ESLint. Duy trì lint riêng qua lệnh pnpm lint.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Production không bỏ qua lỗi TS để đảm bảo chất lượng.
    ignoreBuildErrors: false,
  },
  images: {
    // Nếu bạn dùng next/image với tối ưu ảnh, hãy chỉnh lại theo domain thực tế.
    unoptimized: true,
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      // Lưu ý: HSTS chỉ có hiệu lực trên HTTPS, set includeSubDomains tuỳ hạ tầng
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ]
    return [
      { source: '/:path*', headers: securityHeaders },
    ]
  },
  webpack: (config) => {
    // Ẩn cảnh báo dynamic require từ @supabase/realtime-js
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Critical dependency: the request of a dependency is an expression/,
    ]
    return config
  },
}

export default nextConfig
