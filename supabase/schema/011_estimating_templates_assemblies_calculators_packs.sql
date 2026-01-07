-- ConstructOS Estimating — Parametric Templates/Assemblies/Calculators + Packs

-- (A) Template versioning + metadata
alter table public.estimate_templates
  add column if not exists version_number int not null default 1,
  add column if not exists tags text,
  add column if not exists typical_min numeric(12,2),
  add column if not exists typical_max numeric(12,2),
  add column if not exists typical_duration_days int,
  add column if not exists is_featured boolean not null default false;

create table if not exists public.estimate_template_versions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  template_id uuid not null references public.estimate_templates(id) on delete cascade,
  version_number int not null,
  changelog text,
  created_at timestamptz not null default now()
);

-- (B) Parametric assemblies
alter table public.assemblies
  add column if not exists params_schema jsonb not null default '[]'::jsonb; -- array of {key,label,type,unit,default}

alter table public.assembly_items
  add column if not exists qty_expression text; -- e.g. "area_m2 * 0.9"

-- (C) Calculator registry (metadata stored in DB, compute logic in code)
create table if not exists public.calculator_registry (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  key text not null, -- stable code key
  name text not null,
  description text,
  category text,
  tags text,
  ui_schema jsonb not null default '[]'::jsonb, -- input fields schema
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists calculator_registry_unique
on public.calculator_registry(company_id, key);

-- (D) Packs (import/export)
create table if not exists public.estimating_packs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  name text not null,
  description text,
  pack_version int not null default 1,
  contents jsonb not null default '{}'::jsonb, -- exported payload
  created_at timestamptz not null default now()
);

alter table public.estimate_template_versions enable row level security;
alter table public.calculator_registry enable row level security;
alter table public.estimating_packs enable row level security;

-- RLS policies (simplified for single-tenant)
drop policy if exists "estimate_template_versions_company_access" on public.estimate_template_versions;
create policy "estimate_template_versions_company_access"
on public.estimate_template_versions
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "calculator_registry_company_access" on public.calculator_registry;
create policy "calculator_registry_company_access"
on public.calculator_registry
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "estimating_packs_company_access" on public.estimating_packs;
create policy "estimating_packs_company_access"
on public.estimating_packs
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

