-- ConstructOS Projects: Comprehensive Project Management System
-- Migration: 021_projects_crm.sql
-- Description: Full project lifecycle tracking with tabs, notes, collaboration, and integration

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
-- Drop table if it exists to recreate with correct schema
drop table if exists public.projects cascade;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null, -- The ConstructOS company this belongs to
  
  -- Basic Information
  name text not null,
  reference text, -- Project reference number (e.g., "N25019")
  description text,
  
  -- Project Classification
  type text, -- 'residential', 'commercial', 'industrial', 'renovation', 'new_build', 'extension', etc.
  category text, -- Additional categorization
  priority text not null default 'medium', -- 'low', 'medium', 'high', 'urgent'
  status text not null default 'planning', -- 'planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived'
  
  -- Customer/Client Information
  client_company_id uuid, -- references public.companies(id) on delete set null, -- Commented out to avoid migration errors if companies table doesn't exist
  client_contact_id uuid, -- references public.contacts(id) on delete set null, -- Commented out to avoid migration errors if contacts table doesn't exist
  
  -- Financial Information
  project_value numeric(12,2), -- Total project value/contract amount
  budget numeric(12,2), -- Budget allocated
  costs_to_date numeric(12,2) not null default 0, -- Costs incurred so far
  estimated_profit numeric(12,2), -- Estimated profit margin
  currency text default 'GBP',
  
  -- Dates
  start_date date,
  end_date date,
  expected_completion_date date,
  actual_completion_date date,
  
  -- Location
  site_address_line1 text,
  site_address_line2 text,
  site_address_line3 text,
  site_town_city text,
  site_county text,
  site_postcode text,
  site_country text default 'United Kingdom',
  
  -- Project Team
  project_manager_id uuid references auth.users(id) on delete set null,
  assigned_team_members uuid[], -- Array of user IDs
  
  -- Linked Entities
  opportunity_id uuid, -- Link to opportunity if converted from opportunity
  estimate_id uuid, -- references public.estimates(id) on delete set null, -- Primary estimate linked to project (commented out to avoid migration errors)
  
  -- Progress Tracking
  progress_percentage numeric(5,2) not null default 0, -- 0-100
  completion_percentage numeric(5,2) not null default 0, -- 0-100
  
  -- Metadata
  tags text[], -- Array of tags for categorization
  notes text, -- General project notes
  internal_notes text, -- Internal-only notes
  
  -- Status & Flags
  is_template boolean not null default false, -- Whether this is a project template
  is_active boolean not null default true,
  
  -- Audit Fields
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint unique_project_reference_per_company unique (company_id, reference)
);

-- ============================================================================
-- PROJECT MILESTONES TABLE
-- ============================================================================
create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  
  -- Milestone Information
  title text not null,
  description text,
  
  -- Dates
  due_date date,
  completed_date date,
  
  -- Status
  status text not null default 'pending', -- 'pending', 'in_progress', 'completed', 'overdue', 'cancelled'
  
  -- Progress
  progress_percentage numeric(5,2) not null default 0, -- 0-100
  
  -- Ordering
  display_order integer not null default 0,
  
  -- Metadata
  notes text,
  
  -- Audit Fields
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- PROJECT TASKS TABLE
-- ============================================================================
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.project_milestones(id) on delete set null,
  
  -- Task Information
  title text not null,
  description text,
  
  -- Assignment
  assigned_to_id uuid references auth.users(id) on delete set null,
  assigned_to_name text, -- Free text fallback
  
  -- Dates
  due_date date,
  start_date date,
  completed_date date,
  
  -- Status
  status text not null default 'todo', -- 'todo', 'in_progress', 'blocked', 'completed', 'cancelled'
  priority text not null default 'medium', -- 'low', 'medium', 'high', 'urgent'
  
  -- Progress
  progress_percentage numeric(5,2) not null default 0, -- 0-100
  
  -- Time Tracking
  estimated_hours numeric(8,2),
  actual_hours numeric(8,2),
  
  -- Ordering
  display_order integer not null default 0,
  
  -- Metadata
  tags text[],
  notes text,
  
  -- Audit Fields
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- PROJECT FILES TABLE
-- ============================================================================
create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  
  -- File Information
  name text not null,
  description text,
  file_type text, -- 'drawing', 'photo', 'document', 'structural', 'specification', 'other'
  file_category text, -- Additional categorization
  
  -- Storage
  file_path text, -- Path to file in storage
  file_url text, -- URL if stored externally (e.g., Google Drive)
  file_size bigint, -- File size in bytes
  mime_type text,
  
  -- External Integration
  google_drive_file_id text, -- Google Drive file ID if linked
  google_drive_web_view_link text, -- Google Drive web view link
  
  -- Metadata
  tags text[],
  notes text,
  
  -- Audit Fields
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- PROJECT NOTES TABLE (Linked to sticky notes module)
-- ============================================================================
create table if not exists public.project_notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  
  -- Note Information (linked to notes module)
  note_id uuid, -- Reference to notes table if using shared notes module
  
  -- Project-Specific Note Data
  title text,
  content text not null,
  color text default 'yellow', -- Note color
  
  -- Position (for sticky notes board)
  position_x integer,
  position_y integer,
  
  -- Metadata
  tags text[],
  is_pinned boolean not null default false,
  
  -- Audit Fields
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- PROJECT CHAT MESSAGES TABLE (Project-specific chat)
-- ============================================================================
create table if not exists public.project_chat_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  
  -- Message Information
  message text not null,
  message_type text not null default 'text', -- 'text', 'file', 'system'
  
  -- Sender
  sender_id uuid references auth.users(id) on delete set null,
  sender_name text, -- Free text fallback
  
  -- Threading
  parent_message_id uuid references public.project_chat_messages(id) on delete set null,
  
  -- Attachments
  attachments jsonb, -- Array of attachment metadata
  
  -- Status
  is_edited boolean not null default false,
  is_deleted boolean not null default false,
  
  -- Audit Fields
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- PROJECT EMAILS TABLE (Link to email module)
-- ============================================================================
create table if not exists public.project_emails (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  
  -- Email Reference (link to email module if exists)
  email_id uuid, -- Reference to emails table if using shared email module
  
  -- Project-Specific Email Data
  subject text not null,
  from_email text,
  to_emails text[],
  cc_emails text[],
  bcc_emails text[],
  body_text text,
  body_html text,
  
  -- Status
  status text not null default 'draft', -- 'draft', 'sent', 'received', 'archived'
  direction text not null default 'outbound', -- 'inbound', 'outbound'
  
  -- Dates
  sent_at timestamptz,
  received_at timestamptz,
  
  -- Attachments
  attachments jsonb, -- Array of attachment metadata
  
  -- Metadata
  tags text[],
  notes text,
  
  -- Audit Fields
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- PROJECT SCHEDULE/GANTT TABLE
-- ============================================================================
create table if not exists public.project_schedule_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  
  -- Schedule Item Information
  title text not null,
  description text,
  
  -- Type
  item_type text not null default 'task', -- 'task', 'milestone', 'phase', 'deliverable'
  
  -- Linked Entities
  task_id uuid references public.project_tasks(id) on delete cascade,
  milestone_id uuid references public.project_milestones(id) on delete cascade,
  
  -- Dates (for Gantt chart)
  start_date date not null,
  end_date date,
  duration_days integer, -- Calculated or manual duration
  
  -- Dependencies
  depends_on_ids uuid[], -- Array of schedule item IDs this depends on
  
  -- Progress
  progress_percentage numeric(5,2) not null default 0, -- 0-100
  
  -- Resource Assignment
  assigned_to_ids uuid[], -- Array of user IDs
  
  -- Display
  display_order integer not null default 0,
  color text, -- Color for Gantt chart display
  
  -- Metadata
  notes text,
  
  -- Audit Fields
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- PROJECT AUTOMATION RULES TABLE
-- ============================================================================
create table if not exists public.project_automation_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  project_id uuid references public.projects(id) on delete cascade, -- null for global rules
  
  -- Rule Information
  name text not null,
  description text,
  
  -- Trigger
  trigger_type text not null, -- 'milestone_completed', 'task_completed', 'date_reached', 'status_changed', etc.
  trigger_conditions jsonb, -- JSON conditions for the trigger
  
  -- Actions
  actions jsonb not null, -- Array of actions to perform
  
  -- Status
  is_active boolean not null default true,
  
  -- Metadata
  notes text,
  
  -- Audit Fields
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
create index if not exists idx_projects_company_id on public.projects(company_id);
create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_projects_client_company_id on public.projects(client_company_id);
create index if not exists idx_projects_estimate_id on public.projects(estimate_id);
create index if not exists idx_projects_opportunity_id on public.projects(opportunity_id);

create index if not exists idx_project_milestones_project_id on public.project_milestones(project_id);
create index if not exists idx_project_tasks_project_id on public.project_tasks(project_id);
create index if not exists idx_project_tasks_milestone_id on public.project_tasks(milestone_id);
create index if not exists idx_project_files_project_id on public.project_files(project_id);
create index if not exists idx_project_notes_project_id on public.project_notes(project_id);
create index if not exists idx_project_chat_messages_project_id on public.project_chat_messages(project_id);
create index if not exists idx_project_emails_project_id on public.project_emails(project_id);
create index if not exists idx_project_schedule_items_project_id on public.project_schedule_items(project_id);
create index if not exists idx_project_automation_rules_project_id on public.project_automation_rules(project_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
alter table public.projects enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_tasks enable row level security;
alter table public.project_files enable row level security;
alter table public.project_notes enable row level security;
alter table public.project_chat_messages enable row level security;
alter table public.project_emails enable row level security;
alter table public.project_schedule_items enable row level security;
alter table public.project_automation_rules enable row level security;

-- Simple policy: All authenticated users can access all projects
-- Since ConstructOS is internal, no multi-tenant isolation needed
create policy "projects_authenticated_access"
on public.projects
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "project_milestones_authenticated_access"
on public.project_milestones
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "project_tasks_authenticated_access"
on public.project_tasks
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "project_files_authenticated_access"
on public.project_files
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "project_notes_authenticated_access"
on public.project_notes
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "project_chat_messages_authenticated_access"
on public.project_chat_messages
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "project_emails_authenticated_access"
on public.project_emails
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "project_schedule_items_authenticated_access"
on public.project_schedule_items
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

create policy "project_automation_rules_authenticated_access"
on public.project_automation_rules
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);
