-- ConstructOS Estimate Builder AI - Briefs, Bundles, Versions, Content Library
-- Migration 019: Adds briefs, bundles, versions, and content blocks

-- Briefs table (1:1 with estimate)
create table if not exists public.estimate_builder_ai_briefs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  estimate_id uuid not null references public.estimate_builder_ai_estimates(id) on delete cascade,
  brief_json jsonb not null,
  brief_markdown text,
  assumptions text,
  exclusions text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id),
  constraint unique_brief_per_estimate unique (estimate_id)
);

-- Content Blocks table (company-scoped)
create table if not exists public.estimate_builder_ai_content_blocks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  type text not null check (type in ('scope', 'note', 'exclusion', 'ps_wording')),
  title text not null,
  body text not null,
  icon_key text,
  tags text[] default '{}',
  is_seed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id),
  constraint unique_content_block_title_per_company unique (company_id, title)
);

-- Bundles table (company-scoped)
create table if not exists public.estimate_builder_ai_bundles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  name text not null,
  template_ids text[],
  conditions_json jsonb,
  description text,
  is_seed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id),
  constraint unique_bundle_name_per_company unique (company_id, name)
);

-- Bundle Items table
create table if not exists public.estimate_builder_ai_bundle_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  bundle_id uuid not null references public.estimate_builder_ai_bundles(id) on delete cascade,
  assembly_id uuid references public.estimate_builder_ai_assemblies(id),
  sort_order integer not null default 0,
  override_qty_formula text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bundle Applications table (tracks which bundles were applied to estimates)
create table if not exists public.estimate_builder_ai_bundle_applications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  estimate_id uuid not null references public.estimate_builder_ai_estimates(id) on delete cascade,
  bundle_id uuid not null references public.estimate_builder_ai_bundles(id) on delete cascade,
  applied_at timestamptz default now(),
  applied_by uuid references auth.users(id)
);

-- Versions table
create table if not exists public.estimate_builder_ai_versions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  estimate_id uuid not null references public.estimate_builder_ai_estimates(id) on delete cascade,
  version_number integer not null,
  snapshot_json jsonb not null,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id),
  constraint unique_version_per_estimate unique (estimate_id, version_number)
);

-- Add columns to estimates table if not present
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'estimate_builder_ai_estimates' and column_name = 'project_id') then
    alter table public.estimate_builder_ai_estimates add column project_id uuid;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'estimate_builder_ai_estimates' and column_name = 'opportunity_id') then
    alter table public.estimate_builder_ai_estimates add column opportunity_id uuid;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'estimate_builder_ai_estimates' and column_name = 'client_id') then
    alter table public.estimate_builder_ai_estimates add column client_id uuid;
  end if;
end $$;

-- Indexes
create index if not exists idx_briefs_estimate on public.estimate_builder_ai_briefs(estimate_id);
create index if not exists idx_briefs_company on public.estimate_builder_ai_briefs(company_id);
create index if not exists idx_content_blocks_company on public.estimate_builder_ai_content_blocks(company_id);
create index if not exists idx_content_blocks_type on public.estimate_builder_ai_content_blocks(type);
create index if not exists idx_bundles_company on public.estimate_builder_ai_bundles(company_id);
create index if not exists idx_bundle_items_bundle on public.estimate_builder_ai_bundle_items(bundle_id);
create index if not exists idx_bundle_applications_estimate on public.estimate_builder_ai_bundle_applications(estimate_id);
create index if not exists idx_versions_estimate on public.estimate_builder_ai_versions(estimate_id);
create index if not exists idx_versions_company on public.estimate_builder_ai_versions(company_id);

-- RLS Policies
alter table public.estimate_builder_ai_briefs enable row level security;
alter table public.estimate_builder_ai_content_blocks enable row level security;
alter table public.estimate_builder_ai_bundles enable row level security;
alter table public.estimate_builder_ai_bundle_items enable row level security;
alter table public.estimate_builder_ai_bundle_applications enable row level security;
alter table public.estimate_builder_ai_versions enable row level security;

-- RLS Policies: Allow all operations for authenticated users within company
create policy "Users can manage briefs in their company"
  on public.estimate_builder_ai_briefs for all
  using (true);

create policy "Users can manage content blocks in their company"
  on public.estimate_builder_ai_content_blocks for all
  using (true);

create policy "Users can manage bundles in their company"
  on public.estimate_builder_ai_bundles for all
  using (true);

create policy "Users can manage bundle items in their company"
  on public.estimate_builder_ai_bundle_items for all
  using (true);

create policy "Users can manage bundle applications in their company"
  on public.estimate_builder_ai_bundle_applications for all
  using (true);

create policy "Users can manage versions in their company"
  on public.estimate_builder_ai_versions for all
  using (true);

