-- Estimating Module: Estimates Table
-- Migration: 001_estimating_estimates.sql
-- Description: Creates the estimates table with RLS policies
-- NOTE: ConstructOS is an internal single-tenant system - all authenticated users share access

-- Drop the table if it exists to recreate with correct schema
drop table if exists public.estimates cascade;

create table public.estimates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid, -- Optional: kept for future flexibility, but not required for RLS
  customer_id uuid,
  opportunity_id uuid,
  project_id uuid,

  title text not null,
  reference text,
  status text not null default 'draft',

  vat_rate numeric(5,2) not null default 20,
  subtotal numeric(12,2) not null default 0,
  vat_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,

  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.estimates enable row level security;

-- Simple policy: All authenticated users can access all estimates
-- Since ConstructOS is internal, no multi-tenant isolation needed
create policy "estimates_authenticated_access"
on public.estimates
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

