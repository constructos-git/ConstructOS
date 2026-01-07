// Question Block Component

import { AnswerCardGrid } from './AnswerCardGrid';
import Tooltip from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import type { Question } from '../../domain/types';

interface QuestionBlockProps {
  question: Question;
  value?: string | number | boolean | (string | number | boolean)[];
  onChange: (value: string | number | boolean | (string | number | boolean)[]) => void;
  isVisible: boolean;
}

export function QuestionBlock({ question, value, onChange, isVisible }: QuestionBlockProps) {
  if (!isVisible) return null;

  const handleMultiSelect = (optionValue: string | number | boolean) => {
    const currentValues = Array.isArray(value) ? value : [];
    const isSelected = currentValues.includes(optionValue);
    
    if (isSelected) {
      onChange(currentValues.filter((v) => v !== optionValue));
    } else {
      onChange([...currentValues, optionValue]);
    }
  };

  return (
    <div className="space-y-4">
      {question.helpText && (
        <div className="flex items-start gap-2 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{question.helpText}</p>
          <Tooltip content={question.helpText} position="right">
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0 mt-0.5" />
          </Tooltip>
        </div>
      )}

      {question.type === 'cardGrid' && question.options && (
        <AnswerCardGrid
          options={question.options}
          selectedValue={value}
          onSelect={onChange}
        />
      )}

      {question.type === 'multiSelect' && question.options && (
        <AnswerCardGrid
          options={question.options}
          selectedValue={value}
          onSelect={(val) => handleMultiSelect(val as string | number | boolean)}
          multiSelect={true}
        />
      )}

      {question.type === 'select' && question.options && (
        <select
          value={String(value || '')}
          onChange={(e) => {
            const option = question.options?.find((opt) => String(opt.value) === e.target.value);
            if (option) onChange(option.value);
          }}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">Select an option...</option>
          {question.options.map((option) => (
            <option key={option.id} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

