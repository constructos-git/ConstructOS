-- ConstructOS Estimating — Quote Versions + Conversion

-- Quote versions (immutable snapshots)
create table if not exists public.quote_versions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  estimate_id uuid not null references public.estimates(id) on delete cascade,

  version_number int not null,
  label text, -- e.g. "Revised after site visit"
  status text not null default 'draft', -- draft|sent|accepted|superseded

  -- Snapshot of quote content
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

  branding jsonb not null default '{}'::jsonb, -- logo_url, colours, font, layout

  -- Snapshot of client-visible sections + items
  sections_snapshot jsonb not null default '[]'::jsonb,
  items_snapshot jsonb not null default '[]'::jsonb,

  -- Totals snapshot
  subtotal numeric(12,2) not null default 0,
  vat_rate numeric(5,2) not null default 0,
  vat_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,

  created_by uuid,
  created_at timestamptz not null default now()
);

create unique index if not exists quote_versions_unique_version
on public.quote_versions(company_id, estimate_id, version_number);

alter table public.quote_versions enable row level security;

drop policy if exists "quote_versions_company_access" on public.quote_versions;
create policy "quote_versions_company_access"
on public.quote_versions
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Update document_access_tokens to point to quote_version_id for quotes
alter table public.document_access_tokens
  add column if not exists quote_version_id uuid references public.quote_versions(id) on delete cascade;

-- When document_type='quote', document_id will remain estimate_id,
-- and quote_version_id will point to the specific version being shared.

-- Acceptance references quote_version
alter table public.quote_acceptances
  add column if not exists quote_version_id uuid references public.quote_versions(id) on delete set null;

-- Conversion metadata
alter table public.estimates
  add column if not exists converted_project_id uuid,
  add column if not exists converted_at timestamptz,
  add column if not exists converted_from_quote_version_id uuid references public.quote_versions(id) on delete set null;

-- OPTIONAL: minimal projects table if ConstructOS doesn't have one.
-- Only create if missing. If ConstructOS already has public.projects, skip this block in execution.
do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'projects') then
    create table public.projects (
      id uuid primary key default gen_random_uuid(),
      company_id uuid not null,
      name text not null,
      status text not null default 'active',
      created_at timestamptz not null default now()
    );

    alter table public.projects enable row level security;

    create policy "projects_company_access"
    on public.projects
    for all
    using (auth.uid() is not null)
    with check (auth.uid() is not null);
  end if;
end $$;

-- RPC: get quote version by token (public-safe)
create or replace function public.get_quote_version_by_token(p_token text)
returns jsonb
language plpgsql
security definer
as $$
declare
  tok record;
  ver record;
begin
  select * into tok
  from public.document_access_tokens
  where token = p_token
    and document_type = 'quote'
    and (expires_at is null or expires_at > now())
  limit 1;

  if tok is null or tok.quote_version_id is null then
    return null;
  end if;

  select * into ver
  from public.quote_versions
  where id = tok.quote_version_id
  limit 1;

  if ver is null then
    return null;
  end if;

  return jsonb_build_object(
    'token', to_jsonb(tok),
    'version', to_jsonb(ver)
  );
end $$;

-- Update submit_quote_acceptance to link to version
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
  ver record;
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

  -- Load version if token has quote_version_id
  if tok.quote_version_id is not null then
    select * into ver
    from public.quote_versions
    where id = tok.quote_version_id
    limit 1;
  end if;

  insert into public.quote_acceptances(
    company_id, estimate_id, token_used,
    accepted_name, accepted_email, accepted_notes,
    accepted_ip, accepted_user_agent,
    declarations, quote_version_id
  )
  values (
    tok.company_id, est.id, p_token,
    p_name, p_email, nullif(p_notes,''),
    nullif(p_ip,''), nullif(p_user_agent,''),
    coalesce(p_declarations,'[]'::jsonb),
    tok.quote_version_id
  )
  returning * into acc;

  -- Mark estimate as accepted (status convention: accepted)
  update public.estimates
  set status = 'accepted'
  where id = est.id;

  -- Mark version as accepted if exists
  if ver.id is not null then
    update public.quote_versions
    set status = 'accepted'
    where id = ver.id;
  end if;

  -- Log activity
  insert into public.estimating_activity(company_id, estimate_id, document_type, document_id, action, message, metadata)
  values (
    tok.company_id, est.id, 'estimate', est.id, 'accepted',
    'Quote accepted by client via shared link.',
    jsonb_build_object('name', p_name, 'email', p_email, 'version_number', coalesce(ver.version_number, null))
  );

  return jsonb_build_object(
    'acceptance', to_jsonb(acc),
    'estimate_id', est.id,
    'version_id', tok.quote_version_id
  );
end $$;

