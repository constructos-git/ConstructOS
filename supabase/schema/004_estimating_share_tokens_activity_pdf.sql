-- ConstructOS Estimating — Share Tokens + Activity Log

-- Activity log for estimating documents
create table if not exists public.estimating_activity (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  estimate_id uuid references public.estimates(id) on delete set null,

  document_type text not null, -- 'work_order' | 'purchase_order' | 'estimate'
  document_id uuid not null,

  action text not null,        -- 'created'|'updated'|'sent'|'status_changed'|'token_created'|'token_revoked'|'pdf_downloaded'
  message text,
  metadata jsonb not null default '{}'::jsonb,

  created_by uuid,
  created_at timestamptz not null default now()
);

alter table public.estimating_activity enable row level security;

drop policy if exists "estimating_activity_company_access" on public.estimating_activity;
create policy "estimating_activity_company_access"
on public.estimating_activity
for all
using (
  exists (
    select 1 from public.company_memberships m
    where m.company_id = estimating_activity.company_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.company_memberships m
    where m.company_id = estimating_activity.company_id
      and m.user_id = auth.uid()
  )
);

-- Public share tokens: add a flag to allow public select via RPC only
-- (We will NOT allow direct public select. We'll add an RPC that returns document by token.)

-- Ensure token unique-ish
create unique index if not exists document_access_tokens_token_idx
on public.document_access_tokens(token);

-- RPC: fetch work order by token (public-safe)
create or replace function public.get_work_order_by_token(p_token text)
returns jsonb
language plpgsql
security definer
as $$
declare
  tok record;
  wo record;
  lines jsonb;
begin
  select * into tok
  from public.document_access_tokens
  where token = p_token
    and document_type = 'work_order'
    and (expires_at is null or expires_at > now())
  limit 1;

  if tok is null then
    return null;
  end if;

  select * into wo
  from public.work_orders
  where id = tok.document_id
  limit 1;

  if wo is null then
    return null;
  end if;

  select coalesce(jsonb_agg(to_jsonb(l) order by l.sort_order), '[]'::jsonb)
  into lines
  from public.work_order_lines l
  where l.work_order_id = wo.id;

  return jsonb_build_object(
    'workOrder', to_jsonb(wo),
    'lines', lines,
    'company_id', tok.company_id,
    'document_type', tok.document_type,
    'document_id', tok.document_id
  );
end $$;

-- RPC: fetch purchase order by token (public-safe)
create or replace function public.get_purchase_order_by_token(p_token text)
returns jsonb
language plpgsql
security definer
as $$
declare
  tok record;
  po record;
  lines jsonb;
begin
  select * into tok
  from public.document_access_tokens
  where token = p_token
    and document_type = 'purchase_order'
    and (expires_at is null or expires_at > now())
  limit 1;

  if tok is null then
    return null;
  end if;

  select * into po
  from public.purchase_orders
  where id = tok.document_id
  limit 1;

  if po is null then
    return null;
  end if;

  select coalesce(jsonb_agg(to_jsonb(l) order by l.sort_order), '[]'::jsonb)
  into lines
  from public.purchase_order_lines l
  where l.purchase_order_id = po.id;

  return jsonb_build_object(
    'purchaseOrder', to_jsonb(po),
    'lines', lines,
    'company_id', tok.company_id,
    'document_type', tok.document_type,
    'document_id', tok.document_id
  );
end $$;

-- IMPORTANT: allow anon to execute ONLY these functions (configure in Supabase Dashboard if needed)
-- In Supabase, go to Database > Functions > Permissions:
--   grant execute to anon, authenticated
-- If your ConstructOS uses only authenticated viewing, you may skip anon grant.

