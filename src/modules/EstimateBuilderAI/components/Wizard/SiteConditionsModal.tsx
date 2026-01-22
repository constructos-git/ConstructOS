// Site Conditions and Access Modal Component

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import Badge from '@/components/ui/Badge';
import { HelpCircle } from 'lucide-react';

export interface SiteConditionsProperties {
  siteAccess?: string;
  siteConstraints?: string;
  existingServices?: string;
  groundConditions?: string;
  notes?: string;
}

interface SiteConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: SiteConditionsProperties;
  onSave: (properties: SiteConditionsProperties) => void;
}

// Predefined options for smart inputs
const SITE_ACCESS_OPTIONS = [
  'Easy access via main road',
  'Restricted access - narrow lane',
  'No vehicle access',
  'Pedestrian access only',
  'Access via shared driveway',
  'Gated access',
  'Time-restricted access',
  'Requires permit',
  'Steep incline/driveway',
  'Limited parking on site',
];

const SITE_CONSTRAINTS_OPTIONS = [
  'Overhead power lines',
  'Underground services',
  'Tree preservation orders',
  'Protected species',
  'Flood risk area',
  'Sloping site',
  'Limited space',
  'Adjacent buildings',
  'Boundary restrictions',
  'Planning restrictions',
  'Conservation area',
  'Listed building nearby',
];

const EXISTING_SERVICES_OPTIONS = [
  'Mains water connected',
  'Mains gas available',
  'Mains electricity connected',
  'Drainage to mains',
  'Septic tank present',
  'Private water supply',
  'No mains services',
  'Services need upgrading',
  'Services need relocating',
  'Shared services',
];

const GROUND_CONDITIONS_OPTIONS = [
  'Clay soil',
  'Sandy soil',
  'Chalk subsoil',
  'Rocky ground',
  'Made ground/fill',
  'High water table',
  'Poor drainage',
  'Contaminated land',
  'Ground investigation required',
  'Stable ground conditions',
];

// Smart Input Component with predefined options
interface SmartTextInputProps {
  id: string;
  label: string;
  tooltip: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
}

function SmartTextInput({
  id,
  label,
  tooltip,
  value,
  onChange,
  placeholder,
  options,
}: SmartTextInputProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [customText, setCustomText] = useState('');
  const isInternalUpdateRef = useRef(false);
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (value !== previousValueRef.current && !isInternalUpdateRef.current) {
      if (value) {
        const found = new Set<string>();
        for (const option of options) {
          if (value.includes(option)) {
            found.add(option);
          }
        }
        const optionSet = new Set(options);
        const valueParts = value.split(/[,\n]/).map(p => p.trim()).filter(Boolean);
        const customParts = valueParts.filter(part => !optionSet.has(part));
        
        setSelectedOptions(found);
        setCustomText(customParts.join(', '));
      } else {
        setSelectedOptions(new Set());
        setCustomText('');
      }
      previousValueRef.current = value;
    }
    isInternalUpdateRef.current = false;
  }, [value, options]);

  useEffect(() => {
    const parts: string[] = [];
    selectedOptions.forEach(option => {
      parts.push(option);
    });
    if (customText.trim()) {
      parts.push(customText.trim());
    }
    const newValue = parts.join(', ');
    if (newValue !== value) {
      isInternalUpdateRef.current = true;
      previousValueRef.current = newValue;
      onChange(newValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptions, customText]);

  const toggleOption = (option: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(option)) {
      newSelected.delete(option);
    } else {
      newSelected.add(option);
    }
    setSelectedOptions(newSelected);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <Tooltip content={tooltip}>
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
        </Tooltip>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {options.map((option) => {
          const isSelected = selectedOptions.has(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className="focus:outline-none"
            >
              <Badge
                variant={isSelected ? 'primary' : 'outline'}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-primary-500'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {option}
              </Badge>
            </button>
          );
        })}
      </div>

      <textarea
        id={id}
        value={customText}
        onChange={(e) => setCustomText(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[80px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      />
    </div>
  );
}

export function SiteConditionsModal({
  isOpen,
  onClose,
  properties,
  onSave,
}: SiteConditionsModalProps) {
  const [localProperties, setLocalProperties] = useState<SiteConditionsProperties>(properties);

  useEffect(() => {
    setLocalProperties(properties);
  }, [properties]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localProperties);
    onClose();
  };

  const handleCancel = () => {
    setLocalProperties(properties);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pt-16 pb-4 px-4">
      <Card className="w-full max-w-3xl max-h-[85vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl">Site Conditions and Access</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Site Access */}
          <SmartTextInput
            id="siteAccess"
            label="Site Access"
            tooltip="Details about site access, restrictions, or special requirements"
            value={localProperties.siteAccess || ''}
            onChange={(value) =>
              setLocalProperties({ ...localProperties, siteAccess: value })
            }
            placeholder="Add any additional site access details..."
            options={SITE_ACCESS_OPTIONS}
          />

          {/* Site Constraints */}
          <SmartTextInput
            id="siteConstraints"
            label="Site Constraints"
            tooltip="Any physical constraints, obstacles, or limitations on site"
            value={localProperties.siteConstraints || ''}
            onChange={(value) =>
              setLocalProperties({ ...localProperties, siteConstraints: value })
            }
            placeholder="Add any additional site constraints..."
            options={SITE_CONSTRAINTS_OPTIONS}
          />

          {/* Existing Services */}
          <SmartTextInput
            id="existingServices"
            label="Existing Services"
            tooltip="Details about existing services (water, gas, electricity, drainage) that may affect the build"
            value={localProperties.existingServices || ''}
            onChange={(value) =>
              setLocalProperties({ ...localProperties, existingServices: value })
            }
            placeholder="Add any additional service details..."
            options={EXISTING_SERVICES_OPTIONS}
          />

          {/* Ground Conditions */}
          <SmartTextInput
            id="groundConditions"
            label="Ground Conditions"
            tooltip="Information about ground conditions, soil type, water table, or any ground investigation results"
            value={localProperties.groundConditions || ''}
            onChange={(value) =>
              setLocalProperties({ ...localProperties, groundConditions: value })
            }
            placeholder="Add any additional ground condition details..."
            options={GROUND_CONDITIONS_OPTIONS}
          />

          {/* Notes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="notes" className="text-sm font-medium">Additional Notes</label>
              <Tooltip content="Any additional notes about site conditions and access">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </Tooltip>
            </div>
            <textarea
              id="notes"
              value={localProperties.notes || ''}
              onChange={(e) => setLocalProperties({ ...localProperties, notes: e.target.value })}
              placeholder="Any additional notes or information"
              className="w-full min-h-[80px] rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Properties
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
