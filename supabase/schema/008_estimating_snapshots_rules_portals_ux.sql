-- ConstructOS Estimating — Snapshots + Grouping Rules + Portal Actions + Libraries

-- (A) Snapshot tables for WO/PO lines generated from a quote version
create table if not exists public.work_order_line_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  source_quote_version_id uuid references public.quote_versions(id) on delete set null,
  source_estimate_item_id uuid,

  sort_order int not null default 0,
  item_type text not null,
  title text not null,
  description text,
  quantity numeric(12,3) not null default 0,
  unit text not null default 'each',
  unit_cost numeric(12,2) not null default 0,
  line_cost numeric(12,2) not null default 0,

  created_at timestamptz not null default now()
);

create table if not exists public.purchase_order_line_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  source_quote_version_id uuid references public.quote_versions(id) on delete set null,
  source_estimate_item_id uuid,

  sort_order int not null default 0,
  item_type text not null,
  title text not null,
  description text,
  quantity numeric(12,3) not null default 0,
  unit text not null default 'each',
  unit_cost numeric(12,2) not null default 0,
  line_cost numeric(12,2) not null default 0,

  created_at timestamptz not null default now()
);

alter table public.work_order_line_snapshots enable row level security;
alter table public.purchase_order_line_snapshots enable row level security;

drop policy if exists "wo_line_snapshots_company_access" on public.work_order_line_snapshots;
create policy "wo_line_snapshots_company_access"
on public.work_order_line_snapshots
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "po_line_snapshots_company_access" on public.purchase_order_line_snapshots;
create policy "po_line_snapshots_company_access"
on public.purchase_order_line_snapshots
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- (B) Grouping rules
create table if not exists public.estimating_group_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  rule_type text not null, -- 'work_order' | 'purchase_order'
  is_enabled boolean not null default true,
  priority int not null default 100,

  match_item_type text,              -- labour/material/plant/subcontract (nullable)
  match_section_contains text,        -- case-insensitive substring
  match_title_contains text,          -- case-insensitive substring
  match_tag_contains text,            -- substring in tags CSV/JSON (v1 simple)

  target_party_id uuid,               -- contractor_id or supplier_id (future)
  target_party_name text not null,    -- v1 string label
  target_document_title text,         -- e.g. "Roofing package"

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.estimating_group_rules enable row level security;

drop policy if exists "estimating_group_rules_company_access" on public.estimating_group_rules;
create policy "estimating_group_rules_company_access"
on public.estimating_group_rules
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- (C) Portal acknowledgements + notes thread
create table if not exists public.document_portal_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,

  document_type text not null, -- work_order|purchase_order
  document_id uuid not null,

  token_used text not null,
  event_type text not null, -- acknowledged|note|availability
  event_message text,
  availability_date date,

  created_at timestamptz not null default now()
);

alter table public.document_portal_events enable row level security;

drop policy if exists "document_portal_events_company_access" on public.document_portal_events;
create policy "document_portal_events_company_access"
on public.document_portal_events
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Public RPC to post portal events (token-based)
create or replace function public.submit_portal_event(
  p_token text,
  p_event_type text,
  p_message text,
  p_availability date
)
returns jsonb
language plpgsql
security definer
as $$
declare
  tok record;
  doc_id uuid;
  doc_type text;
begin
  select * into tok
  from public.document_access_tokens
  where token = p_token
    and (expires_at is null or expires_at > now())
  limit 1;

  if tok is null then
    return null;
  end if;

  doc_id := tok.document_id;
  doc_type := tok.document_type;

  -- Only allow for work_order / purchase_order
  if doc_type not in ('work_order','purchase_order') then
    return null;
  end if;

  insert into public.document_portal_events(
    company_id, document_type, document_id,
    token_used, event_type, event_message, availability_date
  ) values (
    tok.company_id, doc_type, doc_id,
    p_token, p_event_type, nullif(p_message,''), p_availability
  );

  -- Activity log
  insert into public.estimating_activity(company_id, estimate_id, document_type, document_id, action, message, metadata)
  values (tok.company_id, null, doc_type, doc_id, 'portal_event',
          'Portal event submitted.', jsonb_build_object('event_type', p_event_type));

  return jsonb_build_object('ok', true);
end $$;

-- Public RPC to read portal events
create or replace function public.get_portal_events_by_token(p_token text)
returns jsonb
language plpgsql
security definer
as $$
declare
  tok record;
begin
  select * into tok
  from public.document_access_tokens
  where token = p_token
    and (expires_at is null or expires_at > now())
  limit 1;

  if tok is null then
    return null;
  end if;

  return (
    select jsonb_agg(to_jsonb(e) order by e.created_at desc)
    from public.document_portal_events e
    where e.document_type = tok.document_type
      and e.document_id = tok.document_id
    limit 50
  );
end $$;

-- (D) Assemblies library (reusable bundles)
create table if not exists public.assemblies (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  name text not null,
  description text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assembly_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  assembly_id uuid not null references public.assemblies(id) on delete cascade,
  sort_order int not null default 0,

  item_type text not null, -- labour/material/plant/subcontract
  title text not null,
  description text,
  default_quantity numeric(12,3) not null default 1,
  unit text not null default 'each',
  default_unit_price numeric(12,2) not null default 0,

  created_at timestamptz not null default now()
);

alter table public.assemblies enable row level security;
alter table public.assembly_items enable row level security;

drop policy if exists "assemblies_company_access" on public.assemblies;
create policy "assemblies_company_access"
on public.assemblies
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "assembly_items_company_access" on public.assembly_items;
create policy "assembly_items_company_access"
on public.assembly_items
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- (E) Project templates (estimate templates)
create table if not exists public.estimate_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  name text not null,
  description text,
  category text,
  created_at timestamptz not null default now()
);

create table if not exists public.estimate_template_sections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  template_id uuid not null references public.estimate_templates(id) on delete cascade,
  sort_order int not null default 0,
  title text not null,
  is_client_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.estimate_template_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  template_id uuid not null references public.estimate_templates(id) on delete cascade,
  template_section_sort_order int not null default 0, -- maps to section sort_order
  sort_order int not null default 0,
  item_type text not null,
  title text not null,
  description text,
  quantity numeric(12,3) not null default 1,
  unit text not null default 'each',
  unit_price numeric(12,2) not null default 0,
  is_client_visible boolean not null default true
);

alter table public.estimate_templates enable row level security;
alter table public.estimate_template_sections enable row level security;
alter table public.estimate_template_items enable row level security;

drop policy if exists "estimate_templates_company_access" on public.estimate_templates;
create policy "estimate_templates_company_access"
on public.estimate_templates
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "estimate_template_sections_company_access" on public.estimate_template_sections;
create policy "estimate_template_sections_company_access"
on public.estimate_template_sections
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "estimate_template_items_company_access" on public.estimate_template_items;
create policy "estimate_template_items_company_access"
on public.estimate_template_items
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

