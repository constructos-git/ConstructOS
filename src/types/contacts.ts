// Contact Types for ConstructOS CRM

export type ContactType = 'client' | 'contractor' | 'consultant' | 'supplier' | 'other';
export type ContactStatus = 'active' | 'inactive' | 'archived';
export type ClientType = 'residential' | 'commercial' | 'industrial' | 'public_sector';
export type RelationshipStatus = 'active' | 'inactive' | 'prospect' | 'former';
export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';
export type ActivityType = 
  | 'call' 
  | 'email' 
  | 'meeting' 
  | 'note' 
  | 'quote_sent' 
  | 'invoice_sent'
  | 'project_started'
  | 'project_completed'
  | 'payment_received'
  | 'document_sent'
  | 'other';

// ============================================================================
// COMPANY
// ============================================================================
export interface Company {
  id: string;
  company_id: string; // ConstructOS company ID
  
  // Basic Information
  name: string;
  legal_name?: string;
  company_number?: string;
  vat_number?: string;
  
  // Contact Information
  email?: string;
  phone?: string;
  website?: string;
  fax?: string;
  
  // Address
  address_line1?: string;
  address_line2?: string;
  address_line3?: string;
  town_city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  
  // Classification
  type: ContactType;
  industry?: string;
  sector?: string;
  
  // Business Details
  employee_count?: string;
  annual_revenue?: string;
  established_year?: number;
  
  // Status & Metadata
  status: ContactStatus;
  tags?: string[];
  notes?: string;
  
  // Social & Online Presence
  linkedin_url?: string;
  twitter_handle?: string;
  facebook_url?: string;
  
  // Financial Information
  payment_terms?: string;
  credit_limit?: number;
  currency?: string;
  
  // Relationships
  parent_company_id?: string;
  
  // Audit
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CONTACT (Individual Person)
// ============================================================================
export interface Contact {
  id: string;
  company_id: string; // ConstructOS company ID
  
  // Basic Information
  first_name: string;
  last_name: string;
  title?: string;
  job_title?: string;
  department?: string;
  
  // Contact Information
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  
  // Address
  address_line1?: string;
  address_line2?: string;
  address_line3?: string;
  town_city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  
  // Relationships
  company_uuid?: string; // The company this contact works for
  
  // Classification
  type: ContactType;
  is_primary_contact: boolean;
  is_decision_maker: boolean;
  
  // Communication Preferences
  preferred_contact_method?: string;
  email_opt_in: boolean;
  sms_opt_in: boolean;
  
  // Social & Online
  linkedin_url?: string;
  twitter_handle?: string;
  
  // Status & Metadata
  status: ContactStatus;
  tags?: string[];
  notes?: string;
  
  // Additional Info
  birthday?: string;
  anniversary?: string;
  personal_notes?: string;
  
  // Audit
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Computed/Joined fields
  company?: Company;
  full_name?: string;
}

// ============================================================================
// CLIENT (Customer Company - Specialized)
// ============================================================================
export interface Client {
  id: string;
  company_id: string;
  
  // Link to company
  company_uuid?: string;
  
  // Client-Specific Information
  client_type?: ClientType;
  project_types?: string[];
  average_project_value?: number;
  preferred_communication_method?: string;
  
  // Relationship Details
  relationship_start_date?: string;
  relationship_status: RelationshipStatus;
  account_manager_id?: string;
  
  // Financial
  payment_terms?: string;
  credit_limit?: number;
  outstanding_balance: number;
  
  // Preferences
  preferred_quote_format?: string;
  auto_send_quotes: boolean;
  
  // Metadata
  tags?: string[];
  notes?: string;
  internal_notes?: string;
  
  // Audit
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Computed/Joined fields
  company?: Company;
  contacts?: Contact[];
}

// ============================================================================
// CONTRACTOR (Subcontractor Company - Specialized)
// ============================================================================
export interface Contractor {
  id: string;
  company_id: string;
  
  // Link to company
  company_uuid?: string;
  
  // Contractor-Specific Information
  trade_types?: string[];
  certifications?: string[];
  insurance_expiry?: string;
  public_liability_amount?: number;
  employer_liability_amount?: number;
  
  // Capabilities
  max_project_value?: number;
  geographic_coverage?: string[];
  availability_status: AvailabilityStatus;
  
  // Performance & Rating
  rating?: number;
  total_projects_completed: number;
  on_time_completion_rate?: number;
  quality_rating?: number;
  
  // Financial
  payment_terms?: string;
  preferred_payment_method?: string;
  bank_account_details?: Record<string, any>;
  
  // Relationship
  relationship_start_date?: string;
  relationship_status: RelationshipStatus;
  preferred_contact_id?: string;
  
  // Metadata
  tags?: string[];
  notes?: string;
  internal_notes?: string;
  
  // Audit
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Computed/Joined fields
  company?: Company;
  preferred_contact?: Contact;
  contacts?: Contact[];
}

// ============================================================================
// CONSULTANT (Consultant Company/Individual - Specialized)
// ============================================================================
export interface Consultant {
  id: string;
  company_id: string;
  
  // Link to company or contact
  company_uuid?: string;
  contact_uuid?: string;
  
  // Consultant-Specific Information
  consultant_type?: string;
  specializations?: string[];
  qualifications?: string[];
  professional_registrations?: string[];
  registration_numbers?: string[];
  
  // Capabilities
  hourly_rate?: number;
  daily_rate?: number;
  project_rate_type?: string;
  
  // Availability
  availability_status: AvailabilityStatus;
  typical_response_time?: string;
  
  // Performance
  rating?: number;
  total_projects_completed: number;
  
  // Relationship
  relationship_start_date?: string;
  relationship_status: RelationshipStatus;
  
  // Metadata
  tags?: string[];
  notes?: string;
  internal_notes?: string;
  
  // Audit
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Computed/Joined fields
  company?: Company;
  contact?: Contact;
}

// ============================================================================
// CONTACT ACTIVITY
// ============================================================================
export interface ContactActivity {
  id: string;
  company_id: string;
  
  // Relationships
  contact_id?: string;
  company_uuid?: string;
  client_id?: string;
  contractor_id?: string;
  consultant_id?: string;
  
  // Activity Details
  activity_type: ActivityType;
  subject?: string;
  description?: string;
  outcome?: string;
  
  // Related Items
  related_opportunity_id?: string;
  related_project_id?: string;
  related_estimate_id?: string;
  related_invoice_id?: string;
  
  // Metadata
  activity_date: string;
  duration_minutes?: number;
  location?: string;
  
  // Audit
  created_by?: string;
  created_at: string;
  
  // Computed/Joined fields
  contact?: Contact;
  company?: Company;
  client?: Client;
  contractor?: Contractor;
  consultant?: Consultant;
}

// ============================================================================
// VIEW TYPES
// ============================================================================
export type ContactViewType = 'grid' | 'list' | 'table' | 'detail';

// ============================================================================
// FILTERS & SORTING
// ============================================================================
export interface ContactFilters {
  type?: ContactType[];
  status?: ContactStatus[];
  tags?: string[];
  search?: string;
  company_id?: string;
}

export interface ContactSortOptions {
  field: 'name' | 'created_at' | 'updated_at' | 'status' | 'type';
  direction: 'asc' | 'desc';
}
