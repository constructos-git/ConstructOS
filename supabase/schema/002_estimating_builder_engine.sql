-- ConstructOS Estimating — Builder/Engine v1

create extension if not exists "pgcrypto";

-- Sections
create table if not exists public.estimate_sections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  parent_section_id uuid references public.estimate_sections(id) on delete cascade,
  sort_order int not null default 0,
  title text not null,
  description text,
  is_client_visible boolean not null default true,
  created_at timestamptz not null default now()
);

-- Items
create table if not exists public.estimate_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  section_id uuid references public.estimate_sections(id) on delete set null,
  sort_order int not null default 0,

  item_type text not null default 'combined', -- labour|material|plant|subcontract|combined
  title text not null,
  description text,

  quantity numeric(12,3) not null default 1,
  unit text not null default 'item',

  unit_cost numeric(12,2) not null default 0,
  unit_price numeric(12,2) not null default 0,
  margin_percent numeric(6,2) not null default 0,

  line_cost numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0,

  is_client_visible boolean not null default true,

  created_at timestamptz not null default now()
);

-- Assemblies (library)
create table if not exists public.estimate_assemblies (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  name text not null,
  description text,
  category text,
  version int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Assembly items (template line items + parameter placeholders)
create table if not exists public.estimate_assembly_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  assembly_id uuid not null references public.estimate_assemblies(id) on delete cascade,
  sort_order int not null default 0,

  item_type text not null default 'combined',
  title text not null,
  description text,

  quantity_expr text not null default '1', -- e.g. "area" or "length*height"
  unit text not null default 'item',

  unit_cost numeric(12,2) not null default 0,
  unit_price numeric(12,2) not null default 0,
  margin_percent numeric(6,2) not null default 0,

  is_client_visible boolean not null default true,

  created_at timestamptz not null default now()
);

-- Calculator definitions (JSON schema + output mapping to assembly)
create table if not exists public.estimate_calculators (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  name text not null,
  description text,
  category text,
  schema jsonb not null default '{}'::jsonb,   -- form fields + defaults
  output jsonb not null default '{}'::jsonb,   -- output mapping (variables) + assembly_id
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.estimate_sections enable row level security;
alter table public.estimate_items enable row level security;
alter table public.estimate_assemblies enable row level security;
alter table public.estimate_assembly_items enable row level security;
alter table public.estimate_calculators enable row level security;

-- Reuse existing is_company_member function/policies pattern:
-- If ConstructOS already has a standard helper function, keep it.
-- Otherwise, this policy uses company_memberships directly.

do $$
declare
  t text;
begin
  foreach t in array array[
    'estimate_sections','estimate_items','estimate_assemblies','estimate_assembly_items','estimate_calculators'
  ]
  loop
    execute format('drop policy if exists "%s_company_access" on public.%I;', t, t);
    execute format($pol$
      create policy "%s_company_access" on public.%I
      for all
      using (
        exists (
          select 1 from public.company_memberships m
          where m.company_id = %I.company_id
            and m.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.company_memberships m
          where m.company_id = %I.company_id
            and m.user_id = auth.uid()
        )
      );
    $pol$, t, t, t, t);
  end loop;
end $$;

