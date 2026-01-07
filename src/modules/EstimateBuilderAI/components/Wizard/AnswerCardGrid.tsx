// Answer Card Grid Component

import {
  Home,
  Building2,
  Layers,
  Wrench,
  FileQuestion,
  Car,
} from 'lucide-react';
import type { QuestionOption } from '../../domain/types';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Building2,
  Layers,
  Wrench,
  FileQuestion,
  Car,
};

interface AnswerCardGridProps {
  options: QuestionOption[];
  selectedValue?: string | number | boolean | (string | number | boolean)[];
  onSelect: (value: string | number | boolean | (string | number | boolean)[]) => void;
  multiSelect?: boolean;
}

export function AnswerCardGrid({ options, selectedValue, onSelect, multiSelect = false }: AnswerCardGridProps) {
  const isSelected = (optionValue: string | number | boolean): boolean => {
    if (multiSelect && Array.isArray(selectedValue)) {
      return selectedValue.includes(optionValue);
    }
    if (!multiSelect) {
      return selectedValue === optionValue || 
        (typeof selectedValue === 'boolean' && typeof optionValue === 'boolean' && selectedValue === optionValue);
    }
    return false;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {options.map((option) => {
        const Icon = option.icon ? (iconMap[option.icon] || null) : null;
        const selected = isSelected(option.value);

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.value)}
            className={cn(
              'p-6 rounded-lg border-2 transition-all text-center',
              'hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10',
              selected
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800'
            )}
          >
            {Icon && (
              <div className="mb-3 flex justify-center">
                <Icon className={cn(
                  'h-16 w-16',
                  selected ? 'text-primary-600' : 'text-gray-400'
                )} />
              </div>
            )}
            <div className={cn(
              'font-medium text-base mb-1 text-center',
              selected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100'
            )}>
              {option.label}
            </div>
            {option.description && (
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">{option.description}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

