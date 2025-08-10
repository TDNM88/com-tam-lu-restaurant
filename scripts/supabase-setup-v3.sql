-- Schema for QR Order Pro - consistent snake_case and constraints

-- MENU ITEMS
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  description text,
  price integer not null default 0,
  image_url text,
  category text not null default 'other',
  rating numeric(2,1) default 4.5,
  prep_time text,
  is_popular boolean default false,
  is_free boolean default false,
  is_available boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_menu_items_category on public.menu_items (category);
create index if not exists idx_menu_items_available on public.menu_items (is_available);

-- trigger to auto-update updated_at
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_menu_items_set_updated on public.menu_items;
create trigger trg_menu_items_set_updated before update on public.menu_items
for each row execute function public.set_updated_at();

-- TABLES (QR tables)
create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  table_number text not null unique,
  status text not null default 'available' check (status in ('available', 'occupied', 'reserved')),
  capacity int,
  qr_code_url text,
  created_at timestamptz not null default now()
);

-- ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  table_number text not null,
  status text not null default 'pending' check (status in ('pending','preparing','ready','completed','cancelled')),
  notes text,
  order_time timestamptz not null default now(),
  total_amount integer not null default 0,
  completed_at timestamptz
);

create index if not exists idx_orders_time on public.orders (order_time desc);
create index if not exists idx_orders_table on public.orders (table_number);

-- ORDER ITEMS
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id),
  quantity int not null default 1 check (quantity > 0),
  unit_price integer not null default 0,
  subtotal integer not null default 0,
  special_requests text
);

create index if not exists idx_order_items_order on public.order_items (order_id);
create index if not exists idx_order_items_menu on public.order_items (menu_item_id);
