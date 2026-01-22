-- ConstructOS CRM: Contacts System
-- Migration: 020_contacts_crm.sql
-- Description: Comprehensive contacts CRM including companies, clients, contractors, consultants, and individual contacts

-- ============================================================================
-- COMPANIES TABLE
-- ============================================================================
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null, -- The ConstructOS company this belongs to
  
  -- Basic Information
  name text not null,
  legal_name text,
  company_number text, -- UK Companies House number or equivalent
  vat_number text,
  
  -- Contact Information
  email text,
  phone text,
  website text,
  fax text,
  
  -- Address
  address_line1 text,
  address_line2 text,
  address_line3 text,
  town_city text,
  county text,
  postcode text,
  country text default 'United Kingdom',
  
  -- Classification
  type text not null default 'client', -- 'client', 'contractor', 'consultant', 'supplier', 'other'
  industry text,
  sector text,
  
  -- Business Details
  employee_count text, -- e.g., '1-10', '11-50', '51-200', '201-500', '500+'
  annual_revenue text,
  established_year integer,
  
  -- Status & Metadata
  status text not null default 'active', -- 'active', 'inactive', 'archived'
  tags text[], -- Array of tags for categorization
  notes text,
  
  -- Social & Online Presence
  linkedin_url text,
  twitter_handle text,
  facebook_url text,
  
  -- Financial Information
  payment_terms text, -- e.g., 'Net 30', 'Net 60'
  credit_limit numeric(12,2),
  currency text default 'GBP',
  
  -- Relationships
  parent_company_id uuid references public.companies(id) on delete set null,
  
  -- Audit
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint unique_company_name_per_company unique (company_id, name)
);

-- ============================================================================
-- CONTACTS TABLE (Individual People)
-- ============================================================================
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null, -- The ConstructOS company this belongs to
  
  -- Basic Information
  first_name text not null,
  last_name text not null,
  title text, -- Mr, Mrs, Ms, Dr, etc.
  job_title text,
  department text,
  
  -- Contact Information
  email text,
  phone text,
  mobile text,
  fax text,
  
  -- Address (can be different from company address)
  address_line1 text,
  address_line2 text,
  address_line3 text,
  town_city text,
  county text,
  postcode text,
  country text default 'United Kingdom',
  
  -- Relationships
  company_uuid uuid references public.companies(id) on delete set null, -- The company this contact works for
  
  -- Classification
  type text not null default 'client', -- 'client', 'contractor', 'consultant', 'supplier', 'other'
  is_primary_contact boolean not null default false,
  is_decision_maker boolean not null default false,
  
  -- Communication Preferences
  preferred_contact_method text, -- 'email', 'phone', 'mobile', 'mail'
  email_opt_in boolean not null default true,
  sms_opt_in boolean not null default false,
  
  -- Social & Online
  linkedin_url text,
  twitter_handle text,
  
  -- Status & Metadata
  status text not null default 'active', -- 'active', 'inactive', 'archived'
  tags text[],
  notes text,
  
  -- Additional Info
  birthday date,
  anniversary date,
  personal_notes text,
  
  -- Audit
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- CLIENTS TABLE (Customer Companies - Specialized)
-- ============================================================================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  
  -- Link to company
  company_uuid uuid references public.companies(id) on delete cascade,
  
  -- Client-Specific Information
  client_type text, -- 'residential', 'commercial', 'industrial', 'public_sector'
  project_types text[], -- Array of project types they typically engage in
  average_project_value numeric(12,2),
  preferred_communication_method text,
  
  -- Relationship Details
  relationship_start_date date,
  relationship_status text not null default 'active', -- 'active', 'inactive', 'prospect', 'former'
  account_manager_id uuid references auth.users(id) on delete set null,
  
  -- Financial
  payment_terms text,
  credit_limit numeric(12,2),
  outstanding_balance numeric(12,2) not null default 0,
  
  -- Preferences
  preferred_quote_format text, -- 'pdf', 'email', 'portal'
  auto_send_quotes boolean not null default false,
  
  -- Metadata
  tags text[],
  notes text,
  internal_notes text,
  
  -- Audit
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- CONTRACTORS TABLE (Subcontractor Companies - Specialized)
-- ============================================================================
create table if not exists public.contractors (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  
  -- Link to company
  company_uuid uuid references public.companies(id) on delete cascade,
  
  -- Contractor-Specific Information
  trade_types text[], -- Array of trades: 'carpentry', 'electrical', 'plumbing', etc.
  certifications text[], -- Array of certifications/licenses
  insurance_expiry date,
  public_liability_amount numeric(12,2),
  employer_liability_amount numeric(12,2),
  
  -- Capabilities
  max_project_value numeric(12,2),
  geographic_coverage text[], -- Areas they cover
  availability_status text not null default 'available', -- 'available', 'busy', 'unavailable'
  
  -- Performance & Rating
  rating numeric(3,2), -- 0.00 to 5.00
  total_projects_completed integer not null default 0,
  on_time_completion_rate numeric(5,2), -- Percentage
  quality_rating numeric(3,2),
  
  -- Financial
  payment_terms text,
  preferred_payment_method text,
  bank_account_details jsonb, -- Encrypted/stored securely
  
  -- Relationship
  relationship_start_date date,
  relationship_status text not null default 'active',
  preferred_contact_id uuid references public.contacts(id) on delete set null,
  
  -- Metadata
  tags text[],
  notes text,
  internal_notes text,
  
  -- Audit
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- CONSULTANTS TABLE (Consultant Companies/Individuals - Specialized)
-- ============================================================================
create table if not exists public.consultants (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  
  -- Link to company or contact
  company_uuid uuid references public.companies(id) on delete cascade,
  contact_uuid uuid references public.contacts(id) on delete set null,
  
  -- Consultant-Specific Information
  consultant_type text, -- 'architect', 'engineer', 'surveyor', 'project_manager', 'other'
  specializations text[], -- Array of specializations
  qualifications text[],
  professional_registrations text[], -- e.g., 'RIBA', 'ICE', 'RICS'
  registration_numbers text[],
  
  -- Capabilities
  hourly_rate numeric(10,2),
  daily_rate numeric(10,2),
  project_rate_type text, -- 'hourly', 'daily', 'fixed', 'percentage'
  
  -- Availability
  availability_status text not null default 'available',
  typical_response_time text, -- e.g., '24 hours', '48 hours'
  
  -- Performance
  rating numeric(3,2),
  total_projects_completed integer not null default 0,
  
  -- Relationship
  relationship_start_date date,
  relationship_status text not null default 'active',
  
  -- Metadata
  tags text[],
  notes text,
  internal_notes text,
  
  -- Audit
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- CONTACT ACTIVITY TABLE (Activity Log)
-- ============================================================================
create table if not exists public.contact_activity (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  
  -- Relationships
  contact_id uuid references public.contacts(id) on delete cascade,
  company_uuid uuid references public.companies(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  contractor_id uuid references public.contractors(id) on delete cascade,
  consultant_id uuid references public.consultants(id) on delete cascade,
  
  -- Activity Details
  activity_type text not null, -- 'call', 'email', 'meeting', 'note', 'quote_sent', 'invoice_sent', etc.
  subject text,
  description text,
  outcome text,
  
  -- Related Items
  related_opportunity_id uuid,
  related_project_id uuid,
  related_estimate_id uuid,
  related_invoice_id uuid,
  
  -- Metadata
  activity_date timestamptz not null default now(),
  duration_minutes integer,
  location text,
  
  -- Audit
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
create index if not exists idx_companies_company_id on public.companies(company_id);
create index if not exists idx_companies_type on public.companies(type);
create index if not exists idx_companies_status on public.companies(status);
create index if not exists idx_companies_name on public.companies(name);

create index if not exists idx_contacts_company_id on public.contacts(company_id);
create index if not exists idx_contacts_company_uuid on public.contacts(company_uuid);
create index if not exists idx_contacts_type on public.contacts(type);
create index if not exists idx_contacts_email on public.contacts(email);
create index if not exists idx_contacts_status on public.contacts(status);

create index if not exists idx_clients_company_id on public.clients(company_id);
create index if not exists idx_clients_company_uuid on public.clients(company_uuid);
create index if not exists idx_clients_status on public.clients(relationship_status);

create index if not exists idx_contractors_company_id on public.contractors(company_id);
create index if not exists idx_contractors_company_uuid on public.contractors(company_uuid);
create index if not exists idx_contractors_status on public.contractors(relationship_status);
create index if not exists idx_contractors_trade_types on public.contractors using gin(trade_types);

create index if not exists idx_consultants_company_id on public.consultants(company_id);
create index if not exists idx_consultants_company_uuid on public.consultants(company_uuid);
create index if not exists idx_consultants_status on public.consultants(relationship_status);
create index if not exists idx_consultants_type on public.consultants(consultant_type);

create index if not exists idx_contact_activity_company_id on public.contact_activity(company_id);
create index if not exists idx_contact_activity_contact_id on public.contact_activity(contact_id);
create index if not exists idx_contact_activity_company_uuid on public.contact_activity(company_uuid);
create index if not exists idx_contact_activity_date on public.contact_activity(activity_date);
create index if not exists idx_contact_activity_type on public.contact_activity(activity_type);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.clients enable row level security;
alter table public.contractors enable row level security;
alter table public.consultants enable row level security;
alter table public.contact_activity enable row level security;

-- Companies: All authenticated users can access
create policy "companies_authenticated_access"
on public.companies
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Contacts: All authenticated users can access
create policy "contacts_authenticated_access"
on public.contacts
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Clients: All authenticated users can access
create policy "clients_authenticated_access"
on public.clients
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Contractors: All authenticated users can access
create policy "contractors_authenticated_access"
on public.contractors
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Consultants: All authenticated users can access
create policy "consultants_authenticated_access"
on public.consultants
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Contact Activity: All authenticated users can access
create policy "contact_activity_authenticated_access"
on public.contact_activity
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_companies_updated_at before update on public.companies
  for each row execute function update_updated_at_column();

create trigger update_contacts_updated_at before update on public.contacts
  for each row execute function update_updated_at_column();

create trigger update_clients_updated_at before update on public.clients
  for each row execute function update_updated_at_column();

create trigger update_contractors_updated_at before update on public.contractors
  for each row execute function update_updated_at_column();

create trigger update_consultants_updated_at before update on public.consultants
  for each row execute function update_updated_at_column();
