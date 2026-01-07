import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, HelpCircle, Lightbulb, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import { getFieldInfo, getFieldsByCategory } from '@/lib/fieldHelpers';
import type {
  PermissionRule,
  RuleCondition,
  RuleAction,
  ConditionField,
  ConditionOperator,
  ActionType,
  ActionTarget,
} from '@/types/permissionRules';

interface WorkflowWizardProps {
  rule?: PermissionRule;
  onSave: (rule: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

type WizardStep = 'intro' | 'who' | 'what' | 'when' | 'then' | 'else' | 'review';

interface WizardState {
  step: WizardStep;
  ruleName: string;
  description: string;
  targetRoles: string[];
  conditions: RuleCondition[];
  actions: RuleAction[];
  elseActions: RuleAction[];
  aiSuggestions: string[];
}

const roleOptions = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'sub_contractor', label: 'Sub-Contractor' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'professional', label: 'Professional' },
  { value: 'client', label: 'Client' },
];

// Get all fields from fieldHelpers
const fieldsByCategory = getFieldsByCategory();
const fieldOptions = Object.entries(fieldsByCategory).flatMap(([category, fields]) =>
  fields.map((field) => {
    const info = getFieldInfo(field);
    return { value: field, label: info.label, category, description: info.description, tooltip: info.tooltip };
  })
);

const operatorOptions: { value: ConditionOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
];

const actionTypeOptions: { value: ActionType; label: string }[] = [
  { value: 'allow', label: 'Allow Access' },
  { value: 'deny', label: 'Deny Access' },
  { value: 'setFileVisibility', label: 'Set File Visibility' },
  { value: 'grantAccess', label: 'Grant Access' },
];

const targetOptions: { value: ActionTarget; label: string }[] = [
  { value: 'any_user', label: 'Any User' },
  { value: 'specific_user', label: 'Specific User' },
  { value: 'role', label: 'Role' },
  { value: 'project_members', label: 'Project Members' },
];

// AI-powered suggestions based on context
function generateAISuggestions(step: WizardStep, state: WizardState): string[] {
  const suggestions: string[] = [];

  switch (step) {
    case 'who':
      if (state.targetRoles.length > 0) {
        suggestions.push(`Based on selected roles, consider adding conditions for ${state.targetRoles.join(' or ')} users.`);
      }
      break;
    case 'what':
      if (state.conditions.length > 0) {
        const lastCondition = state.conditions[state.conditions.length - 1];
        suggestions.push(`You're checking ${lastCondition.field}. Consider adding a related condition for better control.`);
      }
      break;
    case 'then':
      if (state.conditions.length > 0 && state.actions.length === 0) {
        suggestions.push('Based on your conditions, consider granting "view" and "edit" permissions.');
      }
      break;
  }

  return suggestions;
}

export default function WorkflowWizard({ rule, onSave, onCancel }: WorkflowWizardProps) {
  const [state, setState] = useState<WizardState>({
    step: 'intro',
    ruleName: rule?.name || '',
    description: rule?.description || '',
    targetRoles: rule?.assignedRoles || [],
    conditions: rule?.conditions || [],
    actions: rule?.actions || [],
    elseActions: rule?.elseActions || [],
    aiSuggestions: [],
  });

  const steps: { id: WizardStep; title: string; description: string }[] = [
    { id: 'intro', title: 'Welcome', description: 'Let\'s build your permission rule step by step' },
    { id: 'who', title: 'Who', description: 'Which users or roles does this apply to?' },
    { id: 'what', title: 'What', description: 'What conditions need to be met?' },
    { id: 'when', title: 'When', description: 'Additional conditions (optional)' },
    { id: 'then', title: 'Then', description: 'What actions should be allowed?' },
    { id: 'else', title: 'Else', description: 'What happens if conditions fail? (optional)' },
    { id: 'review', title: 'Review', description: 'Review and save your rule' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === state.step);

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      const nextStepId = steps[nextIndex].id;
      const suggestions = generateAISuggestions(nextStepId, state);
      setState({ ...state, step: nextStepId, aiSuggestions: suggestions });
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setState({ ...state, step: steps[prevIndex].id });
    }
  };

  const handleSave = () => {
    if (!state.ruleName.trim()) {
      alert('Please enter a rule name');
      return;
    }

    const ruleData: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt'> = {
      name: state.ruleName,
      description: state.description,
      status: 'draft',
      priority: 100,
      ruleType: 'simple',
      conditions: state.conditions,
      actions: state.actions,
      elseActions: state.elseActions.length > 0 ? state.elseActions : undefined,
      assignedRoles: state.targetRoles.length > 0 ? state.targetRoles : undefined,
      createdBy: rule?.createdBy || 'current-user',
      lastModifiedBy: 'current-user',
    };

    onSave(ruleData);
  };

  const renderStep = () => {
    switch (state.step) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="mx-auto h-16 w-16 text-primary-600" />
              <h2 className="mt-4 text-2xl font-bold">Permission Rule Wizard</h2>
              <p className="mt-2 text-muted-foreground">
                I'll guide you through creating a custom permission rule step by step.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>What would you like to name this rule?</CardTitle>
                <CardDescription>Give your rule a descriptive name</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Rule Name"
                  value={state.ruleName}
                  onChange={(e) => setState({ ...state, ruleName: e.target.value })}
                  placeholder="e.g., Admin File Sharing"
                />
                <Textarea
                  label="Description (Optional)"
                  value={state.description}
                  onChange={(e) => setState({ ...state, description: e.target.value })}
                  placeholder="Describe what this rule does..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'who':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Who does this rule apply to?</CardTitle>
                  <Tooltip content="Select the roles or users that this permission rule will affect">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  </Tooltip>
                </div>
                <CardDescription>Select one or more roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {roleOptions.map((role) => (
                    <label
                      key={role.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-3 transition-all ${
                        state.targetRoles.includes(role.value)
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={state.targetRoles.includes(role.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setState({
                              ...state,
                              targetRoles: [...state.targetRoles, role.value],
                            });
                          } else {
                            setState({
                              ...state,
                              targetRoles: state.targetRoles.filter((r) => r !== role.value),
                            });
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <span>{role.label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'what':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>What condition should be checked?</CardTitle>
                  <Tooltip content="Define the condition that must be met for this rule to apply">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  </Tooltip>
                </div>
                <CardDescription>Add at least one condition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.conditions.map((condition, index) => {
                  const fieldInfo = getFieldInfo(condition.field);
                  return (
                    <div key={condition.id || index} className="rounded-lg border p-4">
                      {/* Field Info */}
                      <div className="mb-3 rounded-lg bg-blue-50 p-2 dark:bg-blue-950">
                        <div className="flex items-start gap-2">
                          <Info className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              {fieldInfo.label}
                            </div>
                            <div className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                              {fieldInfo.description}
                            </div>
                            {fieldInfo.examples.length > 0 && (
                              <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                Examples: {fieldInfo.examples.slice(0, 2).join(', ')}
                              </div>
                            )}
                          </div>
                          <Tooltip content={fieldInfo.tooltip}>
                            <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </Tooltip>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <div className="mb-1 flex items-center gap-1">
                            <label className="text-sm font-medium">Field</label>
                            <Tooltip content="Select what property to check">
                              <HelpCircle className="h-3 w-3 text-gray-500" />
                            </Tooltip>
                          </div>
                          <Select
                            value={condition.field}
                            onChange={(e) => {
                              const updated = [...state.conditions];
                              updated[index] = { ...condition, field: e.target.value as ConditionField };
                              setState({ ...state, conditions: updated });
                            }}
                            options={fieldOptions.map((f) => ({ value: f.value, label: `${f.category}: ${f.label}` }))}
                          />
                        </div>
                        <div>
                          <div className="mb-1 flex items-center gap-1">
                            <label className="text-sm font-medium">Operator</label>
                            <Tooltip content="How to compare the field value">
                              <HelpCircle className="h-3 w-3 text-gray-500" />
                            </Tooltip>
                          </div>
                          <Select
                            value={condition.operator}
                            onChange={(e) => {
                              const updated = [...state.conditions];
                              updated[index] = { ...condition, operator: e.target.value as ConditionOperator };
                              setState({ ...state, conditions: updated });
                            }}
                            options={operatorOptions}
                          />
                        </div>
                        <div>
                          <div className="mb-1 flex items-center gap-1">
                            <label className="text-sm font-medium">Value</label>
                            <Tooltip content={`Enter the value to compare. For ${fieldInfo.valueType} fields.`}>
                              <HelpCircle className="h-3 w-3 text-gray-500" />
                            </Tooltip>
                          </div>
                          {fieldInfo.valueType === 'select' && fieldInfo.options ? (
                            <Select
                              value={String(condition.value || '')}
                              onChange={(e) => {
                                const updated = [...state.conditions];
                                updated[index] = { ...condition, value: e.target.value };
                                setState({ ...state, conditions: updated });
                              }}
                              options={fieldInfo.options}
                            />
                          ) : fieldInfo.valueType === 'date' ? (
                            <Input
                              type="date"
                              value={String(condition.value || '')}
                              onChange={(e) => {
                                const updated = [...state.conditions];
                                updated[index] = { ...condition, value: e.target.value };
                                setState({ ...state, conditions: updated });
                              }}
                            />
                          ) : fieldInfo.valueType === 'number' ? (
                            <Input
                              type="number"
                              value={String(condition.value || '')}
                              onChange={(e) => {
                                const updated = [...state.conditions];
                                updated[index] = { ...condition, value: e.target.value };
                                setState({ ...state, conditions: updated });
                              }}
                              placeholder={fieldInfo.examples[0]}
                            />
                          ) : fieldInfo.valueType === 'boolean' ? (
                            <Select
                              value={String(condition.value || '')}
                              onChange={(e) => {
                                const updated = [...state.conditions];
                                updated[index] = { ...condition, value: e.target.value };
                                setState({ ...state, conditions: updated });
                              }}
                              options={[
                                { value: 'true', label: 'True' },
                                { value: 'false', label: 'False' },
                              ]}
                            />
                          ) : (
                            <Input
                              value={String(condition.value || '')}
                              onChange={(e) => {
                                const updated = [...state.conditions];
                                updated[index] = { ...condition, value: e.target.value };
                                setState({ ...state, conditions: updated });
                              }}
                              placeholder={fieldInfo.examples[0] || 'Enter value'}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <Button
                  variant="outline"
                  onClick={() => {
                    setState({
                      ...state,
                      conditions: [
                        ...state.conditions,
                        {
                          id: generateId(),
                          field: 'user.role',
                          operator: 'equals',
                          value: '',
                        },
                      ],
                    });
                  }}
                >
                  + Add Condition
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'then':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Then, what should happen?</CardTitle>
                  <Tooltip content="Define the actions that will be allowed when conditions are met">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  </Tooltip>
                </div>
                <CardDescription>Add one or more actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.actions.map((action, index) => (
                  <div key={action.id || index} className="rounded-lg border p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Select
                        label="Action Type"
                        value={action.type}
                        onChange={(e) => {
                          const updated = [...state.actions];
                          updated[index] = { ...action, type: e.target.value as ActionType };
                          setState({ ...state, actions: updated });
                        }}
                        options={actionTypeOptions}
                      />
                      <Select
                        label="Target"
                        value={action.target}
                        onChange={(e) => {
                          const updated = [...state.actions];
                          updated[index] = { ...action, target: e.target.value as ActionTarget };
                          setState({ ...state, actions: updated });
                        }}
                        options={targetOptions}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setState({
                      ...state,
                      actions: [
                        ...state.actions,
                        {
                          id: generateId(),
                          type: 'allow',
                          target: 'any_user',
                          actionSequence: state.actions.length + 1,
                        },
                      ],
                    });
                  }}
                >
                  + Add Action
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'else':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Else, what should happen?</CardTitle>
                  <Tooltip content="Optional: Define actions when conditions are NOT met">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  </Tooltip>
                </div>
                <CardDescription>These actions execute if the conditions fail</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.elseActions.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed p-8 text-center">
                    <p className="text-muted-foreground">No ELSE actions. Click below to add one.</p>
                  </div>
                ) : (
                  state.elseActions.map((action, index) => (
                    <div key={action.id || index} className="rounded-lg border p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Select
                          label="Action Type"
                          value={action.type}
                          onChange={(e) => {
                            const updated = [...state.elseActions];
                            updated[index] = { ...action, type: e.target.value as ActionType };
                            setState({ ...state, elseActions: updated });
                          }}
                          options={actionTypeOptions}
                        />
                        <Select
                          label="Target"
                          value={action.target}
                          onChange={(e) => {
                            const updated = [...state.elseActions];
                            updated[index] = { ...action, target: e.target.value as ActionTarget };
                            setState({ ...state, elseActions: updated });
                          }}
                          options={targetOptions}
                        />
                      </div>
                    </div>
                  ))
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setState({
                      ...state,
                      elseActions: [
                        ...state.elseActions,
                        {
                          id: generateId(),
                          type: 'deny',
                          target: 'any_user',
                          actionSequence: state.elseActions.length + 1,
                          isElseAction: true,
                        },
                      ],
                    });
                  }}
                >
                  + Add ELSE Action
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Rule</CardTitle>
                <CardDescription>Review all settings before saving</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">Rule Name</h4>
                  <p className="text-muted-foreground">{state.ruleName || 'Untitled Rule'}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Applies To</h4>
                  <div className="flex flex-wrap gap-2">
                    {state.targetRoles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {roleOptions.find((r) => r.value === role)?.label || role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Conditions ({state.conditions.length})</h4>
                  {state.conditions.map((c, i) => (
                    <div key={i} className="mt-2 rounded bg-gray-100 p-2 text-sm dark:bg-gray-800">
                      {c.field} {c.operator} {String(c.value)}
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold">Actions ({state.actions.length})</h4>
                  {state.actions.map((a, i) => (
                    <div key={i} className="mt-2 rounded bg-green-100 p-2 text-sm dark:bg-green-900">
                      {a.type} → {a.target}
                    </div>
                  ))}
                </div>
                {state.elseActions.length > 0 && (
                  <div>
                    <h4 className="font-semibold">ELSE Actions ({state.elseActions.length})</h4>
                    {state.elseActions.map((a, i) => (
                      <div key={i} className="mt-2 rounded bg-orange-100 p-2 text-sm dark:bg-orange-900">
                        {a.type} → {a.target}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                  index <= currentStepIndex
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {index < currentStepIndex ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div className="text-xs font-medium">{step.title}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-1 flex-1 ${
                  index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* AI Suggestions */}
      {state.aiSuggestions.length > 0 && (
        <Card className="border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <div>
                <h4 className="font-semibold text-primary-900 dark:text-primary-100">AI Suggestions</h4>
                <ul className="mt-2 space-y-1 text-sm text-primary-700 dark:text-primary-300">
                  {state.aiSuggestions.map((suggestion, i) => (
                    <li key={i}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      {renderStep()}

      {/* Navigation */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline" onClick={currentStepIndex === 0 ? onCancel : prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStepIndex === 0 ? 'Cancel' : 'Previous'}
        </Button>
        <div className="flex gap-2">
          {currentStepIndex < steps.length - 1 ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave}>
              <Check className="mr-2 h-4 w-4" />
              Save Rule
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

