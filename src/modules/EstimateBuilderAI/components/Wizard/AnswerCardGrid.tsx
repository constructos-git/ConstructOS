// Answer Card Grid Component

import { useState } from 'react';
import {
  Home,
  Building2,
  Layers,
  Wrench,
  FileQuestion,
  Car,
  Settings,
} from 'lucide-react';
import type { QuestionOption } from '../../domain/types';
import { cn } from '@/lib/utils';
import { ItemConfigurationModal } from './ItemConfigurationModal';

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
  showSettings?: boolean;
  isLocationQuestion?: boolean;
  onLocationPropertiesClick?: () => void;
  isPropertyTypeQuestion?: boolean;
  isSiteConditionsQuestion?: boolean;
}

export function AnswerCardGrid({ 
  options, 
  selectedValue, 
  onSelect, 
  multiSelect = false, 
  showSettings = true,
  isLocationQuestion = false,
  onLocationPropertiesClick,
  isPropertyTypeQuestion = false,
  isSiteConditionsQuestion = false,
}: AnswerCardGridProps) {
  const [configuringOption, setConfiguringOption] = useState<QuestionOption | null>(null);

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
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {options.map((option) => {
          const Icon = option.icon ? (iconMap[option.icon] || null) : null;
          const selected = isSelected(option.value);

          return (
            <div
              key={option.id}
              className={cn(
                'relative p-6 rounded-lg border-2 transition-all text-center',
                'hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10',
                selected
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800'
              )}
            >
              {/* Settings Cog Button - Top Right */}
              {showSettings && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    // If it's a location question, open location properties modal
                    if (isLocationQuestion && onLocationPropertiesClick) {
                      onLocationPropertiesClick();
                    } else if (isPropertyTypeQuestion && onLocationPropertiesClick) {
                      // Property type also uses the same handler pattern
                      onLocationPropertiesClick();
                    } else if (isSiteConditionsQuestion && onLocationPropertiesClick) {
                      // Site conditions also uses the same handler pattern
                      onLocationPropertiesClick();
                    } else {
                      // Otherwise, open item configuration modal
                      setConfiguringOption(option);
                    }
                  }}
                  className={cn(
                    'absolute top-2 right-2 p-1.5 rounded-md transition-colors',
                    'hover:bg-gray-200 dark:hover:bg-gray-700',
                    'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                  title={
                    isLocationQuestion 
                      ? "Extension Location Properties" 
                      : isPropertyTypeQuestion 
                      ? "Property Type Properties" 
                      : isSiteConditionsQuestion
                      ? "Site Conditions and Access"
                      : "Configure"
                  }
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}

              {/* Card Content */}
              <button
                type="button"
                onClick={() => onSelect(option.value)}
                className="w-full h-full"
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
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {configuringOption && (
        <ItemConfigurationModal
          option={configuringOption}
          isOpen={!!configuringOption}
          onClose={() => setConfiguringOption(null)}
        />
      )}
    </>
  );
}

