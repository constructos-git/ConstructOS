export type ConditionOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'starts_with'
  | 'ends_with';

export type LogicalOperator = 'AND' | 'OR';

export type ConditionField = 
  // User Fields
  | 'user.role'
  | 'user.id'
  | 'user.email'
  | 'user.name'
  | 'user.companyId'
  | 'user.department'
  | 'user.hasProjectAccess'
  | 'user.isActive'
  | 'user.createdAt'
  | 'user.lastLoginAt'
  // Entity Fields
  | 'entity.type'
  | 'entity.id'
  | 'entity.name'
  | 'entity.projectId'
  | 'entity.companyId'
  | 'entity.isClientVisible'
  | 'entity.assignedUserId'
  | 'entity.status'
  | 'entity.createdAt'
  | 'entity.updatedAt'
  | 'entity.priority'
  // File Fields
  | 'file.projectId'
  | 'file.name'
  | 'file.type'
  | 'file.size'
  | 'file.isClientVisible'
  | 'file.ownerId'
  | 'file.uploadedAt'
  | 'file.category'
  | 'file.tags'
  // Project Fields
  | 'project.clientCompanyId'
  | 'project.name'
  | 'project.assignedManagerId'
  | 'project.status'
  | 'project.budget'
  | 'project.startDate'
  | 'project.endDate'
  | 'project.progress'
  | 'project.priority'
  | 'project.isActive'
  // Opportunity Fields
  | 'opportunity.stage'
  | 'opportunity.value'
  | 'opportunity.probability'
  | 'opportunity.expectedCloseDate'
  | 'opportunity.source'
  | 'opportunity.status'
  // Invoice Fields
  | 'invoice.amount'
  | 'invoice.status'
  | 'invoice.dueDate'
  | 'invoice.projectId'
  | 'invoice.companyId'
  | 'invoice.isPaid'
  // Company Fields
  | 'company.type'
  | 'company.industry'
  | 'company.size'
  | 'company.isActive';

export type ActionType = 
  | 'allow'
  | 'deny'
  | 'setFileVisibility'
  | 'grantAccess'
  | 'revokeAccess'
  | 'setFieldEditable'
  | 'setFieldReadOnly';

export type ActionTarget = 
  | 'any_user'
  | 'specific_user'
  | 'role'
  | 'company'
  | 'project_members'
  | 'clients';

export type EntityType = 
  | 'file'
  | 'project'
  | 'company'
  | 'contact'
  | 'opportunity'
  | 'invoice'
  | 'estimate'
  | 'message'
  | 'email';

export interface RuleCondition {
  id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: unknown;
  logicalOperator?: LogicalOperator; // AND/OR for chaining conditions
  conditionGroupId?: string; // For nested groups
  groupLogic?: LogicalOperator; // Logic for the group (AND/OR)
}

export interface RuleAction {
  id: string;
  type: ActionType;
  target: ActionTarget;
  targetId?: string; // For specific_user, role, company, etc.
  entityType?: EntityType;
  entityId?: string; // For specific entity access
  permissions?: string[]; // Specific permissions to grant
  actionSequence?: number; // Order of execution for multiple actions
  isElseAction?: boolean; // True if this is an ELSE branch action
}

export type RuleType = 'simple' | 'workflow';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'group' | 'action' | 'branch';
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  data?: Record<string, unknown>; // Node-specific data
  connections?: {
    source?: string[]; // Node IDs this connects from
    target?: string[]; // Node IDs this connects to
    truePath?: string; // Node ID for true branch
    falsePath?: string; // Node ID for false branch
  };
}

export interface PermissionRule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number; // Higher priority rules are evaluated first
  ruleType: RuleType; // 'simple' or 'workflow'
  conditions: RuleCondition[];
  actions: RuleAction[];
  elseActions?: RuleAction[]; // Actions for ELSE branch
  assignedRoles?: string[]; // Which roles this rule applies to
  assignedUsers?: string[]; // Specific users this rule applies to
  // Workflow-specific data
  workflowNodes?: WorkflowNode[]; // Canvas node positions and connections
  workflowConnections?: Array<{
    id: string;
    source: string;
    target: string;
    type: 'true' | 'false' | 'default';
  }>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'file_access' | 'project_access' | 'client_portal' | 'financial' | 'communication' | 'custom';
  rule: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt'>;
  usageCount: number;
  isSystem: boolean;
}

export interface PermissionAuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'activate' | 'deactivate' | 'apply';
  ruleId?: string;
  ruleName?: string;
  targetType: 'rule' | 'template' | 'permission' | 'user_permission';
  targetId?: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface PermissionEvaluationContext {
  user: {
    id: string;
    role: string;
    companyId?: string;
    projectIds?: string[];
  };
  entity?: {
    type: EntityType;
    id: string;
    projectId?: string;
    companyId?: string;
    assignedUserId?: string;
    isClientVisible?: boolean;
    ownerId?: string;
  };
  action: string;
  requestedPermission?: string;
}

export interface PermissionEvaluationResult {
  allowed: boolean;
  reason?: string;
  matchedRule?: string;
  grantedPermissions?: string[];
}

