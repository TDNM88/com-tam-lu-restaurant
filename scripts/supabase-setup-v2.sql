-- Supabase schema alignment for real data (PostgreSQL)
-- Create user_profiles for RBAC
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('customer','staff','admin')) default 'customer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'customer'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Ensure orders table with snake_case columns
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  table_number text not null,
  status text check (status in ('pending','preparing','ready','completed','cancelled')) default 'pending',
  notes text,
  order_time timestamptz default now(),
  total_amount numeric(12,2) not null default 0,
  completed_at timestamptz
);

-- Ensure order_items table with special_requests column
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id text not null,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null default 0,
  special_requests text
);

-- Example policy scaffolding (adjust as needed)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Customers: insert their own orders
create policy if not exists "customers can insert orders"
on public.orders for insert
to authenticated
with check (true);

-- Staff/Admin: full read
create policy if not exists "staff admin read orders"
on public.orders for select
to authenticated
using (true);

-- Order items policies
create policy if not exists "customers can insert order_items"
on public.order_items for insert
to authenticated
with check (true);

create policy if not exists "staff admin read order_items"
on public.order_items for select
to authenticated
using (true);
