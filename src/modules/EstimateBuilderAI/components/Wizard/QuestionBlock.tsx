// Question Block Component

import { AnswerCardGrid } from './AnswerCardGrid';
import Input from '@/components/ui/Input';
import Tooltip from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import type { Question } from '../../domain/types';

interface QuestionBlockProps {
  question: Question;
  value?: string | number | boolean | (string | number | boolean)[];
  onChange: (value: string | number | boolean | (string | number | boolean)[]) => void;
  isVisible: boolean;
  onLocationPropertiesClick?: () => void;
}

export function QuestionBlock({ question, value, onChange, isVisible, onLocationPropertiesClick }: QuestionBlockProps) {
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
      {question.helpText && question.type !== 'number' && question.type !== 'text' && (
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
          isLocationQuestion={question.id === 'location'}
          onLocationPropertiesClick={onLocationPropertiesClick}
          isPropertyTypeQuestion={question.id === 'propertyType'}
          isSiteConditionsQuestion={question.id === 'siteConditions' || question.id === 'site-conditions'}
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
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Select an option...</option>
          {question.options.map((option) => (
            <option key={option.id} value={String(option.value)} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              {option.label}
            </option>
          ))}
        </select>
      )}

      {question.type === 'number' && (
        <div>
          <div className="flex items-center gap-1 mb-1">
            <label className="text-sm font-medium">{question.title}</label>
            {question.helpText && (
              <Tooltip content={question.helpText}>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            )}
          </div>
          <Input
            type="number"
            step="0.1"
            min="0"
            value={value !== undefined && value !== null ? String(value) : ''}
            onChange={(e) => {
              const numValue = parseFloat(e.target.value);
              onChange(isNaN(numValue) ? 0 : numValue);
            }}
            placeholder="0.0"
          />
        </div>
      )}

      {question.type === 'text' && (
        <div>
          <div className="flex items-center gap-1 mb-1">
            <label className="text-sm font-medium">{question.title}</label>
            {question.helpText && (
              <Tooltip content={question.helpText}>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            )}
          </div>
          <Input
            type="text"
            value={value !== undefined && value !== null ? String(value) : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter details..."
          />
        </div>
      )}
    </div>
  );
}

