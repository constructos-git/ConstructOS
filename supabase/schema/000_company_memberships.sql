-- ConstructOS Core: Company Memberships Table
-- Migration: 000_company_memberships.sql
-- Description: Creates the company_memberships table for multi-tenant access control
-- This must be run BEFORE 001_estimating_estimates.sql

-- Create company_memberships table if it doesn't exist
create table if not exists public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique(company_id, user_id)
);

-- Enable RLS
alter table public.company_memberships enable row level security;

-- Policy: Users can view their own memberships
create policy "users_view_own_memberships"
on public.company_memberships
for select
using (auth.uid() = user_id);

-- Note: The estimates RLS policy will query company_memberships to check access
-- The above policy allows users to see their own membership, which is sufficient
-- for the RLS checks in other tables to work correctly

-- Create index for faster lookups
create index if not exists idx_company_memberships_company_id 
  on public.company_memberships(company_id);

create index if not exists idx_company_memberships_user_id 
  on public.company_memberships(user_id);

