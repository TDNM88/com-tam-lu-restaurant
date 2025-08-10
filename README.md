

[![Triển khai trên Vercel](https://img.shields.io/badge/Triển%20khai%20trên-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/tdnm/v0-com-tam-lu-app)
[![Xây dựng với v0](https://img.shields.io/badge/Xây%20dựng%20với-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/TdZtNqFS6Ru)

## Giới thiệu

Ứng dụng đặt món trực tuyến và quản trị vận hành dành cho quán Cơm Tấm LU. Khách hàng có thể xem menu, tuỳ chọn món, đặt hàng và theo dõi trạng thái đơn theo thời gian thực. Ở phía cửa hàng, hệ thống cung cấp trang quản trị giúp kiểm soát quy trình phục vụ, báo cáo doanh thu và ra quyết định dựa trên dữ liệu.

## Tính năng chính

- __Trình duyệt menu__: Phân loại danh mục rõ ràng; hỗ trợ mô tả, ảnh, tuỳ chọn/topping và giá linh hoạt.
- __Giỏ hàng & đặt món__: Thêm/bớt số lượng, ghi chú món; áp mã khuyến mãi khi có cấu hình.
- __Thanh toán__: Hỗ trợ thanh toán trực tuyến hoặc COD (tuỳ cấu hình cửa hàng).
- __Theo dõi đơn thời gian thực__: Pending → Confirmed → Preparing → Ready → Completed/Cancelled (Supabase Realtime).
- __Thông báo__: Đẩy trạng thái và sự kiện đơn hàng tới khách và nhân sự liên quan.
- __Trang quản trị vận hành__: Quản lý đơn, cập nhật trạng thái theo ca; xem khách hàng; theo dõi tổng quan doanh thu/KPI.

### Lợi ích cho chủ doanh nghiệp/chủ cửa hàng

- __Tăng doanh thu__: Gợi ý upsell/cross-sell, combo hợp lý dựa trên dữ liệu bán chạy.
- __Giảm thất thoát__: Theo dõi quy trình theo bước, nhật ký thao tác; cảnh báo các bất thường theo thời gian thực.
- __Tối ưu vận hành__: Đồng bộ bếp—thu ngân, giảm thời gian chờ; quy trình minh bạch giúp đào tạo nhân sự nhanh.
- __Minh bạch dữ liệu__: Báo cáo theo ca/chi nhánh, top món bán chạy, biên lợi nhuận; xuất dữ liệu phục vụ kế toán.
- __Triển khai nhanh & chi phí hợp lý__: Hỗ trợ thiết lập trong 24 giờ, vận hành ngay trên thiết bị sẵn có.

## Quy trình xử lý đơn

1. __Khách tạo đơn__: Chọn món/tuỳ chọn và gửi đặt hàng (ghi chú nếu cần).
2. __Tạo đơn `pending`__: Hệ thống ghi nhận và đồng bộ đến quầy/bếp theo thời gian thực.
3. __Xác nhận `confirmed`__: Nhân viên kiểm tra tính hợp lệ (món, giá, khuyến mãi, ghi chú).
4. __Chuẩn bị `preparing`__: Bếp nhận phiếu, tiến hành chế biến; quầy cập nhật trạng thái cho khách.
5. __Sẵn sàng `ready`__: Đơn hoàn tất, chờ giao/nhận; thông báo tới khách.
6. __Hoàn tất `completed`__ hoặc __Huỷ `cancelled`__: Chốt ca và ghi nhận vào báo cáo doanh thu/KPI.

## Công nghệ

- __Next.js__ (frontend + server actions)
- __Vercel__ (deploy)
- __Supabase__ (Postgres, Auth, Realtime, Storage)
- __Prisma__ (ORM) nếu có
- __Tailwind CSS/Shadcn UI__ (UI) nếu có

## Cấu hình môi trường

Tạo file `.env.local` ở thư mục gốc và điền các biến sau:

```env
# Postgres
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_HOST=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Supabase (server)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

# Supabase (client)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Khác
BLOB_READ_WRITE_TOKEN=
```

Lưu ý: không commit `.env.local` lên repository công khai.

## Chạy local

1. Cài dependencies: `pnpm i` (hoặc `npm i`/`yarn`)
2. Tạo `.env.local` và điền giá trị thật
3. Chạy dev: `pnpm dev`
4. Mở http://localhost:3000

## Triển khai

Ứng dụng đang live trên Vercel: **https://vercel.com/tdnm/v0-com-tam-lu-app**

- Push lên nhánh chính → Vercel tự động build & deploy.
- Có thể cấu hình biến môi trường trong Vercel Project Settings.
