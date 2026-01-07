import { X, Plus, HelpCircle, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Tooltip from '@/components/ui/Tooltip';
import Badge from '@/components/ui/Badge';
import { getFieldInfo } from '@/lib/fieldHelpers';
import type { RuleCondition, ConditionField, ConditionOperator, LogicalOperator } from '@/types/permissionRules';

interface ConditionBlockProps {
  condition: RuleCondition;
  index: number;
  onUpdate: (condition: RuleCondition) => void;
  onDelete: () => void;
  onAddCondition?: () => void;
  showLogicalOperator?: boolean;
}

const fieldOptions: { value: ConditionField; label: string; category: string }[] = [
  { value: 'user.role', label: 'User Role', category: 'User' },
  { value: 'user.id', label: 'User ID', category: 'User' },
  { value: 'user.companyId', label: 'User Company', category: 'User' },
  { value: 'user.hasProjectAccess', label: 'Has Project Access', category: 'User' },
  { value: 'entity.type', label: 'Entity Type', category: 'Entity' },
  { value: 'entity.id', label: 'Entity ID', category: 'Entity' },
  { value: 'entity.projectId', label: 'Entity Project', category: 'Entity' },
  { value: 'entity.companyId', label: 'Entity Company', category: 'Entity' },
  { value: 'entity.isClientVisible', label: 'Is Client Visible', category: 'Entity' },
  { value: 'entity.assignedUserId', label: 'Assigned User', category: 'Entity' },
  { value: 'file.projectId', label: 'File Project', category: 'File' },
  { value: 'file.isClientVisible', label: 'File Client Visible', category: 'File' },
  { value: 'file.ownerId', label: 'File Owner', category: 'File' },
  { value: 'project.clientCompanyId', label: 'Project Client Company', category: 'Project' },
  { value: 'project.assignedManagerId', label: 'Project Manager', category: 'Project' },
  { value: 'project.status', label: 'Project Status', category: 'Project' },
  { value: 'opportunity.stage', label: 'Opportunity Stage', category: 'Opportunity' },
  { value: 'opportunity.value', label: 'Opportunity Value', category: 'Opportunity' },
];

const operatorOptions: { value: ConditionOperator; label: string; tooltip: string }[] = [
  { 
    value: 'equals', 
    label: 'Equals', 
    tooltip: 'Exact match. Use for specific values like role names, IDs, or exact text matches.' 
  },
  { 
    value: 'not_equals', 
    label: 'Not Equals', 
    tooltip: 'Not equal to. Use to exclude specific values.' 
  },
  { 
    value: 'contains', 
    label: 'Contains', 
    tooltip: 'Checks if the field contains the value. Perfect for partial text matches, email domains, or tags.' 
  },
  { 
    value: 'not_contains', 
    label: 'Not Contains', 
    tooltip: 'Checks if the field does NOT contain the value. Useful for filtering out specific patterns.' 
  },
  { 
    value: 'in', 
    label: 'In', 
    tooltip: 'Checks if the field value is in a list. Use comma-separated values like "admin,project_manager".' 
  },
  { 
    value: 'not_in', 
    label: 'Not In', 
    tooltip: 'Checks if the field value is NOT in a list. Use to exclude multiple values.' 
  },
  { 
    value: 'greater_than', 
    label: 'Greater Than', 
    tooltip: 'For numbers and dates. Checks if the field value is greater than the specified value.' 
  },
  { 
    value: 'less_than', 
    label: 'Less Than', 
    tooltip: 'For numbers and dates. Checks if the field value is less than the specified value.' 
  },
  { 
    value: 'greater_than_or_equal', 
    label: 'Greater Than or Equal', 
    tooltip: 'For numbers and dates. Checks if the field value is greater than or equal to the specified value.' 
  },
  { 
    value: 'less_than_or_equal', 
    label: 'Less Than or Equal', 
    tooltip: 'For numbers and dates. Checks if the field value is less than or equal to the specified value.' 
  },
  { 
    value: 'is_empty', 
    label: 'Is Empty', 
    tooltip: 'Checks if the field is empty or null. No value needed for this operator.' 
  },
  { 
    value: 'is_not_empty', 
    label: 'Is Not Empty', 
    tooltip: 'Checks if the field has a value (not empty or null). No value needed for this operator.' 
  },
  { 
    value: 'starts_with', 
    label: 'Starts With', 
    tooltip: 'Checks if the field value starts with the specified text. Useful for prefixes or codes.' 
  },
  { 
    value: 'ends_with', 
    label: 'Ends With', 
    tooltip: 'Checks if the field value ends with the specified text. Useful for file extensions or suffixes.' 
  },
];

const logicalOperatorOptions: { value: LogicalOperator; label: string }[] = [
  { value: 'AND', label: 'AND' },
  { value: 'OR', label: 'OR' },
];

export default function ConditionBlock({
  condition,
  index,
  onUpdate,
  onDelete,
  onAddCondition,
  showLogicalOperator = true,
}: ConditionBlockProps) {
  const fieldInfo = getFieldInfo(condition.field);
  const needsValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
  
  // Get value input based on field type
  const getValueInput = () => {
    if (fieldInfo.valueType === 'select' && fieldInfo.options) {
      return (
                          <Select
                            value={String(condition.value || '')}
                            onChange={(e) => handleValueChange(e.target.value)}
                            options={fieldInfo.options}
                          />
      );
    }
    
    if (fieldInfo.valueType === 'date') {
      return (
        <Input
          type="date"
          value={String(condition.value || '')}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder="Select date"
        />
      );
    }
    
    if (fieldInfo.valueType === 'number') {
      return (
        <Input
          type="number"
          value={String(condition.value || '')}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder="Enter number"
        />
      );
    }
    
    if (fieldInfo.valueType === 'boolean') {
      return (
        <Select
          value={String(condition.value || '')}
          onChange={(e) => handleValueChange(e.target.value)}
          options={[
            { value: 'true', label: 'True' },
            { value: 'false', label: 'False' },
          ]}
        />
      );
    }
    
    return (
      <Input
        value={String(condition.value || '')}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder={fieldInfo.examples[0] || 'Enter value'}
      />
    );
  };

  const handleFieldChange = (field: ConditionField) => {
    onUpdate({ ...condition, field });
  };

  const handleOperatorChange = (operator: ConditionOperator) => {
    onUpdate({ ...condition, operator });
  };

  const handleValueChange = (value: unknown) => {
    onUpdate({ ...condition, value });
  };

  const handleLogicalOperatorChange = (logicalOperator: LogicalOperator) => {
    onUpdate({ ...condition, logicalOperator });
  };

  return (
    <div className="relative">
      {index > 0 && showLogicalOperator && (
        <div className="mb-2 flex items-center justify-center">
          <Select
            value={condition.logicalOperator || 'AND'}
            onChange={(e) => handleLogicalOperatorChange(e.target.value as LogicalOperator)}
            options={logicalOperatorOptions}
            className="w-24"
          />
        </div>
      )}
      
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start gap-3">
          <div className="flex-1 space-y-3">
            {/* Field Info Banner */}
            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950">
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
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="text-xs text-blue-600 dark:text-blue-400">Examples:</span>
                      {fieldInfo.examples.slice(0, 3).map((example, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Tooltip content={fieldInfo.tooltip}>
                  <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </Tooltip>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="mb-1 flex items-center gap-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Field
                  </label>
                  <Tooltip content="Select the field to check. This determines what property of the user or entity you're evaluating.">
                    <HelpCircle className="h-3 w-3 text-gray-500" />
                  </Tooltip>
                </div>
                <Select
                  value={condition.field}
                  onChange={(e) => handleFieldChange(e.target.value as ConditionField)}
                  options={fieldOptions.map((f) => ({ value: f.value, label: `${f.category}: ${f.label}` }))}
                />
              </div>
              
              <div>
                <div className="mb-1 flex items-center gap-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Operator
                  </label>
                  <Tooltip content="Choose how to compare the field value. 'Equals' for exact matches, 'Contains' for partial matches, 'Greater Than' for numbers, etc.">
                    <HelpCircle className="h-3 w-3 text-gray-500" />
                  </Tooltip>
                </div>
                <Select
                  value={condition.operator}
                  onChange={(e) => handleOperatorChange(e.target.value as ConditionOperator)}
                  options={operatorOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                />
                {operatorOptions.find(opt => opt.value === condition.operator)?.tooltip && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {operatorOptions.find(opt => opt.value === condition.operator)?.tooltip}
                  </p>
                )}
              </div>
              
              {needsValue && (
                <div>
                  <div className="mb-1 flex items-center gap-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Value
                    </label>
                    <Tooltip content={`Enter the value to compare against. For ${fieldInfo.valueType} fields, use ${fieldInfo.examples.join(' or ')}`}>
                      <HelpCircle className="h-3 w-3 text-gray-500" />
                    </Tooltip>
                  </div>
                  {getValueInput()}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {onAddCondition && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddCondition}
                className="h-8 w-8 p-0"
                title="Add condition"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Remove condition"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

