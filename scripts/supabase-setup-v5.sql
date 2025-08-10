-- Safe idempotent migration to align schema and seed data.

-- Enable extensions if available (no-op if already enabled)
create extension if not exists pgcrypto;
create extension if not exists uuid-ossp;

-- Updated-at trigger function (idempotent)
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- MENU ITEMS
create table if not exists public.menu_items (
  id bigserial primary key,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  available boolean not null default true,
  category text,
  sort_order integer not null default 0,
  image_url text,
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique index on name (replaces unsupported ADD CONSTRAINT IF NOT EXISTS)
create unique index if not exists uq_menu_items_name_idx on public.menu_items (name);

-- Trigger
drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at
before update on public.menu_items
for each row execute procedure set_updated_at();

-- RESTAURANT TABLES
create table if not exists public.restaurant_tables (
  id bigserial primary key,
  table_number integer not null unique,
  label text,
  qrcode_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists restaurant_tables_set_updated_at on public.restaurant_tables;
create trigger restaurant_tables_set_updated_at
before update on public.restaurant_tables
for each row execute procedure set_updated_at();

-- ORDERS
create table if not exists public.orders (
  id bigserial primary key,
  table_id bigint references public.restaurant_tables(id) on delete set null,
  table_number integer not null,
  status text not null default 'pending', -- pending|preparing|served|paid|cancelled
  subtotal numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  note text,
  customer_name text,
  payment_method text, -- cash|momo|card|other
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_table_number_idx on public.orders (table_number);
create index if not exists orders_status_idx on public.orders (status);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute procedure set_updated_at();

-- ORDER ITEMS
create table if not exists public.order_items (
  id bigserial primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  menu_item_id bigint references public.menu_items(id) on delete set null,
  name text not null, -- snapshot of menu item name
  price numeric(10,2) not null default 0, -- snapshot of price
  quantity integer not null default 1,
  special_requests text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);

drop trigger if exists order_items_set_updated_at on public.order_items;
create trigger order_items_set_updated_at
before update on public.order_items
for each row execute procedure set_updated_at();

-- Seed/Upsert featured dishes with your provided images.
insert into public.menu_items (name, description, price, available, category, sort_order, image_url, image)
values
  ('Sườn nướng than', 'Sườn nướng đậm đà, thơm lừng', 39000, true, 'Sườn', 1, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cach-uop-suon-nuong-com-tam-ngon.jpg-3yyPdNm3Wxvpoxr9xia2TQCZ9S9fl3.jpeg', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cach-uop-suon-nuong-com-tam-ngon.jpg-3yyPdNm3Wxvpoxr9xia2TQCZ9S9fl3.jpeg'),
  ('Cơm tấm sườn bì chả', 'Phần đầy đủ sườn, bì, chả', 49000, true, 'Combo', 2, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_0081-scaled.jpg-blkJxtC7dC4BiZyQel7zp5ieUIWdec.jpeg', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_0081-scaled.jpg-blkJxtC7dC4BiZyQel7zp5ieUIWdec.jpeg'),
  ('Cơm tấm trứng ốp la', 'Thêm trứng ốp la nóng hổi', 45000, true, 'Combo', 3, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2023_10_29_638341413351086151_cach-uop-suon-com-tam-sb0Hh8yQD45D6vxXDNlumnkXTKGvoz.webp', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2023_10_29_638341413351086151_cach-uop-suon-com-tam-sb0Hh8yQD45D6vxXDNlumnkXTKGvoz.webp'),
  ('Combo đủ vị', 'Cơm tấm đủ món cho 1 người', 55000, true, 'Combo', 4, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/khoa-hoc-nau-com-tam-suon-bi-cha-de-mo-quan-kinh-doanh-7.jpg-NDBxyUteqeDr2TsasU7FDvo4L9G9Nk.jpeg', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/khoa-hoc-nau-com-tam-suon-bi-cha-de-mo-quan-kinh-doanh-7.jpg-NDBxyUteqeDr2TsasU7FDvo4L9G9Nk.jpeg')
on conflict (name) do update
set description = excluded.description,
    price = excluded.price,
    available = excluded.available,
    category = excluded.category,
    sort_order = excluded.sort_order,
    image_url = excluded.image_url,
    image = excluded.image;

-- Done.
