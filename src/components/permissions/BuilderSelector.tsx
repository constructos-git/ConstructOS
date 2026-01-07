import { Code2, Workflow, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { RuleType } from '@/types/permissionRules';

interface BuilderSelectorProps {
  onSelect: (type: RuleType | 'wizard') => void;
  onCancel: () => void;
}

export default function BuilderSelector({ onSelect, onCancel }: BuilderSelectorProps) {
  const builders = [
    {
      type: 'simple' as const,
      title: 'Simple Builder',
      description: 'Create rules with IF/THEN logic using a visual interface',
      icon: Code2,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    },
    {
      type: 'workflow' as const,
      title: 'Workflow Builder',
      description: 'Build complex multi-step workflows with conditions and actions',
      icon: Workflow,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    },
    {
      type: 'wizard' as const,
      title: 'Workflow Wizard',
      description: 'Step-by-step guided creation of permission rules',
      icon: Sparkles,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Choose a builder type to create your permission rule:
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {builders.map((builder) => {
          const Icon = builder.icon;
          return (
            <Card
              key={builder.type}
              className={`cursor-pointer transition-all ${builder.color}`}
              onClick={() => onSelect(builder.type)}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{builder.title}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">{builder.description}</p>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(builder.type);
                  }}
                >
                  Select
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

