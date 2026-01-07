-- ConstructOS Estimating — Rate Book + Settings + Providers

-- (A) Regions and trade rates (UK area-based)
create table if not exists public.rate_regions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  name text not null, -- e.g. "South East", "London"
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists rate_regions_unique_default
on public.rate_regions(company_id)
where is_default = true;

create table if not exists public.trade_rates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  region_id uuid not null references public.rate_regions(id) on delete cascade,
  trade text not null, -- "Carpenter", "Electrician", "Plumber", "Labourer", "Bricklayer", etc.

  rate_hour numeric(12,2) not null default 0,
  rate_day numeric(12,2) not null default 0,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- (B) Catalogues (materials/labour/plant)
create table if not exists public.rate_materials (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null, -- store per-company library; seed starter set per company
  code text,
  name text not null,
  category text,
  unit text not null default 'each',
  base_cost numeric(12,2) not null default 0,
  supplier_hint text,
  tags text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rate_labour (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  trade text not null,
  role text, -- optional: "Improver", "Lead", "Mate"
  unit text not null default 'hour', -- hour/day
  base_cost numeric(12,2) not null default 0,
  productivity_hint text, -- e.g. "m2 per hour"
  tags text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rate_plant (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  name text not null,
  unit text not null default 'day',
  base_cost numeric(12,2) not null default 0,
  supplier_hint text,
  tags text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- (C) Company estimating settings
create table if not exists public.company_estimating_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique,

  vat_rate numeric(5,2) not null default 20,
  labour_burden_pct numeric(6,2) not null default 0,
  overhead_pct numeric(6,2) not null default 0,
  margin_pct numeric(6,2) not null default 0,

  rounding_mode text not null default 'none', -- none|nearest_1|nearest_5|nearest_10
  pricing_mode text not null default 'cost_plus', -- cost_plus|price_only

  -- default wastage by category (simple JSON map)
  wastage_defaults jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- (D) Estimate-level overrides
create table if not exists public.estimate_pricing_overrides (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  estimate_id uuid not null unique references public.estimates(id) on delete cascade,

  vat_rate numeric(5,2),
  labour_burden_pct numeric(6,2),
  overhead_pct numeric(6,2),
  margin_pct numeric(6,2),
  rounding_mode text,
  pricing_mode text,
  wastage_defaults jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- (E) Provider feature flags
create table if not exists public.rate_providers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  provider_key text not null, -- e.g. "seeded", "tp", "jewson", "scrape"
  is_enabled boolean not null default false,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists rate_providers_unique
on public.rate_providers(company_id, provider_key);

-- RLS
alter table public.rate_regions enable row level security;
alter table public.trade_rates enable row level security;
alter table public.rate_materials enable row level security;
alter table public.rate_labour enable row level security;
alter table public.rate_plant enable row level security;
alter table public.company_estimating_settings enable row level security;
alter table public.estimate_pricing_overrides enable row level security;
alter table public.rate_providers enable row level security;

-- Generic company access policies (simplified for single-tenant)
-- rate_regions
drop policy if exists "rate_regions_company_access" on public.rate_regions;
create policy "rate_regions_company_access"
on public.rate_regions
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- trade_rates
drop policy if exists "trade_rates_company_access" on public.trade_rates;
create policy "trade_rates_company_access"
on public.trade_rates
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- rate_materials
drop policy if exists "rate_materials_company_access" on public.rate_materials;
create policy "rate_materials_company_access"
on public.rate_materials
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- rate_labour
drop policy if exists "rate_labour_company_access" on public.rate_labour;
create policy "rate_labour_company_access"
on public.rate_labour
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- rate_plant
drop policy if exists "rate_plant_company_access" on public.rate_plant;
create policy "rate_plant_company_access"
on public.rate_plant
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- company_estimating_settings
drop policy if exists "company_estimating_settings_company_access" on public.company_estimating_settings;
create policy "company_estimating_settings_company_access"
on public.company_estimating_settings
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- estimate_pricing_overrides
drop policy if exists "estimate_pricing_overrides_company_access" on public.estimate_pricing_overrides;
create policy "estimate_pricing_overrides_company_access"
on public.estimate_pricing_overrides
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- rate_providers
drop policy if exists "rate_providers_company_access" on public.rate_providers;
create policy "rate_providers_company_access"
on public.rate_providers
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

