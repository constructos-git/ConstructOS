export type PermissionAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'view'
  | 'edit'
  | 'assign'
  | 'approve'
  | 'reject'
  | 'export'
  | 'import'
  | 'archive'
  | 'restore'
  | 'publish'
  | 'unpublish'
  | 'share'
  | 'download'
  | 'upload'
  | 'copy'
  | 'move'
  | 'rename'
  | 'duplicate'
  | 'merge'
  | 'split'
  | 'send'
  | 'receive'
  | 'forward'
  | 'reply'
  | 'schedule'
  | 'cancel'
  | 'complete'
  | 'reopen'
  | 'lock'
  | 'unlock'
  | 'verify'
  | 'audit'
  | 'backup'
  | 'restore_data'
  | 'configure'
  | 'delegate'
  | 'revoke';

export type PermissionResource =
  // Core System
  | 'dashboard'
  | 'settings'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'activities'
  | 'audit_log'
  | 'notifications'
  | 'system_config'
  | 'backup_restore'
  
  // CRM & Contacts
  | 'companies'
  | 'contacts'
  | 'clients'
  | 'contractors'
  | 'consultants'
  | 'vendors'
  | 'suppliers'
  | 'contact_groups'
  | 'contact_tags'
  | 'contact_notes'
  | 'contact_history'
  
  // Opportunities & Sales
  | 'opportunities'
  | 'leads'
  | 'quotes'
  | 'proposals'
  | 'sales_pipeline'
  | 'conversions'
  
  // Projects
  | 'projects'
  | 'project_templates'
  | 'project_tasks'
  | 'project_milestones'
  | 'project_phases'
  | 'project_budget'
  | 'project_timeline'
  | 'project_resources'
  | 'project_team'
  | 'project_documents'
  | 'project_chat'
  | 'project_notes'
  | 'project_reports'
  
  // Financial
  | 'invoices'
  | 'estimates'
  | 'quotes'
  | 'payments'
  | 'expenses'
  | 'purchase_orders'
  | 'bills'
  | 'credit_notes'
  | 'refunds'
  | 'financial_reports'
  | 'accounting'
  | 'tax'
  | 'budget'
  | 'forecasting'
  | 'financial_dashboard'
  
  // Communication
  | 'messages'
  | 'emails'
  | 'email_templates'
  | 'email_campaigns'
  | 'chat'
  | 'chat_channels'
  | 'chat_groups'
  | 'announcements'
  | 'notifications'
  
  // Documents & Files
  | 'files'
  | 'documents'
  | 'document_templates'
  | 'file_folders'
  | 'file_sharing'
  | 'file_versions'
  | 'document_approval'
  | 'digital_signatures'
  
  // Knowledge & Resources
  | 'knowledgebase'
  | 'articles'
  | 'faqs'
  | 'guides'
  | 'templates'
  | 'resources'
  | 'training_materials'
  
  // Client Portal
  | 'clientportal'
  | 'client_dashboard'
  | 'client_projects'
  | 'client_invoices'
  | 'client_documents'
  | 'client_messages'
  | 'client_settings'
  
  // Reports & Analytics
  | 'reports'
  | 'analytics'
  | 'dashboards'
  | 'custom_reports'
  | 'scheduled_reports'
  | 'data_export'
  | 'business_intelligence'
  
  // Integrations
  | 'integrations'
  | 'api_keys'
  | 'webhooks'
  | 'third_party_apps'
  | 'xero'
  | 'quickbooks'
  | 'freeagent'
  | 'accounting_sync'
  
  // Calendar & Scheduling
  | 'calendar'
  | 'events'
  | 'meetings'
  | 'appointments'
  | 'scheduling'
  | 'time_tracking'
  | 'timesheets'
  
  // Time & Attendance
  | 'time_entries'
  | 'attendance'
  | 'leave_management'
  | 'holidays'
  | 'overtime'
  
  // Inventory & Assets
  | 'inventory'
  | 'assets'
  | 'equipment'
  | 'materials'
  | 'stock_management'
  | 'asset_tracking'
  
  // Quality & Compliance
  | 'quality_control'
  | 'inspections'
  | 'compliance'
  | 'certifications'
  | 'safety'
  | 'risk_management'
  
  // Notes & Tasks
  | 'notes'
  | 'tasks'
  | 'todo_lists'
  | 'reminders'
  | 'checklists';

export interface Permission {
  id: string;
  resource: PermissionResource;
  action: PermissionAction;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: unknown;
}

export interface CustomPermission {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  conditions?: PermissionCondition[];
  targetType?: 'role' | 'user' | 'company' | 'project' | 'opportunity';
  targetId?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  customPermissions?: string[];
  isSystem: boolean;
}

export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'project_manager'
  | 'sub_contractor'
  | 'consultant'
  | 'professional'
  | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  customRoles?: string[];
  permissions?: Permission[];
  customPermissions?: string[];
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

