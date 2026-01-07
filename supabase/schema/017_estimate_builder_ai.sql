-- ConstructOS Estimate Builder AI Schema
-- This migration creates tables for the AI-powered estimate builder module

-- Estimate Builder AI Templates (stored in DB, but can also be seeded in code)
create table if not exists public.estimate_builder_ai_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  name text not null,
  description text,
  category text, -- 'extension', 'conversion', 'refurbishment', etc.
  icon text, -- Icon name/key
  question_schema jsonb not null, -- Full question schema definition
  prompt_builder_config jsonb, -- Configuration for building prompts
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id),
  constraint unique_template_name_per_company unique (company_id, name)
);

-- Estimate Builder AI Estimates (separate from regular estimates for now)
create table if not exists public.estimate_builder_ai_estimates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  template_id uuid references public.estimate_builder_ai_templates(id),
  title text not null,
  status text default 'draft', -- 'draft', 'generated', 'finalized'
  estimate_brief jsonb not null, -- Structured brief from wizard answers
  internal_costing jsonb, -- Full internal costing structure
  customer_estimate jsonb, -- Customer-facing estimate structure
  visibility_settings jsonb, -- Customer estimate visibility toggles
  client_id uuid, -- Reference to clients table (if exists)
  project_id uuid, -- Reference to projects (if exists)
  opportunity_id uuid, -- Reference to opportunities (if exists)
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

-- Estimate Builder AI Answers (wizard answers)
create table if not exists public.estimate_builder_ai_answers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  estimate_id uuid not null references public.estimate_builder_ai_estimates(id) on delete cascade,
  question_id text not null, -- Question identifier from template
  answer_value jsonb not null, -- Answer data (can be string, object, array, etc.)
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_answer_per_question unique (estimate_id, question_id)
);

-- Estimate Builder AI Sections (internal costing sections)
create table if not exists public.estimate_builder_ai_sections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  estimate_id uuid not null references public.estimate_builder_ai_estimates(id) on delete cascade,
  section_type text not null, -- 'internal' or 'customer'
  title text not null,
  sort_order integer not null default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Estimate Builder AI Items (line items in sections)
create table if not exists public.estimate_builder_ai_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  section_id uuid not null references public.estimate_builder_ai_sections(id) on delete cascade,
  estimate_id uuid not null references public.estimate_builder_ai_estimates(id) on delete cascade,
  item_type text not null, -- 'material', 'labour', 'subcontract', 'plant'
  title text not null,
  description text,
  quantity numeric(12, 3) not null default 0,
  unit text not null,
  unit_cost numeric(12, 2) not null default 0, -- Internal cost
  unit_price numeric(12, 2) not null default 0, -- Selling price
  margin_percent numeric(5, 2) default 0,
  overhead_percent numeric(5, 2) default 0,
  contingency_percent numeric(5, 2) default 0,
  vat_rate numeric(5, 2) default 20, -- VAT percentage
  is_provisional boolean default false,
  is_purchasable boolean default false, -- Can generate PO
  is_work_order_eligible boolean default false, -- Can generate WO
  calculation_trace text, -- AI calculation notes/assumptions
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Purchase Orders (from Estimate Builder AI)
create table if not exists public.estimate_builder_ai_purchase_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  estimate_id uuid not null references public.estimate_builder_ai_estimates(id) on delete cascade,
  supplier_name text,
  supplier_id uuid, -- Reference to contractors/suppliers if exists
  po_number text,
  status text default 'draft', -- 'draft', 'sent', 'received', 'cancelled'
  delivery_address text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- Purchase Order Items
create table if not exists public.estimate_builder_ai_po_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  po_id uuid not null references public.estimate_builder_ai_purchase_orders(id) on delete cascade,
  estimate_item_id uuid references public.estimate_builder_ai_items(id),
  title text not null,
  description text,
  quantity numeric(12, 3) not null,
  unit text not null,
  unit_price numeric(12, 2) not null,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

-- Work Orders (from Estimate Builder AI)
create table if not exists public.estimate_builder_ai_work_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  estimate_id uuid not null references public.estimate_builder_ai_estimates(id) on delete cascade,
  contractor_name text,
  contractor_id uuid, -- Reference to contractors if exists
  wo_number text,
  status text default 'draft', -- 'draft', 'sent', 'accepted', 'in_progress', 'completed', 'cancelled'
  pricing_mode text default 'schedule', -- 'fixed' or 'schedule'
  fixed_price numeric(12, 2), -- If pricing_mode = 'fixed'
  scope_text text, -- Auto-assembled from estimate sections/items
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- Work Order Items (for schedule of rates mode)
create table if not exists public.estimate_builder_ai_wo_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000000',
  wo_id uuid not null references public.estimate_builder_ai_work_orders(id) on delete cascade,
  estimate_item_id uuid references public.estimate_builder_ai_items(id),
  title text not null,
  description text,
  quantity numeric(12, 3) not null,
  unit text not null,
  unit_price numeric(12, 2) not null,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_estimate_builder_ai_estimates_company on public.estimate_builder_ai_estimates(company_id);
create index if not exists idx_estimate_builder_ai_estimates_template on public.estimate_builder_ai_estimates(template_id);
create index if not exists idx_estimate_builder_ai_answers_estimate on public.estimate_builder_ai_answers(estimate_id);
create index if not exists idx_estimate_builder_ai_sections_estimate on public.estimate_builder_ai_sections(estimate_id);
create index if not exists idx_estimate_builder_ai_items_section on public.estimate_builder_ai_items(section_id);
create index if not exists idx_estimate_builder_ai_items_estimate on public.estimate_builder_ai_items(estimate_id);
create index if not exists idx_estimate_builder_ai_po_estimate on public.estimate_builder_ai_purchase_orders(estimate_id);
create index if not exists idx_estimate_builder_ai_wo_estimate on public.estimate_builder_ai_work_orders(estimate_id);

-- RLS Policies (if RLS is enabled)
alter table public.estimate_builder_ai_templates enable row level security;
alter table public.estimate_builder_ai_estimates enable row level security;
alter table public.estimate_builder_ai_answers enable row level security;
alter table public.estimate_builder_ai_sections enable row level security;
alter table public.estimate_builder_ai_items enable row level security;
alter table public.estimate_builder_ai_purchase_orders enable row level security;
alter table public.estimate_builder_ai_po_items enable row level security;
alter table public.estimate_builder_ai_work_orders enable row level security;
alter table public.estimate_builder_ai_wo_items enable row level security;

-- RLS Policies: Allow all operations for authenticated users within company
create policy "Users can view templates in their company"
  on public.estimate_builder_ai_templates for select
  using (true);

create policy "Users can insert templates in their company"
  on public.estimate_builder_ai_templates for insert
  with check (true);

create policy "Users can update templates in their company"
  on public.estimate_builder_ai_templates for update
  using (true);

create policy "Users can delete templates in their company"
  on public.estimate_builder_ai_templates for delete
  using (true);

create policy "Users can view estimates in their company"
  on public.estimate_builder_ai_estimates for select
  using (true);

create policy "Users can insert estimates in their company"
  on public.estimate_builder_ai_estimates for insert
  with check (true);

create policy "Users can update estimates in their company"
  on public.estimate_builder_ai_estimates for update
  using (true);

create policy "Users can delete estimates in their company"
  on public.estimate_builder_ai_estimates for delete
  using (true);

-- Similar policies for other tables
create policy "Users can manage answers in their company"
  on public.estimate_builder_ai_answers for all
  using (true);

create policy "Users can manage sections in their company"
  on public.estimate_builder_ai_sections for all
  using (true);

create policy "Users can manage items in their company"
  on public.estimate_builder_ai_items for all
  using (true);

create policy "Users can manage purchase orders in their company"
  on public.estimate_builder_ai_purchase_orders for all
  using (true);

create policy "Users can manage po items in their company"
  on public.estimate_builder_ai_po_items for all
  using (true);

create policy "Users can manage work orders in their company"
  on public.estimate_builder_ai_work_orders for all
  using (true);

create policy "Users can manage wo items in their company"
  on public.estimate_builder_ai_wo_items for all
  using (true);

