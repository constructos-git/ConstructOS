import { X, Plus, HelpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Tooltip from '@/components/ui/Tooltip';
import type { RuleAction, ActionType, ActionTarget, EntityType } from '@/types/permissionRules';

interface ActionBlockProps {
  action: RuleAction;
  onUpdate: (action: RuleAction) => void;
  onDelete: () => void;
  onAddAction?: () => void;
}

const actionTypeOptions: {
  value: ActionType;
  label: string;
  description: string;
  tooltip: string;
}[] = [
  {
    value: 'allow',
    label: 'Allow',
    description: 'Grant permission to perform an action',
    tooltip:
      'Allows the user to perform the specified action. This is a positive permission grant.',
  },
  {
    value: 'deny',
    label: 'Deny',
    description: 'Explicitly deny permission',
    tooltip:
      'Explicitly denies access. Use this to block specific actions even if other rules might allow them.',
  },
  {
    value: 'setFileVisibility',
    label: 'Set File Visibility',
    description: 'Control who can see a file',
    tooltip:
      'Sets whether a file is visible to specific users or roles. Perfect for file sharing permissions.',
  },
  {
    value: 'grantAccess',
    label: 'Grant Access',
    description: 'Grant access to a resource',
    tooltip:
      'Grants general access to a resource. More flexible than "allow" as it can apply to multiple resource types.',
  },
  {
    value: 'revokeAccess',
    label: 'Revoke Access',
    description: 'Remove access to a resource',
    tooltip: 'Revokes previously granted access. Useful for removing permissions dynamically.',
  },
  {
    value: 'setFieldEditable',
    label: 'Set Field Editable',
    description: 'Make a field editable',
    tooltip: 'Makes specific fields editable for the user. Useful for granular form control.',
  },
  {
    value: 'setFieldReadOnly',
    label: 'Set Field Read Only',
    description: 'Make a field read-only',
    tooltip: 'Makes specific fields read-only. Users can view but not edit these fields.',
  },
];

const targetOptions: { value: ActionTarget; label: string; tooltip: string }[] = [
  {
    value: 'any_user',
    label: 'Any User',
    tooltip: 'Applies to all users in the system. Use with caution as this grants broad access.',
  },
  {
    value: 'specific_user',
    label: 'Specific User',
    tooltip: 'Applies to a single, specific user. Enter the user ID in the Target ID field below.',
  },
  {
    value: 'role',
    label: 'Role',
    tooltip:
      'Applies to all users with a specific role (e.g., all Project Managers). Enter the role name in Target ID.',
  },
  {
    value: 'company',
    label: 'Company',
    tooltip:
      'Applies to all users belonging to a specific company. Enter the company ID in Target ID.',
  },
  {
    value: 'project_members',
    label: 'Project Members',
    tooltip:
      'Applies to all members of a specific project. Automatically includes all users assigned to that project.',
  },
  {
    value: 'clients',
    label: 'Clients',
    tooltip: 'Applies to all users with the "Client" role. Useful for client portal access rules.',
  },
];

const entityTypeOptions: { value: EntityType; label: string }[] = [
  { value: 'file', label: 'File' },
  { value: 'project', label: 'Project' },
  { value: 'company', label: 'Company' },
  { value: 'contact', label: 'Contact' },
  { value: 'opportunity', label: 'Opportunity' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'estimate', label: 'Estimate' },
  { value: 'message', label: 'Message' },
  { value: 'email', label: 'Email' },
];

const permissionOptions = [
  { value: 'view', label: 'View' },
  { value: 'edit', label: 'Edit' },
  { value: 'delete', label: 'Delete' },
  { value: 'share', label: 'Share' },
  { value: 'download', label: 'Download' },
  { value: 'upload', label: 'Upload' },
  { value: 'comment', label: 'Comment' },
  { value: 'approve', label: 'Approve' },
];

export default function ActionBlock({ action, onUpdate, onDelete, onAddAction }: ActionBlockProps) {
  const needsTargetId = ['specific_user', 'role', 'company'].includes(action.target);
  const needsEntityType = ['setFileVisibility', 'grantAccess', 'revokeAccess'].includes(
    action.type
  );
  const needsPermissions = ['allow', 'grantAccess'].includes(action.type);

  const handleTypeChange = (type: ActionType) => {
    onUpdate({ ...action, type });
  };

  const handleTargetChange = (target: ActionTarget) => {
    onUpdate({ ...action, target, targetId: undefined });
  };

  const handleTargetIdChange = (targetId: string) => {
    onUpdate({ ...action, targetId });
  };

  const handleEntityTypeChange = (entityType: EntityType) => {
    onUpdate({ ...action, entityType });
  };

  const handleEntityIdChange = (entityId: string) => {
    onUpdate({ ...action, entityId });
  };

  const handlePermissionsChange = (permissions: string[]) => {
    onUpdate({ ...action, permissions });
  };

  return (
    <div className="rounded-lg border-2 border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-950">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
              THEN
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 flex items-center gap-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Action Type
                </label>
                <Tooltip
                  content={
                    actionTypeOptions.find((opt) => opt.value === action.type)?.tooltip ||
                    'Select the type of action to perform'
                  }
                >
                  <HelpCircle className="h-3 w-3 text-gray-500" />
                </Tooltip>
              </div>
              <Select
                value={action.type}
                onChange={(e) => handleTypeChange(e.target.value as ActionType)}
                options={actionTypeOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
              />
              {actionTypeOptions.find((opt) => opt.value === action.type)?.description && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {actionTypeOptions.find((opt) => opt.value === action.type)?.description}
                </p>
              )}
            </div>

            <div>
              <div className="mb-1 flex items-center gap-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Target
                </label>
                <Tooltip
                  content={
                    targetOptions.find((opt) => opt.value === action.target)?.tooltip ||
                    'Select who this action applies to'
                  }
                >
                  <HelpCircle className="h-3 w-3 text-gray-500" />
                </Tooltip>
              </div>
              <Select
                value={action.target}
                onChange={(e) => handleTargetChange(e.target.value as ActionTarget)}
                options={targetOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
              />
              {targetOptions.find((opt) => opt.value === action.target)?.tooltip && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {targetOptions.find((opt) => opt.value === action.target)?.tooltip}
                </p>
              )}
            </div>

            {needsTargetId && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Target ID/Name
                </label>
                <Input
                  value={action.targetId || ''}
                  onChange={(e) => handleTargetIdChange(e.target.value)}
                  placeholder="Enter target ID or name"
                />
              </div>
            )}

            {needsEntityType && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Entity Type
                </label>
                <Select
                  value={action.entityType || 'file'}
                  onChange={(e) => handleEntityTypeChange(e.target.value as EntityType)}
                  options={entityTypeOptions}
                />
              </div>
            )}

            {action.entityType && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Entity ID (optional)
                </label>
                <Input
                  value={action.entityId || ''}
                  onChange={(e) => handleEntityIdChange(e.target.value)}
                  placeholder="Leave empty for all entities"
                />
              </div>
            )}

            {needsPermissions && (
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Permissions
                </label>
                <div className="flex flex-wrap gap-2">
                  {permissionOptions.map((perm) => (
                    <label
                      key={perm.value}
                      className="flex cursor-pointer items-center gap-2 rounded border px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <input
                        type="checkbox"
                        checked={action.permissions?.includes(perm.value) || false}
                        onChange={(e) => {
                          const current = action.permissions || [];
                          if (e.target.checked) {
                            handlePermissionsChange([...current, perm.value]);
                          } else {
                            handlePermissionsChange(current.filter((p) => p !== perm.value));
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {onAddAction && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddAction}
              className="h-8 w-8 p-0"
              title="Add action"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            title="Remove action"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
