-- RBAC and schema alignment for real data

-- User profiles table for explicit role storage (optional; we use user_metadata.role primarily)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
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

-- Orders and order_items with snake_case columns
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  table_number text not null,
  status text check (status in ('pending','preparing','ready','completed','cancelled')) not null default 'pending',
  notes text,
  order_time timestamptz not null default now(),
  total_amount numeric(12,2) not null default 0,
  completed_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id text not null,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null default 0,
  special_requests text
);

-- Enable Row Level Security (adjust policies to your needs)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Example permissive policies (start here, then tighten)
-- Authenticated users can insert orders (for customer flow)
create policy if not exists "orders_insert_authenticated"
on public.orders for insert
to authenticated
with check (true);

-- Staff/Admin can read all orders (replace with a secure check via JWT if needed)
create policy if not exists "orders_select_authenticated"
on public.orders for select
to authenticated
using (true);

-- Insert items for the orders they create (adjust if you track user ownership)
create policy if not exists "order_items_insert_authenticated"
on public.order_items for insert
to authenticated
with check (true);

-- Read all order items (for admin/staff dashboards)
create policy if not exists "order_items_select_authenticated"
on public.order_items for select
to authenticated
using (true);

-- Optional: lock down updates/deletes unless admin role (requires JWT claims or supabase functions)
