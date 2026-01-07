import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Role, User, UserRole, CustomPermission, Permission, PermissionResource, PermissionAction } from '@/types/permissions';

interface PermissionsState {
  currentUser: User | null;
  roles: Role[];
  customPermissions: CustomPermission[];
  setCurrentUser: (user: User | null) => void;
  updateRole: (roleId: string, updates: Partial<Role>) => void;
  addRole: (role: Omit<Role, 'id'>) => void;
  deleteRole: (roleId: string) => void;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  canAccess: (resource: string) => boolean;
}

const createPermission = (resource: PermissionResource, action: PermissionAction): Permission => ({
  id: `${resource}-${action}`,
  resource,
  action,
});

const getAllPermissions = (resources: PermissionResource[], actions: PermissionAction[]): Permission[] => {
  return resources.flatMap((resource) =>
    actions.map((action) => createPermission(resource, action))
  );
};

// Get all resources from categories
const resources: PermissionResource[] = [
  // Core System
  'dashboard', 'settings', 'users', 'roles', 'permissions', 'activities', 
  'audit_log', 'notifications', 'system_config', 'backup_restore',
  // CRM & Contacts
  'companies', 'contacts', 'clients', 'contractors', 'consultants', 'vendors', 
  'suppliers', 'contact_groups', 'contact_tags', 'contact_notes', 'contact_history',
  // Opportunities & Sales
  'opportunities', 'leads', 'quotes', 'proposals', 'sales_pipeline', 'conversions',
  // Projects
  'projects', 'project_templates', 'project_tasks', 'project_milestones', 
  'project_phases', 'project_budget', 'project_timeline', 'project_resources', 
  'project_team', 'project_documents', 'project_chat', 'project_notes', 'project_reports',
  // Financial
  'invoices', 'estimates', 'payments', 'expenses', 'purchase_orders', 'bills', 
  'credit_notes', 'refunds', 'financial_reports', 'accounting', 'tax', 'budget', 
  'forecasting', 'financial_dashboard',
  // Communication
  'messages', 'emails', 'email_templates', 'email_campaigns', 'chat', 
  'chat_channels', 'chat_groups', 'announcements',
  // Documents & Files
  'files', 'documents', 'document_templates', 'file_folders', 'file_sharing', 
  'file_versions', 'document_approval', 'digital_signatures',
  // Knowledge & Resources
  'knowledgebase', 'articles', 'faqs', 'guides', 'templates', 'resources', 'training_materials',
  // Client Portal
  'clientportal', 'client_dashboard', 'client_projects', 'client_invoices', 
  'client_documents', 'client_messages', 'client_settings',
  // Reports & Analytics
  'reports', 'analytics', 'dashboards', 'custom_reports', 'scheduled_reports', 
  'data_export', 'business_intelligence',
  // Integrations
  'integrations', 'api_keys', 'webhooks', 'third_party_apps', 'xero', 
  'quickbooks', 'freeagent', 'accounting_sync',
  // Calendar & Scheduling
  'calendar', 'events', 'meetings', 'appointments', 'scheduling', 'time_tracking', 'timesheets',
  // Time & Attendance
  'time_entries', 'attendance', 'leave_management', 'holidays', 'overtime',
  // Inventory & Assets
  'inventory', 'assets', 'equipment', 'materials', 'stock_management', 'asset_tracking',
  // Quality & Compliance
  'quality_control', 'inspections', 'compliance', 'certifications', 'safety', 'risk_management',
  // Notes & Tasks
  'notes', 'tasks', 'todo_lists', 'reminders', 'checklists',
];

const allActions: PermissionAction[] = [
  // Basic
  'create', 'read', 'update', 'delete', 'view', 'edit',
  // Management
  'manage', 'assign', 'approve', 'reject', 'configure', 'delegate', 'revoke',
  // File Operations
  'export', 'import', 'download', 'upload', 'copy', 'move', 'rename', 'duplicate', 'share',
  // Workflow
  'archive', 'restore', 'publish', 'unpublish', 'complete', 'reopen', 'lock', 'unlock', 'verify',
  // Communication
  'send', 'receive', 'forward', 'reply',
  // Advanced
  'merge', 'split', 'schedule', 'cancel', 'audit', 'backup', 'restore_data',
];

// Super Admin: All permissions
const superAdminPermissions = getAllPermissions(resources, allActions);

// Admin: Most permissions except critical system settings
const adminPermissions = getAllPermissions(resources, allActions).filter(
  (p) => !(p.resource === 'roles' && p.action === 'delete') && 
         !(p.resource === 'permissions' && p.action === 'delete') &&
         !(p.resource === 'users' && p.action === 'delete')
);

// Project Manager: Full project access, read access to most other areas
const projectManagerPermissions = [
  ...getAllPermissions(['dashboard', 'projects', 'project_tasks', 'project_milestones', 'project_phases', 'project_budget', 'project_timeline', 'project_resources', 'project_team', 'project_documents', 'project_chat', 'project_notes', 'project_reports', 'opportunities', 'files', 'documents', 'activities', 'messages', 'emails', 'chat'], allActions),
  ...getAllPermissions(['companies', 'contacts', 'clients', 'contractors', 'invoices', 'estimates', 'reports', 'financial_reports', 'financial_dashboard'], ['read', 'view', 'export']),
  ...getAllPermissions(['knowledgebase', 'articles'], ['read', 'view']),
];

// Sub-Contractor: Limited to assigned projects
const subContractorPermissions = [
  ...getAllPermissions(['dashboard', 'projects', 'files', 'activities', 'messages'], ['read', 'view', 'update', 'create']),
  ...getAllPermissions(['invoices', 'estimates'], ['read', 'view']),
];

// Consultant: Read access to relevant information
const consultantPermissions = [
  ...getAllPermissions(['dashboard', 'projects', 'opportunities', 'files', 'reports', 'knowledgebase'], ['read', 'view', 'export']),
  ...getAllPermissions(['companies', 'contacts'], ['read', 'view']),
  ...getAllPermissions(['messages', 'emails'], ['read', 'view', 'create']),
];

// Professional: Standard user access
const professionalPermissions = [
  ...getAllPermissions(['dashboard', 'projects', 'project_tasks', 'opportunities', 'files', 'documents', 'activities', 'messages', 'emails', 'chat', 'notes', 'tasks'], ['read', 'view', 'create', 'update']),
  ...getAllPermissions(['companies', 'contacts', 'invoices', 'estimates', 'reports', 'financial_reports', 'financial_dashboard'], ['read', 'view']),
  ...getAllPermissions(['knowledgebase', 'articles'], ['read', 'view']),
];

// Client: Very limited portal access
const clientPermissions = [
  ...getAllPermissions(['dashboard', 'projects', 'files', 'invoices', 'estimates'], ['read', 'view']),
  ...getAllPermissions(['messages', 'emails'], ['read', 'view', 'create']),
  ...getAllPermissions(['clientportal'], ['read', 'view']),
];

const defaultRoles: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full system access and control',
    permissions: superAdminPermissions,
    isSystem: true,
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Administrative access with most permissions',
    permissions: adminPermissions,
    isSystem: true,
  },
  {
    id: 'project_manager',
    name: 'Project Manager',
    description: 'Manage projects and teams',
    permissions: projectManagerPermissions,
    isSystem: true,
  },
  {
    id: 'sub_contractor',
    name: 'Sub-Contractor',
    description: 'Access to assigned projects and tasks',
    permissions: subContractorPermissions,
    isSystem: true,
  },
  {
    id: 'consultant',
    name: 'Consultant',
    description: 'Consultant access to relevant information',
    permissions: consultantPermissions,
    isSystem: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Professional user access',
    permissions: professionalPermissions,
    isSystem: true,
  },
  {
    id: 'client',
    name: 'Client',
    description: 'Client portal access',
    permissions: clientPermissions,
    isSystem: true,
  },
];

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      roles: defaultRoles,
      customPermissions: [],
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      updateRole: (roleId, updates) => {
        set((state) => ({
          roles: state.roles.map((role) =>
            role.id === roleId ? { ...role, ...updates } : role
          ),
        }));
      },
      
      addRole: (roleData) => {
        const newRole: Role = {
          ...roleData,
          id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({
          roles: [...state.roles, newRole],
        }));
        return newRole;
      },
      
      deleteRole: (roleId) => {
        set((state) => ({
          roles: state.roles.filter((role) => role.id !== roleId && role.isSystem !== true),
        }));
      },
  
  hasPermission: (resource, action) => {
    const { currentUser } = get();
    if (!currentUser) return false;
    
    if (currentUser.role === 'super_admin') return true;
    
    const hasDirectPermission = currentUser.permissions?.some(
      (p) => p.resource === resource && p.action === action
    );
    
    if (hasDirectPermission) return true;
    
    const role = get().roles.find((r) => r.id === currentUser.role);
    const hasRolePermission = role?.permissions.some(
      (p) => p.resource === resource && p.action === action
    );
    
    return hasRolePermission ?? false;
  },
  
  hasRole: (role) => {
    const { currentUser } = get();
    return currentUser?.role === role;
  },
  
  canAccess: (resource) => {
    return get().hasPermission(resource, 'read') || get().hasPermission(resource, 'view');
  },
    }),
    {
      name: 'constructos-permissions',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

