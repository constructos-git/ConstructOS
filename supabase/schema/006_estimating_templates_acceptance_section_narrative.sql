-- ConstructOS Estimating — Templates + Acceptance + Section Narrative

-- Company quote templates
create table if not exists public.quote_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,

  name text not null,
  description text,

  intro_title text not null default 'Quotation',
  intro_body_rich jsonb not null default '{}'::jsonb,
  programme_notes_rich jsonb not null default '{}'::jsonb,
  payment_notes_rich jsonb not null default '{}'::jsonb,
  warranty_notes_rich jsonb not null default '{}'::jsonb,
  terms_body_rich jsonb not null default '{}'::jsonb,

  inclusions jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  assumptions jsonb not null default '[]'::jsonb,

  show_pricing_breakdown boolean not null default true,
  show_section_details boolean not null default true,

  layout_style text not null default 'classic',
  primary_color text,
  secondary_color text,
  logo_url text,
  font_family text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add section narrative (client-facing)
alter table public.estimate_sections
  add column if not exists client_narrative_rich jsonb;

-- Upgrade estimate_quotes to store rich blocks (keep old text fields for backwards compatibility)
-- Note: This assumes estimate_quotes table exists (created in migration 005)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'estimate_quotes') then
    alter table public.estimate_quotes
      add column if not exists intro_body_rich jsonb,
      add column if not exists programme_notes_rich jsonb,
      add column if not exists payment_notes_rich jsonb,
      add column if not exists warranty_notes_rich jsonb,
      add column if not exists terms_body_rich jsonb,
      add column if not exists applied_template_id uuid references public.quote_templates(id) on delete set null;
  else
    raise exception 'Table estimate_quotes does not exist. Please run migration 005_estimating_quote_editor_branding.sql first.';
  end if;
end $$;

-- Quote acceptance table (signature-lite)
create table if not exists public.quote_acceptances (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  estimate_id uuid not null references public.estimates(id) on delete cascade,

  token_used text not null,
  accepted_name text not null,
  accepted_email text not null,
  accepted_notes text,

  accepted_at timestamptz not null default now(),
  accepted_ip text,
  accepted_user_agent text,

  declarations jsonb not null default '[]'::jsonb,
  is_withdrawn boolean not null default false,

  created_at timestamptz not null default now()
);

-- RLS
alter table public.quote_templates enable row level security;
alter table public.quote_acceptances enable row level security;

drop policy if exists "quote_templates_company_access" on public.quote_templates;
create policy "quote_templates_company_access"
on public.quote_templates
for all
using (
  exists (
    select 1 from public.company_memberships m
    where m.company_id = quote_templates.company_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.company_memberships m
    where m.company_id = quote_templates.company_id
      and m.user_id = auth.uid()
  )
);

drop policy if exists "quote_acceptances_company_access" on public.quote_acceptances;
create policy "quote_acceptances_company_access"
on public.quote_acceptances
for all
using (
  exists (
    select 1 from public.company_memberships m
    where m.company_id = quote_acceptances.company_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.company_memberships m
    where m.company_id = quote_acceptances.company_id
      and m.user_id = auth.uid()
  )
);

-- RPC: submit acceptance via token (public)
create or replace function public.submit_quote_acceptance(
  p_token text,
  p_name text,
  p_email text,
  p_notes text,
  p_declarations jsonb,
  p_ip text,
  p_user_agent text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  tok record;
  est record;
  acc record;
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

  insert into public.quote_acceptances(
    company_id, estimate_id, token_used,
    accepted_name, accepted_email, accepted_notes,
    accepted_ip, accepted_user_agent,
    declarations
  )
  values (
    tok.company_id, est.id, p_token,
    p_name, p_email, nullif(p_notes,''),
    nullif(p_ip,''), nullif(p_user_agent,''),
    coalesce(p_declarations,'[]'::jsonb)
  )
  returning * into acc;

  -- Mark estimate as accepted (status convention: accepted)
  update public.estimates
  set status = 'accepted'
  where id = est.id;

  -- Log activity
  insert into public.estimating_activity(company_id, estimate_id, document_type, document_id, action, message, metadata)
  values (tok.company_id, est.id, 'estimate', est.id, 'accepted', 'Quote accepted by client via shared link.', jsonb_build_object('name', p_name, 'email', p_email));

  return jsonb_build_object(
    'acceptance', to_jsonb(acc),
    'estimate_id', est.id
  );
end $$;

