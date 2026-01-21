// ConstructOS Projects: TypeScript Types
// Comprehensive project management types

export type ProjectStatus = 
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled'
  | 'archived';

export type ProjectPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type ProjectType = 
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'renovation'
  | 'new_build'
  | 'extension'
  | 'other';

export type MilestoneStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'cancelled';

export type TaskStatus = 
  | 'todo'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'cancelled';

export type FileType = 
  | 'drawing'
  | 'photo'
  | 'document'
  | 'structural'
  | 'specification'
  | 'other';

export type EmailStatus = 
  | 'draft'
  | 'sent'
  | 'received'
  | 'archived';

export type EmailDirection = 
  | 'inbound'
  | 'outbound';

export type ScheduleItemType = 
  | 'task'
  | 'milestone'
  | 'phase'
  | 'deliverable';

export type ChatMessageType = 
  | 'text'
  | 'file'
  | 'system';

// ============================================================================
// PROJECT INTERFACE
// ============================================================================
export interface Project {
  id: string;
  company_id: string;
  
  // Basic Information
  name: string;
  reference?: string;
  description?: string;
  
  // Classification
  type?: ProjectType;
  category?: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  
  // Customer/Client Information
  client_company_id?: string;
  client_contact_id?: string;
  
  // Financial Information
  project_value?: number;
  budget?: number;
  costs_to_date: number;
  estimated_profit?: number;
  currency: string;
  
  // Dates
  start_date?: string;
  end_date?: string;
  expected_completion_date?: string;
  actual_completion_date?: string;
  
  // Location
  site_address_line1?: string;
  site_address_line2?: string;
  site_address_line3?: string;
  site_town_city?: string;
  site_county?: string;
  site_postcode?: string;
  site_country: string;
  
  // Project Team
  project_manager_id?: string;
  assigned_team_members?: string[];
  
  // Linked Entities
  opportunity_id?: string;
  estimate_id?: string;
  
  // Progress Tracking
  progress_percentage: number;
  completion_percentage: number;
  
  // Metadata
  tags?: string[];
  notes?: string;
  internal_notes?: string;
  
  // Status & Flags
  is_template: boolean;
  is_active: boolean;
  
  // Audit Fields
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Computed/Joined fields
  client_company?: any; // Company type from contacts
  client_contact?: any; // Contact type from contacts
  estimate?: any; // Estimate type
  opportunity?: any; // Opportunity type
  milestones?: ProjectMilestone[];
  tasks?: ProjectTask[];
  files?: ProjectFile[];
  notes?: ProjectNote[];
}

// ============================================================================
// PROJECT MILESTONE INTERFACE
// ============================================================================
export interface ProjectMilestone {
  id: string;
  company_id: string;
  project_id: string;
  
  // Milestone Information
  title: string;
  description?: string;
  
  // Dates
  due_date?: string;
  completed_date?: string;
  
  // Status
  status: MilestoneStatus;
  
  // Progress
  progress_percentage: number;
  
  // Ordering
  display_order: number;
  
  // Metadata
  notes?: string;
  
  // Audit Fields
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Computed/Joined fields
  tasks?: ProjectTask[];
}

// ============================================================================
// PROJECT TASK INTERFACE
// ============================================================================
export interface ProjectTask {
  id: string;
  company_id: string;
  project_id: string;
  milestone_id?: string;
  
  // Task Information
  title: string;
  description?: string;
  
  // Assignment
  assigned_to_id?: string;
  assigned_to_name?: string;
  
  // Dates
  due_date?: string;
  start_date?: string;
  completed_date?: string;
  
  // Status
  status: TaskStatus;
  priority: ProjectPriority;
  
  // Progress
  progress_percentage: number;
  
  // Time Tracking
  estimated_hours?: number;
  actual_hours?: number;
  
  // Ordering
  display_order: number;
  
  // Metadata
  tags?: string[];
  notes?: string;
  
  // Audit Fields
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Computed/Joined fields
  milestone?: ProjectMilestone;
}

// ============================================================================
// PROJECT FILE INTERFACE
// ============================================================================
export interface ProjectFile {
  id: string;
  company_id: string;
  project_id: string;
  
  // File Information
  name: string;
  description?: string;
  file_type?: FileType;
  file_category?: string;
  
  // Storage
  file_path?: string;
  file_url?: string;
  file_size?: number;
  mime_type?: string;
  
  // External Integration
  google_drive_file_id?: string;
  google_drive_web_view_link?: string;
  
  // Metadata
  tags?: string[];
  notes?: string;
  
  // Audit Fields
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PROJECT NOTE INTERFACE
// ============================================================================
export interface ProjectNote {
  id: string;
  company_id: string;
  project_id: string;
  
  // Note Information
  note_id?: string;
  title?: string;
  content: string;
  color: string;
  
  // Position
  position_x?: number;
  position_y?: number;
  
  // Metadata
  tags?: string[];
  is_pinned: boolean;
  
  // Audit Fields
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PROJECT CHAT MESSAGE INTERFACE
// ============================================================================
export interface ProjectChatMessage {
  id: string;
  company_id: string;
  project_id: string;
  
  // Message Information
  message: string;
  message_type: ChatMessageType;
  
  // Sender
  sender_id?: string;
  sender_name?: string;
  
  // Threading
  parent_message_id?: string;
  
  // Attachments
  attachments?: any[];
  
  // Status
  is_edited: boolean;
  is_deleted: boolean;
  
  // Audit Fields
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PROJECT EMAIL INTERFACE
// ============================================================================
export interface ProjectEmail {
  id: string;
  company_id: string;
  project_id: string;
  
  // Email Reference
  email_id?: string;
  
  // Email Data
  subject: string;
  from_email?: string;
  to_emails?: string[];
  cc_emails?: string[];
  bcc_emails?: string[];
  body_text?: string;
  body_html?: string;
  
  // Status
  status: EmailStatus;
  direction: EmailDirection;
  
  // Dates
  sent_at?: string;
  received_at?: string;
  
  // Attachments
  attachments?: any[];
  
  // Metadata
  tags?: string[];
  notes?: string;
  
  // Audit Fields
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PROJECT SCHEDULE ITEM INTERFACE (for Gantt chart)
// ============================================================================
export interface ProjectScheduleItem {
  id: string;
  company_id: string;
  project_id: string;
  
  // Schedule Item Information
  title: string;
  description?: string;
  
  // Type
  item_type: ScheduleItemType;
  
  // Linked Entities
  task_id?: string;
  milestone_id?: string;
  
  // Dates
  start_date: string;
  end_date?: string;
  duration_days?: number;
  
  // Dependencies
  depends_on_ids?: string[];
  
  // Progress
  progress_percentage: number;
  
  // Resource Assignment
  assigned_to_ids?: string[];
  
  // Display
  display_order: number;
  color?: string;
  
  // Metadata
  notes?: string;
  
  // Audit Fields
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PROJECT AUTOMATION RULE INTERFACE
// ============================================================================
export interface ProjectAutomationRule {
  id: string;
  company_id: string;
  project_id?: string;
  
  // Rule Information
  name: string;
  description?: string;
  
  // Trigger
  trigger_type: string;
  trigger_conditions?: any;
  
  // Actions
  actions: any[];
  
  // Status
  is_active: boolean;
  
  // Metadata
  notes?: string;
  
  // Audit Fields
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PROJECT METRICS INTERFACE
// ============================================================================
export interface ProjectMetrics {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  cancelled: number;
  totalValue: number;
  totalBudget: number;
  totalCosts: number;
  averageProgress: number;
  overdueProjects: number;
  upcomingDeadlines: number;
  byStatus: Record<ProjectStatus, { count: number; value: number }>;
  byPriority: Record<ProjectPriority, { count: number; value: number }>;
  byType: Record<string, { count: number; value: number }>;
}

// ============================================================================
// PROJECT VIEW TYPES
// ============================================================================
export type ProjectViewType = 
  | 'kanban'
  | 'grid'
  | 'list'
  | 'table'
  | 'detail';

// ============================================================================
// PROJECT FILTERS
// ============================================================================
export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  type?: ProjectType[];
  searchQuery?: string;
  clientCompanyId?: string;
  projectManagerId?: string;
  tags?: string[];
}

// ============================================================================
// PROJECT SORT OPTIONS
// ============================================================================
export type ProjectSortField = 
  | 'name'
  | 'status'
  | 'priority'
  | 'start_date'
  | 'end_date'
  | 'project_value'
  | 'progress_percentage'
  | 'created_at'
  | 'updated_at';

export type ProjectSortDirection = 'asc' | 'desc';

export interface ProjectSortOptions {
  field: ProjectSortField;
  direction: ProjectSortDirection;
}
