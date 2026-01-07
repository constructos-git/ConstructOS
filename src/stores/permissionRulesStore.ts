import { create } from 'zustand';
import type {
  PermissionRule,
  PermissionTemplate,
  PermissionAuditLog,
  RuleCondition,
  RuleAction,
  PermissionEvaluationContext,
  PermissionEvaluationResult,
} from '@/types/permissionRules';

interface PermissionRulesState {
  rules: PermissionRule[];
  templates: PermissionTemplate[];
  auditLogs: PermissionAuditLog[];
  activeRuleId: string | null;
  
  // Actions
  addRule: (rule: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt'>) => PermissionRule;
  updateRule: (id: string, updates: Partial<PermissionRule>) => void;
  deleteRule: (id: string) => void;
  activateRule: (id: string) => void;
  deactivateRule: (id: string) => void;
  duplicateRule: (id: string) => PermissionRule;
  
  addTemplate: (template: Omit<PermissionTemplate, 'id' | 'usageCount'>) => PermissionTemplate;
  createRuleFromTemplate: (templateId: string) => PermissionRule;
  
  addAuditLog: (log: Omit<PermissionAuditLog, 'id' | 'timestamp'>) => void;
  getAuditLogs: (filters?: { userId?: string; ruleId?: string; action?: string }) => PermissionAuditLog[];
  
  setActiveRule: (id: string | null) => void;
  getRule: (id: string) => PermissionRule | undefined;
  getRulesForRole: (role: string) => PermissionRule[];
  getRulesForUser: (userId: string) => PermissionRule[];
  
  // Rule evaluation
  evaluatePermission: (context: PermissionEvaluationContext) => PermissionEvaluationResult;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default templates
const defaultTemplates: PermissionTemplate[] = [
  // File Access Templates
  {
    id: 'template-admin-file-sharing',
    name: 'Admin File Sharing',
    description: 'Allows admins to set file visibility for any user or specific users',
    category: 'file_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Admin File Sharing',
      description: 'Allows admins to set file visibility for any user or specific users',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'equals',
          value: 'admin',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'setFileVisibility',
          target: 'any_user',
          entityType: 'file',
        },
      ],
      assignedRoles: ['admin'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-file-owner-full-access',
    name: 'File Owner Full Access',
    description: 'File owners have full access to their own files',
    category: 'file_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'File Owner Full Access',
      description: 'File owners have full access to their own files',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'file.ownerId',
          operator: 'equals',
          value: 'user.id',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['view', 'edit', 'delete', 'share', 'download'],
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-project-files-access',
    name: 'Project Files Access',
    description: 'Project members can access all files in their assigned projects',
    category: 'file_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Project Files Access',
      description: 'Project members can access all files in their assigned projects',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'file.projectId',
          operator: 'in',
          value: 'user.projectIds',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['view', 'download'],
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-client-visible-files',
    name: 'Client Visible Files',
    description: 'Clients can view files marked as client-visible in their company projects',
    category: 'file_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Client Visible Files',
      description: 'Clients can view files marked as client-visible in their company projects',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'equals',
          value: 'client',
        },
        {
          id: generateId(),
          field: 'file.isClientVisible',
          operator: 'equals',
          value: true,
          logicalOperator: 'AND',
        },
        {
          id: generateId(),
          field: 'file.projectId',
          operator: 'in',
          value: 'user.projectIds',
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['view', 'download'],
        },
      ],
      assignedRoles: ['client'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-large-file-restriction',
    name: 'Large File Download Restriction',
    description: 'Restrict download of large files to admins and project managers only',
    category: 'file_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Large File Download Restriction',
      description: 'Restrict download of large files to admins and project managers only',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'file.size',
          operator: 'greater_than',
          value: '10485760',
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['admin', 'project_manager'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['download'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'deny',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['download'],
          isElseAction: true,
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Project Access Templates
  {
    id: 'template-project-manager-full-access',
    name: 'Project Manager Full Access',
    description: 'Project managers can access all files and resources in their assigned projects',
    category: 'project_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Project Manager Full Access',
      description: 'Project managers can access all files and resources in their assigned projects',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'equals',
          value: 'project_manager',
        },
        {
          id: generateId(),
          field: 'entity.projectId',
          operator: 'in',
          value: 'user.projectIds',
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['view', 'edit', 'delete', 'share'],
        },
      ],
      assignedRoles: ['project_manager'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-active-project-access',
    name: 'Active Project Access Only',
    description: 'Users can only access active projects',
    category: 'project_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Active Project Access Only',
      description: 'Users can only access active projects',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'project.isActive',
          operator: 'equals',
          value: true,
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'project_members',
          entityType: 'project',
          permissions: ['view'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'deny',
          target: 'project_members',
          entityType: 'project',
          permissions: ['view'],
          isElseAction: true,
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-high-budget-project-access',
    name: 'High Budget Project Access',
    description: 'Only admins and project managers can access projects with budget over threshold',
    category: 'project_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'High Budget Project Access',
      description: 'Only admins and project managers can access projects with budget over threshold',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'project.budget',
          operator: 'greater_than',
          value: '100000',
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['admin', 'project_manager'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'project',
          permissions: ['view', 'edit'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'deny',
          target: 'specific_user',
          entityType: 'project',
          permissions: ['view', 'edit'],
          isElseAction: true,
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-project-status-based-access',
    name: 'Project Status Based Access',
    description: 'Different access levels based on project status',
    category: 'project_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Project Status Based Access',
      description: 'Different access levels based on project status',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'project.status',
          operator: 'equals',
          value: 'in_progress',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'project_members',
          entityType: 'project',
          permissions: ['view', 'edit'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'project_members',
          entityType: 'project',
          permissions: ['view'],
          isElseAction: true,
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Client Portal Templates
  {
    id: 'template-client-portal-access',
    name: 'Client Portal Access',
    description: 'Allows clients to view files marked as client-visible in their projects',
    category: 'client_portal',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Client Portal Access',
      description: 'Allows clients to view files marked as client-visible in their projects',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'equals',
          value: 'client',
        },
        {
          id: generateId(),
          field: 'entity.isClientVisible',
          operator: 'equals',
          value: true,
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['view'],
        },
      ],
      assignedRoles: ['client'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-client-invoice-access',
    name: 'Client Invoice Access',
    description: 'Clients can view invoices for their company projects',
    category: 'client_portal',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Client Invoice Access',
      description: 'Clients can view invoices for their company projects',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'equals',
          value: 'client',
        },
        {
          id: generateId(),
          field: 'invoice.companyId',
          operator: 'equals',
          value: 'user.companyId',
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'invoice',
          permissions: ['view', 'download'],
        },
      ],
      assignedRoles: ['client'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-client-project-updates',
    name: 'Client Project Updates',
    description: 'Clients can view project updates and progress for their projects',
    category: 'client_portal',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Client Project Updates',
      description: 'Clients can view project updates and progress for their projects',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'equals',
          value: 'client',
        },
        {
          id: generateId(),
          field: 'project.clientCompanyId',
          operator: 'equals',
          value: 'user.companyId',
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'project',
          permissions: ['view'],
        },
      ],
      assignedRoles: ['client'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Financial Templates
  {
    id: 'template-financial-admin-only',
    name: 'Financial Admin Only',
    description: 'Only admins can access financial data and reports',
    category: 'financial',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Financial Admin Only',
      description: 'Only admins can access financial data and reports',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['super_admin', 'admin'],
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'invoice',
          permissions: ['view', 'edit', 'delete'],
        },
      ],
      assignedRoles: ['super_admin', 'admin'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-overdue-invoice-alert',
    name: 'Overdue Invoice Alert Access',
    description: 'Project managers can view overdue invoices for their projects',
    category: 'financial',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Overdue Invoice Alert Access',
      description: 'Project managers can view overdue invoices for their projects',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'equals',
          value: 'project_manager',
        },
        {
          id: generateId(),
          field: 'invoice.status',
          operator: 'equals',
          value: 'overdue',
          logicalOperator: 'AND',
        },
        {
          id: generateId(),
          field: 'invoice.projectId',
          operator: 'in',
          value: 'user.projectIds',
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'invoice',
          permissions: ['view'],
        },
      ],
      assignedRoles: ['project_manager'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-high-value-invoice-approval',
    name: 'High Value Invoice Approval',
    description: 'Invoices over threshold require admin approval',
    category: 'financial',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'High Value Invoice Approval',
      description: 'Invoices over threshold require admin approval',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'invoice.amount',
          operator: 'greater_than',
          value: '10000',
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['super_admin', 'admin'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'invoice',
          permissions: ['view', 'edit', 'approve'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'invoice',
          permissions: ['view'],
          isElseAction: true,
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Communication Templates
  {
    id: 'template-project-messages-access',
    name: 'Project Messages Access',
    description: 'Project members can access messages for their projects',
    category: 'communication',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Project Messages Access',
      description: 'Project members can access messages for their projects',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'entity.projectId',
          operator: 'in',
          value: 'user.projectIds',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'message',
          permissions: ['view', 'edit', 'comment'],
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-company-email-access',
    name: 'Company Email Access',
    description: 'Users can access emails for their company',
    category: 'communication',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Company Email Access',
      description: 'Users can access emails for their company',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'entity.companyId',
          operator: 'equals',
          value: 'user.companyId',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'email',
          permissions: ['view', 'edit'],
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Time-Based Templates
  {
    id: 'template-recent-files-only',
    name: 'Recent Files Only',
    description: 'Restrict access to files uploaded in the last 30 days',
    category: 'file_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Recent Files Only',
      description: 'Restrict access to files uploaded in the last 30 days',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'file.uploadedAt',
          operator: 'greater_than',
          value: '30_days_ago',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'project_members',
          entityType: 'file',
          permissions: ['view'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'deny',
          target: 'project_members',
          entityType: 'file',
          permissions: ['view'],
          isElseAction: true,
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-active-user-access',
    name: 'Active User Access Only',
    description: 'Only active users can access the system',
    category: 'custom',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Active User Access Only',
      description: 'Only active users can access the system',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.isActive',
          operator: 'equals',
          value: true,
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          permissions: ['view'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'deny',
          target: 'specific_user',
          permissions: ['view'],
          isElseAction: true,
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Opportunity Templates
  {
    id: 'template-high-value-opportunity-access',
    name: 'High Value Opportunity Access',
    description: 'Only admins and project managers can access high-value opportunities',
    category: 'custom',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'High Value Opportunity Access',
      description: 'Only admins and project managers can access high-value opportunities',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'opportunity.value',
          operator: 'greater_than',
          value: '50000',
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['admin', 'project_manager'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'opportunity',
          permissions: ['view', 'edit'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'opportunity',
          permissions: ['view'],
          isElseAction: true,
        },
      ],
      assignedRoles: ['admin', 'project_manager'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-won-opportunity-access',
    name: 'Won Opportunity Access',
    description: 'Full access to won opportunities for project creation',
    category: 'custom',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Won Opportunity Access',
      description: 'Full access to won opportunities for project creation',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'opportunity.status',
          operator: 'equals',
          value: 'won',
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['admin', 'project_manager'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'opportunity',
          permissions: ['view', 'edit', 'delete'],
        },
      ],
      assignedRoles: ['admin', 'project_manager'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Document Management Templates
  {
    id: 'template-contract-documents-admin',
    name: 'Contract Documents Admin Only',
    description: 'Only admins can access contract documents',
    category: 'file_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Contract Documents Admin Only',
      description: 'Only admins can access contract documents',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'file.category',
          operator: 'equals',
          value: 'contracts',
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['super_admin', 'admin'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['view', 'edit', 'delete'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'deny',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['view'],
          isElseAction: true,
        },
      ],
      assignedRoles: ['super_admin', 'admin'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-confidential-files-restricted',
    name: 'Confidential Files Restricted',
    description: 'Files tagged as confidential require admin or project manager access',
    category: 'file_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Confidential Files Restricted',
      description: 'Files tagged as confidential require admin or project manager access',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'file.tags',
          operator: 'contains',
          value: 'confidential',
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['super_admin', 'admin', 'project_manager'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['view', 'download'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'deny',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['view', 'download'],
          isElseAction: true,
        },
      ],
      assignedRoles: ['super_admin', 'admin', 'project_manager'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Reporting Templates
  {
    id: 'template-financial-reports-admin',
    name: 'Financial Reports Admin Only',
    description: 'Only admins can generate and view financial reports',
    category: 'financial',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Financial Reports Admin Only',
      description: 'Only admins can generate and view financial reports',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'entity.type',
          operator: 'equals',
          value: 'report',
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['super_admin', 'admin'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['view', 'export'],
        },
      ],
      assignedRoles: ['super_admin', 'admin'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-project-reports-managers',
    name: 'Project Reports for Managers',
    description: 'Project managers can view reports for their assigned projects',
    category: 'custom',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Project Reports for Managers',
      description: 'Project managers can view reports for their assigned projects',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'equals',
          value: 'project_manager',
        },
        {
          id: generateId(),
          field: 'entity.projectId',
          operator: 'in',
          value: 'user.projectIds',
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['view'],
        },
      ],
      assignedRoles: ['project_manager'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Integration Templates
  {
    id: 'template-xero-integration-admin',
    name: 'Xero Integration Admin Only',
    description: 'Only admins can manage Xero integration settings',
    category: 'custom',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Xero Integration Admin Only',
      description: 'Only admins can manage Xero integration settings',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['super_admin', 'admin'],
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          permissions: ['manage'],
        },
      ],
      assignedRoles: ['super_admin', 'admin'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Department-Based Templates
  {
    id: 'template-department-specific-access',
    name: 'Department Specific Access',
    description: 'Users can only access resources for their department',
    category: 'custom',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Department Specific Access',
      description: 'Users can only access resources for their department',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.department',
          operator: 'equals',
          value: 'entity.department',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          permissions: ['view', 'edit'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'deny',
          target: 'specific_user',
          permissions: ['view', 'edit'],
          isElseAction: true,
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // File Type Templates
  {
    id: 'template-image-files-view-only',
    name: 'Image Files View Only',
    description: 'Image files are view-only for non-admins',
    category: 'file_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Image Files View Only',
      description: 'Image files are view-only for non-admins',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'file.type',
          operator: 'in',
          value: ['png', 'jpg', 'jpeg', 'gif'],
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'not_equals',
          value: 'admin',
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['view'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['view', 'edit', 'delete'],
          isElseAction: true,
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Company-Based Templates
  {
    id: 'template-company-resources-access',
    name: 'Company Resources Access',
    description: 'Users can access resources for their company only',
    category: 'custom',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Company Resources Access',
      description: 'Users can access resources for their company only',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'entity.companyId',
          operator: 'equals',
          value: 'user.companyId',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          permissions: ['view'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'deny',
          target: 'specific_user',
          permissions: ['view'],
          isElseAction: true,
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-client-company-access',
    name: 'Client Company Access',
    description: 'Client companies can only access their own resources',
    category: 'client_portal',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Client Company Access',
      description: 'Client companies can only access their own resources',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'equals',
          value: 'client',
        },
        {
          id: generateId(),
          field: 'entity.companyId',
          operator: 'equals',
          value: 'user.companyId',
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'company',
          permissions: ['view'],
        },
      ],
      assignedRoles: ['client'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Sub-Contractor Templates
  {
    id: 'template-subcontractor-project-access',
    name: 'Sub-Contractor Project Access',
    description: 'Sub-contractors can access only their assigned projects',
    category: 'project_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Sub-Contractor Project Access',
      description: 'Sub-contractors can access only their assigned projects',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'equals',
          value: 'sub_contractor',
        },
        {
          id: generateId(),
          field: 'entity.projectId',
          operator: 'in',
          value: 'user.projectIds',
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'project',
          permissions: ['view'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'deny',
          target: 'specific_user',
          entityType: 'project',
          permissions: ['view'],
          isElseAction: true,
        },
      ],
      assignedRoles: ['sub_contractor'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-subcontractor-files-limited',
    name: 'Sub-Contractor Limited File Access',
    description: 'Sub-contractors can view and download but not delete files',
    category: 'file_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Sub-Contractor Limited File Access',
      description: 'Sub-contractors can view and download but not delete files',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'equals',
          value: 'sub_contractor',
        },
        {
          id: generateId(),
          field: 'file.projectId',
          operator: 'in',
          value: 'user.projectIds',
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'file',
          permissions: ['view', 'download'],
        },
      ],
      assignedRoles: ['sub_contractor'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Consultant Templates
  {
    id: 'template-consultant-read-only',
    name: 'Consultant Read-Only Access',
    description: 'Consultants have read-only access to assigned projects',
    category: 'project_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Consultant Read-Only Access',
      description: 'Consultants have read-only access to assigned projects',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'equals',
          value: 'consultant',
        },
        {
          id: generateId(),
          field: 'entity.projectId',
          operator: 'in',
          value: 'user.projectIds',
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'project',
          permissions: ['view'],
        },
      ],
      assignedRoles: ['consultant'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Professional Templates
  {
    id: 'template-professional-standard-access',
    name: 'Professional Standard Access',
    description: 'Professional users have standard view and edit access',
    category: 'custom',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Professional Standard Access',
      description: 'Professional users have standard view and edit access',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'equals',
          value: 'professional',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          permissions: ['view', 'edit'],
        },
      ],
      assignedRoles: ['professional'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Date-Based Templates
  {
    id: 'template-recent-projects-only',
    name: 'Recent Projects Only',
    description: 'Restrict access to projects started in the last year',
    category: 'project_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Recent Projects Only',
      description: 'Restrict access to projects started in the last year',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'project.startDate',
          operator: 'greater_than',
          value: '365_days_ago',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'project_members',
          entityType: 'project',
          permissions: ['view'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'deny',
          target: 'project_members',
          entityType: 'project',
          permissions: ['view'],
          isElseAction: true,
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-upcoming-project-access',
    name: 'Upcoming Project Access',
    description: 'Allow access to projects starting in the next 30 days',
    category: 'project_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Upcoming Project Access',
      description: 'Allow access to projects starting in the next 30 days',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'project.startDate',
          operator: 'less_than',
          value: '30_days_from_now',
        },
        {
          id: generateId(),
          field: 'project.startDate',
          operator: 'greater_than',
          value: 'today',
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'project_members',
          entityType: 'project',
          permissions: ['view'],
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Progress-Based Templates
  {
    id: 'template-completed-project-archive',
    name: 'Completed Project Archive',
    description: 'Completed projects are read-only for most users',
    category: 'project_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Completed Project Archive',
      description: 'Completed projects are read-only for most users',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'project.status',
          operator: 'equals',
          value: 'completed',
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'not_in',
          value: ['super_admin', 'admin'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'project',
          permissions: ['view'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'project',
          permissions: ['view', 'edit', 'delete'],
          isElseAction: true,
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-high-progress-project-access',
    name: 'High Progress Project Access',
    description: 'Full access to projects with progress over 75%',
    category: 'project_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'High Progress Project Access',
      description: 'Full access to projects with progress over 75%',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'project.progress',
          operator: 'greater_than',
          value: '75',
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['admin', 'project_manager'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'project',
          permissions: ['view', 'edit'],
        },
      ],
      assignedRoles: ['admin', 'project_manager'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Priority-Based Templates
  {
    id: 'template-high-priority-full-access',
    name: 'High Priority Full Access',
    description: 'High priority projects get full access for managers',
    category: 'project_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'High Priority Full Access',
      description: 'High priority projects get full access for managers',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'project.priority',
          operator: 'greater_than',
          value: '7',
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['admin', 'project_manager'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'project',
          permissions: ['view', 'edit', 'delete'],
        },
      ],
      assignedRoles: ['admin', 'project_manager'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Invoice Status Templates
  {
    id: 'template-paid-invoice-archive',
    name: 'Paid Invoice Archive',
    description: 'Paid invoices are read-only',
    category: 'financial',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Paid Invoice Archive',
      description: 'Paid invoices are read-only',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'invoice.isPaid',
          operator: 'equals',
          value: true,
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'not_in',
          value: ['super_admin', 'admin'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'invoice',
          permissions: ['view'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'invoice',
          permissions: ['view', 'edit'],
          isElseAction: true,
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-due-invoice-access',
    name: 'Due Invoice Access',
    description: 'Project managers can view invoices due soon for their projects',
    category: 'financial',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Due Invoice Access',
      description: 'Project managers can view invoices due soon for their projects',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'invoice.dueDate',
          operator: 'less_than',
          value: '7_days_from_now',
        },
        {
          id: generateId(),
          field: 'invoice.dueDate',
          operator: 'greater_than',
          value: 'today',
          logicalOperator: 'AND',
        },
        {
          id: generateId(),
          field: 'invoice.projectId',
          operator: 'in',
          value: 'user.projectIds',
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'invoice',
          permissions: ['view'],
        },
      ],
      assignedRoles: ['project_manager'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Opportunity Stage Templates
  {
    id: 'template-negotiation-stage-access',
    name: 'Negotiation Stage Access',
    description: 'Full access to opportunities in negotiation stage',
    category: 'custom',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Negotiation Stage Access',
      description: 'Full access to opportunities in negotiation stage',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'opportunity.stage',
          operator: 'equals',
          value: 'negotiation',
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['admin', 'project_manager'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'opportunity',
          permissions: ['view', 'edit'],
        },
      ],
      assignedRoles: ['admin', 'project_manager'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-high-probability-opportunity',
    name: 'High Probability Opportunity Access',
    description: 'Full access to opportunities with high win probability',
    category: 'custom',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'High Probability Opportunity Access',
      description: 'Full access to opportunities with high win probability',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'opportunity.probability',
          operator: 'greater_than',
          value: '70',
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['admin', 'project_manager'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'opportunity',
          permissions: ['view', 'edit'],
        },
      ],
      assignedRoles: ['admin', 'project_manager'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Company Size Templates
  {
    id: 'template-large-company-access',
    name: 'Large Company Access',
    description: 'Special access rules for large company clients',
    category: 'client_portal',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Large Company Access',
      description: 'Special access rules for large company clients',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'company.size',
          operator: 'equals',
          value: 'large',
        },
        {
          id: generateId(),
          field: 'user.companyId',
          operator: 'equals',
          value: 'company.id',
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          permissions: ['view', 'edit'],
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Email Domain Templates
  {
    id: 'template-company-email-domain',
    name: 'Company Email Domain Access',
    description: 'Users with company email domain get company access',
    category: 'custom',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Company Email Domain Access',
      description: 'Users with company email domain get company access',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.email',
          operator: 'contains',
          value: '@company.com',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          permissions: ['view'],
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Last Login Templates
  {
    id: 'template-recent-login-access',
    name: 'Recent Login Access',
    description: 'Users who logged in recently get full access',
    category: 'custom',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Recent Login Access',
      description: 'Users who logged in recently get full access',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.lastLoginAt',
          operator: 'greater_than',
          value: '30_days_ago',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          permissions: ['view', 'edit'],
        },
      ],
      elseActions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          permissions: ['view'],
          isElseAction: true,
        },
      ],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  // Multi-Condition Templates
  {
    id: 'template-admin-or-manager-project',
    name: 'Admin or Manager Project Access',
    description: 'Admins or project managers assigned to project get full access',
    category: 'project_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Admin or Manager Project Access',
      description: 'Admins or project managers assigned to project get full access',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['admin', 'project_manager'],
        },
        {
          id: generateId(),
          field: 'project.assignedManagerId',
          operator: 'equals',
          value: 'user.id',
          logicalOperator: 'OR',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'project',
          permissions: ['view', 'edit', 'delete'],
        },
      ],
      assignedRoles: ['admin', 'project_manager'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
  {
    id: 'template-budget-and-status-access',
    name: 'Budget and Status Based Access',
    description: 'Access based on both budget threshold and project status',
    category: 'project_access',
    usageCount: 0,
    isSystem: true,
    rule: {
      name: 'Budget and Status Based Access',
      description: 'Access based on both budget threshold and project status',
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: [
        {
          id: generateId(),
          field: 'project.budget',
          operator: 'greater_than',
          value: '50000',
        },
        {
          id: generateId(),
          field: 'project.status',
          operator: 'equals',
          value: 'in_progress',
          logicalOperator: 'AND',
        },
        {
          id: generateId(),
          field: 'user.role',
          operator: 'in',
          value: ['admin', 'project_manager'],
          logicalOperator: 'AND',
        },
      ],
      actions: [
        {
          id: generateId(),
          type: 'allow',
          target: 'specific_user',
          entityType: 'project',
          permissions: ['view', 'edit'],
        },
      ],
      assignedRoles: ['admin', 'project_manager'],
      createdBy: 'system',
      lastModifiedBy: 'system',
    },
  },
];

export const usePermissionRulesStore = create<PermissionRulesState>((set, get) => ({
  rules: [],
  templates: defaultTemplates,
  auditLogs: [],
  activeRuleId: null,
  
  addRule: (ruleData: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRule: PermissionRule = {
      ...ruleData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      rules: [...state.rules, newRule],
      auditLogs: [
        ...state.auditLogs,
        {
          id: generateId(),
          userId: ruleData.createdBy,
          userName: 'Current User',
          action: 'create',
          ruleId: newRule.id,
          ruleName: newRule.name,
          targetType: 'rule',
          targetId: newRule.id,
          timestamp: new Date(),
        },
      ],
    }));
    
    return newRule;
  },
  
  updateRule: (id, updates) => {
    set((state) => {
      const rule = state.rules.find((r) => r.id === id);
      if (!rule) return state;
      
      const updatedRule = {
        ...rule,
        ...updates,
        updatedAt: new Date(),
      };
      
      return {
        rules: state.rules.map((r) => (r.id === id ? updatedRule : r)),
        auditLogs: [
          ...state.auditLogs,
          {
            id: generateId(),
            userId: updates.lastModifiedBy || rule.lastModifiedBy,
            userName: 'Current User',
            action: 'update',
            ruleId: id,
            ruleName: updatedRule.name,
            targetType: 'rule',
            targetId: id,
            changes: Object.keys(updates).reduce((acc, key) => {
              acc[key] = { from: rule[key as keyof PermissionRule], to: updates[key as keyof PermissionRule] };
              return acc;
            }, {} as Record<string, { from: unknown; to: unknown }>),
            timestamp: new Date(),
          },
        ],
      };
    });
  },
  
  deleteRule: (id) => {
    set((state) => {
      const rule = state.rules.find((r) => r.id === id);
      return {
        rules: state.rules.filter((r) => r.id !== id),
        auditLogs: rule
          ? [
              ...state.auditLogs,
              {
                id: generateId(),
                userId: rule.lastModifiedBy,
                userName: 'Current User',
                action: 'delete',
                ruleId: id,
                ruleName: rule.name,
                targetType: 'rule',
                targetId: id,
                timestamp: new Date(),
              },
            ]
          : state.auditLogs,
      };
    });
  },
  
  activateRule: (id) => {
    get().updateRule(id, { status: 'active', lastModifiedBy: 'current-user' });
    set((state) => ({
      auditLogs: [
        ...state.auditLogs,
        {
          id: generateId(),
          userId: 'current-user',
          userName: 'Current User',
          action: 'activate',
          ruleId: id,
          targetType: 'rule',
          targetId: id,
          timestamp: new Date(),
        },
      ],
    }));
  },
  
  deactivateRule: (id) => {
    get().updateRule(id, { status: 'inactive', lastModifiedBy: 'current-user' });
    set((state) => ({
      auditLogs: [
        ...state.auditLogs,
        {
          id: generateId(),
          userId: 'current-user',
          userName: 'Current User',
          action: 'deactivate',
          ruleId: id,
          targetType: 'rule',
          targetId: id,
          timestamp: new Date(),
        },
      ],
    }));
  },
  
  duplicateRule: (id) => {
    const rule = get().rules.find((r) => r.id === id);
    if (!rule) throw new Error('Rule not found');
    
    const duplicated = {
      ...rule,
      name: `${rule.name} (Copy)`,
      status: 'draft' as const,
      createdBy: 'current-user',
      lastModifiedBy: 'current-user',
    };
    
    return get().addRule(duplicated);
  },
  
  addTemplate: (templateData) => {
    const newTemplate: PermissionTemplate = {
      ...templateData,
      id: generateId(),
      usageCount: 0,
    };
    
    set((state) => ({
      templates: [...state.templates, newTemplate],
    }));
    
    return newTemplate;
  },
  
  createRuleFromTemplate: (templateId) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) throw new Error('Template not found');
    
    const newRule = {
      ...template.rule,
      name: `${template.name} (from template)`,
      status: 'draft' as const,
      createdBy: 'current-user',
      lastModifiedBy: 'current-user',
    };
    
    const rule = get().addRule(newRule);
    
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
      ),
    }));
    
    return rule;
  },
  
  addAuditLog: (logData) => {
    const newLog: PermissionAuditLog = {
      ...logData,
      id: generateId(),
      timestamp: new Date(),
    };
    
    set((state) => ({
      auditLogs: [newLog, ...state.auditLogs].slice(0, 1000), // Keep last 1000 logs
    }));
  },
  
  getAuditLogs: (filters) => {
    const { auditLogs } = get();
    if (!filters) return auditLogs;
    
    return auditLogs.filter((log) => {
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.ruleId && log.ruleId !== filters.ruleId) return false;
      if (filters.action && log.action !== filters.action) return false;
      return true;
    });
  },
  
  setActiveRule: (id) => set({ activeRuleId: id }),
  
  getRule: (id) => get().rules.find((r) => r.id === id),
  
  getRulesForRole: (role) => {
    return get().rules.filter(
      (r) => r.status === 'active' && (r.assignedRoles?.includes(role) || !r.assignedRoles?.length)
    );
  },
  
  getRulesForUser: (userId) => {
    return get().rules.filter(
      (r) => r.status === 'active' && (r.assignedUsers?.includes(userId) || !r.assignedUsers?.length)
    );
  },
  
  evaluatePermission: (context) => {
    const { rules } = get();
    const activeRules = rules
      .filter((r) => r.status === 'active')
      .sort((a, b) => b.priority - a.priority);
    
    for (const rule of activeRules) {
      // Check if rule applies to user's role
      if (rule.assignedRoles && !rule.assignedRoles.includes(context.user.role)) {
        continue;
      }
      
      // Check if rule applies to specific user
      if (rule.assignedUsers && !rule.assignedUsers.includes(context.user.id)) {
        continue;
      }
      
      // Evaluate conditions
      const conditionsMatch = evaluateConditions(rule.conditions, context);
      
      if (conditionsMatch) {
        // Check if any action allows the requested permission
        for (const action of rule.actions) {
          if (actionMatches(action, context)) {
            return {
              allowed: action.type === 'allow' || action.type === 'setFileVisibility' || action.type === 'grantAccess',
              reason: `Matched rule: ${rule.name}`,
              matchedRule: rule.id,
              grantedPermissions: action.permissions,
            };
          }
        }
      }
    }
    
    return {
      allowed: false,
      reason: 'No matching rule found',
    };
  },
}));

// Helper function to evaluate conditions
function evaluateConditions(
  conditions: RuleCondition[],
  context: PermissionEvaluationContext
): boolean {
  if (conditions.length === 0) return true;
  
  let result = evaluateCondition(conditions[0], context);
  
  for (let i = 1; i < conditions.length; i++) {
    const condition = conditions[i];
    const conditionResult = evaluateCondition(condition, context);
    
    if (condition.logicalOperator === 'OR') {
      result = result || conditionResult;
    } else {
      result = result && conditionResult;
    }
  }
  
  return result;
}

function evaluateCondition(
  condition: RuleCondition,
  context: PermissionEvaluationContext
): boolean {
  const fieldValue = getFieldValue(condition.field, context);
  const conditionValue = condition.value;
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === conditionValue;
    case 'not_equals':
      return fieldValue !== conditionValue;
    case 'contains':
      return String(fieldValue).includes(String(conditionValue));
    case 'not_contains':
      return !String(fieldValue).includes(String(conditionValue));
    case 'in':
      if (Array.isArray(conditionValue)) {
        return conditionValue.includes(fieldValue);
      }
      return false;
    case 'not_in':
      if (Array.isArray(conditionValue)) {
        return !conditionValue.includes(fieldValue);
      }
      return true;
    case 'greater_than':
      return Number(fieldValue) > Number(conditionValue);
    case 'less_than':
      return Number(fieldValue) < Number(conditionValue);
    case 'greater_than_or_equal':
      return Number(fieldValue) >= Number(conditionValue);
    case 'less_than_or_equal':
      return Number(fieldValue) <= Number(conditionValue);
    case 'is_empty':
      return !fieldValue || String(fieldValue).trim() === '';
    case 'is_not_empty':
      return !!fieldValue && String(fieldValue).trim() !== '';
    case 'starts_with':
      return String(fieldValue).startsWith(String(conditionValue));
    case 'ends_with':
      return String(fieldValue).endsWith(String(conditionValue));
    default:
      return false;
  }
}

function getFieldValue(field: string, context: PermissionEvaluationContext): unknown {
  const parts = field.split('.');
  let value: unknown = context;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }
  
  return value;
}

function actionMatches(
  action: RuleAction,
  context: PermissionEvaluationContext
): boolean {
  if (action.entityType && context.entity?.type !== action.entityType) {
    return false;
  }
  
  if (action.entityId && context.entity?.id !== action.entityId) {
    return false;
  }
  
  if (action.target === 'specific_user' && action.targetId && context.user.id !== action.targetId) {
    return false;
  }
  
  return true;
}

