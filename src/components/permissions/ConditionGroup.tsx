import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Layers } from 'lucide-react';
import Button from '@/components/ui/Button';
import ConditionBlock from './ConditionBlock';
import type { RuleCondition, LogicalOperator } from '@/types/permissionRules';

interface ConditionGroupProps {
  groupId: string;
  conditions: RuleCondition[];
  groupLogic: LogicalOperator;
  level: number;
  onUpdateCondition: (id: string, condition: RuleCondition) => void;
  onDeleteCondition: (id: string) => void;
  onAddCondition: (groupId: string) => void;
  onUpdateGroupLogic: (groupId: string, logic: LogicalOperator) => void;
  onAddNestedGroup: (parentGroupId: string) => void;
}

const levelColors = [
  'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950',
  'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-950',
  'border-teal-300 bg-teal-50 dark:border-teal-700 dark:bg-teal-950',
];

export default function ConditionGroup({
  groupId,
  conditions,
  groupLogic,
  level,
  onUpdateCondition,
  onDeleteCondition,
  onAddCondition,
  onUpdateGroupLogic,
  onAddNestedGroup,
}: ConditionGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const groupConditions = conditions.filter((c) => c.conditionGroupId === groupId);
  const nestedGroupIds = Array.from(
    new Set(
      conditions
        .filter((c) => c.conditionGroupId && c.conditionGroupId !== groupId && groupConditions.some((gc) => gc.id === c.conditionGroupId))
        .map((c) => c.conditionGroupId)
        .filter(Boolean) as string[]
    )
  );

  const colorClass = levelColors[level % levelColors.length] || levelColors[0];

  return (
    <div className={`rounded-lg border-2 ${colorClass} p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm font-semibold"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <Layers className="h-4 w-4" />
            <span>Group {level > 0 ? `(Level ${level + 1})` : ''}</span>
          </button>
          <select
            value={groupLogic}
            onChange={(e) => onUpdateGroupLogic(groupId, e.target.value as LogicalOperator)}
            className="rounded border bg-white px-2 py-1 text-xs font-medium dark:bg-gray-800"
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
        </div>
        <div className="flex gap-2">
          {level < 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddNestedGroup(groupId)}
              className="h-7 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Nested Group
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {groupConditions
            .filter((c) => !nestedGroupIds.includes(c.id))
            .map((condition, index) => {
              // Check if this condition ID is a nested group
              const isNestedGroup = nestedGroupIds.includes(condition.id);
              
              if (isNestedGroup) {
                return (
                  <ConditionGroup
                    key={condition.id}
                    groupId={condition.id}
                    conditions={conditions}
                    groupLogic={condition.groupLogic || 'AND'}
                    level={level + 1}
                    onUpdateCondition={onUpdateCondition}
                    onDeleteCondition={onDeleteCondition}
                    onAddCondition={onAddCondition}
                    onUpdateGroupLogic={onUpdateGroupLogic}
                    onAddNestedGroup={onAddNestedGroup}
                  />
                );
              }

              return (
                <ConditionBlock
                  key={condition.id}
                  condition={condition}
                  index={index}
                  onUpdate={(updated) => onUpdateCondition(condition.id, updated)}
                  onDelete={() => onDeleteCondition(condition.id)}
                  onAddCondition={() => onAddCondition(groupId)}
                  showLogicalOperator={index > 0}
                />
              );
            })}

          {groupConditions.length === 0 && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No conditions in this group. Click "Add Condition" to get started.
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddCondition(groupId)}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Condition
          </Button>
        </div>
      )}
    </div>
  );
}

