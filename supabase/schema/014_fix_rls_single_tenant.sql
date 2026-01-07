-- Fix RLS policies for single-tenant mode
-- This makes RLS policies less restrictive for authenticated users
-- Since this is a single-tenant system, we can simplify RLS

-- Fix estimate_quotes RLS
drop policy if exists "estimate_quotes_company_access" on public.estimate_quotes;
create policy "estimate_quotes_company_access"
on public.estimate_quotes
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Fix company_quote_branding RLS
drop policy if exists "company_quote_branding_company_access" on public.company_quote_branding;
create policy "company_quote_branding_company_access"
on public.company_quote_branding
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Fix estimate_assemblies RLS (if it exists)
drop policy if exists "estimate_assemblies_company_access" on public.estimate_assemblies;
create policy "estimate_assemblies_company_access"
on public.estimate_assemblies
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Fix estimate_sections RLS
drop policy if exists "estimate_sections_company_access" on public.estimate_sections;
create policy "estimate_sections_company_access"
on public.estimate_sections
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Fix estimate_items RLS
drop policy if exists "estimate_items_company_access" on public.estimate_items;
create policy "estimate_items_company_access"
on public.estimate_items
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

