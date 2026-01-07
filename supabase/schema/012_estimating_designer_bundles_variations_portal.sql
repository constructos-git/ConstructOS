-- ConstructOS Estimating — Designer + Client Packs + Variations + Portal Timeline

-- (A) Brand presets
create table if not exists public.brand_presets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  name text not null,
  logo_url text,
  primary_color text,
  secondary_color text,
  font_family text,
  header_html text,
  footer_html text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- (B) Quote layout configs (block-based)
create table if not exists public.quote_layouts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  name text not null,
  brand_preset_id uuid references public.brand_presets(id) on delete set null,
  blocks jsonb not null default '[]'::jsonb, -- [{key,enabled,settings,order}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.estimate_quotes
  add column if not exists quote_layout_id uuid references public.quote_layouts(id) on delete set null,
  add column if not exists brand_preset_id uuid references public.brand_presets(id) on delete set null;

-- (C) Client packs (bundles) and tokens
create table if not exists public.client_packs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  name text not null,
  description text,
  contents jsonb not null default '{}'::jsonb, -- {quoteVersionId, workOrderIds, purchaseOrderIds, attachments}
  created_at timestamptz not null default now()
);

-- (D) Portal timeline events (token-based, unified)
create table if not exists public.client_portal_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  estimate_id uuid references public.estimates(id) on delete set null,
  client_pack_id uuid references public.client_packs(id) on delete cascade,

  token_used text not null,
  event_type text not null, -- quote_sent|quote_accepted|variation_sent|variation_approved|variation_rejected|note
  event_message text,
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

-- (E) Variations (change orders)
create table if not exists public.estimate_variations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'draft', -- draft|sent|approved|rejected|withdrawn

  -- snapshot lines for variation
  lines jsonb not null default '[]'::jsonb, -- [{itemType,title,qty,unit,unitCost,priceExVat,vat,totalIncVat}]
  subtotal numeric(12,2) not null default 0,
  vat_rate numeric(5,2) not null default 20,
  vat_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,

  sent_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,

  created_at timestamptz not null default now()
);

-- (F) Variation approvals (signature-lite)
create table if not exists public.variation_approvals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  variation_id uuid not null references public.estimate_variations(id) on delete cascade,

  token_used text not null,
  action text not null, -- approved|rejected
  name text not null,
  email text not null,
  notes text,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- RLS (simplified for single-tenant)
alter table public.brand_presets enable row level security;
alter table public.quote_layouts enable row level security;
alter table public.client_packs enable row level security;
alter table public.client_portal_events enable row level security;
alter table public.estimate_variations enable row level security;
alter table public.variation_approvals enable row level security;

-- Company access policies
drop policy if exists "brand_presets_company_access" on public.brand_presets;
create policy "brand_presets_company_access"
on public.brand_presets
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "quote_layouts_company_access" on public.quote_layouts;
create policy "quote_layouts_company_access"
on public.quote_layouts
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "client_packs_company_access" on public.client_packs;
create policy "client_packs_company_access"
on public.client_packs
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "client_portal_events_company_access" on public.client_portal_events;
create policy "client_portal_events_company_access"
on public.client_portal_events
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "estimate_variations_company_access" on public.estimate_variations;
create policy "estimate_variations_company_access"
on public.estimate_variations
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "variation_approvals_company_access" on public.variation_approvals;
create policy "variation_approvals_company_access"
on public.variation_approvals
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

----------------------------------------
-- Public RPCs (token-based portal read/write)
----------------------------------------

-- Read client pack by token
create or replace function public.get_client_pack_by_token(p_token text)
returns jsonb
language plpgsql
security definer
as $$
declare
  tok record;
  pack record;
begin
  select * into tok
  from public.document_access_tokens
  where token = p_token
    and document_type = 'client_pack'
    and (expires_at is null or expires_at > now())
  limit 1;

  if tok is null then
    return null;
  end if;

  select * into pack
  from public.client_packs
  where id = tok.document_id
  limit 1;

  if pack is null then
    return null;
  end if;

  return jsonb_build_object('token', to_jsonb(tok), 'pack', to_jsonb(pack));
end $$;

-- Submit portal event (note)
create or replace function public.submit_client_portal_event(
  p_token text,
  p_event_type text,
  p_message text,
  p_metadata jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
  tok record;
  pack record;
begin
  select * into tok
  from public.document_access_tokens
  where token = p_token
    and document_type = 'client_pack'
    and (expires_at is null or expires_at > now())
  limit 1;

  if tok is null then
    return null;
  end if;

  select * into pack
  from public.client_packs
  where id = tok.document_id
  limit 1;

  if pack is null then
    return null;
  end if;

  insert into public.client_portal_events(
    company_id, estimate_id, client_pack_id,
    token_used, event_type, event_message, metadata
  ) values (
    tok.company_id, pack.estimate_id, pack.id,
    p_token, p_event_type, nullif(p_message,''), coalesce(p_metadata,'{}'::jsonb)
  );

  return jsonb_build_object('ok', true);
end $$;

-- Read portal timeline by token
create or replace function public.get_client_portal_timeline(p_token text)
returns jsonb
language plpgsql
security definer
as $$
declare
  tok record;
  pack record;
  ev jsonb;
begin
  select * into tok
  from public.document_access_tokens
  where token = p_token
    and document_type = 'client_pack'
    and (expires_at is null or expires_at > now())
  limit 1;

  if tok is null then
    return null;
  end if;

  select * into pack
  from public.client_packs
  where id = tok.document_id
  limit 1;

  if pack is null then
    return null;
  end if;

  select jsonb_agg(to_jsonb(e) order by e.created_at asc) into ev
  from public.client_portal_events e
  where e.client_pack_id = pack.id;

  return jsonb_build_object('pack', to_jsonb(pack), 'events', coalesce(ev,'[]'::jsonb));
end $$;

-- Variation public read by token
create or replace function public.get_variation_by_token(p_token text)
returns jsonb
language plpgsql
security definer
as $$
declare
  tok record;
  var record;
begin
  select * into tok
  from public.document_access_tokens
  where token = p_token
    and document_type = 'variation'
    and (expires_at is null or expires_at > now())
  limit 1;

  if tok is null then
    return null;
  end if;

  select * into var
  from public.estimate_variations
  where id = tok.document_id
  limit 1;

  if var is null then
    return null;
  end if;

  return jsonb_build_object('token', to_jsonb(tok), 'variation', to_jsonb(var));
end $$;

-- Variation approve/reject
create or replace function public.submit_variation_approval(
  p_token text,
  p_action text,
  p_name text,
  p_email text,
  p_notes text,
  p_ip text,
  p_user_agent text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  tok record;
  var record;
begin
  select * into tok
  from public.document_access_tokens
  where token = p_token
    and document_type = 'variation'
    and (expires_at is null or expires_at > now())
  limit 1;

  if tok is null then
    return null;
  end if;

  select * into var
  from public.estimate_variations
  where id = tok.document_id
  limit 1;

  if var is null then
    return null;
  end if;

  insert into public.variation_approvals(
    company_id, variation_id, token_used, action, name, email, notes, ip, user_agent
  ) values (
    tok.company_id, var.id, p_token, p_action, p_name, p_email, nullif(p_notes,''), nullif(p_ip,''), nullif(p_user_agent,'')
  );

  if p_action = 'approved' then
    update public.estimate_variations
    set status='approved', approved_at=now()
    where id = var.id;
  else
    update public.estimate_variations
    set status='rejected', rejected_at=now()
    where id = var.id;
  end if;

  return jsonb_build_object('ok', true);
end $$;

