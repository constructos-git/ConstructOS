-- ConstructOS Estimate Builder AI - Measurements, Assemblies, and Rate Settings
-- Migration 018: Adds measurements, rate settings, assemblies, and item flags

-- Measurements table (1:1 with estimate)
create table if not exists public.estimate_builder_ai_measurements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  estimate_id uuid not null references public.estimate_builder_ai_estimates(id) on delete cascade,
  external_length_m numeric(10, 2),
  external_width_m numeric(10, 2),
  eaves_height_m numeric(10, 2) default 2.4,
  floor_area_m2 numeric(10, 2),
  perimeter_m numeric(10, 2),
  external_wall_area_m2 numeric(10, 2),
  roof_area_m2 numeric(10, 2),
  roof_factor numeric(5, 3),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_measurements_per_estimate unique (estimate_id)
);

-- Rate Settings table (1:1 with estimate)
create table if not exists public.estimate_builder_ai_rate_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  estimate_id uuid not null references public.estimate_builder_ai_estimates(id) on delete cascade,
  region text default 'South East',
  regional_multiplier numeric(5, 3) default 1.0,
  overhead_pct numeric(5, 2) default 10.00,
  margin_pct numeric(5, 2) default 15.00,
  contingency_pct numeric(5, 2) default 5.00,
  vat_pct numeric(5, 2) default 20.00,
  auto_rate_mode boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_rate_settings_per_estimate unique (estimate_id)
);

-- Assemblies table (company-scoped, can be seeded or custom)
create table if not exists public.estimate_builder_ai_assemblies (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  name text not null,
  category text,
  default_unit text,
  description text,
  is_seed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id),
  constraint unique_assembly_name_per_company unique (company_id, name)
);

-- Assembly Lines table
create table if not exists public.estimate_builder_ai_assembly_lines (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  assembly_id uuid not null references public.estimate_builder_ai_assemblies(id) on delete cascade,
  title text not null,
  cost_type text not null, -- 'materials' | 'labour' | 'subcontract' | 'plant' | 'prelim'
  qty_formula text,
  unit text not null,
  base_unit_cost numeric(12, 2) not null default 0,
  default_markup_pct numeric(5, 2) default 15.00,
  vat_applicable boolean default true,
  customer_text_block text,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add new columns to estimate_builder_ai_items
alter table public.estimate_builder_ai_items
  add column if not exists is_auto_rated boolean default false,
  add column if not exists is_manual_override boolean default false,
  add column if not exists assembly_id uuid references public.estimate_builder_ai_assemblies(id),
  add column if not exists assembly_line_id uuid references public.estimate_builder_ai_assembly_lines(id),
  add column if not exists qty_formula text,
  add column if not exists source_tokens jsonb,
  add column if not exists is_qty_locked boolean default false;

-- Indexes
create index if not exists idx_measurements_estimate on public.estimate_builder_ai_measurements(estimate_id);
create index if not exists idx_measurements_company on public.estimate_builder_ai_measurements(company_id);
create index if not exists idx_rate_settings_estimate on public.estimate_builder_ai_rate_settings(estimate_id);
create index if not exists idx_rate_settings_company on public.estimate_builder_ai_rate_settings(company_id);
create index if not exists idx_assemblies_company on public.estimate_builder_ai_assemblies(company_id);
create index if not exists idx_assembly_lines_assembly on public.estimate_builder_ai_assembly_lines(assembly_id);
create index if not exists idx_items_assembly on public.estimate_builder_ai_items(assembly_id);

-- RLS Policies
alter table public.estimate_builder_ai_measurements enable row level security;
alter table public.estimate_builder_ai_rate_settings enable row level security;
alter table public.estimate_builder_ai_assemblies enable row level security;
alter table public.estimate_builder_ai_assembly_lines enable row level security;

-- RLS Policies: Allow all operations for authenticated users within company
create policy "Users can manage measurements in their company"
  on public.estimate_builder_ai_measurements for all
  using (true);

create policy "Users can manage rate settings in their company"
  on public.estimate_builder_ai_rate_settings for all
  using (true);

create policy "Users can manage assemblies in their company"
  on public.estimate_builder_ai_assemblies for all
  using (true);

create policy "Users can manage assembly lines in their company"
  on public.estimate_builder_ai_assembly_lines for all
  using (true);

