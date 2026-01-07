-- ConstructOS Estimating — Workflow + Internal Approvals + Signatures + Audit Export

-- (A) Workflow fields (estimates + variations)
alter table public.estimates
  add column if not exists workflow_status text not null default 'draft',
  add column if not exists workflow_updated_at timestamptz not null default now();

alter table public.estimate_variations
  add column if not exists workflow_status text not null default 'draft',
  add column if not exists workflow_updated_at timestamptz not null default now();

-- (B) Internal approval requests
create table if not exists public.estimating_approvals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,

  subject_type text not null, -- estimate|variation
  subject_id uuid not null,
  estimate_id uuid references public.estimates(id) on delete set null,

  requested_by uuid,
  requested_to uuid, -- user id in company
  status text not null default 'pending', -- pending|approved|rejected|cancelled
  request_message text,
  decision_message text,

  created_at timestamptz not null default now(),
  decided_at timestamptz
);

alter table public.estimating_approvals enable row level security;

drop policy if exists "estimating_approvals_company_access" on public.estimating_approvals;
create policy "estimating_approvals_company_access"
on public.estimating_approvals
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- (C) Signature capture for quote acceptances and variation approvals
alter table public.quote_acceptances
  add column if not exists signature_png_base64 text,
  add column if not exists signature_sha256 text,
  add column if not exists declarations jsonb not null default '{}'::jsonb;

alter table public.variation_approvals
  add column if not exists signature_png_base64 text,
  add column if not exists signature_sha256 text,
  add column if not exists declarations jsonb not null default '{}'::jsonb;

-- (D) PDF theming presets (lightweight; render rules in code)
create table if not exists public.pdf_themes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  name text not null,

  header_template jsonb not null default '{}'::jsonb, -- {left,center,right}
  footer_template jsonb not null default '{}'::jsonb, -- {left,center,right,showPageNumbers}
  styles jsonb not null default '{}'::jsonb, -- colours/fonts/table styles
  watermark jsonb not null default '{}'::jsonb, -- {enabled,text,opacity}

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pdf_themes enable row level security;

drop policy if exists "pdf_themes_company_access" on public.pdf_themes;
create policy "pdf_themes_company_access"
on public.pdf_themes
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Optional: link theme to quote layouts
alter table public.quote_layouts
  add column if not exists pdf_theme_id uuid references public.pdf_themes(id) on delete set null;

