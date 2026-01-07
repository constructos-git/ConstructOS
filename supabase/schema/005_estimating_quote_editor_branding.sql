-- ConstructOS Estimating — Quote Editor + Branding

-- Company-level quote branding defaults
create table if not exists public.company_quote_branding (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique,

  logo_url text,
  primary_color text not null default '#0f172a',  -- slate-900 style default
  secondary_color text not null default '#334155',
  font_family text not null default 'Inter',      -- Inter|Arial|Helvetica|Georgia
  layout_style text not null default 'classic',   -- classic|modern

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Per-estimate quote content + overrides
create table if not exists public.estimate_quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  estimate_id uuid not null unique references public.estimates(id) on delete cascade,

  -- content blocks
  intro_title text not null default 'Quotation',
  intro_body text not null default '',
  programme_notes text not null default '',
  payment_notes text not null default '',
  warranty_notes text not null default '',
  terms_body text not null default '',

  inclusions jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  assumptions jsonb not null default '[]'::jsonb,

  -- visibility config
  show_pricing_breakdown boolean not null default true,
  show_section_details boolean not null default true,

  -- branding override (nullable = use company defaults)
  logo_url text,
  primary_color text,
  secondary_color text,
  font_family text,
  layout_style text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Token type supports quotes
-- document_access_tokens already exists; no schema change needed.

-- RLS
alter table public.company_quote_branding enable row level security;
alter table public.estimate_quotes enable row level security;

drop policy if exists "company_quote_branding_company_access" on public.company_quote_branding;
create policy "company_quote_branding_company_access"
on public.company_quote_branding
for all
using (
  exists (
    select 1 from public.company_memberships m
    where m.company_id = company_quote_branding.company_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.company_memberships m
    where m.company_id = company_quote_branding.company_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "estimate_quotes_company_access" on public.estimate_quotes;
create policy "estimate_quotes_company_access"
on public.estimate_quotes
for all
using (
  exists (
    select 1 from public.company_memberships m
    where m.company_id = estimate_quotes.company_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.company_memberships m
    where m.company_id = estimate_quotes.company_id
      and m.user_id = auth.uid()
  )
);

-- RPC: fetch quote by token (public-safe)
create or replace function public.get_quote_by_token(p_token text)
returns jsonb
language plpgsql
security definer
as $$
declare
  tok record;
  est record;
  quote record;
  sections jsonb;
  items jsonb;
begin
  select * into tok
  from public.document_access_tokens
  where token = p_token
    and document_type = 'quote'
    and (expires_at is null or expires_at > now())
  limit 1;

  if tok is null then
    return null;
  end if;

  select * into est
  from public.estimates
  where id = tok.document_id
  limit 1;

  if est is null then
    return null;
  end if;

  select * into quote
  from public.estimate_quotes
  where estimate_id = est.id
  limit 1;

  select coalesce(jsonb_agg(to_jsonb(s) order by s.sort_order), '[]'::jsonb)
  into sections
  from public.estimate_sections s
  where s.estimate_id = est.id
    and s.is_client_visible = true;

  select coalesce(jsonb_agg(to_jsonb(i) order by i.sort_order), '[]'::jsonb)
  into items
  from public.estimate_items i
  where i.estimate_id = est.id
    and i.is_client_visible = true;

  return jsonb_build_object(
    'estimate', to_jsonb(est),
    'quote', to_jsonb(quote),
    'sections', sections,
    'items', items
  );
end $$;

