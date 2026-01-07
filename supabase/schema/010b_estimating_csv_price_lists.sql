-- ConstructOS Estimating — CSV Price Lists

create table if not exists public.supplier_price_lists (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  supplier_name text not null,
  currency text not null default 'GBP',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supplier_price_list_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  price_list_id uuid not null references public.supplier_price_lists(id) on delete cascade,

  code text,
  name text not null,
  unit text not null default 'each',
  cost numeric(12,2) not null default 0,
  tags text,

  created_at timestamptz not null default now()
);

alter table public.supplier_price_lists enable row level security;
alter table public.supplier_price_list_items enable row level security;

drop policy if exists "supplier_price_lists_company_access" on public.supplier_price_lists;
create policy "supplier_price_lists_company_access"
on public.supplier_price_lists
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "supplier_price_list_items_company_access" on public.supplier_price_list_items;
create policy "supplier_price_list_items_company_access"
on public.supplier_price_list_items
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

