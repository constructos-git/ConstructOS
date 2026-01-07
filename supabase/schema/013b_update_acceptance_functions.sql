-- Update acceptance functions to include signature fields

-- Update submit_quote_acceptance (handles both versioned and non-versioned quotes)
create or replace function public.submit_quote_acceptance(
  p_token text,
  p_name text,
  p_email text,
  p_notes text,
  p_declarations jsonb,
  p_signature_png_base64 text,
  p_signature_sha256 text,
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
  version_id uuid;
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

  version_id := tok.quote_version_id;

  -- If version_id exists, load version to verify
  if version_id is not null then
    select * into ver
    from public.quote_versions
    where id = version_id
    limit 1;
  end if;

  insert into public.quote_acceptances(
    company_id, estimate_id, quote_version_id,
    token_used, accepted_name, accepted_email, accepted_notes,
    declarations, signature_png_base64, signature_sha256,
    accepted_ip, accepted_user_agent
  ) values (
    tok.company_id, tok.document_id, version_id,
    p_token, p_name, p_email, nullif(p_notes,''),
    coalesce(p_declarations,'{}'::jsonb),
    nullif(p_signature_png_base64,''),
    nullif(p_signature_sha256,''),
    nullif(p_ip,''), nullif(p_user_agent,'')
  );

  return jsonb_build_object('ok', true);
end $$;

-- Update submit_variation_approval
create or replace function public.submit_variation_approval(
  p_token text,
  p_action text,
  p_name text,
  p_email text,
  p_notes text,
  p_signature_png_base64 text,
  p_signature_sha256 text,
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
    company_id, variation_id, token_used, action, name, email, notes,
    signature_png_base64, signature_sha256, declarations,
    ip, user_agent
  ) values (
    tok.company_id, var.id, p_token, p_action, p_name, p_email, nullif(p_notes,''),
    nullif(p_signature_png_base64,''),
    nullif(p_signature_sha256,''),
    coalesce(p_declarations,'{}'::jsonb),
    nullif(p_ip,''), nullif(p_user_agent,'')
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

