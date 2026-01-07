-- ConstructOS Estimating — Live Rates Cache + History + Last Buy

-- (A) Provider cache (latest quotes)
create table if not exists public.rate_provider_cache (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  provider_key text not null,
  query_hash text not null, -- e.g. sha1 of query
  query_text text not null,

  results jsonb not null default '[]'::jsonb, -- array of ProviderQuote
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null,

  created_at timestamptz not null default now()
);

create index if not exists rate_provider_cache_lookup
on public.rate_provider_cache(company_id, provider_key, query_hash);

alter table public.rate_provider_cache enable row level security;

drop policy if exists "rate_provider_cache_company_access" on public.rate_provider_cache;
create policy "rate_provider_cache_company_access"
on public.rate_provider_cache
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- (B) Price history (time series)
create table if not exists public.rate_price_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  provider_key text not null,

  material_code text,
  material_name text not null,
  unit text not null,
  cost numeric(12,2) not null,
  currency text not null default 'GBP',

  observed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists rate_price_history_lookup
on public.rate_price_history(company_id, provider_key, material_name, observed_at desc);

alter table public.rate_price_history enable row level security;

drop policy if exists "rate_price_history_company_access" on public.rate_price_history;
create policy "rate_price_history_company_access"
on public.rate_price_history
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- (C) Last buy costs derived from purchase orders (material truth)
create table if not exists public.rate_last_buy (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,

  -- match key (best effort)
  material_code text,
  material_name text not null,
  unit text not null,

  last_buy_cost numeric(12,2) not null,
  last_buy_at timestamptz not null default now(),
  source_purchase_order_id uuid,
  source_supplier text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists rate_last_buy_unique
on public.rate_last_buy(company_id, material_name, unit);

alter table public.rate_last_buy enable row level security;

drop policy if exists "rate_last_buy_company_access" on public.rate_last_buy;
create policy "rate_last_buy_company_access"
on public.rate_last_buy
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

