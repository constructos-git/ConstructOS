import { useState } from 'react';
import { Plus, Save, Play, Code2, GitBranch, HelpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Tooltip from '@/components/ui/Tooltip';
import ConditionGroup from './ConditionGroup';
import ActionBlock from './ActionBlock';
import type {
  PermissionRule,
  RuleCondition,
  RuleAction,
  LogicalOperator,
} from '@/types/permissionRules';

interface RuleBuilderProps {
  rule?: PermissionRule;
  onSave: (rule: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  onTest?: (rule: PermissionRule) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function RuleBuilder({ rule, onSave, onCancel, onTest }: RuleBuilderProps) {
  const [name, setName] = useState(rule?.name || '');
  const [description, setDescription] = useState(rule?.description || '');
  const [status, setStatus] = useState<'active' | 'inactive' | 'draft'>(rule?.status || 'draft');
  const [priority, setPriority] = useState(rule?.priority || 100);
  const [rootGroupId] = useState(() => generateId());
  const [rootGroupLogic, setRootGroupLogic] = useState<LogicalOperator>('AND');
  const [conditions, setConditions] = useState<RuleCondition[]>(
    rule?.conditions || [
      {
        id: generateId(),
        field: 'user.role',
        operator: 'equals',
        value: '',
        conditionGroupId: rootGroupId,
      },
    ]
  );
  const [actions, setActions] = useState<RuleAction[]>(
    rule?.actions || [
      {
        id: generateId(),
        type: 'allow',
        target: 'any_user',
        actionSequence: 1,
      },
    ]
  );
  const [elseActions, setElseActions] = useState<RuleAction[]>(
    rule?.elseActions || []
  );
  const [assignedRoles, setAssignedRoles] = useState<string[]>(rule?.assignedRoles || []);

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'sub_contractor', label: 'Sub-Contractor' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'professional', label: 'Professional' },
    { value: 'client', label: 'Client' },
  ];

  const handleAddCondition = (groupId: string = rootGroupId) => {
    const newCondition: RuleCondition = {
      id: generateId(),
      field: 'user.role',
      operator: 'equals',
      value: '',
      logicalOperator: 'AND',
      conditionGroupId: groupId,
    };
    setConditions([...conditions, newCondition]);
  };

  const handleAddNestedGroup = (parentGroupId: string) => {
    const newGroupId = generateId();
    const newCondition: RuleCondition = {
      id: newGroupId,
      field: 'user.role',
      operator: 'equals',
      value: '',
      conditionGroupId: parentGroupId,
      groupLogic: 'AND',
    };
    setConditions([...conditions, newCondition]);
  };

  const handleUpdateGroupLogic = (groupId: string, logic: LogicalOperator) => {
    if (groupId === rootGroupId) {
      setRootGroupLogic(logic);
    } else {
      setConditions(
        conditions.map((c) =>
          c.id === groupId ? { ...c, groupLogic: logic } : c
        )
      );
    }
  };

  const handleUpdateCondition = (index: number, condition: RuleCondition) => {
    const updated = [...conditions];
    updated[index] = condition;
    setConditions(updated);
  };

  const handleDeleteCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleAddAction = (isElse = false) => {
    const newAction: RuleAction = {
      id: generateId(),
      type: 'allow',
      target: 'any_user',
      actionSequence: (isElse ? elseActions : actions).length + 1,
      isElseAction: isElse,
    };
    if (isElse) {
      setElseActions([...elseActions, newAction]);
    } else {
      setActions([...actions, newAction]);
    }
  };

  const handleUpdateAction = (index: number, action: RuleAction) => {
    const updated = [...actions];
    updated[index] = action;
    setActions(updated);
  };

  const handleDeleteAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a rule name');
      return;
    }

    if (conditions.length === 0) {
      alert('Please add at least one condition');
      return;
    }

    if (actions.length === 0) {
      alert('Please add at least one action');
      return;
    }

    const ruleData: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      description,
      status,
      priority,
      ruleType: 'simple',
      conditions: conditions.map((c) => ({
        ...c,
        conditionGroupId: c.conditionGroupId || rootGroupId,
      })),
      actions: actions.sort((a, b) => (a.actionSequence || 0) - (b.actionSequence || 0)),
      elseActions: elseActions.length > 0 ? elseActions.sort((a, b) => (a.actionSequence || 0) - (b.actionSequence || 0)) : undefined,
      assignedRoles: assignedRoles.length > 0 ? assignedRoles : undefined,
      createdBy: rule?.createdBy || 'current-user',
      lastModifiedBy: 'current-user',
    };

    onSave(ruleData);
  };

  const handleTest = () => {
    if (onTest && rule) {
      const testRule: PermissionRule = {
        ...rule,
        name,
        description,
        status,
        priority,
        conditions,
        actions,
        assignedRoles: assignedRoles.length > 0 ? assignedRoles : undefined,
        updatedAt: new Date(),
        lastModifiedBy: 'current-user',
      };
      onTest(testRule);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Input
            label="Rule Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Admin File Sharing"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Give your rule a clear, descriptive name so it's easy to find later.
          </p>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-1">
            <label className="block text-sm font-medium">Status</label>
            <Tooltip content="Draft: Not active yet. Active: Rule is enforced. Inactive: Rule is disabled but saved.">
              <HelpCircle className="h-3 w-3 text-gray-500" />
            </Tooltip>
          </div>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'draft')}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>
      </div>

      <div>
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this rule does..."
          rows={3}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Explain what this rule does and when it applies. This helps other admins understand the rule.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-1">
            <label className="block text-sm font-medium">Priority</label>
            <Tooltip content="Higher priority rules are evaluated first. Use 100 as default. Higher numbers = higher priority.">
              <HelpCircle className="h-3 w-3 text-gray-500" />
            </Tooltip>
          </div>
          <Input
            type="number"
            value={priority.toString()}
            onChange={(e) => setPriority(Number.parseInt(e.target.value, 10) || 100)}
            placeholder="100"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Rules with higher priority are checked first. Default: 100
          </p>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-1">
            <label className="block text-sm font-medium">Assigned Roles</label>
            <Tooltip content="Select which roles this rule applies to. Leave empty to apply to all roles (use with caution).">
              <HelpCircle className="h-3 w-3 text-gray-500" />
            </Tooltip>
          </div>
          <div className="flex flex-wrap gap-2">
            {roleOptions.map((role) => (
              <label
                key={role.value}
                className="flex cursor-pointer items-center gap-2 rounded border px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <input
                  type="checkbox"
                  checked={assignedRoles.includes(role.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAssignedRoles([...assignedRoles, role.value]);
                    } else {
                      setAssignedRoles(assignedRoles.filter((r) => r !== role.value));
                    }
                  }}
                  className="h-4 w-4"
                />
                <span>{role.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {assignedRoles.length === 0 
              ? 'No roles selected - rule will apply to all roles' 
              : `Applies to: ${assignedRoles.length} role(s)`}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold">IF Conditions</h3>
              <p className="text-sm text-muted-foreground">
                Define the conditions that must be met for this rule to apply
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="AND: All conditions must be true. OR: At least one condition must be true.">
              <select
                value={rootGroupLogic}
                onChange={(e) => setRootGroupLogic(e.target.value as LogicalOperator)}
                className="rounded border bg-white px-2 py-1 text-sm font-medium dark:bg-gray-800"
              >
                <option value="AND">All conditions (AND)</option>
                <option value="OR">Any condition (OR)</option>
              </select>
            </Tooltip>
            <Button variant="outline" size="sm" onClick={() => handleAddCondition(rootGroupId)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Condition
            </Button>
          </div>
        </div>

        <ConditionGroup
          groupId={rootGroupId}
          conditions={conditions}
          groupLogic={rootGroupLogic}
          level={0}
          onUpdateCondition={(id, updated) => {
            const index = conditions.findIndex((c) => c.id === id);
            if (index >= 0) {
              handleUpdateCondition(index, updated);
            }
          }}
          onDeleteCondition={(id) => {
            const index = conditions.findIndex((c) => c.id === id);
            if (index >= 0) {
              handleDeleteCondition(index);
            }
          }}
          onAddCondition={handleAddCondition}
          onUpdateGroupLogic={handleUpdateGroupLogic}
          onAddNestedGroup={handleAddNestedGroup}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">THEN Actions</h3>
            <p className="text-sm text-muted-foreground">
              Actions that will be executed when all conditions are met. Actions run in sequence.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleAddAction(false)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Action
          </Button>
        </div>

        <div className="space-y-3">
          {actions
            .sort((a, b) => (a.actionSequence || 0) - (b.actionSequence || 0))
            .map((action, index) => (
              <div key={action.id} className="flex items-start gap-2">
                <div className="flex h-10 items-center justify-center rounded bg-primary-100 px-3 text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  {action.actionSequence || index + 1}
                </div>
                <div className="flex-1">
                  <ActionBlock
                    action={action}
                    onUpdate={(updated) => {
                      const idx = actions.findIndex((a) => a.id === action.id);
                      if (idx >= 0) {
                        handleUpdateAction(idx, { ...updated, actionSequence: updated.actionSequence || idx + 1 });
                      }
                    }}
                    onDelete={() => {
                      const idx = actions.findIndex((a) => a.id === action.id);
                      if (idx >= 0) {
                        handleDeleteAction(idx);
                      }
                    }}
                    onAddAction={index === actions.length - 1 ? () => handleAddAction(false) : undefined}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold">ELSE Actions</h3>
              <p className="text-sm text-muted-foreground">
                Optional: Actions executed when conditions are NOT met. Useful for fallback permissions.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleAddAction(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add ELSE Action
          </Button>
        </div>

        {elseActions.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900">
            <p className="text-sm text-muted-foreground">
              No ELSE actions. Actions here will execute if the IF conditions fail.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {elseActions
              .sort((a, b) => (a.actionSequence || 0) - (b.actionSequence || 0))
              .map((action, index) => (
                <div key={action.id} className="flex items-start gap-2">
                  <div className="flex h-10 items-center justify-center rounded bg-orange-100 px-3 text-sm font-semibold text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                    {action.actionSequence || index + 1}
                  </div>
                  <div className="flex-1">
                    <ActionBlock
                      action={action}
                      onUpdate={(updated) => {
                        const idx = elseActions.findIndex((a) => a.id === action.id);
                        if (idx >= 0) {
                          const updatedActions = [...elseActions];
                          updatedActions[idx] = { ...updated, actionSequence: updated.actionSequence || idx + 1 };
                          setElseActions(updatedActions);
                        }
                      }}
                      onDelete={() => {
                        const idx = elseActions.findIndex((a) => a.id === action.id);
                        if (idx >= 0) {
                          setElseActions(elseActions.filter((_, i) => i !== idx));
                        }
                      }}
                      onAddAction={index === elseActions.length - 1 ? () => handleAddAction(true) : undefined}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {onTest && rule && (
          <Button variant="secondary" onClick={handleTest}>
            <Play className="mr-2 h-4 w-4" />
            Test Rule
          </Button>
        )}
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Rule
        </Button>
      </div>
    </div>
  );
}

