-- Supabase migration for QR Order Pro - aligns schema and fixes image_url errors.
-- Safe to run multiple times.

-- 1) Helpers: updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 2) Enum for order status (idempotent)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled');
  end if;
end$$;

-- 3) Tables

-- Tables: dining tables
create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  table_number int not null unique,
  label text,
  qr_slug text unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Menu items
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  category text,
  -- Include BOTH columns so any code path works:
  image_url text, -- preferred external/public URL
  image text,     -- optional legacy/internal path
  is_available boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  table_number int not null,
  status order_status not null default 'pending',
  notes text,
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id),
  name_snapshot text not null,
  price_snapshot numeric(12,2) not null default 0,
  quantity int not null default 1,
  special_requests text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4) Indexes
create index if not exists idx_menu_items_name on public.menu_items using gin (to_tsvector('simple', coalesce(name, '')));
create index if not exists idx_menu_items_category on public.menu_items (category);
create index if not exists idx_orders_table_number on public.orders (table_number);
create index if not exists idx_order_items_order on public.order_items (order_id);

-- 5) Triggers
drop trigger if exists trg_menu_items_updated_at on public.menu_items;
create trigger trg_menu_items_updated_at before update on public.menu_items
for each row execute procedure set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at before update on public.orders
for each row execute procedure set_updated_at();

drop trigger if exists trg_order_items_updated_at on public.order_items;
create trigger trg_order_items_updated_at before update on public.order_items
for each row execute procedure set_updated_at();

drop trigger if exists trg_tables_updated_at on public.tables;
create trigger trg_tables_updated_at before update on public.tables
for each row execute procedure set_updated_at();

-- 6) Seed sample menu items with your provided image Source URLs
-- Uses upsert on unique name via constraint created below.
alter table public.menu_items
  add constraint if not exists uq_menu_items_name unique (name);

insert into public.menu_items (name, description, price, category, image_url, is_available)
values
  ('Sườn nướng than hoa', 'Sườn heo ướp mật ong nướng than', 55000, 'Cơm tấm', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cach-uop-suon-nuong-com-tam-ngon.jpg-3yyPdNm3Wxvpoxr9xia2TQCZ9S9fl3.jpeg', true),
  ('Cơm tấm sườn bì chả', 'Đĩa cơm tấm truyền thống', 65000, 'Cơm tấm', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_0081-scaled.jpg-blkJxtC7dC4BiZyQel7zp5ieUIWdec.jpeg', true),
  ('Cơm tấm trứng ốp la', 'Cơm tấm sườn trứng, mỡ hành', 59000, 'Cơm tấm', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2023_10_29_638341413351086151_cach-uop-suon-com-tam-sb0Hh8yQD45D6vxXDNlumnkXTKGvoz.webp', true),
  ('Combo 19K Poster', 'Poster khuyến mãi minh họa', 19000, 'Khuyến mãi', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_20250810_021232.png-t2pF3h5kiK7T7tbHCRWo6xZsY1DzA3.jpeg', true),
  ('Cơm tấm đầy đủ', 'Sườn, bì, chả, trứng, dưa leo', 69000, 'Cơm tấm', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/khoa-hoc-nau-com-tam-suon-bi-cha-de-mo-quan-kinh-doanh-7.jpg-NDBxyUteqeDr2TsasU7FDvo4L9G9Nk.jpeg', true)
on conflict (name) do update set
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  image_url = excluded.image_url,
  is_available = excluded.is_available,
  updated_at = now();
