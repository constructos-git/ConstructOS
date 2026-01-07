-- ConstructOS Estimating — Work Orders & Purchase Orders v1

-- Document tables
create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  estimate_id uuid not null references public.estimates(id) on delete cascade,

  title text not null,
  reference text,
  status text not null default 'draft', -- draft|sent|accepted|in_progress|completed|cancelled

  assigned_to_name text,   -- free-text v1 (later link to contacts/contractors)
  assigned_to_email text,  -- optional for future send/portal
  notes_internal text,
  notes_contractor text,

  subtotal numeric(12,2) not null default 0,
  vat_rate numeric(5,2) not null default 0,
  vat_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,

  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  estimate_id uuid not null references public.estimates(id) on delete cascade,

  title text not null,
  reference text,
  status text not null default 'draft', -- draft|sent|accepted|in_progress|completed|cancelled

  supplier_name text,
  supplier_email text,
  delivery_address text,
  notes_internal text,
  notes_supplier text,

  subtotal numeric(12,2) not null default 0,
  vat_rate numeric(5,2) not null default 0,
  vat_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,

  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Linking tables: map estimate_items -> WO/PO lines (snapshot fields for audit)
create table if not exists public.work_order_lines (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  estimate_item_id uuid references public.estimate_items(id) on delete set null,

  sort_order int not null default 0,
  title text not null,
  description text,
  quantity numeric(12,3) not null default 1,
  unit text not null default 'item',
  unit_cost numeric(12,2) not null default 0,
  line_cost numeric(12,2) not null default 0,

  created_at timestamptz not null default now()
);

create table if not exists public.purchase_order_lines (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  estimate_item_id uuid references public.estimate_items(id) on delete set null,

  sort_order int not null default 0,
  title text not null,
  description text,
  quantity numeric(12,3) not null default 1,
  unit text not null default 'item',
  unit_cost numeric(12,2) not null default 0,
  line_cost numeric(12,2) not null default 0,

  created_at timestamptz not null default now()
);

-- Optional tokens for future contractor/supplier portal links
create table if not exists public.document_access_tokens (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,

  document_type text not null, -- 'work_order' | 'purchase_order'
  document_id uuid not null,

  token text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.work_orders enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.work_order_lines enable row level security;
alter table public.purchase_order_lines enable row level security;
alter table public.document_access_tokens enable row level security;

-- Policies (company_memberships-based)
do $$
declare
  t text;
begin
  foreach t in array array[
    'work_orders','purchase_orders','work_order_lines','purchase_order_lines','document_access_tokens'
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

